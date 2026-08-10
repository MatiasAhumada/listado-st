# Estado de implementación

Actualizado: 2026-08-10

## Entregado: administración e identidad técnica

La aplicación ya contiene la primera porción productiva del nuevo SaaS:

- Administrador de plataforma separado de los usuarios de talleres.
- Sesiones opacas, revocables y almacenadas en cookies `httpOnly`.
- Alta atómica de taller, técnico propietario y suscripción.
- Plan inicial para técnicos independientes.
- Inicio comercial como prueba o cliente activo.
- Suspensión y reactivación coordinada de taller, técnico y suscripción.
- Registro auditable de altas y cambios de acceso.
- Migración base nueva sin conservar el dominio anterior.
- Seed del primer administrador mediante variables de entorno.
- Pruebas automáticas del ciclo de acceso.
- Login del técnico con las credenciales creadas por el administrador.
- Sesiones técnicas opacas, revocables y separadas de la sesión administrativa.
- Área privada resuelta exclusivamente desde el `workshopId` de la sesión.
- Revocación automática de sesiones técnicas al suspender un taller.
- Respuesta `404` segura ante cualquier inconsistencia de tenant.
- Pruebas de aislamiento utilizando dos talleres distintos.

## Flujo comprobable

1. Iniciar sesión en `/admin/login`.
2. Crear un taller y su técnico propietario.
3. Copiar las credenciales temporales que muestra la consola.
4. Verificar el taller en el listado.
5. Suspenderlo y comprobar que todos sus accesos cambian de forma coordinada.
6. Reactivarlo y comprobar que vuelve al estado activo.
7. Iniciar sesión como técnico en `/taller/login`.
8. Confirmar que `/taller` muestra únicamente la identidad y el taller asociados a esa sesión.
9. Suspender el taller y comprobar que la sesión técnica queda revocada.

## Prototipo conservado

La ruta principal `/` mantiene el prototipo descartable de cotización. Continúa sin persistencia y se utilizará como referencia al construir el flujo productivo del técnico.

## Próximo bloque

El siguiente entregable será la importación, revisión y publicación del catálogo global de repuestos desde la consola administrativa. Luego se construirá el primer flujo productivo del técnico sobre clientes y presupuestos.
