import assert from "node:assert/strict";
import test from "node:test";
import { QuoteStatus } from "@prisma/client";
import { calculateQuoteValidUntil, canAcceptQuoteRevision, getQuoteDisplayStatus } from "@/server/domain/quote.domain";

test("calcula la vigencia de una revisión enviada", () => {
  const sentAt = new Date("2026-08-10T12:00:00.000Z");
  assert.equal(calculateQuoteValidUntil(sentAt, 7).toISOString(), "2026-08-17T12:00:00.000Z");
});

test("marca como vencida una revisión enviada fuera de vigencia", () => {
  assert.equal(
    getQuoteDisplayStatus(QuoteStatus.SENT, new Date("2026-08-09T12:00:00.000Z"), new Date("2026-08-10T12:00:00.000Z")),
    "EXPIRED"
  );
});

test("solo acepta una revisión enviada y vigente", () => {
  const validUntil = new Date("2026-08-17T12:00:00.000Z");
  const currentDate = new Date("2026-08-10T12:00:00.000Z");
  assert.equal(canAcceptQuoteRevision(QuoteStatus.SENT, validUntil, currentDate), true);
  assert.equal(canAcceptQuoteRevision(QuoteStatus.DRAFT, validUntil, currentDate), false);
});
