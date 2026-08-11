import assert from "node:assert/strict";
import test from "node:test";
import { accessLoginSchema } from "@/server/validation/access.validation";

test("normaliza el usuario del acceso unificado", () => {
  const payload = accessLoginSchema.parse({
    username: "  Taller.Centro  ",
    password: "segura-1234",
  });

  assert.equal(payload.username, "taller.centro");
});

test("rechaza un correo como nombre de usuario", () => {
  const result = accessLoginSchema.safeParse({
    username: "taller@example.com",
    password: "segura-1234",
  });

  assert.equal(result.success, false);
});
