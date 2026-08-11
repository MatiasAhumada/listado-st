"use client";

import { FormEvent, useState } from "react";
import { Banknote, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  REPAIR_FIELDS,
  REPAIR_LIMITS,
  REPAIR_PAYMENT_KIND_LABELS,
  REPAIR_TEXT,
} from "@/constants/repairOperations.constant";
import { RepairSummary } from "@/interfaces/repairOperations.interface";
import { addWorkshopRepairPayment } from "@/services/repair.service";
import { RepairPaymentKindCode } from "@/types/repairOperations.types";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { toDateTimeLocalValue, toIsoDateTime } from "@/utils/repairOperations.util";

interface RepairPaymentFormProps {
  repair: RepairSummary;
  onUpdated: (repair: RepairSummary) => void;
}

const paymentKinds: Array<Exclude<RepairPaymentKindCode, "ADJUSTMENT">> = ["DEPOSIT", "PARTIAL", "FINAL"];

export function RepairPaymentForm({ repair, onUpdated }: RepairPaymentFormProps) {
  const [maximumOccurredAt, setMaximumOccurredAt] = useState(() => toDateTimeLocalValue());
  const [form, setForm] = useState(() => ({
    kind: "DEPOSIT" as Exclude<RepairPaymentKindCode, "ADJUSTMENT">,
    amount: "",
    occurredAt: maximumOccurredAt,
    note: "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedRepair = await addWorkshopRepairPayment(repair.id, {
        kind: form.kind,
        amount: form.amount,
        occurredAt: toIsoDateTime(form.occurredAt),
        note: form.note.trim() || null,
      });
      onUpdated(updatedRepair);
      const nextOccurredAt = toDateTimeLocalValue();
      setMaximumOccurredAt(nextOccurredAt);
      setForm({
        kind: "PARTIAL",
        amount: "",
        occurredAt: nextOccurredAt,
        note: "",
      });
      clientSuccessHandler(REPAIR_TEXT.paymentCreated);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.paymentKind}>{REPAIR_TEXT.paymentKindLabel}</FieldLabel>
          <NativeSelect
            id={REPAIR_FIELDS.paymentKind}
            className="w-full"
            value={form.kind}
            onChange={(event) => {
              const kind = event.target.value as Exclude<RepairPaymentKindCode, "ADJUSTMENT">;
              setForm((currentForm) => ({
                ...currentForm,
                kind,
                amount: kind === "FINAL" ? repair.totals.balance : currentForm.amount,
              }));
            }}
          >
            {paymentKinds.map((kind) => (
              <NativeSelectOption key={kind} value={kind}>
                {REPAIR_PAYMENT_KIND_LABELS[kind]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.paymentAmount}>{REPAIR_TEXT.amountLabel}</FieldLabel>
          <Input
            id={REPAIR_FIELDS.paymentAmount}
            type="number"
            min={REPAIR_LIMITS.moneyInputStep}
            max={repair.totals.balance}
            step={REPAIR_LIMITS.moneyInputStep}
            value={form.amount}
            required
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, amount: event.target.value }))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.paymentOccurredAt}>{REPAIR_TEXT.occurredAtLabel}</FieldLabel>
          <Input
            id={REPAIR_FIELDS.paymentOccurredAt}
            type="datetime-local"
            value={form.occurredAt}
            max={maximumOccurredAt}
            required
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, occurredAt: event.target.value }))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.paymentNote}>{REPAIR_TEXT.financialNoteLabel}</FieldLabel>
          <Textarea
            id={REPAIR_FIELDS.paymentNote}
            value={form.note}
            maxLength={REPAIR_LIMITS.maximumFinancialNoteLength}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, note: event.target.value }))}
          />
        </Field>
        <Button type="submit" className="md:col-span-2" disabled={isSubmitting || Number(repair.totals.balance) <= 0}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Banknote data-icon="inline-start" />
          )}
          {isSubmitting ? REPAIR_TEXT.addingPaymentAction : REPAIR_TEXT.addPaymentAction}
        </Button>
      </FieldGroup>
    </form>
  );
}
