# Estado de implementación

Actualizado: 2026-08-10

## Entregado: primera vertical administrativa

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

## Flujo comprobable

1. Iniciar sesión en `/admin/login`.
2. Crear un taller y su técnico propietario.
3. Copiar las credenciales temporales que muestra la consola.
4. Verificar el taller en el listado.
5. Suspenderlo y comprobar que todos sus accesos cambian de forma coordinada.
6. Reactivarlo y comprobar que vuelve al estado activo.

## Prototipo conservado

La ruta principal `/` mantiene el prototipo descartable de cotización. Continúa sin persistencia y se utilizará como referencia al construir el flujo productivo del técnico.

## Próximo bloque

El siguiente entregable será el acceso del técnico propietario creado por el administrador y la fundación privada de su taller. Matías será el primer tenant utilizado para comprobar aislamiento y ciclo de acceso.
