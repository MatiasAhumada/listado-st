"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  REPAIR_EXPENSE_KIND_LABELS,
  REPAIR_FIELDS,
  REPAIR_LIMITS,
  REPAIR_TEXT,
} from "@/constants/repairOperations.constant";
import { RepairSummary } from "@/interfaces/repairOperations.interface";
import { addWorkshopRepairExpense } from "@/services/repair.service";
import { RepairExpenseKindCode } from "@/types/repairOperations.types";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { toDateTimeLocalValue, toIsoDateTime } from "@/utils/repairOperations.util";

interface RepairExpenseFormProps {
  repair: RepairSummary;
  onUpdated: (repair: RepairSummary) => void;
}

const expenseKinds: Array<Exclude<RepairExpenseKindCode, "ADJUSTMENT">> = [
  "PART",
  "SUPPLY",
  "OUTSOURCED_SERVICE",
  "OTHER",
];

export function RepairExpenseForm({ repair, onUpdated }: RepairExpenseFormProps) {
  const [maximumOccurredAt, setMaximumOccurredAt] = useState(() => toDateTimeLocalValue());
  const [form, setForm] = useState(() => ({
    kind: "PART" as Exclude<RepairExpenseKindCode, "ADJUSTMENT">,
    amount: "",
    description: "",
    supplier: "",
    occurredAt: maximumOccurredAt,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedRepair = await addWorkshopRepairExpense(repair.id, {
        kind: form.kind,
        amount: form.amount,
        description: form.description,
        supplier: form.supplier.trim() || null,
        occurredAt: toIsoDateTime(form.occurredAt),
      });
      onUpdated(updatedRepair);
      const nextOccurredAt = toDateTimeLocalValue();
      setMaximumOccurredAt(nextOccurredAt);
      setForm({
        kind: "PART",
        amount: "",
        description: "",
        supplier: "",
        occurredAt: nextOccurredAt,
      });
      clientSuccessHandler(REPAIR_TEXT.expenseCreated);
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
          <FieldLabel htmlFor={REPAIR_FIELDS.expenseKind}>{REPAIR_TEXT.expenseKindLabel}</FieldLabel>
          <NativeSelect
            id={REPAIR_FIELDS.expenseKind}
            className="w-full"
            value={form.kind}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                kind: event.target.value as Exclude<RepairExpenseKindCode, "ADJUSTMENT">,
              }))
            }
          >
            {expenseKinds.map((kind) => (
              <NativeSelectOption key={kind} value={kind}>
                {REPAIR_EXPENSE_KIND_LABELS[kind]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.expenseAmount}>{REPAIR_TEXT.amountLabel}</FieldLabel>
          <Input
            id={REPAIR_FIELDS.expenseAmount}
            type="number"
            min={REPAIR_LIMITS.moneyInputStep}
            step={REPAIR_LIMITS.moneyInputStep}
            value={form.amount}
            required
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, amount: event.target.value }))}
          />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor={REPAIR_FIELDS.expenseDescription}>{REPAIR_TEXT.expenseDescriptionLabel}</FieldLabel>
          <Input
            id={REPAIR_FIELDS.expenseDescription}
            value={form.description}
            maxLength={REPAIR_LIMITS.maximumExpenseDescriptionLength}
            required
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, description: event.target.value }))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.expenseSupplier}>{REPAIR_TEXT.supplierLabel}</FieldLabel>
          <Input
            id={REPAIR_FIELDS.expenseSupplier}
            value={form.supplier}
            maxLength={REPAIR_LIMITS.maximumSupplierLength}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, supplier: event.target.value }))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.expenseOccurredAt}>{REPAIR_TEXT.occurredAtLabel}</FieldLabel>
          <Input
            id={REPAIR_FIELDS.expenseOccurredAt}
            type="datetime-local"
            value={form.occurredAt}
            max={maximumOccurredAt}
            required
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, occurredAt: event.target.value }))}
          />
        </Field>
        <Button type="submit" className="md:col-span-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Receipt data-icon="inline-start" />
          )}
          {isSubmitting ? REPAIR_TEXT.addingExpenseAction : REPAIR_TEXT.addExpenseAction}
        </Button>
      </FieldGroup>
    </form>
  );
}
