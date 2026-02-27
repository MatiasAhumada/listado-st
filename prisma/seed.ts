import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  // Create EMPRESA (Admin)
  const empresaAdmin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: await hashPassword("admin123"),
      role: Role.EMPRESA,
    },
  });
  console.log(`Created admin user: ${empresaAdmin.username}`);

  // Create VENDEDOR (Seller)
  const vendedor = await prisma.user.upsert({
    where: { username: "vendedor" },
    update: {},
    create: {
      username: "vendedor",
      password: await hashPassword("vendedor123"),
      role: Role.VENDEDOR,
    },
  });
  console.log(`Created seller user: ${vendedor.username}`);

  // Create some initial products for the EMPRESA
  console.log("Creating initial products...");
  
  await prisma.producto.create({
    data: {
      name: "Módulo iPhone 11",
      type: "MODULO",
      quality: "INCELL",
      available: true,
      cost: 20.5,
      cash: 35.0,
      credit: 40.0,
      companyId: empresaAdmin.id,
    },
  });

  await prisma.producto.create({
    data: {
      name: "Batería Samsung S20",
      type: "BATERIA",
      quality: "ORIGINAL",
      available: true,
      cost: 15.0,
      cash: 25.0,
      credit: 30.0,
      companyId: empresaAdmin.id,
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
