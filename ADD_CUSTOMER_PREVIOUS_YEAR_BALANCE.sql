-- Müşteri cari hesap devreden bakiye alanı
-- Geçen yıldan devreden toplam borç bilgisini tutar

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS previous_year_balance DECIMAL(18,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN customers.previous_year_balance IS 'Geçen yıldan devreden toplam borç (cari hesap açılış bakiyesi)';

