# İrma Logistics CRM - Kurulum Rehberi

Bu rehber, projenizi sıfırdan kurmanız için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

1. **Node.js 18+** yüklü olmalı
   - Kontrol: `node --version`
   - İndirme: https://nodejs.org/

2. **npm veya yarn** package manager
   - npm Node.js ile birlikte gelir
   - yarn için: `npm install -g yarn`

3. **Supabase Hesabı**
   - Ücretsiz hesap: https://supabase.com

## 🚀 Adım Adım Kurulum

### 1. Bağımlılıkları Yükle

Proje dizininde terminal açın ve şu komutu çalıştırın:

```bash
npm install
```

veya yarn kullanıyorsanız:

```bash
yarn install
```

Bu komut tüm gerekli paketleri yükleyecektir:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/UI components
- Supabase client
- React Query
- jsPDF
- ve diğerleri...

### 2. Supabase Projesini Oluştur

1. https://supabase.com adresine gidin
2. "Start your project" butonuna tıklayın
3. Yeni bir proje oluşturun:
   - Organization seçin veya oluşturun
   - Project name: `irma-logistics-crm`
   - Database password: Güçlü bir şifre oluşturun (kaydedin!)
   - Region: Size en yakın bölgeyi seçin (Europe-West için Frankfurt)

### 3. Veritabanı Şemasını Oluştur

1. Supabase Dashboard'da projenize gidin
2. Sol menüden **SQL Editor** seçin
3. "New query" butonuna tıklayın
4. `supabase_schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
5. "Run" butonuna basın (veya Ctrl/Cmd + Enter)

✅ Şu tablolar oluşturulacak:
- `profiles` (Kullanıcı profilleri)
- `customers` (Müşteriler)
- `suppliers` (Tedarikçiler)
- `positions` (Pozisyonlar)
- `route_stops` (Ara duraklar)
- `documents` (Belgeler)
- `invoices` (Faturalar)

### 4. Environment Variables (Ortam Değişkenleri)

1. Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# Linux/Mac
touch .env.local

# Windows PowerShell
New-Item .env.local
```

2. Supabase API bilgilerini alın:
   - Supabase Dashboard'da **Settings** → **API**
   - "Project URL" ve "anon public" key'i kopyalayın

3. `.env.local` dosyasına şu satırları ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **ÖNEMLİ**: 
- `.env.local` dosyasını asla Git'e commit etmeyin!
- Bu dosya zaten `.gitignore`'da var

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

veya:

```bash
yarn dev
```

🎉 Uygulama `http://localhost:3000` adresinde çalışacak!

## 🔐 Kimlik Doğrulama (Authentication) - Opsiyonel

Eğer kullanıcı girişi eklemek isterseniz:

1. Supabase Dashboard → **Authentication** → **Providers**
2. Email provider'ı etkinleştirin
3. "Confirm email" ayarını isteğe göre yapılandırın

Ardından auth logic ekleyin:

```typescript
// lib/auth.ts
import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
```

## 📦 Production Build

Production için build almak için:

```bash
npm run build
```

Build'i test etmek için:

```bash
npm run start
```

## 🚢 Deploy (Yayınlama)

### Vercel'e Deploy (Önerilen)

1. https://vercel.com hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. "New Project" → Repository seçin
4. Environment Variables ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. "Deploy" butonuna basın

### Netlify'a Deploy

1. https://netlify.com hesabı oluşturun
2. "Add new site" → "Import an existing project"
3. Repository'nizi seçin
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Environment variables ekleyin
6. "Deploy" butonuna basın

## 🔧 Sorun Giderme

### Port 3000 zaten kullanımda

```bash
# Farklı bir port kullanın
PORT=3001 npm run dev
```

### Supabase bağlantı hatası

1. `.env.local` dosyasını kontrol edin
2. URL ve key'lerin doğru olduğundan emin olun
3. Supabase projesinin aktif olduğunu kontrol edin

### TypeScript hataları

```bash
# node_modules'u temizle ve yeniden yükle
rm -rf node_modules
npm install
```

### Build hataları

```bash
# Next.js cache'i temizle
rm -rf .next
npm run build
```

## 📚 Ek Kaynaklar

- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Shadcn/UI: https://ui.shadcn.com

## 🆘 Destek

Sorun yaşıyorsanız:
1. README.md dosyasını okuyun
2. GitHub Issues kontrol edin
3. Supabase Dashboard'da logs kontrol edin

## ✅ Kurulum Checklist

- [ ] Node.js 18+ yüklendi
- [ ] Proje bağımlılıkları yüklendi
- [ ] Supabase projesi oluşturuldu
- [ ] Veritabanı şeması çalıştırıldı
- [ ] `.env.local` dosyası oluşturuldu ve dolduruldu
- [ ] `npm run dev` ile uygulama çalıştı
- [ ] `http://localhost:3000` açıldı
- [ ] Dashboard görüntülendi

Tebrikler! 🎉 İrma Logistics CRM sisteminiz hazır!

