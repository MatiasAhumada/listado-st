"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { PasswordInput } from "@/components/ui/password-input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  PLATFORM_ADMIN_DEFAULTS,
  PLATFORM_ADMIN_FIELDS,
  PLATFORM_ADMIN_LIFECYCLE,
  PLATFORM_ADMIN_SECURITY,
  PLATFORM_ADMIN_TEXT,
} from "@/constants/platformAdmin.constant";
import { SAAS_PLAN_BILLING_LABELS, SAAS_PLAN_TEXT } from "@/constants/saasPlan.constant";
import { CreatedWorkshopCredentials, WorkshopSummary } from "@/interfaces/platformAdmin.interface";
import { SaasPlanSummary } from "@/interfaces/saasPlan.interface";
import { InitialSubscriptionStatusCode } from "@/types/platformAdmin.types";
import { createPlatformWorkshop } from "@/services/platformAdmin.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { formatSaasPlanPrice } from "@/utils/saasPlan.util";

interface CreateWorkshopFormProps {
  plans: SaasPlanSummary[];
  onCreated: (workshop: WorkshopSummary, credentials: CreatedWorkshopCredentials) => void;
}

interface WorkshopFormState {
  workshopName: string;
  ownerName: string;
  ownerUsername: string;
  ownerPassword: string;
  planId: string;
  agreedPrice: string;
  subscriptionStatus: InitialSubscriptionStatusCode;
}

const createInitialFormState = (plan?: SaasPlanSummary): WorkshopFormState => ({
  workshopName: "",
  ownerName: "",
  ownerUsername: "",
  ownerPassword: "",
  planId: plan?.id ?? "",
  agreedPrice: plan?.billingPrice ?? "",
  subscriptionStatus: PLATFORM_ADMIN_DEFAULTS.initialSubscriptionStatus,
});

export function CreateWorkshopForm({ plans, onCreated }: CreateWorkshopFormProps) {
  const activePlans = plans.filter((plan) => plan.isActive);
  const [form, setForm] = useState(() => createInitialFormState(activePlans[0]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPlanId = activePlans.some((plan) => plan.id === form.planId) ? form.planId : (activePlans[0]?.id ?? "");

  const resetForm = () => {
    setForm(createInitialFormState(activePlans[0]));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const workshop = await createPlatformWorkshop({
        workshopName: form.workshopName,
        ownerName: form.ownerName,
        ownerUsername: form.ownerUsername,
        ownerPassword: form.ownerPassword,
        planId: selectedPlanId,
        agreedPrice: form.agreedPrice,
        subscriptionStatus: form.subscriptionStatus,
      });
      onCreated(workshop, {
        workshopName: form.workshopName,
        ownerUsername: form.ownerUsername,
        ownerPassword: form.ownerPassword,
      });
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
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.workshopName}>{PLATFORM_ADMIN_TEXT.workshopNameLabel}</FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.workshopName}
            value={form.workshopName}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumNameLength}
            required
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                workshopName: event.target.value,
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.ownerName}>{PLATFORM_ADMIN_TEXT.ownerNameLabel}</FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.ownerName}
            value={form.ownerName}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumNameLength}
            required
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, ownerName: event.target.value }))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.ownerUsername}>
            {PLATFORM_ADMIN_TEXT.ownerUsernameLabel}
          </FieldLabel>
          <Input
            id={PLATFORM_ADMIN_FIELDS.ownerUsername}
            autoComplete="off"
            value={form.ownerUsername}
            minLength={PLATFORM_ADMIN_SECURITY.minimumUsernameLength}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumUsernameLength}
            required
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, ownerUsername: event.target.value }))}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.ownerPassword}>
            {PLATFORM_ADMIN_TEXT.ownerPasswordLabel}
          </FieldLabel>
          <PasswordInput
            id={PLATFORM_ADMIN_FIELDS.ownerPassword}
            autoComplete="new-password"
            value={form.ownerPassword}
            minLength={PLATFORM_ADMIN_SECURITY.minimumPasswordLength}
            maxLength={PLATFORM_ADMIN_SECURITY.maximumPasswordLength}
            required
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                ownerPassword: event.target.value,
              }))
            }
          />
          <FieldDescription>{PLATFORM_ADMIN_TEXT.passwordTooShort}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.planId}>{PLATFORM_ADMIN_TEXT.planLabel}</FieldLabel>
          <NativeSelect
            id={PLATFORM_ADMIN_FIELDS.planId}
            className="w-full"
            value={selectedPlanId}
            required
            disabled={!activePlans.length}
            onChange={(event) => {
              const plan = activePlans.find((item) => item.id === event.target.value);
              setForm((currentForm) => ({
                ...currentForm,
                planId: event.target.value,
                agreedPrice: plan?.billingPrice ?? currentForm.agreedPrice,
              }));
            }}
          >
            {activePlans.map((plan) => (
              <NativeSelectOption key={plan.id} value={plan.id}>
                {plan.name} · {formatSaasPlanPrice(plan.billingPrice, plan.currency)} ·{" "}
                {SAAS_PLAN_BILLING_LABELS[plan.billingPeriod].toLowerCase()}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        {!activePlans.length ? (
          <Alert>
            <AlertTitle>{SAAS_PLAN_TEXT.planRequired}</AlertTitle>
            <AlertDescription>{SAAS_PLAN_TEXT.noActivePlans}</AlertDescription>
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.agreedPrice}>{PLATFORM_ADMIN_TEXT.agreedPriceLabel}</FieldLabel>
          <MoneyInput
            id={PLATFORM_ADMIN_FIELDS.agreedPrice}
            value={form.agreedPrice}
            required
            onValueChange={(value) => setForm((currentForm) => ({ ...currentForm, agreedPrice: value }))}
          />
          <FieldDescription>{PLATFORM_ADMIN_TEXT.agreedPriceDescription}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={PLATFORM_ADMIN_FIELDS.subscriptionStatus}>
            {PLATFORM_ADMIN_TEXT.subscriptionStatusLabel}
          </FieldLabel>
          <NativeSelect
            id={PLATFORM_ADMIN_FIELDS.subscriptionStatus}
            className="w-full"
            value={form.subscriptionStatus}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                subscriptionStatus: event.target.value as InitialSubscriptionStatusCode,
              }))
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
        <Button type="submit" size="lg" disabled={isSubmitting || !activePlans.length}>
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
