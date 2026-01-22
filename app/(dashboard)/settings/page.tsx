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
import { Settings, User, Bell, Shield, Database, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState("Kontrol ediliyor...");

  useEffect(() => {
    // Load user profile data
    if (user) {
      setFullName(user.user_metadata?.full_name || user.email || "");
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
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              <Label>E-posta Bildirimleri</Label>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Durum Güncellemeleri</Label>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Belge Yükleme Hatırlatıcıları</Label>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </div>
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
              <Label>Mevcut Şifre</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Yeni Şifre</Label>
              <Input type="password" />
            </div>
            <Button>Şifre Değiştir</Button>
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

