export const PLATFORM_ADMIN_ROUTES = {
  dashboard: "/admin",
  login: "/admin/login",
  sessionApi: "/platform/auth/session",
  workshopsApi: "/platform/workshops",
} as const;

export const PLATFORM_ADMIN_SECURITY = {
  cookieName: "platform-admin-session",
  cookiePath: "/",
  cookieSameSite: "lax" as const,
  sessionDurationSeconds: 60 * 60 * 24 * 7,
  sessionDurationMilliseconds: 1000 * 60 * 60 * 24 * 7,
  sessionTokenBytes: 32,
  sessionTokenEncoding: "hex" as const,
  sessionHashAlgorithm: "sha256",
  passwordSaltRounds: 12,
  minimumPasswordLength: 10,
  maximumPasswordLength: 72,
  maximumNameLength: 100,
  maximumEmailLength: 160,
  slugRandomBytes: 3,
} as const;

export const WORKSHOP_STATUS_OPTIONS = ["ACTIVE", "SUSPENDED"] as const;
export const INITIAL_SUBSCRIPTION_STATUS_OPTIONS = ["TRIAL", "ACTIVE"] as const;

export const PLATFORM_ADMIN_DEFAULTS = {
  planCode: "SOLO_TECHNICIAN",
  technicianRole: "OWNER",
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
  emailLabel: "Correo",
  passwordLabel: "Contraseña",
  loginAction: "Ingresar a la consola",
  loginPending: "Validando acceso...",
  dashboardTitle: "Clientes SaaS",
  dashboardDescription: "Alta, activación y suspensión de talleres independientes.",
  logoutAction: "Cerrar sesión",
  createTitle: "Vender una cuenta",
  createDescription: "Creá el taller y las credenciales de su técnico propietario en una sola operación.",
  workshopNameLabel: "Nombre del taller",
  ownerNameLabel: "Nombre del técnico",
  ownerEmailLabel: "Correo de acceso",
  ownerPasswordLabel: "Contraseña temporal",
  subscriptionStatusLabel: "Inicio comercial",
  trialOption: "Prueba",
  activeOption: "Cliente activo",
  planLabel: "Plan",
  planSoloLabel: "Técnico independiente",
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
  ownerColumn: "Técnico propietario",
  planColumn: "Plan",
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
  totalWorkshopsMetric: "Total vendido",
  accessActive: "Habilitado",
  accessSuspended: "Suspendido",
  subscriptionTrial: "Prueba",
  subscriptionActive: "Activo",
  subscriptionSuspended: "Suspendido",
  subscriptionCancelled: "Cancelado",
  loadingWorkshops: "Actualizando talleres...",
  unknownError: "No se pudo completar la operación",
  invalidCredentials: "Correo o contraseña incorrectos",
  inactiveAdmin: "La cuenta administradora está inactiva",
  unauthenticated: "La sesión del administrador no es válida",
  workshopNotFound: "El taller no existe",
  ownerEmailExists: "Ya existe un técnico con ese correo",
  invalidRequest: "Los datos enviados no son válidos",
  internalError: "Ocurrió un error interno",
  logoutSuccess: "Sesión cerrada",
  sessionCreated: "Sesión iniciada",
  workshopNameRequired: "Ingresá el nombre del taller",
  ownerNameRequired: "Ingresá el nombre del técnico",
  emailInvalid: "Ingresá un correo válido",
  passwordTooShort: "La contraseña debe tener al menos 10 caracteres",
  passwordTooLong: "La contraseña no puede superar 72 caracteres",
  credentialsWorkshopPrefix: "Taller:",
  credentialsEmailPrefix: "Usuario:",
  credentialsPasswordPrefix: "Contraseña temporal:",
} as const;

export const PLATFORM_ADMIN_SEED_TEXT = {
  missingEnvironment:
    "Definí PLATFORM_ADMIN_EMAIL, PLATFORM_ADMIN_PASSWORD y PLATFORM_ADMIN_NAME antes de ejecutar el seed",
  createdPrefix: "Administrador de plataforma preparado:",
} as const;

export const PLATFORM_ADMIN_FIELDS = {
  loginEmail: "platform-admin-email",
  loginPassword: "platform-admin-password",
  workshopName: "workshop-name",
  ownerName: "workshop-owner-name",
  ownerEmail: "workshop-owner-email",
  ownerPassword: "workshop-owner-password",
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
  },
  suspended: {
    workshopStatus: "SUSPENDED",
    technicianStatus: "SUSPENDED",
    subscriptionStatus: "SUSPENDED",
    auditAction: PLATFORM_ADMIN_AUDIT.workshopSuspended,
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

export const PLATFORM_ADMIN_METADATA = {
  title: "Service Tech · Administración SaaS",
  description: "Consola para vender y administrar talleres técnicos",
} as const;

export const WORKSHOP_STATUS_LABELS: Record<"ACTIVE" | "SUSPENDED", string> = {
  ACTIVE: PLATFORM_ADMIN_TEXT.accessActive,
  SUSPENDED: PLATFORM_ADMIN_TEXT.accessSuspended,
};

export const SUBSCRIPTION_STATUS_LABELS: Record<
  "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED",
  string
> = {
  TRIAL: PLATFORM_ADMIN_TEXT.subscriptionTrial,
  ACTIVE: PLATFORM_ADMIN_TEXT.subscriptionActive,
  SUSPENDED: PLATFORM_ADMIN_TEXT.subscriptionSuspended,
  CANCELLED: PLATFORM_ADMIN_TEXT.subscriptionCancelled,
};
