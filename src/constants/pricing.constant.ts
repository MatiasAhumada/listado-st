export const MARGIN_OPTIONS = Array.from({ length: 71 }, (_, i) => i * 10);

export type MarginValue = (typeof MARGIN_OPTIONS)[number];

export const TECH_MARGIN_MODULO = 30;
