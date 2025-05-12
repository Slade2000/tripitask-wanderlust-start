
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Briefcase, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/contexts/auth/types";

interface ProfileHeaderProps {
  profile: Profile | null;
  profileData: {
    rating: number;
    jobsCompleted: number;
    reviews: any[];
  };
  getUserName: () => string;
  getBusinessName: () => string;
}

const ProfileHeader = ({ profile, profileData, getUserName, getBusinessName }: ProfileHeaderProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Profile Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-2xl bg-gray-200">
                {profile?.full_name?.charAt(0) || getUserName().charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h2 className="text-xl font-semibold mb-1">{getUserName()}</h2>
          <p className="text-gray-500 mb-2">{getBusinessName()}</p>
          
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span>{profileData.rating} ({profileData.reviews.length} reviews)</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="text-gray-500" />
            <span>{profileData.jobsCompleted} Jobs Completed</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-gray-500" />
            <span>{profile?.location || "Location not set"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
