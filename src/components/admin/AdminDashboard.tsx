"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ClipboardCopy,
  LogOut,
  PackageSearch,
  RefreshCcw,
  ShieldCheck,
  Store,
  TimerReset,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateWorkshopForm } from "@/components/admin/CreateWorkshopForm";
import { AdminCatalogManager } from "@/components/admin/AdminCatalogManager";
import { WorkshopTable } from "@/components/admin/WorkshopTable";
import { MetricCard } from "@/components/common/MetricCard";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATALOG_TABS, CATALOG_TEXT } from "@/constants/catalog.constant";
import {
  PLATFORM_ADMIN_ROUTES,
  PLATFORM_ADMIN_TEXT,
} from "@/constants/platformAdmin.constant";
import {
  CreatedWorkshopCredentials,
  PlatformAdminIdentity,
  WorkshopSummary,
} from "@/interfaces/platformAdmin.interface";
import { CatalogAdminDashboard } from "@/interfaces/catalog.interface";
import {
  getPlatformWorkshops,
  logoutPlatformAdmin,
  updatePlatformWorkshopStatus,
} from "@/services/platformAdmin.service";
import { WorkshopStatusCode } from "@/types/platformAdmin.types";
import {
  clientErrorHandler,
  clientSuccessHandler,
} from "@/utils/handlers/clientError.handler";
import { buildTechnicianCredentialsMessage } from "@/utils/platformAdmin.util";

interface AdminDashboardProps {
  admin: PlatformAdminIdentity;
  initialWorkshops: WorkshopSummary[];
  initialCatalog: CatalogAdminDashboard;
}

export function AdminDashboard({
  admin,
  initialWorkshops,
  initialCatalog,
}: AdminDashboardProps) {
  const router = useRouter();
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [pendingWorkshopId, setPendingWorkshopId] = useState<string>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCreatedCredentials, setLastCreatedCredentials] =
    useState<CreatedWorkshopCredentials>();

  const metrics = useMemo(
    () => ({
      total: workshops.length,
      active: workshops.filter((workshop) => workshop.status === "ACTIVE").length,
      trial: workshops.filter((workshop) => workshop.subscriptionStatus === "TRIAL").length,
      suspended: workshops.filter((workshop) => workshop.status === "SUSPENDED").length,
    }),
    [workshops]
  );

  const handleCreated = (
    workshop: WorkshopSummary,
    credentials: CreatedWorkshopCredentials
  ) => {
    setWorkshops((currentWorkshops) => [workshop, ...currentWorkshops]);
    setLastCreatedCredentials(credentials);
  };

  const handleStatusChange = async (workshopId: string, status: WorkshopStatusCode) => {
    setPendingWorkshopId(workshopId);
    try {
      const updatedWorkshop = await updatePlatformWorkshopStatus(workshopId, { status });
      setWorkshops((currentWorkshops) =>
        currentWorkshops.map((workshop) =>
          workshop.id === updatedWorkshop.id ? updatedWorkshop : workshop
        )
      );
      clientSuccessHandler(
        status === "ACTIVE"
          ? PLATFORM_ADMIN_TEXT.workshopActivated
          : PLATFORM_ADMIN_TEXT.workshopSuspended
      );
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setPendingWorkshopId(undefined);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setWorkshops(await getPlatformWorkshops());
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutPlatformAdmin();
      router.replace(PLATFORM_ADMIN_ROUTES.login);
      router.refresh();
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  const copyCredentials = async () => {
    if (!lastCreatedCredentials) return;
    await navigator.clipboard.writeText(buildTechnicianCredentialsMessage(lastCreatedCredentials));
    clientSuccessHandler(PLATFORM_ADMIN_TEXT.credentialsCopied);
  };

  return (
    <main className="admin-console-grid min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <header className="overflow-hidden rounded-2xl border bg-foreground text-background shadow-xl">
          <div className="safety-rule h-2" />
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
            <div className="flex max-w-4xl flex-col gap-3">
              <Badge variant="secondary" className="w-fit rounded-sm font-mono tracking-[0.14em]">
                <ShieldCheck />
                {PLATFORM_ADMIN_TEXT.consoleEyebrow}
              </Badge>
              <div>
                <h1 className="font-display text-5xl font-bold uppercase leading-none sm:text-6xl">
                  {PLATFORM_ADMIN_TEXT.dashboardTitle}
                </h1>
                <p className="mt-3 max-w-2xl text-background/65">
                  {PLATFORM_ADMIN_TEXT.dashboardDescription}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="text-left lg:text-right">
                <p className="font-semibold">{admin.displayName}</p>
                <p className="font-mono text-xs text-background/55">{admin.email}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut data-icon="inline-start" />
                {PLATFORM_ADMIN_TEXT.logoutAction}
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={PLATFORM_ADMIN_TEXT.totalWorkshopsMetric} value={metrics.total} icon={Store} />
          <MetricCard label={PLATFORM_ADMIN_TEXT.activeWorkshopsMetric} value={metrics.active} icon={Activity} />
          <MetricCard label={PLATFORM_ADMIN_TEXT.trialWorkshopsMetric} value={metrics.trial} icon={TimerReset} />
          <MetricCard
            label={PLATFORM_ADMIN_TEXT.suspendedWorkshopsMetric}
            value={metrics.suspended}
            icon={UsersRound}
          />
        </section>

        <Tabs defaultValue={CATALOG_TABS.workshops}>
          <TabsList variant="line">
            <TabsTrigger value={CATALOG_TABS.workshops}>
              <Store />
              {CATALOG_TEXT.tabWorkshops}
            </TabsTrigger>
            <TabsTrigger value={CATALOG_TABS.catalog}>
              <PackageSearch />
              {CATALOG_TEXT.tabCatalog}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={CATALOG_TABS.workshops}>
            <section className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.65fr)]">
              <div className="flex flex-col gap-6 xl:sticky xl:top-6">
                <Card className="border-foreground/15 bg-card/95 shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl uppercase tracking-wide">
                      {PLATFORM_ADMIN_TEXT.createTitle}
                    </CardTitle>
                    <CardDescription>{PLATFORM_ADMIN_TEXT.createDescription}</CardDescription>
                    <CardAction>
                      <Badge variant="outline">{PLATFORM_ADMIN_TEXT.planSoloLabel}</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <CreateWorkshopForm onCreated={handleCreated} />
                  </CardContent>
                </Card>

                {lastCreatedCredentials ? (
                  <Card className="border-secondary bg-secondary/15 shadow-lg">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl uppercase tracking-wide">
                        {PLATFORM_ADMIN_TEXT.credentialsTitle}
                      </CardTitle>
                      <CardDescription>
                        {PLATFORM_ADMIN_TEXT.credentialsDescription}
                      </CardDescription>
                      <CardAction>
                        <ShieldCheck />
                      </CardAction>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 font-mono text-sm">
                      <p>{lastCreatedCredentials.workshopName}</p>
                      <p>{lastCreatedCredentials.ownerEmail}</p>
                      <p className="rounded-md border bg-background p-3 font-semibold">
                        {lastCreatedCredentials.ownerPassword}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="secondary" className="w-full" onClick={copyCredentials}>
                        <ClipboardCopy data-icon="inline-start" />
                        {PLATFORM_ADMIN_TEXT.copyCredentialsAction}
                      </Button>
                    </CardFooter>
                  </Card>
                ) : null}
              </div>

              <Card className="min-w-0 border-foreground/15 bg-card/95 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-display text-2xl uppercase tracking-wide">
                    {PLATFORM_ADMIN_TEXT.listTitle}
                  </CardTitle>
                  <CardDescription>{PLATFORM_ADMIN_TEXT.listDescription}</CardDescription>
                  <CardAction>
                    <Button variant="outline" size="sm" disabled={isRefreshing} onClick={handleRefresh}>
                      <RefreshCcw
                        data-icon="inline-start"
                        className={isRefreshing ? "animate-spin" : undefined}
                      />
                      {isRefreshing ? PLATFORM_ADMIN_TEXT.loadingWorkshops : PLATFORM_ADMIN_TEXT.refreshAction}
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="min-w-0">
                  <WorkshopTable
                    workshops={workshops}
                    pendingWorkshopId={pendingWorkshopId}
                    onStatusChange={handleStatusChange}
                  />
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value={CATALOG_TABS.catalog}>
            <AdminCatalogManager initialDashboard={initialCatalog} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
