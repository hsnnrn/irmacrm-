"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { translateSupabaseError } from "@/lib/utils";
import {
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Truck,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// Inner form — reads tokens from both URL hash (#) and query params (?)
function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function initSession() {
      // 1) Try query params first (PKCE flow: ?code=... or ?access_token=...)
      const code = searchParams.get("code");
      const accessTokenParam = searchParams.get("access_token");
      const refreshTokenParam = searchParams.get("refresh_token");

      // 2) Try URL hash (#access_token=...&refresh_token=...&type=recovery)
      const hash = typeof window !== "undefined"
        ? window.location.hash.substring(1)
        : "";
      const hashParams = new URLSearchParams(hash);
      const accessTokenHash = hashParams.get("access_token");
      const refreshTokenHash = hashParams.get("refresh_token");

      const accessToken = accessTokenParam || accessTokenHash;
      const refreshToken = refreshTokenParam || refreshTokenHash;

      // Case A: PKCE exchange code
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          return;
        }
        setStatus("ready");
        return;
      }

      // Case B: Direct tokens in URL (hash or query)
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setStatus("error");
          return;
        }
        // Clean the hash from the URL bar
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        setStatus("ready");
        return;
      }

      // Case C: Supabase already processed the hash automatically (detectSessionInUrl)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("ready");
        return;
      }

      // Nothing worked
      setStatus("error");
    }

    initSession();
  }, [searchParams]);

  const validatePassword = (val: string) => {
    if (!val) return "Şifre gereklidir";
    if (val.length < 6) return "Şifre en az 6 karakter olmalıdır";
    return "";
  };

  const validateConfirmPassword = (confirm: string, pass: string) => {
    if (!confirm) return "Şifre tekrarı gereklidir";
    if (confirm !== pass) return "Şifreler eşleşmiyor";
    return "";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordError(validatePassword(val));
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, val));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setConfirmPasswordError(validateConfirmPassword(val, password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pErr = validatePassword(password);
    const cErr = validateConfirmPassword(confirmPassword, password);
    setPasswordError(pErr);
    setConfirmPasswordError(cErr);
    if (pErr || cErr) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({
        title: "Şifre güncellendi!",
        description: "Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.",
      });
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error: any) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error) || "Şifre güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- LOADING ---------- */
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-white mx-auto" />
          <p className="text-slate-300 text-sm">Bağlantı doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-400/30 mx-auto">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-white text-xl font-bold">Geçersiz veya Süresi Dolmuş Bağlantı</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
            Lütfen tekrar şifre sıfırlama talebinde bulunun.
          </p>
          <Button
            onClick={() => router.push("/auth/login")}
            className="bg-white text-slate-900 hover:bg-slate-100 w-full"
          >
            Giriş Sayfasına Dön
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- FORM ---------- */
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">İRMA GLOBAL</h1>
              <p className="text-xs text-slate-500">FORWARDING</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Yeni Şifre Belirleyin</h2>
            <p className="mt-2 text-slate-600">Güvenli bir şifre seçerek hesabınızı koruyun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Yeni Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`h-12 rounded-lg border-slate-300 bg-slate-50 pl-10 pr-12 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${
                    passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Şifre Tekrarı
              </Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`h-12 rounded-lg border-slate-300 bg-slate-50 pl-10 pr-12 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${
                    confirmPasswordError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-sm text-red-600">{confirmPasswordError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:opacity-50"
              disabled={loading || !!passwordError || !!confirmPasswordError}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  Şifreyi Güncelle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} İrma Global Forwarding. Tüm hakları saklıdır.
          </p>
        </motion.div>
      </div>

      {/* Right Side Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-1/3 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-lg space-y-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">İRMA GLOBAL</h1>
              <p className="text-sm text-slate-300">FORWARDING</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight text-white">Güvenli Şifre Yönetimi</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Şifrenizi düzenli olarak güncelleyin ve güçlü parola kurallarına uyun.
            </p>
          </div>

          <ul className="flex flex-col gap-4 pt-4">
            {[
              { icon: Shield, label: "Güçlü şifre", desc: "En az 6 karakter kullanın" },
              { icon: Zap, label: "Düzenli güncelleme", desc: "Şifrenizi periyodik olarak değiştirin" },
              { icon: Lock, label: "Gizli tutun", desc: "Şifrenizi kimseyle paylaşmayın" },
            ].map(({ icon: Icon, label, desc }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3 text-slate-300"
              >
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">{label}</span>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="absolute bottom-8 left-12 text-xs text-slate-500">
          © {new Date().getFullYear()} İrma Global Forwarding
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Loader2 className="h-8 w-8 animate-spin text-white" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
