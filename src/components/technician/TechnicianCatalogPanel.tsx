"use client";

import { FormEvent, useState } from "react";
import {
  CircleDollarSign,
  LoaderCircle,
  PackageSearch,
  Search,
  ShieldQuestion,
} from "lucide-react";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CATALOG_DEFAULTS,
  CATALOG_FIELDS,
  CATALOG_LIMITS,
  CATALOG_TEXT,
} from "@/constants/catalog.constant";
import { TechnicianCatalogResult } from "@/interfaces/catalog.interface";
import { getTechnicianCatalog } from "@/services/technician.service";
import { formatCatalogCurrency } from "@/utils/catalog.util";
import { clientErrorHandler } from "@/utils/handlers/clientError.handler";

interface TechnicianCatalogPanelProps {
  initialCatalog: TechnicianCatalogResult;
}

export function TechnicianCatalogPanel({
  initialCatalog,
}: TechnicianCatalogPanelProps) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [query, setQuery] = useState<string>(CATALOG_DEFAULTS.emptySearch);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearching(true);
    try {
      setCatalog(await getTechnicianCatalog(query));
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="min-w-0 border-foreground/15 bg-card/95 shadow-xl">
      <CardHeader>
        <CardTitle className="font-display text-3xl uppercase tracking-wide">
          {CATALOG_TEXT.technicianTitle}
        </CardTitle>
        <CardDescription>{CATALOG_TEXT.technicianDescription}</CardDescription>
        <CardAction>
          <Badge variant="secondary">
            {catalog.total} {CATALOG_TEXT.visibleItemsLabel}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-5">
        <Alert className="border-secondary bg-secondary/15">
          <ShieldQuestion />
          <AlertTitle>{CATALOG_TEXT.technicianReferenceAlertTitle}</AlertTitle>
          <AlertDescription>
            {CATALOG_TEXT.technicianReferenceAlertDescription}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSearch}>
          <FieldGroup className="sm:flex-row sm:items-end">
            <Field>
              <FieldLabel htmlFor={CATALOG_FIELDS.technicianSearch}>
                {CATALOG_TEXT.technicianSearchAction}
              </FieldLabel>
              <Input
                id={CATALOG_FIELDS.technicianSearch}
                value={query}
                maxLength={CATALOG_LIMITS.maximumSearchLength}
                placeholder={CATALOG_TEXT.searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
              />
            </Field>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
              ) : (
                <Search data-icon="inline-start" />
              )}
              {isSearching
                ? CATALOG_TEXT.technicianSearchingAction
                : CATALOG_TEXT.technicianSearchAction}
            </Button>
          </FieldGroup>
        </form>

        {catalog.items.length ? (
          <ScrollArea className="h-[440px] rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>{CATALOG_TEXT.brandColumn}</TableHead>
                  <TableHead>{CATALOG_TEXT.itemColumn}</TableHead>
                  <TableHead className="text-right">{CATALOG_TEXT.costColumn}</TableHead>
                  <TableHead className="text-right">
                    {CATALOG_TEXT.suggestedColumn}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.brand ?? CATALOG_TEXT.unknownBrand}</TableCell>
                    <TableCell className="min-w-80 font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCatalogCurrency(item.cost)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCatalogCurrency(item.suggestedPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <Empty className="min-h-64 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageSearch />
              </EmptyMedia>
              <EmptyTitle>{CATALOG_TEXT.technicianEmptyTitle}</EmptyTitle>
              <EmptyDescription>{CATALOG_TEXT.technicianEmptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <CircleDollarSign />
          <span>{CATALOG_TEXT.pricingDescription}</span>
        </div>
      </CardContent>
    </Card>
  );
}
