
import { Card, CardContent } from "@/components/ui/card";
import { Profile } from "@/contexts/auth/types";
import { ProfileDataState } from "@/hooks/useProfileData";
import { CheckCircle } from "lucide-react";

interface AboutTabProps {
  profile: Profile | null;
  profileData: ProfileDataState;
}

const AboutTab = ({ profile, profileData }: AboutTabProps) => {
  // Combine certifications from profile and profileData, preferring profile if available
  const certifications = profile?.certifications || profileData.certifications || [];
  
  return (
    <div className="space-y-6">
      {profile?.about && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg mb-2">About</h3>
            <p className="text-gray-700">{profile.about}</p>
          </CardContent>
        </Card>
      )}
      
      {profile?.services && profile.services.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg mb-2">Services</h3>
            <div className="flex flex-wrap gap-2">
              {profile.services.map((service, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {service}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {profile?.location && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg mb-2">Location</h3>
            <p className="text-gray-700">{profile.location}</p>
          </CardContent>
        </Card>
      )}
      
      {profile?.trade_registry_number && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg mb-2">Trade Registry Number</h3>
            <p className="text-gray-700">{profile.trade_registry_number}</p>
          </CardContent>
        </Card>
      )}
      
      {certifications.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg mb-2">Certifications & Qualifications</h3>
            <div className="space-y-2">
              {certifications.map((cert, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <span>{cert.name}</span>
                    {cert.verified && (
                      <CheckCircle size={16} className="ml-2 text-green-500" />
                    )}
                  </div>
                  {cert.file_url && (
                    <a 
                      href={cert.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600"
                    >
                      View Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AboutTab;
