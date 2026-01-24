import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PostgrestError } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Supabase hata mesajlarını Türkçe'ye çevirir
 */
export function translateSupabaseError(error: Error | PostgrestError | unknown): string {
  if (!error) return "Bilinmeyen bir hata oluştu.";

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Auth hataları
  if (lowerMessage.includes("invalid login credentials") || lowerMessage.includes("invalid_credentials")) {
    return "Geçersiz giriş bilgileri. E-posta veya şifrenizi kontrol edin.";
  }
  if (lowerMessage.includes("email not confirmed") || lowerMessage.includes("email_not_confirmed")) {
    return "E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol edin.";
  }
  if (lowerMessage.includes("user already registered") || lowerMessage.includes("already_registered")) {
    return "Bu e-posta adresi zaten kayıtlı.";
  }
  if (lowerMessage.includes("password should be at least") || lowerMessage.includes("password_too_short")) {
    return "Şifre en az 6 karakter olmalıdır.";
  }
  if (lowerMessage.includes("invalid email") || lowerMessage.includes("invalid_email")) {
    return "Geçersiz e-posta adresi formatı.";
  }
  if (lowerMessage.includes("for security purposes") || lowerMessage.includes("rate_limit")) {
    return "Güvenlik nedeniyle, bunu 60 saniyede bir kez talep edebilirsiniz.";
  }
  if (lowerMessage.includes("new password should be different") || lowerMessage.includes("same_password")) {
    return "Yeni şifre eski şifreden farklı olmalıdır.";
  }
  if (lowerMessage.includes("jwt expired") || lowerMessage.includes("token_expired")) {
    return "Oturum süreniz doldu. Lütfen tekrar giriş yapın.";
  }
  if (lowerMessage.includes("email rate limit exceeded")) {
    return "Çok fazla e-posta gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.";
  }

  // Database hataları
  if (lowerMessage.includes("duplicate key") || lowerMessage.includes("unique constraint")) {
    return "Bu kayıt zaten mevcut. Lütfen farklı bir değer deneyin.";
  }
  if (lowerMessage.includes("foreign key constraint") || lowerMessage.includes("violates foreign key")) {
    return "İlişkili kayıt bulunamadı. Lütfen seçimlerinizi kontrol edin.";
  }
  if (lowerMessage.includes("check constraint") || lowerMessage.includes("violates check")) {
    return "Geçersiz veri girişi. Lütfen bilgileri kontrol edin.";
  }
  if (lowerMessage.includes("permission denied") || lowerMessage.includes("new row violates row-level security")) {
    return "Bu işlem için yetkiniz yok.";
  }
  if (lowerMessage.includes("row not found") || lowerMessage.includes("no rows")) {
    return "Kayıt bulunamadı.";
  }
  if (lowerMessage.includes("null value") || lowerMessage.includes("not null constraint")) {
    return "Zorunlu alanlar eksik. Lütfen tüm gerekli bilgileri doldurun.";
  }

  // Network hataları
  if (lowerMessage.includes("network error") || lowerMessage.includes("failed to fetch")) {
    return "Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.";
  }
  if (lowerMessage.includes("timeout")) {
    return "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.";
  }

  // Storage hataları
  if (lowerMessage.includes("storage") && lowerMessage.includes("not found")) {
    return "Dosya bulunamadı.";
  }
  if (lowerMessage.includes("storage") && lowerMessage.includes("size")) {
    return "Dosya boyutu çok büyük. Maksimum dosya boyutunu kontrol edin.";
  }

  // Genel hatalar
  if (lowerMessage.includes("database error") || lowerMessage.includes("postgres")) {
    return "Veritabanı hatası oluştu. Lütfen daha sonra tekrar deneyin.";
  }
  if (lowerMessage.includes("internal server error")) {
    return "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.";
  }

  // Eğer hiçbir eşleşme yoksa, orijinal mesajı döndür ama daha kullanıcı dostu hale getir
  return errorMessage || "Bir hata oluştu. Lütfen tekrar deneyin.";
}
