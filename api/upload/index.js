import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";

// Supabase 클라이언트 초기화 - 서버 사이드에서만 실행됨
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Vercel에서 bodyParser 비활성화를 위한 설정
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Base64 이미지를 위한 크기 제한 설정
    },
  },
};

// Base64 데이터에서 MIME 타입과 데이터 추출
const parseBase64Image = (base64String) => {
  try {
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 string");
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");

    // MIME 타입에서 파일 확장자 결정
    let extension = "jpg";
    if (mimeType === "image/png") extension = "png";
    if (mimeType === "image/gif") extension = "gif";
    if (mimeType === "image/webp") extension = "webp";

    return { mimeType, buffer, extension };
  } catch (error) {
    console.error("Base64 parsing error:", error);
    throw error;
  }
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

  // 요청에 Content-Type 확인
  const contentType = req.headers["content-type"] || "";

  try {
    // 이미지 URL 저장 배열
    const imageUrls = [];

    // JSON 요청 처리 (Base64 이미지)
    if (contentType.includes("application/json")) {
      console.log("Processing JSON/Base64 request");

      // bodyParser 활성화가 필요합니다 (config에서 설정)
      const { images } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          error: "No base64 images provided",
          detail:
            "Request should contain an 'images' array with base64 strings",
        });
      }

      console.log(`Processing ${images.length} base64 images`);

      // 각 Base64 이미지 처리
      for (let i = 0; i < images.length; i++) {
        try {
          const base64Image = images[i];

          // Base64 유효성 검사
          if (
            !base64Image ||
            typeof base64Image !== "string" ||
            !base64Image.startsWith("data:image/")
          ) {
            console.warn(`Skipping invalid base64 image at index ${i}`);
            continue;
          }

          // Base64 파싱
          const { mimeType, buffer, extension } = parseBase64Image(base64Image);

          // 타임스탬프를 사용하여 고유한 파일 이름 생성
          const timestamp = Date.now();
          const filename = `${timestamp}-${Math.random()
            .toString(36)
            .substring(2, 10)}.${extension}`;

          // Supabase에 업로드
          const { data, error } = await supabase.storage
            .from("idoit-image")
            .upload(`challenges/${filename}`, buffer, {
              contentType: mimeType,
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error(`Base64 image ${i + 1} upload error:`, error);
            continue;
          }

          // 공개 URL 생성
          const { data: urlData } = supabase.storage
            .from("idoit-image")
            .getPublicUrl(`challenges/${filename}`);

          if (urlData && urlData.publicUrl) {
            imageUrls.push(urlData.publicUrl);
          }
        } catch (imgError) {
          console.error(`Error processing base64 image ${i + 1}:`, imgError);
          // 개별 이미지 오류는 무시하고 계속 진행
        }
      }
    }
    // FormData 요청 처리 (일반 파일 업로드)
    else if (contentType.includes("multipart/form-data")) {
      console.log("Processing FormData request");

      // Formidable 설정 - 다중 파일 업로드 지원
      const form = new formidable.IncomingForm({
        multiples: true, // 다중 파일 업로드 활성화
        keepExtensions: true, // 파일 확장자 유지
        maxFileSize: 5 * 1024 * 1024, // 최대 파일 크기 5MB
      });

      const parseForm = () =>
        new Promise((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) {
              console.error("Form parsing error:", err);
              return reject(err);
            }
            resolve({ fields, files });
          });
        });

      try {
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
        // 여러 'file[i]' 필드로 여러 파일이 업로드된 경우
        else {
          fileList = Object.values(files);
        }

        console.log(`Processing ${fileList.length} files`);

        if (fileList.length === 0) {
          return res.status(400).json({ error: "No files uploaded" });
        }

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

            // 파일 읽기 - fs 모듈 대신 file.path 사용
            let fileBuffer;
            try {
              // Vercel 환경에서는 fs 모듈 사용 제한이 있을 수 있음
              // file.filepath 또는 file.path에 직접 접근
              const fs = require("fs");
              fileBuffer = fs.readFileSync(file.filepath || file.path);
            } catch (fsError) {
              console.error("File reading error:", fsError);
              // 이 파일은 건너뛰고 다음 처리
              continue;
            }

            // 타임스탬프를 사용하여 고유한 파일 이름 생성
            const timestamp = Date.now();
            const safeFilename = originalFilename.replace(/[^a-zA-Z0-9]/g, "_");
            const filename = `${timestamp}-${Math.random()
              .toString(36)
              .substring(2, 10)}-${safeFilename}`;

            // Supabase에 업로드
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

            // 임시 파일 삭제 시도
            try {
              const fs = require("fs");
              fs.unlinkSync(file.filepath || file.path);
            } catch (unlinkError) {
              // 파일 삭제 실패는 무시
              console.warn("Failed to delete temp file:", unlinkError);
            }
          } catch (fileError) {
            console.error(
              `Error processing file ${file.originalFilename}:`,
              fileError
            );
            // 개별 파일 오류는 무시하고 다음 파일 처리
          }
        }
      } catch (formError) {
        console.error("FormData processing error:", formError);
        return res.status(500).json({
          error: "Failed to process form data",
          detail: formError.message,
        });
      }
    } else {
      // 지원되지 않는 Content-Type
      return res.status(400).json({
        error: "Unsupported Content-Type",
        detail: `Expected 'multipart/form-data' or 'application/json', got '${contentType}'`,
      });
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
    return res.status(500).json({
      error: "Internal server error",
      detail: error.message,
    });
  }
}
