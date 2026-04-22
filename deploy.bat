@echo off
echo 🚀 Iniciando despliegue completo...

REM 1. Revertir productos a lista maestra
echo 📦 Revirtiendo productos a lista maestra...
call pnpm revertir:productos-maestra

REM 2. Crear migración con nombre
echo 🔄 Creando migración...
call pnpm migrate --name add_master_product_relation

REM 3. Generar cliente Prisma
echo ⚙️ Generando cliente Prisma...
call npx prisma generate

REM 4. Generar copias para empresas
echo 📋 Generando copias de productos para empresas...
call pnpm generar:copias-empresas

REM 5. Build del proyecto
echo 🏗️ Compilando proyecto...
call pnpm build

REM 6. Git commit
echo 💾 Guardando cambios en Git...
git add .
git commit -m "feat: implementar sistema de productos maestros con copias por empresa - Agregar campo masterProductId para relacion maestro-copia - Crear copias automaticas de productos para todas las empresas - Actualizar cost en todas las copias cuando tecnico modifica costTech - Separar vistas: tecnico ve maestros, empresas/vendedores ven copias - Agregar scripts de migracion y generacion de copias"

echo ✅ Despliegue completado exitosamente!
pause
