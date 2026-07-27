# Cheva Laundry API

Backend API for laundry management — orders, customers, services, transactions, staff, and real-time status tracking.

**Stack:** Node.js + Express + Prisma + PostgreSQL + JWT

---

## Quick Start

```bash
npm install
cp .env.example .env     # lalu isi DATABASE_URL + JWT_SECRET
npm run prisma:migrate:deploy
npm run prisma:seed
npm run dev
```

Server berjalan di `http://localhost:8000`.

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

### Public
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/ready` | Readiness check (DB) |
| GET | `/api/services` | List layanan aktif |
| GET | `/api/services/:id` | Detail layanan |
| POST | `/api/login` | Login |
| POST | `/api/register` | Register (sementara publik) |
| POST | `/api/logout` | Logout (stateless) |
| GET | `/api/orders/tracking/:trackingToken` | Tracking pesanan by UUID |

### Auth Required (staffAndAbove)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/me` | Profile user login |
| GET | `/api/customers` | List pelanggan (search, page, limit) |
| GET | `/api/customers/:id` | Detail pelanggan |
| POST | `/api/customers` | Tambah pelanggan |
| PUT | `/api/customers/:id` | Edit pelanggan |
| GET | `/api/orders` | List pesanan (filter: status, customerId, date range) |
| GET | `/api/orders/:id` | Detail pesanan |
| POST | `/api/orders` | Buat pesanan |
| PUT | `/api/orders/:id` | Edit pesanan |
| PATCH | `/api/orders/:id/status` | Update status |
| POST | `/api/transactions/:id/pay` | Catat pembayaran |
| GET | `/api/dashboard/stats` | Statistik dashboard |
| GET | `/api/dashboard/recent-orders` | Pesanan terbaru |
| GET | `/api/dashboard/revenue-chart` | Data grafik revenue |
| GET | `/api/notifications/:customerId` | Notifikasi pelanggan |
| PATCH | `/api/notifications/:id/read` | Tandai sudah dibaca |

### Admin Only
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/users` | List staff |
| PUT | `/api/users/:id` | Edit staff |
| DELETE | `/api/users/:id` | Nonaktifkan staff |
| POST | `/api/services` | Tambah layanan |
| PUT | `/api/services/:id` | Edit layanan |
| DELETE | `/api/services/:id` | Nonaktifkan layanan |
| GET | `/api/transactions` | List transaksi |
| GET | `/api/transactions/report/daily` | Laporan harian |
| GET | `/api/transactions/report/monthly` | Laporan bulanan |

> `/api/products/*` adalah alias dari `/api/services/*` (kompatibilitas FE).

---

## Order Status Flow

```
PENDING → PICKUP → WASHING → DRYING → IRONING → PACKING → READY → DELIVERED → COMPLETED
                                                                              ↓
                                                                          CANCELLED
```

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
| 403 | Forbidden (role tidak sesuai) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Auth

Header: `Authorization: Bearer <token>`

Role: `ADMIN` (full akses), `STAFF` (operasional).

> `/api/register` publik hanya untuk development. Kunci dengan `authenticate` + `adminOnly` sebelum production.

---

## Database Models

```
User        → id, name, email, password, phone, role (ADMIN/STAFF), isActive
Customer    → id, name, phone, email, address, totalOrders, totalWeight, loyaltyPoints
Service     → id, code, name, type (KILOAN/SATUAN/EXPRESS), pricePerKg, priceUnit, isActive
Order       → id, orderNumber, trackingToken, customerId, serviceId, weight, totalPrice, status, ...times
Transaction → id, orderId (unique), amount, paymentMethod (CASH/QRIS/EWALLET), paymentStatus
Notification→ id, customerId, orderId, type (STATUS_UPDATE/PROMO/BILLING), title, message, isRead
```

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
| Upload | Multer |
| Logging | Winston + Morgan |
| Security | Helmet, CORS |
| Docs | Swagger UI (swagger-ui-express) |

---

## Project Structure

```
src/
├── config/        # env, database
├── middleware/     # auth, validate, errorHandler, upload
├── controllers/   # thin - parse req, call service, send res
├── services/      # thick - business logic
├── validators/    # Zod schemas
├── utils/         # response, jwt, logger, constants
├── routes/        # route definitions
├── app.js         # Express setup + middleware + swagger
└── server.js      # entry point
prisma/
├── schema.prisma  # database schema
└── seed.js        # seed data
```

---

## Database Migration

`prisma/schema.prisma` adalah satu-satunya source of truth. SQL di `docs/database/legacy/` hanya arsip.

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

Jangan jalankan `prisma migrate dev` / `prisma migrate reset` / `prisma db push` di production.
