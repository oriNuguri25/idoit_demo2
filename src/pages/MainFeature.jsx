import { LockKeyhole, Rocket, Sparkles } from "lucide-react";
import React from "react";

const MainFeature = () => {
  return (
    <section className="mb-16 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-200 rounded-full opacity-20 animate-pulse" />
            <div className="realtive bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-full">
              <Sparkles className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-lg font-bold mb-3 text-purple-800">
            It's okay to look like an idiot
          </h3>
          <p className="text-gray-600 mb-4">
            We believe even a little foolish courage is enough. You don't have
            to be perfect just start.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-sm transition-shadow">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-yellow-200 rounded-full opacity-20 animate-pulse" />
            <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-full">
              <LockKeyhole className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-lg font-bold mb-3 text-yellow-700">
            Your money doesn't go straight to the challenger
          </h3>
          <p className="text-gray-600 mb-4">
            <span className="font-bold">Idoit</span> purchases necessary items
            on their behalf, or releases the funds only when goals are met
            keeping your support safe and transparent.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-sm transition-shadow">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-200 rounded-full opacity-20 animate-pulse" />
            <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-full">
              <Rocket className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-lg font-bold mb-3 text-green-700">
            It's okay to fail
          </h3>
          <p className="text-gray-600 mb-4">
            As long as it's real, your challenge matters. Even the ones that
            don't succeed are worth sharing (and laughing about) together.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MainFeature;
