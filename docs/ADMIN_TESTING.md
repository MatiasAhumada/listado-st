# Prueba del flujo administrador

## Preparación local

1. Copiar `.env.example` a `.env` y configurar `DATABASE_URL`.
2. Definir `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD` y `PLATFORM_ADMIN_NAME`.
3. Ejecutar `pnpm reset` para crear la base nueva desde cero.
4. Ejecutar `pnpm seed` si el reset se realizó sin seed.
5. Ejecutar `pnpm dev`.
6. Abrir `http://localhost:3008/login` y seleccionar `Administrador`.

## Recorrido de aceptación

1. Ingresar con el administrador configurado en el seed.
2. Crear un taller en modalidad de prueba.
3. Guardar las credenciales temporales mostradas en pantalla.
4. Confirmar que el taller aparece como habilitado y en prueba.
5. Suspender el taller.
6. Confirmar que el acceso y la suscripción aparecen suspendidos.
7. Reactivar el taller.
8. Confirmar que el acceso y la suscripción aparecen activos.

Las credenciales generadas permiten probar el acceso del cliente desde `/login`.
