
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MyJobs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-teal">TripiTask</h1>
        <Button variant="outline" onClick={() => navigate("/welcome-after-login")}>
          Back
        </Button>
      </header>
      
      <div className="text-center my-20">
        <h2 className="text-2xl font-bold text-teal-dark mb-4">
          My Jobs
        </h2>
        <p className="text-teal-dark">
          This is where users will be able to view their posted tasks and jobs they've applied for.
          Implementation coming soon.
        </p>
      </div>
    </div>
  );
};

export default MyJobs;
