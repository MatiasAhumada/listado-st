import {
  PLATFORM_ADMIN_DATE_FORMAT,
  PLATFORM_ADMIN_TEXT,
} from "@/constants/platformAdmin.constant";
import { CreatedWorkshopCredentials } from "@/interfaces/platformAdmin.interface";

export function formatPlatformAdminDate(value: string): string {
  return new Intl.DateTimeFormat(
    PLATFORM_ADMIN_DATE_FORMAT.locale,
    PLATFORM_ADMIN_DATE_FORMAT.options
  ).format(new Date(value));
}

export function buildTechnicianCredentialsMessage(credentials: CreatedWorkshopCredentials): string {
  return [
    `${PLATFORM_ADMIN_TEXT.credentialsWorkshopPrefix} ${credentials.workshopName}`,
    `${PLATFORM_ADMIN_TEXT.credentialsEmailPrefix} ${credentials.ownerEmail}`,
    `${PLATFORM_ADMIN_TEXT.credentialsPasswordPrefix} ${credentials.ownerPassword}`,
  ].join("\n");
}
