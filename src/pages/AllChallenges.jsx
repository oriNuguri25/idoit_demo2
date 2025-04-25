import ChallengeCard from "@/components/ChallengeCard";
import MainLayout from "@/components/MainLayout";
import React, { useEffect, useState } from "react";

const AllChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // API URL 설정
  const apiUrl = import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://idoitproto.vercel.app";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log(`모든 챌린지 URL: ${apiUrl}/api/challenges`);

        // 모든 챌린지 조회
        const response = await fetch(`${apiUrl}/api/challenges`);
        const data = await response.json();

        setChallenges(data || []);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-8">
          All Idiot Challenges
        </h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading challenges...</p>
          </div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No challenges found</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AllChallenges;
