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
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, User, Bell, Shield, Database, Loader2, Eye, EyeOff, FileText, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { translateSupabaseError } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const { permissions } = useUserProfile();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState("Kontrol ediliyor...");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState(true);
  const [documentReminders, setDocumentReminders] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Load user profile data
    if (user) {
      setFullName(user.user_metadata?.full_name || user.email || "");
    }

    // Check database status
    checkDatabaseStatus();

    // Load notification preferences from localStorage
    loadNotificationPreferences();
  }, [user]);

  const loadNotificationPreferences = () => {
    const emailNotifs = localStorage.getItem('emailNotifications') !== 'false';
    const statusNotifs = localStorage.getItem('statusUpdates') !== 'false';
    const docReminders = localStorage.getItem('documentReminders') !== 'false';

    setEmailNotifications(emailNotifs);
    setStatusUpdates(statusNotifs);
    setDocumentReminders(docReminders);
  };

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
        data: { full_name: fullName }
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

  const handleUpdateNotifications = () => {
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('statusUpdates', statusUpdates.toString());
    localStorage.setItem('documentReminders', documentReminders.toString());

    toast({
      title: "Başarılı!",
      description: "Bildirim tercihleriniz güncellendi.",
    });
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
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Clear form
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
      setChangingPassword(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-gray-500">Sistem ayarlarınızı yönetin</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profil Bilgileri</CardTitle>
            </div>
            <CardDescription>
              Kullanıcı bilgilerinizi güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input 
                placeholder="İsminiz" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input 
                type="email" 
                value={user?.email || ""} 
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">E-posta değiştirilemez</p>
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Güncelle
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
              <Label htmlFor="email-notifications">E-posta Bildirimleri</Label>
              <Checkbox
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => setEmailNotifications(checked === true)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status-updates">Durum Güncellemeleri</Label>
              <Checkbox
                id="status-updates"
                checked={statusUpdates}
                onCheckedChange={(checked) => setStatusUpdates(checked === true)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="document-reminders">Belge Yükleme Hatırlatıcıları</Label>
              <Checkbox
                id="document-reminders"
                checked={documentReminders}
                onCheckedChange={(checked) => setDocumentReminders(checked === true)}
              />
            </div>
            <Button onClick={handleUpdateNotifications} className="w-full">
              Bildirim Tercihlerini Kaydet
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Güvenlik</CardTitle>
            </div>
            <CardDescription>Hesap güvenliği ayarları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mevcut Şifre</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifrenizi girin"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Yeni Şifre</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni şifrenizi girin (min. 6 karakter)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {changingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
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

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Evrak Türleri</CardTitle>
            </div>
            <CardDescription>
              Pozisyonlarda kullanılan evrak türlerini ekleyin, düzenleyin ve
              zorunluluk ayarlarını yönetin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Örnek: A Belgesi gibi yeni bir evrak türü ekleyebilir, çıkış ve
              kapanış için zorunlu olup olmadığını belirleyebilirsiniz.
            </p>
            <Link href="/settings/documents">
              <Button variant="outline" className="w-full">
                Evrak Türlerini Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>

        {permissions?.canManageUsers && (
          <Card className="md:col-span-2 lg:col-span-1 border-red-200 bg-red-50/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
              </div>
              <CardDescription>
                Sistem kullanıcılarını ekleyin, rollerini düzenleyin veya
                pasif yapın. Sadece Süper Admin erişebilir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Yeni kullanıcı oluşturabilir, mevcut kullanıcıların rollerini
                değiştirebilir veya hesaplarını yönetebilirsiniz.
              </p>
              <Link href="/settings/users">
                <Button className="w-full bg-logistics-red hover:bg-logistics-red/90">
                  Kullanıcıları Yönet
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

