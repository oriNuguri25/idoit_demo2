import ChallengeCard from "@/components/ChallengeCard";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Challenges = () => {
  const [popularChallenges, setPopularChallenges] = useState([]);
  const [todaysChallenge, setTodaysChallenge] = useState(null);
  const [fallenChallenges, setFallenChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 인기 챌린지 조회
        const popularRes = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/popular-challenges`
        );
        const popularData = await popularRes.json();

        // 오늘의 챌린지 조회
        const todayRes = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/todays-challenge`
        );
        const todayData = await todayRes.json();

        // 실패한 챌린지 조회
        const fallenRes = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/fallen-challenges`
        );
        const fallenData = await fallenRes.json();

        setPopularChallenges(popularData || []);
        setTodaysChallenge(todayData || null);
        setFallenChallenges(fallenData || []);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <>
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
            Popular Idiot Challenges
          </h2>
          <Link
            to="/challenges"
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            See more <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            <div className="relative h-48">
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
              <h3 className="text-lg font-bold mb-2">
                {todaysChallenge.title}
              </h3>
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Heart size={16} className="text-purple-500" />
                  <span>{todaysChallenge.likes || 0} Cheers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} className="text-blue-400" />
                  <span>1 Idiot</span>
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
        </section>
      )}

      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
            Fallen Idiot Challenges
          </h2>
          <Link
            to="/challenge/fallen"
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            See more <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
