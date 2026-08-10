import { PrototypeCatalogItem, PrototypeQuoteStage } from "@/interfaces/quotePrototype.interface";

export const PROTOTYPE_MARKUP_RATE = 1;
export const PROTOTYPE_MINIMUM_ALTERNATIVES = 1;
export const PROTOTYPE_DEFAULT_VALIDITY_DAYS = 7;
export const PROTOTYPE_ZERO_AMOUNT = 0;
export const PROTOTYPE_CURRENCY_LOCALE = "es-AR";
export const PROTOTYPE_CURRENCY_CODE = "ARS";

export const PROTOTYPE_STAGE: Record<PrototypeQuoteStage, PrototypeQuoteStage> = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
};

export const PROTOTYPE_DEFAULTS = {
  customerName: "Lucía Fernández",
  customerPhone: "11 5555-0194",
  phoneModel: "Samsung A03s",
  reportedIssue: "Pantalla rota; el equipo enciende y responde al tacto.",
  catalogQuery: "A03s",
  supplier: "Proveedor habitual",
  validityDays: String(PROTOTYPE_DEFAULT_VALIDITY_DAYS),
} as const;

export const PROTOTYPE_INITIAL_CATALOG_ITEM_IDS = ["samsung-a03s-amp", "samsung-a03s-gold"] as const;

export const PROTOTYPE_CATALOG_ITEMS: PrototypeCatalogItem[] = [
  {
    id: "samsung-a03s-amp",
    description: "A02s / A03 / A03s / A04e — Mecánico AMP original",
    compatibleModels: ["A02S", "A03", "A03S", "A04E"],
    referenceCost: 16500,
    quality: "Mecánico AMP",
    frameIncluded: false,
  },
  {
    id: "samsung-a03s-ass",
    description: "A02s / A03 / A03s / A04e — Mecánico ASS original de equipo",
    compatibleModels: ["A02S", "A03", "A03S", "A04E"],
    referenceCost: 18000,
    quality: "Mecánico ASS",
    frameIncluded: false,
  },
  {
    id: "samsung-a03s-gold",
    description: "A02s / A03 / A03s / A04e — Wuzip Gold",
    compatibleModels: ["A02S", "A03", "A03S", "A04E"],
    referenceCost: 18500,
    quality: "Wuzip Gold",
    frameIncluded: false,
  },
  {
    id: "samsung-a02s-gold-frame",
    description: "Samsung A02s — Wuzip Gold con marco",
    compatibleModels: ["A02S"],
    referenceCost: 24000,
    quality: "Wuzip Gold",
    frameIncluded: true,
  },
  {
    id: "samsung-a03s-gold-frame",
    description: "Samsung A03s — Wuzip Gold con marco",
    compatibleModels: ["A03S"],
    referenceCost: 23000,
    quality: "Wuzip Gold",
    frameIncluded: true,
  },
  {
    id: "samsung-a03-gold-frame",
    description: "Samsung A03 — Wuzip Gold con marco",
    compatibleModels: ["A03"],
    referenceCost: 24000,
    quality: "Wuzip Gold",
    frameIncluded: true,
  },
];

export const PROTOTYPE_TEXT = {
  eyebrow: "BANCO DE PRUEBA · FASE −1",
  title: "Cotizar sin perder el trabajo",
  subtitle:
    "Un recorrido descartable para observar cómo cotiza un técnico. Nada de esta pantalla se guarda en la base actual.",
  sessionBadge: "Sesión de validación",
  draftStatus: "Borrador editable",
  sentStatus: "Presupuesto enviado",
  acceptedStatus: "Alternativa aceptada",
  customerCardTitle: "1. Cliente y celular",
  customerCardDescription: "Los datos mínimos para no perder el contexto de la consulta.",
  customerNameLabel: "Cliente",
  customerNamePlaceholder: "Nombre del cliente",
  customerPhoneLabel: "WhatsApp",
  customerPhonePlaceholder: "Número de contacto",
  phoneModelLabel: "Modelo",
  phoneModelPlaceholder: "Ej. Samsung A03s",
  issueLabel: "Problema informado",
  issuePlaceholder: "Qué le pasa al equipo",
  validityLabel: "Validez del presupuesto",
  validityDescription: "Se comunica al cliente al enviar.",
  daysSuffix: "días",
  alternativesCardTitle: "2. Alternativas",
  alternativesCardDescription: "La lista sugiere; el técnico decide su proveedor, costo real y precio final.",
  referenceSuggestion: "Sugerencia de lista",
  selectedCost: "Mi costo real",
  supplier: "Proveedor elegido",
  finalPrice: "Precio al cliente",
  estimatedProfit: "Ganancia estimada",
  referenceCost: "Costo de referencia",
  editLocked: "Esta revisión ya fue enviada y no se puede editar.",
  catalogTitle: "Lista disponible",
  catalogDescription: "Fixture real: solo filas blancas disponibles del Excel entregado.",
  searchLabel: "Buscar modelo compatible",
  searchPlaceholder: "Ej. A03s",
  availableBadge: "Disponible",
  frameBadge: "Con marco",
  noFrameBadge: "Sin marco",
  addAlternative: "Agregar alternativa",
  alreadyAdded: "Ya agregada",
  customerPreviewTitle: "Vista para el cliente",
  customerPreviewDescription: "Los costos, proveedores y ganancias quedan ocultos.",
  reportedIssuePrefix: "Equipo:",
  validityPrefix: "Validez:",
  sendQuote: "Marcar como enviado",
  markAccepted: "Marcar aceptada",
  accepted: "Aceptada",
  copyWhatsapp: "Copiar mensaje para WhatsApp",
  copiedWhatsapp: "Mensaje copiado",
  resetSession: "Reiniciar prueba",
  acceptedTitle: "Presupuesto confirmado",
  acceptedDescription:
    "La aceptación quedó registrada manualmente. El ingreso físico del celular ocurriría después y recién ahí nacería la reparación.",
  observationPrompt:
    "Observá: ¿encontró el repuesto rápido?, ¿cambió el costo?, ¿qué precio terminó ofreciendo?, ¿el flujo fue más lento que WhatsApp?",
  sourceLabel: "Fuente",
  sourceValue: "MODULOS.xlsx · Fénix Distribuciones Tecnológicas",
  sourceRule: "Regla inicial: costo + 100%",
  missingAlternatives: "Agregá al menos una alternativa antes de enviar.",
  copiedWhatsappError: "No se pudo copiar el mensaje.",
  whatsappGreeting: "Hola",
  whatsappIntro: "te paso el presupuesto para",
  whatsappValidity: "El presupuesto tiene una validez de",
  whatsappClosing: "Decime qué alternativa preferís y la marco como aceptada.",
} as const;
