import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router";
import Challenges from "./Challenges";
import MainFeature from "./MainFeature";

const MainHero = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-16 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-purple-800 leading-tight tracking-tight">
          For idiots. By idiots.
          <br />
          <span className="text-yellow-500">Powered by believers.</span>
        </h1>
        <div className="space-y-2 mb-8">
          <p className="text-base sm:text-lg text-gray-600">
            We cheer for your ridiculous ideas.
          </p>
          <p className="text-base sm:text-lg text-gray-600">
            Because every great idea starts out a little foolish.
          </p>
          <p className="text-base sm:text-lg text-gray-600">
            Who knows? One of them might just change the world.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="inline-block">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-5 sm:py-6 rounded-xl text-base sm:text-lg w-full sm:w-auto">
              Be the idiot
            </Button>
          </Link>
        </div>
      </section>
      <MainFeature />
      <Challenges />
    </main>
  );
};

export default MainHero;
