# Estado de implementación

Actualizado: 2026-08-10

## Entregado: administración e identidad cliente

La aplicación ya contiene la primera porción productiva del nuevo SaaS:

- Administrador de plataforma separado de los usuarios de talleres.
- Sesiones opacas, revocables y almacenadas en cookies `httpOnly`.
- Alta atómica de taller, cuenta cliente y suscripción.
- Plan inicial para técnicos independientes.
- Inicio comercial como prueba o cliente activo.
- Suspensión y reactivación coordinada de taller, cliente y suscripción.
- Registro auditable de altas y cambios de acceso.
- Migración base nueva sin conservar el dominio anterior.
- Seed del primer administrador mediante variables de entorno.
- Pruebas automáticas del ciclo de acceso.
- Login del cliente con las credenciales creadas por el administrador.
- Sesiones de cliente opacas, revocables y separadas de la sesión administrativa.
- Área privada resuelta exclusivamente desde el `workshopId` de la sesión.
- Revocación automática de sesiones de cliente al suspender un taller.
- Respuesta `404` segura ante cualquier inconsistencia de tenant.
- Pruebas de aislamiento utilizando dos talleres distintos.
- Importación masiva del catálogo global desde archivos XLSX.
- Clasificación automática por disponibilidad usando colores y avisos del proveedor.
- Borrador revisable antes de publicar una nueva versión.
- Exclusión de repuestos sin stock y de próximos ingresos.
- Reglas administrables de precio sugerido por rangos de costo.
- Publicación atómica de una única versión visible para todos los talleres.
- Búsqueda del cliente limitada exclusivamente a repuestos disponibles.
- Costo de referencia y sugerencia visibles, sin impedir que el cliente elija otro proveedor o precio final.

## Flujo comprobable

1. Iniciar sesión en `/login` como administrador.
2. Crear un taller y su cuenta cliente.
3. Copiar las credenciales temporales que muestra la consola.
4. Verificar el taller en el listado.
5. Suspenderlo y comprobar que todos sus accesos cambian de forma coordinada.
6. Reactivarlo y comprobar que vuelve al estado activo.
7. Iniciar sesión como cliente desde `/login`.
8. Confirmar que `/cliente` conduce a `/cliente/taller` y muestra únicamente el taller asociado a esa sesión.
9. Suspender el taller y comprobar que la sesión cliente queda revocada.
10. Abrir la pestaña `Catálogo global` e importar `MODULOS.xlsx`.
11. Revisar el resumen, buscar repuestos disponibles y publicar el borrador.
12. Volver a iniciar sesión como cliente y consultar la lista publicada.

## Prototipo conservado

La ruta principal `/` resuelve la sesión hacia `/login`, `/admin` o `/cliente`. La gestión del negocio del cliente vive debajo de `/cliente`; el taller actual se encuentra en `/cliente/taller`. El prototipo descartable se conserva únicamente en `/cliente/taller/prototipo`, protegido por sesión.

## Próximo bloque

El siguiente entregable será el primer flujo productivo del técnico: clientes, presupuestos con alternativas y aceptación manual, integrado con el catálogo global ya publicado.
