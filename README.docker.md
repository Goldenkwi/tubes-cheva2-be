# Cheva Laundry — Backend Pakai Docker

Docker menjalankan **Database + Backend**.

## Prasyarat
- Docker & Docker Compose (untuk BE + DB)

## 1. Jalanin Backend + Database

```bash
docker compose up --build
```

Compose otomatis:
1. Nyalain PostgreSQL 16
2. Apply Prisma migrations (`prisma migrate deploy`)
3. Seed data contoh (admin, layanan bertingkat, pelanggan, pesanan multi-layanan, pengeluaran)
4. Jalanin backend di port 8000

## Dari Mana Image Datang (Pull Docker Hub)

`docker compose up` otomatis **menarik image dari Docker Hub** kalau belum ada
di komputer kamu:

| Image | Diambil dari | Kegunaan |
|-------|--------------|----------|
| `postgres:16-alpine` | Docker Hub resmi | Database PostgreSQL |
| `ammarkwi/cheva2-be` | Docker Hub — milik tim | Backend API |

Terlihat pas pertama jalan (log kalimat `Pulling postgres:16-alpine` /
`Pulling ammarkwi/cheva2-be`). Kalau image sudah pernah ter-pull, compose
langsung pakai yang lokal (jalan lebih cepat).

### Pull manual (biar nampak jelas)

```bash
docker pull postgres:16-alpine
docker pull ammarkwi/cheva2-be:latest
```

### Ngambil versi terbaru image backend dari Docker Hub

```bash
docker compose pull
```

Ini **memaksa tarik image terbaru** dari Docker Hub, walau versi lama sudah
ada di lokal. Jalanin ini kalau anggota tim baru push image backend yang
diperbarui, lalu restart:

```bash
docker compose pull && docker compose up -d
```

> **Kenapa image backend ada di Docker Hub?** Supaya siapa pun tinggal
> `docker compose up` dan dapat API terbaru **tanpa perlu clone source code
> atau build manual**. Image `ammarkwi/cheva2-be:latest` di-push oleh maintainer
> setelah perubahan code dirasa sudah stabil.

## Akses

| Service    | URL                            |
|------------|--------------------------------|
| Backend    | http://localhost:8000/api      |
| API Docs   | http://localhost:8000/api/docs |
| Health     | http://localhost:8000/api/health |
| Postgres   | localhost:5432                 |

## Login Admin (default)

- Email: `admin@cheva.local`
- Password: `admin12345678`

## Konfigurasi (opsional)

Semua punya default. Untuk override, set environment variable sebelum `up`
(atau bikin `.env.docker` lalu `docker compose --env-file .env.docker up`).
Lihat `.env.docker.example` untuk daftar variabel (POSTGRES_PASSWORD, JWT_SECRET,
SEED_ADMIN_*).

## Perintah Berguna

```bash
docker compose up --build -d     # jalan di background
docker compose logs -f be        # lihat log backend
docker compose down              # stop
docker compose down -v           # stop + hapus data DB (reset bersih)
```

## Reset Database

```bash
docker compose down -v && docker compose up --build
```

## Catatan Payment

Pembayaran bersifat **manual** (tanpa payment gateway). Owner cukup pasang QR
GoPay statik; admin/staff menandai status pembayaran secara manual (UNPAID →
PAID). Metode yang didukung: CASH, QRIS, TRANSFER, EWALLET.
