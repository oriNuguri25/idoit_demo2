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

  // GET 요청만 처리
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 오늘 날짜 계산 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split("T")[0];

    // 오늘 생성된 챌린지 중 임의로 1개 선택
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("start_date", today)
      .limit(10); // 먼저 10개를 가져옵니다

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch today's challenge" });
    }

    // 결과가 없는 경우
    if (!data || data.length === 0) {
      // 최신 챌린지 중 하나를 가져옵니다 (오늘 생성된 것이 없는 경우)
      const { data: latestData, error: latestError } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (latestError) {
        console.error("Database error:", latestError);
        return res
          .status(500)
          .json({ error: "Failed to fetch latest challenge" });
      }

      return res.status(200).json(latestData[0] || null);
    }

    // 결과가 있는 경우 임의로 1개 선택
    const randomIndex = Math.floor(Math.random() * data.length);
    return res.status(200).json(data[randomIndex]);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
