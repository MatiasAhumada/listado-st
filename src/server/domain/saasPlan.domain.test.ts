import assert from "node:assert/strict";
import test from "node:test";
import { saveSaasPlanSchema } from "@/server/validation/saasPlan.validation";
import { createSaasPlanCode } from "@/utils/saasPlan.util";

test("genera un código comercial estable sin acentos", () => {
  assert.equal(createSaasPlanCode("Técnico independiente"), "TECNICO_INDEPENDIENTE");
});

test("genera un código de respaldo para un nombre sin caracteres latinos", () => {
  assert.equal(createSaasPlanCode("---"), "PLAN");
});

test("acepta un precio comercial positivo con dos decimales", () => {
  const result = saveSaasPlanSchema.safeParse({
    name: "Técnico independiente",
    description: null,
    billingPrice: "12500.50",
    billingPeriod: "MONTHLY",
    isActive: true,
  });
  assert.equal(result.success, true);
});

test("rechaza un precio comercial igual a cero", () => {
  const result = saveSaasPlanSchema.safeParse({
    name: "Técnico independiente",
    description: null,
    billingPrice: "0.00",
    billingPeriod: "MONTHLY",
    isActive: true,
  });
  assert.equal(result.success, false);
});
