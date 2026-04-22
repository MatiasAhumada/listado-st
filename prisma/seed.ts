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
