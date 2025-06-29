import { supabase, setCorsHeaders, handleOptionsRequest } from "./utils.js";

export default async function handler(req, res) {
  // CORS 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (handleOptionsRequest(req, res)) return;

  console.log("API 호출됨:", req.method, req.url);
  console.log(
    "Supabase 설정:",
    !!process.env.SUPABASE_URL,
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // GET 요청 - 챌린지 조회
  if (req.method === "GET") {
    const { type, id } = req.query;
    console.log("GET 요청 파라미터:", { type, id });

    try {
      // 특정 챌린지 상세 조회
      if (id) {
        console.log("ID로 챌린지 조회:", id);
        const { data, error } = await supabase
          .from("challenges")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("ID 조회 오류:", error);
          throw error;
        }
        return res.status(200).json(data);
      }

      // 타입에 따른 챌린지 조회
      switch (type) {
        // 인기 챌린지 조회 - Fallen 상태가 아닌 모든 챌린지
        case "popular":
          console.log("인기 챌린지 조회 시작");
          const { data: popularData, error: popularError } = await supabase
            .from("challenges")
            .select("*")
            .neq("status", "Fallen")
            .order("likes", { ascending: false })
            .limit(5);

          if (popularError) {
            console.error("인기 챌린지 조회 오류:", popularError);
            throw popularError;
          }
          console.log("인기 챌린지 조회 결과:", popularData?.length || 0);
          return res.status(200).json(popularData);

        // 실패한 챌린지 조회
        case "fallen":
          console.log("실패한 챌린지 조회 시작");
          const { data: fallenData, error: fallenError } = await supabase
            .from("challenges")
            .select("*")
            .eq("status", "Fallen")
            .order("created_at", { ascending: false })
            .limit(5); // 최대 5개까지 제한 추가

          if (fallenError) {
            console.error("실패한 챌린지 조회 오류:", fallenError);
            throw fallenError;
          }
          console.log("실패한 챌린지 조회 결과:", fallenData?.length || 0);
          return res.status(200).json(fallenData);

        // 오늘의 챌린지 조회 - 좋아요가 가장 많은 도전
        case "today":
          console.log("오늘의 챌린지(가장 인기있는 챌린지) 조회 시작");

          // 좋아요가 가장 많은 챌린지를 오늘의 챌린지로 선택
          const { data: mostLikedData, error: mostLikedError } = await supabase
            .from("challenges")
            .select("*")
            .neq("status", "Fallen")
            .order("likes", { ascending: false })
            .limit(1);

          if (mostLikedError) {
            console.error("가장 인기있는 챌린지 조회 오류:", mostLikedError);
            throw mostLikedError;
          }

          if (mostLikedData.length === 0) {
            console.log("인기있는 챌린지가 없음, 최근 챌린지 조회");
            const { data: recentData, error: recentError } = await supabase
              .from("challenges")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(1);

            if (recentError) {
              console.error("최근 챌린지 조회 오류:", recentError);
              throw recentError;
            }
            console.log("최근 챌린지:", recentData[0]?.id || "없음");
            return res.status(200).json(recentData[0] || null);
          } else {
            console.log(
              "선택된 가장 인기있는 챌린지:",
              mostLikedData[0]?.id || "없음"
            );
            return res.status(200).json(mostLikedData[0]);
          }

        // 기본: 모든 챌린지 조회 (최신순으로 정렬)
        default:
          console.log("모든 챌린지 조회 시작");
          const { data: allData, error: allError } = await supabase
            .from("challenges")
            .select("*")
            .order("created_at", { ascending: false });

          if (allError) {
            console.error("모든 챌린지 조회 오류:", allError);
            throw allError;
          }
          console.log("모든 챌린지 조회 결과:", allData?.length || 0);
          return res.status(200).json(allData);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
      return res.status(500).json({
        error: "Error occurred while fetching challenges.",
        detail: error.message,
      });
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
          error: "Missing required fields",
          detail: "name, email, title are required fields.",
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
            error: "Invalid image format",
            detail: "Images must be a valid array or JSON string.",
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
          error: "Missing required field: images",
          detail: "At least one image is required.",
        });
      }

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
          error: "Challenge creation error",
          detail: error.message,
          code: error.code,
        });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({
        error: "Internal server error",
        detail: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not supported." });
  }
}
