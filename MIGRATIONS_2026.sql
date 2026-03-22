-- =============================================================================
-- MIGRATIONS_2026.sql
-- Tüm yeni değişiklikleri Supabase SQL Editor'de çalıştırın.
-- =============================================================================

-- ─── 1. Pozisyonlara araç plakası alanı ───────────────────────────────────────
ALTER TABLE positions ADD COLUMN IF NOT EXISTS vehicle_plate TEXT;

-- ─── 2. supplier_ref_no otomatik oluşturma sekansı ────────────────────────────
CREATE SEQUENCE IF NOT EXISTS position_ref_seq START 1;

-- Mevcut pozisyonlar için sekansı ileri al
SELECT setval('position_ref_seq', COALESCE((SELECT MAX(position_no) FROM positions), 0));

-- ─── 3. supplier_ref_no otomatik oluşturma trigger'ı ──────────────────────────
CREATE OR REPLACE FUNCTION auto_generate_supplier_ref_no()
RETURNS TRIGGER AS $$
DECLARE
  seq_val BIGINT;
  year_str TEXT;
BEGIN
  IF NEW.supplier_ref_no IS NULL OR NEW.supplier_ref_no = '' THEN
    seq_val := nextval('position_ref_seq');
    year_str := EXTRACT(YEAR FROM NOW())::TEXT;
    NEW.supplier_ref_no := 'IRG-' || year_str || '-' || LPAD(seq_val::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_generate_supplier_ref_no ON positions;
CREATE TRIGGER trg_auto_generate_supplier_ref_no
  BEFORE INSERT ON positions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_supplier_ref_no();

-- ─── 4. Mevcut mükerrer ref_no'ları temizle ───────────────────────────────────
-- Aynı supplier_ref_no'ya sahip birden fazla kayıt varsa sonrakileri güncelle
WITH ranked AS (
  SELECT id,
         supplier_ref_no,
         ROW_NUMBER() OVER (PARTITION BY supplier_ref_no ORDER BY created_at ASC) AS rn
  FROM positions
  WHERE supplier_ref_no IS NOT NULL
),
dups AS (
  SELECT id, supplier_ref_no, rn
  FROM ranked
  WHERE rn > 1
)
UPDATE positions p
SET supplier_ref_no = p.supplier_ref_no || '-R' || d.rn
FROM dups d
WHERE p.id = d.id;

-- NULL olan ref_no'ları doldur
UPDATE positions
SET supplier_ref_no = 'IRG-' || EXTRACT(YEAR FROM created_at)::TEXT || '-' || LPAD(position_no::TEXT, 5, '0')
WHERE supplier_ref_no IS NULL OR supplier_ref_no = '';

-- ─── 5. supplier_ref_no UNIQUE constraint ────────────────────────────────────
ALTER TABLE positions DROP CONSTRAINT IF EXISTS positions_supplier_ref_no_unique;
ALTER TABLE positions ADD CONSTRAINT positions_supplier_ref_no_unique UNIQUE (supplier_ref_no);

-- ─── 6. position_trips tablosuna finansal alanlar ────────────────────────────
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS sales_price DECIMAL(15,2);
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS sales_currency TEXT DEFAULT 'EUR';
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS cost_price DECIMAL(15,2);
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS cost_currency TEXT DEFAULT 'EUR';
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS sales_exchange_rate DECIMAL(15,6);
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS cost_exchange_rate DECIMAL(15,6);
