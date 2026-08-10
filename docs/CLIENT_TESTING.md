# Prueba del acceso cliente

## Preparación

1. Ejecutar `pnpm dev`.
2. Ingresar en `http://localhost:3008/login` como administrador.
3. Crear un taller y guardar las credenciales temporales del cliente.
4. Verificar que el taller se encuentre activo o en prueba.

## Recorrido de aceptación

1. Abrir `http://localhost:3008/` y confirmar la redirección a `/login`.
2. Ingresar con las credenciales entregadas por el administrador.
3. Confirmar que `/cliente` conduce a `/cliente/taller` y muestra el taller correcto.
4. Cerrar sesión y comprobar que `/cliente/taller` redirige nuevamente a `/login`.
5. Desde la consola administrativa, suspender el taller.
6. Confirmar que las sesiones del cliente quedan revocadas y que el login es rechazado.
7. Reactivar el taller.
8. Iniciar una sesión nueva y confirmar que el acceso vuelve a estar disponible.

El navegador nunca envía ni almacena el `workshopId`. La sesión opaca resuelta en el servidor es la única fuente de autoridad del tenant.
