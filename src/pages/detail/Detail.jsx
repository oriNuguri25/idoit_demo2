import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DetailHero from "./DetailHero";
import Footer from "@/components/Footer";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

const Detail = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API URL 설정
  const apiUrl = import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://idoitproto.vercel.app";

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setIsLoading(true);
        console.log(`챌린지 상세 URL: ${apiUrl}/api/challenges/${id}`);

        const response = await fetch(`${apiUrl}/api/challenges/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Challenge not found");
          }
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        setChallenge(data);
      } catch (error) {
        console.error("Error fetching challenge:", error);
        setError(error.message);
        toast.error("Failed to load challenge information.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchChallenge();
    }
  }, [id, apiUrl]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[50vh]">
        <p className="text-purple-800">
          Loading idiot challenge information...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex flex-col justify-center items-center min-h-[50vh]">
        <p className="text-purple-800 mb-4">Idiot Challenge not found.</p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
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
