-- 🚨 POSITION_PAYMENTS TABLOSU RLS DÜZELTMESİ
-- 409 hatası için RLS politikalarını düzeltir
-- Supabase SQL Editor'da çalıştırın

-- 1. Mevcut politikaları temizle
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON position_payments;
DROP POLICY IF EXISTS "Allow public read access" ON position_payments;
DROP POLICY IF EXISTS "Allow authenticated write access" ON position_payments;
DROP POLICY IF EXISTS "Allow authenticated update access" ON position_payments;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON position_payments;

-- 2. SEÇENEK A: RLS'Yİ TAMAMEN KALDIR (EN KOLAY ÇÖZÜM)
-- Bu komut RLS'yi tamamen devre dışı bırakır, hiçbir policy'ye ihtiyaç kalmaz
ALTER TABLE position_payments DISABLE ROW LEVEL SECURITY;

-- 3. FOREIGN KEY CONSTRAINT'İ KONTROL ET VE GEREKİRSE DÜZELT
-- created_by için NULL değerine izin ver (zaten var ama emin olmak için)
ALTER TABLE position_payments ALTER COLUMN created_by DROP NOT NULL;

-- 3. SEÇENEK B: EĞER RLS'Yİ AÇIK TUTMAK İSTİYORSANIZ (Yukarıdaki komutu çalıştırmayın)
-- Aşağıdaki politikaları kullanın - tüm authenticated kullanıcılara tam erişim verir
/*
ALTER TABLE position_payments ENABLE ROW LEVEL SECURITY;

-- SELECT (Okuma) için policy
CREATE POLICY "Allow authenticated users to read payments" ON position_payments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT (Ekleme) için policy
CREATE POLICY "Allow authenticated users to insert payments" ON position_payments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE (Güncelleme) için policy
CREATE POLICY "Allow authenticated users to update payments" ON position_payments
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- DELETE (Silme) için policy
CREATE POLICY "Allow authenticated users to delete payments" ON position_payments
  FOR DELETE
  USING (auth.role() = 'authenticated');
*/

-- 4. Kontrol: RLS durumunu kontrol et
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'position_payments';

-- Eğer rowsecurity = false ise RLS kapalı, true ise açık
