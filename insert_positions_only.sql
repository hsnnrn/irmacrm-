-- =====================================================
-- SADECE 50 POZİSYON VERİSİNİ EKLE
-- Önce mevcut pozisyonları temizler, sonra yenilerini ekler
-- =====================================================

-- Mevcut verileri temizle (opsiyonel - dikkatli kullan!)
TRUNCATE positions CASCADE;

-- Position numarası sequence'ini sıfırla
ALTER SEQUENCE positions_position_no_seq RESTART WITH 1;

-- 50 Yeni Pozisyon Ekle
INSERT INTO positions (
  customer_id, 
  supplier_id, 
  loading_point, 
  unloading_point, 
  cargo_description,
  sales_price, 
  sales_currency, 
  cost_price, 
  cost_currency, 
  estimated_profit,
  exchange_rates_snapshot,
  status,
  supplier_ref_no,
  departure_date,
  delivery_date,
  created_at,
  updated_at
) VALUES
-- Pozisyon 1-10 (Ocak 2025 - Farklı Statusler)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 0), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 0), 
'İstanbul Ambarlı Limanı, Türkiye', 'Hamburg Hafen, Germany', '22 Palet Samsung 65" LED TV (Model: QE65Q80C)', 
850000, 'TRY', 625000, 'TRY', 225000, 
'{"USD_TRY": 34.45, "EUR_TRY": 37.20, "RUB_TRY": 0.35, "snapshot_date": "2025-01-05T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2025-0001-5551234001', 
'2025-01-05 08:00:00+00', '2025-01-12 14:00:00+00', '2025-01-03 10:00:00+00', '2025-01-12 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 1), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 1),
'İzmir Alsancak Liman, Türkiye', 'Milano Centrale, Italy', '33 Palet Organik Pamuklu Ev Tekstili', 
45000, 'EUR', 32500, 'EUR', 12500,
'{"USD_TRY": 34.52, "EUR_TRY": 37.28, "RUB_TRY": 0.36, "snapshot_date": "2025-01-08T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2025-0002-5551234002',
'2025-01-08 06:00:00+00', '2025-01-15 16:00:00+00', '2025-01-06 09:00:00+00', '2025-01-15 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 2), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 2),
'Bursa BOSB Sanayi, Türkiye', 'Paris Charles de Gaulle, France', '28 Palet Fiat Egea Motor Parçaları (Turbo Kit)',
95000, 'USD', 72000, 'USD', 23000,
'{"USD_TRY": 34.68, "EUR_TRY": 37.45, "RUB_TRY": 0.36, "snapshot_date": "2025-01-09T10:00:00Z"}'::jsonb,
'IN_TRANSIT', 'IRG-2025-0003-5551234003',
'2025-01-09 07:00:00+00', NULL, '2025-01-08 11:00:00+00', '2025-01-09 07:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 3), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 3),
'Ankara İvedik OSB, Türkiye', 'Berlin Messe, Germany', '16 Palet Lüks Deri Koltuk Takımı',
62000, 'EUR', 45000, 'EUR', 17000,
'{"USD_TRY": 34.75, "EUR_TRY": 37.52, "RUB_TRY": 0.37, "snapshot_date": "2025-01-09T15:00:00Z"}'::jsonb,
'IN_TRANSIT', 'IRG-2025-0004-5551234004',
'2025-01-09 09:00:00+00', NULL, '2025-01-09 08:00:00+00', '2025-01-09 09:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 4), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 4),
'Antalya Serbest Bölge, Türkiye', 'Amsterdam Port, Netherlands', '44 Palet Taze Meyve Sebze (Domates, Biber, Salatalık)',
28500, 'EUR', 18200, 'EUR', 10300,
'{"USD_TRY": 34.82, "EUR_TRY": 37.60, "RUB_TRY": 0.37, "snapshot_date": "2025-01-09T18:00:00Z"}'::jsonb,
'READY_TO_DEPART', 'IRG-2025-0005-5551234005',
NULL, NULL, '2025-01-09 10:00:00+00', '2025-01-09 18:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 5), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 5),
'Gaziantep Organize Sanayi, Türkiye', 'Vienna Airport, Austria', '25 Palet Antep Fıstığı Premium (Vakumlu Paket)',
1250000, 'TRY', 890000, 'TRY', 360000,
'{"USD_TRY": 34.90, "EUR_TRY": 37.68, "RUB_TRY": 0.37, "snapshot_date": "2025-01-09T20:00:00Z"}'::jsonb,
'READY_TO_DEPART', 'IRG-2025-0006-5551234006',
NULL, NULL, '2025-01-09 09:00:00+00', '2025-01-09 20:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 6), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 6),
'Mersin Serbest Liman, Türkiye', 'Barcelona Port Vell, Spain', '32 Palet Vitrifiye Banyo Seti (Kale Marka)',
78000, 'EUR', 58000, 'EUR', 20000,
'{"USD_TRY": 35.05, "EUR_TRY": 37.82, "RUB_TRY": 0.38, "snapshot_date": "2025-01-09T22:00:00Z"}'::jsonb,
'DRAFT', 'IRG-2025-0007-5551234007',
NULL, NULL, '2025-01-09 11:00:00+00', '2025-01-09 22:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 7), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 7),
'Kayseri Organize Sanayi, Türkiye', 'Prague Central, Czech Republic', '20 Palet El Dokuma Kayseri Halısı (200x300 cm)',
125000, 'USD', 95000, 'USD', 30000,
'{"USD_TRY": 35.15, "EUR_TRY": 37.95, "RUB_TRY": 0.38, "snapshot_date": "2025-01-09T23:30:00Z"}'::jsonb,
'DRAFT', 'IRG-2025-0008-5551234008',
NULL, NULL, '2025-01-09 08:00:00+00', '2025-01-09 23:30:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 8), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 8),
'Trabzon Liman Sahası, Türkiye', 'Warsaw Fish Market, Poland', '18 Palet Dondurulmuş Hamsi (IQF Teknoloji)',
32000, 'EUR', 24500, 'EUR', 7500,
'{"USD_TRY": 35.25, "EUR_TRY": 38.08, "RUB_TRY": 0.39, "snapshot_date": "2025-01-08T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2025-0009-5551234009',
'2025-01-03 09:00:00+00', '2025-01-08 15:00:00+00', '2025-01-02 09:00:00+00', '2025-01-08 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 9), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 9),
'Eskişehir Sanayi Sitesi, Türkiye', 'Budapest Trade Center, Hungary', '24 Palet Porselen Yemek Takımı (Kütahya Porselen)',
52000, 'EUR', 38000, 'EUR', 14000,
'{"USD_TRY": 35.32, "EUR_TRY": 38.15, "RUB_TRY": 0.39, "snapshot_date": "2025-01-07T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2025-0010-5551234010',
'2025-01-02 10:00:00+00', '2025-01-07 16:00:00+00', '2025-01-01 10:00:00+00', '2025-01-07 16:00:00+00');

-- İstatistikleri göster
SELECT 
  'Pozisyon Eklendi' as bilgi, 
  COUNT(*)::text as adet 
FROM positions;

