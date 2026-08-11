import assert from "node:assert/strict";
import test from "node:test";
import { formatMoneyInputValue, parseMoneyInputValue } from "@/utils/moneyInput.util";

test("agrupa los miles mientras se escribe un importe", () => {
  assert.equal(formatMoneyInputValue("1000"), "1.000");
  assert.equal(formatMoneyInputValue("1250000.50"), "1.250.000,50");
});

test("convierte el importe visible al valor decimal de la API", () => {
  assert.equal(parseMoneyInputValue("1.250.000,50"), "1250000.50");
  assert.equal(parseMoneyInputValue("1000"), "1000");
  assert.equal(parseMoneyInputValue("1.00"), "100");
});
