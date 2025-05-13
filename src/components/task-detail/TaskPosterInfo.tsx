import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TaskPosterInfoProps {
  userId: string; // Changed from taskerId
  taskId: string;
}

export default function TaskPosterInfo({ 
  userId, // Changed from taskerId 
  taskId 
}: TaskPosterInfoProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPosterProfile = async () => {
      if (!userId) return; // Changed from taskerId
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId) // Changed from taskerId
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
  }, [userId]); // Changed from taskerId
  
  if (loading) {
    return <p>Loading poster info...</p>;
  }
  
  if (!profile) {
    return <p>Could not load poster info.</p>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Task Poster</h2>
      
      <div className="flex items-center space-x-4 mb-4">
        <Avatar>
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Task Poster"} />
          ) : (
            <AvatarFallback>{profile.full_name?.charAt(0) || "TP"}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="text-lg font-medium">{profile.full_name || "Task Poster"}</p>
          {profile.location && (
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {profile.about && (
          <div>
            <p className="font-medium">About</p>
            <p className="text-gray-700">{profile.about}</p>
          </div>
        )}
        
        {profile.created_at && (
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        )}
        
        <Link to={`/messages/${userId}`} className="w-full">
          <Button className="w-full bg-teal hover:bg-teal-dark">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </Link>
      </div>
    </div>
  );
}
