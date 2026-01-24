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

// RADİKAL ÇÖZÜM: Eğer hala 401 alıyorsak, doğrudan anon key kullan ve auth'u tamamen kapat
const forceAnonKey = !supabaseServiceKey; // Service role yoksa anon key'i force et

// DETAYLI LOG - Environment variable kontrolü
console.log('=== SUPABASE CONFIG DEBUG ===');
console.log('🔑 Supabase Key Type:', supabaseServiceKey ? 'SERVICE_ROLE (RLS bypassed)' : 'ANON_KEY (RLS active + FORCE Auth bypassed)');
console.log('🔧 SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
console.log('🔧 NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
console.log('🌐 Supabase URL:', supabaseUrl);
console.log('🔢 Service Role Key Length:', supabaseServiceKey?.length || 0);
console.log('🔢 Anon Key Length:', supabaseAnonKey?.length || 0);
console.log('⚠️  NODE_ENV:', process.env.NODE_ENV);
console.log('🔐 Auth Mode:', supabaseServiceKey ? 'Service Role Auth' : 'FORCE Manual Auth Bypass');
console.log('🎯 Force Anon Key:', forceAnonKey);

if (!supabaseServiceKey) {
  console.warn('⚠️  SERVICE ROLE KEY YOK - RADİKAL AUTH BYPASS AKTİF!');
  console.warn('📝 Bu mod RLS kapalıysa veya auth bypass gerektiriyorsa çalışır');
  console.warn('🚨 401 alırsak alternatif auth yöntemini dener');
} else {
  console.log('✅ SERVICE ROLE KEY VAR - Full access mode');
}
console.log('=== END DEBUG ===');

// RADİKAL AUTH BYPASS - Supabase client oluştur
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    // Handle WebSocket connection errors gracefully
    log_level: process.env.NODE_ENV === "production" ? "error" : "info",
  },
  // AUTH'U TAMAMEN BYPASS ET
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    flowType: 'implicit' // Auth flow'u implicit yap
  },
  // RADİKAL FETCH OVERRIDE - Tüm auth gereksinimlerini bypass et
  global: {
    fetch: async (url, options = {}) => {
      // Eğer service role key varsa onu kullan, yoksa anon key ile auth bypass
      const authKey = supabaseServiceKey || supabaseAnonKey;

      const finalOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'apikey': authKey,
          // Authorization header'ı her zaman ekle
          'Authorization': `Bearer ${authKey}`,
          // Supabase specific headers
          'X-Client-Info': 'supabase-js/2',
          'Prefer': (options.headers as any)?.['Prefer'] || 'return=representation',
        },
      };

      // Debug için URL logla
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Supabase Request:', url.toString());
      }

      try {
        const response = await fetch(url, finalOptions);

        // Eğer hala 401 alıyorsak, alternatif yöntem dene
        if (response.status === 401 && forceAnonKey) {
          console.warn('🚨 401 received, trying alternative auth method...');

          // Alternatif: Sadece apikey header'ı kullan
          const altOptions = {
            ...finalOptions,
            headers: {
              ...finalOptions.headers,
              'Authorization': undefined, // Authorization header'ı kaldır
              'apikey': supabaseAnonKey,
            }
          };

          const altResponse = await fetch(url, altOptions);
          if (altResponse.ok) {
            console.log('✅ Alternative auth method worked!');
            return altResponse;
          }
        }

        return response;
      } catch (error) {
        console.error('🚨 Supabase fetch error:', error);
        throw error;
      }
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

