
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobsTabContent } from "./JobsTabContent";

interface WorkingOnSectionProps {
  offers: any[] | undefined;
}

export const WorkingOnSection = ({ offers }: WorkingOnSectionProps) => {
  return (
    <>
      <h2 className="text-xl font-semibold text-teal-dark mb-3">I Am Working On</h2>
      <Tabs defaultValue="active-jobs" className="mb-6">
        <TabsList className="bg-white mb-4">
          <TabsTrigger value="active-jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="offers-made">Offers Made</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active-jobs" className="mt-0">
          <JobsTabContent offers={offers} type="active-jobs" />
        </TabsContent>
        
        <TabsContent value="offers-made" className="mt-0">
          <JobsTabContent offers={offers} type="offers-made" />
        </TabsContent>
      </Tabs>
    </>
  );
};
