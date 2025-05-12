
import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/contexts/auth/types";

interface AboutTabProps {
  profile: Profile | null;
  profileData: {
    certifications: Array<{
      name: string;
      verified: boolean;
    }>;
  };
}

const AboutTab = ({ profile, profileData }: AboutTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>About Me</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{profile?.about || "No information provided yet. Click Edit to add your bio."}</p>
        
        <div className="mt-6">
          <h3 className="font-medium mb-3">Certifications & Qualifications</h3>
          <div className="space-y-2">
            {profileData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <Award size={16} className="text-primary" />
                <span>{cert.name}</span>
                {cert.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Verified</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutTab;
