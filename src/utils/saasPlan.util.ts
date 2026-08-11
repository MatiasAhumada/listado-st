import { SAAS_PLAN_DEFAULTS, SAAS_PLAN_LIMITS } from "@/constants/saasPlan.constant";

export function createSaasPlanCode(name: string): string {
  const code = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, SAAS_PLAN_LIMITS.maximumCodeLength);

  return code || SAAS_PLAN_DEFAULTS.fallbackCode;
}

export function formatSaasPlanPrice(amount: string, currency: string): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}
