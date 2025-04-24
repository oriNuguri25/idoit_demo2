import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화 - 서버 사이드에서만 실행됨
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 환경 변수 검증
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables:", {
    url: supabaseUrl ? "Present" : "Missing",
    key: supabaseKey ? "Present" : "Missing",
  });
}

// 조건부 Supabase 클라이언트 초기화
let supabase = null;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

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

  // Supabase 클라이언트 검증
  if (!supabase) {
    return res.status(500).json({
      error: "Supabase client initialization failed",
      detail: "Server configuration error",
    });
  }

  try {
    console.log("Received challenge creation request");

    // 요청 데이터 로깅 (민감정보 제외)
    const reqBody = { ...req.body };
    if (reqBody.email) reqBody.email = "***@***"; // 이메일 가림
    console.log("Request data:", reqBody);

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
        detail: "name, email, and title are required",
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
        console.log("Using pre-formatted JSON string for images");
      } catch (jsonError) {
        console.error("Invalid JSON string for images:", jsonError);
        return res.status(400).json({
          error: "Invalid images format",
          detail: "Images should be a valid array or JSON string",
        });
      }
    }
    // images가 배열인 경우
    else if (Array.isArray(images)) {
      // 배열을 JSON 문자열로 변환
      processedImages = JSON.stringify(images);
      console.log("Converting images array to JSON string");
    }
    // images가 없거나 유효하지 않은 경우
    else if (!images) {
      console.error("Missing images field");
      return res.status(400).json({
        error: "Missing required field: images",
        detail: "At least one image is required",
      });
    }

    console.log("Processed images:", typeof processedImages);

    // 현재 날짜 및 14일 후 날짜 계산
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 14);

    // ISO 형식으로 변환 (YYYY-MM-DD)
    const startDate = currentDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

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
      end_date: formattedEndDate,
      money: money || 0,
    };

    console.log("Inserting challenge data into Supabase");

    // 데이터베이스에 챌린지 저장
    const { data, error } = await supabase
      .from("challenges")
      .insert([challengeData])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        error: "Failed to create challenge",
        detail: error.message,
        code: error.code,
      });
    }

    console.log("Challenge created successfully with ID:", data.id);
    return res.status(201).json(data);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
}
