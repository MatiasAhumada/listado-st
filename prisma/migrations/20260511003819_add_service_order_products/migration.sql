-- CreateTable
CREATE TABLE "public"."service_order_products" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceOrderId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productType" "public"."ProductType" NOT NULL,

    CONSTRAINT "service_order_products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."service_order_products" ADD CONSTRAINT "service_order_products_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "public"."service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
