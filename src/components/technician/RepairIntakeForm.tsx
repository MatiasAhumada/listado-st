"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, PackageCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { REPAIR_FIELDS, REPAIR_LIMITS, REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { RepairSummary } from "@/interfaces/repairOperations.interface";
import { QuoteSummary } from "@/interfaces/workshopOperations.interface";
import { createWorkshopRepair } from "@/services/repair.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { toDateTimeLocalValue, toIsoDateTime } from "@/utils/repairOperations.util";

interface RepairIntakeFormProps {
  quotes: QuoteSummary[];
  onCreated: (repair: RepairSummary) => void;
}

export function RepairIntakeForm({ quotes, onCreated }: RepairIntakeFormProps) {
  const acceptedQuotes = quotes.filter((quote) => quote.status === "ACCEPTED" && !quote.repairId);
  const [maximumReceivedAt, setMaximumReceivedAt] = useState(() => toDateTimeLocalValue());
  const [form, setForm] = useState(() => ({
    quoteId: acceptedQuotes[0]?.id ?? "",
    physicalReceivedAt: maximumReceivedAt,
    internalNotes: "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedQuoteId = acceptedQuotes.some((quote) => quote.id === form.quoteId)
    ? form.quoteId
    : (acceptedQuotes[0]?.id ?? "");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const repair = await createWorkshopRepair({
        quoteId: selectedQuoteId,
        physicalReceivedAt: toIsoDateTime(form.physicalReceivedAt),
        internalNotes: form.internalNotes.trim() || null,
      });
      onCreated(repair);
      const nextReceivedAt = toDateTimeLocalValue();
      setMaximumReceivedAt(nextReceivedAt);
      setForm({
        quoteId: "",
        physicalReceivedAt: nextReceivedAt,
        internalNotes: "",
      });
      clientSuccessHandler(REPAIR_TEXT.created);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!acceptedQuotes.length) {
    return (
      <Alert>
        <PackageCheck />
        <AlertTitle>{REPAIR_TEXT.noAcceptedQuotes}</AlertTitle>
        <AlertDescription>{REPAIR_TEXT.createDescription}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.acceptedQuote}>{REPAIR_TEXT.acceptedQuoteLabel}</FieldLabel>
          <NativeSelect
            id={REPAIR_FIELDS.acceptedQuote}
            className="w-full"
            value={selectedQuoteId}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, quoteId: event.target.value }))}
          >
            {acceptedQuotes.map((quote) => (
              <NativeSelectOption key={quote.id} value={quote.id}>
                #{String(quote.number).padStart(4, "0")} · {quote.customer.fullName} · {quote.device.brand}{" "}
                {quote.device.model}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.receivedAt}>{REPAIR_TEXT.receivedAtLabel}</FieldLabel>
          <Input
            id={REPAIR_FIELDS.receivedAt}
            type="datetime-local"
            value={form.physicalReceivedAt}
            max={maximumReceivedAt}
            required
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                physicalReceivedAt: event.target.value,
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.internalNotes}>{REPAIR_TEXT.internalNotesLabel}</FieldLabel>
          <Textarea
            id={REPAIR_FIELDS.internalNotes}
            value={form.internalNotes}
            maxLength={REPAIR_LIMITS.maximumNotesLength}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, internalNotes: event.target.value }))}
          />
        </Field>
        <Button type="submit" disabled={isSubmitting || !selectedQuoteId}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <PackageCheck data-icon="inline-start" />
          )}
          {isSubmitting ? REPAIR_TEXT.creatingAction : REPAIR_TEXT.createAction}
        </Button>
      </FieldGroup>
    </form>
  );
}
