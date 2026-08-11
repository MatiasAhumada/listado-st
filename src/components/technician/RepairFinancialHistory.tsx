"use client";

import { useState } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  REPAIR_EXPENSE_KIND_LABELS,
  REPAIR_PAYMENT_KIND_LABELS,
  REPAIR_TEXT,
} from "@/constants/repairOperations.constant";
import { RepairSummary } from "@/interfaces/repairOperations.interface";
import { reverseWorkshopRepairExpense, reverseWorkshopRepairPayment } from "@/services/repair.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { formatWorkshopDate, formatWorkshopMoney } from "@/utils/workshopOperations.util";

interface RepairFinancialHistoryProps {
  repair: RepairSummary;
  kind: "payments" | "expenses";
  onUpdated: (repair: RepairSummary) => void;
}

export function RepairFinancialHistory({ repair, kind, onUpdated }: RepairFinancialHistoryProps) {
  const [pendingId, setPendingId] = useState<string>();
  const isPayments = kind === "payments";
  const entries = isPayments ? repair.payments : repair.expenses;

  const reverseEntry = async (entryId: string) => {
    setPendingId(entryId);
    try {
      const payload = { note: REPAIR_TEXT.manualReversalNote };
      const updatedRepair = isPayments
        ? await reverseWorkshopRepairPayment(repair.id, entryId, payload)
        : await reverseWorkshopRepairExpense(repair.id, entryId, payload);
      onUpdated(updatedRepair);
      clientSuccessHandler(REPAIR_TEXT.reversalCreated);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setPendingId(undefined);
    }
  };

  if (!entries.length) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        {isPayments ? REPAIR_TEXT.noPayments : REPAIR_TEXT.noExpenses}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{isPayments ? REPAIR_TEXT.paymentKindLabel : REPAIR_TEXT.expenseDescriptionLabel}</TableHead>
          <TableHead>{REPAIR_TEXT.occurredAtLabel}</TableHead>
          <TableHead>{REPAIR_TEXT.recordedByPrefix}</TableHead>
          <TableHead className="text-right">{REPAIR_TEXT.amountLabel}</TableHead>
          <TableHead className="text-right">{REPAIR_TEXT.reverseAction}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPayments
          ? repair.payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="flex min-w-44 flex-col gap-1">
                    <strong>{REPAIR_PAYMENT_KIND_LABELS[payment.kind]}</strong>
                    {payment.note ? <span className="text-xs text-muted-foreground">{payment.note}</span> : null}
                    {payment.adjustedById ? <Badge variant="outline">{REPAIR_TEXT.adjustedBadge}</Badge> : null}
                    {payment.kind === "ADJUSTMENT" ? (
                      <Badge variant="secondary">{REPAIR_TEXT.adjustmentBadge}</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{formatWorkshopDate(payment.occurredAt)}</TableCell>
                <TableCell>{payment.recordedByName}</TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatWorkshopMoney(payment.amount, repair.currency)}
                </TableCell>
                <TableCell className="text-right">
                  {payment.kind !== "ADJUSTMENT" && !payment.adjustedById ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pendingId === payment.id}
                      onClick={() => reverseEntry(payment.id)}
                    >
                      {pendingId === payment.id ? (
                        <LoaderCircle data-icon="inline-start" className="animate-spin" />
                      ) : (
                        <RotateCcw data-icon="inline-start" />
                      )}
                      {pendingId === payment.id ? REPAIR_TEXT.reversingAction : REPAIR_TEXT.reverseAction}
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          : repair.expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <div className="flex min-w-52 flex-col gap-1">
                    <strong>{expense.description}</strong>
                    <span className="text-xs text-muted-foreground">
                      {REPAIR_EXPENSE_KIND_LABELS[expense.kind]}
                      {expense.supplier ? ` · ${expense.supplier}` : ""}
                    </span>
                    {expense.note ? <span className="text-xs text-muted-foreground">{expense.note}</span> : null}
                    {expense.adjustedById ? <Badge variant="outline">{REPAIR_TEXT.adjustedBadge}</Badge> : null}
                    {expense.kind === "ADJUSTMENT" ? (
                      <Badge variant="secondary">{REPAIR_TEXT.adjustmentBadge}</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{formatWorkshopDate(expense.occurredAt)}</TableCell>
                <TableCell>{expense.recordedByName}</TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  {formatWorkshopMoney(expense.amount, repair.currency)}
                </TableCell>
                <TableCell className="text-right">
                  {expense.kind !== "ADJUSTMENT" && !expense.adjustedById ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pendingId === expense.id}
                      onClick={() => reverseEntry(expense.id)}
                    >
                      {pendingId === expense.id ? (
                        <LoaderCircle data-icon="inline-start" className="animate-spin" />
                      ) : (
                        <RotateCcw data-icon="inline-start" />
                      )}
                      {pendingId === expense.id ? REPAIR_TEXT.reversingAction : REPAIR_TEXT.reverseAction}
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
