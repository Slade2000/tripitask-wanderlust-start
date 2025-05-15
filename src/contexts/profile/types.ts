
import { Certificate, Profile } from "@/contexts/auth/types";

export interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
}

export interface ProfileMediaState {
  uploadingAvatar: boolean;
  uploadingCertificate: boolean;
  uploadAvatar: (file: File) => Promise<string | null>;
  uploadCertificate: (file: File, certName: string) => Promise<string | null>;
}

export interface CertificationManagerState {
  addCertificate: (name: string, file?: File) => Promise<void>;
  removeCertificate: (index: number) => void;
}

export interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<Profile | null>;
  updateProfile: (profileData: Partial<Profile>) => Promise<Profile | null>;
}

// Re-export the Profile type from auth/types
export type { Profile } from "@/contexts/auth/types";
