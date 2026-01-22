-- =====================================================
-- İRMA CRM - 50 DETAYLI POZİSYON KAYDI (TAM VERSİYON)
-- Doğrudan Supabase SQL Editor'de çalıştırın
-- =====================================================

-- ADIM 1: Mevcut verileri temizle
DELETE FROM invoices WHERE position_id IN (SELECT id FROM positions);
DELETE FROM documents WHERE position_id IN (SELECT id FROM positions);
DELETE FROM route_stops WHERE position_id IN (SELECT id FROM positions);
TRUNCATE positions CASCADE;
ALTER SEQUENCE positions_position_no_seq RESTART WITH 1;

-- ADIM 2: 50 Pozisyon Ekle (Kopyala-yapıştır yapın)
-- seed_data.sql dosyasından satır 151-523 arasını buraya kopyalayın

-- VEYA aşağıdaki komutu kullanarak doğrudan seed_data.sql'den çalıştırın:
-- Supabase SQL Editor'de seed_data.sql dosyasını açın
-- Satır 151'den 523'e kadar olan INSERT komutunu kopyalayın
-- Bu dosyaya yapıştırın

-- İşte başlangıç:
-- INSERT INTO positions (
--   customer_id, 
--   supplier_id, 
--   loading_point, 
--   unloading_point, 
--   cargo_description,
--   ...
-- ) VALUES
-- ((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 0), ...

-- ADIM 3: Kontrol
SELECT 'Eklenen Pozisyon' as bilgi, COUNT(*)::text as sayi FROM positions;
SELECT status, COUNT(*) as adet FROM positions GROUP BY status ORDER BY adet DESC;

