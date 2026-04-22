import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Vinculando vendedor con empresa que tiene productos...");

  const vendedor = await prisma.user.findUnique({
    where: { username: "vendedor" },
  });

  if (!vendedor) {
    console.error("Vendedor no encontrado");
    return;
  }

  const productoConEmpresa = await prisma.producto.findFirst({
    where: {
      companyId: {
        not: null,
      },
    },
    select: {
      companyId: true,
    },
  });

  if (!productoConEmpresa?.companyId) {
    console.log("No hay productos con empresa asignada");
    return;
  }

  await prisma.user.update({
    where: { id: vendedor.id },
    data: {
      companyId: productoConEmpresa.companyId,
    },
  });

  console.log(`✅ Vendedor vinculado con empresa ${productoConEmpresa.companyId}`);
  
  const productosCount = await prisma.producto.count({
    where: { companyId: productoConEmpresa.companyId },
  });
  
  console.log(`El vendedor ahora puede ver ${productosCount} productos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
