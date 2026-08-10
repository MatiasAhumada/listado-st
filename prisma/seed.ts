import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  PLATFORM_ADMIN_SECURITY,
  PLATFORM_ADMIN_SEED_TEXT,
  PLATFORM_ADMIN_TEXT,
} from "../src/constants/platformAdmin.constant";

const prisma = new PrismaClient();

async function seedPlatformAdmin() {
  const email = process.env.PLATFORM_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  const displayName = process.env.PLATFORM_ADMIN_NAME?.trim();

  if (!email || !password || !displayName) {
    throw new Error(PLATFORM_ADMIN_SEED_TEXT.missingEnvironment);
  }
  if (password.length < PLATFORM_ADMIN_SECURITY.minimumPasswordLength) {
    throw new Error(PLATFORM_ADMIN_TEXT.passwordTooShort);
  }

  const passwordHash = await bcrypt.hash(password, PLATFORM_ADMIN_SECURITY.passwordSaltRounds);
  const admin = await prisma.platformAdmin.upsert({
    where: { email },
    update: { displayName, passwordHash, isActive: true },
    create: { email, displayName, passwordHash },
  });
  console.log(`${PLATFORM_ADMIN_SEED_TEXT.createdPrefix} ${admin.email}`);
}

seedPlatformAdmin()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
