-- ============================================================
-- PRODEX Dashboard - Supabase Setup
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABEL USERS (custom auth, tanpa Supabase Auth)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id            BIGSERIAL    PRIMARY KEY,
  email         TEXT         NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,   -- SHA-256 hex string
  name          TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Hanya anon bisa SELECT (untuk proses login)
-- INSERT/UPDATE/DELETE hanya bisa dilakukan dari Supabase dashboard (service_role)
CREATE POLICY "Allow anon select for login"
  ON public.users FOR SELECT TO anon USING (true);

-- Index untuk login query
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);


-- ============================================================
-- 2. HELPER: generate SHA-256 di SQL (untuk seed user dari dashboard)
--
-- CARA PAKAI DI SUPABASE DASHBOARD:
--   1. Buka Table Editor → tabel "users"
--   2. Klik "Insert row"
--   3. Isi kolom:
--      • email         : admin@example.com
--      • password_hash : (copy hasil query di bawah)
--      • name          : Administrator
--
-- ATAU jalankan query ini langsung untuk generate hash password:
--
--   SELECT encode(digest('passwordkamu', 'sha256'), 'hex');
--
-- Pastikan extension pgcrypto aktif:
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Contoh insert admin user ──────────────────────────────
-- Password: admin123  →  hash SHA-256 nya:
-- 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a
-- (generate sendiri: SELECT encode(digest('passwordkamu', 'sha256'), 'hex'))

INSERT INTO public.users (email, password_hash, name)
VALUES (
  'admin@example.com',
  encode(digest('admin123', 'sha256'), 'hex'),
  'Administrator'
)
ON CONFLICT (email) DO NOTHING;

-- Tambah user lain sesuai kebutuhan:
-- INSERT INTO public.users (email, password_hash, name) VALUES
--   ('user2@example.com', encode(digest('passwordnya', 'sha256'), 'hex'), 'Nama User 2');


-- ============================================================
-- 3. TABEL PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id         BIGSERIAL    PRIMARY KEY,
  name       TEXT         NOT NULL,
  price      NUMERIC      NOT NULL DEFAULT 0,
  category   TEXT         NOT NULL,
  stock      INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products: hanya anon yang sudah login bisa akses
-- (karena kita pakai custom auth bukan Supabase Auth,
--  policy ini dibuat permissive — keamanan ditangani di level aplikasi)
CREATE POLICY "Allow all for anon"
  ON public.products FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- Index performa
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_price    ON public.products (price);


-- ============================================================
-- 4. SEED DATA — 40 contoh produk
-- ============================================================
INSERT INTO public.products (name, price, category, stock) VALUES
  -- Electronics
  ('Samsung Galaxy S24 Ultra',    19999000, 'Electronics', 45),
  ('iPhone 15 Pro Max',           24999000, 'Electronics', 30),
  ('Sony WH-1000XM5 Headphones',  4999000,  'Electronics', 60),
  ('Laptop ASUS ROG Zephyrus G14',22000000, 'Electronics', 15),
  ('iPad Air M2',                 12999000, 'Electronics', 28),
  ('Canon EOS R50 Camera',        14500000, 'Electronics', 8),
  ('Apple Watch Series 9',        7999000,  'Electronics', 35),
  ('Nintendo Switch OLED',        5500000,  'Electronics', 20),
  -- Clothing
  ('Kemeja Flannel Premium',       189000,  'Clothing', 120),
  ('Celana Chino Slim Fit',        259000,  'Clothing', 85),
  ('Jaket Bomber Kulit Sintetis',  449000,  'Clothing', 40),
  ('Kaos Polos Oversize',           99000,  'Clothing', 200),
  ('Sepatu Sneakers Putih',        380000,  'Clothing', 55),
  ('Hoodie Unisex Tebal',          320000,  'Clothing', 90),
  ('Dress Casual Floral',          275000,  'Clothing', 45),
  ('Topi Baseball Bordir',          89000,  'Clothing', 150),
  -- Food & Beverage
  ('Kopi Arabica Gayo 250gr',       85000,  'Food & Beverage', 300),
  ('Dark Chocolate 70% 100gr',      45000,  'Food & Beverage', 250),
  ('Madu Hutan Murni 500ml',       135000,  'Food & Beverage', 75),
  ('Granola Oat Mix 500gr',         72000,  'Food & Beverage', 160),
  ('Green Tea Premium 100 Sachet',  65000,  'Food & Beverage', 200),
  ('Almond Roasted 250gr',          95000,  'Food & Beverage', 180),
  ('Protein Bar Set (12pcs)',       145000,  'Food & Beverage', 90),
  ('Selai Kacang Natural 400gr',    55000,  'Food & Beverage', 130),
  -- Books
  ('Atomic Habits - James Clear',  119000,  'Books', 50),
  ('Clean Code - Robert Martin',   185000,  'Books', 30),
  ('The Psychology of Money',      110000,  'Books', 65),
  ('Deep Work - Cal Newport',      105000,  'Books', 40),
  -- Sports
  ('Dumbbell Set Adjustable 20kg', 750000,  'Sports', 25),
  ('Yoga Mat Premium 6mm',         250000,  'Sports', 70),
  ('Resistance Band Set 5pcs',     145000,  'Sports', 110),
  ('Jump Rope Speed Steel',         85000,  'Sports', 90),
  ('Sepatu Running Adidas',        890000,  'Sports', 35),
  -- Home & Garden
  ('Standing Desk Electric 140cm',4500000,  'Home & Garden', 12),
  ('Tanaman Monstera Deliciosa',   125000,  'Home & Garden', 40),
  ('Diffuser Aroma Ultrasonic',    275000,  'Home & Garden', 55),
  ('Pot Keramik Set 3pcs',         165000,  'Home & Garden', 80),
  -- Health & Beauty
  ('Sunscreen SPF50 PA++++ 60ml',   89000,  'Health & Beauty', 200),
  ('Vitamin C 1000mg 30 Tablet',    65000,  'Health & Beauty', 350),
  ('Face Serum Niacinamide 30ml',  145000,  'Health & Beauty', 120);


-- ============================================================
-- 5. VERIFIKASI
-- ============================================================
SELECT 'users'    AS tabel, COUNT(*) AS total FROM public.users
UNION ALL
SELECT 'products' AS tabel, COUNT(*) AS total FROM public.products;
