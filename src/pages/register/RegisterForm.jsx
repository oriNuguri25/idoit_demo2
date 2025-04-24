import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "@/components/ImageUploader";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("photo");
  const [donationAmount, setDonationAmount] = useState(0);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageError, setImageError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  // API URL 설정
  const apiUrl = import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://idoitproto.vercel.app";

  // 천 단위 쉼표 포맷팅 함수
  const formatMoney = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 이미지 업로드 처리
  const onFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...imageFiles];
    const newPreviewUrls = [...imagePreviewUrls];

    files.forEach((file) => {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image size must be less than 5MB.");
        return;
      }

      // 최대 5개 이미지로 제한
      if (newFiles.length < 5) {
        newFiles.push(file);

        // 미리보기 URL 생성
        const reader = new FileReader();
        reader.onload = () => {
          newPreviewUrls.push(reader.result);
          setImagePreviewUrls([...newPreviewUrls]);
        };
        reader.readAsDataURL(file);
      } else {
        setImageError("You can upload maximum 5 images.");
      }
    });

    setImageFiles(newFiles);
    setImageError(
      newFiles.length === 0 ? "Please upload at least one image." : ""
    );
  };

  // 이미지 제거 처리
  const handleRemoveImage = (index) => {
    const newFiles = [...imageFiles];
    const newPreviewUrls = [...imagePreviewUrls];

    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviewUrls(newPreviewUrls);
    setImageError(
      newFiles.length === 0 ? "Please upload at least one image." : ""
    );
  };

  // 이미지를 Base64로 변환
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // API를 통한 이미지 업로드 (Base64 방식)
  const uploadImagesAsBase64 = async (files) => {
    try {
      // 이미지를 Base64로 변환
      const base64Images = await Promise.all(
        files.map((file) => convertImageToBase64(file))
      );

      // 이미지 업로드 API 호출
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: base64Images,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      // 업로드된 이미지 URL 반환
      if (result.success && result.data && result.data.imageUrls) {
        return result.data.imageUrls;
      } else if (result.url) {
        // 단일 이미지 URL 경우 (challenges/upload API 대응)
        return [result.url];
      }

      throw new Error("No image URLs returned from server");
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  };

  // API를 통한 이미지 업로드 (FormData 방식)
  const uploadImagesAsFormData = async (files) => {
    try {
      const urls = [];

      // 각 파일을 개별적으로 업로드
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${apiUrl}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const result = await response.json();
        if (result.url) {
          urls.push(result.url);
        }
      }

      return urls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  };

  // 이미지 업로드 - 다양한 API 형식 지원
  const uploadImages = async (files) => {
    try {
      // 먼저 FormData 방식으로 시도
      return await uploadImagesAsFormData(files);
    } catch (error) {
      console.log("FormData upload failed, trying Base64 method...");
      // 실패하면 Base64 방식으로 시도
      return await uploadImagesAsBase64(files);
    }
  };

  // 금액 입력 처리
  const handleMoneyChange = (e) => {
    const value = parseInt(e.target.value || 0);
    setDonationAmount(value);
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // 이미지 validation
    if (imageFiles.length === 0) {
      setImageError("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 폼 데이터 수집
      const formData = new FormData(e.target);
      const challengeData = {
        name: formData.get("user_name"),
        email: formData.get("user_email"),
        title: formData.get("title"),
        motivation: formData.get("motivation"),
        plan: formData.get("plan"),
        status: "In Progress",
        progress: 0,
        likes: 0,
        money: donationAmount,
      };

      toast.promise(
        async () => {
          try {
            // 모든 이미지 업로드
            console.log("Uploading images...");
            const imageUrls = await uploadImages(imageFiles);
            console.log("Image upload successful:", imageUrls);

            // 이미지 URL을 챌린지 데이터에 추가
            challengeData.images = imageUrls;

            console.log(`Challenge creation URL: ${apiUrl}/api/challenges`);
            console.log("Challenge data:", challengeData);

            // API 호출하여 챌린지 생성
            const response = await fetch(`${apiUrl}/api/challenges`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(challengeData),
            });

            const responseData = await response.json();

            // 응답 검증
            if (!response.ok) {
              console.error("Challenge creation error:", responseData);
              let errorMessage = "Failed to create challenge";

              if (responseData.error) {
                errorMessage = responseData.error;
                if (responseData.detail) {
                  errorMessage += `: ${responseData.detail}`;
                }
              }

              throw new Error(errorMessage);
            }

            console.log("Challenge created successfully:", responseData);

            // 성공 후 메인 화면으로 이동
            setTimeout(() => {
              navigate("/");
            }, 1000);

            return responseData;
          } catch (innerError) {
            console.error("Error in challenge creation flow:", innerError);
            throw innerError;
          }
        },
        {
          loading: "Creating challenge...",
          success: "Challenge created successfully!",
          error: (err) => `${err.message || "Failed to create challenge"}`,
        }
      );
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error(`Failed to create challenge: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-purple-800">
        Create Idiot Challenge
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-6 rounded-xl shadow-md"
      >
        {/* Challenge Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-lg font-medium">
            Challenge Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter idiot challenge title"
            className="border-purple-200 focus:border-purple-400"
            required
          />
        </div>

        {/* Challenge Motivation */}
        <div className="space-y-2">
          <Label htmlFor="motivation" className="text-lg font-medium">
            Motivation for the idiot challenge
          </Label>
          <div className="text-sm font-normal text-gray-500 -mt-2">
            (It helps your idiot challenge leave a mark on the other idiots who
            support you.)
          </div>
          <Textarea
            id="motivation"
            name="motivation"
            placeholder="What's the story behind your idiot challenge?"
            className="min-h-[100px] border-purple-200 focus:border-purple-400"
            required
          />
        </div>

        {/* Execution Plan */}
        <div className="space-y-2">
          <Label htmlFor="plan" className="text-lg font-medium">
            Execution Plan
          </Label>
          <div className="text-sm font-normal text-gray-500 -mt-2">
            (The more detailed your plan, the more complete your idiot challenge
            feels.)
          </div>
          <Textarea
            id="plan"
            name="plan"
            placeholder="The better the plan, the better the chaos."
            required
          />
        </div>

        {/* Verification Method */}
        <div className="space-y-2">
          <Label className="text-lg font-medium">Verification Method</Label>
          <RadioGroup
            value={verificationMethod}
            onValueChange={setVerificationMethod}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div
              className={clsx(
                "flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors",
                verificationMethod === "photo"
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-200 hover:border-purple-200"
              )}
            >
              <RadioGroupItem value="photo" id="photo" />
              <Label htmlFor="photo" className="cursor-pointer">
                Photo
              </Label>
            </div>
            <div
              className={clsx(
                "flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors",
                verificationMethod === "video"
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-200 hover:border-purple-200"
              )}
            >
              <RadioGroupItem value="video" id="video" />
              <Label htmlFor="video" className="cursor-pointer">
                Video
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Multi Image Uploader */}
        <ImageUploader
          fileInputRef={fileInputRef}
          imagePreviewUrls={imagePreviewUrls}
          handleRemoveImage={handleRemoveImage}
          onFileSelect={onFileSelect}
          formSubmitted={formSubmitted}
          imageError={imageError}
        />

        {/* Desired Donation Amount */}
        <div className="space-y-2">
          <Label htmlFor="money" className="text-lg font-medium">
            Desired Donation Amount
          </Label>
          <div className="text-sm font-normal text-gray-500 -mt-2">
            (Set the amount you wish to receive as support for your challenge)
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              id="money"
              name="money"
              type="number"
              min="0"
              placeholder="Enter desired amount"
              className="border-purple-200 focus:border-purple-400 pl-8"
              defaultValue="0"
              onChange={handleMoneyChange}
            />
          </div>
        </div>

        {/* User Name */}
        <div className="space-y-2">
          <Label htmlFor="user_name" className="text-lg font-medium">
            Your Name
          </Label>
          <Input
            id="user_name"
            name="user_name"
            placeholder="Enter your name"
            className="border-purple-200 focus:border-purple-400"
            required
          />
        </div>

        {/* User Email */}
        <div className="space-y-2">
          <Label htmlFor="user_email" className="text-lg font-medium">
            Your Email Address
          </Label>
          <Input
            id="user_email"
            name="user_email"
            type="email"
            placeholder="Enter your email address"
            className="border-purple-200 focus:border-purple-400"
            required
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-6 text-lg font-bold rounded-xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Being an Idiot...
            </>
          ) : (
            "Start My Idiot Challenge"
          )}
        </Button>
      </form>
    </main>
  );
};

export default RegisterForm;
