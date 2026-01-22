-- ============================================================
-- SUPABASE BELGE (DOCUMENT) DEPOLAMA KURULUMU
-- ============================================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın.
-- Belgelerin Storage'a yüklenebilmesi için gerekli bucket ve
-- politikaları oluşturur.
-- ============================================================

-- 1. DOCUMENTS TABLOSU - RLS ve POLİTİKA
-- (Eğer documents tablosunda RLS yoksa veya politika eksikse)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to documents" ON documents;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON documents;
CREATE POLICY "Allow full access to documents" ON documents
  FOR ALL USING (true) WITH CHECK (true);

-- 2. DOCUMENTS TABLOSUNA file_path KOLONU (silme için gerekli)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT;

-- 3. STORAGE BUCKET "documents" - MANUEL OLUŞTURMA
-- Supabase Dashboard > Storage > "New bucket" ile:
--   - İsim: documents
--   - Public: Evet (doğrudan link ile erişim) veya Hayır (imzalı URL gerekir)
--   - File size limit: 5 MB
-- Bucket'ı SQL ile oluşturamıyorsanız mutlaka Dashboard'dan oluşturun.

-- 4. STORAGE POLİTİKALARI (storage.objects)
-- Aşağıdaki politikalar "documents" bucket'ına yükleme/okuma/silme izni verir.

DROP POLICY IF EXISTS "Allow uploads to documents bucket" ON storage.objects;
CREATE POLICY "Allow uploads to documents bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow read from documents bucket" ON storage.objects;
CREATE POLICY "Allow read from documents bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow delete from documents bucket" ON storage.objects;
CREATE POLICY "Allow delete from documents bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents');

-- 5. BUCKET YOKSA OLUŞTURMA (opsiyonel - bazen çalışmayabilir)
-- Eğer "documents" bucket'ı yoksa, önce Dashboard > Storage'dan
-- manuel oluşturun, sonra yukarıdaki Storage politikalarını çalıştırın.

-- ============================================================
-- KONTROL LİSTESİ
-- ============================================================
-- [ ] 1. Bu SQL'i Supabase SQL Editor'de çalıştırdım
-- [ ] 2. Storage > "documents" bucket'ı oluşturdum (yoksa)
-- [ ] 3. Bucket ayarlarında "Public" veya uygun erişimi açtım
-- [ ] 4. Uygulamada belge yüklemeyi tekrar denedim
-- ============================================================
