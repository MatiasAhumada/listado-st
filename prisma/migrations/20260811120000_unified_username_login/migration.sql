ALTER TABLE "platform_admins" RENAME COLUMN "email" TO "username";
ALTER TABLE "technician_users" RENAME COLUMN "email" TO "username";

ALTER TABLE "platform_admins" ALTER COLUMN "username" TYPE VARCHAR(40);
ALTER TABLE "technician_users" ALTER COLUMN "username" TYPE VARCHAR(40);

ALTER INDEX "platform_admins_email_key" RENAME TO "platform_admins_username_key";
ALTER INDEX "technician_users_email_key" RENAME TO "technician_users_username_key";
