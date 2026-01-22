-- =====================================================
-- DATABASE MIGRATION SCRIPT
-- Önce bu dosyayı çalıştırın!
-- =====================================================

-- 1. Positions tablosuna exchange_rates_snapshot kolonu ekle
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS exchange_rates_snapshot JSONB;

-- 2. Kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'positions' 
AND column_name = 'exchange_rates_snapshot';

-- Başarılıysa "exchange_rates_snapshot | jsonb" satırını göreceksiniz

