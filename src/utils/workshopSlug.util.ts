import { randomBytes } from "crypto";
import { PLATFORM_ADMIN_SECURITY } from "@/constants/platformAdmin.constant";

export function createWorkshopSlug(workshopName: string): string {
  const normalizedName = workshopName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = randomBytes(PLATFORM_ADMIN_SECURITY.slugRandomBytes).toString(
    PLATFORM_ADMIN_SECURITY.sessionTokenEncoding
  );

  return `${normalizedName}-${suffix}`;
}
