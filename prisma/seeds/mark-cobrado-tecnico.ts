import { PrismaClient, ServiceOrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

const SKIP_STATUSES: ServiceOrderStatus[] = [
  ServiceOrderStatus.DEVUELTO_POR_TECNICO,
  ServiceOrderStatus.RETIRADO_POR_TECNICO,
];

async function main() {
  const orders = await prisma.serviceOrder.findMany({
    select: { id: true, status: true },
  });

  let updated = 0;
  let skippedStatus = 0;
  let alreadyCobrado = 0;

  for (const order of orders) {
    if (order.status === ServiceOrderStatus.COBRADO_TECNICO) {
      alreadyCobrado++;
      continue;
    }

    if (SKIP_STATUSES.includes(order.status)) {
      skippedStatus++;
      continue;
    }

    await prisma.$transaction([
      prisma.serviceOrder.update({
        where: { id: order.id },
        data: {
          status: ServiceOrderStatus.COBRADO_TECNICO,
          techPaidAt: new Date(),
        },
      }),
      prisma.serviceOrderStatusHistory.create({
        data: {
          serviceOrderId: order.id,
          status: ServiceOrderStatus.COBRADO_TECNICO,
          occurredAt: new Date(),
        },
      }),
    ]);

    updated++;
  }

  console.log(`=== mark-cobrado-tecnico ===`);
  console.log(`Órdenes totales:          ${orders.length}`);
  console.log(`Marcadas COBRADO_TECNICO: ${updated}`);
  console.log(`Ya estaban COBRADO_TECNICO (skipped): ${alreadyCobrado}`);
  console.log(`Conservadas (DEVUELTO/RETIRADO):      ${skippedStatus}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
