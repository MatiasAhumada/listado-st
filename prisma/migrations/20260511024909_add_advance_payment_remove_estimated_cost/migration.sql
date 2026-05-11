/*
  Warnings:

  - You are about to drop the column `estimatedCost` on the `service_orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."service_orders" DROP COLUMN "estimatedCost",
ADD COLUMN     "advancePayment" INTEGER NOT NULL DEFAULT 0;
