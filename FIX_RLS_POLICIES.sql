-- RLS Politikalarını Düzenleme (GÜNCELLENDİ - TAM YETKİ)
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

-- 2. Positions Tablosu - Herkese Tam Yetki
CREATE POLICY "Allow full access" ON positions FOR ALL USING (true) WITH CHECK (true);

-- 3. Customers Tablosu - Herkese Tam Yetki
CREATE POLICY "Allow full access" ON customers FOR ALL USING (true) WITH CHECK (true);

-- 4. Suppliers Tablosu - Herkese Tam Yetki
CREATE POLICY "Allow full access" ON suppliers FOR ALL USING (true) WITH CHECK (true);

-- Not: Production'a geçerken bu politikaları "auth.role() = 'authenticated'" şeklinde güncellemelisiniz.
