import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Proje URL: client id a4c25270-bb57-4bcc-bc65-7605e1c573ca
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://a4c25270-bb57-4bcc-bc65-7605e1c573ca.supabase.co";

// FORCE SERVICE ROLE KEY - Production'da RLS bypass etmek için
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use service role key if available (for server-side operations), otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

// Environment variable validation
if (process.env.NODE_ENV === 'development') {
  console.log('=== SUPABASE CONFIG ===');
  console.log('🔑 Key Type:', supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON_KEY');
  console.log('🔧 Service Role Key:', !!supabaseServiceKey);
  console.log('🔧 Anon Key:', !!supabaseAnonKey);
  console.log('🌐 URL:', supabaseUrl);
  console.log('=== END CONFIG ===');
}

// Production-ready Supabase client for Vercel deployment
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    // Handle WebSocket connection errors gracefully - don't show errors in production
    log_level: "error",
  },
  // Standard auth configuration for production
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

