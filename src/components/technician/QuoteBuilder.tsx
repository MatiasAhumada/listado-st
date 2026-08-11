"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, PackagePlus, Plus, Save, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  WORKSHOP_OPERATIONS_DEFAULTS,
  WORKSHOP_OPERATIONS_FIELDS,
  WORKSHOP_OPERATIONS_LIMITS,
  WORKSHOP_OPERATIONS_TEXT,
} from "@/constants/workshopOperations.constant";
import { CATALOG_LIMITS } from "@/constants/catalog.constant";
import { CatalogItemSummary, TechnicianCatalogResult } from "@/interfaces/catalog.interface";
import {
  QuoteAlternativeInput,
  QuoteSummary,
  WorkshopCustomerSummary,
} from "@/interfaces/workshopOperations.interface";
import { createWorkshopQuote, getTechnicianCatalog, updateWorkshopQuote } from "@/services/technician.service";
import { formatCatalogCurrency } from "@/utils/catalog.util";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { formatWorkshopMoney } from "@/utils/workshopOperations.util";

interface EditableQuoteAlternative extends QuoteAlternativeInput {
  localId: string;
  referenceCost: string | null;
  suggestedPrice: string | null;
}

interface QuoteBuilderProps {
  customers: WorkshopCustomerSummary[];
  initialCatalog: TechnicianCatalogResult;
  quote?: QuoteSummary;
  onSaved: (quote: QuoteSummary) => void;
  onCancel?: () => void;
}

function createInitialAlternatives(quote?: QuoteSummary): EditableQuoteAlternative[] {
  return (
    quote?.alternatives.map((alternative) => ({
      id: alternative.id,
      localId: alternative.id,
      catalogItemId: alternative.catalogItemId,
      description: alternative.description,
      supplier: alternative.supplier,
      selectedCost: alternative.selectedCost,
      finalPrice: alternative.finalPrice,
      referenceCost: alternative.referenceCost,
      suggestedPrice: alternative.suggestedPrice,
    })) ?? []
  );
}

export function QuoteBuilder({ customers, initialCatalog, quote, onSaved, onCancel }: QuoteBuilderProps) {
  const initialCustomer = customers.find((customer) => customer.id === quote?.customer.id) ?? customers[0];
  const [form, setForm] = useState(() => ({
    customerId: initialCustomer?.id ?? "",
    deviceId:
      initialCustomer?.devices.find((device) => device.id === quote?.device.id)?.id ??
      initialCustomer?.devices[0]?.id ??
      "",
    reportedIssue: quote?.reportedIssue ?? "",
    validityDays: String(quote?.validityDays ?? WORKSHOP_OPERATIONS_DEFAULTS.validityDays),
  }));
  const [alternatives, setAlternatives] = useState<EditableQuoteAlternative[]>(() => createInitialAlternatives(quote));
  const [catalogState, setCatalogState] = useState({
    result: initialCatalog,
    query: "",
    isSearching: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCustomer = customers.find((customer) => customer.id === form.customerId);
  const selectedDeviceId = selectedCustomer?.devices.some((device) => device.id === form.deviceId)
    ? form.deviceId
    : (selectedCustomer?.devices[0]?.id ?? "");

  const updateAlternative = (
    localId: string,
    field: "description" | "supplier" | "selectedCost" | "finalPrice",
    value: string
  ) => {
    setAlternatives((currentAlternatives) =>
      currentAlternatives.map((alternative) =>
        alternative.localId === localId ? { ...alternative, [field]: value } : alternative
      )
    );
  };

  const addCatalogAlternative = (item: CatalogItemSummary) => {
    if (
      alternatives.length >= WORKSHOP_OPERATIONS_LIMITS.maximumAlternatives ||
      alternatives.some((alternative) => alternative.catalogItemId === item.id)
    ) {
      return;
    }
    setAlternatives((currentAlternatives) => [
      ...currentAlternatives,
      {
        localId: crypto.randomUUID(),
        catalogItemId: item.id,
        description: item.name,
        supplier: WORKSHOP_OPERATIONS_DEFAULTS.referenceSupplier,
        selectedCost: String(item.cost),
        finalPrice: String(item.suggestedPrice),
        referenceCost: String(item.cost),
        suggestedPrice: String(item.suggestedPrice),
      },
    ]);
  };

  const addManualAlternative = () => {
    setAlternatives((currentAlternatives) => [
      ...currentAlternatives,
      {
        localId: crypto.randomUUID(),
        catalogItemId: null,
        description: "",
        supplier: "",
        selectedCost: "0",
        finalPrice: "",
        referenceCost: null,
        suggestedPrice: null,
      },
    ]);
  };

  const handleCatalogSearch = async () => {
    setCatalogState((currentState) => ({ ...currentState, isSearching: true }));
    try {
      const result = await getTechnicianCatalog(catalogState.query);
      setCatalogState((currentState) => ({ ...currentState, result }));
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setCatalogState((currentState) => ({ ...currentState, isSearching: false }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        customerId: form.customerId,
        deviceId: selectedDeviceId,
        reportedIssue: form.reportedIssue,
        validityDays: Number(form.validityDays),
        alternatives: alternatives.map((alternative) => ({
          id: alternative.id,
          catalogItemId: alternative.catalogItemId,
          description: alternative.description,
          supplier: alternative.supplier,
          selectedCost: alternative.selectedCost,
          finalPrice: alternative.finalPrice,
        })),
      };
      const savedQuote = quote ? await updateWorkshopQuote(quote.id, payload) : await createWorkshopQuote(payload);
      onSaved(savedQuote);
      if (!quote) {
        setForm((currentForm) => ({
          ...currentForm,
          reportedIssue: "",
          validityDays: String(WORKSHOP_OPERATIONS_DEFAULTS.validityDays),
        }));
        setAlternatives([]);
      }
      clientSuccessHandler(quote ? WORKSHOP_OPERATIONS_TEXT.draftUpdated : WORKSHOP_OPERATIONS_TEXT.draftCreated);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex min-w-0 flex-col gap-6" onSubmit={handleSubmit}>
      <Card className="border-foreground/15 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {quote ? WORKSHOP_OPERATIONS_TEXT.quoteEditorTitle : WORKSHOP_OPERATIONS_TEXT.quoteBuilderTitle}
          </CardTitle>
          <CardDescription>{WORKSHOP_OPERATIONS_TEXT.quoteBuilderDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {!customers.length ? (
            <Alert>
              <AlertTitle>{WORKSHOP_OPERATIONS_TEXT.customerRequired}</AlertTitle>
              <AlertDescription>{WORKSHOP_OPERATIONS_TEXT.createCustomerDescription}</AlertDescription>
            </Alert>
          ) : (
            <FieldGroup className="grid gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.quoteCustomer}>
                  {WORKSHOP_OPERATIONS_TEXT.quoteCustomerLabel}
                </FieldLabel>
                <NativeSelect
                  id={WORKSHOP_OPERATIONS_FIELDS.quoteCustomer}
                  className="w-full"
                  value={form.customerId}
                  onChange={(event) => {
                    const customer = customers.find((currentCustomer) => currentCustomer.id === event.target.value);
                    setForm((currentForm) => ({
                      ...currentForm,
                      customerId: event.target.value,
                      deviceId: customer?.devices[0]?.id ?? "",
                    }));
                  }}
                >
                  {customers.map((customer) => (
                    <NativeSelectOption key={customer.id} value={customer.id}>
                      {customer.fullName}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.quoteDevice}>
                  {WORKSHOP_OPERATIONS_TEXT.quoteDeviceLabel}
                </FieldLabel>
                <NativeSelect
                  id={WORKSHOP_OPERATIONS_FIELDS.quoteDevice}
                  className="w-full"
                  value={selectedDeviceId}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, deviceId: event.target.value }))}
                >
                  {selectedCustomer?.devices.map((device) => (
                    <NativeSelectOption key={device.id} value={device.id}>
                      {device.brand} {device.model}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field className="md:col-span-2">
                <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.quoteIssue}>
                  {WORKSHOP_OPERATIONS_TEXT.quoteIssueLabel}
                </FieldLabel>
                <Textarea
                  id={WORKSHOP_OPERATIONS_FIELDS.quoteIssue}
                  value={form.reportedIssue}
                  maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumIssueLength}
                  required
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      reportedIssue: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.quoteValidity}>
                  {WORKSHOP_OPERATIONS_TEXT.quoteValidityLabel}
                </FieldLabel>
                <Input
                  id={WORKSHOP_OPERATIONS_FIELDS.quoteValidity}
                  type="number"
                  min={WORKSHOP_OPERATIONS_LIMITS.minimumValidityDays}
                  max={WORKSHOP_OPERATIONS_LIMITS.maximumValidityDays}
                  value={form.validityDays}
                  required
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      validityDays: event.target.value,
                    }))
                  }
                />
                <FieldDescription>{WORKSHOP_OPERATIONS_TEXT.quoteValidityDescription}</FieldDescription>
              </Field>
            </FieldGroup>
          )}
        </CardContent>
      </Card>

      <Card className="border-foreground/15 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {WORKSHOP_OPERATIONS_TEXT.alternativesTitle}
          </CardTitle>
          <CardDescription>{WORKSHOP_OPERATIONS_TEXT.alternativesDescription}</CardDescription>
          <CardAction>
            <Badge variant="outline">{alternatives.length}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {alternatives.map((alternative, index) => {
            const selectedCost = Number(alternative.selectedCost || 0);
            const finalPrice = Number(alternative.finalPrice || 0);
            return (
              <Card key={alternative.localId} className="gap-4 py-4 shadow-none">
                <CardHeader>
                  <CardTitle>
                    <Badge variant="secondary">{index + 1}</Badge>{" "}
                    {alternative.catalogItemId
                      ? WORKSHOP_OPERATIONS_TEXT.referenceCatalogBadge
                      : WORKSHOP_OPERATIONS_TEXT.manualBadge}
                  </CardTitle>
                  <CardAction>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={WORKSHOP_OPERATIONS_TEXT.removeAlternativeAction}
                      onClick={() =>
                        setAlternatives((currentAlternatives) =>
                          currentAlternatives.filter(
                            (currentAlternative) => currentAlternative.localId !== alternative.localId
                          )
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="grid gap-4 md:grid-cols-2">
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor={`quote-alternative-description-${alternative.localId}`}>
                        {WORKSHOP_OPERATIONS_TEXT.alternativeDescriptionLabel}
                      </FieldLabel>
                      <Input
                        id={`quote-alternative-description-${alternative.localId}`}
                        value={alternative.description}
                        maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumAlternativeDescriptionLength}
                        required
                        onChange={(event) => updateAlternative(alternative.localId, "description", event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`quote-alternative-supplier-${alternative.localId}`}>
                        {WORKSHOP_OPERATIONS_TEXT.supplierLabel}
                      </FieldLabel>
                      <Input
                        id={`quote-alternative-supplier-${alternative.localId}`}
                        value={alternative.supplier}
                        maxLength={WORKSHOP_OPERATIONS_LIMITS.maximumSupplierLength}
                        required
                        onChange={(event) => updateAlternative(alternative.localId, "supplier", event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>{WORKSHOP_OPERATIONS_TEXT.referenceCostLabel}</FieldLabel>
                      <div className="flex h-9 items-center rounded-md border border-dashed px-3 font-mono text-sm">
                        {alternative.referenceCost
                          ? formatWorkshopMoney(alternative.referenceCost, WORKSHOP_OPERATIONS_DEFAULTS.currency)
                          : WORKSHOP_OPERATIONS_TEXT.manualBadge}
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`quote-alternative-cost-${alternative.localId}`}>
                        {WORKSHOP_OPERATIONS_TEXT.selectedCostLabel}
                      </FieldLabel>
                      <MoneyInput
                        id={`quote-alternative-cost-${alternative.localId}`}
                        value={alternative.selectedCost}
                        required
                        onValueChange={(value) => updateAlternative(alternative.localId, "selectedCost", value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>{WORKSHOP_OPERATIONS_TEXT.suggestedPriceLabel}</FieldLabel>
                      <div className="flex h-9 items-center rounded-md border border-dashed px-3 font-mono text-sm">
                        {alternative.suggestedPrice
                          ? formatWorkshopMoney(alternative.suggestedPrice, WORKSHOP_OPERATIONS_DEFAULTS.currency)
                          : WORKSHOP_OPERATIONS_TEXT.manualBadge}
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`quote-alternative-final-${alternative.localId}`}>
                        {WORKSHOP_OPERATIONS_TEXT.finalPriceLabel}
                      </FieldLabel>
                      <MoneyInput
                        id={`quote-alternative-final-${alternative.localId}`}
                        value={alternative.finalPrice}
                        required
                        onValueChange={(value) => updateAlternative(alternative.localId, "finalPrice", value)}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="justify-between">
                  <span className="text-sm text-muted-foreground">{WORKSHOP_OPERATIONS_TEXT.estimatedProfitLabel}</span>
                  <strong className="font-mono">
                    {formatWorkshopMoney(String(finalPrice - selectedCost), WORKSHOP_OPERATIONS_DEFAULTS.currency)}
                  </strong>
                </CardFooter>
              </Card>
            );
          })}
          <Button
            type="button"
            variant="outline"
            disabled={alternatives.length >= WORKSHOP_OPERATIONS_LIMITS.maximumAlternatives}
            onClick={addManualAlternative}
          >
            <Plus data-icon="inline-start" />
            {WORKSHOP_OPERATIONS_TEXT.manualAlternativeAction}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-foreground/15 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {WORKSHOP_OPERATIONS_TEXT.catalogTitle}
          </CardTitle>
          <CardDescription>{WORKSHOP_OPERATIONS_TEXT.alternativesDescription}</CardDescription>
          <CardAction>
            <PackagePlus />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FieldGroup className="sm:flex-row sm:items-end">
            <Field>
              <FieldLabel htmlFor={WORKSHOP_OPERATIONS_FIELDS.catalogSearch}>
                {WORKSHOP_OPERATIONS_TEXT.catalogSearchLabel}
              </FieldLabel>
              <Input
                id={WORKSHOP_OPERATIONS_FIELDS.catalogSearch}
                value={catalogState.query}
                maxLength={CATALOG_LIMITS.maximumSearchLength}
                onChange={(event) =>
                  setCatalogState((currentState) => ({
                    ...currentState,
                    query: event.target.value,
                  }))
                }
              />
            </Field>
            <Button type="button" variant="outline" disabled={catalogState.isSearching} onClick={handleCatalogSearch}>
              {catalogState.isSearching ? (
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
              ) : (
                <PackagePlus data-icon="inline-start" />
              )}
              {catalogState.isSearching
                ? WORKSHOP_OPERATIONS_TEXT.catalogSearchingAction
                : WORKSHOP_OPERATIONS_TEXT.catalogSearchAction}
            </Button>
          </FieldGroup>
          <div className="grid max-h-96 gap-3 overflow-y-auto pr-1">
            {catalogState.result.items.map((item) => {
              const isAdded = alternatives.some((alternative) => alternative.catalogItemId === item.id);
              return (
                <Card key={item.id} className="gap-4 py-4 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm leading-snug">{item.name}</CardTitle>
                    <CardDescription>
                      {item.brand ?? "—"} · {formatCatalogCurrency(item.cost)} →{" "}
                      {formatCatalogCurrency(item.suggestedPrice)}
                    </CardDescription>
                    <CardAction>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isAdded || alternatives.length >= WORKSHOP_OPERATIONS_LIMITS.maximumAlternatives}
                        onClick={() => addCatalogAlternative(item)}
                      >
                        <Plus data-icon="inline-start" />
                        {isAdded
                          ? WORKSHOP_OPERATIONS_TEXT.alreadyAddedAction
                          : WORKSHOP_OPERATIONS_TEXT.addCatalogAlternativeAction}
                      </Button>
                    </CardAction>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-foreground/15 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {WORKSHOP_OPERATIONS_TEXT.saveQuoteTitle}
          </CardTitle>
          <CardDescription>{WORKSHOP_OPERATIONS_TEXT.saveQuoteDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isSubmitting || !customers.length || !alternatives.length}
          >
            {isSubmitting ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {isSubmitting ? WORKSHOP_OPERATIONS_TEXT.savingDraftAction : WORKSHOP_OPERATIONS_TEXT.saveDraftAction}
          </Button>
          {quote && onCancel ? (
            <Button type="button" variant="outline" size="lg" onClick={onCancel}>
              {WORKSHOP_OPERATIONS_TEXT.cancelEditAction}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
}
