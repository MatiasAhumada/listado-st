import * as XLSX from "xlsx";
import { CATALOG_ROW_STATUS, CATALOG_WORKBOOK } from "@/constants/catalog.constant";
import {
  CatalogWorkbookCellStyle,
  ParsedCatalogItem,
  ParsedCatalogWorkbook,
} from "@/interfaces/catalogPersistence.interface";
import {
  classifyCatalogSourceRow,
  extractCatalogBrandHeader,
  normalizeCatalogItemName,
} from "@/server/domain/catalogImport.domain";
import { normalizeCatalogSearchValue } from "@/utils/catalog.util";

function getCell(
  worksheet: XLSX.WorkSheet,
  row: number,
  column: number
): XLSX.CellObject | undefined {
  return worksheet[XLSX.utils.encode_cell({ r: row, c: column })];
}

function getCellText(cell?: XLSX.CellObject): string {
  return String(cell?.v ?? "").trim();
}

function getCellCost(cell?: XLSX.CellObject): number | undefined {
  const cost = Number(cell?.v);
  return Number.isFinite(cost) && cost > 0 ? cost : undefined;
}

export class CatalogWorkbookParser {
  static parse(workbookBytes: Uint8Array): ParsedCatalogWorkbook {
    const workbook = XLSX.read(Buffer.from(workbookBytes), {
      type: "buffer",
      cellStyles: true,
    });
    const sheetName = workbook.SheetNames[CATALOG_WORKBOOK.firstSheetIndex];
    const worksheet = sheetName ? workbook.Sheets[sheetName] : undefined;
    const sheetRange = worksheet?.["!ref"];
    if (!worksheet || !sheetRange) return this.emptyResult();

    const range = XLSX.utils.decode_range(sheetRange);
    const items: ParsedCatalogItem[] = [];
    let currentBrand: string | undefined;
    let excludedUnavailable = 0;
    let excludedIncoming = 0;
    let skippedRows = 0;

    for (let row = range.s.r; row <= range.e.r; row += 1) {
      const descriptionCell = getCell(
        worksheet,
        row,
        CATALOG_WORKBOOK.descriptionColumn
      );
      const costCell = getCell(worksheet, row, CATALOG_WORKBOOK.costColumn);
      const noteCell = getCell(worksheet, row, CATALOG_WORKBOOK.noteColumn);
      const description = getCellText(descriptionCell);
      const cost = getCellCost(costCell);
      const detectedBrand = extractCatalogBrandHeader(description, cost);
      if (detectedBrand) currentBrand = detectedBrand;

      const style = descriptionCell?.s as CatalogWorkbookCellStyle | undefined;
      const classification = classifyCatalogSourceRow({
        description,
        cost,
        note: getCellText(noteCell),
        fillColor: style?.fgColor?.rgb,
        fillTheme: style?.fgColor?.theme,
      });

      if (classification === CATALOG_ROW_STATUS.unavailable) {
        excludedUnavailable += 1;
        continue;
      }
      if (classification === CATALOG_ROW_STATUS.incoming) {
        excludedIncoming += 1;
        continue;
      }
      if (classification === CATALOG_ROW_STATUS.skipped || !cost) {
        skippedRows += 1;
        continue;
      }

      const name = normalizeCatalogItemName(description);
      items.push({
        sourceRow: row + CATALOG_WORKBOOK.sourceRowOffset,
        name,
        normalizedName: normalizeCatalogSearchValue(
          [currentBrand, name].filter(Boolean).join(" ")
        ),
        brand: currentBrand,
        cost,
      });
    }

    return {
      totalRows: range.e.r - range.s.r + CATALOG_WORKBOOK.sourceRowOffset,
      availableItems: items.length,
      excludedUnavailable,
      excludedIncoming,
      skippedRows,
      items,
    };
  }

  private static emptyResult(): ParsedCatalogWorkbook {
    return {
      totalRows: 0,
      availableItems: 0,
      excludedUnavailable: 0,
      excludedIncoming: 0,
      skippedRows: 0,
      items: [],
    };
  }
}
