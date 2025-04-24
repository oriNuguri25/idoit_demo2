import Detail from "@/pages/detail/Detail";
import Main from "@/pages/Main";
import Register from "@/pages/register/Register";
import { Route, Routes } from "react-router-dom";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/register" element={<Register />} />
      <Route path="/detail:id" element={<Detail />} />
    </Routes>
  );
};

export default AppRoutes;
