-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPRESA', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('MODULO', 'BATERIA', 'PIN', 'VARIOS');

-- CreateEnum
CREATE TYPE "ProductQuality" AS ENUM ('INCELL', 'OLED', 'ORIGINAL', 'SERVICEPACK', 'REMANOFACTURADO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VENDEDOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "quality" "ProductQuality",
    "available" BOOLEAN NOT NULL DEFAULT true,
    "cost" DOUBLE PRECISION NOT NULL,
    "cash" DOUBLE PRECISION NOT NULL,
    "credit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
