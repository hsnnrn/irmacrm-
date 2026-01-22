-- =====================================================
-- İRMA LOGISTICS CRM - DEMO DATA SEED SCRIPT
-- 50 Müşteri, 50 Tedarikçi, 50 Pozisyon
-- Farklı tarihler ve döviz kurlarıyla
-- =====================================================

-- ⚠️ ÖNEMLİ: Önce database_migration.sql dosyasını çalıştırın!
-- Bu dosya exchange_rates_snapshot kolonunu ekler.

-- Kolonu kontrol et (varsa devam et, yoksa hata verir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'positions' 
        AND column_name = 'exchange_rates_snapshot'
    ) THEN
        RAISE EXCEPTION 'HATA: Önce database_migration.sql dosyasını çalıştırın! exchange_rates_snapshot kolonu bulunamadı.';
    END IF;
END $$;

-- Önce mevcut test verilerini temizleyelim (opsiyonel)
-- TRUNCATE TABLE documents CASCADE;
-- TRUNCATE TABLE invoices CASCADE;
-- TRUNCATE TABLE route_stops CASCADE;
-- TRUNCATE TABLE positions CASCADE;
-- TRUNCATE TABLE customers CASCADE;
-- TRUNCATE TABLE suppliers CASCADE;

-- =====================================================
-- 50 MÜŞTERİ KAYDI
-- =====================================================

INSERT INTO customers (company_name, tax_id, contact_person, email, phone, risk_limit, current_balance) VALUES
('Akdeniz İthalat Ltd. Şti.', '1234567890', 'Mehmet Yılmaz', 'mehmet@akdeniz.com', '+90 212 555 0101', 500000, 125000),
('Marmara Tekstil A.Ş.', '1234567891', 'Ayşe Demir', 'ayse@marmara.com', '+90 212 555 0102', 750000, 230000),
('Ege Export İnc.', '1234567892', 'Ali Kaya', 'ali@ege.com', '+90 232 555 0103', 1000000, 450000),
('Karadeniz Lojistik', '1234567893', 'Fatma Şahin', 'fatma@karadeniz.com', '+90 462 555 0104', 300000, 80000),
('Anadolu Ticaret', '1234567894', 'Mustafa Çelik', 'mustafa@anadolu.com', '+90 312 555 0105', 600000, 175000),
('İstanbul Global Trade', '1234567895', 'Zeynep Yıldız', 'zeynep@istanbul.com', '+90 212 555 0106', 900000, 320000),
('Ankara Mobilya A.Ş.', '1234567896', 'Ahmet Arslan', 'ahmet@ankara.com', '+90 312 555 0107', 400000, 95000),
('İzmir Gıda Sanayi', '1234567897', 'Elif Öztürk', 'elif@izmir.com', '+90 232 555 0108', 550000, 140000),
('Bursa Otomotiv', '1234567898', 'Murat Aydın', 'murat@bursa.com', '+90 224 555 0109', 800000, 265000),
('Antalya Turizm Ltd.', '1234567899', 'Selin Kara', 'selin@antalya.com', '+90 242 555 0110', 450000, 110000),
('Gaziantep Tekstil', '1234567900', 'Hasan Yılmaz', 'hasan@gaziantep.com', '+90 342 555 0111', 520000, 155000),
('Adana Tarım A.Ş.', '1234567901', 'Deniz Koç', 'deniz@adana.com', '+90 322 555 0112', 350000, 89000),
('Konya İnşaat', '1234567902', 'Emre Şen', 'emre@konya.com', '+90 332 555 0113', 700000, 210000),
('Mersin Liman İşletmesi', '1234567903', 'Gizem Acar', 'gizem@mersin.com', '+90 324 555 0114', 950000, 380000),
('Kayseri Halı Export', '1234567904', 'Burak Yıldırım', 'burak@kayseri.com', '+90 352 555 0115', 480000, 125000),
('Trabzon Balık A.Ş.', '1234567905', 'Aylin Özkan', 'aylin@trabzon.com', '+90 462 555 0116', 320000, 75000),
('Eskişehir Seramik', '1234567906', 'Can Özel', 'can@eskisehir.com', '+90 222 555 0117', 580000, 165000),
('Diyarbakır Ticaret', '1234567907', 'Pınar Güneş', 'pinar@diyarbakir.com', '+90 412 555 0118', 410000, 98000),
('Samsun Gemi Yan Sanayi', '1234567908', 'Cem Aslan', 'cem@samsun.com', '+90 362 555 0119', 650000, 195000),
('Denizli Tekstil Grubu', '1234567909', 'Naz Yavuz', 'naz@denizli.com', '+90 258 555 0120', 720000, 245000),
('Şanlıurfa Gıda', '1234567910', 'Tolga Demirci', 'tolga@sanliurfa.com', '+90 414 555 0121', 380000, 92000),
('Malatya Kayısı İhracat', '1234567911', 'Seda Kılıç', 'seda@malatya.com', '+90 422 555 0122', 440000, 115000),
('Van Mobilya', '1234567912', 'Onur Çakır', 'onur@van.com', '+90 432 555 0123', 390000, 88000),
('Balıkesir Zeytin', '1234567913', 'Derya Polat', 'derya@balikesir.com', '+90 266 555 0124', 470000, 132000),
('Çanakkale Seramik A.Ş.', '1234567914', 'Kaan Erdem', 'kaan@canakkale.com', '+90 286 555 0125', 810000, 285000),
('Manisa Tarım Ürünleri', '1234567915', 'Eda Yurt', 'eda@manisa.com', '+90 236 555 0126', 520000, 148000),
('Kocaeli Petrokimya', '1234567916', 'Bora Şimşek', 'bora@kocaeli.com', '+90 262 555 0127', 1200000, 520000),
('Sakarya Otomotiv Yan Sanayi', '1234567917', 'Lale Aksoy', 'lale@sakarya.com', '+90 264 555 0128', 680000, 198000),
('Tekirdağ Şarap İhracat', '1234567918', 'Serkan Bayram', 'serkan@tekirdag.com', '+90 282 555 0129', 430000, 105000),
('Edirne Tarım', '1234567919', 'Melis Tunç', 'melis@edirne.com', '+90 284 555 0130', 360000, 84000),
('Kırklareli Süt Ürünleri', '1234567920', 'Barış Öztürk', 'baris@kirklareli.com', '+90 288 555 0131', 490000, 138000),
('Çorum Nohut İhracat', '1234567921', 'Gül Çetin', 'gul@corum.com', '+90 364 555 0132', 410000, 96000),
('Sivas Halı', '1234567922', 'Erkan Başar', 'erkan@sivas.com', '+90 346 555 0133', 450000, 118000),
('Erzurum Gıda A.Ş.', '1234567923', 'Özge Karaca', 'ozge@erzurum.com', '+90 442 555 0134', 380000, 89000),
('Hatay Zeytinyağı', '1234567924', 'Volkan Özdemir', 'volkan@hatay.com', '+90 326 555 0135', 520000, 145000),
('Kahramanmaraş Dondurma', '1234567925', 'Burcu Aydın', 'burcu@maras.com', '+90 344 555 0136', 340000, 78000),
('Ordu Fındık İhracat', '1234567926', 'Kerem Yalçın', 'kerem@ordu.com', '+90 452 555 0137', 890000, 312000),
('Giresun Fındık A.Ş.', '1234567927', 'Damla Erkan', 'damla@giresun.com', '+90 454 555 0138', 750000, 256000),
('Rize Çay Üretimi', '1234567928', 'Alper Doğan', 'alper@rize.com', '+90 464 555 0139', 420000, 102000),
('Artvin Bal Üretimi', '1234567929', 'Canan Şahin', 'canan@artvin.com', '+90 466 555 0140', 310000, 71000),
('Kastamonu Mobilya', '1234567930', 'Mert Tekin', 'mert@kastamonu.com', '+90 366 555 0141', 580000, 168000),
('Amasya Elma İhracat', '1234567931', 'Şeyda Koçak', 'seyda@amasya.com', '+90 358 555 0142', 460000, 125000),
('Tokat Ceviz', '1234567932', 'Tarık Güven', 'tarik@tokat.com', '+90 356 555 0143', 390000, 91000),
('Zonguldak Kömür', '1234567933', 'Asya Kurt', 'asya@zonguldak.com', '+90 372 555 0144', 670000, 189000),
('Bartın Kereste', '1234567934', 'Ufuk Yılmaz', 'ufuk@bartin.com', '+90 378 555 0145', 440000, 112000),
('Karabük Demir Çelik', '1234567935', 'Ebru Çelik', 'ebru@karabuk.com', '+90 370 555 0146', 950000, 345000),
('Yalova Enerji', '1234567936', 'Sinan Arslan', 'sinan@yalova.com', '+90 226 555 0147', 720000, 218000),
('Düzce Kağıt Sanayi', '1234567937', 'Yasemin Kaya', 'yasemin@duzce.com', '+90 380 555 0148', 610000, 172000),
('Bolu Orman Ürünleri', '1234567938', 'Oğuz Demir', 'oguz@bolu.com', '+90 374 555 0149', 490000, 135000),
('Bilecik Mermer', '1234567939', 'Defne Özcan', 'defne@bilecik.com', '+90 228 555 0150', 830000, 276000);

-- =====================================================
-- 50 TEDARİKÇİ KAYDI
-- =====================================================

INSERT INTO suppliers (company_name, tax_id, payment_term_days, is_blacklisted) VALUES
('Hızır Nakliyat', '5551234001', 30, false),
('Yıldız Trans', '5551234002', 45, false),
('Acar Lojistik A.Ş.', '5551234003', 30, false),
('Güven Taşımacılık', '5551234004', 60, false),
('Kardeşler Nakliyat', '5551234005', 30, false),
('Euro Transport', '5551234006', 45, false),
('Mega Logistics', '5551234007', 30, false),
('Swift Cargo', '5551234008', 30, false),
('Global Freight Solutions', '5551234009', 60, false),
('Express Line', '5551234010', 45, false),
('TIR Park Nakliyat', '5551234011', 30, false),
('Kuzey Taşımacılık', '5551234012', 30, false),
('Güney Lojistik', '5551234013', 45, true),
('Doğu Nakliyat', '5551234014', 30, false),
('Batı Trans', '5551234015', 60, false),
('Aslan Taşıma', '5551234016', 30, false),
('Şahin Nakliyat', '5551234017', 45, false),
('Kartal Lojistik', '5551234018', 30, false),
('Martı Taşımacılık', '5551234019', 30, false),
('Akbaba Trans', '5551234020', 45, false),
('Turna Nakliyat', '5551234021', 60, false),
('Atmaca Lojistik', '5551234022', 30, false),
('Kaplan Taşıma', '5551234023', 30, false),
('Pars Nakliyat', '5551234024', 45, false),
('Leopar Trans', '5551234025', 30, false),
('Çita Lojistik', '5551234026', 45, false),
('Jaguar Taşımacılık', '5551234027', 60, false),
('Puma Nakliyat', '5551234028', 30, false),
('Panther Transport', '5551234029', 30, false),
('Tiger Logistics', '5551234030', 45, false),
('Lion Freight', '5551234031', 30, false),
('Eagle Trans', '5551234032', 60, false),
('Falcon Cargo', '5551234033', 30, false),
('Hawk Shipping', '5551234034', 45, false),
('Wolf Pack Transport', '5551234035', 30, false),
('Bear Logistics', '5551234036', 30, false),
('Fox Trans', '5551234037', 45, true),
('Rhino Freight', '5551234038', 60, false),
('Elephant Cargo', '5551234039', 30, false),
('Giraffe Transport', '5551234040', 45, false),
('Zebra Logistics', '5551234041', 30, false),
('Dolphin Shipping', '5551234042', 30, false),
('Shark Freight', '5551234043', 60, false),
('Whale Trans', '5551234044', 45, false),
('Octopus Cargo', '5551234045', 30, false),
('Phoenix Logistics', '5551234046', 30, false),
('Dragon Transport', '5551234047', 45, false),
('Griffin Freight', '5551234048', 60, false),
('Pegasus Shipping', '5551234049', 30, false),
('Unicorn Trans', '5551234050', 45, false);

-- =====================================================
-- 50 POZİSYON KAYDI (ÇOK ÇEŞİTLİ VE DETAYLI)
-- =====================================================

-- TRUNCATE positions CASCADE; -- Eğer mevcut verileri temizlemek isterseniz

-- Not: customer_id ve supplier_id'leri gerçek UUID'lerle değiştirmeniz gerekecek
-- Aşağıdaki script placeholder olarak subquery kullanıyor

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
'2025-01-02 10:00:00+00', '2025-01-07 16:00:00+00', '2025-01-01 10:00:00+00', '2025-01-07 16:00:00+00'),

-- Pozisyon 11-20 (Aralık 2024 - Çeşitli Ürünler)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 10), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 10),
'Denizli Organize Sanayi, Türkiye', 'Sofia Import Center, Bulgaria', '36 Palet Lüks Havlu ve Bornoz Seti (Bambu %100)',
48000, 'EUR', 35700, 'EUR', 12300,
'{"USD_TRY": 33.10, "EUR_TRY": 35.85, "RUB_TRY": 0.33, "snapshot_date": "2024-12-15T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0011-5551234011',
'2024-12-15 08:00:00+00', '2024-12-22 14:00:00+00', '2024-12-13 10:00:00+00', '2024-12-22 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 11), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 11),
'Samsun Liman Bölgesi, Türkiye', 'Bucharest Industrial, Romania', '15 Palet CNC Torna Yedek Parçaları (FANUC Uyumlu)',
82000, 'USD', 64500, 'USD', 17500,
'{"USD_TRY": 33.18, "EUR_TRY": 35.92, "RUB_TRY": 0.33, "snapshot_date": "2024-12-18T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0012-5551234012',
'2024-12-18 09:00:00+00', '2024-12-26 16:00:00+00', '2024-12-16 11:00:00+00', '2024-12-26 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 12), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 12),
'Konya Sanayi Sitesi, Türkiye', 'Athens Construction Hub, Greece', '40 Palet Yapıştırıcı ve İzolasyon Malzemesi',
1150000, 'TRY', 845000, 'TRY', 305000,
'{"USD_TRY": 33.25, "EUR_TRY": 36.00, "RUB_TRY": 0.34, "snapshot_date": "2024-12-20T10:00:00Z"}'::jsonb,
'DELIVERED', 'IRG-2024-0013-5551234013',
'2024-12-20 10:00:00+00', '2024-12-28 15:00:00+00', '2024-12-18 09:00:00+00', '2024-12-28 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 13), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 13),
'Adana Merkez Hal, Türkiye', 'Belgrade Farmers Market, Serbia', '52 Palet Organik Portakal ve Mandalina (Toptancı)',
35500, 'EUR', 26200, 'EUR', 9300,
'{"USD_TRY": 33.32, "EUR_TRY": 36.08, "RUB_TRY": 0.34, "snapshot_date": "2024-12-22T10:00:00Z"}'::jsonb,
'DELIVERED', 'IRG-2024-0014-5551234014',
'2024-12-22 07:00:00+00', '2024-12-29 12:00:00+00', '2024-12-20 08:00:00+00', '2024-12-29 12:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 14), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 14),
'Kocaeli Tüpraş Rafinerisi, Türkiye', 'Munich Chemical District, Germany', '24 Palet Endüstriyel Polimer Kimyasalları (ISO Tank)',
185000, 'EUR', 152000, 'EUR', 33000,
'{"USD_TRY": 33.38, "EUR_TRY": 36.15, "RUB_TRY": 0.34, "snapshot_date": "2024-12-25T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0015-5551234015',
'2024-12-26 08:00:00+00', '2025-01-02 17:00:00+00', '2024-12-24 10:00:00+00', '2025-01-02 17:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 15), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 15),
'Sakarya Hendek OSB, Türkiye', 'Stuttgart Mercedes Plant, Germany', '22 Palet Mercedes Sprinter Yedek Parça',
128000, 'EUR', 98800, 'EUR', 29200,
'{"USD_TRY": 33.20, "EUR_TRY": 35.98, "RUB_TRY": 0.33, "snapshot_date": "2024-12-10T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0016-5551234016',
'2024-12-10 09:00:00+00', '2024-12-18 16:00:00+00', '2024-12-08 11:00:00+00', '2024-12-18 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 16), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 16),
'Tekirdağ Şarköy Bağları, Türkiye', 'Lyon Wine Expo, France', '30 Palet Premium Özel Üretim Şarap (2019 Vintage)',
67500, 'EUR', 48900, 'EUR', 18600,
'{"USD_TRY": 33.15, "EUR_TRY": 35.90, "RUB_TRY": 0.33, "snapshot_date": "2024-12-08T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0017-5551234017',
'2024-12-08 08:00:00+00', '2024-12-16 14:00:00+00', '2024-12-06 09:00:00+00', '2024-12-16 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 17), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 17),
'Manisa Akhisar Depolama, Türkiye', 'Rotterdam Food Terminal, Netherlands', '38 Palet Siyah Zeytin (Gemlik Tipi, Salamura)',
42800, 'EUR', 31900, 'EUR', 10900,
'{"USD_TRY": 33.08, "EUR_TRY": 35.82, "RUB_TRY": 0.32, "snapshot_date": "2024-12-05T10:00:00Z"}'::jsonb,
'CANCELLED', 'IRG-2024-0018-5551234018',
NULL, NULL, '2024-12-03 10:00:00+00', '2024-12-05 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 18), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 18),
'Balıkesir Edremit Körfezi, Türkiye', 'Antwerp Commodity Exchange, Belgium', '26 Palet Naturel Sızma Zeytinyağı (5L Bidon)',
98000, 'EUR', 75500, 'EUR', 22500,
'{"USD_TRY": 33.02, "EUR_TRY": 35.75, "RUB_TRY": 0.32, "snapshot_date": "2024-12-03T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0019-5551234019',
'2024-12-03 08:00:00+00', '2024-12-11 15:00:00+00', '2024-12-01 11:00:00+00', '2024-12-11 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 19), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 19),
'Çanakkale Seramik Fabrika, Türkiye', 'Marseille Design District, France', '42 Palet Lüks Banyo Seramikleri (Yeni Koleksiyon)',
125500, 'EUR', 94200, 'EUR', 31300,
'{"USD_TRY": 32.98, "EUR_TRY": 35.68, "RUB_TRY": 0.32, "snapshot_date": "2024-12-01T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0020-5551234020',
'2024-12-01 09:00:00+00', '2024-12-09 16:00:00+00', '2024-11-29 10:00:00+00', '2024-12-09 16:00:00+00'),

-- Pozisyon 21-30 (Kasım 2024 - Özel İhracat Ürünleri)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 20), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 20),
'Ordu Fındık Borsası, Türkiye', 'Genoa Chocolate Factory, Italy', '28 Palet Premium Tombul Fındık (Kavrulmuş, 13-15mm)',
142000, 'USD', 108500, 'USD', 33500,
'{"USD_TRY": 32.85, "EUR_TRY": 35.55, "RUB_TRY": 0.31, "snapshot_date": "2024-11-25T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0021-5551234021',
'2024-11-25 08:00:00+00', '2024-12-03 14:00:00+00', '2024-11-23 10:00:00+00', '2024-12-03 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 21), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 21),
'Giresun Tirebolu Depolar, Türkiye', 'Naples Ferrero Rocher Plant, Italy', '32 Palet Organik Fındık (Sertifikalı, Kabuksuz)',
115500, 'USD', 89000, 'USD', 26500,
'{"USD_TRY": 32.78, "EUR_TRY": 35.48, "RUB_TRY": 0.31, "snapshot_date": "2024-11-22T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0022-5551234022',
'2024-11-22 07:00:00+00', '2024-11-30 13:00:00+00', '2024-11-20 09:00:00+00', '2024-11-30 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 22), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 22),
'Rize Çay Fabrikası, Türkiye', 'London Harrods Warehouse, United Kingdom', '24 Palet Organik Karadeniz Çayı (Premium Paket, Altın Serisi)',
72500, 'EUR', 54000, 'EUR', 18500,
'{"USD_TRY": 32.72, "EUR_TRY": 35.42, "RUB_TRY": 0.31, "snapshot_date": "2024-11-20T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0023-5551234023',
'2024-11-20 08:00:00+00', '2024-11-28 15:00:00+00', '2024-11-18 10:00:00+00', '2024-11-28 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 23), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 23),
'Hatay İskenderun Limanı, Türkiye', 'Dubai Palm Jumeirah Storage, UAE', '34 Palet Defne Sabunu ve Zeytinyağı (El Yapımı)',
68000, 'USD', 49500, 'USD', 18500,
'{"USD_TRY": 32.65, "EUR_TRY": 35.35, "RUB_TRY": 0.30, "snapshot_date": "2024-11-18T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0024-5551234024',
'2024-11-18 09:00:00+00', '2024-11-26 16:00:00+00', '2024-11-16 11:00:00+00', '2024-11-26 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 24), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 24),
'Malatya Kayısı Borsası, Türkiye', 'Moscow GUM Department Store, Russia', '26 Palet Organik Kuru Kayısı (Jumbo Boy, Sertifikalı)',
2850000, 'RUB', 2150000, 'RUB', 700000,
'{"USD_TRY": 32.58, "EUR_TRY": 35.28, "RUB_TRY": 0.30, "snapshot_date": "2024-11-15T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0025-5551234025',
'2024-11-15 10:00:00+00', '2024-11-23 17:00:00+00', '2024-11-13 10:00:00+00', '2024-11-23 17:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 25), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 25),
'Erzurum Palandöken Tesisleri, Türkiye', 'Tbilisi Old Town Market, Georgia', '18 Palet Kars Kaşarı ve Erzurum Cağ Kebap Malzemesi',
42500, 'USD', 32800, 'USD', 9700,
'{"USD_TRY": 32.52, "EUR_TRY": 35.22, "RUB_TRY": 0.30, "snapshot_date": "2024-11-12T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0026-5551234026',
'2024-11-12 08:00:00+00', '2024-11-20 14:00:00+00', '2024-11-10 09:00:00+00', '2024-11-20 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 26), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 26),
'Van Erciş Mobilya OSB, Türkiye', 'Baku Nizami District, Azerbaijan', '21 Palet El İşçiliği Ceviz Mobilya (Yatak Odası Takımı)',
55000, 'USD', 41500, 'USD', 13500,
'{"USD_TRY": 32.45, "EUR_TRY": 35.15, "RUB_TRY": 0.29, "snapshot_date": "2024-11-10T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0027-5551234027',
'2024-11-10 07:00:00+00', '2024-11-18 13:00:00+00', '2024-11-08 10:00:00+00', '2024-11-18 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 27), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 27),
'Diyarbakır OSB Tekstil, Türkiye', 'Tehran Grand Bazaar, Iran', '29 Palet El Dokuma Kilim ve Halı (Geleneksel Motifler)',
64500, 'USD', 49200, 'USD', 15300,
'{"USD_TRY": 32.38, "EUR_TRY": 35.08, "RUB_TRY": 0.29, "snapshot_date": "2024-11-08T10:00:00Z"}'::jsonb,
'CANCELLED', 'IRG-2024-0028-5551234028',
NULL, NULL, '2024-11-06 11:00:00+00', '2024-11-08 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 28), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 28),
'Şanlıurfa Siverek Deposu, Türkiye', 'Baghdad Central Market, Iraq', '38 Palet İsot (Urfa Biberi), Sumak ve Baharatlar',
58000, 'USD', 43000, 'USD', 15000,
'{"USD_TRY": 32.32, "EUR_TRY": 35.02, "RUB_TRY": 0.29, "snapshot_date": "2024-11-05T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0029-5551234029',
'2024-11-05 08:00:00+00', '2024-11-13 14:00:00+00', '2024-11-03 10:00:00+00', '2024-11-13 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 29), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 29),
'Mardin Midyat Taş İşleme, Türkiye', 'Damascus Historic District, Syria', '12 Palet Doğal Taş Dekorasyon Ürünleri (El İşlemesi)',
48500, 'USD', 36200, 'USD', 12300,
'{"USD_TRY": 32.25, "EUR_TRY": 34.95, "RUB_TRY": 0.28, "snapshot_date": "2024-11-03T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0030-5551234030',
'2024-11-03 07:00:00+00', '2024-11-11 13:00:00+00', '2024-11-01 09:00:00+00', '2024-11-11 13:00:00+00'),

-- Pozisyon 31-40 (Ekim 2024 - Sanayi ve Hammadde)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 30), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 30),
'Zonguldak TTK Kömür İşletmesi, Türkiye', 'Constanta Energy Terminal, Romania', '48 Palet Taşkömürü (Kalorifer, 6000+ kcal/kg)',
685000, 'TRY', 512000, 'TRY', 173000,
'{"USD_TRY": 32.18, "EUR_TRY": 34.88, "RUB_TRY": 0.28, "snapshot_date": "2024-10-28T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0031-5551234031',
'2024-10-28 08:00:00+00', '2024-11-05 14:00:00+00', '2024-10-26 10:00:00+00', '2024-11-05 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 31), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 31),
'Karabük Kardemir Fabrika, Türkiye', 'Bratislava Steel Works, Slovakia', '36 Palet Hadde Profil Çelik (S235JR, HEA 200)',
112000, 'EUR', 89500, 'EUR', 22500,
'{"USD_TRY": 32.12, "EUR_TRY": 34.82, "RUB_TRY": 0.28, "snapshot_date": "2024-10-25T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0032-5551234032',
'2024-10-25 09:00:00+00', '2024-11-02 15:00:00+00', '2024-10-23 11:00:00+00', '2024-11-02 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 32), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 32),
'Bartın Ulus Kereste, Türkiye', 'Ljubljana Furniture Center, Slovenia', '28 Palet İşlenmiş Meşe Kerestesi (4x20x300 cm)',
54500, 'EUR', 41000, 'EUR', 13500,
'{"USD_TRY": 32.05, "EUR_TRY": 34.75, "RUB_TRY": 0.27, "snapshot_date": "2024-10-22T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0033-5551234033',
'2024-10-22 08:00:00+00', '2024-10-30 14:00:00+00', '2024-10-20 10:00:00+00', '2024-10-30 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 33), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 33),
'Kastamonu Tosya Mobilya, Türkiye', 'Zagreb Design Expo, Croatia', '19 Palet Modern Ofis Mobilyası (Masa, Dolap, Koltuk)',
68000, 'EUR', 52500, 'EUR', 15500,
'{"USD_TRY": 31.98, "EUR_TRY": 34.68, "RUB_TRY": 0.27, "snapshot_date": "2024-10-20T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0034-5551234034',
'2024-10-20 07:00:00+00', '2024-10-28 13:00:00+00', '2024-10-18 09:00:00+00', '2024-10-28 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 34), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 34),
'Bolu Yeniçağa Orman, Türkiye', 'Sarajevo Construction Market, Bosnia', '26 Palet Çam ve Ladin Kereste (Çatı ve İnşaat)',
48000, 'EUR', 36800, 'EUR', 11200,
'{"USD_TRY": 31.92, "EUR_TRY": 34.62, "RUB_TRY": 0.27, "snapshot_date": "2024-10-18T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0035-5551234035',
'2024-10-18 08:00:00+00', '2024-10-26 14:00:00+00', '2024-10-16 10:00:00+00', '2024-10-26 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 35), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 35),
'Düzce Kağıt Fabrika, Türkiye', 'Tirana Printing House, Albania', '32 Palet A4 Fotokopi Kağıdı (80gr, Premium)',
72500, 'EUR', 56800, 'EUR', 15700,
'{"USD_TRY": 31.85, "EUR_TRY": 34.55, "RUB_TRY": 0.26, "snapshot_date": "2024-10-15T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0036-5551234036',
'2024-10-15 09:00:00+00', '2024-10-23 15:00:00+00', '2024-10-13 11:00:00+00', '2024-10-23 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 36), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 36),
'Yalova Altınova Tersanesi, Türkiye', 'Skopje Energy Solutions, North Macedonia', '14 Palet Gemi Dizel Motor Yedek Parçaları',
95500, 'EUR', 74200, 'EUR', 21300,
'{"USD_TRY": 31.78, "EUR_TRY": 34.48, "RUB_TRY": 0.26, "snapshot_date": "2024-10-12T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0037-5551234037',
'2024-10-12 10:00:00+00', '2024-10-20 16:00:00+00', '2024-10-10 10:00:00+00', '2024-10-20 16:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 37), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 37),
'Bilecik Söğüt Mermer Ocağı, Türkiye', 'Podgorica Luxury Hotel Project, Montenegro', '22 Palet Beyaz Mermer Kaplama (60x120 cm, Cilalı)',
88000, 'EUR', 68500, 'EUR', 19500,
'{"USD_TRY": 31.72, "EUR_TRY": 34.42, "RUB_TRY": 0.26, "snapshot_date": "2024-10-10T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0038-5551234038',
'2024-10-10 08:00:00+00', '2024-10-18 14:00:00+00', '2024-10-08 09:00:00+00', '2024-10-18 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 38), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 38),
'Kırklareli Lüleburgaz Süt, Türkiye', 'Pristina Dairy Coop, Kosovo', '24 Palet Kaşar ve Beyaz Peynir (Vakumlu, 500gr)',
46500, 'EUR', 35800, 'EUR', 10700,
'{"USD_TRY": 31.65, "EUR_TRY": 34.35, "RUB_TRY": 0.25, "snapshot_date": "2024-10-08T10:00:00Z"}'::jsonb,
'DELIVERED', 'IRG-2024-0039-5551234039',
'2024-10-08 07:00:00+00', '2024-10-16 13:00:00+00', '2024-10-06 10:00:00+00', '2024-10-16 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 39), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 39),
'Edirne Keşan Buğday Silosu, Türkiye', 'Chisinau Bread Factory, Moldova', '60 Palet Makarnalık Buğday (Durum, 1. Sınıf)',
1480000, 'TRY', 1125000, 'TRY', 355000,
'{"USD_TRY": 31.58, "EUR_TRY": 34.28, "RUB_TRY": 0.25, "snapshot_date": "2024-10-05T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0040-5551234040',
'2024-10-05 08:00:00+00', '2024-10-13 14:00:00+00', '2024-10-03 11:00:00+00', '2024-10-13 14:00:00+00'),

-- Pozisyon 41-50 (Eylül 2024 - Premium ve Niche Ürünler)
((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 40), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 40),
'Amasya Merzifon Deposu, Türkiye', 'Minsk Premium Market, Belarus', '35 Palet Amasya Elması (Premium Starking, 75+ Çap)',
52000, 'USD', 39500, 'USD', 12500,
'{"USD_TRY": 31.52, "EUR_TRY": 34.22, "RUB_TRY": 0.25, "snapshot_date": "2024-09-28T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0041-5551234041',
'2024-09-28 08:00:00+00', '2024-10-06 14:00:00+00', '2024-09-26 10:00:00+00', '2024-10-06 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 41), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 41),
'Tokat Niksar Ceviz Borsası, Türkiye', 'Kiev Confectionery Factory, Ukraine', '27 Palet İnce Kabuklu Ceviz İçi (Yeni Hasat, %90 İç)',
64500, 'USD', 49200, 'USD', 15300,
'{"USD_TRY": 31.45, "EUR_TRY": 34.15, "RUB_TRY": 0.24, "snapshot_date": "2024-09-25T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0042-5551234042',
'2024-09-25 07:00:00+00', '2024-10-03 13:00:00+00', '2024-09-23 09:00:00+00', '2024-10-03 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 42), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 42),
'Çorum İskilip Nohut Fabrikası, Türkiye', 'Vilnius Food Import, Lithuania', '42 Palet İskilip Nohut (9mm, Premium, Homojen Boy)',
58500, 'EUR', 44200, 'EUR', 14300,
'{"USD_TRY": 31.38, "EUR_TRY": 34.08, "RUB_TRY": 0.24, "snapshot_date": "2024-09-22T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0043-5551234043',
'2024-09-22 08:00:00+00', '2024-09-30 14:00:00+00', '2024-09-20 10:00:00+00', '2024-09-30 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 43), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 43),
'Sivas Divriği Halı Atölyesi, Türkiye', 'Riga Museum Shop, Latvia', '16 Palet El Dokuma Antik Motif Halı (200x300, Yün)',
78000, 'EUR', 59000, 'EUR', 19000,
'{"USD_TRY": 31.32, "EUR_TRY": 34.02, "RUB_TRY": 0.24, "snapshot_date": "2024-09-20T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0044-5551234044',
'2024-09-20 09:00:00+00', '2024-09-28 15:00:00+00', '2024-09-18 11:00:00+00', '2024-09-28 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 44), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 44),
'Kars Sarıkamış Arı Üretimi, Türkiye', 'Tallinn Organic Store, Estonia', '23 Palet Çiçek Balı (Organik, Cam Kavanoz, 250gr)',
42500, 'EUR', 32800, 'EUR', 9700,
'{"USD_TRY": 31.25, "EUR_TRY": 33.95, "RUB_TRY": 0.23, "snapshot_date": "2024-09-18T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0045-5551234045',
'2024-09-18 08:00:00+00', '2024-09-26 14:00:00+00', '2024-09-16 10:00:00+00', '2024-09-26 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 45), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 45),
'Ardahan Çıldır Besicilik, Türkiye', 'Helsinki Butcher Shops, Finland', '20 Palet Dana Bonfile (Soğuk Zincir, Vakumlu)',
82500, 'EUR', 64200, 'EUR', 18300,
'{"USD_TRY": 31.18, "EUR_TRY": 33.88, "RUB_TRY": 0.23, "snapshot_date": "2024-09-15T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0046-5551234046',
'2024-09-15 07:00:00+00', '2024-09-23 13:00:00+00', '2024-09-13 09:00:00+00', '2024-09-23 13:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 46), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 46),
'Iğdır Aralık Sebze Hali, Türkiye', 'Stockholm Fresh Market, Sweden', '46 Palet Organik Domates ve Salatalık (Serada)',
48000, 'EUR', 36800, 'EUR', 11200,
'{"USD_TRY": 31.12, "EUR_TRY": 33.82, "RUB_TRY": 0.23, "snapshot_date": "2024-09-12T10:00:00Z"}'::jsonb,
'DELIVERED', 'IRG-2024-0047-5551234047',
'2024-09-12 08:00:00+00', '2024-09-20 14:00:00+00', '2024-09-10 10:00:00+00', '2024-09-20 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 47), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 47),
'Ağrı Patnos Süt Tesisi, Türkiye', 'Oslo Dairy Federation, Norway', '28 Palet Tulum Peyniri (Ağrı, 1-2 Yaş, 500gr)',
58000, 'EUR', 44200, 'EUR', 13800,
'{"USD_TRY": 31.05, "EUR_TRY": 33.75, "RUB_TRY": 0.22, "snapshot_date": "2024-09-10T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0048-5551234048',
'2024-09-10 09:00:00+00', '2024-09-18 15:00:00+00', '2024-09-08 11:00:00+00', '2024-09-18 15:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 48), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 48),
'Muş Varto Arıcılık, Türkiye', 'Copenhagen Gourmet Store, Denmark', '25 Palet Çiçek ve Kestane Karışımı Bal (Premium)',
54500, 'EUR', 41000, 'EUR', 13500,
'{"USD_TRY": 30.98, "EUR_TRY": 33.68, "RUB_TRY": 0.22, "snapshot_date": "2024-09-08T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0049-5551234049',
'2024-09-08 08:00:00+00', '2024-09-16 14:00:00+00', '2024-09-06 10:00:00+00', '2024-09-16 14:00:00+00'),

((SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 49), (SELECT id FROM suppliers ORDER BY created_at LIMIT 1 OFFSET 49),
'Bitlis Tatvan Organik Çiftlik, Türkiye', 'Reykjavik Eco Market, Iceland', '30 Palet Organik Süt Ürünleri (Tereyağı, Yoğurt, Peynir)',
72000, 'EUR', 55000, 'EUR', 17000,
'{"USD_TRY": 30.92, "EUR_TRY": 33.62, "RUB_TRY": 0.22, "snapshot_date": "2024-09-05T10:00:00Z"}'::jsonb,
'COMPLETED', 'IRG-2024-0050-5551234050',
'2024-09-05 07:00:00+00', '2024-09-13 13:00:00+00', '2024-09-03 09:00:00+00', '2024-09-13 13:00:00+00');

-- =====================================================
-- TAMAMLANDI!
-- Bu script 50 müşteri, 50 tedarikçi ve 50 pozisyon ekler
-- Farklı tarihler (Eylül 2024 - Ocak 2025)
-- Farklı döviz kurları (30.92 - 34.32 TRY/EUR arası)
-- Farklı durumlar (COMPLETED, IN_TRANSIT, READY_TO_DEPART, DELIVERED, DRAFT)
-- Farklı para birimleri (EUR, USD, RUB)
-- =====================================================

-- İsteğe bağlı: İstatistikleri kontrol et
SELECT 
  'Toplam Müşteri' as type, COUNT(*) as count FROM customers
UNION ALL
SELECT 
  'Toplam Tedarikçi', COUNT(*) FROM suppliers
UNION ALL
SELECT 
  'Toplam Pozisyon', COUNT(*) FROM positions
UNION ALL
SELECT 
  'Tamamlanan Pozisyonlar', COUNT(*) FROM positions WHERE status = 'COMPLETED'
UNION ALL
SELECT 
  'Aktif Pozisyonlar', COUNT(*) FROM positions WHERE status IN ('IN_TRANSIT', 'READY_TO_DEPART');

-- =====================================================
-- DASHBOARD İÇİN EK VERİLER
-- =====================================================

-- Bazı pozisyonların statusunu güncelleyelim (Dashboard için çeşitlilik)
UPDATE positions SET status = 'IN_TRANSIT', updated_at = NOW() - INTERVAL '2 hours' WHERE position_no IN (1001, 1003, 1007, 1011, 1015, 1019, 1023);
UPDATE positions SET status = 'DELIVERED', updated_at = NOW() - INTERVAL '1 hour' WHERE position_no IN (1002, 1006, 1010, 1014, 1018);
UPDATE positions SET status = 'READY_TO_DEPART', updated_at = NOW() - INTERVAL '30 minutes' WHERE position_no IN (1004, 1008, 1012, 1016);
UPDATE positions SET status = 'IN_TRANSIT', updated_at = NOW() - INTERVAL '5 hours' WHERE position_no IN (1005, 1009, 1013, 1017, 1021);

-- Invoice tarihlerini son 6 aya yayalım (Bu ay daha fazla olsun)
-- Ocak ayı (6 ay önce)
UPDATE invoices SET invoice_date = (NOW() - INTERVAL '6 months')::date WHERE id IN (
  SELECT id FROM invoices ORDER BY id LIMIT 3
);

-- Şubat ayı (5 ay önce)
UPDATE invoices SET invoice_date = (NOW() - INTERVAL '5 months')::date WHERE id IN (
  SELECT id FROM invoices ORDER BY id LIMIT 5 OFFSET 3
);

-- Mart ayı (4 ay önce)
UPDATE invoices SET invoice_date = (NOW() - INTERVAL '4 months')::date WHERE id IN (
  SELECT id FROM invoices ORDER BY id LIMIT 7 OFFSET 8
);

-- Nisan ayı (3 ay önce)
UPDATE invoices SET invoice_date = (NOW() - INTERVAL '3 months')::date WHERE id IN (
  SELECT id FROM invoices ORDER BY id LIMIT 8 OFFSET 15
);

-- Mayıs ayı (2 ay önce)
UPDATE invoices SET invoice_date = (NOW() - INTERVAL '2 months')::date WHERE id IN (
  SELECT id FROM invoices ORDER BY id LIMIT 10 OFFSET 23
);

-- Haziran ayı (1 ay önce)
UPDATE invoices SET invoice_date = (NOW() - INTERVAL '1 month')::date WHERE id IN (
  SELECT id FROM invoices ORDER BY id LIMIT 12 OFFSET 33
);

-- Bu ay (Ocak 2025) - Dashboard'da görünsün
UPDATE invoices SET invoice_date = NOW()::date WHERE id IN (
  SELECT id FROM invoices ORDER BY id OFFSET 45
);

-- Bazı faturaları ödenmiş yap
UPDATE invoices SET is_paid = TRUE 
WHERE id IN (
  SELECT id FROM invoices WHERE invoice_type = 'SALES' ORDER BY RANDOM() LIMIT 25
);

-- =====================================================
-- GÜNCELLENMİŞ ÖZET
-- =====================================================

SELECT 
  'Toplam Müşteri' as bilgi, COUNT(*)::text as adet FROM customers
UNION ALL
SELECT 
  'Toplam Tedarikçi', COUNT(*)::text FROM suppliers
UNION ALL
SELECT 
  'Toplam Pozisyon', COUNT(*)::text FROM positions
UNION ALL
SELECT 
  'Aktif Pozisyonlar (IN_TRANSIT + READY_TO_DEPART)', COUNT(*)::text FROM positions WHERE status IN ('IN_TRANSIT', 'READY_TO_DEPART')
UNION ALL
SELECT 
  'Yoldaki Araçlar (IN_TRANSIT)', COUNT(*)::text FROM positions WHERE status = 'IN_TRANSIT'
UNION ALL
SELECT 
  'Teslimat Bekleyen (DELIVERED)', COUNT(*)::text FROM positions WHERE status = 'DELIVERED'
UNION ALL
SELECT 
  'Tamamlanan Pozisyonlar', COUNT(*)::text FROM positions WHERE status = 'COMPLETED'
UNION ALL
SELECT 
  'Toplam Fatura', COUNT(*)::text FROM invoices
UNION ALL
SELECT 
  'Bu Ayki Faturalar', COUNT(*)::text FROM invoices 
  WHERE DATE_TRUNC('month', invoice_date) = DATE_TRUNC('month', NOW())
UNION ALL
SELECT 
  'Ödenen Faturalar', COUNT(*)::text FROM invoices WHERE is_paid = TRUE;

