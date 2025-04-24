import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import RegisterForm from "./RegisterForm";
import Footer from "@/components/Footer";

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50 to-white">
      <header className="container mx-auto p-4">
        <Link
          to="/"
          className="inline-flex items-center text-purple-700 hover:text-purple-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </header>

      <RegisterForm />
      <Footer />
    </div>
  );
};

export default Register;
