export const MARGIN_OPTIONS = Array.from({ length: 11 }, (_, i) => i * 10);

export type MarginValue = (typeof MARGIN_OPTIONS)[number];