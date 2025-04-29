import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import AboutHero from "./AboutHero";

const About = () => {
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
      <AboutHero />
      <Footer />
    </div>
  );
};

export default About;
