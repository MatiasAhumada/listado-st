import { AUTH_SECURITY } from "@/constants/auth.constant";
import { ACCESS_ROUTES } from "@/constants/access.constant";

export const PLATFORM_ADMIN_ROUTES = {
  dashboard: "/admin",
  login: ACCESS_ROUTES.login,
  workshopsApi: "/platform/workshops",
} as const;

export const PLATFORM_ADMIN_SECURITY = {
  ...AUTH_SECURITY,
  cookieName: "platform-admin-session",
  maximumNameLength: 100,
  slugRandomBytes: 3,
} as const;

export const WORKSHOP_STATUS_OPTIONS = ["ACTIVE", "SUSPENDED"] as const;
export const INITIAL_SUBSCRIPTION_STATUS_OPTIONS = ["TRIAL", "ACTIVE"] as const;

export const PLATFORM_ADMIN_TABS = {
  workshops: "workshops",
  plans: "plans",
} as const;

export const PLATFORM_ADMIN_DEFAULTS = {
  initialWorkshopStatus: "ACTIVE",
  initialTechnicianStatus: "ACTIVE",
  initialSubscriptionStatus: "TRIAL",
  emptyValue: "—",
} as const;

export const PLATFORM_ADMIN_TEXT = {
  productName: "Service Tech",
  consoleEyebrow: "Consola de plataforma",
  loginTitle: "Acceso del administrador",
  loginDescription: "Gestioná los talleres que compran y prueban el sistema.",
  usernameLabel: "Usuario",
  passwordLabel: "Contraseña",
  loginAction: "Ingresar a la consola",
  loginPending: "Validando acceso...",
  dashboardTitle: "Clientes SaaS",
  dashboardDescription: "Planes, alta de clientes, control de accesos y precios de referencia.",
  workshopsTab: "Talleres",
  logoutAction: "Cerrar sesión",
  createTitle: "Crear una cuenta cliente",
  createDescription: "Creá el taller y las credenciales de acceso en una sola operación.",
  workshopNameLabel: "Nombre del taller",
  ownerNameLabel: "Nombre del cliente",
  ownerUsernameLabel: "Usuario de acceso",
  ownerPasswordLabel: "Contraseña temporal",
  planLabel: "Plan comercial",
  agreedPriceLabel: "Precio acordado",
  agreedPriceDescription: "Podés ajustar este importe para el acuerdo particular con el taller.",
  subscriptionStatusLabel: "Inicio comercial",
  trialOption: "Prueba",
  activeOption: "Cliente activo",
  createAction: "Crear cuenta",
  createPending: "Creando cuenta...",
  credentialsTitle: "Cuenta lista para entregar",
  credentialsDescription: "Copiá estas credenciales ahora. La contraseña no vuelve a enviarse desde el servidor.",
  copyCredentialsAction: "Copiar credenciales",
  credentialsCopied: "Credenciales copiadas",
  workshopCreated: "Taller creado correctamente",
  workshopActivated: "Taller activado",
  workshopSuspended: "Taller suspendido",
  listTitle: "Talleres administrados",
  listDescription: "Estado comercial y acceso del propietario en una sola vista.",
  workshopColumn: "Taller",
  ownerColumn: "Cliente",
  planColumn: "Plan",
  agreedPriceColumn: "Importe acordado",
  subscriptionColumn: "Suscripción",
  accessColumn: "Acceso",
  createdColumn: "Alta",
  actionsColumn: "Acciones",
  activateAction: "Activar",
  suspendAction: "Suspender",
  refreshAction: "Actualizar",
  emptyWorkshops: "Todavía no creaste ningún taller.",
  activeWorkshopsMetric: "Talleres activos",
  trialWorkshopsMetric: "En prueba",
  suspendedWorkshopsMetric: "Suspendidos",
  totalWorkshopsMetric: "Clientes registrados",
  accessActive: "Habilitado",
  accessSuspended: "Suspendido",
  subscriptionTrial: "Prueba",
  subscriptionActive: "Activo",
  subscriptionSuspended: "Suspendido",
  subscriptionCancelled: "Cancelado",
  loadingWorkshops: "Actualizando talleres...",
  unknownError: "No se pudo completar la operación",
  invalidCredentials: "Usuario o contraseña incorrectos",
  inactiveAdmin: "La cuenta administradora está inactiva",
  unauthenticated: "La sesión del administrador no es válida",
  workshopNotFound: "El taller no existe",
  ownerUsernameExists: "Ese nombre de usuario ya está en uso",
  invalidRequest: "Los datos enviados no son válidos",
  internalError: "Ocurrió un error interno",
  logoutSuccess: "Sesión cerrada",
  sessionCreated: "Sesión iniciada",
  workshopNameRequired: "Ingresá el nombre del taller",
  ownerNameRequired: "Ingresá el nombre del cliente",
  usernameInvalid: "Usá entre 3 y 40 caracteres: letras, números, punto, guion o guion bajo",
  passwordTooShort: "La contraseña debe tener al menos 10 caracteres",
  passwordTooLong: "La contraseña no puede superar 72 caracteres",
  credentialsWorkshopPrefix: "Taller:",
  credentialsUsernamePrefix: "Usuario:",
  credentialsPasswordPrefix: "Contraseña temporal:",
} as const;

export const PLATFORM_ADMIN_FIELDS = {
  loginUsername: "platform-admin-username",
  loginPassword: "platform-admin-password",
  workshopName: "workshop-name",
  ownerName: "workshop-owner-name",
  ownerUsername: "workshop-owner-username",
  ownerPassword: "workshop-owner-password",
  planId: "workshop-plan",
  agreedPrice: "workshop-agreed-price",
  subscriptionStatus: "workshop-subscription-status",
} as const;

export const PLATFORM_ADMIN_ERROR_CODES = {
  uniqueConstraint: "P2002",
} as const;

export const PLATFORM_ADMIN_AUDIT = {
  workshopCreated: "WORKSHOP_CREATED",
  workshopActivated: "WORKSHOP_ACTIVATED",
  workshopSuspended: "WORKSHOP_SUSPENDED",
} as const;

export const PLATFORM_ADMIN_LIFECYCLE = {
  active: {
    workshopStatus: "ACTIVE",
    technicianStatus: "ACTIVE",
    subscriptionStatus: "ACTIVE",
    auditAction: PLATFORM_ADMIN_AUDIT.workshopActivated,
    revokeTechnicianSessions: false,
  },
  suspended: {
    workshopStatus: "SUSPENDED",
    technicianStatus: "SUSPENDED",
    subscriptionStatus: "SUSPENDED",
    auditAction: PLATFORM_ADMIN_AUDIT.workshopSuspended,
    revokeTechnicianSessions: true,
  },
} as const;

export const PLATFORM_ADMIN_DATE_FORMAT = {
  locale: "es-AR",
  options: {
    day: "2-digit",
    month: "short",
    year: "numeric",
  } as const,
} as const;

export const WORKSHOP_STATUS_LABELS: Record<"ACTIVE" | "SUSPENDED", string> = {
  ACTIVE: PLATFORM_ADMIN_TEXT.accessActive,
  SUSPENDED: PLATFORM_ADMIN_TEXT.accessSuspended,
};

export const SUBSCRIPTION_STATUS_LABELS: Record<"TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED", string> = {
  TRIAL: PLATFORM_ADMIN_TEXT.subscriptionTrial,
  ACTIVE: PLATFORM_ADMIN_TEXT.subscriptionActive,
  SUSPENDED: PLATFORM_ADMIN_TEXT.subscriptionSuspended,
  CANCELLED: PLATFORM_ADMIN_TEXT.subscriptionCancelled,
};
