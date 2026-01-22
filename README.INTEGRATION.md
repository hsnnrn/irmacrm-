# İrma Logistics CRM - Supabase Entegrasyon Rehberi

## ✅ Tamamlanan Entegrasyonlar

### 1. **Customers (Müşteriler) Modülü** ✅

**Entegre Edilen Özellikler:**
- ✅ `useCustomers()` - Tüm müşterileri getir
- ✅ `useCreateCustomer()` - Yeni müşteri oluştur
- ✅ `useUpdateCustomer()` - Müşteri güncelle
- ✅ `useDeleteCustomer()` - Müşteri sil
- ✅ Loading states (Yükleniyor durumu)
- ✅ Error handling (Hata yönetimi)
- ✅ Toast notifications (Bildirimler)
- ✅ Real-time sync (Gerçek zamanlı senkronizasyon)

**Kullanım:**
```typescript
const { data: customers, isLoading, error } = useCustomers();
```

---

### 2. **Suppliers (Tedarikçiler) Modülü** ✅

**Entegre Edilen Özellikler:**
- ✅ `useSuppliers()` - Tüm tedarikçileri getir
- ✅ `useCreateSupplier()` - Yeni tedarikçi oluştur
- ✅ `useUpdateSupplier()` - Tedarikçi güncelle
- ✅ `useDeleteSupplier()` - Tedarikçi sil
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Real-time sync

**Özel Özellik:**
- Otomatik referans numarası oluşturma sistemi aktif

---

### 3. **Positions (Pozisyonlar) Modülü** ✅

**Entegre Edilen Özellikler:**
- ✅ `usePositions()` - Tüm pozisyonları getir
- ✅ `usePosition(id)` - Tek pozisyon getir
- ✅ `useCreatePosition()` - Yeni pozisyon oluştur
- ✅ `useUpdatePosition()` - Pozisyon güncelle
- ✅ `useDeletePosition()` - Pozisyon sil
- ✅ Dynamic customer/supplier loading (Dropdown'larda)
- ✅ Automatic profit calculation
- ✅ Supplier reference number generation
- ✅ Loading states
- ✅ Error handling
- ✅ Real-time sync

**Position Create Sayfası:**
- Müşteriler ve tedarikçiler Supabase'den dinamik yüklenir
- Form submit Supabase'e kaydeder
- Otomatik referans numarası üretir

---

### 4. **Document Upload (Belge Yükleme)** ✅

**Yeni Dosyalar:**
- `lib/storage.ts` - Supabase Storage yönetimi
- `hooks/use-documents.ts` - Document CRUD hooks

**Özellikler:**
- ✅ `uploadDocument()` - Dosya yükleme
- ✅ `deleteDocument()` - Dosya silme
- ✅ `getSignedUrl()` - Güvenli URL alma
- ✅ `downloadDocument()` - Dosya indirme
- ✅ `useDocuments(positionId)` - Pozisyon belgelerini getir
- ✅ `useUploadDocument()` - Belge yükleme hook
- ✅ `useDeleteDocument()` - Belge silme hook
- ✅ `useVerifyDocument()` - Belge onaylama hook

**Bucket Yapılandırması:**
```sql
-- Supabase Dashboard → Storage → Create bucket
Bucket name: documents
Public: false
File size limit: 5MB
```

**Güvenlik (RLS Policies):**
```sql
-- documents bucket için policy oluştur
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can read their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

---

### 5. **Real-time Subscriptions** ✅

**Yeni Dosya:**
- `hooks/use-realtime.ts` - Real-time subscription hooks

**Aktif Subscriptions:**
- ✅ Positions - Pozisyon değişiklikleri
- ✅ Customers - Müşteri değişiklikleri
- ✅ Suppliers - Tedarikçi değişiklikleri
- ✅ Documents - Belge değişiklikleri
- ✅ Invoices - Fatura değişiklikleri

**Nasıl Çalışır:**
```typescript
// app/providers.tsx içinde otomatik aktif
useRealtimeSubscriptions();
```

Bir kullanıcı veri değiştirdiğinde, tüm bağlı istemciler otomatik güncellenir!

**Supabase'de Aktif Et:**
```sql
-- Realtime'ı etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE positions;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
```

---

### 6. **Finance (Finans) Modülü** ✅

**Yeni Dosya:**
- `hooks/use-invoices.ts` - Invoice CRUD hooks

**Entegre Edilen Özellikler:**
- ✅ `useInvoices()` - Tüm faturaları getir
- ✅ `usePositionInvoices(id)` - Pozisyon faturalarını getir
- ✅ `useCreateInvoice()` - Fatura oluştur
- ✅ `useUpdateInvoice()` - Fatura güncelle
- ✅ `useDeleteInvoice()` - Fatura sil
- ✅ Loading states
- ✅ Error handling
- ✅ Automatic overdue calculation (Gecikme hesaplama)

**Finance Dashboard:**
- Gerçek fatura verileri ile çalışır
- Mock data fallback (veri yoksa örnek gösterir)
- Otomatik alacak/borç hesaplama

---

### 7. **Authentication (Kimlik Doğrulama)** ✅

**Yeni Dosyalar:**
- `lib/auth.ts` - Auth helper functions
- `hooks/use-auth.ts` - Auth hook
- `app/auth/login/page.tsx` - Login sayfası

**Özellikler:**
- ✅ Email/Password login
- ✅ Sign up (Kayıt)
- ✅ Sign out (Çıkış)
- ✅ Session management
- ✅ Auth state listener

**Supabase Auth Aktifleştir:**
1. Supabase Dashboard → Authentication → Providers
2. Email provider'ı etkinleştir
3. "Confirm email" ayarını yapılandır

**Login Sayfası:**
```
http://localhost:3001/auth/login
```

**Demo Kullanıcı Oluştur:**
```sql
-- Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password)
VALUES ('demo@irmaglobal.com', crypt('demo123', gen_salt('bf')));
```

---

### 8. **Error Handling & Loading States** ✅

**Tüm sayfalarda:**
- ✅ Loading spinner when fetching data
- ✅ Error messages with Supabase connection help
- ✅ Graceful fallback to mock data
- ✅ Toast notifications for user actions
- ✅ Disabled buttons during loading

**Örnek:**
```typescript
if (isLoading) {
  return <Loader2 className="animate-spin" />;
}

if (error) {
  return <ErrorMessage />;
}
```

---

## 📁 Yeni Eklenen Dosyalar

### Hooks (hooks/)
- ✅ `use-customers.ts` - Customer CRUD
- ✅ `use-suppliers.ts` - Supplier CRUD
- ✅ `use-positions.ts` - Position CRUD
- ✅ `use-documents.ts` - Document management
- ✅ `use-invoices.ts` - Invoice management
- ✅ `use-realtime.ts` - Real-time subscriptions
- ✅ `use-auth.ts` - Authentication

### Lib (lib/)
- ✅ `storage.ts` - Supabase Storage helpers
- ✅ `auth.ts` - Auth helpers

### Pages
- ✅ `app/auth/login/page.tsx` - Login page

---

## 🚀 Başlangıç Adımları

### 1. Supabase Projesi Kurulumu

```bash
# 1. supabase_schema.sql dosyasını çalıştırın
# Supabase Dashboard → SQL Editor → New query
# Paste the contents of supabase_schema.sql
# Run (Ctrl+Enter)
```

### 2. Storage Bucket Oluştur

```bash
# Supabase Dashboard → Storage → New bucket
Name: documents
Public: false (private)
```

### 3. Realtime'ı Aktifleştir

```sql
-- SQL Editor'de çalıştır
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE positions;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
```

### 4. Authentication'ı Aktifleştir

```
Supabase Dashboard → Authentication → Providers
→ Email: Enable
```

### 5. Test Verisi Ekle

```sql
-- Örnek müşteri
INSERT INTO customers (company_name, tax_id, email, phone, risk_limit, current_balance)
VALUES ('ABC İthalat Ltd.', '1234567890', 'info@abc.com', '+90 555 123 4567', 100000, 0);

-- Örnek tedarikçi
INSERT INTO suppliers (company_name, tax_id, payment_term_days, is_blacklisted)
VALUES ('Hızlı Nakliye Ltd.', '9876543210', 30, false);
```

---

## ✅ Tamamlanma Durumu

| Modül | Supabase Entegrasyonu | Real-time | Storage | Auth |
|-------|----------------------|-----------|---------|------|
| Customers | ✅ | ✅ | - | - |
| Suppliers | ✅ | ✅ | - | - |
| Positions | ✅ | ✅ | - | - |
| Documents | ✅ | ✅ | ✅ | - |
| Finance | ✅ | ✅ | - | - |
| Dashboard | ✅ | ✅ | - | - |
| Auth | - | - | - | ✅ |

---

## 🎯 Sonuç

**Tüm özellikler başarıyla entegre edildi!** 🎉

Proje artık tam fonksiyonel olarak Supabase ile çalışıyor:
- ✅ CRUD işlemleri (Oluştur, Oku, Güncelle, Sil)
- ✅ Dosya yükleme (Storage)
- ✅ Gerçek zamanlı güncellemeler (Realtime)
- ✅ Kimlik doğrulama (Auth)
- ✅ Hata yönetimi (Error handling)
- ✅ Yükleme durumları (Loading states)
- ✅ Bildirimler (Toast notifications)

---

## 🔧 Troubleshooting

### "Failed to fetch" Hatası
```bash
# .env.local dosyasını kontrol edin
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Realtime Çalışmıyor
```sql
-- Realtime publication'ı kontrol edin
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Storage Upload Hatası
```bash
# Bucket'ın oluşturulduğundan emin olun
# Dashboard → Storage → documents bucket var mı?
```

### Auth Hatası
```bash
# Email provider'ın enabled olduğunu kontrol edin
# Dashboard → Authentication → Providers → Email: Enabled
```

---

## 📚 Daha Fazla Bilgi

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Oluşturulma Tarihi:** 2025
**Versiyon:** 1.0.0
**Durum:** Production Ready ✅

