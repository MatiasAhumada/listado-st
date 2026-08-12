"use client";

import { useState } from "react";
import { AlertTriangle, Banknote, History, Receipt, Smartphone, Wrench } from "lucide-react";
import { RepairExpenseForm } from "@/components/technician/RepairExpenseForm";
import { RepairFinancialHistory } from "@/components/technician/RepairFinancialHistory";
import { RepairIntakeForm } from "@/components/technician/RepairIntakeForm";
import { RepairPaymentForm } from "@/components/technician/RepairPaymentForm";
import { RepairStatusForm } from "@/components/technician/RepairStatusForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REPAIR_STATUS_LABELS, REPAIR_TEXT } from "@/constants/repairOperations.constant";
import { RepairSummary } from "@/interfaces/repairOperations.interface";
import { QuoteSummary } from "@/interfaces/workshopOperations.interface";
import { formatWorkshopDate, formatWorkshopMoney } from "@/utils/workshopOperations.util";

interface RepairManagerProps {
  quotes: QuoteSummary[];
  repairs: RepairSummary[];
  onCreated: (repair: RepairSummary) => void;
  onUpdated: (repair: RepairSummary) => void;
}

const detailTabs = {
  status: "status",
  payments: "payments",
  expenses: "expenses",
  history: "history",
} as const;

function MoneySummary({ label, value, currency }: { label: string; value: string; currency: string }) {
  return (
    <Card className="gap-3 py-4 shadow-none">
      <CardHeader>
        <CardTitle className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <strong className="font-display text-3xl">{formatWorkshopMoney(value, currency)}</strong>
      </CardContent>
    </Card>
  );
}

export function RepairManager({ quotes, repairs, onCreated, onUpdated }: RepairManagerProps) {
  const [selectedRepairId, setSelectedRepairId] = useState(repairs[0]?.id ?? "");
  const selectedRepair = repairs.find((repair) => repair.id === selectedRepairId) ?? repairs[0];

  const handleCreated = (repair: RepairSummary) => {
    onCreated(repair);
    setSelectedRepairId(repair.id);
  };

  return (
    <section className="grid items-start gap-6 2xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.65fr)]">
      <div className="flex flex-col gap-6 2xl:sticky 2xl:top-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase tracking-wide">{REPAIR_TEXT.createTitle}</CardTitle>
            <CardDescription>{REPAIR_TEXT.createDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <RepairIntakeForm quotes={quotes} onCreated={handleCreated} />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase tracking-wide">{REPAIR_TEXT.listTitle}</CardTitle>
            <CardDescription>{REPAIR_TEXT.listDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {repairs.map((repair) => (
              <Button
                key={repair.id}
                variant={selectedRepair?.id === repair.id ? "secondary" : "outline"}
                className="h-auto justify-between gap-3 py-3 text-left"
                aria-pressed={selectedRepair?.id === repair.id}
                onClick={() => setSelectedRepairId(repair.id)}
              >
                <span className="flex min-w-0 flex-col items-start">
                  <strong className="truncate">
                    {repair.customer.fullName} · {repair.device.brand} {repair.device.model}
                  </strong>
                  <span className="font-mono text-xs opacity-70">#{String(repair.quote.number).padStart(4, "0")}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {repair.alert ? <AlertTriangle className="text-destructive" /> : null}
                  <Badge variant="outline">{REPAIR_STATUS_LABELS[repair.status]}</Badge>
                </span>
              </Button>
            ))}
            {!repairs.length ? (
              <Empty className="min-h-60 border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Wrench />
                  </EmptyMedia>
                  <EmptyTitle>{REPAIR_TEXT.emptyTitle}</EmptyTitle>
                  <EmptyDescription>{REPAIR_TEXT.createDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {selectedRepair ? (
        <Card variant="elevated" className="min-w-0">
          <CardHeader>
            <CardTitle className="font-display text-3xl uppercase tracking-wide">
              {selectedRepair.customer.fullName}
            </CardTitle>
            <CardDescription>
              {selectedRepair.device.brand} {selectedRepair.device.model} · {REPAIR_TEXT.receivedPrefix}{" "}
              {formatWorkshopDate(selectedRepair.physicalReceivedAt)}
            </CardDescription>
            <CardAction>
              <Badge>{REPAIR_STATUS_LABELS[selectedRepair.status]}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {selectedRepair.alert ? (
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertTitle>{REPAIR_TEXT.alertBadge}</AlertTitle>
                <AlertDescription>{REPAIR_TEXT.alertDescription}</AlertDescription>
              </Alert>
            ) : null}

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MoneySummary
                label={REPAIR_TEXT.agreedPriceLabel}
                value={selectedRepair.agreedPrice}
                currency={selectedRepair.currency}
              />
              <MoneySummary
                label={REPAIR_TEXT.collectedLabel}
                value={selectedRepair.totals.collected}
                currency={selectedRepair.currency}
              />
              <MoneySummary
                label={REPAIR_TEXT.balanceLabel}
                value={selectedRepair.totals.balance}
                currency={selectedRepair.currency}
              />
              <MoneySummary
                label={REPAIR_TEXT.actualProfitLabel}
                value={selectedRepair.totals.actualProfit}
                currency={selectedRepair.currency}
              />
            </section>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>{selectedRepair.acceptedAlternative.description}</CardTitle>
                <CardDescription>{selectedRepair.quote.reportedIssue}</CardDescription>
                <CardAction>
                  <Smartphone />
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
                <p>
                  <span className="text-muted-foreground">{REPAIR_TEXT.quotedCostLabel}: </span>
                  <strong>{formatWorkshopMoney(selectedRepair.quotedCost, selectedRepair.currency)}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">{REPAIR_TEXT.expensesLabel}: </span>
                  <strong>{formatWorkshopMoney(selectedRepair.totals.expenses, selectedRepair.currency)}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">{REPAIR_TEXT.recordedByPrefix}: </span>
                  <strong>{selectedRepair.createdByName}</strong>
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue={detailTabs.status} className="gap-5">
              <TabsList className="h-auto w-full justify-start overflow-x-auto" variant="line">
                <TabsTrigger value={detailTabs.status}>
                  <Wrench />
                  {REPAIR_TEXT.statusTitle}
                </TabsTrigger>
                <TabsTrigger value={detailTabs.payments}>
                  <Banknote />
                  {REPAIR_TEXT.paymentsTitle}
                </TabsTrigger>
                <TabsTrigger value={detailTabs.expenses}>
                  <Receipt />
                  {REPAIR_TEXT.expensesTitle}
                </TabsTrigger>
                <TabsTrigger value={detailTabs.history}>
                  <History />
                  {REPAIR_TEXT.historyTitle}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={detailTabs.status}>
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>{REPAIR_TEXT.statusTitle}</CardTitle>
                    <CardDescription>{REPAIR_TEXT.statusDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedRepair.allowedNextStatuses.length ? (
                      <RepairStatusForm
                        key={`${selectedRepair.id}-${selectedRepair.status}`}
                        repair={selectedRepair}
                        onUpdated={onUpdated}
                      />
                    ) : (
                      <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        {REPAIR_TEXT.terminalStatusDescription}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value={detailTabs.payments} className="flex flex-col gap-5">
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>{REPAIR_TEXT.paymentsTitle}</CardTitle>
                    <CardDescription>{REPAIR_TEXT.paymentsDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RepairPaymentForm
                      key={`${selectedRepair.id}-${selectedRepair.totals.balance}`}
                      repair={selectedRepair}
                      onUpdated={onUpdated}
                    />
                  </CardContent>
                </Card>
                <RepairFinancialHistory repair={selectedRepair} kind="payments" onUpdated={onUpdated} />
              </TabsContent>

              <TabsContent value={detailTabs.expenses} className="flex flex-col gap-5">
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>{REPAIR_TEXT.expensesTitle}</CardTitle>
                    <CardDescription>{REPAIR_TEXT.expensesDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RepairExpenseForm repair={selectedRepair} onUpdated={onUpdated} />
                  </CardContent>
                </Card>
                <RepairFinancialHistory repair={selectedRepair} kind="expenses" onUpdated={onUpdated} />
              </TabsContent>

              <TabsContent value={detailTabs.history}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{REPAIR_TEXT.nextStatusLabel}</TableHead>
                      <TableHead>{REPAIR_TEXT.occurredAtLabel}</TableHead>
                      <TableHead>{REPAIR_TEXT.recordedByPrefix}</TableHead>
                      <TableHead>{REPAIR_TEXT.statusNoteLabel}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRepair.statusHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge variant="outline">{REPAIR_STATUS_LABELS[entry.status]}</Badge>
                        </TableCell>
                        <TableCell>{formatWorkshopDate(entry.changedAt)}</TableCell>
                        <TableCell>{entry.recordedByName}</TableCell>
                        <TableCell>{entry.note ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
