
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  app_metadata?: Record<string, any>;
  aud?: string;
  created_at?: string;
  [key: string]: any;
}
