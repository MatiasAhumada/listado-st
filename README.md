# Service Tech

MVP fullstack para administrar la venta de Service Tech a talleres de reparación. El administrador crea planes, da de alta talleres con una cuenta cliente, conserva el precio acordado y controla el acceso. Administradores y clientes usan el mismo login con usuario y contraseña; el servidor resuelve el rol y redirige automáticamente.

## Stack

Next.js App Router, TypeScript, PostgreSQL con Prisma, Tailwind CSS 4 y shadcn/ui.

## Puesta en marcha

1. Copiar `.env.example` a `.env` y configurar solamente `DATABASE_URL`.
2. Instalar dependencias con `pnpm install`.
3. Ejecutar `pnpm reset`.
4. Guardar la contraseña aleatoria que el seed muestra una única vez. El usuario inicial es `admin`.
5. Iniciar con `pnpm dev` y abrir `http://localhost:3008/login`.

`pnpm reset` borra la base configurada, vuelve a aplicar todas las migraciones y ejecuta el seed. No necesita credenciales administrativas en `.env`.

## Comandos

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm reset
pnpm seed
pnpm admin:rotate-password
pnpm smoke:admin
```

El smoke test requiere la contraseña recién impresa sólo durante esa ejecución:

```powershell
$env:ADMIN_SEED_PASSWORD="contraseña-impresa-por-el-seed"
pnpm smoke:admin
Remove-Item Env:ADMIN_SEED_PASSWORD
```

La guía funcional está en [docs/ADMIN_TESTING.md](docs/ADMIN_TESTING.md).

`pnpm seed` crea el administrador sólo cuando no existe. Para recuperar el acceso sin borrar la base, `pnpm admin:rotate-password` invalida sus sesiones, genera una contraseña nueva y la imprime una sola vez.
