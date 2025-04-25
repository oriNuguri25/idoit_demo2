import { supabase, setCorsHeaders, handleOptionsRequest } from "./utils";

export default async function handler(req, res) {
  // CORS 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (handleOptionsRequest(req, res)) return;

  if (req.method === "POST") {
    try {
      const { challengeId, amount } = req.body;

      // 필수 필드 검증
      if (!challengeId || !amount) {
        return res
          .status(400)
          .json({ error: "챌린지 ID와 후원 금액은 필수입니다." });
      }

      // 금액이 유효한지 확인
      const parsedAmount = parseInt(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "유효한 후원 금액이 아닙니다." });
      }

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

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error supporting challenge:", error);
      res
        .status(500)
        .json({ error: "후원 정보를 저장하는 중 오류가 발생했습니다." });
    }
  } else {
    res.status(405).json({ error: "지원하지 않는 HTTP 메서드입니다." });
  }
}
