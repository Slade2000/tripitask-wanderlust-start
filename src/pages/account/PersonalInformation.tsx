
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Star, MapPin, Award, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PersonalInformation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  // Mock data that would come from the database
  const [profileData, setProfileData] = useState({
    name: profile?.full_name || "John Doe",
    businessName: "JD Services",
    rating: 4.9,
    jobsCompleted: 23,
    location: "Sydney, NSW",
    about: "Professional with over 8 years of experience across various home maintenance and repair projects. I specialize in electrical work but also offer general handyman services. Always reliable, on time, and dedicated to quality work.",
    services: ["Electrical", "Plumbing", "General Maintenance"],
    certifications: [
      { name: "Electrical License", verified: true },
      { name: "Plumbing Certificate", verified: true },
      { name: "Carpentry Qualification", verified: false },
    ],
    reviews: [
      { 
        reviewer: "Sarah M.", 
        task: "Kitchen Light Fixture Installation", 
        rating: 5, 
        feedback: "John was fantastic - arrived on time, did excellent work, and cleaned up afterward. Very professional." 
      },
      { 
        reviewer: "Michael T.", 
        task: "Bathroom Sink Repair", 
        rating: 5, 
        feedback: "Great service, fair price. Fixed my leaking sink quickly and efficiently." 
      },
      { 
        reviewer: "Rachel K.", 
        task: "Fan Installation", 
        rating: 4, 
        feedback: "Good work, just a bit delayed in arriving." 
      },
    ]
  });
  
  // Mock function for file upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Would upload to storage and update profile in a real app
      toast({
        title: "Image uploaded",
        description: "Your profile picture has been updated."
      });
    }
  };
  
  // Mock function for saving profile changes
  const handleSave = () => {
    // Would save to database in a real app
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated."
    });
    navigate("/account");
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
        <h1 className="text-xl font-semibold">Personal Information</h1>
      </div>
      
      <div className="px-4 py-6 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-white shadow">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-gray-200">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer">
                  <Upload size={16} />
                  <input 
                    id="profile-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-semibold mb-1">{profileData.name}</h2>
              <p className="text-gray-500 mb-2">{profileData.businessName}</p>
              
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span>{profileData.rating} ({profileData.reviews.length} reviews)</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-gray-500" />
                <span>{profileData.jobsCompleted} Jobs Completed</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-gray-500" />
                <span>{profileData.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="about">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profileData.about}</p>
                
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
          </TabsContent>
          
          <TabsContent value="services" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Services Provided</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileData.services.map((service, index) => (
                    <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-gray-800">
                      {service}
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="mt-4 w-full">
                  <Upload size={16} className="mr-2" /> Add More Services
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.reviews.map((review, index) => (
                  <div key={index} className="pb-4">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium">{review.reviewer}</h3>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{review.task}</p>
                    <p className="text-sm">{review.feedback}</p>
                    {index < profileData.reviews.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full" 
          onClick={handleSave}
        >
          Save Profile
        </Button>
      </div>
    </div>
  );
};

export default PersonalInformation;
