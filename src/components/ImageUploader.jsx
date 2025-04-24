import React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ImageUploader = ({
  fileInputRef,
  imagePreviewUrls,
  handleRemoveImage,
  onFileSelect,
  formSubmitted,
  imageError,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="user_photo" className="text-lg font-medium">
        Photos (Max 5)
      </Label>
      <div className="text-sm font-normal text-gray-500 -mt-2">
        (The first image will be used as the main image. At least one image is
        required.)
      </div>

      {/* 이미지 업로드 버튼 - 이제 상단에 위치 */}
      {imagePreviewUrls.length < 5 && (
        <div
          className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center cursor-pointer hover:bg-purple-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="py-8 flex flex-col items-center text-gray-500">
            <Upload size={40} className="mb-2 text-purple-400" />
            <p>Upload Images</p>
            <p className="text-sm">(Click to select files)</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
            multiple
          />
        </div>
      )}

      {/* 이미지가 5개일 때 추가 업로드 버튼 (대체 버튼) */}
      {imagePreviewUrls.length === 5 && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          onClick={() => fileInputRef.current?.click()}
        >
          Change Images
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
            multiple
          />
        </Button>
      )}

      {/* 이미지 미리보기 그리드 - 이제 업로드 버튼 아래에 위치하고 크기가 작아짐 */}
      {imagePreviewUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
          {imagePreviewUrls.map((previewUrl, index) => (
            <div key={index} className="relative h-32 w-full">
              <img
                src={previewUrl}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover rounded-lg border border-purple-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition-colors"
                aria-label="Remove image"
              >
                <X size={14} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 에러 메시지 표시 */}
      {formSubmitted && imageError && (
        <p className="text-red-500 text-sm mt-1">{imageError}</p>
      )}

      {/* 이미지 갯수 카운터 */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-500">
          {imagePreviewUrls.length}/5 images uploaded
        </span>
        {imagePreviewUrls.length > 0 && imagePreviewUrls.length < 5 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            onClick={() => fileInputRef.current?.click()}
          >
            Add More
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
