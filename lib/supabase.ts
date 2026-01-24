import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Proje URL: client id a4c25270-bb57-4bcc-bc65-7605e1c573ca
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://a4c25270-bb57-4bcc-bc65-7605e1c573ca.supabase.co";

// FORCE SERVICE ROLE KEY - Production'da RLS bypass etmek için
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// KRİTİK: Service role key varsa ONU KULLAN, yoksa anon key kullan
// Service role key RLS politikalarını bypass eder
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

// Log key kullanımını (hem dev hem prod'da göster)
console.log('🔑 Supabase Key Type:', supabaseServiceKey ? 'SERVICE_ROLE (RLS bypassed)' : 'ANON_KEY (RLS active)');
console.log('🔧 Service Role Key Exists:', !!supabaseServiceKey);
console.log('🌐 Supabase URL:', supabaseUrl);
console.log('⚠️  If getting 401 errors, ensure SUPABASE_SERVICE_ROLE_KEY is set in Vercel');

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    // Handle WebSocket connection errors gracefully
    // This prevents console errors in production
    log_level: process.env.NODE_ENV === "production" ? "error" : "info",
  },
  // Global fetch options for better compatibility
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });
    },
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

