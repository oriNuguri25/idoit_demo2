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
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const { challengeId, content } = req.body;

      // 필수 필드 검증
      if (!challengeId || !content) {
        return res
          .status(400)
          .json({ error: "챌린지 ID와 댓글 내용은 필수입니다." });
      }

      // 댓글 정보를 comments 테이블에 저장
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            challenge_id: challengeId,
            content: content,
          },
        ])
        .select();

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error adding comment:", error);
      res
        .status(500)
        .json({ error: "댓글을 저장하는 중 오류가 발생했습니다." });
    }
  } else {
    res.status(405).json({ error: "지원하지 않는 HTTP 메서드입니다." });
  }
}
