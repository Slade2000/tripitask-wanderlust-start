
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReactNode } from "react";

interface FiltersCardProps {
  title: string;
  children: ReactNode;
}

const FiltersCard = ({ title, children }: FiltersCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter size={18} className="mr-2" />
          {title}
        </CardTitle>
        <CardDescription>
          Set criteria for the tasks you want to be notified about
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default FiltersCard;
