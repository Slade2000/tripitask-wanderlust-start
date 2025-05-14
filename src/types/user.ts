
export interface User {
  id: string;
  email?: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  app_metadata: Record<string, any>; // Changed from optional to required
  aud: string; // Changed from optional to required
  created_at: string; // Changed from optional to required
  [key: string]: any;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  business_name?: string | null;
  about?: string | null;
  location?: string | null;
  services?: string[] | null;
  rating?: number | null;
  jobs_completed?: number | null;
  updated_at?: string | null;
}
