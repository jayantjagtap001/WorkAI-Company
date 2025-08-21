import { createClient } from '@supabase/supabase-js';

// Use the values from the global supabase client that's initialized in main.jsx
const supabaseUrl = window.supabase?.supabaseUrl || 'https://dbsmyvuoatkjmputipjr.supabase.co';
const supabaseAnonKey = window.supabase?.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRic215dnVvYXRram1wdXRpcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODQ2NDgsImV4cCI6MjA3MDE2MDY0OH0.LezNqOJL5weBTI_HnxmnEo3WJ5TlbB1SZ2z-Kde_Wbs';

// Create a new client to ensure we're using the correct instance
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;