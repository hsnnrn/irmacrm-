-- position_trips: ek seferler (pozisyon başına birden fazla sefer)
-- Idempotent: güvenle tekrar çalıştırılabilir.

CREATE TABLE IF NOT EXISTS position_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id uuid NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  trip_no integer NOT NULL DEFAULT 1,
  loading_point text NOT NULL,
  unloading_point text NOT NULL,
  cargo_description text,
  departure_date date,
  delivery_date date,
  notes text,
  sales_price decimal(15,2),
  sales_currency text DEFAULT 'EUR',
  cost_price decimal(15,2),
  cost_currency text DEFAULT 'EUR',
  sales_exchange_rate decimal(15,6),
  cost_exchange_rate decimal(15,6),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS sales_price decimal(15,2);
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS sales_currency text DEFAULT 'EUR';
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS cost_price decimal(15,2);
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS cost_currency text DEFAULT 'EUR';
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS sales_exchange_rate decimal(15,6);
ALTER TABLE position_trips ADD COLUMN IF NOT EXISTS cost_exchange_rate decimal(15,6);

CREATE OR REPLACE FUNCTION set_trip_no()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(trip_no), 0) + 1
  INTO NEW.trip_no
  FROM position_trips
  WHERE position_id = NEW.position_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_set_trip_no ON position_trips;
CREATE TRIGGER auto_set_trip_no
  BEFORE INSERT ON position_trips
  FOR EACH ROW
  EXECUTE FUNCTION set_trip_no();

ALTER TABLE position_trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view position trips" ON position_trips;
CREATE POLICY "Authenticated users can view position trips"
  ON position_trips FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert position trips" ON position_trips;
CREATE POLICY "Authenticated users can insert position trips"
  ON position_trips FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update position trips" ON position_trips;
CREATE POLICY "Authenticated users can update position trips"
  ON position_trips FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete position trips" ON position_trips;
CREATE POLICY "Authenticated users can delete position trips"
  ON position_trips FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_position_trips_position_id ON position_trips(position_id);

NOTIFY pgrst, 'reload schema';
