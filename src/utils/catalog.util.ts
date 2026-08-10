import {
  CATALOG_CURRENCY_FORMAT,
  CATALOG_DATE_FORMAT,
  CATALOG_WORKBOOK,
} from "@/constants/catalog.constant";

const catalogCurrencyFormatter = new Intl.NumberFormat(
  CATALOG_CURRENCY_FORMAT.locale,
  CATALOG_CURRENCY_FORMAT.options
);

const catalogDateFormatter = new Intl.DateTimeFormat(
  CATALOG_DATE_FORMAT.locale,
  CATALOG_DATE_FORMAT.options
);

export function normalizeCatalogSearchValue(value: string): string {
  return value
    .normalize(CATALOG_WORKBOOK.unicodeNormalization)
    .replace(CATALOG_WORKBOOK.diacriticExpression, "")
    .toLowerCase()
    .replace(CATALOG_WORKBOOK.whitespaceExpression, " ")
    .trim();
}

export function formatCatalogCurrency(value: number): string {
  return catalogCurrencyFormatter.format(value);
}

export function formatCatalogDate(value: string): string {
  return catalogDateFormatter.format(new Date(value));
}
