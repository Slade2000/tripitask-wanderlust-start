
import { Certificate } from "@/contexts/auth/types";
import { Profile } from "@/contexts/auth/types";

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
