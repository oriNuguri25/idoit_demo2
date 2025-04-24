import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화 - 서버 사이드에서만 실행됨
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS 요청 처리
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  // 챌린지 ID 추출
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Challenge ID is required" });
  }

  // GET 요청 처리
  if (req.method === "GET") {
    try {
      // ID로 챌린지 조회
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(404).json({ error: "Challenge not found" });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
