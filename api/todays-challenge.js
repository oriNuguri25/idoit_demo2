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
      // 오늘 날짜 설정 (UTC 기준)
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // 내일 날짜 설정
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 오늘 생성된 챌린지 조회
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

      if (error) throw error;

      if (data.length === 0) {
        // 오늘 생성된 챌린지가 없는 경우 가장 최근 챌린지 반환
        const { data: recentData, error: recentError } = await supabase
          .from("challenges")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (recentError) throw recentError;

        res.status(200).json(recentData[0] || null);
      } else {
        // 오늘 생성된 챌린지 중 무작위로 1개 선택
        const randomIndex = Math.floor(Math.random() * data.length);
        res.status(200).json(data[randomIndex]);
      }
    } catch (error) {
      console.error("Error fetching today's challenge:", error);
      res
        .status(500)
        .json({ error: "오늘의 챌린지를 가져오는 중 오류가 발생했습니다." });
    }
  } else {
    res.status(405).json({ error: "지원하지 않는 HTTP 메서드입니다." });
  }
}
