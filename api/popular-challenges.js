import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      // 좋아요 수가 많은 상위 3개 챌린지 조회
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("likes", { ascending: false })
        .limit(3);

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching popular challenges:", error);
      res
        .status(500)
        .json({ error: "인기 챌린지를 가져오는 중 오류가 발생했습니다." });
    }
  } else {
    res.status(405).json({ error: "지원하지 않는 HTTP 메서드입니다." });
  }
}
