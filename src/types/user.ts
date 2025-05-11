
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
