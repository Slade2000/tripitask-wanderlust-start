
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useProfileData } from "@/hooks/profile";
import ProfileHeader from "../profile/ProfileHeader";
import ProfileForm from "../profile/ProfileForm";
import ProfileLoading from "../profile/ProfileLoading";
import ProfileTabs from "./ProfileTabs";

const PersonalInformationPage = () => {
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
    uploadAvatar,
    uploadCertificate,
    addCertificate,
    removeCertificate,
    uploadingAvatar,
    uploadingCertificate,
    handleRetryLoadProfile
  } = useProfileData();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfile();
      toast.success("Profile data refreshed");
    } catch (err) {
      console.error("Failed to refresh profile:", err);
      toast.error("Failed to refresh profile data");
    } finally {
      setIsRefreshing(false);
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
            user={user}
            formData={formData}
            loading={loading}
            setFormData={setFormData}
            updateProfile={updateProfile}
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
            
            <ProfileTabs 
              profile={profile} 
              profileData={profileData} 
            />
          </>
        )}
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default PersonalInformationPage;
