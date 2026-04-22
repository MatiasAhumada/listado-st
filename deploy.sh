#!/bin/bash

echo "🚀 Iniciando despliegue completo..."

# 1. Revertir productos a lista maestra
echo "📦 Revirtiendo productos a lista maestra..."
pnpm revertir:productos-maestra

# 2. Crear migración con nombre
echo "🔄 Creando migración..."
pnpm migrate --name add_master_product_relation

# 3. Generar cliente Prisma
echo "⚙️ Generando cliente Prisma..."
npx prisma generate

# 4. Generar copias para empresas
echo "📋 Generando copias de productos para empresas..."
pnpm generar:copias-empresas

# 5. Build del proyecto
echo "🏗️ Compilando proyecto..."
pnpm build

# 6. Git commit
echo "💾 Guardando cambios en Git..."
git add .
git commit -m "feat: implementar sistema de productos maestros con copias por empresa

- Agregar campo masterProductId para relación maestro-copia
- Crear copias automáticas de productos para todas las empresas
- Actualizar cost en todas las copias cuando técnico modifica costTech
- Separar vistas: técnico ve maestros, empresas/vendedores ven copias
- Agregar scripts de migración y generación de copias"

echo "✅ Despliegue completado exitosamente!"
