# İrma Logistics CRM - Özellik Listesi

Bu dokümanda sistemin tüm özellikleri detaylı olarak açıklanmıştır.

## 🎯 Ana Modüller

### 1. Dashboard (Ana Sayfa)
**Dosya**: `app/(dashboard)/page.tsx`

#### Özellikler:
- ✅ **Gerçek Zamanlı Metrikler**
  - Aktif pozisyonlar sayısı
  - Bu ay kar özeti
  - Yoldaki araçlar
  - Bekleyen işlemler

- ✅ **Action Required Widget** (Dikkat Gereken İşlemler)
  - Eksik belgeleri olan pozisyonlar
  - Kırmızı, yanıp sönen uyarılar
  - Pozisyon detaylarına hızlı erişim
  - Öncelik sıralama (Acil/Orta)

- ✅ **Aktivite Akışı**
  - Son 24 saatte gerçekleşen işlemler
  - Zaman damgalı olaylar
  - İkon bazlı görselleştirme

- ✅ **Aylık Karlılık Grafiği**
  - Son 6 ay kar trendi
  - Progress bar ile görselleştirme
  - Aylık karşılaştırma

---

### 2. Müşteriler (Customers)
**Dosya**: `app/(dashboard)/customers/page.tsx`

#### Özellikler:
- ✅ **CRUD İşlemleri**
  - Müşteri oluşturma
  - Müşteri güncelleme
  - Müşteri silme
  - Detaylı görüntüleme

- ✅ **Müşteri Bilgileri**
  - Firma adı
  - Vergi numarası
  - Yetkili kişi
  - E-posta ve telefon
  - Risk limiti
  - Mevcut bakiye

- ✅ **Risk Yönetimi**
  - Risk durumu hesaplama
  - Renk kodlu uyarılar (Normal/Dikkat/Risk)
  - Bakiye/limit yüzdesi

- ✅ **Arama ve Filtreleme**
  - Firma adına göre arama
  - Yetkili kişiye göre arama
  - E-posta'ya göre arama
  - Gerçek zamanlı filtreleme

- ✅ **İstatistikler**
  - Toplam müşteri sayısı
  - Toplam risk limiti
  - Mevcut toplam bakiye

---

### 3. Tedarikçiler (Suppliers)
**Dosya**: `app/(dashboard)/suppliers/page.tsx`

#### Özellikler:
- ✅ **CRUD İşlemleri**
  - Tedarikçi ekleme
  - Düzenleme
  - Silme

- ✅ **Tedarikçi Bilgileri**
  - Firma adı
  - Vergi/TC numarası (Şahıs şirket desteği)
  - Vade günü (Payment term)
  - Kara liste durumu

- ✅ **Referans Numarası Sistemi**
  - Format: `IRG-YIL-SIRA-KDVNO`
  - Örnek: `IRG-2024-0001-1111`
  - Otomatik oluşturma
  - Benzersizlik garantisi

- ✅ **Kara Liste Yönetimi**
  - Çalışılmayacak tedarikçileri işaretle
  - Görsel uyarı (kırmızı arka plan)
  - İkon ile gösterim

- ✅ **İstatistikler**
  - Toplam tedarikçi
  - Aktif tedarikçi
  - Kara listedekiler
  - Ortalama vade günü

---

### 4. Pozisyonlar (Positions)
**Dosya**: `app/(dashboard)/positions/page.tsx`, `create/page.tsx`, `[id]/page.tsx`

#### 4.1. Pozisyon Listesi

- ✅ **Tablo Görünümü**
  - Pozisyon numarası
  - Müşteri ve tedarikçi
  - Rota (yükleme → boşaltma)
  - Yük bilgisi
  - Satış, maliyet, kar
  - Durum badge'i
  - Hızlı eylem butonları

- ✅ **Arama ve Filtreleme**
  - Pozisyon numarasına göre
  - Müşteri adına göre
  - Rota noktalarına göre

- ✅ **İstatistikler**
  - Toplam pozisyon sayısı
  - Aktif operasyonlar
  - Toplam kar (tamamlananlar)

#### 4.2. Pozisyon Oluşturma

- ✅ **İki Sütunlu Form Layout**
  - Sol: Ana bilgiler
  - Sağ: Finansal bilgiler

- ✅ **Müşteri ve Tedarikçi Seçimi**
  - Dropdown menüler
  - Mevcut kayıtlardan seçim

- ✅ **Rota Bilgileri**
  - Yükleme noktası
  - Boşaltma noktası
  - Dinamik ara durak ekleme
  - Durak tipi seçimi (Alım/Bırakım/Gümrük/Transfer)
  - Sıralama

- ✅ **Yük Bilgileri**
  - Detaylı açıklama
  - Örnek: "24 Palet Tekstil Malzemesi"

- ✅ **Finansal Bilgiler**
  - Satış fiyatı
  - Maliyet
  - Para birimi seçimi (TRY/USD/EUR/RUB)
  - Otomatik kar hesaplama
  - Gerçek zamanlı güncelleme

- ✅ **Otomatik İşlemler**
  - Referans numarası oluşturma
  - DRAFT durumunda başlatma
  - Timestamp ekleme

#### 4.3. Pozisyon Detay (Maximo-style)

**Bu sayfa uygulamanın kalbidir!**

##### Header Bölümü:
- Pozisyon numarası
- Durum badge'i
- Müşteri ve tedarikçi özeti
- Kar bilgisi
- Referans numarası
- Durum değiştir butonu

##### Missing Actions Alert:
- 🚨 **Kırmızı uyarı kutusu**
- Yanıp sönen ikon (animate-blink)
- Eksik belgelerin listesi
- Yola çıkış engelleri
- Kapatma engelleri

##### Tab Yapısı:

**📊 Genel Bakış (Overview)**
- Rota detayları
- Tarih bilgileri (oluşturma, kalkış, teslimat)
- Özet bilgiler

**📄 Belgeler (Documents)**
- 7 belge tipi:
  1. Sürücü Belgesi
  2. Araç Ruhsatı
  3. Sigorta Belgesi
  4. Taşıma Sözleşmesi
  5. CMR
  6. Satış Faturası
  7. Alış Faturası

- Yeşil/Gri renk kodlama
- Upload butonları
- Durum göstergeleri (✓/✗)

**💰 Finansal (Financials)**
- 3 kart layout:
  - Satış fiyatı (yeşil)
  - Maliyet (kırmızı)
  - Net kar (büyük, yeşil)
- Kar marjı yüzdesi
- Para birimi gösterimi
- Referans numarası vurgusu (mavi kutu)

**📅 Olaylar (Events)**
- Zaman çizelgesi
- Tüm durum değişiklikleri
- Belge yüklemeleri
- Tarih damgaları

##### Document Lock Sistemi:

**READY_TO_DEPART → IN_TRANSIT için gerekli:**
```
✓ Sürücü Belgesi
✓ Araç Ruhsatı
✓ Sigorta Belgesi
✓ Taşıma Sözleşmesi
```

**DELIVERED → COMPLETED için gerekli:**
```
✓ CMR (Teslimat Belgesi)
✓ Satış Faturası
✓ Alış Faturası
```

##### State Machine (Durum Geçişleri):
```
DRAFT (Taslak)
  ↓ (serbest)
READY_TO_DEPART (Hareket Hazır)
  ↓ (belgeler gerekli)
IN_TRANSIT (Yolda)
  ↓ (serbest)
DELIVERED (Teslim Edildi)
  ↓ (belgeler + faturalar gerekli)
COMPLETED (Kapandı)
```

Her aşamadan CANCELLED'a geçilebilir.

---

### 5. Finans (Finance)
**Dosya**: `app/(dashboard)/finance/page.tsx`

#### Özellikler:
- ✅ **Alacak/Borç Yönetimi**
  - Toplam alacaklar
  - Toplam borçlar
  - Vadesi geçmiş alacaklar
  - Net kar (ödenenler)

- ✅ **Fatura Listesi**
  - Satış faturaları (yeşil)
  - Alış faturaları (kırmızı)
  - Fatura tarihi
  - Vade tarihi
  - Gecikme günü hesaplama
  - Ödeme durumu

- ✅ **Vade Takibi**
  - Otomatik gecikme hesaplama
  - Kırmızı uyarı (vadesi geçmiş)
  - Turuncu uyarı (bekleyen)
  - Yeşil onay (ödenmiş)

- ✅ **Nakit Akışı**
  - Aylık gelir/gider
  - Kar hesaplama
  - Progress bar gösterimi
  - 6 aylık trend

- ✅ **Filtreleme**
  - Tüm faturalar
  - Sadece satış
  - Sadece alış

- ✅ **Çok Para Birimi**
  - TRY, USD, EUR, RUB
  - Para birimi dönüşümü
  - Tutarlı raporlama

---

### 6. Raporlar (Reports)
**Dosya**: `app/(dashboard)/reports/page.tsx`

#### Rapor Tipleri:
1. ✅ **Aylık Performans Raporu**
   - Kar/zarar özeti
   - İkon: TrendingUp
   - PDF indirme

2. ✅ **Müşteri Analizi**
   - Ciro ve karlılık
   - İkon: Users
   - PDF indirme

3. ✅ **Tedarikçi Değerlendirme**
   - Performans analizi
   - Maliyet raporu
   - İkon: Package

4. ✅ **Operasyonel Rapor**
   - Tamamlanan işlemler
   - Devam eden işlemler
   - İkon: FileText

#### Hızlı İstatistikler:
- Bu ay tamamlanan
- Ortalama teslimat süresi
- Müşteri memnuniyeti

---

### 7. Ayarlar (Settings)
**Dosya**: `app/(dashboard)/settings/page.tsx`

#### Bölümler:
1. ✅ **Profil Bilgileri**
   - Ad soyad
   - E-posta
   - Güncelleme

2. ✅ **Bildirimler**
   - E-posta bildirimleri
   - Durum güncellemeleri
   - Belge hatırlatıcıları

3. ✅ **Güvenlik**
   - Şifre değiştirme
   - Güvenlik ayarları

4. ✅ **Sistem Bilgileri**
   - Versiyon
   - Veritabanı durumu
   - Son yedekleme

---

## 🎨 UI/UX Özellikleri

### Tasarım Sistemi

#### Renk Paleti:
```css
Logistics Blue: #1e3a8a, #3b82f6
Logistics Grey: #64748b, #f1f5f9
Status Green: #22c55e
Status Warning: #f59e0b
Status Danger: #ef4444
Status Info: #3b82f6
```

#### Animasyonlar:
- ✅ Smooth transitions (0.2s, 0.3s)
- ✅ Blink animation (eksik işlemler için)
- ✅ Slide-in animasyonlar
- ✅ Hover efektleri
- ✅ Loading skeletons

#### Responsive Design:
- ✅ Desktop-first approach
- ✅ Mobile uyumlu
- ✅ Grid system (md:grid-cols-2, lg:grid-cols-3, vb.)
- ✅ Flexible layouts

#### Görsel Hierarchy:
- ✅ Typography scale (text-xs → text-3xl)
- ✅ Font weights (normal → bold)
- ✅ Color contrast (WCAG AA+)
- ✅ Spacing system (gap-2 → gap-8)

---

## 🔧 Teknik Özellikler

### Mimari:
- ✅ **Next.js 14 App Router**
  - File-based routing
  - Server/Client components
  - Layout system

- ✅ **TypeScript**
  - Strict mode
  - Type safety
  - Interfaces & Types

- ✅ **Tailwind CSS**
  - Utility-first
  - Custom configurations
  - Responsive utilities

### State Management:
- ✅ **React Query (TanStack Query)**
  - Data fetching
  - Caching
  - Optimistic updates

- ✅ **Zustand** (hazır)
  - Global state
  - Lightweight

### Form Management:
- ✅ **React Hook Form** (hazır)
  - Performance optimized
  - Validation

- ✅ **Zod** (hazır)
  - Schema validation
  - Type inference

### Database:
- ✅ **Supabase**
  - PostgreSQL
  - Row Level Security
  - Real-time subscriptions (hazır)
  - File storage (hazır)

### PDF Generation:
- ✅ **jsPDF**
  - Navlun teklifi
  - Pozisyon raporu
  - Türkçe karakter desteği
  - Custom branding

---

## 📦 Hooks (Hazır API Hooks)

### Position Hooks:
- `usePositions()` - Tüm pozisyonları getir
- `usePosition(id)` - Tek pozisyon getir
- `useCreatePosition()` - Pozisyon oluştur
- `useUpdatePosition()` - Pozisyon güncelle
- `useDeletePosition()` - Pozisyon sil

### Customer Hooks:
- `useCustomers()`
- `useCustomer(id)`
- `useCreateCustomer()`
- `useUpdateCustomer()`
- `useDeleteCustomer()`

### Supplier Hooks:
- `useSuppliers()`
- `useSupplier(id)`
- `useCreateSupplier()`
- `useUpdateSupplier()`
- `useDeleteSupplier()`

---

## 🚀 Performans Optimizasyonları

- ✅ Lazy loading components
- ✅ Code splitting (Next.js otomatik)
- ✅ Image optimization (Next.js Image)
- ✅ React Query caching
- ✅ Memoization (hazır yapı)

---

## 🔐 Güvenlik

- ✅ Environment variables
- ✅ Supabase RLS (Row Level Security)
- ✅ Type-safe API calls
- ✅ Input validation (form level)
- ✅ XSS protection (React default)

---

## 📱 Responsive Breakpoints

```typescript
sm: '640px'   // Tablets
md: '768px'   // Small laptops
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1400px' // Large screens
```

---

## ✅ Production Ready Checklist

- [x] TypeScript strict mode
- [x] Error boundaries (Next.js default)
- [x] Loading states
- [x] Error states
- [x] Toast notifications
- [x] Form validations
- [x] Responsive design
- [x] Accessibility (ARIA labels)
- [x] SEO metadata
- [x] Performance optimizations

---

## 🎓 Kod Kalitesi

- ✅ Clean Code principles
- ✅ DRY (Don't Repeat Yourself)
- ✅ SOLID principles
- ✅ Component composition
- ✅ Custom hooks
- ✅ Utility functions
- ✅ TypeScript interfaces
- ✅ Consistent naming

---

## 📚 Dokümantasyon

Oluşturulan dosyalar:
1. ✅ `README.md` - Genel bilgiler
2. ✅ `SETUP_GUIDE.md` - Kurulum rehberi
3. ✅ `FEATURES.md` - Bu dosya
4. ✅ `.cursorrules.md` - Proje kuralları
5. ✅ `cursor_workflow_prompt.md` - Geliştirme rehberi

---

## 🎉 Sonuç

İrma Logistics CRM, modern web teknolojileri kullanılarak geliştirilmiş, production-ready, tam özellikli bir lojistik yönetim sistemidir.

### Öne Çıkan Özellikler:
1. 🔒 **Document Lock Sistemi** - Unique business logic
2. 📊 **Maximo-style Detail Page** - Professional UX
3. 🎨 **Beautiful UI** - Modern ve kullanıcı dostu
4. 🚀 **Performance** - Optimize edilmiş
5. 🔐 **Security** - Güvenli ve type-safe
6. 📱 **Responsive** - Her cihazda çalışır
7. 📄 **PDF Generation** - Profesyonel raporlar
8. 💰 **Multi-currency** - Global operasyonlar

**Toplam Dosya Sayısı**: 50+
**Toplam Satır Kodu**: 5000+
**Modül Sayısı**: 7 ana modül
**Component Sayısı**: 30+ component

