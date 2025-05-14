
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import BottomNav from "@/components/BottomNav";
import { Profile } from "@/contexts/auth/types";
import { User } from "@/types/user";
import { Review } from "@/services/task/reviews/getTaskReviews";

// Import the refactored components
import ProfileHeader from "./components/profile/ProfileHeader";
import AboutTab from "./components/profile/AboutTab";
import ServicesTab from "./components/profile/ServicesTab";
import ReviewsTab from "./components/profile/ReviewsTab";
import ProfileForm from "./components/profile/ProfileForm";
import ProfileLoading from "./components/profile/ProfileLoading";
import { useProfileData } from "@/hooks/profile";

const PersonalInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    user, 
    profile, 
    loading, 
    error,
    errorMessage,
    isEditMode, 
    formData, 
    profileData, 
    setIsEditMode, 
    setFormData, 
    getUserName, 
    getBusinessName, 
    refreshProfile,
    updateProfile,
    handleRetryLoadProfile,
    uploadAvatar,
    uploadCertificate,
    addCertificate,
    removeCertificate,
    uploadingAvatar,
    uploadingCertificate
  } = useProfileData();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Create a wrapper function for updateProfile that conforms to the expected type in ProfileForm
  const handleUpdateProfile = async (data: Partial<Profile>): Promise<void> => {
    await updateProfile(data);
  };
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfile();
      toast({
        title: "Success",
        description: "Profile data refreshed",
      });
    } catch (err) {
      console.error("Failed to refresh profile:", err);
      toast({
        title: "Error",
        description: "Failed to refresh profile data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Convert profileData.reviews to the expected Review type format
  const formattedReviews: Review[] = profileData.reviews ? 
    profileData.reviews.map(review => ({
      id: review.id || "",
      task_id: review.task_id || "",
      reviewer_id: review.reviewer_id || "",
      reviewee_id: review.reviewee_id || "",
      rating: review.rating,
      feedback: review.feedback || "",
      created_at: review.created_at || "",
      is_provider_review: review.is_provider_review || false,
      reviewer: {
        id: review.reviewer_id || "",
        full_name: review.reviewer || "Anonymous",
        avatar_url: null
      },
      task: {
        title: review.task || "Task"
      }
    })) : [];

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
        {!isEditMode && !loading && !error && profile && (
          <div className="ml-auto flex gap-2">
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
      
      <div className="px-4 py-6 space-y-6">
        {loading ? (
          <ProfileLoading loadingMessage="Loading your profile information..." />
        ) : error ? (
          <ProfileLoading 
            error={true} 
            errorMessage={errorMessage || "There was a problem loading your profile data."} 
            onRetry={handleRetryLoadProfile} 
          />
        ) : !profile ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No profile information found</p>
            <Button onClick={handleRetryLoadProfile}>Create Profile</Button>
          </div>
        ) : isEditMode ? (
          <ProfileForm 
            user={user as User}
            formData={formData}
            loading={loading}
            setFormData={setFormData}
            updateProfile={handleUpdateProfile}
            setIsEditMode={setIsEditMode}
            uploadAvatar={uploadAvatar}
            uploadCertificate={uploadCertificate}
            addCertificate={addCertificate}
            removeCertificate={removeCertificate}
            uploadingAvatar={uploadingAvatar}
            uploadingCertificate={uploadingCertificate}
          />
        ) : (
          <>
            <ProfileHeader 
              profile={profile}
              profileData={profileData}
              getUserName={getUserName}
              getBusinessName={getBusinessName}
            />
            
            <Tabs defaultValue="about">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-4">
                <AboutTab 
                  profile={profile}
                  profileData={profileData}
                />
              </TabsContent>
              
              <TabsContent value="services" className="mt-4">
                <ServicesTab profile={profile} />
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-4">
                <ReviewsTab reviews={formattedReviews} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default PersonalInformation;
