# Cheva Laundry API

Laundry management system — Backend API for managing orders, customers, services, transactions, and real-time laundry status tracking.

Built with **Node.js + Express + Prisma + PostgreSQL**.

---

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

--- 

## Quick Start

```bash
# 1. Clone & masuk directory
cd tubes-cheva

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
```

Edit `.env` — sesuaikan `DATABASE_URL` dengan kredensial PostgreSQL kamu, lalu generate JWT secret:

```bash
# Generate random JWT_SECRET langsung ke .env
npm run jwt:secret
```

Atau edit manual `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tubes_cheva"
JWT_SECRET=<sudah otomatis terisi>
```

```bash
# 4. Buat database
createdb tubes_cheva

# 5. Jalankan migration yang tersimpan
npm run prisma:migrate:deploy

# 6. Seed data awal
npm run prisma:seed

# 7. Jalankan dev server
npm run dev
```

Server berjalan di `http://localhost:3000`.

---

## Admin Development

Seeder membuat admin dari `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`,
`SEED_ADMIN_PHONE`, dan `SEED_ADMIN_PASSWORD` di `.env`. Gunakan password
minimal 12 karakter dan jangan gunakan credential development di production.

---

## Scripts

| Script                  | Perintah                     |
|-------------------------|------------------------------|
| Dev server (nodemon)    | `npm run dev`                |
| Production start        | `npm start`                  |
| Generate Prisma client  | `npm run prisma:generate`    |
| Validasi Prisma schema  | `npm run prisma:validate`    |
| Format Prisma schema    | `npm run prisma:format`      |
| Buat migration dev      | `npm run prisma:migrate -- --name <nama>` |
| Apply migration         | `npm run prisma:migrate:deploy` |
| Status migration        | `npm run prisma:migrate:status` |
| Reset database dev      | `npm run prisma:reset`       |
| Seed data               | `npm run prisma:seed`        |
| Buka Prisma Studio      | `npm run prisma:studio`      |
| Generate JWT secret     | `npm run jwt:secret`         |
| Lint code               | `npm run lint`               |

---

## API Reference

Base URL: `http://localhost:8000/api`

### Health Check

```
GET /api/health
```

Response:
```json
{
  "success": true,
  "message": "Cheva Laundry API is running",
  "timestamp": "2026-07-12T12:00:00.000Z"
}
```

---

### Auth

| Method | Endpoint             | Auth  | Deskripsi              |
|--------|----------------------|-------|------------------------|
| POST   | `/api/login`    | -     | Login email + password |
| POST   | `/api/register` | -     | Registrasi user baru (sementara publik, lihat catatan di bawah) |
| POST   | `/api/logout`   | -     | Logout (stateless, no-op di server) |
| GET    | `/api/me`       | All   | Profile user login     |

> **Catatan:** `/api/register` sengaja dibuat publik untuk kebutuhan
> development lokal supaya FE bisa langsung mendaftarkan user tanpa perlu
> token admin terlebih dahulu. Perketat kembali (`authenticate` + `adminOnly`)
> sebelum deploy ke production.

#### Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "<SEED_ADMIN_EMAIL>", "password": "<SEED_ADMIN_PASSWORD>"}'
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "name": "Admin Utama Laundry",
      "email": "<SEED_ADMIN_EMAIL>",
      "role": "ADMIN"
    }
  }
}
```

> Semua endpoint di bawah membutuhkan header: `Authorization: Bearer <token>`

---

### Users (Manajemen Staff)

| Method | Endpoint                  | Auth  | Deskripsi             |
|--------|---------------------------|-------|-----------------------|
| GET    | `/api/users`           | Admin | List semua staff      |
| PUT    | `/api/users/:id`       | Admin | Edit staff            |
| DELETE | `/api/users/:id`       | Admin | Nonaktifkan staff     |

---

### Customers (Pelanggan)

| Method | Endpoint                       | Auth       | Deskripsi              |
|--------|--------------------------------|------------|------------------------|
| GET    | `/api/customers`            | Admin/Staff| List pelanggan         |
| GET    | `/api/customers/:id`        | Admin/Staff| Detail pelanggan       |
| POST   | `/api/customers`            | Admin/Staff| Tambah pelanggan       |
| PUT    | `/api/customers/:id`        | Admin/Staff| Edit pelanggan         |

Query params untuk GET `/customers`:
- `search` — cari berdasarkan nama atau nomor telepon
- `page` — halaman (default: 1)
- `limit` — per halaman (default: 20)

#### Tambah Pelanggan

```bash
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Budi Santoso",
    "phone": "081234567891",
    "address": "Jl. Merdeka No. 10"
  }'
```

---

### Services (Layanan)

| Method | Endpoint                    | Auth       | Deskripsi            |
|--------|-----------------------------|------------|----------------------|
| GET    | `/api/services`          | Public     | List layanan aktif   |
| GET    | `/api/services?all=true` | Public     | List semua layanan   |
| GET    | `/api/services/:id`      | Public     | Detail layanan       |
| POST   | `/api/services`          | Admin      | Tambah layanan       |
| PUT    | `/api/services/:id`      | Admin      | Edit layanan         |
| DELETE | `/api/services/:id`      | Admin      | Nonaktifkan layanan  |

Tipe layanan: `KILOAN`, `SATUAN`, `EXPRESS`

#### Tambah Layanan

```bash
curl -X POST http://localhost:8000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "code": "WASH_IRON_PREMIUM",
    "name": "Cuci Setrika Premium",
    "type": "KILOAN",
    "pricePerKg": 10000,
    "description": "Cuci + setrika + pewangi premium"
  }'
```

---

### Orders (Pesanan)

| Method | Endpoint                              | Auth       | Deskripsi                  |
|--------|---------------------------------------|------------|----------------------------|
| GET    | `/api/orders`                      | Admin/Staff| List pesanan               |
| GET    | `/api/orders/:id`                  | Admin/Staff| Detail pesanan + history   |
| POST   | `/api/orders`                      | Admin/Staff| Buat pesanan baru          |
| PUT    | `/api/orders/:id`                  | Admin/Staff| Edit pesanan               |
| PATCH  | `/api/orders/:id/status`           | Admin/Staff| Update status cucian       |
| GET    | `/api/orders/tracking/:trackingToken`| Public   | Tracking oleh pelanggan    |

Query params untuk GET `/orders`:
- `status` — filter status (PENDING, WASHING, READY, dll)
- `customerId` — filter by pelanggan
- `startDate`, `endDate` — filter tanggal
- `page`, `limit` — pagination

Order status flow:
```
PENDING → PICKUP → WASHING → DRYING → IRONING → PACKING → READY → DELIVERED → COMPLETED
                                                                             ↓
                                                                         CANCELLED
```

#### Buat Pesanan

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "customerId": 1,
    "serviceId": 1,
    "weight": 3.5,
    "notes": "Jemput jam 10 pagi"
  }'
```

#### Update Status

```bash
curl -X PATCH http://localhost:8000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "WASHING", "notes": "Sedang dicuci"}'
```

Harga dihitung oleh server dari harga layanan dan berat/jumlah item. Client tidak
boleh mengirim `totalPrice`.

#### Tracking (Public dengan tracking token)

```bash
curl http://localhost:8000/api/orders/tracking/550e8400-e29b-41d4-a716-446655440000
```

---

### Transactions (Transaksi & Keuangan)

| Method | Endpoint                                  | Auth  | Deskripsi              |
|--------|-------------------------------------------|-------|------------------------|
| GET    | `/api/transactions`                    | Admin | List transaksi         |
| POST   | `/api/transactions/:id/pay`            | All   | Catat pembayaran       |
| GET    | `/api/transactions/report/daily`       | Admin | Laporan harian         |
| GET    | `/api/transactions/report/monthly`     | Admin | Laporan bulanan        |

#### Catat Pembayaran

Nominal pembayaran selalu menggunakan `Order.totalPrice`; field `amount` dari
client tidak diterima. Satu order hanya dapat memiliki satu transaksi.

```bash
curl -X POST http://localhost:8000/api/transactions/1/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "paymentMethod": "QRIS",
    "notes": "Pembayaran via QRIS"
  }'
```

#### Laporan Harian

```bash
curl "http://localhost:8000/api/transactions/report/daily?date=2026-07-12" \
  -H "Authorization: Bearer <token>"
```

#### Laporan Bulanan

```bash
curl "http://localhost:8000/api/transactions/report/monthly?year=2026&month=7" \
  -H "Authorization: Bearer <token>"
```

---

### Dashboard

| Method | Endpoint                                | Auth       | Deskripsi           |
|--------|-----------------------------------------|------------|---------------------|
| GET    | `/api/dashboard/stats`               | Admin/Staff| Statistik utama     |
| GET    | `/api/dashboard/recent-orders`       | Admin/Staff| Pesanan terbaru     |
| GET    | `/api/dashboard/revenue-chart`       | Admin/Staff| Data grafik revenue |

```bash
curl http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

Response:
```json
{
  "success": true,
  "data": {
    "activeOrders": 12,
    "todayOrders": 5,
    "monthlyRevenue": 450000,
    "pendingPickup": 3,
    "inProgress": 7,
    "readyForPickup": 2,
    "totalCustomers": 48
  }
}
```

---

### Notifications

| Method | Endpoint                               | Auth   | Deskripsi                     |
|--------|----------------------------------------|--------|-------------------------------|
| GET    | `/api/notifications/:customerId`    | Public | Notifikasi pelanggan          |
| PATCH  | `/api/notifications/:id/read`       | Public | Tandai sudah dibaca           |

---

## Database Models

```
User (Admin/Staff)
  ├── id, name, email, password, phone, role, isActive

Customer (Pelanggan)
  ├── id, name, phone, email, address
  ├── totalOrders, totalWeight, loyaltyPoints
  └── orders, notifications, transactions

Service (Layanan)
  ├── id, code (unique), name, type (KILOAN/SATUAN/EXPRESS)
  ├── pricePerKg, priceUnit, description, isActive
  └── orders

Order (Pesanan)
  ├── id, orderNumber (LC-YYYYMMDD-XXXX), trackingToken
  ├── customerId → Customer
  ├── serviceId → Service
  ├── weight, totalPrice, status
  ├── pickupAddress, deliveryAddress, estimatedDone, completedAt
  ├── courierId → User
  └── statusHistories, transactions, notifications

OrderStatusHistory
  ├── orderId → Order
  ├── status, changedBy → User, notes

Transaction
  ├── orderId → Order (unique)
  ├── amount, paymentMethod (CASH/QRIS/EWALLET)
  ├── paymentStatus (UNPAID/PAID/REFUNDED)
  └── paidAt, paymentProof

Notification
  ├── customerId → Customer, orderId → Order
  ├── type (STATUS_UPDATE/PROMO/BILLING)
  └── title, message, isRead
```

---

## Tech Stack

| Layer      | Teknologi                                   |
|------------|---------------------------------------------|
| Runtime    | Node.js                                     |
| Framework  | Express                                     |
| ORM        | Prisma                                      |
| Database   | PostgreSQL                                  |
| Auth       | JSON Web Token (JWT) + bcryptjs             |
| Validation | Zod                                         |
| Upload     | Multer                                      |
| Logging    | Winston + Morgan                            |
| Security   | Helmet, CORS                                |

---

## Error Handling

Semua response error mengikuti format yang sama:

```json
{
  "success": false,
  "message": "Deskripsi error"
}
```

Untuk validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "body.email", "message": "Invalid email format" }
  ]
}
```

HTTP Status Codes:
- `200` — Success
- `201` — Created
- `400` — Bad Request / Validation Error
- `401` — Unauthorized (token tidak ada / salah)
- `403` — Forbidden (role tidak sesuai)
- `404` — Resource not found
- `500` — Internal Server Error

---

## Project Structure

```
src/
├── config/          # Environment & database config
├── middleware/       # Auth, validation, upload, error handler
├── controllers/     # Request handlers (thin layer)
├── services/        # Business logic (thick layer)
├── validators/      # Zod schemas per entity
├── utils/           # Helpers (response, jwt, logger, constants)
├── routes/          # Route definitions
├── app.js           # Express app setup
└── server.js        # Entry point
prisma/
├── schema.prisma    # Database schema
└── seed.js          # Seed data
```

## Database Workflow

`prisma/schema.prisma` adalah satu-satunya sumber struktur database aktif.
File SQL di `docs/database/legacy/` hanya arsip desain lama dan tidak boleh
dijalankan bersama Prisma Migration.

Untuk mengubah schema selama development:

```bash
npm run prisma:format
npm run prisma:validate
npm run prisma:migrate -- --name nama_perubahan
```

Review dan commit `prisma/schema.prisma` bersama folder migration yang dibuat.
Untuk staging atau production gunakan:

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate:deploy
npm start
```

Jangan menjalankan `prisma migrate dev`, `prisma migrate reset`, atau
`prisma db push` pada database production. `npm run prisma:reset` menghapus
seluruh data dan hanya boleh digunakan pada database development.
