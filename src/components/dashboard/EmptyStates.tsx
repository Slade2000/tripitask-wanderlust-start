
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Component for empty tasks state
export const EmptyTasksCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-white p-6 text-center">
      <CardContent className="p-0">
        <p className="text-gray-600 mb-4">You haven't posted any tasks yet. Create one to get started!</p>
        <Button 
          onClick={() => navigate("/post-task")} 
          className="bg-teal hover:bg-teal-dark text-white"
        >
          Post a New Task
        </Button>
      </CardContent>
    </Card>
  );
};

// Component for empty state messages in tabs
export const EmptyStateCard = ({ message }: { message: string }) => {
  return (
    <Card className="bg-white p-6 text-center">
      <CardContent className="p-0">
        <p className="text-gray-600">{message}</p>
      </CardContent>
    </Card>
  );
};
