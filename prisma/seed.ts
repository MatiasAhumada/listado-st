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

  // Create VENDEDOR (Seller) associated with EMPRESA
  const vendedor = await prisma.user.upsert({
    where: { username: "vendedor" },
    update: { companyId: empresaAdmin.id },
    create: {
      username: "vendedor",
      password: await hashPassword("vendedor123"),
      role: Role.VENDEDOR,
      companyId: empresaAdmin.id,
    },
  });
  console.log(`Created seller user: ${vendedor.username} (associated with ${empresaAdmin.username})`);

  // Create TECNICO (Technician)
  const tecnico = await prisma.user.upsert({
    where: { username: "tecnico" },
    update: {},
    create: {
      username: "tecnico",
      password: await hashPassword("tecnico123"),
      role: Role.TECNICO,
    },
  });
  console.log(`Created technician user: ${tecnico.username}`);

  // Create some initial products for the EMPRESA
  console.log("Creating initial products...");

  await prisma.producto.create({
    data: {
      name: "Módulo iPhone 11",
      type: "MODULO",
      quality: "INCELL",
      available: true,
      costTech: 10.0,
      costTechMargin: 100,
      cost: 20.0,
      costMargin: 75,
      cash: 35.0,
      cashMargin: 14.29,
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
      costTech: 8.0,
      costTechMargin: 87.5,
      cost: 15.0,
      costMargin: 66.67,
      cash: 25.0,
      cashMargin: 20,
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
