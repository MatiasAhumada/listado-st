import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const allItems = await prisma.serviceOrderItem.findMany({
    select: {
      id: true,
      serviceName: true,
      unitCostCompany: true,
      cashPrice: true,
      creditPrice: true,
      serviceOrder: { select: { companyId: true } },
    },
  });

  const affected = allItems.filter(
    (item) => item.unitCostCompany === 0 || item.cashPrice === item.creditPrice,
  );

  if (!affected.length) {
    console.log("No hay items que corregir.");
    return;
  }

  console.log(`Items a revisar: ${affected.length}`);

  let corrected = 0;
  let unresolved = 0;
  const unresolvedNames: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const item of affected) {
      const companyId = item.serviceOrder.companyId;

      const servicio = await tx.servicio.findFirst({
        where: {
          companyId,
          name: { equals: item.serviceName, mode: "insensitive" },
        },
        select: { cost: true, cash: true, credit: true },
      });

      if (!servicio) {
        unresolved++;
        unresolvedNames.push(`"${item.serviceName}" (company: ${companyId})`);
        continue;
      }

      await tx.serviceOrderItem.update({
        where: { id: item.id },
        data: {
          unitCostCompany: servicio.cost,
          totalCostCompany: servicio.cost,
          cashPrice: servicio.cash,
          creditPrice: servicio.credit,
        },
      });

      corrected++;
    }
  });

  console.log(`\n=== Resultado ===`);
  console.log(`Corregidos: ${corrected}`);
  console.log(`Sin match: ${unresolved}`);
  if (unresolvedNames.length) {
    console.log(`Items sin match:`);
    unresolvedNames.forEach((name) => console.log(`  - ${name}`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
