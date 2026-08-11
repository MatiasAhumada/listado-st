import { BillingPeriodCode } from "@/types/platformAdmin.types";

export const SAAS_PLAN_ROUTES = {
  adminApi: "/platform/plans",
} as const;

export const SAAS_PLAN_LIMITS = {
  maximumNameLength: 100,
  maximumDescriptionLength: 240,
  maximumCodeLength: 60,
  maximumPriceIntegerDigits: 10,
  maximumPriceDecimalDigits: 2,
  moneyInputStep: 0.01,
} as const;

export const SAAS_PLAN_DEFAULTS = {
  currency: "ARS",
  billingPeriod: "MONTHLY" as BillingPeriodCode,
  isActive: true,
  emptyDescription: "",
  emptyPrice: "",
  fallbackCode: "PLAN",
} as const;

export const SAAS_PLAN_BILLING_PERIODS = ["MONTHLY", "YEARLY"] as const;

export const SAAS_PLAN_ERROR_CODES = {
  uniqueConstraint: "P2002",
} as const;

export const SAAS_PLAN_FIELDS = {
  name: "saas-plan-name",
  description: "saas-plan-description",
  billingPrice: "saas-plan-price",
  billingPeriod: "saas-plan-period",
  isActive: "saas-plan-active",
} as const;

export const SAAS_PLAN_TEXT = {
  tabLabel: "Planes",
  managerTitle: "Planes comerciales",
  managerDescription: "Definí cuánto cobrar y cada cuánto para las nuevas suscripciones.",
  createTitle: "Crear plan",
  editTitle: "Editar plan",
  createDescription: "El precio queda copiado en cada venta para conservar lo acordado.",
  editDescription: "Los cambios solo se aplican a ventas o reasignaciones posteriores.",
  nameLabel: "Nombre del plan",
  descriptionLabel: "Descripción",
  priceLabel: "Precio",
  periodLabel: "Periodicidad",
  activeLabel: "Disponible para nuevas ventas",
  activeDescription: "Un plan inactivo continúa visible en suscripciones ya asignadas.",
  monthlyLabel: "Mensual",
  yearlyLabel: "Anual",
  createAction: "Crear plan",
  updateAction: "Guardar cambios",
  cancelEditAction: "Cancelar edición",
  editAction: "Editar",
  savingAction: "Guardando...",
  createdSuccess: "Plan creado correctamente",
  updatedSuccess: "Plan actualizado correctamente",
  listTitle: "Planes configurados",
  listDescription: "Importes actuales y cantidad de clientes asociados.",
  emptyPlans: "Todavía no configuraste ningún plan comercial.",
  planColumn: "Plan",
  priceColumn: "Precio",
  periodColumn: "Período",
  subscriptionsColumn: "Clientes",
  statusColumn: "Estado",
  actionsColumn: "Acciones",
  activeStatus: "Activo",
  inactiveStatus: "Inactivo",
  nameRequired: "Ingresá el nombre del plan",
  priceInvalid: "Ingresá un precio mayor a cero con hasta dos decimales",
  planNotFound: "El plan no existe",
  inactivePlan: "El plan seleccionado no está disponible para nuevas ventas",
  planAlreadyExists: "Ya existe un plan con ese nombre o código",
  planRequired: "Seleccioná un plan comercial",
  noActivePlans: "Creá y activá al menos un plan antes de dar de alta un cliente.",
  assignAction: "Aplicar",
  assigningAction: "Aplicando...",
  assignmentSuccess: "Plan asignado correctamente",
  assignedPriceLabel: "Importe acordado",
} as const;

export const SAAS_PLAN_BILLING_LABELS: Record<BillingPeriodCode, string> = {
  MONTHLY: SAAS_PLAN_TEXT.monthlyLabel,
  YEARLY: SAAS_PLAN_TEXT.yearlyLabel,
};
