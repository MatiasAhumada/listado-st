"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  SAAS_PLAN_BILLING_LABELS,
  SAAS_PLAN_BILLING_PERIODS,
  SAAS_PLAN_DEFAULTS,
  SAAS_PLAN_FIELDS,
  SAAS_PLAN_LIMITS,
  SAAS_PLAN_TEXT,
} from "@/constants/saasPlan.constant";
import { SaasPlanSummary } from "@/interfaces/saasPlan.interface";
import { createSaasPlan, updateSaasPlan } from "@/services/platformAdmin.service";
import { BillingPeriodCode } from "@/types/platformAdmin.types";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";

interface SaasPlanFormProps {
  plan?: SaasPlanSummary;
  onSaved: (plan: SaasPlanSummary) => void;
  onCancel?: () => void;
}

export function SaasPlanForm({ plan, onSaved, onCancel }: SaasPlanFormProps) {
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? SAAS_PLAN_DEFAULTS.emptyDescription);
  const [billingPrice, setBillingPrice] = useState(plan?.billingPrice ?? SAAS_PLAN_DEFAULTS.emptyPrice);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriodCode>(
    plan?.billingPeriod ?? SAAS_PLAN_DEFAULTS.billingPeriod
  );
  const [isActive, setIsActive] = useState(plan?.isActive ?? SAAS_PLAN_DEFAULTS.isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description: description.trim() || null,
        billingPrice,
        billingPeriod,
        isActive,
      };
      const savedPlan = plan ? await updateSaasPlan(plan.id, payload) : await createSaasPlan(payload);
      onSaved(savedPlan);
      if (!plan) {
        setName("");
        setDescription(SAAS_PLAN_DEFAULTS.emptyDescription);
        setBillingPrice(SAAS_PLAN_DEFAULTS.emptyPrice);
        setBillingPeriod(SAAS_PLAN_DEFAULTS.billingPeriod);
        setIsActive(SAAS_PLAN_DEFAULTS.isActive);
      }
      clientSuccessHandler(plan ? SAAS_PLAN_TEXT.updatedSuccess : SAAS_PLAN_TEXT.createdSuccess);
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
          <FieldLabel htmlFor={SAAS_PLAN_FIELDS.name}>{SAAS_PLAN_TEXT.nameLabel}</FieldLabel>
          <Input
            id={SAAS_PLAN_FIELDS.name}
            value={name}
            maxLength={SAAS_PLAN_LIMITS.maximumNameLength}
            required
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={SAAS_PLAN_FIELDS.description}>{SAAS_PLAN_TEXT.descriptionLabel}</FieldLabel>
          <Input
            id={SAAS_PLAN_FIELDS.description}
            value={description}
            maxLength={SAAS_PLAN_LIMITS.maximumDescriptionLength}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={SAAS_PLAN_FIELDS.billingPrice}>
            {SAAS_PLAN_TEXT.priceLabel} ({SAAS_PLAN_DEFAULTS.currency})
          </FieldLabel>
          <MoneyInput
            id={SAAS_PLAN_FIELDS.billingPrice}
            value={billingPrice}
            required
            onValueChange={setBillingPrice}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={SAAS_PLAN_FIELDS.billingPeriod}>{SAAS_PLAN_TEXT.periodLabel}</FieldLabel>
          <NativeSelect
            id={SAAS_PLAN_FIELDS.billingPeriod}
            className="w-full"
            value={billingPeriod}
            onChange={(event) => setBillingPeriod(event.target.value as BillingPeriodCode)}
          >
            {SAAS_PLAN_BILLING_PERIODS.map((period) => (
              <NativeSelectOption key={period} value={period}>
                {SAAS_PLAN_BILLING_LABELS[period]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id={SAAS_PLAN_FIELDS.isActive}
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked === true)}
          />
          <FieldContent>
            <FieldLabel htmlFor={SAAS_PLAN_FIELDS.isActive}>{SAAS_PLAN_TEXT.activeLabel}</FieldLabel>
            <FieldDescription>{SAAS_PLAN_TEXT.activeDescription}</FieldDescription>
          </FieldContent>
        </Field>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {isSubmitting
              ? SAAS_PLAN_TEXT.savingAction
              : plan
                ? SAAS_PLAN_TEXT.updateAction
                : SAAS_PLAN_TEXT.createAction}
          </Button>
          {plan && onCancel ? (
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
              {SAAS_PLAN_TEXT.cancelEditAction}
            </Button>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
