import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";
import React from "react";

const RegisterForm = () => {
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
            <span className="text-sm font-normal text-gray-500 ml-2">
              (It helps your idiot challenge leave a mark on the other idiots
              who support you.)
            </span>
          </Label>
          <Textarea
            id="motivation"
            name="motivation"
            placeholder="What’s the story behind your idiot challenge?"
            className="min-h-[100px] border-purple-200 focus:border-purple-400"
            required
          />
        </div>

        {/* 실행 계획 */}
        <div className="space-y-2">
          <Label htmlFor="plan" className="text-lg font-medium">
            Execution Plan
            <span className="text-sm font-normal text-gray-500 ml-2">
              The more detailed your plan, the more complete your idiot
              challenge feels.
            </span>
          </Label>
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
              className={clsx(`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors",
                  verificationMethod === "photo"
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 hover:border-purple-200",`)}
            >
              <RadioGroupItem value="photo" id="photo" />
              <Label htmlFor="photo" className="cursor-pointer">
                Photo
              </Label>
            </div>
            <div
              className={clsx(`"flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors",
                  verificationMethod === "video"
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 hover:border-purple-200",`)}
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
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Add a photo to boost the credibility of your challenge)
            </span>
          </Label>
          <p className="text-sm font-normal text-gray-500">
            At least one image is required.
          </p>
          <div
            className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center cursor-pointer hover:bg-purple-50 transition-colors"
            onClick={() => document.getElementById("thumbnail")?.click()}
          >
            {thumbnail ? (
              <div className="relative h-48 w-full">
                <img
                  src={thumbnail || "/placeholder.svg"}
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
