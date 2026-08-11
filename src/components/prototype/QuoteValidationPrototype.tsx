"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  Send,
  Smartphone,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import {
  PROTOTYPE_CATALOG_ITEMS,
  PROTOTYPE_DEFAULTS,
  PROTOTYPE_INITIAL_CATALOG_ITEM_IDS,
  PROTOTYPE_MINIMUM_ALTERNATIVES,
  PROTOTYPE_STAGE,
  PROTOTYPE_TEXT,
} from "@/constants/quotePrototype.constant";
import {
  PrototypeCatalogItem,
  PrototypeQuoteAlternative,
  PrototypeQuoteStage,
} from "@/interfaces/quotePrototype.interface";
import {
  buildPrototypeClientMessage,
  calculateEstimatedProfit,
  calculateSuggestedPrice,
  formatPrototypeMoney,
  normalizePrototypeSearch,
  parsePrototypeAmount,
} from "@/utils/quotePrototype.util";
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
import { Separator } from "@/components/ui/separator";

function createAlternative(catalogItem: PrototypeCatalogItem): PrototypeQuoteAlternative {
  return {
    id: catalogItem.id,
    catalogItemId: catalogItem.id,
    description: catalogItem.description,
    supplier: PROTOTYPE_DEFAULTS.supplier,
    referenceCost: catalogItem.referenceCost,
    selectedCost: catalogItem.referenceCost,
    suggestedPrice: calculateSuggestedPrice(catalogItem.referenceCost),
    finalPrice: calculateSuggestedPrice(catalogItem.referenceCost),
  };
}

function createInitialAlternatives() {
  return PROTOTYPE_CATALOG_ITEMS.filter((catalogItem) =>
    PROTOTYPE_INITIAL_CATALOG_ITEM_IDS.some((initialCatalogItemId) => initialCatalogItemId === catalogItem.id)
  ).map(createAlternative);
}

const stageLabels: Record<PrototypeQuoteStage, string> = {
  DRAFT: PROTOTYPE_TEXT.draftStatus,
  SENT: PROTOTYPE_TEXT.sentStatus,
  ACCEPTED: PROTOTYPE_TEXT.acceptedStatus,
};

export function QuoteValidationPrototype() {
  const [customerName, setCustomerName] = useState<string>(PROTOTYPE_DEFAULTS.customerName);
  const [customerPhone, setCustomerPhone] = useState<string>(PROTOTYPE_DEFAULTS.customerPhone);
  const [phoneModel, setPhoneModel] = useState<string>(PROTOTYPE_DEFAULTS.phoneModel);
  const [reportedIssue, setReportedIssue] = useState<string>(PROTOTYPE_DEFAULTS.reportedIssue);
  const [validityDays, setValidityDays] = useState<string>(PROTOTYPE_DEFAULTS.validityDays);
  const [catalogQuery, setCatalogQuery] = useState<string>(PROTOTYPE_DEFAULTS.catalogQuery);
  const [alternatives, setAlternatives] = useState<PrototypeQuoteAlternative[]>(createInitialAlternatives);
  const [quoteStage, setQuoteStage] = useState<PrototypeQuoteStage>(PROTOTYPE_STAGE.DRAFT);
  const [acceptedAlternativeId, setAcceptedAlternativeId] = useState<string>();

  const isDraft = quoteStage === PROTOTYPE_STAGE.DRAFT;
  const isSent = quoteStage === PROTOTYPE_STAGE.SENT;
  const isAccepted = quoteStage === PROTOTYPE_STAGE.ACCEPTED;

  const filteredCatalogItems = useMemo(() => {
    const normalizedQuery = normalizePrototypeSearch(catalogQuery);

    return PROTOTYPE_CATALOG_ITEMS.filter((catalogItem) => {
      const searchableValue = normalizePrototypeSearch(
        `${catalogItem.description} ${catalogItem.compatibleModels.join(" ")}`
      );
      return searchableValue.includes(normalizedQuery);
    });
  }, [catalogQuery]);

  const acceptedAlternative = alternatives.find((alternative) => alternative.id === acceptedAlternativeId);

  const addAlternative = (catalogItem: PrototypeCatalogItem) => {
    const alreadyAdded = alternatives.some((alternative) => alternative.catalogItemId === catalogItem.id);

    if (alreadyAdded || !isDraft) {
      return;
    }

    setAlternatives((currentAlternatives) => [...currentAlternatives, createAlternative(catalogItem)]);
  };

  const updateAlternativeSupplier = (alternativeId: string, supplier: string) => {
    setAlternatives((currentAlternatives) =>
      currentAlternatives.map((alternative) =>
        alternative.id === alternativeId ? { ...alternative, supplier } : alternative
      )
    );
  };

  const updateAlternativeCost = (alternativeId: string, selectedCost: number) => {
    setAlternatives((currentAlternatives) =>
      currentAlternatives.map((alternative) =>
        alternative.id === alternativeId ? { ...alternative, selectedCost } : alternative
      )
    );
  };

  const updateAlternativeFinalPrice = (alternativeId: string, finalPrice: number) => {
    setAlternatives((currentAlternatives) =>
      currentAlternatives.map((alternative) =>
        alternative.id === alternativeId ? { ...alternative, finalPrice } : alternative
      )
    );
  };

  const markQuoteAsSent = () => {
    if (alternatives.length < PROTOTYPE_MINIMUM_ALTERNATIVES) {
      toast.error(PROTOTYPE_TEXT.missingAlternatives);
      return;
    }

    setQuoteStage(PROTOTYPE_STAGE.SENT);
  };

  const markAlternativeAsAccepted = (alternativeId: string) => {
    if (!isSent) {
      return;
    }

    setAcceptedAlternativeId(alternativeId);
    setQuoteStage(PROTOTYPE_STAGE.ACCEPTED);
  };

  const copyWhatsappMessage = async () => {
    const message = buildPrototypeClientMessage({
      customerName,
      phoneModel,
      validityDays,
      alternatives,
    });

    try {
      await navigator.clipboard.writeText(message);
      toast.success(PROTOTYPE_TEXT.copiedWhatsapp);
    } catch {
      toast.error(PROTOTYPE_TEXT.copiedWhatsappError);
    }
  };

  const resetPrototype = () => {
    setCustomerName(PROTOTYPE_DEFAULTS.customerName);
    setCustomerPhone(PROTOTYPE_DEFAULTS.customerPhone);
    setPhoneModel(PROTOTYPE_DEFAULTS.phoneModel);
    setReportedIssue(PROTOTYPE_DEFAULTS.reportedIssue);
    setValidityDays(PROTOTYPE_DEFAULTS.validityDays);
    setCatalogQuery(PROTOTYPE_DEFAULTS.catalogQuery);
    setAlternatives(createInitialAlternatives());
    setAcceptedAlternativeId(undefined);
    setQuoteStage(PROTOTYPE_STAGE.DRAFT);
  };

  return (
    <main className="prototype-grid min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <header className="prototype-enter overflow-hidden rounded-2xl border bg-foreground text-background shadow-xl">
          <div className="safety-rule h-2" />
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-9">
            <div className="flex max-w-4xl flex-col gap-4">
              <Badge variant="secondary" className="rounded-sm font-mono tracking-[0.16em]">
                <Wrench />
                {PROTOTYPE_TEXT.eyebrow}
              </Badge>
              <div className="flex flex-col gap-3">
                <h1 className="font-display text-5xl leading-[0.92] font-bold uppercase sm:text-6xl lg:text-7xl">
                  {PROTOTYPE_TEXT.title}
                </h1>
                <p className="max-w-3xl text-base text-background/70 sm:text-lg">{PROTOTYPE_TEXT.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Badge variant={isAccepted ? "default" : "outline"} className="border-background/30 text-background">
                {isAccepted ? <CheckCircle2 /> : <Clock3 />}
                {stageLabels[quoteStage]}
              </Badge>
              <p className="font-mono text-xs text-background/60">{PROTOTYPE_TEXT.sessionBadge}</p>
            </div>
          </div>
        </header>

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            <Card className="prototype-enter border-foreground/15 bg-card/95 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase tracking-wide">
                  {PROTOTYPE_TEXT.customerCardTitle}
                </CardTitle>
                <CardDescription>{PROTOTYPE_TEXT.customerCardDescription}</CardDescription>
                <CardAction>
                  <Smartphone className="text-primary" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-5 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="prototype-customer-name">{PROTOTYPE_TEXT.customerNameLabel}</FieldLabel>
                    <Input
                      id="prototype-customer-name"
                      value={customerName}
                      placeholder={PROTOTYPE_TEXT.customerNamePlaceholder}
                      disabled={!isDraft}
                      onChange={(event) => setCustomerName(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="prototype-customer-phone">{PROTOTYPE_TEXT.customerPhoneLabel}</FieldLabel>
                    <Input
                      id="prototype-customer-phone"
                      value={customerPhone}
                      placeholder={PROTOTYPE_TEXT.customerPhonePlaceholder}
                      disabled={!isDraft}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="prototype-phone-model">{PROTOTYPE_TEXT.phoneModelLabel}</FieldLabel>
                    <Input
                      id="prototype-phone-model"
                      value={phoneModel}
                      placeholder={PROTOTYPE_TEXT.phoneModelPlaceholder}
                      disabled={!isDraft}
                      onChange={(event) => setPhoneModel(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="prototype-issue">{PROTOTYPE_TEXT.issueLabel}</FieldLabel>
                    <Input
                      id="prototype-issue"
                      value={reportedIssue}
                      placeholder={PROTOTYPE_TEXT.issuePlaceholder}
                      disabled={!isDraft}
                      onChange={(event) => setReportedIssue(event.target.value)}
                    />
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel htmlFor="prototype-validity">{PROTOTYPE_TEXT.validityLabel}</FieldLabel>
                    <div className="flex items-center gap-3">
                      <Input
                        id="prototype-validity"
                        type="number"
                        min={PROTOTYPE_MINIMUM_ALTERNATIVES}
                        value={validityDays}
                        disabled={!isDraft}
                        className="max-w-24 font-mono"
                        onChange={(event) => setValidityDays(event.target.value)}
                      />
                      <span className="text-sm font-medium">{PROTOTYPE_TEXT.daysSuffix}</span>
                    </div>
                    <FieldDescription>{PROTOTYPE_TEXT.validityDescription}</FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="prototype-enter border-foreground/15 bg-card/95 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase tracking-wide">
                  {PROTOTYPE_TEXT.alternativesCardTitle}
                </CardTitle>
                <CardDescription>{PROTOTYPE_TEXT.alternativesCardDescription}</CardDescription>
                <CardAction>
                  <Badge variant="outline" className="font-mono">
                    {alternatives.length}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {alternatives.map((alternative, alternativeIndex) => {
                  const isAlternativeAccepted = acceptedAlternativeId === alternative.id;
                  const estimatedProfit = calculateEstimatedProfit(alternative.finalPrice, alternative.selectedCost);

                  return (
                    <Card key={alternative.id} className="border-foreground/10 bg-muted/45 py-5 shadow-none">
                      <CardHeader className="px-5">
                        <CardTitle className="flex items-start gap-3 text-base leading-snug">
                          <Badge variant="secondary" className="rounded-sm font-mono">
                            {String(alternativeIndex + 1).padStart(2, "0")}
                          </Badge>
                          {alternative.description}
                        </CardTitle>
                        <CardDescription>
                          {PROTOTYPE_TEXT.referenceCost}: {formatPrototypeMoney(alternative.referenceCost)}
                        </CardDescription>
                        <CardAction>
                          {isAlternativeAccepted ? (
                            <Badge>
                              <Check />
                              {PROTOTYPE_TEXT.accepted}
                            </Badge>
                          ) : null}
                        </CardAction>
                      </CardHeader>
                      <CardContent className="grid gap-4 px-5 md:grid-cols-2 xl:grid-cols-4">
                        <Field>
                          <FieldLabel htmlFor={`supplier-${alternative.id}`}>{PROTOTYPE_TEXT.supplier}</FieldLabel>
                          <Input
                            id={`supplier-${alternative.id}`}
                            value={alternative.supplier}
                            disabled={!isDraft}
                            onChange={(event) => updateAlternativeSupplier(alternative.id, event.target.value)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`cost-${alternative.id}`}>{PROTOTYPE_TEXT.selectedCost}</FieldLabel>
                          <MoneyInput
                            id={`cost-${alternative.id}`}
                            value={alternative.selectedCost}
                            disabled={!isDraft}
                            className="font-mono"
                            onValueChange={(value) =>
                              updateAlternativeCost(alternative.id, parsePrototypeAmount(value))
                            }
                          />
                        </Field>
                        <Field>
                          <FieldLabel>{PROTOTYPE_TEXT.referenceSuggestion}</FieldLabel>
                          <div className="flex h-9 items-center rounded-md border border-dashed bg-background px-3 font-mono text-sm">
                            {formatPrototypeMoney(alternative.suggestedPrice)}
                          </div>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor={`final-price-${alternative.id}`}>{PROTOTYPE_TEXT.finalPrice}</FieldLabel>
                          <MoneyInput
                            id={`final-price-${alternative.id}`}
                            value={alternative.finalPrice}
                            disabled={!isDraft}
                            className="font-mono font-semibold"
                            onValueChange={(value) =>
                              updateAlternativeFinalPrice(alternative.id, parsePrototypeAmount(value))
                            }
                          />
                        </Field>
                      </CardContent>
                      <CardFooter className="justify-between gap-4 px-5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-muted-foreground text-xs uppercase tracking-wide">
                            {PROTOTYPE_TEXT.estimatedProfit}
                          </span>
                          <strong className="font-mono text-lg">{formatPrototypeMoney(estimatedProfit)}</strong>
                        </div>
                        {isSent ? (
                          <Button size="sm" onClick={() => markAlternativeAsAccepted(alternative.id)}>
                            <Check data-icon="inline-start" />
                            {PROTOTYPE_TEXT.markAccepted}
                          </Button>
                        ) : null}
                      </CardFooter>
                    </Card>
                  );
                })}

                {!isDraft ? (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    {PROTOTYPE_TEXT.editLocked}
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-sm text-muted-foreground">{PROTOTYPE_TEXT.observationPrompt}</p>
                {isDraft ? (
                  <Button size="lg" onClick={markQuoteAsSent}>
                    <Send data-icon="inline-start" />
                    {PROTOTYPE_TEXT.sendQuote}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={resetPrototype}>
                    <RotateCcw data-icon="inline-start" />
                    {PROTOTYPE_TEXT.resetSession}
                  </Button>
                )}
              </CardFooter>
            </Card>

            {isAccepted && acceptedAlternative ? (
              <Card className="prototype-enter border-primary/40 bg-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display text-2xl uppercase tracking-wide">
                    {PROTOTYPE_TEXT.acceptedTitle}
                  </CardTitle>
                  <CardDescription className="text-foreground/75">{PROTOTYPE_TEXT.acceptedDescription}</CardDescription>
                  <CardAction>
                    <CheckCircle2 className="text-primary" />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{acceptedAlternative.description}</p>
                  <p className="mt-2 font-mono text-2xl font-bold">
                    {formatPrototypeMoney(acceptedAlternative.finalPrice)}
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <aside className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-6">
            <Card className="prototype-enter border-foreground/15 bg-card/95 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase tracking-wide">
                  {PROTOTYPE_TEXT.catalogTitle}
                </CardTitle>
                <CardDescription>{PROTOTYPE_TEXT.catalogDescription}</CardDescription>
                <CardAction>
                  <PackageCheck className="text-primary" />
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <Field>
                  <FieldLabel htmlFor="prototype-catalog-search">{PROTOTYPE_TEXT.searchLabel}</FieldLabel>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="prototype-catalog-search"
                      value={catalogQuery}
                      placeholder={PROTOTYPE_TEXT.searchPlaceholder}
                      className="pl-9"
                      onChange={(event) => setCatalogQuery(event.target.value)}
                    />
                  </div>
                </Field>

                <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
                  {filteredCatalogItems.map((catalogItem) => {
                    const alreadyAdded = alternatives.some(
                      (alternative) => alternative.catalogItemId === catalogItem.id
                    );

                    return (
                      <Card key={catalogItem.id} className="gap-4 border-foreground/10 py-4 shadow-none">
                        <CardHeader className="gap-3 px-4">
                          <CardTitle className="text-sm leading-snug">{catalogItem.description}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{PROTOTYPE_TEXT.availableBadge}</Badge>
                            <Badge variant="outline">{catalogItem.quality}</Badge>
                            <Badge variant="outline">
                              {catalogItem.frameIncluded ? PROTOTYPE_TEXT.frameBadge : PROTOTYPE_TEXT.noFrameBadge}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex items-end justify-between gap-4 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">{PROTOTYPE_TEXT.referenceSuggestion}</span>
                            <strong className="font-mono text-xl">
                              {formatPrototypeMoney(calculateSuggestedPrice(catalogItem.referenceCost))}
                            </strong>
                          </div>
                          <Button
                            size="sm"
                            variant={alreadyAdded ? "secondary" : "outline"}
                            disabled={alreadyAdded || !isDraft}
                            onClick={() => addAlternative(catalogItem)}
                          >
                            {alreadyAdded ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
                            {alreadyAdded ? PROTOTYPE_TEXT.alreadyAdded : PROTOTYPE_TEXT.addAlternative}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">{PROTOTYPE_TEXT.sourceLabel}:</strong>{" "}
                  {PROTOTYPE_TEXT.sourceValue}
                </p>
                <p>{PROTOTYPE_TEXT.sourceRule}</p>
              </CardFooter>
            </Card>

            <Card className="prototype-enter border-foreground/15 bg-foreground text-background shadow-xl">
              <CardHeader>
                <CardTitle className="font-display text-2xl uppercase tracking-wide">
                  {PROTOTYPE_TEXT.customerPreviewTitle}
                </CardTitle>
                <CardDescription className="text-background/60">
                  {PROTOTYPE_TEXT.customerPreviewDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="font-display text-3xl font-semibold uppercase">{customerName}</p>
                  <p className="text-sm text-background/60">{customerPhone}</p>
                </div>
                <Separator className="bg-background/20" />
                <div className="flex flex-col gap-1 text-sm">
                  <p>
                    <strong>{PROTOTYPE_TEXT.reportedIssuePrefix}</strong> {phoneModel}
                  </p>
                  <p className="text-background/60">{reportedIssue}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {alternatives.map((alternative, alternativeIndex) => (
                    <div
                      key={`preview-${alternative.id}`}
                      className="grid grid-cols-[auto_1fr] gap-3 rounded-md border border-background/15 p-3"
                    >
                      <span className="font-mono text-xs text-background/50">
                        {String(alternativeIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm leading-snug">{alternative.description}</p>
                        <strong className="font-mono text-lg">{formatPrototypeMoney(alternative.finalPrice)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-xs text-background/55">
                  {PROTOTYPE_TEXT.validityPrefix} {validityDays} {PROTOTYPE_TEXT.daysSuffix}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full" disabled={isDraft} onClick={copyWhatsappMessage}>
                  <ClipboardCopy data-icon="inline-start" />
                  {PROTOTYPE_TEXT.copyWhatsapp}
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}
