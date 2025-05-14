
import { useState, useCallback } from "react";
import { Certificate } from "@/contexts/auth/types";
import { useProfileMedia } from "./useProfileMedia";
import { User } from "@/types/user";

export const useCertificationManager = (
  user: User | null,
  initialCertifications: Certificate[],
  onCertificationsChange: (certifications: Certificate[]) => void
) => {
  const { uploadCertificate, uploadingCertificate } = useProfileMedia(user);

  const addCertificate = useCallback(async (name: string, file?: File) => {
    const newCert: Certificate = {
      name,
      verified: false // New certificates start as unverified
    };
    
    // If a file was provided, upload it
    if (file) {
      const fileUrl = await uploadCertificate(file, name);
      if (fileUrl) {
        newCert.file_url = fileUrl;
      }
    }
    
    // Add the new certificate to the certifications
    const updatedCerts = [...initialCertifications, newCert];
    onCertificationsChange(updatedCerts);
  }, [initialCertifications, onCertificationsChange, uploadCertificate]);

  const removeCertificate = useCallback((index: number) => {
    const updatedCerts = [...initialCertifications];
    updatedCerts.splice(index, 1);
    onCertificationsChange(updatedCerts);
  }, [initialCertifications, onCertificationsChange]);

  return {
    addCertificate,
    removeCertificate,
    uploadingCertificate
  };
};
