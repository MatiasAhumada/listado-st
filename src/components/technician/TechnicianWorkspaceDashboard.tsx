"use client";

import {
  BellRing,
  ContactRound,
  FileText,
  LogOut,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MetricCard } from "@/components/common/MetricCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
  TECHNICIAN_EMPTY_METRIC_VALUE,
  TECHNICIAN_ROUTES,
  TECHNICIAN_SUBSCRIPTION_LABELS,
  TECHNICIAN_TEXT,
} from "@/constants/technician.constant";
import { TechnicianWorkspaceSummary } from "@/interfaces/technician.interface";
import { logoutTechnician } from "@/services/technician.service";
import { clientErrorHandler } from "@/utils/handlers/clientError.handler";

interface TechnicianWorkspaceDashboardProps {
  workspace: TechnicianWorkspaceSummary;
}

const roadmapItems = [
  {
    title: TECHNICIAN_TEXT.customersTitle,
    description: TECHNICIAN_TEXT.customersDescription,
    icon: ContactRound,
  },
  {
    title: TECHNICIAN_TEXT.quotesTitle,
    description: TECHNICIAN_TEXT.quotesDescription,
    icon: FileText,
  },
  {
    title: TECHNICIAN_TEXT.repairsTitle,
    description: TECHNICIAN_TEXT.repairsDescription,
    icon: Wrench,
  },
];

export function TechnicianWorkspaceDashboard({
  workspace,
}: TechnicianWorkspaceDashboardProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutTechnician();
      router.replace(TECHNICIAN_ROUTES.login);
      router.refresh();
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  return (
    <main className="technician-workspace-grid min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <header className="overflow-hidden rounded-2xl border bg-foreground text-background shadow-xl">
          <div className="safety-rule h-2" />
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
            <div className="flex max-w-4xl flex-col gap-3">
              <Badge variant="secondary" className="w-fit rounded-sm font-mono tracking-[0.14em]">
                <ShieldCheck />
                {TECHNICIAN_TEXT.dashboardEyebrow}
              </Badge>
              <div>
                <h1 className="font-display text-5xl font-bold uppercase leading-none sm:text-6xl">
                  {workspace.name}
                </h1>
                <p className="mt-3 max-w-2xl text-background/65">
                  {TECHNICIAN_TEXT.dashboardDescription}
                </p>
                <p className="mt-2 font-mono text-xs text-background/45">{workspace.slug}</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <Badge variant="secondary">
                {TECHNICIAN_SUBSCRIPTION_LABELS[workspace.subscriptionStatus]}
              </Badge>
              <div className="text-left lg:text-right">
                <p className="font-semibold">{workspace.technician.displayName}</p>
                <p className="font-mono text-xs text-background/55">
                  {workspace.technician.email}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut data-icon="inline-start" />
                {TECHNICIAN_TEXT.logoutAction}
              </Button>
            </div>
          </div>
        </header>

        <Alert className="border-secondary bg-secondary/15">
          <ShieldCheck />
          <AlertTitle>{TECHNICIAN_TEXT.accessReadyTitle}</AlertTitle>
          <AlertDescription>{TECHNICIAN_TEXT.accessReadyDescription}</AlertDescription>
        </Alert>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={TECHNICIAN_TEXT.customersMetric}
            value={TECHNICIAN_EMPTY_METRIC_VALUE}
            icon={UsersRound}
          />
          <MetricCard
            label={TECHNICIAN_TEXT.quotesMetric}
            value={TECHNICIAN_EMPTY_METRIC_VALUE}
            icon={ReceiptText}
          />
          <MetricCard
            label={TECHNICIAN_TEXT.repairsMetric}
            value={TECHNICIAN_EMPTY_METRIC_VALUE}
            icon={Smartphone}
          />
          <MetricCard
            label={TECHNICIAN_TEXT.alertsMetric}
            value={TECHNICIAN_EMPTY_METRIC_VALUE}
            icon={BellRing}
          />
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <Card className="border-foreground/15 bg-card/95 shadow-lg">
            <CardHeader>
              <CardTitle className="font-display text-3xl uppercase tracking-wide">
                {TECHNICIAN_TEXT.foundationTitle}
              </CardTitle>
              <CardDescription>{TECHNICIAN_TEXT.foundationDescription}</CardDescription>
              <CardAction>
                <Badge variant="outline">{TECHNICIAN_TEXT.planLabel}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Empty className="min-h-72 border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Wrench />
                  </EmptyMedia>
                  <EmptyTitle>{TECHNICIAN_TEXT.nextFlowTitle}</EmptyTitle>
                  <EmptyDescription>
                    {TECHNICIAN_TEXT.nextFlowDescription}
                  </EmptyDescription>
                </EmptyHeader>
                <Badge variant="secondary">{TECHNICIAN_TEXT.nextBlockBadge}</Badge>
              </Empty>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            {roadmapItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-foreground/15 bg-card/95 shadow-md">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl uppercase tracking-wide">
                      {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                    <CardAction>
                      <Icon />
                    </CardAction>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
