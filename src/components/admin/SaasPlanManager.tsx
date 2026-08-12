"use client";

import { useState } from "react";
import { BadgeDollarSign, Pencil } from "lucide-react";
import { SaasPlanForm } from "@/components/admin/SaasPlanForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SAAS_PLAN_BILLING_LABELS,
  SAAS_PLAN_TEXT,
} from "@/constants/saasPlan.constant";
import { SaasPlanSummary } from "@/interfaces/saasPlan.interface";
import { formatSaasPlanPrice } from "@/utils/saasPlan.util";

interface SaasPlanManagerProps {
  plans: SaasPlanSummary[];
  onCreated: (plan: SaasPlanSummary) => void;
  onUpdated: (plan: SaasPlanSummary) => void;
}

export function SaasPlanManager({ plans, onCreated, onUpdated }: SaasPlanManagerProps) {
  const [editingPlan, setEditingPlan] = useState<SaasPlanSummary>();

  const handleSaved = (plan: SaasPlanSummary) => {
    if (editingPlan) {
      onUpdated(plan);
      setEditingPlan(undefined);
      return;
    }
    onCreated(plan);
  };

  return (
    <section className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.65fr)]">
      <Card variant="elevated" className="xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {editingPlan ? SAAS_PLAN_TEXT.editTitle : SAAS_PLAN_TEXT.createTitle}
          </CardTitle>
          <CardDescription>
            {editingPlan
              ? SAAS_PLAN_TEXT.editDescription
              : SAAS_PLAN_TEXT.createDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SaasPlanForm
            key={editingPlan?.id ?? "new-plan"}
            plan={editingPlan}
            onSaved={handleSaved}
            onCancel={editingPlan ? () => setEditingPlan(undefined) : undefined}
          />
        </CardContent>
      </Card>

      <Card variant="elevated" className="min-w-0">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {SAAS_PLAN_TEXT.listTitle}
          </CardTitle>
          <CardDescription>{SAAS_PLAN_TEXT.listDescription}</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          {plans.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{SAAS_PLAN_TEXT.planColumn}</TableHead>
                  <TableHead>{SAAS_PLAN_TEXT.priceColumn}</TableHead>
                  <TableHead>{SAAS_PLAN_TEXT.periodColumn}</TableHead>
                  <TableHead>{SAAS_PLAN_TEXT.subscriptionsColumn}</TableHead>
                  <TableHead>{SAAS_PLAN_TEXT.statusColumn}</TableHead>
                  <TableHead className="text-right">{SAAS_PLAN_TEXT.actionsColumn}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex min-w-52 flex-col gap-1">
                        <strong>{plan.name}</strong>
                        <span className="font-mono text-xs text-muted-foreground">
                          {plan.code}
                        </span>
                        {plan.description ? (
                          <span className="text-xs text-muted-foreground">{plan.description}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{formatSaasPlanPrice(plan.billingPrice, plan.currency)}</TableCell>
                    <TableCell>{SAAS_PLAN_BILLING_LABELS[plan.billingPeriod]}</TableCell>
                    <TableCell>{plan.subscriptionCount}</TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? "default" : "outline"}>
                        {plan.isActive
                          ? SAAS_PLAN_TEXT.activeStatus
                          : SAAS_PLAN_TEXT.inactiveStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setEditingPlan(plan)}>
                        <Pencil data-icon="inline-start" />
                        {SAAS_PLAN_TEXT.editAction}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="min-h-72 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BadgeDollarSign />
                </EmptyMedia>
                <EmptyTitle>{SAAS_PLAN_TEXT.emptyPlans}</EmptyTitle>
                <EmptyDescription>{SAAS_PLAN_TEXT.createDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
