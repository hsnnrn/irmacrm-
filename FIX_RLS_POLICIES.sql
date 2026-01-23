-- =====================================================
-- RLS POLİTİKALARI - AUTHENTICATED KULLANICILAR İÇİN
-- =====================================================
-- Bu SQL komutları, authenticated kullanıcıların tüm tablolara erişmesini sağlar.
-- Supabase SQL Editor üzerinden çalıştırın.

-- 1. Tüm tablolarda RLS'yi etkinleştir
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

-- 2. Mevcut politikaları temizle (Tüm olası policy isimlerini kapsar)
-- Positions
DROP POLICY IF EXISTS "Allow full access" ON positions;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON positions;
DROP POLICY IF EXISTS "Allow public read access" ON positions;
DROP POLICY IF EXISTS "Allow authenticated write access" ON positions;
DROP POLICY IF EXISTS "Allow authenticated update access" ON positions;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON positions;
DROP POLICY IF EXISTS "Authenticated users can read positions" ON positions;
DROP POLICY IF EXISTS "Authenticated users can insert positions" ON positions;
DROP POLICY IF EXISTS "Authenticated users can update positions" ON positions;
DROP POLICY IF EXISTS "Authenticated users can delete positions" ON positions;

-- Customers
DROP POLICY IF EXISTS "Allow full access" ON customers;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow public read access" ON customers;
DROP POLICY IF EXISTS "Allow authenticated write access" ON customers;
DROP POLICY IF EXISTS "Allow authenticated update access" ON customers;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON customers;
DROP POLICY IF EXISTS "Authenticated users can read customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON customers;

-- Suppliers
DROP POLICY IF EXISTS "Allow full access" ON suppliers;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Allow public read access" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated write access" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated update access" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can read suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can delete suppliers" ON suppliers;

-- Invoices
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can read invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON invoices;

-- Documents
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON documents;
DROP POLICY IF EXISTS "Authenticated users can read documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON documents;

-- Route Stops
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON route_stops;
DROP POLICY IF EXISTS "Authenticated users can read route_stops" ON route_stops;
DROP POLICY IF EXISTS "Authenticated users can insert route_stops" ON route_stops;
DROP POLICY IF EXISTS "Authenticated users can update route_stops" ON route_stops;
DROP POLICY IF EXISTS "Authenticated users can delete route_stops" ON route_stops;

-- 3. POSITIONS Tablosu - Authenticated kullanıcılar için tam yetki
CREATE POLICY "Authenticated users can read positions" ON positions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert positions" ON positions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update positions" ON positions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete positions" ON positions
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. CUSTOMERS Tablosu - Authenticated kullanıcılar için tam yetki
CREATE POLICY "Authenticated users can read customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert customers" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update customers" ON customers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete customers" ON customers
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. SUPPLIERS Tablosu - Authenticated kullanıcılar için tam yetki
CREATE POLICY "Authenticated users can read suppliers" ON suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update suppliers" ON suppliers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete suppliers" ON suppliers
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. INVOICES Tablosu - Authenticated kullanıcılar için tam yetki
CREATE POLICY "Authenticated users can read invoices" ON invoices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert invoices" ON invoices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update invoices" ON invoices
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete invoices" ON invoices
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. DOCUMENTS Tablosu - Authenticated kullanıcılar için tam yetki
CREATE POLICY "Authenticated users can read documents" ON documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert documents" ON documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents" ON documents
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents" ON documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- 8. ROUTE_STOPS Tablosu - Authenticated kullanıcılar için tam yetki
CREATE POLICY "Authenticated users can read route_stops" ON route_stops
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert route_stops" ON route_stops
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update route_stops" ON route_stops
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete route_stops" ON route_stops
  FOR DELETE USING (auth.role() = 'authenticated');
