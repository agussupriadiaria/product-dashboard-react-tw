# 🚀 PRODASH — Product Dashboard aja

Dashboard manajemen produk modern dengan custom auth, Supabase, React, dan Recharts.

## ✨ Fitur

- 🔐 **Auth** — login email + password, session di sessionStorage
- 📦 **List Produk** — tabel dengan pagination (10 item/halaman)
- 🔍 **Search** — real-time search by nama produk
- 🏷️ **Filter** — filter by kategori, min/max harga
- ↕️ **Sorting** — klik header tabel untuk sort (asc/desc)
- 📊 **Statistik** — total produk, nilai inventori, stok rendah
- 📈 **Charts** — Bar chart & Pie chart per kategori (Recharts)
- ✏️ **CRUD** — tambah, edit, hapus produk

## 🔐 Sistem Auth

- Tabel `users` custom di Supabase (bukan Supabase Auth)
- Password disimpan sebagai **SHA-256 hash** (Web Crypto API — tanpa library)
- Session di **sessionStorage** (clear otomatis saat tab ditutup)
- Semua route protected → redirect ke `/login` jika belum login
- User baru hanya bisa ditambah admin via Supabase dashboard

---

## ⚡ Setup (Urutan penting!)

### 1. Setup Supabase

1. Buat akun & project di [supabase.com](https://supabase.com)
2. Masuk ke **SQL Editor**
3. Paste isi `supabase-setup.sql` → klik **Run**

Ini akan membuat:

- Tabel `users` + 1 akun admin default
- Tabel `products` + 40 seed data produk

**Default login:**

```
Email    : admin@example.com
Password : admin123
```

### 2. Tambah User Baru (via Supabase Dashboard)

1. Buka **SQL Editor** di Supabase
2. Jalankan query berikut untuk generate hash:
   ```sql
   SELECT encode(digest('passwordkamu', 'sha256'), 'hex');
   ```
3. Copy hasilnya
4. Buka **Table Editor** → tabel `users` → **Insert row**
5. Isi `email`, `name`, dan `password_hash` (paste hasil query tadi)

### 3. Ambil API Keys

Di Supabase: ⚙️ **Settings** → **API**

- Salin **Project URL**
- Salin **anon public** key

### 4. Setup .env

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 5. Install & Jalankan

```bash
pnpm install
pnpm dev
```

Buka [http://localhost:5173](http://localhost:5173) → login → selesai ✅

---

## 📁 Struktur Proyek

```
src/
├── context/
│   └── AuthContext.tsx        # Auth state global (login/logout/session)
├── components/
│   ├── Layout.tsx             # Sidebar + user info + logout
│   ├── ProtectedRoute.tsx     # Guard: redirect ke /login jika belum auth
│   ├── StatCard.tsx
│   ├── ProductModal.tsx
│   └── DeleteConfirmModal.tsx
├── hooks/
│   └── useProducts.ts         # Semua logika API Supabase (products)
├── lib/
│   └── supabase.ts            # Supabase client
├── pages/
│   ├── LoginPage.tsx          # Halaman login
│   ├── DashboardPage.tsx      # Overview + charts
│   └── ProductsPage.tsx       # CRUD + filter + sort
├── types/
│   └── database.ts            # TypeScript types (User, Product, dll)
├── App.tsx                    # Routing (AuthProvider wraps semua)
├── main.tsx
└── index.css
```

## 🗄️ Skema Database

```sql
users
├── id            BIGSERIAL  PRIMARY KEY
├── email         TEXT       UNIQUE NOT NULL
├── password_hash TEXT       NOT NULL        ← SHA-256 hex
├── name          TEXT       NOT NULL
└── created_at    TIMESTAMPTZ

products
├── id         BIGSERIAL  PRIMARY KEY
├── name       TEXT       NOT NULL
├── price      NUMERIC    NOT NULL
├── category   TEXT       NOT NULL
├── stock      INTEGER    NOT NULL
└── created_at TIMESTAMPTZ
```

## 📝 Build Production

```bash
pnpm build
pnpm preview
```
