# Especificación aprobada: SaaS para técnicos de celulares

Estado: **APPROVED**

Fecha de aprobación: 2026-08-09
Estrategia: reescritura de dominio en un monolito modular.

## Problema

Los técnicos independientes administran consultas, presupuestos, trabajos, cobros y gastos entre WhatsApp, cuadernos, Excel y memoria. Esto provoca presupuestos olvidados, trabajos estancados y desconocimiento del margen real.

La propuesta inicial se resume en:

> Cotizar sin perder dinero y no olvidar ningún trabajo.

## Usuario inicial

Un técnico independiente que trabaja solo y repara celulares. Empresas, empleados, sucursales y otros dispositivos quedan fuera del MVP.

## Accesos y terminología

El MVP tiene únicamente dos tipos de acceso a la plataforma:

- **Administrador:** opera el SaaS, crea clientes, administra planes y controla suscripciones.
- **Cliente:** compra o prueba el SaaS. En esta primera versión es un técnico independiente con un único taller.

La palabra `técnico` describe la actividad profesional del cliente y no constituye un tercer rol. Las personas que llevan celulares a reparar se modelarán como `clientes del taller`, separadas de los clientes SaaS.

La navegación raíz solo resuelve autenticación: `/login` para visitantes, `/admin` para administradores y `/cliente` para clientes. Todas las herramientas compradas por el cliente se anidan debajo de `/cliente`, comenzando por `/cliente/taller`.

## Decisiones aprobadas

- SaaS multitenant desde el primer día.
- Matías opera como administrador de plataforma.
- El administrador crea, activa y suspende clientes manualmente.
- Existe un único plan funcional inicial para técnicos.
- Cada taller es un tenant aislado.
- No se migran los datos ni el dominio de la base actual.
- Se conserva Next.js, React, Prisma y PostgreSQL.
- No se separa el backend hasta que exista una necesidad operativa real.
- El catálogo global lo publica únicamente el administrador.
- La fuente inicial es `MODULOS.xlsx`.
- Los técnicos solo ven repuestos disponibles.
- La regla inicial de sugerencia es costo más 100%.
- El técnico puede reemplazar proveedor, costo elegido y precio final en cada alternativa.
- Un presupuesto puede existir antes del ingreso físico del celular.
- Puede contener varias alternativas y una sola puede marcarse como aceptada.
- Una revisión enviada es inmutable.
- La aceptación es manual.
- La reparación nace al confirmar el ingreso físico, no al aceptar el presupuesto.
- Los estados de reparación son globales y fijos.
- Los pagos, gastos y ajustes son múltiples, firmados, históricos e inmutables.
- Alertas únicamente dentro del sistema durante el MVP.

## Flujo principal

```text
Consulta
  -> presupuesto con alternativas
  -> envío de revisión inmutable
  -> aceptación manual
  -> ingreso físico del celular
  -> reparación y estados
  -> pagos y gastos
  -> saldo y ganancia real
```

## Fases

1. Validación concierge con prototipo descartable y cinco técnicos.
2. Fundación verificable: estructura modular, CI, pruebas y decisiones técnicas bloqueantes.
3. Identidad y aislamiento multitenant.
4. Importación, revisión y publicación del catálogo.
5. Presupuestos, alternativas, aceptación, PDF y mensaje para WhatsApp.
6. Reparaciones, estados y alertas internas.
7. Pagos, gastos, saldos y ganancias.
8. Preparación de beta.

## Puerta de validación

Antes de convertir el prototipo en arquitectura productiva deben registrarse:

- Cinco sesiones observadas con técnicos independientes.
- Al menos un compromiso de piloto real.
- Evidencia de que el flujo no es más lento que trabajar con WhatsApp y la lista.
- Al menos una señal explícita de disposición a pagar.

## Invariantes técnicos

- El navegador nunca es la fuente de autoridad del `workshopId`.
- Toda entidad privada contiene `workshopId` obligatorio.
- Los recursos de otro tenant responden con un `404` seguro y no se modifican.
- Las rutas HTTP no acceden directamente a Prisma.
- El dinero no usa `Float`.
- Las sesiones son opacas, revocables y viajan en cookies seguras `httpOnly`.
- No se almacenan tokens sensibles en `localStorage`.
- Cada operación privada se prueba con dos talleres.
- Presupuestos enviados y movimientos financieros no se sobrescriben.

## Fuera de alcance inicial

- Migración de los datos anteriores.
- Empresas con empleados o múltiples sucursales.
- Inventario y depósitos.
- Facturación fiscal y ARCA.
- Cobro automático de suscripciones.
- API automática de WhatsApp.
- Aplicación móvil nativa.
- Reparaciones de dispositivos distintos de celulares.
