export const CATALOG_ROUTES = {
  adminDashboardApi: "/platform/catalog",
  adminImportsApi: "/platform/catalog/imports",
  adminPricingRulesApi: "/platform/catalog/pricing-rules",
  technicianCatalogApi: "/client/catalog",
} as const;

export const CATALOG_LIMITS = {
  maximumFileSizeBytes: 5 * 1024 * 1024,
  maximumFileNameLength: 255,
  maximumRules: 10,
  minimumMarkupPercentage: 0,
  maximumMarkupPercentage: 1000,
  minimumMaximumCost: 1,
  maximumCost: 999999999,
  defaultNewMaximumCost: 50000,
  moneyInputStep: 0.01,
  percentageInputStep: 1,
  moneyPrecisionFactor: 100,
  percentageBase: 100,
  baseMultiplier: 1,
  technicianResultLimit: 50,
  maximumSearchLength: 120,
} as const;

export const CATALOG_DEFAULTS = {
  rules: [{ maximumCost: null, markupPercentage: 100 }],
  emptySearch: "",
  emptyMetric: 0,
  firstRulePosition: 0,
} as const;

export const CATALOG_WORKBOOK = {
  extension: ".xlsx",
  mimeTypes: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
  ],
  firstSheetIndex: 0,
  descriptionColumn: 0,
  costColumn: 1,
  noteColumn: 2,
  sourceRowOffset: 1,
  unavailableColors: ["FF0000"],
  incomingColors: ["7099D9", "4A86E8", "4472C4", "5B9BD5"],
  availableColors: ["FFFFFF"],
  availableTheme: 0,
  incomingMarkers: ["INGRESA", "INGRESAN"],
  itemPrefixes: ["•", "*", "·"],
  brandHeaderExpression: /\(([^)]+)\)/,
  whitespaceExpression: /\s+/g,
  diacriticExpression: /[\u0300-\u036f]/g,
  unicodeNormalization: "NFD" as const,
  hashAlgorithm: "sha256",
  hashEncoding: "hex" as const,
} as const;

export const CATALOG_FIELDS = {
  upload: "catalog-upload",
  adminSearch: "catalog-admin-search",
  technicianSearch: "catalog-technician-search",
  pricingMaximumPrefix: "pricing-maximum",
  pricingMarkupPrefix: "pricing-markup",
} as const;

export const CATALOG_TABS = {
  workshops: "workshops",
  catalog: "catalog",
} as const;

export const CATALOG_STATUS = {
  draft: "DRAFT",
  published: "PUBLISHED",
  archived: "ARCHIVED",
} as const;

export const CATALOG_ROW_STATUS = {
  available: "AVAILABLE",
  unavailable: "UNAVAILABLE",
  incoming: "INCOMING",
  skipped: "SKIPPED",
} as const;

export const CATALOG_TEXT = {
  tabWorkshops: "Talleres",
  tabCatalog: "Catálogo global",
  adminTitle: "Lista maestra de módulos",
  adminDescription:
    "Importá el Excel del proveedor, revisá únicamente los repuestos disponibles y publicá una versión estable.",
  pricingTitle: "Reglas de sugerencia",
  pricingDescription:
    "El porcentaje se aplica sobre el costo. La última regla cubre todos los importes restantes.",
  maximumCostLabel: "Costo hasta",
  unlimitedCostLabel: "Sin límite",
  markupLabel: "Agregar",
  percentageSuffix: "%",
  addRuleAction: "Agregar rango",
  removeRuleAction: "Quitar rango",
  saveRulesAction: "Guardar reglas",
  savingRulesAction: "Guardando reglas...",
  pricingSaved: "Reglas de sugerencia actualizadas",
  uploadTitle: "Nueva importación",
  uploadDescription:
    "Se aceptan archivos XLSX. Las filas rojas, azules y con avisos de próximo ingreso se excluyen automáticamente.",
  fileLabel: "Archivo del proveedor",
  uploadAction: "Analizar Excel",
  uploadingAction: "Leyendo lista...",
  importCreated: "Importación lista para revisar",
  invalidFile: "Seleccioná un archivo XLSX válido",
  fileTooLarge: "El archivo supera el tamaño permitido",
  workbookEmpty: "El Excel no contiene repuestos disponibles para publicar",
  workbookUnreadable: "No se pudo interpretar el archivo XLSX",
  draftTitle: "Borrador listo para publicar",
  publishedTitle: "Versión visible para técnicos",
  noDraftTitle: "No hay una importación pendiente",
  noDraftDescription: "Elegí un Excel para preparar la próxima versión del catálogo.",
  noPublishedTitle: "Todavía no hay catálogo publicado",
  noPublishedDescription:
    "Los clientes verán las sugerencias cuando publiques el primer borrador.",
  publishAction: "Publicar catálogo",
  publishingAction: "Publicando...",
  publishedSuccess: "Catálogo publicado para todos los clientes",
  publishedBadge: "Publicado",
  draftBadge: "Borrador",
  fileMetric: "Filas del Excel",
  availableMetric: "Disponibles",
  unavailableMetric: "Sin stock excluidos",
  incomingMetric: "Próximos ingresos excluidos",
  skippedMetric: "Filas informativas",
  reviewTitle: "Revisión de disponibles",
  reviewDescription:
    "Esta es exactamente la información que recibirán los clientes al publicar.",
  reviewSearchLabel: "Buscar en el borrador",
  searchPlaceholder: "Modelo, calidad o marca",
  sourceRowColumn: "Fila",
  brandColumn: "Marca",
  itemColumn: "Repuesto",
  costColumn: "Costo de referencia",
  suggestedColumn: "Precio sugerido",
  unknownBrand: "Sin categoría",
  pricingInvalid: "Los rangos de precios no son válidos",
  pricingOrderInvalid: "Los límites deben estar ordenados de menor a mayor",
  pricingFinalRuleInvalid: "La última regla debe quedar sin límite",
  batchNotFound: "La importación no existe",
  batchNotDraft: "La importación ya no está disponible para publicar",
  invalidRequest: "Los datos del catálogo no son válidos",
  internalError: "No se pudo completar la operación del catálogo",
  technicianTitle: "Precios de referencia",
  technicianDescription:
    "Costos del proveedor principal y sugerencias calculadas con la regla vigente.",
  technicianSearchAction: "Buscar repuesto",
  technicianSearchingAction: "Buscando...",
  technicianEmptyTitle: "No encontramos repuestos disponibles",
  technicianEmptyDescription:
    "Probá con otro modelo o esperá a que el administrador publique una nueva lista.",
  technicianReferenceAlertTitle: "Una referencia, no una obligación",
  technicianReferenceAlertDescription:
    "Podés usar otro proveedor, cambiar el costo y definir el precio final cuando armes el presupuesto.",
  visibleItemsLabel: "alternativas disponibles",
} as const;

export const CATALOG_DATE_FORMAT = {
  locale: "es-AR",
  options: {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as const,
} as const;

export const CATALOG_CURRENCY_FORMAT = {
  locale: "es-AR",
  options: {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  } as const,
} as const;
