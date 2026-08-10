"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATALOG_TEXT } from "@/constants/catalog.constant";
import { CatalogItemSummary } from "@/interfaces/catalog.interface";
import {
  formatCatalogCurrency,
  normalizeCatalogSearchValue,
} from "@/utils/catalog.util";

interface CatalogPreviewTableProps {
  items: CatalogItemSummary[];
  search: string;
}

export function CatalogPreviewTable({ items, search }: CatalogPreviewTableProps) {
  const normalizedSearch = normalizeCatalogSearchValue(search);
  const visibleItems = normalizedSearch
    ? items.filter((item) =>
        normalizeCatalogSearchValue([item.brand, item.name].filter(Boolean).join(" ")).includes(
          normalizedSearch
        )
      )
    : items;

  return (
    <ScrollArea className="h-[520px] rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead>{CATALOG_TEXT.sourceRowColumn}</TableHead>
            <TableHead>{CATALOG_TEXT.brandColumn}</TableHead>
            <TableHead>{CATALOG_TEXT.itemColumn}</TableHead>
            <TableHead className="text-right">{CATALOG_TEXT.costColumn}</TableHead>
            <TableHead className="text-right">{CATALOG_TEXT.suggestedColumn}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {item.sourceRow}
              </TableCell>
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
  );
}
