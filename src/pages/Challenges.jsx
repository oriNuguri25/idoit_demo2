import ChallengeCard from "@/components/ChallengeCard";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Trophy } from "lucide-react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { createClient } from "@supabase/supabase-js";

const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5분 캐시 만료

const Challenges = () => {
  const [popularChallenges, setPopularChallenges] = useState([]);
  const [todaysChallenge, setTodaysChallenge] = useState(null);
  const [fallenChallenges, setFallenChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testApiResponse, setTestApiResponse] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState({
    popular: 0,
    today: 0,
    fallen: 0,
  });

  // Supabase 관련 ref 추가
  const supabaseRef = useRef(null);
  const challengesSubscriptionRef = useRef(null);

  // API URL 설정
  const apiUrl = import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://idoitproto.vercel.app";

  // Supabase 클라이언트 초기화 및 실시간 구독 설정
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
      console.log("Supabase client initialized for challenges");

      // 실시간 구독 설정
      setupChallengesSubscription();
    } else {
      console.warn(
        "Supabase credentials not found, real-time updates disabled"
      );
    }

    return () => {
      // 구독 정리
      if (challengesSubscriptionRef.current) {
        challengesSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // 챌린지 테이블 변경사항 구독 함수
  const setupChallengesSubscription = () => {
    if (!supabaseRef.current) return;

    // 이전 구독 해제
    if (challengesSubscriptionRef.current) {
      challengesSubscriptionRef.current.unsubscribe();
    }

    // 새 구독 설정
    challengesSubscriptionRef.current = supabaseRef.current
      .channel("challenges-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE 모두 감지
          schema: "public",
          table: "challenges",
        },
        (payload) => {
          console.log("Real-time challenge update:", payload);

          // 변경 이벤트 유형에 따라 다른 처리
          if (payload.eventType === "INSERT") {
            toast.info("새로운 도전이 추가되었습니다!");
            refreshAllData();
          } else if (payload.eventType === "UPDATE") {
            toast.info("도전 정보가 업데이트되었습니다!");
            refreshAllData();
          } else if (payload.eventType === "DELETE") {
            toast.info("도전이 삭제되었습니다!");
            refreshAllData();
          }
        }
      )
      .subscribe((status) => {
        console.log("Challenges subscription status:", status);
      });
  };

  // 향상된 fetch 함수
  const fetchWithErrorHandling = async (url, label) => {
    try {
      console.log(`Fetching ${label} from: ${url}`);
      const response = await fetch(url);

      // 응답 상태 로깅
      console.log(`${label} response status:`, response.status);

      // 성공이 아닌 경우 자세한 정보 로깅
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`${label} error response:`, responseText);
        throw new Error(
          `${response.status} ${response.statusText}: ${responseText.substring(
            0,
            100
          )}...`
        );
      }

      // 응답을 텍스트로 받아서 유효한 JSON인지 확인
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error(
          `Invalid JSON in ${label} response:`,
          text.substring(0, 100)
        );
        throw new Error(`Invalid JSON response for ${label}`);
      }
    } catch (error) {
      console.error(`Failed to fetch ${label}:`, error);
      toast.error(`${label} loading failed: ${error.message}`);
      return null;
    }
  };

  // 캐시에서 데이터 가져오기
  const getFromCache = (key) => {
    const cached = localStorage.getItem(`idoit_${key}`);
    if (!cached) return null;

    try {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // 캐시 만료 확인
      if (now - timestamp > CACHE_EXPIRY_TIME) {
        localStorage.removeItem(`idoit_${key}`);
        return null;
      }

      return data;
    } catch (e) {
      localStorage.removeItem(`idoit_${key}`);
      return null;
    }
  };

  // 캐시에 데이터 저장
  const saveToCache = (key, data) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`idoit_${key}`, JSON.stringify(cacheData));
  };

  // 인기 챌린지 불러오기
  const fetchPopularChallenges = useCallback(
    async (force = false) => {
      // 캐시에서 확인
      if (!force) {
        const cached = getFromCache("popular_challenges");
        if (cached) {
          console.log("Using cached popular challenges");
          setPopularChallenges(cached);
          return cached;
        }
      }

      const data = await fetchWithErrorHandling(
        `${apiUrl}/api/challenges?type=popular`,
        "Popular challenges"
      );

      if (data) {
        setPopularChallenges(data);
        saveToCache("popular_challenges", data);
        setLastFetchTime((prev) => ({ ...prev, popular: Date.now() }));
      }

      return data;
    },
    [apiUrl]
  );

  // 오늘의 챌린지 불러오기
  const fetchTodaysChallenge = useCallback(
    async (force = false) => {
      // 캐시에서 확인
      if (!force) {
        const cached = getFromCache("todays_challenge");
        if (cached) {
          console.log("Using cached today's challenge");
          setTodaysChallenge(cached);
          return cached;
        }
      }

      const data = await fetchWithErrorHandling(
        `${apiUrl}/api/challenges?type=today`,
        "Today's challenge"
      );

      if (data) {
        setTodaysChallenge(data);
        saveToCache("todays_challenge", data);
        setLastFetchTime((prev) => ({ ...prev, today: Date.now() }));
      }

      return data;
    },
    [apiUrl]
  );

  // 실패한 챌린지 불러오기
  const fetchFallenChallenges = useCallback(
    async (force = false) => {
      // 캐시에서 확인
      if (!force) {
        const cached = getFromCache("fallen_challenges");
        if (cached) {
          console.log("Using cached fallen challenges");
          setFallenChallenges(cached);
          return cached;
        }
      }

      const data = await fetchWithErrorHandling(
        `${apiUrl}/api/challenges?type=fallen`,
        "Fallen challenges"
      );

      if (data) {
        setFallenChallenges(data);
        saveToCache("fallen_challenges", data);
        setLastFetchTime((prev) => ({ ...prev, fallen: Date.now() }));
      }

      return data;
    },
    [apiUrl]
  );

  // 모든 데이터 새로고침
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchPopularChallenges(true),
        fetchTodaysChallenge(true),
        fetchFallenChallenges(true),
      ]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setError(error.message);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  }, [fetchPopularChallenges, fetchTodaysChallenge, fetchFallenChallenges]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await Promise.all([
          fetchPopularChallenges(),
          fetchTodaysChallenge(),
          fetchFallenChallenges(),
        ]);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
        setError(error.message);
        toast.error("An error occurred while loading data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // 실시간 업데이트가 있으므로 주기적인 폴링 간격을 늘림 (30분)
    const intervalId = setInterval(() => {
      console.log("Background data refresh");
      fetchPopularChallenges(true);
      fetchTodaysChallenge(true);
      fetchFallenChallenges(true);
    }, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [
    apiUrl,
    fetchPopularChallenges,
    fetchTodaysChallenge,
    fetchFallenChallenges,
  ]);

  // 이미지 URL 배열에서 첫 번째 이미지 추출
  const getFirstImage = (imagesJson) => {
    try {
      if (!imagesJson) return "/placeholder.svg";
      const images = JSON.parse(imagesJson);
      return images[0] || "/placeholder.svg";
    } catch (e) {
      return "/placeholder.svg";
    }
  };

  // 오류 표시
  if (error) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Data Loading Error
        </h2>
        <p className="text-gray-600">{error}</p>
        {testApiResponse && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md text-left">
            <h3 className="font-medium mb-2">Test API Response:</h3>
            <pre className="text-xs overflow-auto max-h-48">
              {JSON.stringify(testApiResponse, null, 2)}
            </pre>
          </div>
        )}
        <button
          onClick={refreshAllData}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
            Popular Idiot Challenges
          </h2>
          <Link
            to="/all-challenges"
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            See more <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {isLoading ? (
            <p>Loading popular challenges...</p>
          ) : popularChallenges.length > 0 ? (
            popularChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          ) : (
            <p>No popular challenges found</p>
          )}
        </div>
      </section>

      {todaysChallenge && (
        <section className="mb-16 bg-yellow-50 p-4 sm:p-6 rounded-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-600 mb-4">
            Today's Idiot Challenge
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="relative aspect-square">
                <img
                  src={getFirstImage(todaysChallenge.images)}
                  alt={todaysChallenge.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-yellow-500">
                  {todaysChallenge.status}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold mb-1 line-clamp-2">
                  {todaysChallenge.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {todaysChallenge.name}
                </p>
                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Heart size={16} className="text-purple-400" />
                    <span>{todaysChallenge.likes || 0} Idiots</span>
                  </div>
                </div>
                <Link
                  to={`/challenge/detail/${todaysChallenge.id}`}
                  className="block text-center bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-2 rounded-lg font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>

            <div className="flex flex-col pt-4 md:pt-6">
              <div className="flex items-center mb-4">
                <Trophy className="text-yellow-500 mr-3" size={28} />
                <h3 className="text-lg font-bold text-yellow-700">
                  Why We Selected This Idiot Challenge
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                This challenge stands out for its combination of physical
                endurance and mental discipline. Waking up at 5 AM consistently
                requires breaking deeply ingrained sleep habits, while swimming
                in the ocean adds an element of courage and connection with
                nature.
              </p>
              <p className="text-gray-700">
                The challenger has shown remarkable dedication, documenting each
                day with authentic photos and honest reflections about the
                struggles and small victories. Their journey reminds us that the
                most meaningful growth often comes from the most uncomfortable
                challenges.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
            Fallen Idiot Challenges
          </h2>
          <Link
            to="/all-challenges"
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            See more <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {isLoading ? (
            <p>Loading fallen challenges...</p>
          ) : fallenChallenges.length > 0 ? (
            fallenChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))
          ) : (
            <p>No fallen challenges found</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Challenges;
