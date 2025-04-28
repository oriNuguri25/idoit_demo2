import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://idoitproto.vercel.app", // 원격 API 서버로 변경
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("프록시 오류:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("프록시 요청:", req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("프록시 응답:", proxyRes.statusCode);
          });
        },
      },
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false, // 모든 주석 제거
      },
    },
  },
});
