
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksTabContent } from "./TasksTabContent";

interface PostedTasksSectionProps {
  tasks: any[];
}

export const PostedTasksSection = ({ tasks }: PostedTasksSectionProps) => {
  const navigate = useNavigate();

  return (
    <>
      <h2 className="text-xl font-semibold text-teal-dark mb-3">My Posted Tasks</h2>
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="bg-white mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <TasksTabContent tasks={tasks || []} type="all" navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="open" className="mt-0">
          <TasksTabContent tasks={tasks || []} type="open" navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-0">
          <TasksTabContent tasks={tasks || []} type="in-progress" navigate={navigate} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <TasksTabContent tasks={tasks || []} type="completed" navigate={navigate} />
        </TabsContent>
      </Tabs>
    </>
  );
};
