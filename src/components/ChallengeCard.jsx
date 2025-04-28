import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { Badge } from "./ui/badge";
import { Heart } from "lucide-react";

function ChallengeCard({ challenge }) {
  const statusColors = {
    "In Progress": "bg-green-500",
    Completed: "bg-sky-500",
    Fallen: "bg-yellow-500",
  };

  // 이미지 URL 배열에서 첫 번째 이미지 추출
  const getFirstImage = (imagesJson) => {
    try {
      if (!imagesJson) return "/placeholder.svg";
      const images = JSON.parse(imagesJson);
      return images[0] || "/placeholder.svg";
    } catch (e) {
      return "/placeholder.svg";
    }
  };

  return (
    <Link to={`/challenge/detail/${challenge.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={getFirstImage(challenge.images)}
            alt={challenge.title}
            className="w-full h-full object-cover"
          />
          <Badge
            className={clsx(
              "absolute top-4 right-4",
              statusColors[challenge.status]
            )}
          >
            {challenge.status}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-1 line-clamp-1">
            {challenge.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{challenge.name}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Heart size={16} className="text-purple-400" />
              <span>{challenge.likes} Idiots</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ChallengeCard;
