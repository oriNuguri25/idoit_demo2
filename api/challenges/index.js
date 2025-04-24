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

  // POST 요청만 처리
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      title,
      motivation,
      plan,
      status,
      progress,
      likes,
      images,
      money,
    } = req.body;

    // 필수 필드 검증
    if (!name || !email || !title || !images) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 현재 날짜 및 14일 후 날짜 계산
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 14);

    // ISO 형식으로 변환 (YYYY-MM-DD)
    const startDate = currentDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    // 데이터베이스에 챌린지 저장
    const { data, error } = await supabase
      .from("challenges")
      .insert([
        {
          name,
          email,
          title,
          motivation,
          plan,
          status,
          progress,
          likes,
          images,
          start_date: startDate,
          end_date: formattedEndDate,
          money: money || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Failed to create challenge" });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
