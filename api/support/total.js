import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // 요청 방식이 OPTIONS인 경우 (CORS preflight)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // GET 요청만 처리
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { challengeId } = req.query;

  if (!challengeId) {
    return res.status(400).json({ error: "Missing challengeId parameter" });
  }

  try {
    console.log(`후원 합계 API 호출: challengeId=${challengeId}`);

    // Supabase 연결 초기화
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경 변수 누락");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 모든 후원 내역 조회
    const { data: supports, error } = await supabase
      .from("supports")
      .select("amount")
      .eq("challenge_id", challengeId);

    if (error) {
      console.error("Supabase 조회 오류:", error);

      // 테이블 이름 변경 시도 (복수형이 아닌 단수형으로)
      const { data: altSupports, error: altError } = await supabase
        .from("support")
        .select("amount")
        .eq("challenge_id", challengeId);

      if (altError) {
        console.error("대체 테이블 조회 오류:", altError);
        return res.status(200).json({ total: 0 }); // 오류 발생 시 0 반환
      }

      // 있는 경우 수동 합산
      const total =
        altSupports?.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0
        ) || 0;
      console.log(`대체 테이블에서 계산된 총액: ${total}`);

      return res.status(200).json({ total });
    }

    // 결과가 없으면 0 반환
    if (!supports || supports.length === 0) {
      console.log("후원 내역이 없습니다.");
      return res.status(200).json({ total: 0 });
    }

    // 수동으로 합계 계산
    const total = supports.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
    console.log(`계산된 총 후원 금액: ${total}`);

    return res.status(200).json({ total });
  } catch (error) {
    console.error("후원 합계 조회 중 예외 발생:", error);
    return res.status(500).json({ error: "Failed to fetch support total" });
  }
}
