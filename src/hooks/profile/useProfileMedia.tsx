
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";

export const useProfileMedia = (user: User | null) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to upload an avatar",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setUploadingAvatar(true);
      
      // Create the path where we'll store the avatar
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload the file to the avatars bucket
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        toast({
          title: "Error",
          description: "Failed to upload avatar",
          variant: "destructive",
        });
        return null;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Exception uploading avatar:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCertificate = async (file: File, certName: string): Promise<string | null> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a certificate",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setUploadingCertificate(true);
      
      // Create the path where we'll store the certificate
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload the file to the certificates bucket
      const { error: uploadError, data } = await supabase.storage
        .from('certificates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error uploading certificate:", uploadError);
        toast({
          title: "Error",
          description: "Failed to upload certificate",
          variant: "destructive",
        });
        return null;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Exception uploading certificate:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingCertificate(false);
    }
  };

  return {
    uploadingAvatar,
    uploadingCertificate,
    uploadAvatar,
    uploadCertificate
  };
};
