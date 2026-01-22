# İrma Global Forwarding - Lojistik CRM

Modern ve kullanıcı dostu bir lojistik CRM uygulaması. Next.js 14, TypeScript, Tailwind CSS ve Supabase ile geliştirilmiştir.

## 🚀 Özellikler

### 1. **Dashboard (Ana Sayfa)**
- Gerçek zamanlı operasyon metrikleri
- Aktif pozisyonlar ve araçlar
- Dikkat gereken işlemler (Action Required) sistemi
- Aylık karlılık trendleri
- Son aktivite akışı

### 2. **Müşteri Yönetimi**
- CRUD operasyonları (Oluştur, Oku, Güncelle, Sil)
- Risk limiti ve bakiye takibi
- Yetkili kişi ve iletişim bilgileri
- Durum bazlı filtreleme

### 3. **Tedarikçi Yönetimi**
- Nakliyeci ve tedarikçi kartları
- **Otomatik Referans Numarası Sistemi** (IRG-YIL-SIRA-KDVNO)
- Vade günü yönetimi
- Kara liste özelliği

### 4. **Pozisyon Yönetimi (Operasyon Kartları)**
#### Ana Özellikler:
- Detaylı pozisyon oluşturma formu
- Dinamik ara durak ekleme
- Rota ve yük bilgileri
- Çok para birimli fiyatlandırma (TRY, USD, EUR, RUB)

#### **Document Lock Sistemi** (Kilit Mekanizması):
- **DRAFT → READY_TO_DEPART**: Serbestçe geçiş
- **READY_TO_DEPART → IN_TRANSIT**: 
  - ✅ Sürücü Belgesi
  - ✅ Araç Ruhsatı
  - ✅ Sigorta Belgesi
  - ✅ Taşıma Sözleşmesi
- **DELIVERED → COMPLETED**:
  - ✅ CMR (Teslimat Belgesi)
  - ✅ Satış Faturası
  - ✅ Alış Faturası

#### State Machine (Durum Makinesi):
```
DRAFT → READY_TO_DEPART → IN_TRANSIT → DELIVERED → COMPLETED
        ↓                    ↓            ↓
                    CANCELLED
```

### 5. **Belge Yönetimi**
- Belge yükleme sistemi
- Belge doğrulama
- Eksik belge uyarıları (Kırmızı, yanıp sönen)
- 7 farklı belge tipi desteği

### 6. **Finansal Modül**
- Alacak/Borç takibi
- Fatura yönetimi (Satış/Alış)
- Vade takibi ve gecikme uyarıları
- Nakit akışı analizi
- Çok para birimli hesaplamalar
- Otomatik kar hesaplama

### 7. **Raporlama**
- **PDF Navlun Teklifi** oluşturma
- Aylık performans raporları
- Müşteri analizi
- Tedarikçi değerlendirme
- Operasyonel raporlar

## 🎨 Tasarım Özellikleri

- **Modern UI/UX**: Clean, minimalist, "Apple-esque" tasarım
- **Renk Paleti**: 
  - Logistics Blue (#1e3a8a, #3b82f6)
  - Traffic Light Status Colors (Yeşil/Kırmızı/Turuncu)
  - Clean Greys
- **Responsive**: Desktop-first ama mobil uyumlu
- **Smooth Animations**: Geçiş efektleri ve loading states
- **Visual Feedback**: Toast notifications, skeleton loaders

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (Radix UI)
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query + Zustand
- **Form Handling**: React Hook Form + Zod
- **PDF Generation**: jsPDF

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
# veya
yarn install
```

2. **Environment Variables:**
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **Supabase Veritabanı:**
`supabase_schema.sql` dosyasını Supabase SQL Editor'de çalıştırın.

4. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
# veya
yarn dev
```

5. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 📁 Proje Yapısı

```
irmacrm/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                 # Dashboard
│   │   ├── customers/               # Müşteriler
│   │   ├── suppliers/               # Tedarikçiler
│   │   ├── positions/               # Pozisyonlar
│   │   │   ├── create/             # Pozisyon Oluştur
│   │   │   └── [id]/               # Pozisyon Detay
│   │   ├── finance/                 # Finans
│   │   ├── reports/                 # Raporlar
│   │   └── settings/                # Ayarlar
│   ├── layout.tsx
│   ├── providers.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # Shadcn UI Components
│   ├── business/                    # Business Logic Components
│   │   ├── customer-dialog.tsx
│   │   ├── supplier-dialog.tsx
│   │   ├── document-upload-dialog.tsx
│   │   ├── status-change-dialog.tsx
│   │   └── freight-proposal-generator.tsx
│   └── layout/
│       ├── sidebar.tsx
│       └── header.tsx
├── lib/
│   ├── utils.ts                     # Utility functions
│   ├── supabase.ts                  # Supabase client
│   ├── database.types.ts            # Database types
│   ├── position-utils.ts            # Position logic
│   └── pdf-generator.ts             # PDF generation
├── hooks/
│   └── use-toast.ts
├── supabase_schema.sql              # Database schema
├── .cursorrules.md                  # Project rules
└── cursor_workflow_prompt.md        # Development guide
```

## 🔑 Temel İş Kuralları

### 1. Pozisyon Lifecycle (Yaşam Döngüsü)
- Bir pozisyon gerekli belgeler olmadan kapatalamaz
- Document Lock sistemi katı şekilde uygulanır

### 2. Tedarikçi Referans Sistemi
- Her pozisyon için otomatik benzersiz referans numarası
- Format: `IRG-YYYY-NNNN-XXXX`
- Ödeme vadesi: CMR tarihi + Tedarikçi vade günü

### 3. Çok Para Birimi Desteği
- TRY, USD, EUR, RUB desteklenir
- Kar hesaplamaları baz para birimine (TRY) çevrilir
- Orijinal işlem para birimi saklanır

## 🎯 Önemli Özellikler

### Document Lock (Belge Kilidi)
Pozisyonların ilerlemesi için gerekli belgelerin kontrolü:
- `canDepart()`: Yola çıkış kontrolü
- `canClose()`: Kapatma kontrolü
- Eksik belgeler **kırmızı ve yanıp sönen** uyarı ile gösterilir

### State Machine (Durum Makinesi)
Pozisyon durumları arasındaki geçişleri yönetir:
- `getNextAllowedStatuses()`: İzin verilen durumları döndürür
- Koşul sağlanmadığında durum değişikliği engellenir

### Supplier Reference System
Her tedarikçi için benzersiz referans numarası:
```typescript
generateSupplierRefNo(2024, 1, "1234567890")
// Output: "IRG-2024-0001-7890"
```

## 📊 Veritabanı Şeması

- `customers`: Müşteri bilgileri
- `suppliers`: Tedarikçi bilgileri
- `positions`: Operasyon kartları
- `route_stops`: Ara duraklar
- `documents`: Belgeler
- `invoices`: Faturalar
- `profiles`: Kullanıcı profilleri

## 🎨 UI Bileşenleri

Shadcn/UI kullanılarak oluşturulmuş:
- Button, Input, Card, Table
- Dialog, Select, Badge
- Tabs, Toast, Dropdown Menu
- Checkbox, Label

## 🚦 Durum Renkleri

| Durum | Renk | Anlamı |
|-------|------|--------|
| DRAFT | Gri | Taslak |
| READY_TO_DEPART | Turuncu | Hareket Hazır |
| IN_TRANSIT | Mavi | Yolda |
| DELIVERED | Yeşil | Teslim Edildi |
| COMPLETED | Koyu Gri | Kapandı |
| CANCELLED | Kırmızı | İptal |

## 📝 Lisans

© 2024 İrma Global Forwarding. Tüm hakları saklıdır.

## 🤝 Katkıda Bulunma

Bu proje özel bir ticari yazılımdır. Katkıda bulunmak için lütfen iletişime geçin.

## 📧 İletişim

- Email: info@irmaglobal.com
- Website: www.irmaglobal.com

---

**Not**: Bu uygulama tam fonksiyonel bir lojistik CRM sistemidir. Supabase bağlantısı kurulduktan sonra production'a hazırdır.

