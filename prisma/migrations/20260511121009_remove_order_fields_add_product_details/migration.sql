/*
  Warnings:

  - You are about to drop the column `deviceIssue` on the `service_orders` table. All the data in the column will be lost.
  - You are about to drop the column `deviceModel` on the `service_orders` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `service_orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."service_order_products" ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "hasImpact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isBrokenScreen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCharging" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTurnedOn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."service_orders" DROP COLUMN "deviceIssue",
DROP COLUMN "deviceModel",
DROP COLUMN "notes";
