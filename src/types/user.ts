
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
