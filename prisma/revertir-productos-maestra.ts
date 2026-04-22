import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Revirtiendo productos a lista maestra...");

  const result = await prisma.producto.updateMany({
    where: {
      companyId: {
        not: null,
      },
    },
    data: {
      companyId: null,
    },
  });

  console.log(`✅ ${result.count} productos revertidos a lista maestra (companyId = null)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
