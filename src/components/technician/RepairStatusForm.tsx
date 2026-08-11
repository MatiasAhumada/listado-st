"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { REPAIR_FIELDS, REPAIR_LIMITS, REPAIR_STATUS_LABELS, REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { RepairSummary } from "@/interfaces/repairOperations.interface";
import { changeWorkshopRepairStatus } from "@/services/repair.service";
import { RepairStatusCode } from "@/types/repairOperations.types";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";

interface RepairStatusFormProps {
  repair: RepairSummary;
  onUpdated: (repair: RepairSummary) => void;
}

export function RepairStatusForm({ repair, onUpdated }: RepairStatusFormProps) {
  const [status, setStatus] = useState<RepairStatusCode>(repair.allowedNextStatuses[0] ?? repair.status);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedRepair = await changeWorkshopRepairStatus(repair.id, {
        status,
        note: note.trim() || null,
      });
      onUpdated(updatedRepair);
      setNote("");
      clientSuccessHandler(REPAIR_TEXT.statusChanged);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!repair.allowedNextStatuses.length) return null;

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.nextStatus}>{REPAIR_TEXT.nextStatusLabel}</FieldLabel>
          <NativeSelect
            id={REPAIR_FIELDS.nextStatus}
            className="w-full"
            value={status}
            onChange={(event) => setStatus(event.target.value as RepairStatusCode)}
          >
            {repair.allowedNextStatuses.map((nextStatus) => (
              <NativeSelectOption key={nextStatus} value={nextStatus}>
                {REPAIR_STATUS_LABELS[nextStatus]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={REPAIR_FIELDS.statusNote}>{REPAIR_TEXT.statusNoteLabel}</FieldLabel>
          <Textarea
            id={REPAIR_FIELDS.statusNote}
            value={note}
            maxLength={REPAIR_LIMITS.maximumStatusNoteLength}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Workflow data-icon="inline-start" />
          )}
          {isSubmitting ? REPAIR_TEXT.changingStatusAction : REPAIR_TEXT.changeStatusAction}
        </Button>
      </FieldGroup>
    </form>
  );
}
