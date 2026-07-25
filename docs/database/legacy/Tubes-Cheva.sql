-- LEGACY DATABASE DESIGN ONLY.
-- The active schema is prisma/schema.prisma. Do not apply this file to the
-- application database or combine it with Prisma migrations.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- ENUM TYPES
-- =========================================
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE service_type AS ENUM ('kiloan', 'satuan', 'express');
CREATE TYPE order_status AS ENUM (
    'menunggu_kurir',
    'tiba_di_laundry',
    'sedang_dicuci',
    'sedang_disetrika',
    'siap_diambil',
    'kurir_menuju_rumah',
    'selesai',
    'dibatalkan'
);
CREATE TYPE payment_status AS ENUM ('menunggu', 'lunas', 'gagal');
CREATE TYPE payment_method AS ENUM ('qris', 'e_wallet', 'transfer_bank');
CREATE TYPE note_type AS ENUM ('kondisi', 'instruksi');
CREATE TYPE notification_type AS ENUM ('status_pesanan', 'tagihan');

-- =========================================
-- USERS  (US-01, US-02, US-11)
-- =========================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    phone           VARCHAR(20) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'customer',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);

-- =========================================
-- ADDRESSES  (MVP: "Profil & Alamat")
-- =========================================
CREATE TABLE addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line    TEXT NOT NULL,
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE UNIQUE INDEX uq_one_primary_address
    ON addresses(user_id) WHERE is_primary = TRUE;

-- =========================================
-- SERVICES  (US-03, US-15)
-- =========================================
CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    type            service_type NOT NULL,
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    unit            VARCHAR(20) NOT NULL,          -- 'kg' atau 'pcs'
    estimated_time  VARCHAR(50),
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_active ON services(is_active);

-- =========================================
-- ORDERS  (US-04, US-05, US-13)
-- =========================================
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code          VARCHAR(20) UNIQUE NOT NULL,
    customer_id         UUID NOT NULL REFERENCES users(id),
    address_id          UUID NOT NULL REFERENCES addresses(id),
    status              order_status NOT NULL DEFAULT 'menunggu_kurir',
    pickup_scheduled_at TIMESTAMPTZ,
    actual_weight_kg    NUMERIC(6,2),
    subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
    express_fee         NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price         NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status      payment_status NOT NULL DEFAULT 'menunggu',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- =========================================
-- ORDER ITEMS  (US-04)
-- =========================================
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    service_id      UUID NOT NULL REFERENCES services(id),
    quantity        NUMERIC(6,2) NOT NULL DEFAULT 1,
    unit_price      NUMERIC(12,2) NOT NULL,   -- snapshot harga saat order dibuat
    subtotal        NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_service ON order_items(service_id);

-- =========================================
-- ORDER STATUS HISTORY  (US-06, US-14)
-- =========================================
CREATE TABLE order_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status          order_status NOT NULL,
    changed_by      UUID REFERENCES users(id),
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id, changed_at);

-- =========================================
-- PAYMENTS  (US-09)
-- =========================================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method              payment_method NOT NULL,
    amount              NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status              payment_status NOT NULL DEFAULT 'menunggu',
    reference_number    VARCHAR(100),
    paid_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON payments(order_id);

-- =========================================
-- CLOTHING NOTES  (MVP: kondisi & instruksi khusus)
-- =========================================
CREATE TABLE clothing_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type            note_type NOT NULL,
    description     TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clothing_notes_order ON clothing_notes(order_id);

-- =========================================
-- NOTIFICATIONS  (US-10)
-- =========================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
    type            notification_type NOT NULL,
    title           VARCHAR(150) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
