-- CreateTable
CREATE TABLE "LaundryProfile" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "info" TEXT,
    "operationalDays" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "openTime" TEXT,
    "closeTime" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "links" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryProfile_pkey" PRIMARY KEY ("id")
);
