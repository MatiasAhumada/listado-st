export const PLATFORM_SEED_ADMIN = {
  username: "admin",
  displayName: "Administrador",
  passwordRandomBytes: 18,
  minimumGeneratedPasswordLength: 20,
} as const;

export const PLATFORM_SEED_TEXT = {
  start: "[seed] Preparando administrador inicial...",
  title: "Administrador inicial creado",
  rotatedTitle: "Contraseña del administrador rotada",
  existingTitle: "Administrador inicial ya existente",
  usernameLabel: "Usuario",
  passwordLabel: "Contraseña",
  passwordNotice: "Guardá esta contraseña: no vuelve a mostrarse.",
  existingNotice: "La contraseña existente no fue modificada ni puede volver a mostrarse.",
  usernameConflict: "El usuario reservado para administración ya pertenece a un taller",
} as const;

export const PLATFORM_SEED_FLAGS = {
  rotatePassword: "--rotate-password",
} as const;
