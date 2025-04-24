import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";

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
    // Formidable 설정 - 다중 파일 업로드 지원
    const form = new formidable.IncomingForm({
      multiples: true, // 다중 파일 업로드 활성화
      keepExtensions: true, // 파일 확장자 유지
      maxFileSize: 5 * 1024 * 1024, // 최대 파일 크기 5MB
    });

    const parseForm = () =>
      new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

    // 폼 파싱
    const { files } = await parseForm();
    console.log("Received files:", Object.keys(files));

    // files는 객체일 수도 있고 배열일 수도 있음
    let fileList = [];

    // 단일 'file' 필드로 여러 파일이 업로드된 경우
    if (files.file && Array.isArray(files.file)) {
      fileList = files.file;
    }
    // 단일 'file' 필드로 단일 파일이 업로드된 경우
    else if (files.file) {
      fileList = [files.file];
    }
    // 여러 'file[i]' 필드로 여러 파일이 업로드된 경우 (FormData를 수동으로 구성한 경우)
    else {
      fileList = Object.values(files);
    }

    console.log(`Processing ${fileList.length} files`);

    if (fileList.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // 이미지 URL 저장 배열
    const imageUrls = [];

    // 모든 파일 처리
    for (const file of fileList) {
      try {
        // 파일 확장자 확인
        const originalFilename = file.originalFilename || "image";
        const fileExt = originalFilename.split(".").pop().toLowerCase();
        const allowedExts = ["jpg", "jpeg", "png", "gif", "webp"];

        if (!allowedExts.includes(fileExt)) {
          console.warn(`Skipping file with invalid extension: ${fileExt}`);
          continue;
        }

        // 파일 읽기
        const fileBuffer = fs.readFileSync(file.filepath);

        // 타임스탬프를 사용하여 고유한 파일 이름 생성
        const timestamp = Date.now();
        const safeFilename = originalFilename.replace(/[^a-zA-Z0-9]/g, "_");
        const filename = `${timestamp}-${Math.random()
          .toString(36)
          .substring(2, 10)}-${safeFilename}`;

        const { data, error } = await supabase.storage
          .from("idoit-image")
          .upload(`challenges/${filename}`, fileBuffer, {
            contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Supabase upload error:", error);
          continue; // 이 파일은 건너뛰고 다음 파일 처리
        }

        // 공개 URL 생성
        const { data: urlData } = supabase.storage
          .from("idoit-image")
          .getPublicUrl(`challenges/${filename}`);

        if (urlData && urlData.publicUrl) {
          imageUrls.push(urlData.publicUrl);
        }

        // 임시 파일 삭제
        fs.unlinkSync(file.filepath);
      } catch (fileError) {
        console.error(
          `Error processing file ${file.originalFilename}:`,
          fileError
        );
        // 개별 파일 오류는 무시하고 다음 파일 처리
      }
    }

    // 응답
    if (imageUrls.length === 0) {
      return res.status(500).json({ error: "Failed to upload any images" });
    }

    // 단일 이미지와 다중 이미지 모두 처리할 수 있도록 응답 형식 통일
    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${imageUrls.length} images`,
      data: {
        imageUrls: imageUrls,
      },
      // 기존 코드와의 호환성을 위해 단일 이미지 URL도 포함
      url: imageUrls[0],
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
