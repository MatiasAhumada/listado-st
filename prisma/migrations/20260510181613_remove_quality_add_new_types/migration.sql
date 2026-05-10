/*
  Warnings:

  - You are about to drop the column `quality` on the `productos` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ProductType" ADD VALUE 'CONSOLA';
ALTER TYPE "public"."ProductType" ADD VALUE 'MANTENIMIENTO';
ALTER TYPE "public"."ProductType" ADD VALUE 'VIDRIOS_CAMARA';

-- AlterTable
ALTER TABLE "public"."productos" DROP COLUMN "quality";

-- DropEnum
DROP TYPE "public"."ProductQuality";
