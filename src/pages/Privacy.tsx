
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="mb-4 text-teal-dark">
            This is a placeholder for the Privacy Policy page. In a real application, 
            this would contain the full privacy policy.
          </p>
          
          <h2 className="text-xl font-semibold text-teal-dark mt-6 mb-3">1. Information Collection</h2>
          <p className="mb-4 text-teal-dark">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. 
            Vivamus hendrerit arcu sed erat molestie vehicula.
          </p>
          
          <h2 className="text-xl font-semibold text-teal-dark mt-6 mb-3">2. Use of Information</h2>
          <p className="mb-4 text-teal-dark">
            Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper.
          </p>
          
          <h2 className="text-xl font-semibold text-teal-dark mt-6 mb-3">3. Data Sharing</h2>
          <p className="mb-4 text-teal-dark">
            Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, 
            sem massa mattis sem, at interdum magna augue eget diam.
          </p>
        </div>
        
        <div className="text-center">
          <Button onClick={() => navigate("/")} className="bg-teal hover:bg-teal-dark">
            Back to Welcome Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
