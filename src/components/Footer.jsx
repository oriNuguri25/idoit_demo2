import React from "react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-purple-100 py-6 sm:py-8">
      <div className="container mx-auto px-4 text-center text-purple-700">
        <p className="mb-4">
          © 2024 Idiot – A worldwide community cheering on idiots, with empathy
          and zero fear of failure.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="#" className="hover:underline">
            Terms of Service
          </Link>
          <Link to="#" className="hover:underline">
            Privacy Policy
          </Link>
          <Link to="#" className="hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
