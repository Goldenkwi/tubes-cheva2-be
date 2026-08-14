-- AlterTable
ALTER TABLE "User" ADD COLUMN "photoUrl" TEXT;

-- CreateTable
CREATE TABLE "PaymentSetting" (
    "id" SERIAL NOT NULL,
    "qrisEnabled" BOOLEAN NOT NULL DEFAULT true,
    "qrisMerchantName" TEXT,
    "qrisNmid" TEXT,
    "qrisImageUrl" TEXT,
    "cashEnabled" BOOLEAN NOT NULL DEFAULT true,
    "transferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "noRekening" TEXT NOT NULL,
    "namaPemilik" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankAccount_enabled_idx" ON "BankAccount"("enabled");
