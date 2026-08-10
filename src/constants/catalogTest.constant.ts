export const CATALOG_TEST_TEXT = {
  whiteAvailable: "acepta una fila blanca con costo",
  redUnavailable: "excluye una fila roja sin stock",
  incomingNote: "excluye una fila con aviso de próximo ingreso",
  blueIncoming: "excluye una fila azul",
  unsupportedColor: "ignora una fila con color no reconocido",
  defaultSuggestion: "calcula costo más cien por ciento",
  tieredSuggestion: "aplica la regla correspondiente al rango de costo",
  orderedRules: "acepta rangos ordenados con un último tramo ilimitado",
  unorderedRules: "rechaza rangos desordenados",
} as const;

export const CATALOG_TEST_DATA = {
  description: "Módulo de prueba",
  cost: 100,
  note: "",
  whiteColor: "FFFFFF",
  redColor: "FF0000",
  blueColor: "7099D9",
  yellowColor: "FFFF00",
  incomingNote: "INGRESA en 48 hs",
  defaultMarkup: 100,
  firstBandMaximum: 200,
  firstBandMarkup: 50,
  finalBandMarkup: 80,
  firstBandSuggestion: 150,
  expensiveCost: 300,
  finalBandSuggestion: 540,
} as const;
