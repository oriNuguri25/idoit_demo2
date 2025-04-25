import { supabase, setCorsHeaders, handleOptionsRequest } from "./utils.js";

export default async function handler(req, res) {
  // CORS 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (handleOptionsRequest(req, res)) return;

  // GET 요청 - 특정 챌린지의 댓글 조회
  if (req.method === "GET") {
    const { challengeId } = req.query;

    if (!challengeId) {
      return res.status(400).json({ error: "챌린지 ID가 필요합니다." });
    }

    try {
      // 특정 챌린지의 댓글 조회 (최신순)
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res
        .status(500)
        .json({ error: "댓글을 가져오는 중 오류가 발생했습니다." });
    }
  }
  // POST 요청 - 댓글 추가
  else if (req.method === "POST") {
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
