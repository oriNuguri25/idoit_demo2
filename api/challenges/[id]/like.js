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

  // POST 요청 처리 (좋아요 기능)
  if (req.method === "POST") {
    try {
      // 현재 챌린지 정보 조회
      const { data: challenge, error: fetchError } = await supabase
        .from("challenges")
        .select("likes")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Database error:", fetchError);
        return res.status(404).json({ error: "Challenge not found" });
      }

      // 좋아요 수 증가
      const currentLikes = challenge.likes || 0;
      const newLikes = currentLikes + 1;

      // 업데이트
      const { data, error } = await supabase
        .from("challenges")
        .update({ likes: newLikes })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Failed to update likes" });
      }

      return res.status(200).json({ success: true, likes: newLikes });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
