-- Dashboard'ı doldurmak için örnek veri seti
-- Bu script:
-- 1. Örnek Müşteri ve Tedarikçiler ekler
-- 2. Son 6 aya yayılmış 20 Pozisyon ekler
-- 3. Bu pozisyonlara ait Faturalar ekler (Karlılık hesaplaması için)

-- Temizlik (Opsiyonel - mevcut verileri korumak isterseniz bu bloğu atlayın)
-- DELETE FROM invoices;
-- DELETE FROM positions;
-- DELETE FROM customers WHERE email LIKE '%@test.com';
-- DELETE FROM suppliers WHERE company_name LIKE '%Test Lojistik%';

-- 1. Müşteriler
INSERT INTO customers (id, company_name, contact_person, email, phone, risk_limit, current_balance) VALUES
(uuid_generate_v4(), 'Test İthalat A.Ş.', 'Ahmet Yılmaz', 'ahmet@test.com', '05551112233', 1000000, 50000),
(uuid_generate_v4(), 'Global Tekstil Ltd.', 'Ayşe Demir', 'ayse@test.com', '05554445566', 500000, 12000),
(uuid_generate_v4(), 'Mega Otomotiv', 'Mehmet Kaya', 'mehmet@test.com', '05321112233', 2000000, 0),
(uuid_generate_v4(), 'Tech Elektronik', 'Canan Yıldız', 'canan@test.com', '05334445566', 750000, 25000);

-- 2. Tedarikçiler
INSERT INTO suppliers (id, company_name, tax_id, payment_term_days) VALUES
(uuid_generate_v4(), 'Hızlı Lojistik', '1234567890', 30),
(uuid_generate_v4(), 'Güven Nakliyat', '9876543210', 45),
(uuid_generate_v4(), 'Avrupa Trans', '1122334455', 60);

-- 3. Pozisyonlar ve Faturalar (Döngü yerine tek tek insert ile rastgelelik)
-- Son 6 ay için veriler (Bugün: 2026-01-09 kabul edelim veya NOW())

DO $$
DECLARE
  cust_ids UUID[];
  supp_ids UUID[];
  pos_id UUID;
  i INT;
  rand_cust UUID;
  rand_supp UUID;
  rand_date TIMESTAMP;
  status_enum position_status;
  s_price DECIMAL;
  c_price DECIMAL;
  currency TEXT;
BEGIN
  -- ID'leri diziye al
  SELECT ARRAY(SELECT id FROM customers) INTO cust_ids;
  SELECT ARRAY(SELECT id FROM suppliers) INTO supp_ids;

  FOR i IN 1..20 LOOP
    -- Rastgele seçimler
    rand_cust := cust_ids[1 + floor(random() * array_length(cust_ids, 1))::int];
    rand_supp := supp_ids[1 + floor(random() * array_length(supp_ids, 1))::int];
    
    -- Son 180 gün içinde rastgele tarih
    rand_date := NOW() - (floor(random() * 180) || ' days')::interval;
    
    -- Rastgele durum (Ağırlıklı olarak tamamlanmış)
    IF i % 3 = 0 THEN status_enum := 'IN_TRANSIT';
    ELSIF i % 5 = 0 THEN status_enum := 'READY_TO_DEPART';
    ELSE status_enum := 'COMPLETED';
    END IF;

    -- Rastgele Fiyatlar
    s_price := floor(random() * 3000) + 2000; -- 2000-5000 arası
    c_price := s_price * (0.7 + random() * 0.2); -- %10-%30 kar marjı
    
    IF i % 2 = 0 THEN currency := 'EUR'; ELSE currency := 'USD'; END IF;

    pos_id := uuid_generate_v4();

    -- Pozisyon Ekle (exchange_rates_snapshot: şema ile uyumlu tek alan)
    INSERT INTO positions (
      id, position_no, customer_id, supplier_id, 
      loading_point, unloading_point, cargo_description,
      sales_price, sales_currency, cost_price, cost_currency,
      estimated_profit, status, created_at, updated_at,
      exchange_rates_snapshot
    ) VALUES (
      pos_id, 
      2025000 + i, 
      rand_cust, 
      rand_supp,
      'İstanbul, Türkiye', 
      CASE WHEN i % 2 = 0 THEN 'Berlin, Almanya' ELSE 'Moskova, Rusya' END,
      'Genel Kargo - ' || i || '. Parti',
      s_price, currency::currency_code,
      c_price, currency::currency_code,
      s_price - c_price,
      status_enum,
      rand_date,
      rand_date,
      (('{"USD_TRY":34.5,"EUR_TRY":37.2,"RUB_TRY":0.35,"sales_rate":' || (CASE WHEN currency = 'USD' THEN 34.50 ELSE 37.20 END) || ',"cost_rate":' || (CASE WHEN currency = 'USD' THEN 34.50 ELSE 37.20 END) || '}')::jsonb)
    );

    -- Satış Faturası Ekle
    INSERT INTO invoices (
      position_id, invoice_type, amount, currency, invoice_date, due_date, is_paid
    ) VALUES (
      pos_id, 'SALES', s_price, currency::currency_code, 
      rand_date::date, 
      (rand_date + interval '30 days')::date,
      status_enum = 'COMPLETED' -- Tamamlananlar ödenmiş olsun
    );

    -- Alış Faturası Ekle
    INSERT INTO invoices (
      position_id, invoice_type, amount, currency, invoice_date, due_date, is_paid
    ) VALUES (
      pos_id, 'PURCHASE', c_price, currency::currency_code, 
      rand_date::date, 
      (rand_date + interval '45 days')::date,
      status_enum = 'COMPLETED'
    );

  END LOOP;
END $$;

-- 4. Evrak Türleri (opsiyonel - yoksa oluşturun)
-- NOT: Bu bölüm, dinamik evrak türü yönetimi için document_types tablosunu kullanır.
-- Tabloyu henüz oluşturmadıysanız, aşağıdaki CREATE TABLE komutunu bir kez çalıştırın:
--
-- CREATE TABLE IF NOT EXISTS document_types (
--   id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--   type text NOT NULL UNIQUE, -- DRIVER_LICENSE, CMR vb.
--   label text NOT NULL,
--   is_required_for_departure boolean NOT NULL DEFAULT false,
--   is_required_for_close boolean NOT NULL DEFAULT false,
--   is_active boolean NOT NULL DEFAULT true,
--   created_at timestamptz NOT NULL DEFAULT now()
-- );
--
-- Öntanımlı sistem evrak türleri
INSERT INTO document_types (type, label, is_required_for_departure, is_required_for_close)
VALUES
  ('DRIVER_LICENSE', 'Sürücü Belgesi', true, false),
  ('VEHICLE_LICENSE', 'Araç Ruhsatı', true, false),
  ('INSURANCE', 'Sigorta Belgesi', true, false),
  ('TRANSPORT_CONTRACT', 'Taşıma Sözleşmesi', true, false),
  ('CMR', 'CMR (Teslimat Belgesi)', false, true),
  ('SALES_INVOICE', 'Satış Faturası', false, true),
  ('PURCHASE_INVOICE', 'Alış Faturası', false, true)
ON CONFLICT (code) DO NOTHING;


