import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clsx from "clsx";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  User,
} from "lucide-react";
import React, { useState } from "react";

const DetailHero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const challenge = {
    title: "30일 운동 챌린지",
    status: "In Progress",
    images: ["/placeholder.svg", "/placeholder.svg"],
    challenger: {
      name: "사용자",
      image: "/placeholder.svg",
      completedChallenges: 5,
      failedChallenges: 2,
    },
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? challenge.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === challenge.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 도전 제목 */}
        <h1 className="text-3xl font-bold mb-4 text-purple-800">
          {challenge.title}
        </h1>

        {/* 챌린지 이미지  */}
        <div className="mb-6">
          <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
            <img
              src={challenge.images[currentImageIndex] || "/placeholder.svg"}
              alt={challenge.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 right-4 bg-green-500">
              {challenge.status}
            </Badge>

            {challenge.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* 이미지 이동 */}
          {challenge.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {challenge.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={clsx(
                    "w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2",
                    currentImageIndex === index
                      ? "border-purple-500"
                      : "border-transparent"
                  )}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Reaction Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant="outline"
            className={clsx(
              "flex items-center gap-2",
              liked ? "bg-red-50 text-red-500 border-red-200" : "text-gray-500"
            )}
            onClick={handleLike}
          >
            <Heart
              size={20}
              className={clsx(liked ? "fill-purple-500 text-purple-500" : "")}
            />
            <span>{likeCount} Idiots</span>
          </Button>

          <Dialog>
            <DialogTrigger aschild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Back this Idiot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">
                  How big of an idiot supporter are you?
                </DialogTitle>
              </DialogHeader>
              {!showThankYou ? (
                <div className="space-y-4 py-4">
                  <RadioGroup
                    value={donationAmount}
                    onValueChange={setDonationAmount}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-purple-50">
                      <RadioGroupItem value="5" id="amount-5" />
                      <Label
                        htmlFor="amount-5"
                        className="flex-1 cursor-pointer"
                      >
                        $5
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-purple-50">
                      <RadioGroupItem value="10" id="amount-10" />
                      <Label
                        htmlFor="amount-10"
                        className="flex-1 cursor-pointer"
                      >
                        $10
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-purple-50">
                      <RadioGroupItem value="custom" id="amount-custom" />
                      <Label
                        htmlFor="amount-custom"
                        className="flex-1 cursor-pointer"
                      >
                        Custom Amount
                      </Label>
                    </div>
                  </RadioGroup>

                  {donationAmount === "custom" && (
                    <div className="mt-4">
                      <Label htmlFor="custom-amount">Enter Amount {$}</Label>
                      <Input
                        id="custom-amount"
                        type="number"
                        min="1"
                        placeholder="Enter support amount"
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleDonate}>Support</Button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-purple-700">
                    Thank you for your Idiot support!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for supporting this Idiot challenge to succeed.
                  </p>
                  <DialogClose asChild>
                    <Button className="mt-4">Close</Button>
                  </DialogClose>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="text-gray-500">
            <Share2 size={20} className="mr-2" />
            <span>Share</span>
          </Button>
        </div>

        {/* 도전 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <Calendar size={24} className="text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{challenge.startDate}</p>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <Calendar size={24} className="text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{challenge.endDate}</p>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <Calendar size={24} className="text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Days Left</p>
              <p className="font-medium">{challenge.daysLeft} days</p>
            </div>
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="mb-8">
          <div className="flex jusitfy-between mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium">{challenge.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${challenge.progress}%` }}
            />
          </div>
        </div>

        {/* 유저 프로필 */}
        <div className="flex items-center mb-6">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage
              src={challenge.challenger.image || "/placeholder.svg"}
              alt={challenge.challenger.name}
            />
            <AvatarFallback>
              {challenge.challenger.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold">{challenge.challenger.name}</h3>
            <p className="text-sm text-gray-500">
              Complete : {challenge.challenger.completedChallenges} | Fallen :{" "}
              {challenge.challenger.failedChallenges}
            </p>
          </div>
        </div>

        {/* 탭 화면 */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-3 text-purple-800">
                Motivation for the idiot challenge
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {challenge.motivation}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-purple-800">
                Execution Plan
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {challenge.plan}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <div className="mb-6">
              <Label htmlFor="comment" className="block mb-2">
                Leave a Comment
              </Label>
              <div className="flex gap-2">
                <Input id="comment" placeholder="Write your comment" />
                <Button>
                  <MessageCircle size={18} className="mr-2" />
                  Comment
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {challenge.comments.map((comment, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{comment.user}</span>
                        <span className="text-sm text-gray-500">
                          {comment.date}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default DetailHero;
