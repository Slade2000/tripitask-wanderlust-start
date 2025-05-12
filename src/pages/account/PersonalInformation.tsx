
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the refactored components
import ProfileHeader from "./components/profile/ProfileHeader";
import AboutTab from "./components/profile/AboutTab";
import ServicesTab from "./components/profile/ServicesTab";
import ReviewsTab from "./components/profile/ReviewsTab";
import ProfileForm from "./components/profile/ProfileForm";
import ProfileLoading from "./components/profile/ProfileLoading";
import { useProfileData } from "./components/profile/useProfileData";

const PersonalInformation = () => {
  const navigate = useNavigate();
  const { 
    user, 
    profile, 
    loading, 
    isEditMode, 
    formData, 
    profileData, 
    setIsEditMode, 
    setFormData, 
    getUserName, 
    getBusinessName, 
    refreshProfile 
  } = useProfileData();

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
        {loading ? (
          <ProfileLoading />
        ) : isEditMode ? (
          <ProfileForm 
            user={user}
            formData={formData}
            loading={loading}
            setFormData={setFormData}
            refreshProfile={refreshProfile}
            setIsEditMode={setIsEditMode}
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
                <ReviewsTab reviews={profileData.reviews} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default PersonalInformation;
