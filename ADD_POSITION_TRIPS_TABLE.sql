-- Pozisyona ek sefer eklemek için position_trips tablosu
-- Bu tabloyu Supabase SQL Editor'de çalıştırın

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
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- trip_no otomatik artırma için fonksiyon
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

CREATE TRIGGER auto_set_trip_no
  BEFORE INSERT ON position_trips
  FOR EACH ROW
  EXECUTE FUNCTION set_trip_no();

-- RLS politikaları
ALTER TABLE position_trips ENABLE ROW LEVEL SECURITY;

-- Kimliği doğrulanmış kullanıcılar okuyabilir
CREATE POLICY "Authenticated users can view position trips"
  ON position_trips FOR SELECT
  TO authenticated
  USING (true);

-- Kimliği doğrulanmış kullanıcılar ekleyebilir (uygulama katmanında SUPER_ADMIN kontrolü yapılır)
CREATE POLICY "Authenticated users can insert position trips"
  ON position_trips FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Kimliği doğrulanmış kullanıcılar güncelleyebilir
CREATE POLICY "Authenticated users can update position trips"
  ON position_trips FOR UPDATE
  TO authenticated
  USING (true);

-- Kimliği doğrulanmış kullanıcılar silebilir
CREATE POLICY "Authenticated users can delete position trips"
  ON position_trips FOR DELETE
  TO authenticated
  USING (true);

-- İndeks
CREATE INDEX IF NOT EXISTS idx_position_trips_position_id ON position_trips(position_id);
