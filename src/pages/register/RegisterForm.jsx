import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import clsx from "clsx";
import { Loader2, Upload } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("photo");
  const [thumbnail, setThumbnail] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);

  // 천 단위 쉼표 포맷팅 함수
  const formatMoney = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 이미지 업로드 처리
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnail(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Supabase 스토리지에 이미지 업로드
  const uploadImageToSupabase = async (file) => {
    try {
      const filename = `${Date.now()}-${file.name}`;
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.url; // 업로드된 이미지 URL 반환
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
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
    setIsSubmitting(true);

    try {
      if (!imageFile) {
        toast.error("최소 하나의 이미지를 업로드해주세요.");
        setIsSubmitting(false);
        return;
      }

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
          // 이미지 업로드
          const imageUrl = await uploadImageToSupabase(imageFile);
          challengeData.images = JSON.stringify([imageUrl]);

          // API 호출하여 챌린지 생성
          const response = await fetch(
            `${import.meta.env.VITE_BASE_URL}/api/challenges`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(challengeData),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to create challenge");
          }

          const result = await response.json();

          // 성공 후 메인 화면으로 이동
          setTimeout(() => {
            navigate("/");
          }, 1000);

          return result;
        },
        {
          loading: "챌린지를 생성하는 중...",
          success: "챌린지가 성공적으로 생성되었습니다!",
          error: "챌린지 생성에 실패했습니다. 다시 시도해주세요.",
        }
      );
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("챌린지 생성에 실패했습니다. 다시 시도해주세요.");
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
        {/* 도전 제목 */}
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

        {/* 도전 내용 */}
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

        {/* 실행 계획 */}
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

        {/* 인증 방법 */}
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

        {/* 사진 제출 */}
        <div className="space-y-2">
          <Label htmlFor="user_photo" className="text-lg font-medium">
            Photo
          </Label>
          <div className="text-sm font-normal text-gray-500 -mt-2">
            (Add a photo to boost the credibility of your challenge. At least
            one image is required.)
          </div>
          <div
            className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center cursor-pointer hover:bg-purple-50 transition-colors"
            onClick={() => document.getElementById("user_photo")?.click()}
          >
            {thumbnail ? (
              <div className="relative h-48 w-full">
                <img
                  src={thumbnail}
                  alt="Thumbnail Preview"
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center text-gray-500">
                <Upload size={40} className="mb-2 text-purple-400" />
                <p>Upload an image</p>
                <p className="text-sm">(Click to select a file)</p>
              </div>
            )}
            <input
              type="file"
              id="user_photo"
              name="user_photo"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              required
            />
          </div>
        </div>

        {/* 희망 후원 금액 */}
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
          {donationAmount > 0 && (
            <div className="text-sm text-purple-600 font-medium">
              Displayed as: ${formatMoney(donationAmount)}
            </div>
          )}
        </div>

        {/* 유저 이름 */}
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

        {/* 유저 이메일 */}
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

        {/* 제출 버튼 */}
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
