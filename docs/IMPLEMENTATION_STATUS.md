# Estado de implementación

Actualizado: 2026-08-11

## Prioridad actual: MVP administrativo

El alcance inmediato queda centrado en cerrar y validar el circuito de administración antes de continuar refinando la experiencia cliente:

- Un único login con usuario y contraseña, sin selector de rol.
- Redirección automática a administración o cliente según la cuenta autenticada.
- Planes de venta administrables.
- Alta de clientes con rol de taller y plan obligatorio.
- Precio acordado persistido en la suscripción para facilitar el cobro posterior.
- Paleta visual histórica en tonos verde bosque, salvia, lima y crema.

## Entregado: administración e identidad cliente

La aplicación ya contiene la primera porción productiva del nuevo SaaS:

- Administrador de plataforma y usuarios de talleres con identidades separadas, pero acceso visual unificado.
- Sesiones opacas, revocables y almacenadas en cookies `httpOnly`.
- Alta atómica de taller, cuenta cliente y suscripción.
- Planes comerciales persistidos con nombre, precio, moneda, periodicidad y estado.
- Precio pactado copiado en cada suscripción para conservar el valor vendido.
- Alta de clientes condicionada a la selección de un plan activo.
- Edición y reasignación explícita de planes sin alterar silenciosamente suscripciones existentes.
- Inicio comercial como prueba o cliente activo.
- Suspensión y reactivación coordinada de taller, cliente y suscripción.
- Registro auditable de altas y cambios de acceso.
- Migración base nueva sin conservar el dominio anterior.
- Seed autónomo del primer administrador con usuario `admin` y contraseña aleatoria mostrada una sola vez.
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
- Agenda de clientes persistida y aislada por taller.
- Uno o varios celulares asociados a cada cliente, con IMEI único dentro del taller.
- Presupuestos previos al ingreso físico del celular.
- Alternativas manuales o basadas en repuestos disponibles del catálogo publicado.
- Costo y sugerencia del catálogo resueltos nuevamente en el servidor para impedir su manipulación desde el navegador.
- Proveedor, costo elegido y precio final configurables en cada alternativa.
- Cálculo visible de ganancia estimada por alternativa.
- Revisiones enviadas inmutables, numeradas y con vigencia configurable.
- Historial completo de importes ofrecidos aunque se prepare una revisión nueva.
- Aceptación manual de una única alternativa de la revisión vigente más reciente.
- Estado vencido calculado automáticamente al superar la vigencia.
- Mensaje de WhatsApp generado exclusivamente con precios visibles para el cliente.
- Tablero del cliente alimentado por métricas y actividad reales, sin registros maquetados.
- Alta de reparación exclusivamente desde un presupuesto aceptado y al confirmar el ingreso físico.
- Estados globales fijos con transiciones controladas e historial inmutable.
- Alertas internas por permanencia en cada estado, con horas administrables desde la consola SaaS.
- Señas, cobros parciales y cobro final con control de saldo.
- Varios gastos por reparación, separados por repuesto, insumo, servicio tercerizado u otro.
- Movimientos financieros inmutables: una anulación crea un ajuste inverso y conserva el original.
- Actor y fecha almacenados en cada estado, cobro, gasto y ajuste.
- Saldo, total cobrado, gastos reales y ganancia real calculados desde el libro histórico.

## Flujo comprobable

1. Iniciar sesión en `/login` como administrador.
2. Crear y activar un plan comercial con su precio y periodicidad.
3. Crear un taller y su cuenta cliente seleccionando el plan.
4. Copiar las credenciales temporales que muestra la consola.
5. Verificar el plan y el importe acordado en el listado.
6. Suspenderlo y comprobar que todos sus accesos cambian de forma coordinada.
7. Reactivarlo y comprobar que recupera su estado comercial anterior (`Prueba` o `Activo`).
8. Iniciar sesión como cliente desde `/login`.
9. Confirmar que `/cliente` conduce a `/cliente/taller` y muestra únicamente el taller asociado a esa sesión.
10. Suspender el taller y comprobar que la sesión cliente queda revocada.
11. Abrir la pestaña `Catálogo global` e importar `MODULOS.xlsx`.
12. Revisar el resumen, buscar repuestos disponibles y publicar el borrador.
13. Volver a iniciar sesión como cliente y consultar la lista publicada.
14. Registrar un cliente y su primer celular en la pestaña `Clientes`.
15. Crear un presupuesto con una alternativa del catálogo y otra manual.
16. Cambiar proveedor, costo real y precio final sin alterar la sugerencia de referencia.
17. Guardar el borrador y marcarlo como enviado para generar una revisión inmutable.
18. Preparar una nueva revisión, cambiar un importe y comprobar que la anterior conserva sus valores.
19. Marcar manualmente la alternativa aceptada de la última revisión vigente.
20. Iniciar sesión en otro taller y confirmar que no ve ni puede modificar esos registros.
21. Confirmar el ingreso físico desde `Reparaciones`.
22. Avanzar por los estados fijos y revisar que cada cambio quede en el historial.
23. Registrar una seña, uno o varios gastos y el cobro final exacto.
24. Anular un movimiento y comprobar que aparece un ajuste inverso sin borrar el original.
25. Verificar saldo cero y ganancia real calculada con los gastos efectivamente cargados.
26. Desde el administrador, cambiar las horas de alerta y comprobar el aviso interno en un trabajo demorado.
27. Entregar el trabajo y confirmar que sale del contador de reparaciones activas.

## Prototipo conservado

La ruta principal `/` resuelve la sesión hacia `/login`, `/admin` o `/cliente`. La gestión del negocio del cliente vive debajo de `/cliente`; el taller actual se encuentra en `/cliente/taller`. El prototipo descartable se conserva únicamente en `/cliente/taller/prototipo`, protegido por sesión.

## Próximo bloque

El siguiente entregable es el cierre de beta: documento imprimible del presupuesto, revisión final de seguridad y recorrido integral listo para despliegue.
