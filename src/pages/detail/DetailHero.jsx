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
  const supabaseRef = useRef(null);
  const commentsSubscriptionRef = useRef(null);

  // API URL 설정
  const apiUrl = import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://idoitproto.vercel.app";

  // Supabase 클라이언트 초기화
  useEffect(() => {
    // 환경 변수에서 Supabase URL과 Anon Key 가져오기
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
      console.log("Supabase client initialized for real-time updates");
    } else {
      console.warn(
        "Supabase credentials not found, real-time updates disabled"
      );
    }

    return () => {
      // 구독 정리
      if (commentsSubscriptionRef.current) {
        commentsSubscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (challenge) {
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

      // 실시간 댓글 업데이트 구독 설정
      setupCommentsSubscription();
    }
  }, [challenge, challengeId]);

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

  // const handleLike = async () => {
  //   try {
  //     if (liked) return; // Already liked

  //     console.log(`Like URL: ${apiUrl}/api/challenges/${challengeId}/like`);

  //     const response = await fetch(
  //       `${apiUrl}/api/challenges/${challengeId}/like`,
  //       {
  //         method: "POST",
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to like challenge");
  //     }

  //     setLiked(true);
  //     setLikeCount((prev) => prev + 1);
  //     toast.success("You have supported this challenge!");
  //   } catch (error) {
  //     console.error("Error liking challenge:", error);
  //     toast.error("Support feature is currently unavailable.");
  //   }
  // };

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

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium">
              {challenge.progress || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${challenge.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Donation Goal */}
        {challenge.money > 0 && (
          <div className="mb-6 bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2 text-purple-800">
              Donation Goal
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              ${formatMoney(challenge.money)}
            </p>
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
