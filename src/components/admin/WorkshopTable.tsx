"use client";

import { LoaderCircle, Power, PowerOff } from "lucide-react";
import { WorkshopPlanAssignment } from "@/components/admin/WorkshopPlanAssignment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PLATFORM_ADMIN_TEXT,
  SUBSCRIPTION_STATUS_LABELS,
  WORKSHOP_STATUS_LABELS,
} from "@/constants/platformAdmin.constant";
import { WorkshopSummary } from "@/interfaces/platformAdmin.interface";
import { SaasPlanSummary } from "@/interfaces/saasPlan.interface";
import { WorkshopStatusCode } from "@/types/platformAdmin.types";
import { formatPlatformAdminDate } from "@/utils/platformAdmin.util";
import { formatSaasPlanPrice } from "@/utils/saasPlan.util";
import { SAAS_PLAN_BILLING_LABELS } from "@/constants/saasPlan.constant";

interface WorkshopTableProps {
  workshops: WorkshopSummary[];
  plans: SaasPlanSummary[];
  pendingWorkshopId?: string;
  onStatusChange: (workshopId: string, status: WorkshopStatusCode) => void;
  onPlanUpdated: (workshop: WorkshopSummary) => void;
}

function getSubscriptionBadgeVariant(status: WorkshopSummary["subscriptionStatus"]) {
  if (status === "SUSPENDED") return "destructive" as const;
  if (status === "ACTIVE") return "default" as const;
  if (status === "TRIAL") return "secondary" as const;
  return "outline" as const;
}

export function WorkshopTable({
  workshops,
  plans,
  pendingWorkshopId,
  onStatusChange,
  onPlanUpdated,
}: WorkshopTableProps) {
  return (
    <Table>
      <TableCaption>{
        workshops.length ? PLATFORM_ADMIN_TEXT.listDescription : PLATFORM_ADMIN_TEXT.emptyWorkshops
      }</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{PLATFORM_ADMIN_TEXT.workshopColumn}</TableHead>
          <TableHead>{PLATFORM_ADMIN_TEXT.ownerColumn}</TableHead>
          <TableHead>{PLATFORM_ADMIN_TEXT.planColumn}</TableHead>
          <TableHead>{PLATFORM_ADMIN_TEXT.agreedPriceColumn}</TableHead>
          <TableHead>{PLATFORM_ADMIN_TEXT.subscriptionColumn}</TableHead>
          <TableHead>{PLATFORM_ADMIN_TEXT.accessColumn}</TableHead>
          <TableHead>{PLATFORM_ADMIN_TEXT.createdColumn}</TableHead>
          <TableHead className="text-right">{PLATFORM_ADMIN_TEXT.actionsColumn}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workshops.map((workshop) => {
          const isSuspended = workshop.status === "SUSPENDED";
          const isPending = pendingWorkshopId === workshop.id;
          const nextStatus: WorkshopStatusCode = isSuspended ? "ACTIVE" : "SUSPENDED";

          return (
            <TableRow key={workshop.id}>
              <TableCell>
                <div className="flex min-w-48 flex-col gap-1">
                  <strong>{workshop.name}</strong>
                  <span className="font-mono text-xs text-muted-foreground">{workshop.slug}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex min-w-48 flex-col gap-1">
                  <span>{workshop.owner.displayName}</span>
                  <span className="font-mono text-xs text-muted-foreground">@{workshop.owner.username}</span>
                </div>
              </TableCell>
              <TableCell>
                <WorkshopPlanAssignment
                  key={`${workshop.plan.id}-${workshop.agreedPrice}`}
                  workshop={workshop}
                  plans={plans}
                  onUpdated={onPlanUpdated}
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-40 flex-col gap-1">
                  <strong>{formatSaasPlanPrice(workshop.agreedPrice, workshop.currency)}</strong>
                  <span className="text-xs text-muted-foreground">
                    {SAAS_PLAN_BILLING_LABELS[workshop.billingPeriod]}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getSubscriptionBadgeVariant(workshop.subscriptionStatus)}>
                  {SUBSCRIPTION_STATUS_LABELS[workshop.subscriptionStatus]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={isSuspended ? "destructive" : "outline"}>
                  {WORKSHOP_STATUS_LABELS[workshop.status]}
                </Badge>
              </TableCell>
              <TableCell>{formatPlatformAdminDate(workshop.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={isSuspended ? "default" : "outline"}
                  disabled={isPending}
                  onClick={() => onStatusChange(workshop.id, nextStatus)}
                >
                  {isPending ? (
                    <LoaderCircle data-icon="inline-start" className="animate-spin" />
                  ) : isSuspended ? (
                    <Power data-icon="inline-start" />
                  ) : (
                    <PowerOff data-icon="inline-start" />
                  )}
                  {isSuspended ? PLATFORM_ADMIN_TEXT.activateAction : PLATFORM_ADMIN_TEXT.suspendAction}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
