
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ContactUs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing again
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all fields");
      return;
    }
    
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      // Store the contact message in the database - with updated type cast
      const { error } = await supabase
        .from('contact_messages' as any)
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            user_id: user?.id || null
          }
        ]);
        
      if (error) {
        console.error("Database error:", error);
        throw new Error("Failed to save your message to our database");
      }
      
      // Call an edge function to send the email
      const { data, error: emailError } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          recipient: "info@tripitask.com"
        }
      });
      
      if (emailError) {
        console.error("Email sending error:", emailError);
        throw new Error(emailError.message || "Failed to send your message via email");
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      console.log("Contact form response:", data);
      toast.success("Your message has been sent! We'll get back to you soon.");
      setFormData({...formData, message: ""});
    } catch (error) {
      console.error("Error sending contact form:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to send your message. Please try again later.";
      
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/account")}
          className="mr-2"
        >
          <ArrowLeft size={22} />
        </Button>
        <h1 className="text-xl font-semibold">Contact Us</h1>
      </div>
      
      <div className="px-4 py-6">
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-6">
              Have a question or feedback? We'd love to hear from you! Fill out the form below and our team will get back to you as soon as possible.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="What would you like to tell us?"
                  rows={5}
                  required
                  className="min-h-[120px]"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default ContactUs;
