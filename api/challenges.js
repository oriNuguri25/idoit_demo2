import { supabase, setCorsHeaders, handleOptionsRequest } from "./utils";

export default async function handler(req, res) {
  // CORS 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (handleOptionsRequest(req, res)) return;

  // GET 요청 - 챌린지 조회
  if (req.method === "GET") {
    const { type, id } = req.query;

    try {
      // 특정 챌린지 상세 조회
      if (id) {
        const { data, error } = await supabase
          .from("challenges")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }

      // 타입에 따른 챌린지 조회
      switch (type) {
        // 인기 챌린지 조회
        case "popular":
          const { data: popularData, error: popularError } = await supabase
            .from("challenges")
            .select("*")
            .order("likes", { ascending: false })
            .limit(3);

          if (popularError) throw popularError;
          return res.status(200).json(popularData);

        // 실패한 챌린지 조회
        case "fallen":
          const { data: fallenData, error: fallenError } = await supabase
            .from("challenges")
            .select("*")
            .eq("status", "Fallen")
            .order("created_at", { ascending: false });

          if (fallenError) throw fallenError;
          return res.status(200).json(fallenData);

        // 오늘의 챌린지 조회
        case "today":
          // 오늘 날짜 설정 (UTC 기준)
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);

          // 내일 날짜 설정
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // 오늘 생성된 챌린지 조회
          const { data: todayData, error: todayError } = await supabase
            .from("challenges")
            .select("*")
            .gte("created_at", today.toISOString())
            .lt("created_at", tomorrow.toISOString());

          if (todayError) throw todayError;

          if (todayData.length === 0) {
            // 오늘 생성된 챌린지가 없는 경우 가장 최근 챌린지 반환
            const { data: recentData, error: recentError } = await supabase
              .from("challenges")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(1);

            if (recentError) throw recentError;
            return res.status(200).json(recentData[0] || null);
          } else {
            // 오늘 생성된 챌린지 중 무작위로 1개 선택
            const randomIndex = Math.floor(Math.random() * todayData.length);
            return res.status(200).json(todayData[randomIndex]);
          }

        // 기본: 모든 챌린지 조회 (최신순으로 정렬)
        default:
          const { data: allData, error: allError } = await supabase
            .from("challenges")
            .select("*")
            .order("created_at", { ascending: false });

          if (allError) throw allError;
          return res.status(200).json(allData);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res
        .status(500)
        .json({ error: "챌린지를 가져오는 중 오류가 발생했습니다." });
    }
  }
  // POST 요청 - 챌린지 생성
  else if (req.method === "POST") {
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
      if (!name || !email || !title) {
        return res.status(400).json({
          error: "필수 필드 누락",
          detail: "name, email, title은 필수 입력 항목입니다.",
        });
      }

      // images 필드 처리
      let processedImages = images;

      // images가 문자열인 경우 (이미 JSON 문자열로 변환된 경우)
      if (typeof images === "string") {
        try {
          // 유효한 JSON 문자열인지 확인
          JSON.parse(images);
          // 유효하다면 그대로 사용
          processedImages = images;
        } catch (jsonError) {
          console.error("Invalid JSON string for images:", jsonError);
          return res.status(400).json({
            error: "잘못된 이미지 형식",
            detail: "이미지는 유효한 배열 또는 JSON 문자열이어야 합니다.",
          });
        }
      }
      // images가 배열인 경우
      else if (Array.isArray(images)) {
        // 배열을 JSON 문자열로 변환
        processedImages = JSON.stringify(images);
      }
      // images가 없거나 유효하지 않은 경우
      else if (!images) {
        return res.status(400).json({
          error: "필수 필드 누락: images",
          detail: "최소 하나의 이미지가 필요합니다.",
        });
      }

      // 현재 날짜 계산
      const currentDate = new Date();
      // ISO 형식으로 변환 (YYYY-MM-DD)
      const startDate = currentDate.toISOString().split("T")[0];

      // 14일 후의 날짜 계산
      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + 14);
      const endDateStr = endDate.toISOString().split("T")[0];

      // 데이터베이스에 저장할 데이터 구성
      const challengeData = {
        name,
        email,
        title,
        motivation: motivation || "",
        plan: plan || "",
        status: status || "In Progress",
        progress: progress || 0,
        likes: likes || 0,
        images: processedImages,
        start_date: startDate,
        end_date: endDateStr,
        money: money || 0,
      };

      // 데이터베이스에 챌린지 저장
      const { data, error } = await supabase
        .from("challenges")
        .insert([challengeData])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          error: "챌린지 생성 실패",
          detail: error.message,
          code: error.code,
        });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({
        error: "서버 내부 오류",
        detail: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "지원하지 않는 HTTP 메서드입니다." });
  }
}
