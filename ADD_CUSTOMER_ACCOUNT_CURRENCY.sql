-- Müşteri cari hesap döviz cinsi (cari döviz)
-- Müşteriler sayfasında cari döviz ile giriş ve düzenleme için

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS account_currency currency_code NOT NULL DEFAULT 'TRY';

COMMENT ON COLUMN customers.account_currency IS 'Müşteri cari hesabının para birimi (risk limit ve bakiye bu dövizde tutulur)';
