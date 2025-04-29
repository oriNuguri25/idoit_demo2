import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Compass,
  Heart,
  LightbulbIcon,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import React from "react";
import { Link } from "react-router";

const AboutHero = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-16 text-center max-w-4xl mx-auto">
        <div className="relative mb-8">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-300 rounded-full opacity-20 blur-3xl" />
          <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-purple-500">
            About <span className="text-black">Idoit</span>
          </h1>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-100 via-yellow-50 to-teal-100 p-8 sm:p-12 mb-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-300 rounded-full opacity-20 blur-xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-400 rounded-full opacity-20 blur-xl" />

          <div className="relative flex flex-col items-center justify-center h-40 sm:h-60">
            <Sparkles
              className="h-12 w-12 text-yellow-500 mb-4 animate-pulse"
              strokeWidth={1.5}
            />
            <p className="text-xl sm:text-2xl font-medium text-purple-800 max-w-lg text-center">
              You don’t have to be perfect.
              <br />
              Just show the world your Idiot Challenge
            </p>
          </div>
        </div>
      </section>

      {/* Idoit Story Section */}
      <section className="mb-16 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <LightbulbIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-purple-800">
            Idoit's Story
          </h2>
        </div>

        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-full -mt-20 -mr-20 opacity-50" />

          <div class="relative">
            <p className="text-gray-700 mb-4">
              <span className="font-bold">
                Idoit began with one person who was too afraid to try afraid of
                looking like an idiot.
              </span>{" "}
              What seems like an easy “start” for some, can take immense courage
              for others. Putting your challenge out into the world is never as
              simple as it sounds.
            </p>
            <p className="text-gray-700 mb-4">
              That’s why Idoit exists for those who struggle with that very
              first step. No challenge is too small, too silly, or too strange.
              Here, everyone’s a bit of an idiot and that’s exactly who we’re
              here to cheer for.
            </p>
            <p className="text-gray-700 mb-4">
              The name <span className="font-bold">Idoit</span> was born from
              Idiot. Just a simple switch between the letters
              <span className="font-bold"> i</span> and
              <span className="font-bold"> o</span> and suddenly, it becomes{" "}
              <span className="font-bold">“I do it.”</span> A small change that
              carries the big courage to try, even if the challenge feels a
              little foolish.
            </p>
            <p className="text-gray-700 mb-4">
              At Idoit, we don’t mock foolish ideas we celebrate them. Because
              we believe imperfect, honest courage is far more powerful than
              polished success. So come be an idiot with us. Let’s take silly
              chances, support each other loudly, and laugh along the way.
            </p>
          </div>
        </div>
      </section>

      {/* Idoit Mission */}
      <section className="mb-16 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="bg-yellow-100 p-2 rounded-full mr-3">
            <Target className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-700">
            Idoit's Mission
          </h2>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xl font-bold mb-5 text-yellow-700">
            What Idiot's Trying to Achieve
          </h3>
          <p className="text-gray-700 mb-6 max-w-3xl">
            Idoit is a crowdfunding platform where bold, ridiculous ideas get
            their start. Even imperfect or failed challenges are supported,
            celebrated, and remembered together as part of something meaningful.
          </p>

          <div className="border-l-4 border-yellow-200 pl-6 py-2 mb-6">
            <p className="text-gray-700 italic">
              At Idoit, we believe there’s no such thing as an idiot challenge
              only the fear of being seen as one. Every challenge, no matter how
              silly it seems, holds a seed of courage and creativity.
              <br /> That’s why Idoit exists: to build a world where anyone can
              try, fail, and still get a cheer.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 rounded-full mr-4 mt-1">
                <Sparkles
                  className="h-5 w-5 text-purple-600"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h4 className="font-bold text-purple-800 mb-1">
                  Big Dreams Start with Ridiculous Ideas
                </h4>
                <p className="text-gray-700">
                  Got a challenge that sounds silly or far fetched? That might
                  just be the start of something amazing. Don’t hold back—dream
                  big, even if it looks a little foolish.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded-full mr-4 mt-1">
                <Heart className="h-5 w-5 text-red-500" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-red-600 mb-1">
                  Support That Celebrates Heart, Not Just Results
                </h4>
                <p className="text-gray-700">
                  Whether your challenge is a masterpiece or a mess, if it’s
                  honest, it belongs here. Effort matters. And you’ll never face
                  it alone.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-4 mt-1">
                <Users className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-blue-600 mb-1">
                  Failures Make the Best Stories
                </h4>
                <p className="text-gray-700">
                  Win or lose, every challenge leaves a story behind. Let’s turn
                  stumbles into shared memories and cheer each other on, no
                  matter what.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Idoit Values Section */}
      <section className="mb-16 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="bg-teal-100 p-2 rounded-full mr-3">
            <Compass className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-teal-700">
            Idoit's Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
            <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-600 to-purple-800 group-hover:w-full transition-all duration-500" />
            <h3 className="font-bold text-purple-800 mb-3 flex items-center">
              <span className="bg-purple-100 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                1
              </span>
              Courage Over Comfort
            </h3>
            <p className="text-gray-700">
              We cheer for those who step into the uncomfortable, even if it
              looks foolish to others. Taking the road less traveled takes
              courage and we value that deeply.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <div className="absoulute top-0 left-0 w-0 h-1 bg-gradient-to-r from-yellow-600 to-yellow-800 group-hover:w-full transition-all duration-500" />
            <h3 className="font-bold text-yellow-700 mb-3 flex items-center">
              <span className="bg-yellow-100 text-yellow-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                2
              </span>
              Radical Transparency
            </h3>
            <p className="text-gray-700">
              We’re honest about everything: how challenges are going, how
              support funds are used, and what’s really happening behind the
              scenes. Authentic stories build real trust.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-600" />
            <div className="absoulute top-0 left-0 w-0 h-1 bg-gradient-to-r from-teal-600 to-teal-800 group-hover:w-full transition-all duration-500" />
            <h3 className="font-bold text-teal-700 mb-3 flex items-center">
              <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                3
              </span>
              Supportive Community
            </h3>
            <p className="text-gray-700">
              This is a space where people root for each other. We help,
              encourage, and celebrate not just the wins, but also the brave
              failures that make us human.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600" />
            <div className="absoulute top-0 left-0 w-0 h-1 bg-gradient-to-r from-red-600 to-red-800 group-hover:w-full transition-all duration-500" />
            <h3 className="font-bold text-red-700 mb-3 flex items-center">
              <span className="bg-red-100 text-red-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                4
              </span>
              Joy in the Process
            </h3>
            <p className="text-gray-700">
              We believe the journey matters more than the outcome. It’s in the
              trying messy, fun, meaningful trying that we find what matters
              most.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mb-16 max-w-4xl mx-auto text-center">
        <div className="relative bg-gradient-to-r from-purple-100 to-yellow-100 rounded-2xl p-8 sm:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-200 rounded-full opacity-20 blur-xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-300 rounded-full opacity-20 blur-xl" />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-purple-800">
              Ready to Be an Idiot?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Whether you want to start your own silly challenge or support
              someone else's journey, <br />
              there's a place for you at Idoit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-lg w-full sm:w-auto group">
                  Become an Idoit
                  <ArrowRight className="ml-2 h-5 w-5 trnasform group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/all-challenges">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-100 px-6 py-3 rounded-xl text-lg w-full sm:w-auto"
                >
                  Browse Idiot Challenges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutHero;
