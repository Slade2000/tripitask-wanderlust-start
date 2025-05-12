
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Star, MapPin, Award, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const PersonalInformation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    business_name: "",
    about: "",
    location: "",
    services: "",
    avatar_url: ""
  });
  
  // Mock data that would eventually come from the database
  const [profileData, setProfileData] = useState({
    rating: 4.9,
    jobsCompleted: 23,
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

  useEffect(() => {
    console.log("PersonalInformation mounted, current user:", user?.id);
    console.log("Current profile data:", profile);
    
    setProfileLoading(true);
    
    // Enhanced initial profile fetch
    const fetchInitialProfile = async () => {
      if (user && !profile) {
        console.log("No profile data yet, manually refreshing...");
        await refreshProfile();
      }
      setProfileLoading(false);
    };
    
    fetchInitialProfile();
  }, [user, refreshProfile]);

  useEffect(() => {
    // Load the most recent profile data whenever the component mounts or profile changes
    if (profile) {
      console.log("Loading profile data into form:", profile);
      
      setFormData({
        full_name: profile.full_name || "",
        business_name: profile.business_name || "",
        about: profile.about || "",
        location: profile.location || "",
        services: profile.services?.join(", ") || "",
        avatar_url: profile.avatar_url || ""
      });
      
      // Update mock data with real data where available
      setProfileData(prev => ({
        ...prev,
        rating: profile.rating !== null ? profile.rating : prev.rating,
        jobsCompleted: profile.jobs_completed !== null ? profile.jobs_completed : prev.jobsCompleted
      }));
      
      setProfileLoading(false);
    }
  }, [profile]);
  
  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setLoading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase
        .storage
        .from('profiles')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      // Update form data
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: "Image uploaded",
        description: "Your profile picture has been updated."
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Save profile updates to database
  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Parse services from comma-separated string to array
      const servicesArray = formData.services.split(',')
        .map(service => service.trim())
        .filter(service => service !== '');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          business_name: formData.business_name,
          about: formData.about,
          location: formData.location,
          services: servicesArray,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      setIsEditMode(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user's name with fallbacks
  const getUserName = () => {
    // Try profile full_name first
    if (profile?.full_name) return profile.full_name;
    
    // Try combining first and last name from profile
    if (profile?.first_name) {
      return `${profile.first_name} ${profile.last_name || ''}`.trim();
    }
    
    // Try user metadata
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.first_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim();
    }
    
    // Try email as last resort
    if (user?.email) return user.email.split('@')[0];
    
    // Final fallback
    return "Your Name";
  };

  const getBusinessName = () => {
    return profile?.business_name || "Your Business";
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
        {!isEditMode && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setIsEditMode(true)}
            className="ml-auto"
          >
            Edit
          </Button>
        )}
      </div>
      
      <div className="px-4 py-6 space-y-6">
        {profileLoading ? (
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <Progress value={45} className="w-full h-1" />
                <p className="text-sm text-gray-500">Loading profile data...</p>
              </div>
            </CardContent>
          </Card>
        ) : isEditMode ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 border-4 border-white shadow">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="text-2xl bg-gray-200">
                      {formData.full_name.charAt(0) || "U"}
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
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input 
                      id="business_name"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Sydney, NSW"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="about">About Me</Label>
                    <Textarea 
                      id="about"
                      name="about"
                      value={formData.about}
                      onChange={handleInputChange}
                      placeholder="Tell clients about your experience and skills"
                      rows={5}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="services">Services (comma separated)</Label>
                    <Input 
                      id="services"
                      name="services"
                      value={formData.services}
                      onChange={handleInputChange}
                      placeholder="e.g. Electrical, Plumbing, Maintenance"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditMode(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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
                        {profile?.full_name?.charAt(0) || getUserName().charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-1">{getUserName()}</h2>
                  <p className="text-gray-500 mb-2">{getBusinessName()}</p>
                  
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
                    <span>{profile?.location || "Location not set"}</span>
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
              </TabsContent>
              
              <TabsContent value="services" className="mt-4">
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
          </>
        )}
      </div>
    </div>
  );
};

export default PersonalInformation;
