-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM Types (Standartlaştırma için)
CREATE TYPE position_status AS ENUM ('DRAFT', 'READY_TO_DEPART', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED');
CREATE TYPE currency_code AS ENUM ('TRY', 'USD', 'EUR', 'RUB');
CREATE TYPE doc_type AS ENUM ('DRIVER_LICENSE', 'VEHICLE_LICENSE', 'INSURANCE', 'TRANSPORT_CONTRACT', 'CMR', 'SALES_INVOICE', 'PURCHASE_INVOICE');

-- 3. Profiles (Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'OPERATOR' CHECK (role IN ('ADMIN', 'OPERATOR', 'VIEWER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  tax_id TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  risk_limit DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  -- Geçen yıldan devreden toplam borç
  previous_year_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
  account_currency currency_code NOT NULL DEFAULT 'TRY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Suppliers (Tedarikçiler / Nakliyeciler)
CREATE TABLE suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL, -- Şahıs şirketi veya Lojistik firması
  tax_id TEXT,
  payment_term_days INT DEFAULT 30, -- Vade günü
  is_blacklisted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Positions (Operasyon Kartları - Ana Tablo)
CREATE TABLE positions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position_no SERIAL, -- Otomatik artan (Örn: 101, 102...)
  customer_id UUID REFERENCES customers(id),
  supplier_id UUID REFERENCES suppliers(id),
  
  -- Rota Bilgileri
  loading_point TEXT NOT NULL,
  unloading_point TEXT NOT NULL,
  cargo_description TEXT,
  
  -- Finansal Özet (Ana Para Birimine Çevrilmiş)
  sales_price DECIMAL(15,2),
  sales_currency currency_code DEFAULT 'USD',
  cost_price DECIMAL(15,2),
  cost_currency currency_code DEFAULT 'USD',
  estimated_profit DECIMAL(15,2), -- Trigger ile hesaplanabilir veya app tarafında
  
  -- Döviz Kuru Snapshot (Pozisyon oluşturulduğu andaki kurlar)
  exchange_rates_snapshot JSONB, -- {"USD_TRY": 34.50, "EUR_TRY": 37.20, "RUB_TRY": 0.35}
  
  -- Durum ve Kilitler
  status position_status DEFAULT 'DRAFT',
  
  -- Tedarikçi Referans Yönetimi
  supplier_ref_no TEXT, -- Sistem tarafından üretilecek unique kod
  
  -- Tarihler
  departure_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Route Stops (Ara Duraklar)
CREATE TABLE route_stops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  stop_order INT NOT NULL, -- 1, 2, 3 sıra numarası
  stop_type TEXT CHECK (stop_type IN ('PICKUP', 'DROP', 'CUSTOMS', 'TRANSFER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Documents (Dökümanlar ve Kilit Sistemi İçin)
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  type doc_type NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  is_verified BOOLEAN DEFAULT FALSE, -- Operasyon yetkilisi onayı
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Invoices (Faturalar - Finansal Kilit İçin)
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  invoice_type TEXT CHECK (invoice_type IN ('SALES', 'PURCHASE')), -- Satış veya Alış
  amount DECIMAL(15,2) NOT NULL,
  currency currency_code NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE, -- Vade Tarihi
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) - Basic Setup
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Operatörler her şeyi görebilir ve düzenleyebilir (Basit kural, production'da özelleştirilmeli)
CREATE POLICY "Enable all access for authenticated users" ON positions
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON customers
FOR ALL USING (auth.role() = 'authenticated');

-- Örnek veri girişi (Opsiyonel - Test için)
-- INSERT INTO customers (company_name) VALUES ('Örnek İthalat Ltd. Şti.');