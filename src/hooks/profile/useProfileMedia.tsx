
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types/user";

export const useProfileMedia = (user: User | null) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  // Upload avatar function
  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Upload certificate function
  const uploadCertificate = async (file: File, certName = "") => {
    if (!user) return null;
    
    setUploadingCertificate(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${certName.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`;
      const filePath = `certificates/${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast({
        title: "Error",
        description: "Failed to upload certificate",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingCertificate(false);
    }
  };

  return {
    uploadAvatar,
    uploadCertificate,
    uploadingAvatar,
    uploadingCertificate
  };
};
