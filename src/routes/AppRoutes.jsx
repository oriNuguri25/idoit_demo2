import Detail from "@/pages/detail/Detail";
import Main from "@/pages/Main";
import Register from "@/pages/register/Register";
import AllChallenges from "@/pages/AllChallenges";
import { Route, Routes } from "react-router-dom";
import About from "@/pages/about-us/About";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/register" element={<Register />} />
      <Route path="/challenge/detail/:id" element={<Detail />} />
      <Route path="/all-challenges" element={<AllChallenges />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default AppRoutes;
