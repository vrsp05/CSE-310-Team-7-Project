import './config.js'; // Load environment variables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Create the connection
export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized!");