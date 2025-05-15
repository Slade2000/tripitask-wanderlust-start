
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile } from "@/contexts/auth/types";
import { ProfileDataState } from "@/hooks/profile";
import AboutTab from "../profile/AboutTab";
import ServicesTab from "../profile/ServicesTab";
import ReviewsTab from "../profile/ReviewsTab";
import { Review } from "@/services/task/reviews/getTaskReviews";

interface ProfileTabsProps {
  profile: Profile;
  profileData: ProfileDataState;
}

const ProfileTabs = ({ profile, profileData }: ProfileTabsProps) => {
  // Convert profileData.reviews to the expected Review type format
  const formattedReviews: Review[] = profileData.reviews ? 
    profileData.reviews.map(review => ({
      id: review.id || crypto.randomUUID(),
      task_id: review.task_id || "",
      reviewer_id: review.reviewer_id || "",
      reviewee_id: review.reviewee_id || "",
      rating: review.rating,
      feedback: review.feedback || "",
      created_at: review.created_at || new Date().toISOString(),
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
  );
};

export default ProfileTabs;
