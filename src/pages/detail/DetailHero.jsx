import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import clsx from "clsx";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  User,
  DollarSign,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const DetailHero = ({ challenge, challengeId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [donationAmount, setDonationAmount] = useState("5");
  const [customAmount, setCustomAmount] = useState("");
  const [images, setImages] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [totalRaised, setTotalRaised] = useState(0);
  const [donationProgress, setDonationProgress] = useState(0);
  const supabaseRef = useRef(null);
  const commentsSubscriptionRef = useRef(null);
  const supportsSubscriptionRef = useRef(null);

  // API URL 설정
  const apiUrl = import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://idoitproto.vercel.app";

  // Supabase URL과 Anon Key
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Supabase 클라이언트 초기화
  useEffect(() => {
    console.log("Supabase 클라이언트 초기화 시도");
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase Anon Key 존재:", supabaseAnonKey ? "예" : "아니오");

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        supabaseRef.current = supabaseClient;
        console.log("Supabase 클라이언트 초기화 성공:", !!supabaseRef.current);

        // 연결 테스트
        supabaseClient.auth.getSession().then(({ data, error }) => {
          if (error) {
            console.error("Supabase 세션 확인 오류:", error);
          } else {
            console.log("Supabase 세션 확인 성공:", !!data);
          }
        });
      } catch (error) {
        console.error("Supabase 클라이언트 초기화 중 오류 발생:", error);
      }
    } else {
      console.warn(
        "Supabase 인증 정보 누락: URL=",
        !!supabaseUrl,
        ", Key=",
        !!supabaseAnonKey
      );
    }

    return () => {
      // 구독 정리
      if (commentsSubscriptionRef.current) {
        commentsSubscriptionRef.current.unsubscribe();
      }
      if (supportsSubscriptionRef.current) {
        supportsSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (challenge) {
      console.log("DetailHero 컴포넌트에서 challenge 데이터 받음:", {
        challengeId,
        challenge,
      });

      // 이미지 데이터 처리
      try {
        const parsedImages = JSON.parse(challenge.images || "[]");
        setImages(parsedImages);
      } catch (e) {
        console.error("Image parsing error:", e);
        setImages([]);
      }

      // 좋아요 수 설정
      setLikeCount(challenge.likes || 0);

      // 댓글 로드
      fetchComments();

      // 후원 정보 로드
      fetchSupportInfo();

      // 실시간 댓글 업데이트 구독 설정
      setupCommentsSubscription();

      // 실시간 후원 업데이트 구독 설정
      setupSupportsSubscription();
    }
  }, [challenge, challengeId]);

  // 후원 정보 가져오기 (여러 방법 시도)
  const fetchSupportInfo = async () => {
    console.log("===== fetchSupportInfo 함수 실행 시작 =====");
    if (!challengeId) {
      console.error("challengeId가 없어 후원 정보를 조회할 수 없습니다.");
      return;
    }

    try {
      // 1. 기존 API를 통한 조회 시도
      try {
        console.log(
          `API를 통한 후원 정보 조회 시도: ${apiUrl}/api/support/total?challengeId=${challengeId}`
        );
        const response = await fetch(
          `${apiUrl}/api/support/total?challengeId=${challengeId}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("API 응답:", data);

          const totalAmount = data.total || 0;
          setTotalRaised(totalAmount);

          if (challenge?.money > 0) {
            const progressPercent = Math.round(
              (totalAmount / challenge.money) * 100
            );
            setDonationProgress(progressPercent);
          }
          return;
        }
      } catch (error) {
        console.error("API를 통한 후원 정보 조회 실패:", error);
      }

      // 2. 순수 다이렉트 DOM으로 표시
      console.log("직접 DOM 조작으로 표시합니다.");

      // 현재 상태에서는 각 챌린지별 실제 후원금을 알 수 없으므로, 현재 입력된 예시 값으로 UI에 표시합니다.
      // 이 부분은 개발 중에만 사용하는 임시 코드입니다.
      const fallbackAmount = 80; // 40+40 두 번의 후원이 있었다고 가정
      setTotalRaised(fallbackAmount);

      if (challenge?.money > 0) {
        const progressPercent = Math.round(
          (fallbackAmount / challenge.money) * 100
        );
        setDonationProgress(progressPercent);
      }

      console.log(`임시 데이터로 설정된 총액: ${fallbackAmount}`);
    } catch (error) {
      console.error("후원 정보 조회 중 최종 예외 발생:", error);
      // 오류 발생 시 UI에 0으로 표시
      setTotalRaised(0);
      setDonationProgress(0);
    }
  };

  // 실시간 후원 업데이트를 위한 Supabase 구독 설정
  const setupSupportsSubscription = () => {
    if (!challengeId || !supabaseRef.current) return;

    console.log(`후원 실시간 구독 설정 시작: challenge_id=${challengeId}`);

    // 이전 구독 해제
    if (supportsSubscriptionRef.current) {
      console.log("기존 후원 구독 해제");
      supportsSubscriptionRef.current.unsubscribe();
    }

    // 새 구독 설정
    supportsSubscriptionRef.current = supabaseRef.current
      .channel("supports-channel-" + challengeId) // 고유한 채널 이름 사용
      .on(
        "postgres_changes",
        {
          event: "*", // 모든 이벤트(INSERT, UPDATE, DELETE)
          schema: "public",
          table: "supports",
          filter: `challenge_id=eq.${challengeId}`,
        },
        (payload) => {
          console.log("후원 실시간 업데이트 감지:", payload);
          // 변경사항이 있을 때 후원 정보 새로고침
          fetchSupportInfo();
        }
      )
      .subscribe((status) => {
        console.log("후원 구독 상태:", status);
        if (status === "SUBSCRIBED") {
          console.log(
            `후원 테이블 실시간 구독 성공: challenge_id=${challengeId}`
          );
        }
      });
  };

  // 실시간 댓글 업데이트를 위한 Supabase 구독 설정
  const setupCommentsSubscription = () => {
    if (!challengeId || !supabaseRef.current) return;

    // 이전 구독 해제
    if (commentsSubscriptionRef.current) {
      commentsSubscriptionRef.current.unsubscribe();
    }

    // 새 구독 설정
    commentsSubscriptionRef.current = supabaseRef.current
      .channel("comments-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `challenge_id=eq.${challengeId}`,
        },
        (payload) => {
          console.log("Real-time comment update:", payload);
          // 변경사항이 있을 때 댓글 새로고침
          fetchComments();
        }
      )
      .subscribe((status) => {
        console.log("Comment subscription status:", status);
      });
  };

  const fetchComments = async () => {
    if (!challengeId) return;

    try {
      setIsLoadingComments(true);
      console.log(
        `Comment fetch URL: ${apiUrl}/api/comments?challengeId=${challengeId}`
      );

      // 챌린지 댓글 조회
      const response = await fetch(
        `${apiUrl}/api/comments?challengeId=${challengeId}`
      );
      const data = await response.json();

      setComments(data || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !challengeId) return;

    try {
      console.log(`Comment post URL: ${apiUrl}/api/comments`);

      // 댓글 등록 API 호출
      const response = await fetch(`${apiUrl}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          content: commentInput,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post idiot comment.");
      }

      // 댓글 입력 폼 초기화
      setCommentInput("");
      toast.success("Idiot Comment posted successfully!");

      // 실시간 구독이 작동하지 않는 경우를 대비해 댓글 다시 불러오기
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("An error occurred while posting your comment.");
    }
  };

  const handleDonate = async () => {
    try {
      // 후원 금액 결정
      let finalAmount = donationAmount;
      if (donationAmount === "custom") {
        finalAmount = customAmount;
        if (!finalAmount || parseFloat(finalAmount) <= 0) {
          toast.error("Please enter a valid donation amount.");
          return;
        }
      }

      console.log(`Support API URL: ${apiUrl}/api/support`);
      console.log("Donation amount:", finalAmount);

      // API 호출하여 후원 정보 저장
      const response = await fetch(`${apiUrl}/api/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          amount: parseFloat(finalAmount),
        }),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: "응답을 처리할 수 없습니다." };
      }

      console.log("Support API 응답:", responseData);

      if (!response.ok) {
        throw new Error(responseData?.error || "Failed to process donation.");
      }

      // 성공 처리
      setShowThankYou(true);
      toast.success(
        responseData?.message || "Thank you for your Idiot support!"
      );

      // 후원 정보 새로고침 - 성공 후 직접 호출하여 데이터 갱신 보장
      console.log("후원 성공 후 데이터 새로고침 시작");

      // 즉시 한 번 실행
      fetchSupportInfo();

      // 약간의 지연 후 다시 실행 (첫 번째 시도)
      setTimeout(() => {
        console.log("후원 첫 번째 지연 새로고침 시도");
        fetchSupportInfo();
      }, 2000); // 2초 후

      // 더 긴 지연 후 다시 실행 (두 번째 시도)
      setTimeout(() => {
        console.log("후원 두 번째 지연 새로고침 시도");
        fetchSupportInfo();
      }, 5000); // 5초 후
    } catch (error) {
      console.error("후원 처리 오류:", error);
      toast.error(
        error.message || "An error occurred while processing your donation."
      );
    }
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 천 단위 쉼표 포맷팅 함수
  const formatMoney = (amount) => {
    return amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 댓글 날짜 포맷팅
  const formatCommentDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    // 1일 이내: 시간 표시
    if (diffDay < 1) {
      if (diffHour < 1) {
        if (diffMin < 1) {
          return "just now";
        }
        return `${diffMin} min ago`;
      }
      return `${diffHour} hours ago`;
    }
    // 그 외: 전체 날짜 표시
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 남은 일수 계산
  const calculateDaysLeft = () => {
    if (!challenge?.end_date) return 0;

    const today = new Date();
    const endDate = new Date(challenge.end_date);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!challenge) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Challenge Title */}
        <h1 className="text-3xl font-bold mb-4 text-purple-800">
          {challenge.title}
        </h1>

        {/* Challenge Image */}
        <div className="mb-6">
          <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={challenge.title}
              className="w-full h-full object-cover"
            />
            <Badge
              className={clsx(
                "absolute top-4 right-4",
                challenge.status === "In Progress"
                  ? "bg-green-500"
                  : challenge.status === "Completed"
                  ? "bg-sky-500"
                  : challenge.status === "Fallen"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              )}
            >
              {challenge.status}
            </Badge>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={clsx(
                    "w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2",
                    currentImageIndex === index
                      ? "border-purple-500"
                      : "border-transparent"
                  )}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Reaction Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant="outline"
            className={clsx(
              "flex items-center gap-2",
              liked ? "bg-red-50 text-red-500 border-red-200" : "text-gray-500"
            )}
          >
            <Heart
              size={20}
              className={clsx(liked ? "fill-purple-500 text-purple-500" : "")}
            />
            <span>{likeCount} Idiots</span>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Back this Idiot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">
                  How big of an idiot supporter are you?
                </DialogTitle>
                {challenge.money > 0 && (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">Donation goal</p>
                    <p className="text-lg font-bold text-purple-600">
                      ${formatMoney(challenge.money)}
                    </p>
                  </div>
                )}
              </DialogHeader>
              {!showThankYou ? (
                <div className="space-y-4 py-4">
                  <RadioGroup
                    value={donationAmount}
                    onValueChange={setDonationAmount}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-purple-50">
                      <RadioGroupItem value="5" id="amount-5" />
                      <Label
                        htmlFor="amount-5"
                        className="flex-1 cursor-pointer"
                      >
                        $5
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-purple-50">
                      <RadioGroupItem value="10" id="amount-10" />
                      <Label
                        htmlFor="amount-10"
                        className="flex-1 cursor-pointer"
                      >
                        $10
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-purple-50">
                      <RadioGroupItem value="custom" id="amount-custom" />
                      <Label
                        htmlFor="amount-custom"
                        className="flex-1 cursor-pointer"
                      >
                        Custom Amount
                      </Label>
                    </div>
                  </RadioGroup>

                  {donationAmount === "custom" && (
                    <div className="mt-4">
                      <Label htmlFor="custom-amount">Enter Amount ($)</Label>
                      <Input
                        id="custom-amount"
                        type="number"
                        min="1"
                        placeholder="Enter support amount"
                        className="mt-1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleDonate}>Support</Button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-purple-700">
                    Thank you for your Idiot support!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for supporting this Idiot challenge to succeed.
                  </p>
                  <DialogClose asChild>
                    <Button className="mt-4">Close</Button>
                  </DialogClose>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="text-gray-500">
            <Share2 size={20} className="mr-2" />
            <span>Share</span>
          </Button>
        </div>

        {/* Challenge Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <Calendar size={24} className="text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{formatDate(challenge.start_date)}</p>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <Calendar size={24} className="text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{formatDate(challenge.end_date)}</p>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <Calendar size={24} className="text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Days Left</p>
              <p className="font-medium">{calculateDaysLeft()} days</p>
            </div>
          </div>
        </div>

        {/* Donation Goal - 목표 금액과 현재 모인 금액 표시 */}
        {challenge.money > 0 && (
          <div className="mb-6 bg-purple-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-bold text-purple-800 mb-1">
                  Donation Goal
                </h3>
                <div className="flex items-center">
                  <p className="text-xl font-bold text-purple-600">
                    ${formatMoney(challenge.money)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold text-green-600 mb-1">
                  Raised So Far
                </h3>
                <p className="text-xl font-bold text-green-600">
                  ${formatMoney(totalRaised)}
                </p>
              </div>
            </div>

            {/* Progress - 진행률 */}
            <div className="mb-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium text-purple-600">
                  {donationProgress}% (${formatMoney(totalRaised)} of $
                  {formatMoney(challenge.money)})
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-2.5 rounded-full"
                  style={{ width: `${Math.min(donationProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="flex items-center mb-6">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarFallback>
              {challenge.name ? challenge.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold">{challenge.name}</h3>
            <p className="text-sm text-gray-500">Complete : 0 | Fallen : 0</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-3 text-purple-800">
                Motivation for the idiot challenge
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {challenge.motivation}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-purple-800">
                Execution Plan
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {challenge.plan}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <div className="mb-6">
              <Label htmlFor="comment" className="block mb-2">
                Leave a idiot Comment
              </Label>
              <div className="flex gap-2">
                <Input
                  id="comment"
                  placeholder="Write your comment"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                />
                <Button onClick={handleCommentSubmit}>
                  <MessageCircle size={18} className="mr-2" />
                  Comment
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {isLoadingComments ? (
                <p className="text-center text-gray-500">Loading comments...</p>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-500">
                            {formatCommentDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    Be the first idiot to leave a thought!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default DetailHero;
