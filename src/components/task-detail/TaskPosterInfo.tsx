
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TaskPosterInfoProps {
  userId: string;
  taskId: string;
  // Added props to match what's being passed in TaskDetailView
  name?: string;
  rating?: number;
  memberSince?: string;
  location?: string;
  avatar?: string;
}

export default function TaskPosterInfo({
  userId,
  taskId,
  // Added optional props
  name,
  rating,
  memberSince,
  location,
  avatar
}: TaskPosterInfoProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPosterProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const {
          data,
          error
        } = await supabase.from('profiles').select('*').eq('id', userId)
        .single();
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        setProfile(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosterProfile();
  }, [userId]);

  if (loading) {
    return <p>Loading poster info...</p>;
  }
  
  // Use either fetched profile or the props directly
  const displayName = profile?.full_name || name || "Task Poster";
  const displayLocation = profile?.location || location;
  const displayAvatar = profile?.avatar_url || avatar;
  
  return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Task Poster</h2>
      
      <div className="flex items-center space-x-4 mb-4">
        <Avatar>
          {displayAvatar ? 
            <AvatarImage src={displayAvatar} alt={displayName} /> : 
            <AvatarFallback>{displayName.charAt(0) || "TP"}</AvatarFallback>}
        </Avatar>
        <div>
          <p className="text-lg font-medium">{displayName}</p>
          {displayLocation && <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{displayLocation}</span>
            </div>}
        </div>
      </div>
      
      <div className="space-y-3">
        {profile?.about && <div>
            <p className="font-medium">About</p>
            <p className="text-gray-700">{profile.about}</p>
          </div>}
        
        {(profile?.created_at || memberSince) && <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Joined {new Date(profile?.created_at || memberSince).toLocaleDateString()}</span>
          </div>}
        
        <Link to={`/messages/${userId}`} className="w-full">
          
        </Link>
      </div>
    </div>;
}
