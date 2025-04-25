import { supabase, setCorsHeaders, handleOptionsRequest } from "./utils.js";

export default async function handler(req, res) {
  // CORS 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (handleOptionsRequest(req, res)) return;

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
        console.error("Supabase 오류:", error);
        throw error;
      }

      console.log("Support API: 후원 성공", data);

      // 챌린지 테이블의 모금액 업데이트
      try {
        // 현재 모금액 조회
        const { data: challengeData, error: fetchError } = await supabase
          .from("challenges")
          .select("money")
          .eq("id", challengeId)
          .single();

        if (fetchError) throw fetchError;

        const currentMoney = parseFloat(challengeData.money || 0);
        const newTotal = currentMoney + parsedAmount;

        // 모금액 업데이트
        const { error: updateError } = await supabase
          .from("challenges")
          .update({ money: newTotal })
          .eq("id", challengeId);

        if (updateError) throw updateError;

        console.log(
          `Support API: 챌린지 ${challengeId}의 모금액 ${currentMoney}$ → ${newTotal}$ 업데이트됨`
        );
      } catch (updateError) {
        console.error("모금액 업데이트 실패:", updateError);
        // 후원 자체는 성공했으므로 오류를 클라이언트에 반환하지 않음
      }

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error supporting challenge:", error);
      res.status(500).json({
        error: "후원 정보를 저장하는 중 오류가 발생했습니다.",
        detail: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "지원하지 않는 HTTP 메서드입니다." });
  }
}
