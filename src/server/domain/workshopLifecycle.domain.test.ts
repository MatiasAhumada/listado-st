import assert from "node:assert/strict";
import test from "node:test";
import {
  PLATFORM_ADMIN_LIFECYCLE,
  PLATFORM_ADMIN_SECURITY,
} from "@/constants/platformAdmin.constant";
import { PLATFORM_ADMIN_TEST_TEXT } from "@/constants/platformAdminTest.constant";
import { buildWorkshopLifecycleUpdate } from "@/server/domain/workshopLifecycle.domain";
import { createWorkshopSchema } from "@/server/validation/platformAdmin.validation";

test(PLATFORM_ADMIN_TEST_TEXT.activation, () => {
  assert.deepEqual(buildWorkshopLifecycleUpdate("ACTIVE"), PLATFORM_ADMIN_LIFECYCLE.active);
});

test(PLATFORM_ADMIN_TEST_TEXT.suspension, () => {
  assert.deepEqual(buildWorkshopLifecycleUpdate("SUSPENDED"), PLATFORM_ADMIN_LIFECYCLE.suspended);
});

test(PLATFORM_ADMIN_TEST_TEXT.validCreation, () => {
  const result = createWorkshopSchema.safeParse({
    workshopName: "Taller Matías",
    ownerName: "Matías",
    ownerEmail: "matias@example.com",
    ownerPassword: "password-segura",
    subscriptionStatus: "TRIAL",
  });
  assert.equal(result.success, true);
});

test(PLATFORM_ADMIN_TEST_TEXT.invalidPassword, () => {
  const result = createWorkshopSchema.safeParse({
    workshopName: "Taller Matías",
    ownerName: "Matías",
    ownerEmail: "matias@example.com",
    ownerPassword: "short",
    subscriptionStatus: "TRIAL",
  });
  assert.equal(result.success, false);
  assert.ok(PLATFORM_ADMIN_SECURITY.minimumPasswordLength > 0);
});
