-- Pozisyon ödemeleri tablosu
-- Yakıt parası, şoför harcırahı, avans gibi ödemeleri kaydetmek için

CREATE TABLE IF NOT EXISTS position_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE NOT NULL,
  
  -- Ödeme Bilgileri
  payment_type TEXT NOT NULL CHECK (payment_type IN ('FUEL', 'DRIVER_EXPENSE', 'ADVANCE', 'TOLL', 'PARKING', 'OTHER')),
  description TEXT, -- Ödeme açıklaması (örnek: "Yakıt parası - İstanbul-Ankara")
  amount DECIMAL(15,2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'TRY',
  exchange_rate DECIMAL(10,4), -- Ödeme yapıldığı andaki kur (TRY'ye çevirmek için)
  
  -- Tarih Bilgileri
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- İlişkiler
  created_by UUID REFERENCES profiles(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_position_payments_position_id ON position_payments(position_id);
CREATE INDEX IF NOT EXISTS idx_position_payments_payment_date ON position_payments(payment_date);

-- RLS Policy
ALTER TABLE position_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON position_payments
FOR ALL USING (auth.role() = 'authenticated');

-- Comment
COMMENT ON TABLE position_payments IS 'Pozisyonlara yapılan ödemeler (yakıt, harcırah, avans vb.)';
COMMENT ON COLUMN position_payments.payment_type IS 'Ödeme tipi: FUEL (Yakıt), DRIVER_EXPENSE (Şoför Harcırahı), ADVANCE (Avans), TOLL (Köprü/Otoyol), PARKING (Otopark), OTHER (Diğer)';
COMMENT ON COLUMN position_payments.exchange_rate IS 'Ödeme yapıldığı andaki döviz kuru (TRY karşılığını hesaplamak için)';
