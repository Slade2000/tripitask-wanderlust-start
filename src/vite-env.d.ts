/// <reference types="vite/client" />

// Extend Supabase types to include admin_settings
declare global {
  type Database = {
    public: {
      Tables: {
        admin_settings: {
          Row: {
            id: string;
            name: string;
            value: string;
            description: string | null;
            created_at: string;
            updated_at: string;
          };
        };
        // Other tables would be defined here...
      };
    };
  };
}
