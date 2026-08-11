import assert from "node:assert/strict";
import test from "node:test";
import { calculateOverdueHours, calculateRepairAlertDueAt, canChangeRepairStatus } from "@/server/domain/repair.domain";

test("permite avanzar una reparación sin crear estados personalizados", () => {
  assert.equal(canChangeRepairStatus("RECEIVED", "DIAGNOSING"), true);
  assert.equal(canChangeRepairStatus("DIAGNOSING", "IN_REPAIR"), true);
  assert.equal(canChangeRepairStatus("IN_REPAIR", "READY_FOR_PICKUP"), true);
  assert.equal(canChangeRepairStatus("READY_FOR_PICKUP", "DELIVERED"), true);
});

test("impide modificar un trabajo entregado o cancelado", () => {
  assert.equal(canChangeRepairStatus("DELIVERED", "IN_REPAIR"), false);
  assert.equal(canChangeRepairStatus("CANCELLED", "RECEIVED"), false);
});

test("calcula la alerta interna desde el último cambio de estado", () => {
  const changedAt = new Date("2026-08-10T10:00:00.000Z");
  const dueAt = calculateRepairAlertDueAt(changedAt, 24);
  assert.equal(dueAt.toISOString(), "2026-08-11T10:00:00.000Z");
  assert.equal(calculateOverdueHours(dueAt, new Date("2026-08-11T15:30:00.000Z")), 5);
});
