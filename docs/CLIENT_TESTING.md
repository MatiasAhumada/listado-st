# Prueba del acceso cliente

## Preparación

1. Ejecutar `pnpm dev`.
2. Ingresar en `http://localhost:3008/login` con las credenciales del administrador; el rol se resuelve automáticamente.
3. Crear un taller y guardar las credenciales temporales del cliente.
4. Verificar que el taller se encuentre activo o en prueba.

## Recorrido de aceptación

1. Abrir `http://localhost:3008/` y confirmar la redirección a `/login`.
2. Ingresar en el mismo formulario con el usuario y contraseña entregados por el administrador; no debe existir un selector de rol.
3. Confirmar que `/cliente` conduce a `/cliente/taller` y muestra el taller correcto.
4. Cerrar sesión y comprobar que `/cliente/taller` redirige nuevamente a `/login`.
5. Desde la consola administrativa, suspender el taller.
6. Confirmar que las sesiones del cliente quedan revocadas y que el login es rechazado.
7. Reactivar el taller.
8. Iniciar una sesión nueva y confirmar que el acceso vuelve a estar disponible.

## Recorrido operativo

1. Abrir la pestaña `Clientes` y registrar nombre, contacto y primer celular.
2. Agregar un segundo celular y comprobar que ambos quedan dentro del mismo contacto.
3. Abrir `Presupuestos`, seleccionar cliente y celular y describir el problema informado.
4. Buscar un repuesto disponible y agregarlo como alternativa.
5. Comprobar el costo de referencia y la sugerencia calculada por la plataforma.
6. Cambiar proveedor, costo propio y precio final; la ganancia estimada debe actualizarse.
7. Agregar una alternativa manual con importes distintos.
8. Guardar el borrador y comprobar que el contador de presupuestos cambia.
9. Marcar el presupuesto como enviado; aparece la revisión 1 con vigencia e importes bloqueados.
10. Preparar una revisión nueva, cambiar un precio, guardar y enviar.
11. Confirmar que la revisión 1 conserva el importe anterior y la revisión 2 muestra el nuevo.
12. Marcar manualmente una alternativa de la revisión 2 como aceptada.
13. Comprobar que el tablero muestra un presupuesto aceptado y que las acciones de aceptación desaparecen.
14. Abrir `Reparaciones` y confirmar el ingreso físico del celular.
15. Cambiar el estado a diagnóstico, reparación y listo para retirar; revisar el historial.
16. Registrar una seña y comprobar que el saldo baja sin modificar el precio acordado.
17. Cargar al menos dos gastos y comprobar la ganancia real.
18. Anular uno de los gastos y confirmar que aparecen el movimiento original y su ajuste negativo.
19. Registrar el cobro final; el sistema debe proponer exactamente el saldo pendiente.
20. Marcar el trabajo como entregado y confirmar que deja de contar como activo.
21. Desde el administrador, reducir temporalmente el plazo de un estado y comprobar la alerta interna.

Los costos, proveedores y ganancias son información interna. El texto copiable para WhatsApp incluye solamente las alternativas y precios finales de la revisión enviada.

El navegador nunca envía ni almacena el `workshopId`. La sesión opaca resuelta en el servidor es la única fuente de autoridad del tenant.
