-- Pozisyonlara özel kur bilgilerini saklamak için yeni kolonlar ekleme
-- Bu kolonlar, pozisyon oluşturulurken kullanılan ve kullanıcının değiştirebildiği kurları saklar.

ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS sales_exchange_rate DECIMAL(10, 4) DEFAULT 1,
ADD COLUMN IF NOT EXISTS cost_exchange_rate DECIMAL(10, 4) DEFAULT 1;

-- Eski kayıtlar için varsayılan değerler (Opsiyonel, zaten DEFAULT 1 var)
-- UPDATE positions SET sales_exchange_rate = 1, cost_exchange_rate = 1 WHERE sales_exchange_rate IS NULL;

