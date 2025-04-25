import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화 - 오류 처리 추가
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 환경 변수 확인
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase 환경변수 누락:", {
    url: !!supabaseUrl,
    key: !!supabaseKey,
  });
}

// Supabase 클라이언트 초기화 (try-catch 추가)
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
  console.log("Supabase 클라이언트 초기화 성공");
} catch (error) {
  console.error("Supabase 클라이언트 초기화 실패:", error);
  // 더미 클라이언트 생성 (오류 발생 방지용)
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: { message: "Supabase 초기화 실패" },
          }),
        }),
        neq: () => ({
          order: () => ({
            limit: async () => ({
              data: [],
              error: { message: "Supabase 초기화 실패" },
            }),
          }),
        }),
        eq: () => ({
          order: async () => ({
            data: [],
            error: { message: "Supabase 초기화 실패" },
          }),
        }),
        gte: () => ({
          lt: async () => ({
            data: [],
            error: { message: "Supabase 초기화 실패" },
          }),
        }),
        order: () => ({
          limit: async () => ({
            data: [],
            error: { message: "Supabase 초기화 실패" },
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: null,
            error: { message: "Supabase 초기화 실패" },
          }),
        }),
      }),
    }),
  };
}

export { supabase };

// CORS 헤더 설정 함수
export function setCorsHeaders(res) {
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
}

// OPTIONS 요청 처리 함수
export function handleOptionsRequest(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}
