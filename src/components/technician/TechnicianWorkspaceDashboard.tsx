"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MetricCard } from "@/components/common/MetricCard";
import { QuoteManager } from "@/components/technician/QuoteManager";
import { RepairManager } from "@/components/technician/RepairManager";
import { TechnicianCatalogPanel } from "@/components/technician/TechnicianCatalogPanel";
import { WorkshopCustomerManager } from "@/components/technician/WorkshopCustomerManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TECHNICIAN_ROUTES, TECHNICIAN_SUBSCRIPTION_LABELS, TECHNICIAN_TEXT } from "@/constants/technician.constant";
import { REPAIR_TEXT } from "@/constants/repairOperations.constant";
import {
  QUOTE_STATUS_LABELS,
  WORKSHOP_OPERATIONS_TABS,
  WORKSHOP_OPERATIONS_TEXT,
} from "@/constants/workshopOperations.constant";
import { TechnicianCatalogResult } from "@/interfaces/catalog.interface";
import { TechnicianWorkspaceSummary } from "@/interfaces/technician.interface";
import { RepairSummary } from "@/interfaces/repairOperations.interface";
import { QuoteSummary, WorkshopCustomerSummary } from "@/interfaces/workshopOperations.interface";
import { logoutAccess } from "@/services/access.service";
import { clientErrorHandler } from "@/utils/handlers/clientError.handler";
import { formatWorkshopDate } from "@/utils/workshopOperations.util";

interface TechnicianWorkspaceDashboardProps {
  workspace: TechnicianWorkspaceSummary;
  initialCatalog: TechnicianCatalogResult;
  initialCustomers: WorkshopCustomerSummary[];
  initialQuotes: QuoteSummary[];
  initialRepairs: RepairSummary[];
}

export function TechnicianWorkspaceDashboard({
  workspace,
  initialCatalog,
  initialCustomers,
  initialQuotes,
  initialRepairs,
}: TechnicianWorkspaceDashboardProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [repairs, setRepairs] = useState(initialRepairs);

  const handleLogout = async () => {
    try {
      await logoutAccess();
      router.replace(TECHNICIAN_ROUTES.login);
      router.refresh();
    } catch (error) {
      clientErrorHandler(error);
    }
  };

  const addCustomer = (customer: WorkshopCustomerSummary) => {
    setCustomers((currentCustomers) => [customer, ...currentCustomers]);
  };

  const updateCustomer = (customer: WorkshopCustomerSummary) => {
    setCustomers((currentCustomers) =>
      currentCustomers.map((currentCustomer) => (currentCustomer.id === customer.id ? customer : currentCustomer))
    );
  };

  const addQuote = (quote: QuoteSummary) => {
    setQuotes((currentQuotes) => [quote, ...currentQuotes]);
    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === quote.customer.id ? { ...customer, quoteCount: customer.quoteCount + 1 } : customer
      )
    );
  };

  const updateQuote = (quote: QuoteSummary) => {
    const previousQuote = quotes.find((currentQuote) => currentQuote.id === quote.id);
    setQuotes((currentQuotes) =>
      currentQuotes.map((currentQuote) => (currentQuote.id === quote.id ? quote : currentQuote))
    );
    if (previousQuote && previousQuote.customer.id !== quote.customer.id) {
      setCustomers((currentCustomers) =>
        currentCustomers.map((customer) => {
          if (customer.id === previousQuote.customer.id) {
            return { ...customer, quoteCount: Math.max(0, customer.quoteCount - 1) };
          }
          if (customer.id === quote.customer.id) {
            return { ...customer, quoteCount: customer.quoteCount + 1 };
          }
          return customer;
        })
      );
    }
  };

  const addRepair = (repair: RepairSummary) => {
    setRepairs((currentRepairs) => [repair, ...currentRepairs]);
    setQuotes((currentQuotes) =>
      currentQuotes.map((quote) => (quote.id === repair.quote.id ? { ...quote, repairId: repair.id } : quote))
    );
  };

  const updateRepair = (repair: RepairSummary) => {
    setRepairs((currentRepairs) =>
      currentRepairs.map((currentRepair) => (currentRepair.id === repair.id ? repair : currentRepair))
    );
  };

  const pendingQuotes = quotes.filter((quote) => quote.displayStatus === "SENT").length;
  const acceptedQuotes = quotes.filter((quote) => quote.status === "ACCEPTED").length;
  const activeRepairs = repairs.filter(
    (repair) => repair.status !== "DELIVERED" && repair.status !== "CANCELLED"
  ).length;
  const repairAlerts = repairs.filter((repair) => repair.alert).length;

  return (
    <main className="technician-workspace-grid min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <header className="overflow-hidden rounded-2xl border bg-inverse text-inverse-foreground shadow-xl">
          <div className="safety-rule h-2" />
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
            <div className="flex max-w-4xl flex-col gap-3">
              <Badge variant="secondary" className="w-fit rounded-sm font-mono tracking-[0.14em]">
                <ShieldCheck />
                {TECHNICIAN_TEXT.dashboardEyebrow}
              </Badge>
              <div>
                <h1 className="font-display text-5xl font-bold uppercase leading-none sm:text-6xl">{workspace.name}</h1>
                <p className="mt-3 max-w-2xl text-inverse-foreground/65">{WORKSHOP_OPERATIONS_TEXT.overviewDescription}</p>
                <p className="mt-2 font-mono text-xs text-inverse-foreground/45">{workspace.slug}</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Badge variant="secondary">{workspace.plan.name}</Badge>
                <Badge variant="secondary">{TECHNICIAN_SUBSCRIPTION_LABELS[workspace.subscriptionStatus]}</Badge>
              </div>
              <div className="text-left lg:text-right">
                <p className="font-semibold">{workspace.technician.displayName}</p>
                <p className="font-mono text-xs text-inverse-foreground/55">@{workspace.technician.username}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut data-icon="inline-start" />
                {TECHNICIAN_TEXT.logoutAction}
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard label={WORKSHOP_OPERATIONS_TEXT.customersMetric} value={customers.length} icon={UsersRound} />
          <MetricCard label={WORKSHOP_OPERATIONS_TEXT.quotesMetric} value={quotes.length} icon={ReceiptText} />
          <MetricCard label={WORKSHOP_OPERATIONS_TEXT.pendingQuotesMetric} value={pendingQuotes} icon={Clock3} />
          <MetricCard
            label={WORKSHOP_OPERATIONS_TEXT.acceptedQuotesMetric}
            value={acceptedQuotes}
            icon={CheckCircle2}
          />
          <MetricCard label={REPAIR_TEXT.activeMetric} value={activeRepairs} icon={Wrench} />
          <MetricCard label={REPAIR_TEXT.alertsMetric} value={repairAlerts} icon={AlertTriangle} />
        </section>

        <Tabs defaultValue={WORKSHOP_OPERATIONS_TABS.overview} className="gap-6">
          <TabsList className="h-auto w-full justify-start overflow-x-auto p-1" variant="line">
            <TabsTrigger value={WORKSHOP_OPERATIONS_TABS.overview}>
              <LayoutDashboard />
              {WORKSHOP_OPERATIONS_TEXT.overviewTab}
            </TabsTrigger>
            <TabsTrigger value={WORKSHOP_OPERATIONS_TABS.customers}>
              <UsersRound />
              {WORKSHOP_OPERATIONS_TEXT.customersTab}
            </TabsTrigger>
            <TabsTrigger value={WORKSHOP_OPERATIONS_TABS.quotes}>
              <FileText />
              {WORKSHOP_OPERATIONS_TEXT.quotesTab}
            </TabsTrigger>
            <TabsTrigger value={WORKSHOP_OPERATIONS_TABS.repairs}>
              <Wrench />
              {REPAIR_TEXT.tab}
            </TabsTrigger>
            <TabsTrigger value={WORKSHOP_OPERATIONS_TABS.catalog}>
              <PackageSearch />
              {WORKSHOP_OPERATIONS_TEXT.catalogTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={WORKSHOP_OPERATIONS_TABS.overview}>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="font-display text-3xl uppercase tracking-wide">
                  {WORKSHOP_OPERATIONS_TEXT.latestActivityTitle}
                </CardTitle>
                <CardDescription>{WORKSHOP_OPERATIONS_TEXT.latestActivityDescription}</CardDescription>
                <CardAction>
                  <Badge variant="outline">{WORKSHOP_OPERATIONS_TEXT.workshopReadyBadge}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                {quotes.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{WORKSHOP_OPERATIONS_TEXT.quoteNumberPrefix}</TableHead>
                        <TableHead>{WORKSHOP_OPERATIONS_TEXT.customerNameLabel}</TableHead>
                        <TableHead>{WORKSHOP_OPERATIONS_TEXT.deviceModelLabel}</TableHead>
                        <TableHead>{WORKSHOP_OPERATIONS_TEXT.sentAtPrefix}</TableHead>
                        <TableHead className="text-right">{WORKSHOP_OPERATIONS_TEXT.actionsColumn}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotes.slice(0, 8).map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-mono">#{String(quote.number).padStart(4, "0")}</TableCell>
                          <TableCell>{quote.customer.fullName}</TableCell>
                          <TableCell>
                            {quote.device.brand} {quote.device.model}
                          </TableCell>
                          <TableCell>{formatWorkshopDate(quote.updatedAt)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{QUOTE_STATUS_LABELS[quote.displayStatus]}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Empty className="min-h-72 border">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileText />
                      </EmptyMedia>
                      <EmptyTitle>{WORKSHOP_OPERATIONS_TEXT.noActivityTitle}</EmptyTitle>
                      <EmptyDescription>{WORKSHOP_OPERATIONS_TEXT.noActivityDescription}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={WORKSHOP_OPERATIONS_TABS.customers}>
            <WorkshopCustomerManager customers={customers} onCreated={addCustomer} onUpdated={updateCustomer} />
          </TabsContent>

          <TabsContent value={WORKSHOP_OPERATIONS_TABS.quotes}>
            <QuoteManager
              customers={customers}
              quotes={quotes}
              initialCatalog={initialCatalog}
              onCreated={addQuote}
              onUpdated={updateQuote}
            />
          </TabsContent>

          <TabsContent value={WORKSHOP_OPERATIONS_TABS.repairs}>
            <RepairManager quotes={quotes} repairs={repairs} onCreated={addRepair} onUpdated={updateRepair} />
          </TabsContent>

          <TabsContent value={WORKSHOP_OPERATIONS_TABS.catalog}>
            <TechnicianCatalogPanel initialCatalog={initialCatalog} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
