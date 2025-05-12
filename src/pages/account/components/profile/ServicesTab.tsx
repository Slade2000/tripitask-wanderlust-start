
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/contexts/auth/types";

interface ServicesTabProps {
  profile: Profile | null;
}

const ServicesTab = ({ profile }: ServicesTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Services Provided</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {profile?.services && profile.services.length > 0 ? (
            profile.services.map((service, index) => (
              <Badge key={index} variant="secondary">
                {service}
              </Badge>
            ))
          ) : (
            <p className="text-gray-500">No services added yet. Click Edit to add your services.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesTab;
