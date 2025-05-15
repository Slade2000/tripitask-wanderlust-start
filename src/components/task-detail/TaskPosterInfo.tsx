
import { User, Star, Calendar, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export interface TaskPosterInfoProps {
  userId: string;
  taskId: string;
  name?: string;
  rating?: number;
  memberSince?: string;
  location?: string;
  avatar?: string;
}

export default function TaskPosterInfo({
  userId,
  taskId,
  name = "Unknown User",
  rating,
  memberSince,
  location,
  avatar,
}: TaskPosterInfoProps) {
  // Format rating to 1 decimal place if needed
  const formattedRating = rating ? rating.toFixed(1) : "New";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{name}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{formattedRating}</span>
            </div>
          </div>
        </div>

        {(memberSince || location) && (
          <div className="space-y-2 mb-4">
            {memberSince && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Member since {memberSince}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{location}</span>
              </div>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            // Navigation to user profile
            window.location.href = `/profile/${userId}`;
          }}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
