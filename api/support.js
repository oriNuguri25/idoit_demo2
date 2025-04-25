import { supabase, setCorsHeaders, handleOptionsRequest } from "./utils.js";

export default async function handler(req, res) {
  // CORS 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (handleOptionsRequest(req, res)) return;

  console.log("Support API 환경 확인:", {
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseInstance: !!supabase,
  });

  if (req.method === "POST") {
    try {
      console.log("Support API 호출됨:", req.body);
      const { challengeId, amount } = req.body;

      // 필수 필드 검증
      if (!challengeId) {
        console.error("Support API 오류: 챌린지 ID 누락");
        return res.status(400).json({ error: "챌린지 ID는 필수입니다." });
      }

      if (amount === undefined || amount === null) {
        console.error("Support API 오류: 후원 금액 누락");
        return res.status(400).json({ error: "후원 금액은 필수입니다." });
      }

      // 금액이 유효한지 확인
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        console.error("Support API 오류: 유효하지 않은 금액", amount);
        return res.status(400).json({ error: "유효한 후원 금액이 아닙니다." });
      }

      if (!supabase) {
        throw new Error(
          "Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인하세요."
        );
      }

      console.log(
        `Support API: ${challengeId}에 ${parsedAmount}$ 후원 처리 중`
      );

      // 후원 정보를 support 테이블에 저장
      const { data, error } = await supabase
        .from("support")
        .insert([
          {
            challenge_id: challengeId,
            amount: parsedAmount,
          },
        ])
        .select();

      if (error) {
        console.error("Supabase support 테이블 삽입 오류:", error);
        throw error;
      }

      console.log("Support API: 후원 정보 저장 성공", data);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Support API 치명적 오류:", error.message, error.stack);
      res.status(500).json({
        error: "후원 정보를 저장하는 중 오류가 발생했습니다.",
        detail: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  } else {
    res.status(405).json({ error: "지원하지 않는 HTTP 메서드입니다." });
  }
}
