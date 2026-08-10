import {
  CATALOG_ROW_STATUS,
  CATALOG_WORKBOOK,
} from "@/constants/catalog.constant";
import { CatalogSourceRow } from "@/interfaces/catalogPersistence.interface";
import { CatalogRowClassification } from "@/types/catalog.types";

function normalizeFillColor(fillColor?: string): string {
  return fillColor?.toUpperCase().slice(-6) ?? "";
}

function includesColor(colors: readonly string[], fillColor: string): boolean {
  return colors.some((color) => color === fillColor);
}

function includesIncomingMarker(note: string): boolean {
  const normalizedNote = note.toUpperCase();
  return CATALOG_WORKBOOK.incomingMarkers.some((marker) =>
    normalizedNote.includes(marker)
  );
}

export function classifyCatalogSourceRow(
  row: CatalogSourceRow
): CatalogRowClassification {
  if (!row.description.trim() || !row.cost || row.cost <= 0) {
    return CATALOG_ROW_STATUS.skipped;
  }

  const fillColor = normalizeFillColor(row.fillColor);
  if (includesColor(CATALOG_WORKBOOK.unavailableColors, fillColor)) {
    return CATALOG_ROW_STATUS.unavailable;
  }

  if (
    includesColor(CATALOG_WORKBOOK.incomingColors, fillColor) ||
    includesIncomingMarker(row.note)
  ) {
    return CATALOG_ROW_STATUS.incoming;
  }

  const hasAvailableColor =
    !fillColor || includesColor(CATALOG_WORKBOOK.availableColors, fillColor);
  const hasAvailableTheme = row.fillTheme === CATALOG_WORKBOOK.availableTheme;
  return hasAvailableColor || hasAvailableTheme
    ? CATALOG_ROW_STATUS.available
    : CATALOG_ROW_STATUS.skipped;
}

export function normalizeCatalogItemName(description: string): string {
  let normalizedName = description.trim();
  while (
    CATALOG_WORKBOOK.itemPrefixes.some((prefix) => normalizedName.startsWith(prefix))
  ) {
    normalizedName = normalizedName.slice(1).trim();
  }
  return normalizedName.replace(CATALOG_WORKBOOK.whitespaceExpression, " ");
}

export function extractCatalogBrandHeader(
  description: string,
  cost?: number
): string | undefined {
  const normalizedDescription = description.trim();
  const startsAsItem = CATALOG_WORKBOOK.itemPrefixes.some((prefix) =>
    normalizedDescription.startsWith(prefix)
  );
  if (!normalizedDescription || cost || startsAsItem) return undefined;

  const match = normalizedDescription.match(CATALOG_WORKBOOK.brandHeaderExpression);
  return match?.[1]?.trim().toUpperCase();
}
