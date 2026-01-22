-- =====================================================
-- İRMA CRM - 50 POZİSYON EKLE (SUPABASE İÇİN HAZIR)
-- =====================================================

-- ADIM 1: Mevcut verileri temizle
DELETE FROM invoices WHERE position_id IN (SELECT id FROM positions);
DELETE FROM documents WHERE position_id IN (SELECT id FROM positions);
DELETE FROM route_stops WHERE position_id IN (SELECT id FROM positions);
TRUNCATE positions CASCADE;
ALTER SEQUENCE positions_position_no_seq RESTART WITH 1;

-- ADIM 2: 50 Yeni Pozisyon Ekle
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
-- Pozisyon 1-10 (Ocak 2025 - FarklÄ± Statusler)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 0), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 0), 
'Ä°stanbul AmbarlÄ± LimanÄ±, TÃ¼rkiye', 'Hamburg Hafen, Germany', '22 Palet Samsung 65" LED TV (Model: QE65Q80C)', 
850000, 'TRY', 625000, 'TRY', 225000, 
'{"USD_TRY": 34.45, "EUR_TRY": 37.20, "RUB_TRY": 0.35, "snapshot_date": "2025-01-05T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2025-0001-5551234001', 
'2025-01-05 08:00:00+00', '2025-01-12 14:00:00+00', '2025-01-03 10:00:00+00', '2025-01-12 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 1), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 1),
'Ä°zmir Alsancak Liman, TÃ¼rkiye', 'Milano Centrale, Italy', '33 Palet Organik Pamuklu Ev Tekstili', 
45000, 'EUR', 32500, 'EUR', 12500,
'{"USD_TRY": 34.52, "EUR_TRY": 37.28, "RUB_TRY": 0.36, "snapshot_date": "2025-01-08T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2025-0002-5551234002',
'2025-01-08 06:00:00+00', '2025-01-15 16:00:00+00', '2025-01-06 09:00:00+00', '2025-01-15 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 2), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 2),
'Bursa BOSB Sanayi, TÃ¼rkiye', 'Paris Charles de Gaulle, France', '28 Palet Fiat Egea Motor ParÃ§alarÄ± (Turbo Kit)',
95000, 'USD', 72000, 'USD', 23000,
'{"USD_TRY": 34.68, "EUR_TRY": 37.45, "RUB_TRY": 0.36, "snapshot_date": "2025-01-09T10:00:00Z"}'::jsonb,
'IN_TRANSIT', 'IRG-2025-0003-5551234003',
'2025-01-09 07:00:00+00', NULL, '2025-01-08 11:00:00+00', '2025-01-09 07:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 3), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 3),
'Ankara Ä°vedik OSB, TÃ¼rkiye', 'Berlin Messe, Germany', '16 Palet LÃ¼ks Deri Koltuk TakÄ±mÄ±',
62000, 'EUR', 45000, 'EUR', 17000,
'{"USD_TRY": 34.75, "EUR_TRY": 37.52, "RUB_TRY": 0.37, "snapshot_date": "2025-01-09T15:00:00Z"}'::jsonb,
'IN_TRANSIT', 'IRG-2025-0004-5551234004',
'2025-01-09 09:00:00+00', NULL, '2025-01-09 08:00:00+00', '2025-01-09 09:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 4), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 4),
'Antalya Serbest BÃ¶lge, TÃ¼rkiye', 'Amsterdam Port, Netherlands', '44 Palet Taze Meyve Sebze (Domates, Biber, SalatalÄ±k)',
28500, 'EUR', 18200, 'EUR', 10300,
'{"USD_TRY": 34.82, "EUR_TRY": 37.60, "RUB_TRY": 0.37, "snapshot_date": "2025-01-09T18:00:00Z"}'::jsonb,
'READY_TO_DEPART', 'IRG-2025-0005-5551234005',
NULL, NULL, '2025-01-09 10:00:00+00', '2025-01-09 18:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 5), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 5),
'Gaziantep Organize Sanayi, TÃ¼rkiye', 'Vienna Airport, Austria', '25 Palet Antep FÄ±stÄ±ÄŸÄ± Premium (Vakumlu Paket)',
1250000, 'TRY', 890000, 'TRY', 360000,
'{"USD_TRY": 34.90, "EUR_TRY": 37.68, "RUB_TRY": 0.37, "snapshot_date": "2025-01-09T20:00:00Z"}'::jsonb,
'READY_TO_DEPART', 'IRG-2025-0006-5551234006',
NULL, NULL, '2025-01-09 09:00:00+00', '2025-01-09 20:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 6), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 6),
'Mersin Serbest Liman, TÃ¼rkiye', 'Barcelona Port Vell, Spain', '32 Palet Vitrifiye Banyo Seti (Kale Marka)',
78000, 'EUR', 58000, 'EUR', 20000,
'{"USD_TRY": 35.05, "EUR_TRY": 37.82, "RUB_TRY": 0.38, "snapshot_date": "2025-01-09T22:00:00Z"}'::jsonb,
'DRAFT', 'IRG-2025-0007-5551234007',
NULL, NULL, '2025-01-09 11:00:00+00', '2025-01-09 22:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 7), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 7),
'Kayseri Organize Sanayi, TÃ¼rkiye', 'Prague Central, Czech Republic', '20 Palet El Dokuma Kayseri HalÄ±sÄ± (200x300 cm)',
125000, 'USD', 95000, 'USD', 30000,
'{"USD_TRY": 35.15, "EUR_TRY": 37.95, "RUB_TRY": 0.38, "snapshot_date": "2025-01-09T23:30:00Z"}'::jsonb,
'DRAFT', 'IRG-2025-0008-5551234008',
NULL, NULL, '2025-01-09 08:00:00+00', '2025-01-09 23:30:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 8), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 8),
'Trabzon Liman SahasÄ±, TÃ¼rkiye', 'Warsaw Fish Market, Poland', '18 Palet DondurulmuÅŸ Hamsi (IQF Teknoloji)',
32000, 'EUR', 24500, 'EUR', 7500,
'{"USD_TRY": 35.25, "EUR_TRY": 38.08, "RUB_TRY": 0.39, "snapshot_date": "2025-01-08T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2025-0009-5551234009',
'2025-01-03 09:00:00+00', '2025-01-08 15:00:00+00', '2025-01-02 09:00:00+00', '2025-01-08 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 9), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 9),
'EskiÅŸehir Sanayi Sitesi, TÃ¼rkiye', 'Budapest Trade Center, Hungary', '24 Palet Porselen Yemek TakÄ±mÄ± (KÃ¼tahya Porselen)',
52000, 'EUR', 38000, 'EUR', 14000,
'{"USD_TRY": 35.32, "EUR_TRY": 38.15, "RUB_TRY": 0.39, "snapshot_date": "2025-01-07T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2025-0010-5551234010',
'2025-01-02 10:00:00+00', '2025-01-07 16:00:00+00', '2025-01-01 10:00:00+00', '2025-01-07 16:00:00+00'),

-- Pozisyon 11-20 (AralÄ±k 2024 - Ã‡eÅŸitli ÃœrÃ¼nler)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 10), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 10),
'Denizli Organize Sanayi, TÃ¼rkiye', 'Sofia Import Center, Bulgaria', '36 Palet LÃ¼ks Havlu ve Bornoz Seti (Bambu %100)',
48000, 'EUR', 35700, 'EUR', 12300,
'{"USD_TRY": 33.10, "EUR_TRY": 35.85, "RUB_TRY": 0.33, "snapshot_date": "2024-12-15T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0011-5551234011',
'2024-12-15 08:00:00+00', '2024-12-22 14:00:00+00', '2024-12-13 10:00:00+00', '2024-12-22 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 11), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 11),
'Samsun Liman BÃ¶lgesi, TÃ¼rkiye', 'Bucharest Industrial, Romania', '15 Palet CNC Torna Yedek ParÃ§alarÄ± (FANUC Uyumlu)',
82000, 'USD', 64500, 'USD', 17500,
'{"USD_TRY": 33.18, "EUR_TRY": 35.92, "RUB_TRY": 0.33, "snapshot_date": "2024-12-18T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0012-5551234012',
'2024-12-18 09:00:00+00', '2024-12-26 16:00:00+00', '2024-12-16 11:00:00+00', '2024-12-26 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 12), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 12),
'Konya Sanayi Sitesi, TÃ¼rkiye', 'Athens Construction Hub, Greece', '40 Palet YapÄ±ÅŸtÄ±rÄ±cÄ± ve Ä°zolasyon Malzemesi',
1150000, 'TRY', 845000, 'TRY', 305000,
'{"USD_TRY": 33.25, "EUR_TRY": 36.00, "RUB_TRY": 0.34, "snapshot_date": "2024-12-20T10:00:00Z"}'::jsonb,
'DELIVERED', 'IRG-2024-0013-5551234013',
'2024-12-20 10:00:00+00', '2024-12-28 15:00:00+00', '2024-12-18 09:00:00+00', '2024-12-28 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 13), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 13),
'Adana Merkez Hal, TÃ¼rkiye', 'Belgrade Farmers Market, Serbia', '52 Palet Organik Portakal ve Mandalina (ToptancÄ±)',
35500, 'EUR', 26200, 'EUR', 9300,
'{"USD_TRY": 33.32, "EUR_TRY": 36.08, "RUB_TRY": 0.34, "snapshot_date": "2024-12-22T10:00:00Z"}'::jsonb,
'DELIVERED', 'IRG-2024-0014-5551234014',
'2024-12-22 07:00:00+00', '2024-12-29 12:00:00+00', '2024-12-20 08:00:00+00', '2024-12-29 12:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 14), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 14),
'Kocaeli TÃ¼praÅŸ Rafinerisi, TÃ¼rkiye', 'Munich Chemical District, Germany', '24 Palet EndÃ¼striyel Polimer KimyasallarÄ± (ISO Tank)',
185000, 'EUR', 152000, 'EUR', 33000,
'{"USD_TRY": 33.38, "EUR_TRY": 36.15, "RUB_TRY": 0.34, "snapshot_date": "2024-12-25T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0015-5551234015',
'2024-12-26 08:00:00+00', '2025-01-02 17:00:00+00', '2024-12-24 10:00:00+00', '2025-01-02 17:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 15), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 15),
'Sakarya Hendek OSB, TÃ¼rkiye', 'Stuttgart Mercedes Plant, Germany', '22 Palet Mercedes Sprinter Yedek ParÃ§a',
128000, 'EUR', 98800, 'EUR', 29200,
'{"USD_TRY": 33.20, "EUR_TRY": 35.98, "RUB_TRY": 0.33, "snapshot_date": "2024-12-10T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0016-5551234016',
'2024-12-10 09:00:00+00', '2024-12-18 16:00:00+00', '2024-12-08 11:00:00+00', '2024-12-18 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 16), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 16),
'TekirdaÄŸ ÅarkÃ¶y BaÄŸlarÄ±, TÃ¼rkiye', 'Lyon Wine Expo, France', '30 Palet Premium Ã–zel Ãœretim Åarap (2019 Vintage)',
67500, 'EUR', 48900, 'EUR', 18600,
'{"USD_TRY": 33.15, "EUR_TRY": 35.90, "RUB_TRY": 0.33, "snapshot_date": "2024-12-08T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0017-5551234017',
'2024-12-08 08:00:00+00', '2024-12-16 14:00:00+00', '2024-12-06 09:00:00+00', '2024-12-16 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 17), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 17),
'Manisa Akhisar Depolama, TÃ¼rkiye', 'Rotterdam Food Terminal, Netherlands', '38 Palet Siyah Zeytin (Gemlik Tipi, Salamura)',
42800, 'EUR', 31900, 'EUR', 10900,
'{"USD_TRY": 33.08, "EUR_TRY": 35.82, "RUB_TRY": 0.32, "snapshot_date": "2024-12-05T10:00:00Z"}'::jsonb,
'CANCELLED', 'IRG-2024-0018-5551234018',
NULL, NULL, '2024-12-03 10:00:00+00', '2024-12-05 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 18), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 18),
'BalÄ±kesir Edremit KÃ¶rfezi, TÃ¼rkiye', 'Antwerp Commodity Exchange, Belgium', '26 Palet Naturel SÄ±zma ZeytinyaÄŸÄ± (5L Bidon)',
98000, 'EUR', 75500, 'EUR', 22500,
'{"USD_TRY": 33.02, "EUR_TRY": 35.75, "RUB_TRY": 0.32, "snapshot_date": "2024-12-03T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0019-5551234019',
'2024-12-03 08:00:00+00', '2024-12-11 15:00:00+00', '2024-12-01 11:00:00+00', '2024-12-11 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 19), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 19),
'Ã‡anakkale Seramik Fabrika, TÃ¼rkiye', 'Marseille Design District, France', '42 Palet LÃ¼ks Banyo Seramikleri (Yeni Koleksiyon)',
125500, 'EUR', 94200, 'EUR', 31300,
'{"USD_TRY": 32.98, "EUR_TRY": 35.68, "RUB_TRY": 0.32, "snapshot_date": "2024-12-01T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0020-5551234020',
'2024-12-01 09:00:00+00', '2024-12-09 16:00:00+00', '2024-11-29 10:00:00+00', '2024-12-09 16:00:00+00'),

-- Pozisyon 21-30 (KasÄ±m 2024 - Ã–zel Ä°hracat ÃœrÃ¼nleri)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 20), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 20),
'Ordu FÄ±ndÄ±k BorsasÄ±, TÃ¼rkiye', 'Genoa Chocolate Factory, Italy', '28 Palet Premium Tombul FÄ±ndÄ±k (KavrulmuÅŸ, 13-15mm)',
142000, 'USD', 108500, 'USD', 33500,
'{"USD_TRY": 32.85, "EUR_TRY": 35.55, "RUB_TRY": 0.31, "snapshot_date": "2024-11-25T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0021-5551234021',
'2024-11-25 08:00:00+00', '2024-12-03 14:00:00+00', '2024-11-23 10:00:00+00', '2024-12-03 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 21), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 21),
'Giresun Tirebolu Depolar, TÃ¼rkiye', 'Naples Ferrero Rocher Plant, Italy', '32 Palet Organik FÄ±ndÄ±k (SertifikalÄ±, Kabuksuz)',
115500, 'USD', 89000, 'USD', 26500,
'{"USD_TRY": 32.78, "EUR_TRY": 35.48, "RUB_TRY": 0.31, "snapshot_date": "2024-11-22T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0022-5551234022',
'2024-11-22 07:00:00+00', '2024-11-30 13:00:00+00', '2024-11-20 09:00:00+00', '2024-11-30 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 22), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 22),
'Rize Ã‡ay FabrikasÄ±, TÃ¼rkiye', 'London Harrods Warehouse, United Kingdom', '24 Palet Organik Karadeniz Ã‡ayÄ± (Premium Paket, AltÄ±n Serisi)',
72500, 'EUR', 54000, 'EUR', 18500,
'{"USD_TRY": 32.72, "EUR_TRY": 35.42, "RUB_TRY": 0.31, "snapshot_date": "2024-11-20T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0023-5551234023',
'2024-11-20 08:00:00+00', '2024-11-28 15:00:00+00', '2024-11-18 10:00:00+00', '2024-11-28 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 23), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 23),
'Hatay Ä°skenderun LimanÄ±, TÃ¼rkiye', 'Dubai Palm Jumeirah Storage, UAE', '34 Palet Defne Sabunu ve ZeytinyaÄŸÄ± (El YapÄ±mÄ±)',
68000, 'USD', 49500, 'USD', 18500,
'{"USD_TRY": 32.65, "EUR_TRY": 35.35, "RUB_TRY": 0.30, "snapshot_date": "2024-11-18T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0024-5551234024',
'2024-11-18 09:00:00+00', '2024-11-26 16:00:00+00', '2024-11-16 11:00:00+00', '2024-11-26 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 24), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 24),
'Malatya KayÄ±sÄ± BorsasÄ±, TÃ¼rkiye', 'Moscow GUM Department Store, Russia', '26 Palet Organik Kuru KayÄ±sÄ± (Jumbo Boy, SertifikalÄ±)',
2850000, 'RUB', 2150000, 'RUB', 700000,
'{"USD_TRY": 32.58, "EUR_TRY": 35.28, "RUB_TRY": 0.30, "snapshot_date": "2024-11-15T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0025-5551234025',
'2024-11-15 10:00:00+00', '2024-11-23 17:00:00+00', '2024-11-13 10:00:00+00', '2024-11-23 17:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 25), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 25),
'Erzurum PalandÃ¶ken Tesisleri, TÃ¼rkiye', 'Tbilisi Old Town Market, Georgia', '18 Palet Kars KaÅŸarÄ± ve Erzurum CaÄŸ Kebap Malzemesi',
42500, 'USD', 32800, 'USD', 9700,
'{"USD_TRY": 32.52, "EUR_TRY": 35.22, "RUB_TRY": 0.30, "snapshot_date": "2024-11-12T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0026-5551234026',
'2024-11-12 08:00:00+00', '2024-11-20 14:00:00+00', '2024-11-10 09:00:00+00', '2024-11-20 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 26), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 26),
'Van ErciÅŸ Mobilya OSB, TÃ¼rkiye', 'Baku Nizami District, Azerbaijan', '21 Palet El Ä°ÅŸÃ§iliÄŸi Ceviz Mobilya (Yatak OdasÄ± TakÄ±mÄ±)',
55000, 'USD', 41500, 'USD', 13500,
'{"USD_TRY": 32.45, "EUR_TRY": 35.15, "RUB_TRY": 0.29, "snapshot_date": "2024-11-10T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0027-5551234027',
'2024-11-10 07:00:00+00', '2024-11-18 13:00:00+00', '2024-11-08 10:00:00+00', '2024-11-18 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 27), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 27),
'DiyarbakÄ±r OSB Tekstil, TÃ¼rkiye', 'Tehran Grand Bazaar, Iran', '29 Palet El Dokuma Kilim ve HalÄ± (Geleneksel Motifler)',
64500, 'USD', 49200, 'USD', 15300,
'{"USD_TRY": 32.38, "EUR_TRY": 35.08, "RUB_TRY": 0.29, "snapshot_date": "2024-11-08T10:00:00Z"}'::jsonb,
'CANCELLED', 'IRG-2024-0028-5551234028',
NULL, NULL, '2024-11-06 11:00:00+00', '2024-11-08 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 28), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 28),
'ÅanlÄ±urfa Siverek Deposu, TÃ¼rkiye', 'Baghdad Central Market, Iraq', '38 Palet Ä°sot (Urfa Biberi), Sumak ve Baharatlar',
58000, 'USD', 43000, 'USD', 15000,
'{"USD_TRY": 32.32, "EUR_TRY": 35.02, "RUB_TRY": 0.29, "snapshot_date": "2024-11-05T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0029-5551234029',
'2024-11-05 08:00:00+00', '2024-11-13 14:00:00+00', '2024-11-03 10:00:00+00', '2024-11-13 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 29), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 29),
'Mardin Midyat TaÅŸ Ä°ÅŸleme, TÃ¼rkiye', 'Damascus Historic District, Syria', '12 Palet DoÄŸal TaÅŸ Dekorasyon ÃœrÃ¼nleri (El Ä°ÅŸlemesi)',
48500, 'USD', 36200, 'USD', 12300,
'{"USD_TRY": 32.25, "EUR_TRY": 34.95, "RUB_TRY": 0.28, "snapshot_date": "2024-11-03T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0030-5551234030',
'2024-11-03 07:00:00+00', '2024-11-11 13:00:00+00', '2024-11-01 09:00:00+00', '2024-11-11 13:00:00+00'),

-- Pozisyon 31-40 (Ekim 2024 - Sanayi ve Hammadde)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 30), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 30),
'Zonguldak TTK KÃ¶mÃ¼r Ä°ÅŸletmesi, TÃ¼rkiye', 'Constanta Energy Terminal, Romania', '48 Palet TaÅŸkÃ¶mÃ¼rÃ¼ (Kalorifer, 6000+ kcal/kg)',
685000, 'TRY', 512000, 'TRY', 173000,
'{"USD_TRY": 32.18, "EUR_TRY": 34.88, "RUB_TRY": 0.28, "snapshot_date": "2024-10-28T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0031-5551234031',
'2024-10-28 08:00:00+00', '2024-11-05 14:00:00+00', '2024-10-26 10:00:00+00', '2024-11-05 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 31), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 31),
'KarabÃ¼k Kardemir Fabrika, TÃ¼rkiye', 'Bratislava Steel Works, Slovakia', '36 Palet Hadde Profil Ã‡elik (S235JR, HEA 200)',
112000, 'EUR', 89500, 'EUR', 22500,
'{"USD_TRY": 32.12, "EUR_TRY": 34.82, "RUB_TRY": 0.28, "snapshot_date": "2024-10-25T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0032-5551234032',
'2024-10-25 09:00:00+00', '2024-11-02 15:00:00+00', '2024-10-23 11:00:00+00', '2024-11-02 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 32), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 32),
'BartÄ±n Ulus Kereste, TÃ¼rkiye', 'Ljubljana Furniture Center, Slovenia', '28 Palet Ä°ÅŸlenmiÅŸ MeÅŸe Kerestesi (4x20x300 cm)',
54500, 'EUR', 41000, 'EUR', 13500,
'{"USD_TRY": 32.05, "EUR_TRY": 34.75, "RUB_TRY": 0.27, "snapshot_date": "2024-10-22T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0033-5551234033',
'2024-10-22 08:00:00+00', '2024-10-30 14:00:00+00', '2024-10-20 10:00:00+00', '2024-10-30 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 33), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 33),
'Kastamonu Tosya Mobilya, TÃ¼rkiye', 'Zagreb Design Expo, Croatia', '19 Palet Modern Ofis MobilyasÄ± (Masa, Dolap, Koltuk)',
68000, 'EUR', 52500, 'EUR', 15500,
'{"USD_TRY": 31.98, "EUR_TRY": 34.68, "RUB_TRY": 0.27, "snapshot_date": "2024-10-20T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0034-5551234034',
'2024-10-20 07:00:00+00', '2024-10-28 13:00:00+00', '2024-10-18 09:00:00+00', '2024-10-28 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 34), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 34),
'Bolu YeniÃ§aÄŸa Orman, TÃ¼rkiye', 'Sarajevo Construction Market, Bosnia', '26 Palet Ã‡am ve Ladin Kereste (Ã‡atÄ± ve Ä°nÅŸaat)',
48000, 'EUR', 36800, 'EUR', 11200,
'{"USD_TRY": 31.92, "EUR_TRY": 34.62, "RUB_TRY": 0.27, "snapshot_date": "2024-10-18T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0035-5551234035',
'2024-10-18 08:00:00+00', '2024-10-26 14:00:00+00', '2024-10-16 10:00:00+00', '2024-10-26 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 35), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 35),
'DÃ¼zce KaÄŸÄ±t Fabrika, TÃ¼rkiye', 'Tirana Printing House, Albania', '32 Palet A4 Fotokopi KaÄŸÄ±dÄ± (80gr, Premium)',
72500, 'EUR', 56800, 'EUR', 15700,
'{"USD_TRY": 31.85, "EUR_TRY": 34.55, "RUB_TRY": 0.26, "snapshot_date": "2024-10-15T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0036-5551234036',
'2024-10-15 09:00:00+00', '2024-10-23 15:00:00+00', '2024-10-13 11:00:00+00', '2024-10-23 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 36), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 36),
'Yalova AltÄ±nova Tersanesi, TÃ¼rkiye', 'Skopje Energy Solutions, North Macedonia', '14 Palet Gemi Dizel Motor Yedek ParÃ§alarÄ±',
95500, 'EUR', 74200, 'EUR', 21300,
'{"USD_TRY": 31.78, "EUR_TRY": 34.48, "RUB_TRY": 0.26, "snapshot_date": "2024-10-12T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0037-5551234037',
'2024-10-12 10:00:00+00', '2024-10-20 16:00:00+00', '2024-10-10 10:00:00+00', '2024-10-20 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 37), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 37),
'Bilecik SÃ¶ÄŸÃ¼t Mermer OcaÄŸÄ±, TÃ¼rkiye', 'Podgorica Luxury Hotel Project, Montenegro', '22 Palet Beyaz Mermer Kaplama (60x120 cm, CilalÄ±)',
88000, 'EUR', 68500, 'EUR', 19500,
'{"USD_TRY": 31.72, "EUR_TRY": 34.42, "RUB_TRY": 0.26, "snapshot_date": "2024-10-10T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0038-5551234038',
'2024-10-10 08:00:00+00', '2024-10-18 14:00:00+00', '2024-10-08 09:00:00+00', '2024-10-18 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 38), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 38),
'KÄ±rklareli LÃ¼leburgaz SÃ¼t, TÃ¼rkiye', 'Pristina Dairy Coop, Kosovo', '24 Palet KaÅŸar ve Beyaz Peynir (Vakumlu, 500gr)',
46500, 'EUR', 35800, 'EUR', 10700,
'{"USD_TRY": 31.65, "EUR_TRY": 34.35, "RUB_TRY": 0.25, "snapshot_date": "2024-10-08T10:00:00Z"}'::jsonb,
'DELIVERED', 'IRG-2024-0039-5551234039',
'2024-10-08 07:00:00+00', '2024-10-16 13:00:00+00', '2024-10-06 10:00:00+00', '2024-10-16 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 39), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 39),
'Edirne KeÅŸan BuÄŸday Silosu, TÃ¼rkiye', 'Chisinau Bread Factory, Moldova', '60 Palet MakarnalÄ±k BuÄŸday (Durum, 1. SÄ±nÄ±f)',
1480000, 'TRY', 1125000, 'TRY', 355000,
'{"USD_TRY": 31.58, "EUR_TRY": 34.28, "RUB_TRY": 0.25, "snapshot_date": "2024-10-05T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0040-5551234040',
'2024-10-05 08:00:00+00', '2024-10-13 14:00:00+00', '2024-10-03 11:00:00+00', '2024-10-13 14:00:00+00'),

-- Pozisyon 41-50 (EylÃ¼l 2024 - Premium ve Niche ÃœrÃ¼nler)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 40), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 40),
'Amasya Merzifon Deposu, TÃ¼rkiye', 'Minsk Premium Market, Belarus', '35 Palet Amasya ElmasÄ± (Premium Starking, 75+ Ã‡ap)',
52000, 'USD', 39500, 'USD', 12500,
'{"USD_TRY": 31.52, "EUR_TRY": 34.22, "RUB_TRY": 0.25, "snapshot_date": "2024-09-28T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0041-5551234041',
'2024-09-28 08:00:00+00', '2024-10-06 14:00:00+00', '2024-09-26 10:00:00+00', '2024-10-06 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 41), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 41),
'Tokat Niksar Ceviz BorsasÄ±, TÃ¼rkiye', 'Kiev Confectionery Factory, Ukraine', '27 Palet Ä°nce Kabuklu Ceviz Ä°Ã§i (Yeni Hasat, %90 Ä°Ã§)',
64500, 'USD', 49200, 'USD', 15300,
'{"USD_TRY": 31.45, "EUR_TRY": 34.15, "RUB_TRY": 0.24, "snapshot_date": "2024-09-25T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0042-5551234042',
'2024-09-25 07:00:00+00', '2024-10-03 13:00:00+00', '2024-09-23 09:00:00+00', '2024-10-03 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 42), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 42),
'Ã‡orum Ä°skilip Nohut FabrikasÄ±, TÃ¼rkiye', 'Vilnius Food Import, Lithuania', '42 Palet Ä°skilip Nohut (9mm, Premium, Homojen Boy)',
58500, 'EUR', 44200, 'EUR', 14300,
'{"USD_TRY": 31.38, "EUR_TRY": 34.08, "RUB_TRY": 0.24, "snapshot_date": "2024-09-22T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0043-5551234043',
'2024-09-22 08:00:00+00', '2024-09-30 14:00:00+00', '2024-09-20 10:00:00+00', '2024-09-30 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 43), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 43),
'Sivas DivriÄŸi HalÄ± AtÃ¶lyesi, TÃ¼rkiye', 'Riga Museum Shop, Latvia', '16 Palet El Dokuma Antik Motif HalÄ± (200x300, YÃ¼n)',
78000, 'EUR', 59000, 'EUR', 19000,
'{"USD_TRY": 31.32, "EUR_TRY": 34.02, "RUB_TRY": 0.24, "snapshot_date": "2024-09-20T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0044-5551234044',
'2024-09-20 09:00:00+00', '2024-09-28 15:00:00+00', '2024-09-18 11:00:00+00', '2024-09-28 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 44), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 44),
'Kars SarÄ±kamÄ±ÅŸ ArÄ± Ãœretimi, TÃ¼rkiye', 'Tallinn Organic Store, Estonia', '23 Palet Ã‡iÃ§ek BalÄ± (Organik, Cam Kavanoz, 250gr)',
42500, 'EUR', 32800, 'EUR', 9700,
'{"USD_TRY": 31.25, "EUR_TRY": 33.95, "RUB_TRY": 0.23, "snapshot_date": "2024-09-18T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0045-5551234045',
'2024-09-18 08:00:00+00', '2024-09-26 14:00:00+00', '2024-09-16 10:00:00+00', '2024-09-26 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 45), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 45),
'Ardahan Ã‡Ä±ldÄ±r Besicilik, TÃ¼rkiye', 'Helsinki Butcher Shops, Finland', '20 Palet Dana Bonfile (SoÄŸuk Zincir, Vakumlu)',
82500, 'EUR', 64200, 'EUR', 18300,
'{"USD_TRY": 31.18, "EUR_TRY": 33.88, "RUB_TRY": 0.23, "snapshot_date": "2024-09-15T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0046-5551234046',
'2024-09-15 07:00:00+00', '2024-09-23 13:00:00+00', '2024-09-13 09:00:00+00', '2024-09-23 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 46), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 46),
'IÄŸdÄ±r AralÄ±k Sebze Hali, TÃ¼rkiye', 'Stockholm Fresh Market, Sweden', '46 Palet Organik Domates ve SalatalÄ±k (Serada)',
48000, 'EUR', 36800, 'EUR', 11200,
'{"USD_TRY": 31.12, "EUR_TRY": 33.82, "RUB_TRY": 0.23, "snapshot_date": "2024-09-12T10:00:00Z"}'::jsonb,
'DELIVERED', 'IRG-2024-0047-5551234047',
'2024-09-12 08:00:00+00', '2024-09-20 14:00:00+00', '2024-09-10 10:00:00+00', '2024-09-20 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 47), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 47),
'AÄŸrÄ± Patnos SÃ¼t Tesisi, TÃ¼rkiye', 'Oslo Dairy Federation, Norway', '28 Palet Tulum Peyniri (AÄŸrÄ±, 1-2 YaÅŸ, 500gr)',
58000, 'EUR', 44200, 'EUR', 13800,
'{"USD_TRY": 31.05, "EUR_TRY": 33.75, "RUB_TRY": 0.22, "snapshot_date": "2024-09-10T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0048-5551234048',
'2024-09-10 09:00:00+00', '2024-09-18 15:00:00+00', '2024-09-08 11:00:00+00', '2024-09-18 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 48), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 48),
'MuÅŸ Varto ArÄ±cÄ±lÄ±k, TÃ¼rkiye', 'Copenhagen Gourmet Store, Denmark', '25 Palet Ã‡iÃ§ek ve Kestane KarÄ±ÅŸÄ±mÄ± Bal (Premium)',
54500, 'EUR', 41000, 'EUR', 13500,
'{"USD_TRY": 30.98, "EUR_TRY": 33.68, "RUB_TRY": 0.22, "snapshot_date": "2024-09-08T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0049-5551234049',
'2024-09-08 08:00:00+00', '2024-09-16 14:00:00+00', '2024-09-06 10:00:00+00', '2024-09-16 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 49), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 49),
'Bitlis Tatvan Organik Ã‡iftlik, TÃ¼rkiye', 'Reykjavik Eco Market, Iceland', '30 Palet Organik SÃ¼t ÃœrÃ¼nleri (TereyaÄŸÄ±, YoÄŸurt, Peynir)',
72000, 'EUR', 55000, 'EUR', 17000,
'{"USD_TRY": 30.92, "EUR_TRY": 33.62, "RUB_TRY": 0.22, "snapshot_date": "2024-09-05T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0050-5551234050',
'2024-09-05 07:00:00+00', '2024-09-13 13:00:00+00', '2024-09-03 09:00:00+00', '2024-09-13 13:00:00+00');

-- ADIM 3: Kontrol Et
SELECT 
  'Toplam Eklenen Pozisyon' as bilgi, 
  COUNT(*)::text as sayi 
FROM positions;

SELECT 
  status as durum,
  COUNT(*) as adet
FROM positions
GROUP BY status
ORDER BY adet DESC;

SELECT 
  'İlk 5 Pozisyon' as baslik;
  
SELECT 
  position_no,
  LEFT(loading_point, 20) || '...' as yuklemeden,
  LEFT(unloading_point, 20) || '...' as bosaltmaya,
  LEFT(cargo_description, 30) || '...' as yuk,
  status
FROM positions
ORDER BY position_no
LIMIT 5;
