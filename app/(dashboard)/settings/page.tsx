"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Bell, Shield, Database, Loader2, Phone, MapPin, Building } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { translateSupabaseError } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState("Kontrol ediliyor...");

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState(true);
  const [documentReminders, setDocumentReminders] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Load user profile data
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
      setCompany(user.user_metadata?.company || "");
      setLocation(user.user_metadata?.location || "");
    }

    // Check database status
    checkDatabaseStatus();
  }, [user]);

  const checkDatabaseStatus = async () => {
    try {
      const { error } = await supabase.from("positions").select("count").limit(1);
      if (error) throw error;
      setDbStatus("Aktif");
    } catch (error) {
      setDbStatus("Bağlantı hatası");
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
          company: company,
          location: location
        }
      });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Profil bilgileriniz güncellendi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Hata!",
        description: "Yeni şifreler eşleşmiyor.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Hata!",
        description: "Yeni şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Başarılı!",
        description: "Şifreniz güncellendi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-gray-500">Sistem ayarlarınızı yönetin</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profil Bilgileri</CardTitle>
            </div>
            <CardDescription>
              Kişisel ve işletme bilgilerinizi yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ad Soyad</Label>
                <Input
                  placeholder="Ad Soyad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  type="tel"
                  placeholder="+90 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Şirket/Firma</Label>
                <Input
                  placeholder="Şirket adı"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Konum</Label>
                <Input
                  placeholder="İstanbul, Türkiye"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">E-posta adresi değiştirilemez</p>
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Profil Bilgilerini Güncelle
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Bildirimler</CardTitle>
            </div>
            <CardDescription>Bildirim tercihlerinizi ayarlayın</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">E-posta Bildirimleri</Label>
                <p className="text-sm text-gray-500">Önemli güncellemeler için e-posta alın</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Durum Güncellemeleri</Label>
                <p className="text-sm text-gray-500">Pozisyon durum değişiklikleri</p>
              </div>
              <Switch
                checked={statusUpdates}
                onCheckedChange={setStatusUpdates}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Belge Hatırlatıcıları</Label>
                <p className="text-sm text-gray-500">Eksik belgeler için hatırlatma</p>
              </div>
              <Switch
                checked={documentReminders}
                onCheckedChange={setDocumentReminders}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Güvenlik</CardTitle>
            </div>
            <CardDescription>Hesap güvenliği ve şifre ayarları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Yeni Şifre</Label>
              <Input
                type="password"
                placeholder="En az 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Yeni Şifre (Tekrar)</Label>
              <Input
                type="password"
                placeholder="Şifreyi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="w-full"
            >
              {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Şifre Değiştir
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Sistem Bilgileri</CardTitle>
            </div>
            <CardDescription>Sistem ve veritabanı durumu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Versiyon</span>
              <span className="font-semibold">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Veritabanı (Supabase)</span>
              <span className={`font-semibold ${
                dbStatus === "Aktif" ? "text-green-600" : "text-red-600"
              }`}>
                {dbStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Kullanıcı ID</span>
              <span className="text-xs font-mono">{user?.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Giriş Tipi</span>
              <span className="font-semibold">Supabase Auth</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

