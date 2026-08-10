"use client";

import { FormEvent, useRef, useState } from "react";
import {
  Ban,
  Boxes,
  FileSearch,
  LoaderCircle,
  PackageCheck,
  PackageOpen,
  Percent,
  Rocket,
  TimerOff,
  Upload,
} from "lucide-react";
import { CatalogPreviewTable } from "@/components/admin/CatalogPreviewTable";
import { CatalogPricingRulesEditor } from "@/components/admin/CatalogPricingRulesEditor";
import { MetricCard } from "@/components/common/MetricCard";
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  CATALOG_DEFAULTS,
  CATALOG_FIELDS,
  CATALOG_LIMITS,
  CATALOG_TEXT,
  CATALOG_WORKBOOK,
} from "@/constants/catalog.constant";
import {
  CatalogAdminDashboard,
  CatalogBatchSummary,
} from "@/interfaces/catalog.interface";
import {
  importPlatformCatalog,
  publishPlatformCatalog,
} from "@/services/platformAdmin.service";
import { formatCatalogDate } from "@/utils/catalog.util";
import {
  clientErrorHandler,
  clientSuccessHandler,
} from "@/utils/handlers/clientError.handler";

interface AdminCatalogManagerProps {
  initialDashboard: CatalogAdminDashboard;
}

function CatalogBatchMetrics({ batch }: { batch: CatalogBatchSummary }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label={CATALOG_TEXT.availableMetric}
        value={batch.availableItems}
        icon={PackageCheck}
      />
      <MetricCard
        label={CATALOG_TEXT.unavailableMetric}
        value={batch.excludedUnavailable}
        icon={Ban}
      />
      <MetricCard
        label={CATALOG_TEXT.incomingMetric}
        value={batch.excludedIncoming}
        icon={TimerOff}
      />
      <MetricCard
        label={CATALOG_TEXT.skippedMetric}
        value={batch.skippedRows}
        icon={FileSearch}
      />
    </section>
  );
}

export function AdminCatalogManager({ initialDashboard }: AdminCatalogManagerProps) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState<string>(CATALOG_DEFAULTS.emptySearch);
  const [isImporting, setIsImporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleImport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const selectedFile = fileInputRef.current?.files?.[0];
    if (!selectedFile) {
      clientErrorHandler(new Error(CATALOG_TEXT.invalidFile));
      return;
    }
    setIsImporting(true);
    try {
      const updatedDashboard = await importPlatformCatalog(selectedFile);
      setDashboard(updatedDashboard);
      form.reset();
      setSearch(CATALOG_DEFAULTS.emptySearch);
      clientSuccessHandler(CATALOG_TEXT.importCreated);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsImporting(false);
    }
  };

  const handlePublish = async () => {
    if (!dashboard.draftBatch) return;
    setIsPublishing(true);
    try {
      const updatedDashboard = await publishPlatformCatalog(dashboard.draftBatch.id);
      setDashboard(updatedDashboard);
      clientSuccessHandler(CATALOG_TEXT.publishedSuccess);
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="grid items-start gap-6 xl:grid-cols-2">
        <Card className="border-foreground/15 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase tracking-wide">
              {CATALOG_TEXT.uploadTitle}
            </CardTitle>
            <CardDescription>{CATALOG_TEXT.uploadDescription}</CardDescription>
            <CardAction>
              <Upload />
            </CardAction>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImport}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={CATALOG_FIELDS.upload}>
                    {CATALOG_TEXT.fileLabel}
                  </FieldLabel>
                  <Input
                    ref={fileInputRef}
                    id={CATALOG_FIELDS.upload}
                    type="file"
                    accept={CATALOG_WORKBOOK.extension}
                    disabled={isImporting}
                    required
                  />
                </Field>
                <Button type="submit" disabled={isImporting}>
                  {isImporting ? (
                    <LoaderCircle data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <FileSearch data-icon="inline-start" />
                  )}
                  {isImporting ? CATALOG_TEXT.uploadingAction : CATALOG_TEXT.uploadAction}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card className="border-foreground/15 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase tracking-wide">
              {CATALOG_TEXT.pricingTitle}
            </CardTitle>
            <CardDescription>{CATALOG_TEXT.pricingDescription}</CardDescription>
            <CardAction>
              <Percent />
            </CardAction>
          </CardHeader>
          <CardContent>
            <CatalogPricingRulesEditor
              initialRules={dashboard.pricingRules}
              onUpdated={setDashboard}
            />
          </CardContent>
        </Card>
      </section>

      {dashboard.publishedBatch ? (
        <Alert className="border-secondary bg-secondary/15">
          <PackageCheck />
          <AlertTitle>{CATALOG_TEXT.publishedTitle}</AlertTitle>
          <AlertDescription>
            {dashboard.publishedBatch.fileName} · {dashboard.publishedBatch.availableItems}{" "}
            {CATALOG_TEXT.visibleItemsLabel} ·{" "}
            {formatCatalogDate(dashboard.publishedBatch.publishedAt ?? dashboard.publishedBatch.importedAt)}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <PackageOpen />
          <AlertTitle>{CATALOG_TEXT.noPublishedTitle}</AlertTitle>
          <AlertDescription>{CATALOG_TEXT.noPublishedDescription}</AlertDescription>
        </Alert>
      )}

      {dashboard.draftBatch ? (
        <Card className="min-w-0 border-foreground/15 bg-card/95 shadow-xl">
          <CardHeader>
            <CardTitle className="font-display text-3xl uppercase tracking-wide">
              {CATALOG_TEXT.draftTitle}
            </CardTitle>
            <CardDescription>
              {dashboard.draftBatch.fileName} · {CATALOG_TEXT.fileMetric}:{" "}
              {dashboard.draftBatch.totalRows} · {formatCatalogDate(dashboard.draftBatch.importedAt)}
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">{CATALOG_TEXT.draftBadge}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex min-w-0 flex-col gap-6">
            <CatalogBatchMetrics batch={dashboard.draftBatch} />
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-display text-2xl uppercase tracking-wide">
                  {CATALOG_TEXT.reviewTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {CATALOG_TEXT.reviewDescription}
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor={CATALOG_FIELDS.adminSearch}>
                  {CATALOG_TEXT.reviewSearchLabel}
                </FieldLabel>
                <Input
                  id={CATALOG_FIELDS.adminSearch}
                  value={search}
                  maxLength={CATALOG_LIMITS.maximumSearchLength}
                  placeholder={CATALOG_TEXT.searchPlaceholder}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Field>
              <CatalogPreviewTable items={dashboard.draftBatch.items} search={search} />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="lg" disabled={isPublishing} onClick={handlePublish}>
              {isPublishing ? (
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
              ) : (
                <Rocket data-icon="inline-start" />
              )}
              {isPublishing ? CATALOG_TEXT.publishingAction : CATALOG_TEXT.publishAction}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-foreground/15 bg-card/95 shadow-lg">
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Boxes />
                </EmptyMedia>
                <EmptyTitle>{CATALOG_TEXT.noDraftTitle}</EmptyTitle>
                <EmptyDescription>{CATALOG_TEXT.noDraftDescription}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
