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
  assert.deepEqual(
    buildWorkshopLifecycleUpdate("ACTIVE", "SUSPENDED", "ACTIVE"),
    { ...PLATFORM_ADMIN_LIFECYCLE.active, subscriptionStatus: "ACTIVE", resumeStatus: null }
  );
});

test(PLATFORM_ADMIN_TEST_TEXT.suspension, () => {
  assert.deepEqual(
    buildWorkshopLifecycleUpdate("SUSPENDED", "ACTIVE", null),
    { ...PLATFORM_ADMIN_LIFECYCLE.suspended, resumeStatus: "ACTIVE" }
  );
});

test(PLATFORM_ADMIN_TEST_TEXT.trialReactivation, () => {
  assert.deepEqual(
    buildWorkshopLifecycleUpdate("ACTIVE", "SUSPENDED", "TRIAL"),
    { ...PLATFORM_ADMIN_LIFECYCLE.active, subscriptionStatus: "TRIAL", resumeStatus: null }
  );
});

test(PLATFORM_ADMIN_TEST_TEXT.validCreation, () => {
  const result = createWorkshopSchema.safeParse({
    workshopName: "Taller Matías",
    ownerName: "Matías",
    ownerUsername: "matias",
    ownerPassword: "password-segura",
    planId: "plan-a",
    agreedPrice: "11000.00",
    subscriptionStatus: "TRIAL",
  });
  assert.equal(result.success, true);
});

test(PLATFORM_ADMIN_TEST_TEXT.invalidPassword, () => {
  const result = createWorkshopSchema.safeParse({
    workshopName: "Taller Matías",
    ownerName: "Matías",
    ownerUsername: "matias",
    ownerPassword: "short",
    planId: "plan-a",
    agreedPrice: "11000.00",
    subscriptionStatus: "TRIAL",
  });
  assert.equal(result.success, false);
  assert.ok(PLATFORM_ADMIN_SECURITY.minimumPasswordLength > 0);
});

test(PLATFORM_ADMIN_TEST_TEXT.agreedPriceRequired, () => {
  const result = createWorkshopSchema.safeParse({
    workshopName: "Taller Matías",
    ownerName: "Matías",
    ownerUsername: "matias",
    ownerPassword: "password-segura",
    planId: "plan-a",
    subscriptionStatus: "TRIAL",
  });
  assert.equal(result.success, false);
});
