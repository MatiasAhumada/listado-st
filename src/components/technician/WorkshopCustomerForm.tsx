"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Save, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  WORKSHOP_OPERATIONS_DEFAULTS,
  WORKSHOP_OPERATIONS_FIELDS,
  WORKSHOP_OPERATIONS_LIMITS,
  WORKSHOP_OPERATIONS_TEXT,
} from "@/constants/workshopOperations.constant";
import { WorkshopCustomerSummary } from "@/interfaces/workshopOperations.interface";
import { createWorkshopCustomer, updateWorkshopCustomer } from "@/services/technician.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";

interface WorkshopCustomerFormProps {
  customer?: WorkshopCustomerSummary;
  onSaved: (customer: WorkshopCustomerSummary) => void;
  onCancel?: () => void;
}

const emptyForm = {
  fullName: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
  phone: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
  email: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
  notes: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
  brand: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
  model: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
  imei: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
  color: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
  deviceNotes: WORKSHOP_OPERATIONS_DEFAULTS.emptyText,
};

export function WorkshopCustomerForm({ customer, onSaved, onCancel }: WorkshopCustomerFormProps) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    fullName: customer?.fullName ?? emptyForm.fullName,
    phone: customer?.phone ?? emptyForm.phone,
    email: customer?.email ?? emptyForm.email,
    notes: customer?.notes ?? emptyForm.notes,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const customerFields = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
      };
      const savedCustomer = customer
        ? await updateWorkshopCustomer(customer.id, customerFields)
        : await createWorkshopCustomer({
            ...customerFields,
            device: {
              brand: form.brand,
              model: form.model,
              imei: form.imei.trim() || null,
              color: form.color.trim() || null,
              notes: form.deviceNotes.trim() || null,
            },
          });
      onSaved(savedCustomer);
      if (!customer) setForm(emptyForm);
      clientSuccessHandler(
        customer ? WORKSHOP_OPERATIONS_TEXT.customerUpdated : WORKSHOP_OPERATIONS_TEXT.customerCreated
      );
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
          <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.customerName}>
            {WORKSHOP_OPERATIONS_TEXT.customerNameLabel}
          </FieldLabel>
          <Input
            id={WORKSHOP_OPERATIONS_FIELDS.customerName}
            value={form.fullName}
            maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumCustomerNameLength}
            required
            onChange={(event) => updateField("fullName", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.customerPhone}>
            {WORKSHOP_OPERATIONS_TEXT.customerPhoneLabel}
          </FieldLabel>
          <Input
            id={WORKSHOP_OPERATIONS_FIELDS.customerPhone}
            value={form.phone}
            maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumPhoneLength}
            required
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.customerEmail}>
            {WORKSHOP_OPERATIONS_TEXT.customerEmailLabel}
          </FieldLabel>
          <Input
            id={WORKSHOP_OPERATIONS_FIELDS.customerEmail}
            type="email"
            value={form.email}
            maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumEmailLength}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.customerNotes}>
            {WORKSHOP_OPERATIONS_TEXT.customerNotesLabel}
          </FieldLabel>
          <Textarea
            id={WORKSHOP_OPERATIONS_FIELDS.customerNotes}
            value={form.notes}
            maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumNotesLength}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </Field>

        {!customer ? (
          <FieldSet className="rounded-lg border p-4">
            <FieldLegend>{WORKSHOP_OPERATIONS_TEXT.addDeviceTitle}</FieldLegend>
            <Field>
              <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.deviceBrand}>
                {WORKSHOP_OPERATIONS_TEXT.deviceBrandLabel}
              </FieldLabel>
              <Input
                id={WORKSHOP_OPERATIONS_FIELDS.deviceBrand}
                value={form.brand}
                maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumBrandLength}
                required
                onChange={(event) => updateField("brand", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.deviceModel}>
                {WORKSHOP_OPERATIONS_TEXT.deviceModelLabel}
              </FieldLabel>
              <Input
                id={WORKSHOP_OPERATIONS_FIELDS.deviceModel}
                value={form.model}
                maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumModelLength}
                required
                onChange={(event) => updateField("model", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.deviceImei}>
                {WORKSHOP_OPERATIONS_TEXT.deviceImeiLabel}
              </FieldLabel>
              <Input
                id={WORKSHOP_OPERATIONS_FIELDS.deviceImei}
                value={form.imei}
                maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumImeiLength}
                onChange={(event) => updateField("imei", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.deviceColor}>
                {WORKSHOP_OPERATIONS_TEXT.deviceColorLabel}
              </FieldLabel>
              <Input
                id={WORKSHOP_OPERATIONS_FIELDS.deviceColor}
                value={form.color}
                maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumColorLength}
                onChange={(event) => updateField("color", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.deviceNotes}>
                {WORKSHOP_OPERATIONS_TEXT.deviceNotesLabel}
              </FieldLabel>
              <Textarea
                id={WORKSHOP_OPERATIONS_FIELDS.deviceNotes}
                value={form.deviceNotes}
                maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumNotesLength}
                onChange={(event) => updateField("deviceNotes", event.target.value)}
              />
            </Field>
          </FieldSet>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : customer ? (
              <Save data-icon="inline-start" />
            ) : (
              <UserRoundPlus data-icon="inline-start" />
            )}
            {isSubmitting
              ? WORKSHOP_OPERATIONS_TEXT.creatingCustomerAction
              : customer
                ? WORKSHOP_OPERATIONS_TEXT.updateCustomerAction
                : WORKSHOP_OPERATIONS_TEXT.createCustomerAction}
          </Button>
          {customer && onCancel ? (
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
              {WORKSHOP_OPERATIONS_TEXT.cancelEditAction}
            </Button>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
