import { AUTH_SECURITY } from "@/constants/auth.constant";

export const TECHNICIAN_ROUTES = {
  dashboard: "/taller",
  login: "/taller/login",
  sessionApi: "/technician/auth/session",
  workspaceApi: "/technician/workspace",
} as const;

export const TECHNICIAN_SECURITY = {
  ...AUTH_SECURITY,
  cookieName: "technician-session",
} as const;

export const TECHNICIAN_ACCESS = {
  activeTechnicianStatus: "ACTIVE",
  activeWorkshopStatus: "ACTIVE",
  allowedSubscriptionStatuses: ["TRIAL", "ACTIVE"] as const,
} as const;

export const TECHNICIAN_FIELDS = {
  loginEmail: "technician-email",
  loginPassword: "technician-password",
} as const;

export const TECHNICIAN_TEXT = {
  productName: "Service Tech",
  loginEyebrow: "Acceso del técnico",
  loginTitle: "Tu taller, en orden",
  loginDescription: "Ingresá con las credenciales que recibiste al activar tu cuenta.",
  loginPromise: "Presupuestos claros, trabajos visibles y números bajo control.",
  emailLabel: "Correo",
  passwordLabel: "Contraseña",
  loginAction: "Entrar a mi taller",
  loginPending: "Abriendo el taller...",
  logoutAction: "Cerrar sesión",
  dashboardEyebrow: "Espacio privado",
  dashboardDescription: "La base de gestión de tu servicio técnico ya está activa.",
  accessReadyTitle: "Tu taller está correctamente aislado",
  accessReadyDescription:
    "Esta sesión solo puede consultar información asociada a tu taller. El acceso se corta inmediatamente si la cuenta se suspende.",
  foundationTitle: "Puesto de trabajo preparado",
  foundationDescription:
    "La identidad y el aislamiento ya están listos. Los módulos operativos se incorporan sobre esta base.",
  customersMetric: "Clientes",
  quotesMetric: "Presupuestos",
  repairsMetric: "Trabajos activos",
  alertsMetric: "Alertas",
  nextFlowTitle: "Próximo flujo de trabajo",
  nextFlowDescription: "Las siguientes herramientas se construirán dentro de este espacio privado.",
  customersTitle: "Clientes",
  customersDescription: "Contactos y celulares asociados a cada persona.",
  quotesTitle: "Presupuestos",
  quotesDescription: "Alternativas, costos, sugerencias y precio final.",
  repairsTitle: "Reparaciones",
  repairsDescription: "Ingreso físico, estados, gastos, cobros y ganancia.",
  nextBlockBadge: "Próximo bloque",
  planLabel: "Plan técnico independiente",
  subscriptionTrial: "Prueba activa",
  subscriptionActive: "Suscripción activa",
  subscriptionSuspended: "Suscripción suspendida",
  subscriptionCancelled: "Suscripción cancelada",
  invalidCredentials: "Correo o contraseña incorrectos",
  accessUnavailable: "El acceso a este taller está suspendido",
  unauthenticated: "La sesión del técnico no es válida",
  workspaceNotFound: "El taller no existe",
  invalidRequest: "Los datos enviados no son válidos",
  internalError: "Ocurrió un error interno",
  logoutSuccess: "Sesión cerrada",
  sessionCreated: "Sesión iniciada",
  emailInvalid: "Ingresá un correo válido",
  passwordTooShort: "La contraseña debe tener al menos 10 caracteres",
  passwordTooLong: "La contraseña no puede superar 72 caracteres",
} as const;

export const TECHNICIAN_EMPTY_METRIC_VALUE = 0;

export const TECHNICIAN_SUBSCRIPTION_LABELS: Record<
  "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED",
  string
> = {
  TRIAL: TECHNICIAN_TEXT.subscriptionTrial,
  ACTIVE: TECHNICIAN_TEXT.subscriptionActive,
  SUSPENDED: TECHNICIAN_TEXT.subscriptionSuspended,
  CANCELLED: TECHNICIAN_TEXT.subscriptionCancelled,
};
