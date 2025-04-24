import React from "react";
import { Link } from "react-router";

const Header = () => {
  return (
    <header className="container mx-auto p-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-bold text-purple-700 text-xl">Idoit</span>
      </Link>
      <Link
        to="/about"
        className="text-purple-700 hover:text-purple-900 font-medium"
      >
        About Us
      </Link>
    </header>
  );
};

export default Header;
