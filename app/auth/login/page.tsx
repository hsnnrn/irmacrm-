"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/lib/auth";
import { Loader2, Eye, EyeOff, Mail, Lock, Truck, Shield, Zap, ArrowRight, Send } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Zaten giriş yapılmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Geçerli bir e-posta adresi giriniz");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      validateEmail(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch {
      // useAuth signIn zaten toast ile hata gösteriyor
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(resetEmail)) {
      setResetEmailError("Geçerli bir e-posta adresi giriniz");
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      toast({
        title: "E-posta gönderildi!",
        description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.",
      });
      setForgotPasswordOpen(false);
      setResetEmail("");
      setResetEmailError("");
    } catch (error: any) {
      toast({
        title: "Hata!",
        description: error.message || "Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setResetEmail(value);
    if (value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setResetEmailError("Geçerli bir e-posta adresi giriniz");
      } else {
        setResetEmailError("");
      }
    } else {
      setResetEmailError("");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Login Form */}
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
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                İRMA GLOBAL
              </h1>
              <p className="text-xs text-slate-500">FORWARDING</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Hoş geldiniz</h2>
            <p className="mt-2 text-slate-600">
              Devam etmek için hesabınıza giriş yapın
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@irmaglobal.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  className={`h-12 rounded-lg border-slate-300 bg-slate-50 pl-10 pr-4 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${
                    emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  required
                />
              </div>
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Şifre
                </Label>
                <button
                  type="button"
                  className="text-sm text-blue-600 transition-colors hover:text-blue-700"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Şifremi unuttum?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg border-slate-300 bg-slate-50 pl-10 pr-12 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal text-slate-600 cursor-pointer"
              >
                Beni hatırla
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="h-12 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50"
              disabled={loading || !!emailError}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} İrma Global Forwarding. Tüm hakları saklıdır.
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Şifremi Unuttum</DialogTitle>
            <DialogDescription>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-posta Adresi</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="ornek@irmaglobal.com"
                  value={resetEmail}
                  onChange={handleResetEmailChange}
                  className={`h-11 rounded-lg border-slate-300 bg-slate-50 pl-10 pr-4 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${
                    resetEmailError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  required
                />
              </div>
              {resetEmailError && (
                <p className="text-sm text-red-600">{resetEmailError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setResetEmail("");
                  setResetEmailError("");
                }}
                disabled={resetLoading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={resetLoading || !!resetEmailError}
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Gönder
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Right Side - Branding Area */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-12 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Decorative Circles */}
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-1/3 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-48 w-48 rounded-full bg-orange-500/10 blur-2xl" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-lg space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                İRMA GLOBAL
              </h1>
              <p className="text-sm text-slate-300">FORWARDING</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight text-white">
              Lojistik operasyonlarınızı tek panelde yönetin
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Nakliye, müşteri ve finans verilerinize anlık erişim. Güvenli ve
              hızlı CRM deneyimi ile işinizi bir üst seviyeye taşıyın.
            </p>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-4 pt-4">
            {[
              { icon: Shield, label: "Güvenli giriş", desc: "Supabase Auth ile korumalı" },
              { icon: Zap, label: "Anlık senkron", desc: "Gerçek zamanlı veri güncellemesi" },
              { icon: Truck, label: "Pozisyon takibi", desc: "Tüm lojistik operasyonlarınızı izleyin" },
            ].map(({ icon: Icon, label, desc }, index) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-3 text-slate-300"
              >
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
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

        {/* Bottom Copyright */}
        <p className="absolute bottom-8 left-12 text-xs text-slate-500">
          © {new Date().getFullYear()} İrma Global Forwarding
        </p>
      </div>
    </div>
  );
}

