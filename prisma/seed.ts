import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PLATFORM_ADMIN_SECURITY } from "../src/constants/platformAdmin.constant";
import { PLATFORM_SEED_ADMIN, PLATFORM_SEED_TEXT } from "../src/constants/platformSeed.constant";
import { generatePlatformSeedPassword } from "../src/utils/platformSeed.util";
import { isPlatformSeedPasswordRotationRequested } from "../src/utils/platformSeed.util";

const prisma = new PrismaClient();

async function seedPlatformAdmin() {
  console.log(PLATFORM_SEED_TEXT.start);
  const conflictingTechnician = await prisma.technicianUser.findUnique({
    where: { username: PLATFORM_SEED_ADMIN.username },
    select: { id: true },
  });
  if (conflictingTechnician) {
    throw new Error(PLATFORM_SEED_TEXT.usernameConflict);
  }

  const existingAdmin = await prisma.platformAdmin.findUnique({
    where: { username: PLATFORM_SEED_ADMIN.username },
    select: { username: true },
  });
  const shouldRotatePassword = isPlatformSeedPasswordRotationRequested(process.argv.slice(2));
  if (existingAdmin && !shouldRotatePassword) {
    console.log(PLATFORM_SEED_TEXT.existingTitle);
    console.log(`${PLATFORM_SEED_TEXT.usernameLabel}: ${existingAdmin.username}`);
    console.log(PLATFORM_SEED_TEXT.existingNotice);
    return;
  }

  const password = generatePlatformSeedPassword();
  const passwordHash = await bcrypt.hash(password, PLATFORM_ADMIN_SECURITY.passwordSaltRounds);
  const admin = await prisma.$transaction(async (transaction) => {
    const seededAdmin = await transaction.platformAdmin.upsert({
      where: { username: PLATFORM_SEED_ADMIN.username },
      update: {
        displayName: PLATFORM_SEED_ADMIN.displayName,
        passwordHash,
        isActive: true,
      },
      create: {
        username: PLATFORM_SEED_ADMIN.username,
        displayName: PLATFORM_SEED_ADMIN.displayName,
        passwordHash,
      },
    });
    await transaction.platformAdminSession.updateMany({
      where: { adminId: seededAdmin.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return seededAdmin;
  });
  console.log(existingAdmin ? PLATFORM_SEED_TEXT.rotatedTitle : PLATFORM_SEED_TEXT.title);
  console.log(`${PLATFORM_SEED_TEXT.usernameLabel}: ${admin.username}`);
  console.log(`${PLATFORM_SEED_TEXT.passwordLabel}: ${password}`);
  console.log(PLATFORM_SEED_TEXT.passwordNotice);
}

seedPlatformAdmin()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
