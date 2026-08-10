"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  PLATFORM_ADMIN_DEFAULTS,
  PLATFORM_ADMIN_FIELDS,
  PLATFORM_ADMIN_LIFECYCLE,
  PLATFORM_ADMIN_SECURITY,
  PLATFORM_ADMIN_TEXT,
} from "@/constants/platformAdmin.constant";
import {
  CreatedWorkshopCredentials,
  WorkshopSummary,
} from "@/interfaces/platformAdmin.interface";
import { InitialSubscriptionStatusCode } from "@/types/platformAdmin.types";
import { createPlatformWorkshop } from "@/services/platformAdmin.service";
import {
  clientErrorHandler,
  clientSuccessHandler,
} from "@/utils/handlers/clientError.handler";

interface CreateWorkshopFormProps {
  onCreated: (workshop: WorkshopSummary, credentials: CreatedWorkshopCredentials) => void;
}

export function CreateWorkshopForm({ onCreated }: CreateWorkshopFormProps) {
  const [workshopName, setWorkshopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<InitialSubscriptionStatusCode>(PLATFORM_ADMIN_DEFAULTS.initialSubscriptionStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setWorkshopName("");
    setOwnerName("");
    setOwnerEmail("");
    setOwnerPassword("");
    setSubscriptionStatus(PLATFORM_ADMIN_DEFAULTS.initialSubscriptionStatus);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const workshop = await createPlatformWorkshop({
        workshopName,
        ownerName,
        ownerEmail,
        ownerPassword,
        subscriptionStatus,
      });
      onCreated(workshop, { workshopName, ownerEmail, ownerPassword });
      resetForm();
      clientSuccessHandler(PLATFORM_ADMIN_TEXT.workshopCreated);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.workshopName}>
            {PLATFORM_ADMIN_TEXT.workshopNameLabel}
          </FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.workshopName}
            value={workshopName}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumNameLength}
            required
            onChange={(event) => setWorkshopName(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.ownerName}>
            {PLATFORM_ADMIN_TEXT.ownerNameLabel}
          </FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.ownerName}
            value={ownerName}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumNameLength}
            required
            onChange={(event) => setOwnerName(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.ownerEmail}>
            {PLATFORM_ADMIN_TEXT.ownerEmailLabel}
          </FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.ownerEmail}
            type="email"
            autoComplete="off"
            value={ownerEmail}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumEmailLength}
            required
            onChange={(event) => setOwnerEmail(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.ownerPassword}>
            {PLATFORM_ADMIN_TEXT.ownerPasswordLabel}
          </FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.ownerPassword}
            type="password"
            autoComplete="new-password"
            value={ownerPassword}
            minLength={PLATFORM_ADMIN_SECURITY.minimumPasswordLength}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumPasswordLength}
            required
            onChange={(event) => setOwnerPassword(event.target.value)}
          />
          <FieldDescription>{PLATFORM_ADMIN_TEXT.passwordTooShort}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.subscriptionStatus}>
            {PLATFORM_ADMIN_TEXT.subscriptionStatusLabel}
          </FieldLabel>
          <NativeSelect
            id={PLATFORM_ADMIN_FIELDS.subscriptionStatus}
            className="w-full"
            value={subscriptionStatus}
            onChange={(event) =>
              setSubscriptionStatus(event.target.value as InitialSubscriptionStatusCode)
            }
          >
            <NativeSelectOption value={PLATFORM_ADMIN_DEFAULTS.initialSubscriptionStatus}>
              {PLATFORM_ADMIN_TEXT.trialOption}
            </NativeSelectOption>
            <NativeSelectOption value={PLATFORM_ADMIN_LIFECYCLE.active.subscriptionStatus}>
              {PLATFORM_ADMIN_TEXT.activeOption}
            </NativeSelectOption>
          </NativeSelect>
        </Field>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <UserRoundPlus data-icon="inline-start" />
          )}
          {isSubmitting ? PLATFORM_ADMIN_TEXT.createPending : PLATFORM_ADMIN_TEXT.createAction}
        </Button>
      </FieldGroup>
    </form>
  );
}
