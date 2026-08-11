import assert from "node:assert/strict";
import test from "node:test";
import { PLATFORM_SEED_ADMIN } from "@/constants/platformSeed.constant";
import {
  generatePlatformSeedPassword,
  isPlatformSeedPasswordRotationRequested,
} from "@/utils/platformSeed.util";

test("genera una contraseña segura para el administrador inicial", () => {
  const password = generatePlatformSeedPassword();

  assert.ok(password.length >= PLATFORM_SEED_ADMIN.minimumGeneratedPasswordLength);
  assert.notEqual(password, generatePlatformSeedPassword());
});

test("sólo rota la contraseña cuando se solicita explícitamente", () => {
  assert.equal(isPlatformSeedPasswordRotationRequested([]), false);
  assert.equal(isPlatformSeedPasswordRotationRequested(["--rotate-password"]), true);
});
