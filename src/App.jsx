import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const App = () => {
  return (
    <>
      <AppRoutes />
      <Analytics />
      <SpeedInsights />
    </>
  );
};

export default App;
