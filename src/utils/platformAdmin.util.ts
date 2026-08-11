import {
  PLATFORM_ADMIN_DATE_FORMAT,
  PLATFORM_ADMIN_TEXT,
} from "@/constants/platformAdmin.constant";
import { CreatedWorkshopCredentials } from "@/interfaces/platformAdmin.interface";

const platformAdminDateFormatter = new Intl.DateTimeFormat(
  PLATFORM_ADMIN_DATE_FORMAT.locale,
  PLATFORM_ADMIN_DATE_FORMAT.options
);

export function formatPlatformAdminDate(value: string): string {
  return platformAdminDateFormatter.format(new Date(value));
}

export function buildTechnicianCredentialsMessage(credentials: CreatedWorkshopCredentials): string {
  return [
    `${PLATFORM_ADMIN_TEXT.credentialsWorkshopPrefix} ${credentials.workshopName}`,
    `${PLATFORM_ADMIN_TEXT.credentialsUsernamePrefix} ${credentials.ownerUsername}`,
    `${PLATFORM_ADMIN_TEXT.credentialsPasswordPrefix} ${credentials.ownerPassword}`,
  ].join("\n");
}
