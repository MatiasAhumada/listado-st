# Prueba del MVP administrativo

## Preparación local

1. Copiar `.env.example` a `.env` y configurar `DATABASE_URL`.
2. Ejecutar `pnpm reset`. Este comando borra la base, aplica las migraciones y ejecuta el seed.
3. Guardar la contraseña aleatoria que aparece en la terminal. El usuario inicial es `admin` y la contraseña se muestra una sola vez.
4. Ejecutar `pnpm dev`.
5. Abrir `http://localhost:3008/login`.

No se configuran usuarios ni contraseñas en `.env`.

## Recorrido de aceptación

1. Ingresar como `admin` desde el único formulario de login, sin seleccionar un rol.
2. Abrir `Planes` y crear un plan activo con precio y periodicidad.
3. Editar el plan y comprobar que también puede desactivarse y reactivarse sin borrarlo.
4. Crear un taller en modalidad de prueba, seleccionar el plan y ajustar el precio acordado.
5. Guardar el usuario y la contraseña temporal mostrados en pantalla.
6. Confirmar en la tabla el plan, la periodicidad y el precio acordado.
7. Reasignar otro plan, editar expresamente el nuevo precio acordado y pulsar `Aplicar`.
8. Suspender el taller y comprobar que tanto el acceso como la suscripción aparecen suspendidos.
9. Reactivar el taller y comprobar que la suscripción vuelve a `Prueba`, no a un estado distinto del anterior.
10. Cerrar sesión e ingresar en el mismo `/login` con las credenciales del taller; debe redirigir a `/cliente`.

## Smoke test HTTP

Con el servidor activo, la base recién reseteada y la contraseña impresa por el seed:

```powershell
$env:ADMIN_SEED_PASSWORD="contraseña-impresa-por-el-seed"
pnpm smoke:admin
Remove-Item Env:ADMIN_SEED_PASSWORD
```

La prueba crea dos planes, un taller con precio negociado, reasigna el plan, suspende y reactiva el taller, inicia sesión como cliente y valida su espacio privado.
