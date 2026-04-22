import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creando productos de ejemplo para empresa admin...");

  const admin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!admin) {
    console.error("Usuario admin no encontrado");
    return;
  }

  await prisma.producto.createMany({
    data: [
      {
        name: "Módulo iPhone 12",
        type: "MODULO",
        quality: "OLED",
        available: true,
        costTech: 0,
        costTechMargin: 0,
        cost: 25.0,
        costMargin: 0,
        cash: 40.0,
        cashMargin: 60,
        credit: 50.0,
        creditMargin: 25,
        companyId: admin.id,
      },
      {
        name: "Batería iPhone 11",
        type: "BATERIA",
        quality: "ORIGINAL",
        available: true,
        costTech: 0,
        costTechMargin: 0,
        cost: 18.0,
        costMargin: 0,
        cash: 28.0,
        cashMargin: 55.56,
        credit: 35.0,
        creditMargin: 25,
        companyId: admin.id,
      },
    ],
  });

  console.log("✅ Productos de ejemplo creados para empresa admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
