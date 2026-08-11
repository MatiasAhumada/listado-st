export const ACCESS_ROUTES = {
  login: "/login",
  sessionApi: "/auth/session",
} as const;

export const ACCESS_ROLES = {
  admin: "ADMIN",
  client: "CLIENT",
} as const;

export const ACCESS_TEXT = {
  productName: "Service Tech",
  eyebrow: "Acceso unificado",
  title: "Tu operación, en un solo lugar.",
  description:
    "Ingresá con tu usuario y contraseña. Service Tech reconoce tu perfil y abre el espacio correcto.",
  formTitle: "Ingresar a Service Tech",
  formDescription: "No necesitás elegir un tipo de cuenta.",
  usernameLabel: "Usuario",
  passwordLabel: "Contraseña",
  loginAction: "Ingresar",
  loginPending: "Validando acceso...",
  securityNote: "Sesión privada, segura y revocable.",
  invalidCredentials: "Usuario o contraseña incorrectos",
  usernameInvalid: "Usá entre 3 y 40 caracteres: letras, números, punto, guion o guion bajo",
  passwordTooShort: "La contraseña debe tener al menos 10 caracteres",
  passwordTooLong: "La contraseña no puede superar 72 caracteres",
  internalError: "Ocurrió un error interno",
  sessionCreated: "Sesión iniciada",
  logoutSuccess: "Sesión cerrada",
  adminFlowLabel: "Admin",
  plansFlowLabel: "Planes",
  workshopsFlowLabel: "Talleres",
} as const;

export const ACCESS_FIELDS = {
  username: "access-username",
  password: "access-password",
} as const;
