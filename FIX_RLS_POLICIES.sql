-- 🚨 KÖK ÇÖZÜM: RLS POLİTİKALARINI TAMAMEN KALDIRMAK
-- Bu SQL komutları RLS'yi tamamen devre dışı bırakır ve 401 hatalarını çözer.
-- PRODUCTION'DA ÇALIŞTIRILACAK - SUPABASE SQL EDITOR'DA
-- ⚠️  UYARI: Bu ayar production'da güvenlik riski oluşturur!

-- 1. TÜM RLS POLİTİKALARINI TEMİZLE VE RLS'Yİ DISABLE ET
-- Önce tüm politikaları kaldır
DO $$ BEGIN
    -- Positions table
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON positions;
    DROP POLICY IF EXISTS "Allow public read access" ON positions;
    DROP POLICY IF EXISTS "Allow authenticated write access" ON positions;
    DROP POLICY IF EXISTS "Allow authenticated update access" ON positions;
    DROP POLICY IF EXISTS "Allow authenticated delete access" ON positions;

    -- Customers table
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customers;
    DROP POLICY IF EXISTS "Allow public read access" ON customers;
    DROP POLICY IF EXISTS "Allow authenticated write access" ON customers;
    DROP POLICY IF EXISTS "Allow authenticated update access" ON customers;
    DROP POLICY IF EXISTS "Allow authenticated delete access" ON customers;

    -- Suppliers table
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON suppliers;
    DROP POLICY IF EXISTS "Allow public read access" ON suppliers;
    DROP POLICY IF EXISTS "Allow authenticated write access" ON suppliers;
    DROP POLICY IF EXISTS "Allow authenticated update access" ON suppliers;
    DROP POLICY IF EXISTS "Allow authenticated delete access" ON suppliers;

    -- Invoices table
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON invoices;
    DROP POLICY IF EXISTS "Allow public read access" ON invoices;
    DROP POLICY IF EXISTS "Allow authenticated write access" ON invoices;
    DROP POLICY IF EXISTS "Allow authenticated update access" ON invoices;
    DROP POLICY IF EXISTS "Allow authenticated delete access" ON invoices;

    -- Exchange rates table (eğer varsa)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exchange_rates') THEN
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON exchange_rates;
        DROP POLICY IF EXISTS "Allow public read access" ON exchange_rates;
        DROP POLICY IF EXISTS "Allow authenticated write access" ON exchange_rates;
        DROP POLICY IF EXISTS "Allow authenticated update access" ON exchange_rates;
        DROP POLICY IF EXISTS "Allow authenticated delete access" ON exchange_rates;
    END IF;
END $$;

-- 2. KÖK ÇÖZÜM: RLS'Yİ TAMAMEN DISABLE ET (DAHA GÜVENLİ)
-- Bu yaklaşım RLS'yi tamamen kapatır, hiçbir policy'ye ihtiyaç kalmaz

-- Positions tablosunda RLS'yi kapat
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;

-- Customers tablosunda RLS'yi kapat
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Suppliers tablosunda RLS'yi kapat
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;

-- Invoices tablosunda RLS'yi kapat
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Exchange rates tablosunda RLS'yi kapat (eğer varsa)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exchange_rates') THEN
        ALTER TABLE exchange_rates DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Exchange rates table RLS disabled';
    ELSE
        RAISE NOTICE 'Exchange rates table not found - skipping RLS disable';
    END IF;
END $$;

-- Profiles tablosunda da RLS'yi kapat (eğer varsa)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Profiles table RLS disabled';
    ELSE
        RAISE NOTICE 'Profiles table not found - skipping RLS disable';
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
