import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Vinculando todos los productos con la empresa admin...");

  const admin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!admin) {
    console.error("Usuario admin no encontrado");
    return;
  }

  const productosConCompany = await prisma.producto.count({
    where: { companyId: { not: null } },
  });

  const productosSinCompany = await prisma.producto.count({
    where: { companyId: null },
  });

  console.log(`Productos con empresa: ${productosConCompany}`);
  console.log(`Productos sin empresa: ${productosSinCompany}`);

  const result = await prisma.producto.updateMany({
    where: {
      companyId: null,
    },
    data: {
      companyId: admin.id,
    },
  });

  console.log(`✅ ${result.count} productos vinculados con empresa admin`);

  const totalProductos = await prisma.producto.count({
    where: { companyId: admin.id },
  });

  console.log(`Total de productos de la empresa admin: ${totalProductos}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
