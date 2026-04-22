import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Generando copias de productos maestros para todas las empresas...");

  const productosMaestros = await prisma.producto.findMany({
    where: { companyId: null },
  });

  const empresas = await prisma.user.findMany({
    where: { role: "EMPRESA" },
  });

  console.log(`Productos maestros encontrados: ${productosMaestros.length}`);
  console.log(`Empresas encontradas: ${empresas.length}`);

  let copiasCreadas = 0;

  for (const empresa of empresas) {
    for (const maestro of productosMaestros) {
      const copiaExistente = await prisma.producto.findFirst({
        where: {
          masterProductId: maestro.id,
          companyId: empresa.id,
        },
      });

      if (!copiaExistente) {
        await prisma.producto.create({
          data: {
            name: maestro.name,
            type: maestro.type,
            quality: maestro.quality,
            available: maestro.available,
            costTech: maestro.costTech,
            costTechMargin: maestro.costTechMargin,
            cost: maestro.cost,
            costMargin: 0,
            cash: 0,
            cashMargin: 0,
            credit: 0,
            creditMargin: 0,
            companyId: empresa.id,
            masterProductId: maestro.id,
          },
        });
        copiasCreadas++;
      }
    }
  }

  console.log(`✅ ${copiasCreadas} copias de productos creadas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
