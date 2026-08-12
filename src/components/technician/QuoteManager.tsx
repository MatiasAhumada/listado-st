"use client";

import { useState } from "react";
import { Check, ClipboardCopy, FilePenLine, FileText, LoaderCircle, RotateCcw, Send } from "lucide-react";
import { QuoteBuilder } from "@/components/technician/QuoteBuilder";
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TechnicianCatalogResult } from "@/interfaces/catalog.interface";
import { QuoteSummary, WorkshopCustomerSummary } from "@/interfaces/workshopOperations.interface";
import { QUOTE_STATUS_LABELS, WORKSHOP_OPERATIONS_TEXT } from "@/constants/workshopOperations.constant";
import {
  acceptWorkshopQuoteAlternative,
  prepareWorkshopQuoteRevision,
  sendWorkshopQuoteRevision,
} from "@/services/technician.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { buildQuoteWhatsappMessage, formatWorkshopDate, formatWorkshopMoney } from "@/utils/workshopOperations.util";

interface QuoteManagerProps {
  customers: WorkshopCustomerSummary[];
  quotes: QuoteSummary[];
  initialCatalog: TechnicianCatalogResult;
  onCreated: (quote: QuoteSummary) => void;
  onUpdated: (quote: QuoteSummary) => void;
}

function getStatusVariant(status: QuoteSummary["displayStatus"]) {
  if (status === "ACCEPTED") return "default" as const;
  if (status === "EXPIRED" || status === "CANCELLED" || status === "REJECTED") {
    return "destructive" as const;
  }
  if (status === "SENT") return "secondary" as const;
  return "outline" as const;
}

export function QuoteManager({ customers, quotes, initialCatalog, onCreated, onUpdated }: QuoteManagerProps) {
  const [editingQuote, setEditingQuote] = useState<QuoteSummary>();
  const [pendingAction, setPendingAction] = useState<string>();

  const handleSaved = (quote: QuoteSummary) => {
    if (editingQuote) {
      onUpdated(quote);
      setEditingQuote(undefined);
      return;
    }
    onCreated(quote);
  };

  const runAction = async (
    actionKey: string,
    action: () => Promise<QuoteSummary>,
    successMessage: string,
    editAfter = false
  ) => {
    setPendingAction(actionKey);
    try {
      const quote = await action();
      onUpdated(quote);
      if (editAfter) setEditingQuote(quote);
      clientSuccessHandler(successMessage);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setPendingAction(undefined);
    }
  };

  const copyMessage = async (quote: QuoteSummary) => {
    try {
      await navigator.clipboard.writeText(buildQuoteWhatsappMessage(quote));
      clientSuccessHandler(WORKSHOP_OPERATIONS_TEXT.whatsappCopied);
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  return (
    <section className="grid items-start gap-6 2xl:grid-cols-[minmax(420px,0.9fr)_minmax(0,1.1fr)]">
      <QuoteBuilder
        key={editingQuote?.id ?? "new-quote"}
        customers={customers}
        initialCatalog={initialCatalog}
        quote={editingQuote}
        onSaved={handleSaved}
        onCancel={editingQuote ? () => setEditingQuote(undefined) : undefined}
      />

      <Card variant="elevated" className="min-w-0">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {WORKSHOP_OPERATIONS_TEXT.quotesListTitle}
          </CardTitle>
          <CardDescription>{WORKSHOP_OPERATIONS_TEXT.quotesListDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-5">
          {quotes.length ? (
            quotes.map((quote) => {
              const latestRevision = quote.revisions[0];
              const sendKey = `send-${quote.id}`;
              const prepareKey = `prepare-${quote.id}`;
              return (
                <Card key={quote.id} className="shadow-none">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl uppercase tracking-wide">
                      {WORKSHOP_OPERATIONS_TEXT.quoteNumberPrefix}
                      {String(quote.number).padStart(4, "0")}
                    </CardTitle>
                    <CardDescription>
                      {quote.customer.fullName} · {quote.device.brand} {quote.device.model}
                    </CardDescription>
                    <CardAction>
                      <Badge variant={getStatusVariant(quote.displayStatus)}>
                        {QUOTE_STATUS_LABELS[quote.displayStatus]}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-sm">{quote.reportedIssue}</p>

                    {quote.status === "DRAFT" ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{WORKSHOP_OPERATIONS_TEXT.alternativeDescriptionLabel}</TableHead>
                            <TableHead className="text-right">{WORKSHOP_OPERATIONS_TEXT.selectedCostLabel}</TableHead>
                            <TableHead className="text-right">{WORKSHOP_OPERATIONS_TEXT.finalPriceLabel}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quote.alternatives.map((alternative) => (
                            <TableRow key={alternative.id}>
                              <TableCell>{alternative.description}</TableCell>
                              <TableCell className="text-right font-mono">
                                {formatWorkshopMoney(alternative.selectedCost, quote.currency)}
                              </TableCell>
                              <TableCell className="text-right font-mono font-semibold">
                                {formatWorkshopMoney(alternative.finalPrice, quote.currency)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : null}

                    {quote.revisions.map((revision) => (
                      <Card key={revision.id} className="gap-4 py-4 shadow-none">
                        <CardHeader>
                          <CardTitle>
                            {WORKSHOP_OPERATIONS_TEXT.revisionPrefix} {revision.number}
                          </CardTitle>
                          <CardDescription>
                            {WORKSHOP_OPERATIONS_TEXT.sentAtPrefix} {formatWorkshopDate(revision.sentAt)} ·{" "}
                            {WORKSHOP_OPERATIONS_TEXT.validUntilPrefix} {formatWorkshopDate(revision.validUntil)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{WORKSHOP_OPERATIONS_TEXT.alternativeDescriptionLabel}</TableHead>
                                <TableHead className="text-right">
                                  {WORKSHOP_OPERATIONS_TEXT.selectedCostLabel}
                                </TableHead>
                                <TableHead className="text-right">{WORKSHOP_OPERATIONS_TEXT.finalPriceLabel}</TableHead>
                                <TableHead className="text-right">
                                  {WORKSHOP_OPERATIONS_TEXT.estimatedProfitLabel}
                                </TableHead>
                                <TableHead className="text-right">{WORKSHOP_OPERATIONS_TEXT.actionsColumn}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {revision.alternatives.map((alternative) => {
                                const isAccepted = quote.acceptedRevisionAlternativeId === alternative.id;
                                const acceptKey = `accept-${alternative.id}`;
                                const canAccept = revision.id === latestRevision?.id && quote.displayStatus === "SENT";
                                return (
                                  <TableRow key={alternative.id}>
                                    <TableCell>
                                      <div className="flex min-w-52 flex-col gap-1">
                                        <strong>{alternative.description}</strong>
                                        <span className="text-xs text-muted-foreground">{alternative.supplier}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      {formatWorkshopMoney(alternative.selectedCost, revision.currency)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-semibold">
                                      {formatWorkshopMoney(alternative.finalPrice, revision.currency)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      {formatWorkshopMoney(alternative.estimatedProfit, revision.currency)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {isAccepted ? (
                                        <Badge>
                                          <Check />
                                          {WORKSHOP_OPERATIONS_TEXT.acceptedBadge}
                                        </Badge>
                                      ) : canAccept ? (
                                        <Button
                                          size="sm"
                                          disabled={pendingAction === acceptKey}
                                          onClick={() =>
                                            runAction(
                                              acceptKey,
                                              () =>
                                                acceptWorkshopQuoteAlternative(quote.id, {
                                                  revisionAlternativeId: alternative.id,
                                                }),
                                              WORKSHOP_OPERATIONS_TEXT.alternativeAccepted
                                            )
                                          }
                                        >
                                          {pendingAction === acceptKey ? (
                                            <LoaderCircle data-icon="inline-start" className="animate-spin" />
                                          ) : (
                                            <Check data-icon="inline-start" />
                                          )}
                                          {pendingAction === acceptKey
                                            ? WORKSHOP_OPERATIONS_TEXT.acceptingAlternativeAction
                                            : WORKSHOP_OPERATIONS_TEXT.acceptAlternativeAction}
                                        </Button>
                                      ) : null}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                  <CardFooter className="flex-wrap gap-2">
                    {quote.status === "DRAFT" ? (
                      <>
                        <Button variant="outline" onClick={() => setEditingQuote(quote)}>
                          <FilePenLine data-icon="inline-start" />
                          {WORKSHOP_OPERATIONS_TEXT.editDraftAction}
                        </Button>
                        <Button
                          disabled={pendingAction === sendKey}
                          onClick={() =>
                            runAction(
                              sendKey,
                              () => sendWorkshopQuoteRevision(quote.id),
                              WORKSHOP_OPERATIONS_TEXT.revisionSent
                            )
                          }
                        >
                          {pendingAction === sendKey ? (
                            <LoaderCircle data-icon="inline-start" className="animate-spin" />
                          ) : (
                            <Send data-icon="inline-start" />
                          )}
                          {pendingAction === sendKey
                            ? WORKSHOP_OPERATIONS_TEXT.sendingRevisionAction
                            : WORKSHOP_OPERATIONS_TEXT.sendRevisionAction}
                        </Button>
                      </>
                    ) : null}
                    {latestRevision ? (
                      <Button variant="outline" onClick={() => copyMessage(quote)}>
                        <ClipboardCopy data-icon="inline-start" />
                        {WORKSHOP_OPERATIONS_TEXT.copyWhatsappAction}
                      </Button>
                    ) : null}
                    {quote.status === "SENT" ? (
                      <Button
                        variant="outline"
                        disabled={pendingAction === prepareKey}
                        onClick={() =>
                          runAction(
                            prepareKey,
                            () => prepareWorkshopQuoteRevision(quote.id),
                            WORKSHOP_OPERATIONS_TEXT.draftUpdated,
                            true
                          )
                        }
                      >
                        {pendingAction === prepareKey ? (
                          <LoaderCircle data-icon="inline-start" className="animate-spin" />
                        ) : (
                          <RotateCcw data-icon="inline-start" />
                        )}
                        {pendingAction === prepareKey
                          ? WORKSHOP_OPERATIONS_TEXT.preparingRevisionAction
                          : WORKSHOP_OPERATIONS_TEXT.prepareRevisionAction}
                      </Button>
                    ) : null}
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <Empty className="min-h-72 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>{WORKSHOP_OPERATIONS_TEXT.emptyQuotes}</EmptyTitle>
                <EmptyDescription>{WORKSHOP_OPERATIONS_TEXT.quoteBuilderDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
