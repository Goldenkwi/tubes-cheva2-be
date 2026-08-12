# Cheva Laundry API

Backend API for laundry management — orders, customers, services, transactions, expenses, staff, quick replies, and real-time status tracking.

**Stack:** Node.js + Express + Prisma + PostgreSQL + JWT

---

## Quick Start

### Opsi A — Docker (paling gampang, DB + BE otomatis)

Dari folder repo ini:

```bash
docker compose up --build
```

Compose otomatis: nyalain PostgreSQL, apply migrations, seed data contoh, lalu
jalanin API di `http://localhost:8000`. Panduan lengkap: [`README.docker.md`](./README.docker.md).

Diajari langkah demi langkah (clone, jalanin, push ke GitHub):
[`docker.md`](./docker.md).

### Opsi B — Manual (Node lokal)

```bash
npm install
cp .env.example .env     # lalu isi DATABASE_URL + JWT_SECRET
npm run prisma:migrate:deploy
npm run prisma:seed
npm run dev
```

Server berjalan di `http://localhost:8000`.

> Butuh PostgreSQL lokal. Buat database `tubes_cheva` dulu, lalu isi
> `DATABASE_URL` (lihat `.env.example`). Generate `JWT_SECRET`
> dengan `npm run jwt:secret`.

---

## Docs & Testing

| URL | Deskripsi |
|-----|-----------|
| `http://localhost:8000/api/docs` | Swagger UI (interaktif, bisa test langsung) |
| `http://localhost:8000/api/health` | Health check |
| `http://localhost:8000/api/ready` | Readiness check (cek koneksi DB) |

---

## Scripts

| Script | Perintah |
|--------|----------|
| Dev server | `npm run dev` |
| Production | `npm start` |
| Prisma: generate client | `npm run prisma:generate` |
| Prisma: validasi | `npm run prisma:validate` |
| Prisma: format | `npm run prisma:format` |
| Prisma: migration baru | `npm run prisma:migrate -- --name <nama>` |
| Prisma: apply migration | `npm run prisma:migrate:deploy` |
| Prisma: status | `npm run prisma:migrate:status` |
| Prisma: reset DB | `npm run prisma:reset` |
| Prisma: seed | `npm run prisma:seed` |
| Prisma: studio | `npm run prisma:studio` |
| Generate JWT secret | `npm run jwt:secret` |
| Lint | `npm run lint` |

---

## API Endpoints

### Public (Bebas Akses)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/ready` | Readiness check (DB) |
| GET | `/api/services` | List layanan aktif (termasuk sub-layanan) |
| GET | `/api/services/tree` | List layanan bertingkat (parent + children) |
| GET | `/api/services/:id` | Detail layanan |
| POST | `/api/login` | Login User / Staff / Admin |
| POST | `/api/logout` | Logout (stateless) |
| POST | `/api/customers/register` | Registrasi pelanggan baru |
| POST | `/api/customers/login` | Login pelanggan |
| POST | `/api/customers/claim-account` | Klaim/aktivasi akun pelanggan offline (tanpa password) |
| GET | `/api/orders/tracking/:trackingToken` | Tracking pesanan by UUID |

### Customer Auth (`authenticateCustomer`)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/customers/me` | Profil pelanggan yang sedang login |
| PUT | `/api/customers/me` | Update profil pelanggan |
| GET | `/api/orders/my-orders` | Daftar pesanan milik pelanggan login |
| GET | `/api/transactions/my-transactions` | Daftar transaksi milik pelanggan login |
| GET | `/api/notifications/my` | Notifikasi milik pelanggan login |
| PATCH | `/api/notifications/read-all` | Tandai semua notifikasi pelanggan sebagai dibaca |

### Dual Access: Customer / Staff / Admin (`authenticateCustomerOrUser`)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/orders/:id` | Detail pesanan (Customer: hanya milik sendiri; Staff/Admin: semua) |
| POST | `/api/orders` | Buat pesanan baru |
| POST | `/api/transactions/:id/pay` | Catat/upload pembayaran (Customer: ownership check; Staff/Admin: bebas) |
| GET | `/api/notifications/:customerId` | Notifikasi pelanggan by ID (Customer: ownership check) |
| PATCH | `/api/notifications/:id/read` | Tandai notifikasi spesifik sudah dibaca (Customer: ownership check) |
| GET | `/api/quick-replies` | List pertanyaan cepat / canned questions aktif |
| GET | `/api/canned-questions/:id` | Detail pertanyaan cepat |
| POST | `/api/quick-replies/ask` | Ajukan pertanyaan cepat (Rate limited: maks 10x/jam) |

### Staff / Admin Required (`staffAndAbove`)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/me` | Profil User/Staff/Admin login |
| GET | `/api/customers` | List semua pelanggan (search, pagination) |
| GET | `/api/customers/:id` | Detail pelanggan |
| POST | `/api/customers` | Buat pelanggan baru manual oleh staf (tanpa password) |
| PUT | `/api/customers/:id` | Update data pelanggan |
| GET | `/api/orders` | List semua pesanan (filter: status, customerId, date range) |
| PUT | `/api/orders/:id` | Edit data pesanan |
| PATCH | `/api/orders/:id/status` | Update status pesanan (PENDING → WASHING → DRYING dst) |
| GET | `/api/dashboard/stats` | Statistik dashboard (4 kartu + % perubahan vs kemarin) |
| GET | `/api/dashboard/recent-orders` | Daftar pesanan terbaru |
| GET | `/api/dashboard/revenue-chart` | Data grafik pendapatan |

### Admin Only (`adminOnly`)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/register` | Tambah akun Staff/Admin baru |
| GET | `/api/users` | List seluruh staff/user |
| PUT | `/api/users/:id` | Edit data staff/user |
| DELETE | `/api/users/:id` | Nonaktifkan akun staff/user |
| POST | `/api/services` | Tambah jenis layanan baru |
| PUT | `/api/services/:id` | Edit jenis layanan |
| DELETE | `/api/services/:id` | Nonaktifkan jenis layanan |
| GET | `/api/transactions` | List seluruh transaksi |
| GET | `/api/transactions/report/daily` | Laporan pendapatan harian |
| GET | `/api/transactions/report/monthly` | Laporan pendapatan bulanan |
| GET | `/api/expenses` | List pengeluaran (filter: category, date range, pagination) |
| GET | `/api/expenses/summary` | Ringkasan pengeluaran bulan berjalan (total + per kategori) |
| GET | `/api/expenses/:id` | Detail pengeluaran |
| POST | `/api/expenses` | Catat pengeluaran baru |
| PUT | `/api/expenses/:id` | Edit pengeluaran |
| DELETE | `/api/expenses/:id` | Hapus pengeluaran |
| POST | `/api/canned-questions` | Tambah pertanyaan cepat baru |
| PUT | `/api/canned-questions/:id` | Edit pertanyaan cepat |
| PATCH | `/api/canned-questions/:id/deactivate` | Nonaktifkan pertanyaan cepat |
| DELETE | `/api/canned-questions/:id` | Hapus pertanyaan cepat |
| GET | `/api/canned-questions/history` | Riwayat audit tanya-jawab pertanyaan cepat |

> `/api/products/*` adalah alias dari `/api/services/*` (kompatibilitas FE).  
> `/api/quick-replies/*` adalah alias dari `/api/canned-questions/*`.

---

## Order Status Flow

8 status (mengikuti desain Figma):

```
PENDING → WASHING → DRYING → IRONING → READY → DELIVERED → COMPLETED
   └──────────┴─────────┴─────────┴────────┴──────→ CANCELLED
```

| Status | Label (ID) |
|--------|------------|
| PENDING | Menunggu |
| WASHING | Dicuci |
| DRYING | Dikeringkan |
| IRONING | Disetrika |
| READY | Siap Diambil |
| DELIVERED | Diantar |
| COMPLETED | Selesai |
| CANCELLED | Dibatalkan |

`CANCELLED` bisa dari tahap mana pun sebelum `DELIVERED`. Transisi divalidasi
di `ORDER_TRANSITIONS` (`src/utils/constants.js`).

---

## Response Format

Semua response mengikuti format:

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid format" }]
}
```

| Status | Arti |
|--------|------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (token salah/hilang) |
| 403 | Forbidden (role tidak sesuai / ownership check gagal) |
| 404 | Not Found |
| 429 | Too Many Requests (Rate limit tercapai) |
| 500 | Internal Server Error |

---

## Auth & Token Types

Header HTTP: `Authorization: Bearer <token>`

Aplikasi ini menggunakan 2 jenis token JWT terpisah untuk keamanan entitas:

1. **Token Staff / Admin (`User`):**
   * Payload: `{ userId, role }` (`ADMIN` / `STAFF`)
   * Digunakan untuk mengakses endpoint manajemen internal via middleware `authenticate`, `staffAndAbove`, dan `adminOnly`.
   * Pendaftaran staf/admin baru via `/api/register` **dikunci penuh** dan hanya dapat dilakukan oleh `ADMIN`.

2. **Token Pelanggan (`Customer`):**
   * Payload: `{ customerId }`
   * Digunakan untuk akses fitur self-service pelanggan via middleware `authenticateCustomer`.

3. **Dual Middleware (`authenticateCustomerOrUser`):**
   * Menerima baik Token Customer maupun Token User. Otomatis memverifikasi kepemilikan data (ownership check) jika diakses oleh Customer.

---

## Database Models

```
User                  → id, name, email, password, phone, role (ADMIN/STAFF), isActive, createdAt, updatedAt
Customer              → id, name, phone, email (nullable), password (nullable), address, totalOrders, totalWeight, loyaltyPoints, createdAt, updatedAt
Service               → id, code, name, type (KILOAN/SATUAN/EXPRESS), category (nullable), parentId (nullable, self-relation), pricePerKg, priceUnit, description, isActive, createdAt, updatedAt
Order                 → id, orderNumber, trackingToken, customerId, serviceId, weight, itemCount, totalPrice, status, pickupAddress, deliveryAddress, pickupDate, deliveryDate, estimatedDone, completedAt, notes, courierId, createdAt, updatedAt
OrderItem             → id, orderId, serviceId, name, weight (nullable), itemCount (nullable), unitPrice, subtotal, createdAt   (multi-layanan per pesanan)
Transaction           → id, orderId (unique), amount, paymentMethod (CASH/QRIS/TRANSFER/EWALLET), paymentStatus (UNPAID/PAID/REFUNDED), paidAt, paymentProof, notes, createdAt
Expense               → id, category (BAHAN_BAKU/UTILITAS/GAJI/ADMINISTRASI/LAINNYA), amount, source (nullable), description (nullable), receiptProof (nullable), spentAt, createdBy (nullable), createdAt, updatedAt
Notification          → id, customerId, orderId, type (STATUS_UPDATE/PROMO/BILLING), title, message, isRead, createdAt
CannedQuestion        → id, category, question, answer, isActive, createdAt, updatedAt
CannedQuestionHistory → id, cannedQuestionId, userId, customerId, orderId, questionText, answerText, userIp, createdAt
```

### Catatan model penting

- **Multi-layanan:** satu `Order` bisa punya beberapa `OrderItem` (mis. Cuci
  Kiloan + Selimut Kecil). `POST /api/orders` menerima `items[]`; kalau tidak,
  fallback ke `serviceId` tunggal (legacy, tetap didukung).
- **Layanan bertingkat:** `Service.parentId` = self-relation. Layanan tambahan
  (Selimut → Selimut Kecil/Sedang/Besar) jadi anak dari kategori induk. Ambil
  pohonnya via `GET /api/services/tree`.
- **Pembayaran manual:** tidak ada payment gateway. Owner pasang QR GoPay statik;
  admin/staff tandai `PAID` manual. Metode: CASH, QRIS, TRANSFER, EWALLET.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Rate Limiter | express-rate-limit |
| Upload | Multer |
| Logging | Winston + Morgan |
| Security | Helmet, CORS |
| Docs | Swagger UI (swagger-ui-express) |

---

## Project Structure

```
src/
├── config/        # env, database
├── middleware/    # auth, validate, rateLimiter, errorHandler, upload
├── controllers/   # thin - parse req, call service, send res
├── services/      # thick - business logic
├── validators/    # Zod schemas
├── utils/         # response, jwt, logger, constants
├── routes/        # route definitions
├── app.js         # Express setup + middleware + swagger
└── server.js      # entry point
prisma/
├── schema.prisma  # database schema
├── migrations/    # migration history (prisma migrate)
└── seed.js        # seed data (admin, layanan bertingkat, pelanggan, pesanan, pengeluaran)
docs/
└── swagger.json   # OpenAPI 3 spec (dirender di /api/docs)
```

---

## Database Migration

`prisma/schema.prisma` adalah satu-satunya source of truth.

Dev:
```bash
npm run prisma:format
npm run prisma:validate
npm run prisma:migrate -- --name nama_perubahan
```

Staging/Production:
```bash
npm ci
npm run prisma:generate
npm run prisma:migrate:deploy
npm start
```

