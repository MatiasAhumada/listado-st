import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.serviceOrder.findMany({
    select: { id: true, status: true, createdAt: true },
  });

  if (!orders.length) {
    console.log("No hay órdenes de servicio.");
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const order of orders) {
    const existing = await prisma.serviceOrderStatusHistory.findFirst({
      where: { serviceOrderId: order.id },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.serviceOrderStatusHistory.create({
      data: {
        serviceOrderId: order.id,
        status: order.status,
        occurredAt: order.createdAt,
      },
    });

    created++;
  }

  console.log(`=== Seed status history ===`);
  console.log(`Órdenes totales: ${orders.length}`);
  console.log(`Registros creados: ${created}`);
  console.log(`Ya tenían historial (skipped): ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
