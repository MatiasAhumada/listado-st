export const TECHNICIAN_TEST_TEXT = {
  activeAccess: "permite el acceso cuando técnico, taller y suscripción están activos",
  suspendedAccess: "rechaza el acceso cuando el taller está suspendido",
  ownWorkshop: "la identidad técnica solo reconoce su propio taller",
  foreignWorkshop: "la identidad técnica rechaza un taller de otro tenant",
  privateWorkspace: "el servicio privado consulta el taller derivado de la sesión",
  foreignPrivateWorkspace: "el servicio privado responde 404 ante un taller ajeno",
} as const;
