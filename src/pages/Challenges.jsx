import ChallengeCard from "@/components/ChallengeCard";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const Challenges = () => {
  return (
    <>
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
            Popluar Idiot Challenges
          </h2>
          <Link
            href="/challenges"
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            See more <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popluarChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>

      <section className="mb-16 bg-yellow-50 p-4 sm:p-6 rounded-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-600 mb-4">
          Today's Idiot Challenge
        </h2>
        <div className="bg-white rounded-xl overflow-hidden shadow-md">
          <div className="relative h-48">
            {/* 임의의 데이터 하나 넣기 */}
            <img
              src="/images/challenge-placeholder.jpg"
              alt="Today's Challenge"
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 right-4 bg-yellow-500">
              In Progress
            </Badge>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">
              Wake up at 5 AM every day for a month to swim in the ocean
            </h3>
            <div className="flex justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Heart size={16} className="text-purple-500" />
                <span>238 Cheers</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} className="text-blue-400" />
                <span>42 Idiots</span>
              </div>
            </div>
            <Link
              to="/challenge/detail:id"
              className="blok text-center bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-2 rounded-lg font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800">
            Fallen Idiot Challenges
          </h2>
          <Link
            to="/challenge/fallen"
            className="text-purple-600 hover:text-purple-800 flex items-center hap-1"
          >
            See more <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fallenChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Challenges;
