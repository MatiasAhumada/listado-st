# Prueba del acceso técnico

## Preparación

1. Ejecutar `pnpm dev`.
2. Ingresar en `http://localhost:3008/admin/login`.
3. Crear un taller y guardar las credenciales temporales del técnico propietario.
4. Verificar que el taller se encuentre activo o en prueba.

## Recorrido de aceptación

1. Abrir `http://localhost:3008/taller/login`.
2. Ingresar con las credenciales entregadas por el administrador.
3. Confirmar que el nombre, correo, plan y suscripción pertenecen al taller correcto.
4. Cerrar sesión y comprobar que `/taller` redirige nuevamente al login.
5. Desde la consola administrativa, suspender el taller.
6. Confirmar que las sesiones técnicas existentes quedan revocadas y que el login es rechazado.
7. Reactivar el taller.
8. Iniciar una sesión nueva y confirmar que el acceso vuelve a estar disponible.

El navegador nunca envía ni almacena el `workshopId`. La sesión opaca resuelta en el servidor es la única fuente de autoridad del tenant.
