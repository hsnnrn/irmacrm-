-- customer_payments tablosuna movement_type kolonu ekleme
-- BORC: Müşterinin borcu (fatura, masraf vb.)
-- ALACAK: Müşteriden tahsil edilen ödeme (havale, nakit vb.)

ALTER TABLE customer_payments
  ADD COLUMN IF NOT EXISTS movement_type TEXT NOT NULL DEFAULT 'ALACAK'
    CHECK (movement_type IN ('BORC', 'ALACAK'));

COMMENT ON COLUMN customer_payments.movement_type IS 'Hareket tipi: BORC (müşteri borcu) veya ALACAK (tahsilat).';
