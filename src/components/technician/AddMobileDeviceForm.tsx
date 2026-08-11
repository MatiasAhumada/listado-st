"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  WORKSHOP_OPERATIONS_FIELDS,
  WORKSHOP_OPERATIONS_LIMITS,
  WORKSHOP_OPERATIONS_TEXT,
} from "@/constants/workshopOperations.constant";
import { WorkshopCustomerSummary } from "@/interfaces/workshopOperations.interface";
import { addWorkshopCustomerDevice } from "@/services/technician.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";

interface AddMobileDeviceFormProps {
  customers: WorkshopCustomerSummary[];
  onSaved: (customer: WorkshopCustomerSummary) => void;
}

const emptyDevice = {
  brand: "",
  model: "",
  imei: "",
  color: "",
  notes: "",
};

export function AddMobileDeviceForm({ customers, onSaved }: AddMobileDeviceFormProps) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [device, setDevice] = useState(emptyDevice);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCustomerId = customers.some((customer) => customer.id === customerId)
    ? customerId
    : (customers[0]?.id ?? "");

  const updateField = (field: keyof typeof device, value: string) => {
    setDevice((currentDevice) => ({ ...currentDevice, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const customer = await addWorkshopCustomerDevice(selectedCustomerId, {
        brand: device.brand,
        model: device.model,
        imei: device.imei.trim() || null,
        color: device.color.trim() || null,
        notes: device.notes.trim() || null,
      });
      onSaved(customer);
      setDevice(emptyDevice);
      clientSuccessHandler(WORKSHOP_OPERATIONS_TEXT.deviceCreated);
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
          <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceCustomer}>
            {WORKSHOP_OPERATIONS_TEXT.selectCustomerLabel}
          </FieldLabel>
          <NativeSelect
            id={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceCustomer}
            className="w-full"
            value={selectedCustomerId}
            onChange={(event) => setCustomerId(event.target.value)}
          >
            {customers.map((customer) => (
              <NativeSelectOption key={customer.id} value={customer.id}>
                {customer.fullName}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <FieldSet className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
          <FieldLegend className="sm:col-span-2">{WORKSHOP_OPERATIONS_TEXT.addDeviceTitle}</FieldLegend>
          <Field>
            <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceBrand}>
              {WORKSHOP_OPERATIONS_TEXT.deviceBrandLabel}
            </FieldLabel>
            <Input
              id={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceBrand}
              value={device.brand}
              maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumBrandLength}
              required
              onChange={(event) => updateField("brand", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceModel}>
              {WORKSHOP_OPERATIONS_TEXT.deviceModelLabel}
            </FieldLabel>
            <Input
              id={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceModel}
              value={device.model}
              maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumModelLength}
              required
              onChange={(event) => updateField("model", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceImei}>
              {WORKSHOP_OPERATIONS_TEXT.deviceImeiLabel}
            </FieldLabel>
            <Input
              id={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceImei}
              value={device.imei}
              maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumImeiLength}
              onChange={(event) => updateField("imei", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceColor}>
              {WORKSHOP_OPERATIONS_TEXT.deviceColorLabel}
            </FieldLabel>
            <Input
              id={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceColor}
              value={device.color}
              maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumColorLength}
              onChange={(event) => updateField("color", event.target.value)}
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceNotes}>
              {WORKSHOP_OPERATIONS_TEXT.deviceNotesLabel}
            </FieldLabel>
            <Textarea
              id={WORKSHOP_OPERATIONS_FIELDS.additionalDeviceNotes}
              value={device.notes}
              maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumNotesLength}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </Field>
        </FieldSet>
        <Button type="submit" disabled={isSubmitting || !selectedCustomerId}>
          {isSubmitting ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Smartphone data-icon="inline-start" />
          )}
          {isSubmitting ? WORKSHOP_OPERATIONS_TEXT.creatingCustomerAction : WORKSHOP_OPERATIONS_TEXT.addDeviceAction}
        </Button>
      </FieldGroup>
    </form>
  );
}
