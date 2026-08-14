# Docker + GitHub — Backend (BE)

Panduan buat anggota baru: jalanin **backend + database** pakai Docker, dan
push code ke GitHub sebagai `main`. Panduan frontend ada di
[`tubes-cheva2-fe/docker.md`](../tubes-cheva2-fe/docker.md).

## Prasyarat

| Kebutuhan            | Kenapa                                                   |
|----------------------|----------------------------------------------------------|
| **Docker Desktop**   | Buat jalanin DB + backend tanpa install database manual  |
| **Git**              | Buat ambil & upload code                                 |
| **Akun GitHub**      | Tempat repo project                                      |

Cek semua sudah terpasang:

```bash
docker --version
docker compose version
git --version
```

---

## 1. Ambil Project (Clone dari GitHub)

```bash
git clone https://github.com/Goldenkwi/tubes-cheva2-be.git
cd tubes-cheva2-be
```

> Setiap kali mau update code terbaru dari tim:
> ```bash
> git pull
> ```

---

## 2. Jalanin Backend + Database Pakai Docker

Semua sudah dikonfigurasi lewat `docker-compose.yml` di folder ini. Cukup satu perintah:

```bash
docker compose up --build
```

Yang terjadi otomatis:

1. Nyalain **PostgreSQL 16**
2. **Apply migrations** database
3. **Seed data contoh** (admin, layanan, pelanggan, pesanan)
4. Jalanin **backend** di port 8000

Tunggu sampai keluar log `Server running` (atau sejenisnya), lalu buka:

| Yang dibuka          | URL                              |
|----------------------|----------------------------------|
| API                  | http://localhost:8000/api        |
| Swagger UI (docs)    | http://localhost:8000/api/docs   |
| Health check         | http://localhost:8000/api/health |

**Login admin default:** `admin@cheva.local` / `admin12345678`

---

## 3. Putus/Padamkan Service

```bash
docker compose down        # stop, data tetap ada
docker compose down -v     # stop + HAPUS data DB (reset bersih)
```

Lihat log backend:

```bash
docker compose logs -f be
```

Untuk jalan di background (terminal bebas dipakai):

```bash
docker compose up --build -d
```

---

## 4. Push Perubahan ke GitHub (Sebagai `main`)

Style yang dipakai tim ini: **langsung push ke branch `main`**.

### a. Cek posisi

Pastikan kamu di branch `main` dan di folder project BE:

```bash
git branch
git status
```

> Kalau belum di `main`:
> ```bash
> git checkout main
> git pull
> ```

### b. Lihat & pilih file yang berubah

```bash
git status                    # daftar file yang berubah
git add <file>                # pilih file tertentu
git add .                     # atau ambil SEMUA perubahan
```

### c. Commit dengan pesan jelas

```bash
git commit -m "pesan: apa yang kamu ubah"
```

Contoh: `git commit -m "fix: perbaiki bug login admin"`

### d. Push ke GitHub

```bash
git push origin main
```

Selesai. Code kamu sudah naik ke repo GitHub, anggota lain tinggal
`git pull` untuk dapat perubahan yang sama.

---

## Tips

- **Jangan commit file sensitif** — `.env` (berisi password & JWT secret) sudah
  otomatis dikecualikan lewat `.gitignore`. Jangan pernah paksa push file itu
  (`git add -f .env` itu terlarang).
- **Pull dulu sebelum push** — biar tidak konflik:
  ```bash
  git pull && git push origin main
  ```
- **Kalau terjadi konflik** — tanya anggota yang lebih senior, jangan di-asal
  hapus. Konflik itu normal dan bisa diselesaikan.
- **Pesanan kalau bingung**: clone → pull → jalanin Docker → cek API → ubah
  code → add → commit → push. Alur itu aja.