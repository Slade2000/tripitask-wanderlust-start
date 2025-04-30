
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const SUPABASE_URL = "https://dftdrtfpvojruqkbzcuw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdGRydGZwdm9qcnVxa2J6Y3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNzcxMjMsImV4cCI6MjA1NjY1MzEyM30.C4iKGFhyx1GxzQqPg8wFkMdJjruEB5qYfW0eyqR9ck0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
