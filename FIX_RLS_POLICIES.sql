-- RLS Politikalarını Düzenleme (GÜNCELLENDİ - TAM YETKİ - İNVOCIES DAHİL)
-- Bu SQL komutları, 401 hatalarını çözmek için okuma VE yazma izinlerini herkese açar.
-- Geliştirme aşamasında auth sorunlarıyla uğraşmamak için bu ayar önerilir.
-- Supabase SQL Editor üzerinden çalıştırın.

-- 1. Mevcut kısıtlayıcı politikaları temizle
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON positions;
DROP POLICY IF EXISTS "Allow public read access" ON positions;
DROP POLICY IF EXISTS "Allow authenticated write access" ON positions;
DROP POLICY IF EXISTS "Allow authenticated update access" ON positions;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON positions;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow public read access" ON customers;
DROP POLICY IF EXISTS "Allow authenticated write access" ON customers;
DROP POLICY IF EXISTS "Allow authenticated update access" ON customers;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON customers;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Allow public read access" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated write access" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated update access" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON suppliers;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Allow public read access" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated write access" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated update access" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON invoices;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON exchange_rates;
DROP POLICY IF EXISTS "Allow public read access" ON exchange_rates;
DROP POLICY IF EXISTS "Allow authenticated write access" ON exchange_rates;
DROP POLICY IF EXISTS "Allow authenticated update access" ON exchange_rates;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON exchange_rates;

-- 2. Positions Tablosu - Herkese Tam Yetki
CREATE POLICY "Allow full access" ON positions FOR ALL USING (true) WITH CHECK (true);

-- 3. Customers Tablosu - Herkese Tam Yetki
CREATE POLICY "Allow full access" ON customers FOR ALL USING (true) WITH CHECK (true);

-- 4. Suppliers Tablosu - Herkese Tam Yetki
CREATE POLICY "Allow full access" ON suppliers FOR ALL USING (true) WITH CHECK (true);

-- 5. Invoices Tablosu - Herkese Tam Yetki
CREATE POLICY "Allow full access" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- 6. Exchange Rates Tablosu - Herkese Tam Yetki (Eğer tablo varsa)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exchange_rates') THEN
        CREATE POLICY "Allow full access" ON exchange_rates FOR ALL USING (true) WITH CHECK (true);
        RAISE NOTICE 'Exchange rates table found - RLS policy created';
    ELSE
        RAISE NOTICE 'Exchange rates table not found - skipping policy creation';
    END IF;
END $$;

-- 7. Exchange Rates Tablosu Oluştur (Eğer Yoksa)
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL UNIQUE,
    currency_name VARCHAR(50),
    buying_rate DECIMAL(10, 4),
    selling_rate DECIMAL(10, 4),
    effective_date DATE DEFAULT CURRENT_DATE,
    source VARCHAR(20) DEFAULT 'TCMB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Not: Production'a geçerken bu politikaları "auth.role() = 'authenticated'" şeklinde güncellemelisiniz.
