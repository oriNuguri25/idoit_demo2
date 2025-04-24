import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DetailHero from "./DetailHero";
import Footer from "@/components/Footer";
import { toast } from "@/components/ui/sonner";

const Detail = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallengeDetail = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/challenges/${id}`
        );

        if (!response.ok) {
          throw new Error("Challenge not found");
        }

        const data = await response.json();
        setChallenge(data);
      } catch (error) {
        console.error("Error fetching challenge:", error);
        toast.error("챌린지 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchChallengeDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <p className="text-purple-800">챌린지 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center">
        <p className="text-purple-800 mb-4">챌린지를 찾을 수 없습니다.</p>
        <Link
          to="/"
          className="inline-flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          메인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <header className="container mx-auto p-4">
        <Link
          to="/"
          className="inline-flex items-center text-purple-700 hover:text-purple-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to home</span>
        </Link>
      </header>

      <DetailHero challenge={challenge} challengeId={id} />

      <Footer />
    </div>
  );
};

export default Detail;
