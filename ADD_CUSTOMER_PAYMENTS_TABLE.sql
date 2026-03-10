-- Müşteri ödemeleri tablosu
-- Müşteriden tahsil edilen ödemeleri (havale, nakit vb.) kaydetmek için

CREATE TABLE IF NOT EXISTS customer_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,

  -- Hareket Tipi
  movement_type TEXT NOT NULL DEFAULT 'ALACAK'
    CHECK (movement_type IN ('BORC', 'ALACAK')),

  -- Ödeme Bilgileri
  description TEXT,         -- Ödeme açıklaması (örnek: "Havale - Ocak navlunları")
  invoice_no TEXT,          -- İlgili fatura / makbuz numarası
  amount DECIMAL(15,2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'TRY',

  -- Tarih Bilgileri
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer_id
  ON customer_payments(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_payments_payment_date
  ON customer_payments(payment_date);

-- RLS
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON customer_payments
FOR ALL USING (auth.role() = 'authenticated');

-- Açıklamalar
COMMENT ON TABLE customer_payments IS 'Müşteriden tahsil edilen cari ödemeler (havale, nakit vb.).';
COMMENT ON COLUMN customer_payments.invoice_no IS 'Ödeme ile ilişkilendirilen fatura veya makbuz numarası.';
COMMENT ON COLUMN customer_payments.amount IS 'Müşteriden tahsil edilen tutar.';
COMMENT ON COLUMN customer_payments.payment_date IS 'Ödeme tarihi.';

