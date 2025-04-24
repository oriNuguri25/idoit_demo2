import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";

// Supabase 클라이언트 초기화 - 서버 사이드에서만 실행됨
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Vercel에서 bodyParser 비활성화를 위한 설정
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Formidable 설정
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    const parseForm = () =>
      new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

    const { files } = await parseForm();
    const file = files.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 파일 확장자 확인
    const originalFilename = file.originalFilename || "image";
    const fileExt = originalFilename.split(".").pop().toLowerCase();
    const allowedExts = ["jpg", "jpeg", "png", "gif"];

    if (!allowedExts.includes(fileExt)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    // 파일 읽기
    const fs = require("fs");
    const fileBuffer = fs.readFileSync(file.filepath);

    // 타임스탬프를 사용하여 고유한 파일 이름 생성
    const timestamp = Date.now();
    const safeFilename = originalFilename.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${timestamp}-${safeFilename}`;

    const { data, error } = await supabase.storage
      .from("idoit-image")
      .upload(`challenges/${filename}`, fileBuffer, {
        contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    // 공개 URL 반환
    const { data: urlData } = supabase.storage
      .from("idoit-image")
      .getPublicUrl(`challenges/${filename}`);

    return res.status(200).json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
