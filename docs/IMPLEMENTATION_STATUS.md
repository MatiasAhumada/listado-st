# Estado de implementación

Actualizado: 2026-08-10

## En curso: Fase −1

La implementación comenzó con el prototipo descartable exigido por la especificación aprobada.

### Entregado en esta fase

- Pantalla navegable de cotización en la ruta principal.
- Fixture pequeño extraído de filas disponibles de `MODULOS.xlsx`.
- Búsqueda por modelos compatibles, incluyendo A02s, A03, A03s y A04e.
- Regla visible de sugerencia `costo + 100%`.
- Varias alternativas por presupuesto.
- Edición independiente de proveedor, costo real y precio final.
- Cálculo inmediato de ganancia estimada.
- Vista separada para el cliente sin costos ni proveedores.
- Envío manual que inmoviliza la revisión.
- Mensaje preparado para copiar a WhatsApp.
- Aceptación manual de una alternativa.
- Reinicio rápido para realizar otra sesión observada.

### Lo que todavía no persiste

Esta fase no usa autenticación ni base de datos productiva. Su propósito es medir el flujo antes de fijarlo en arquitectura y migraciones.

## Registro para cada sesión

1. Técnico observado.
2. Trabajo real cotizado.
3. Tiempo hasta encontrar el repuesto.
4. Tiempo total hasta comunicar el precio.
5. Costo sugerido y costo finalmente elegido.
6. Precio sugerido y precio finalmente comunicado.
7. Datos que faltaron o sobraron.
8. Punto donde el técnico dudó o volvió atrás.
9. Comparación contra su proceso actual de WhatsApp/lista.
10. Aceptación o rechazo de un piloto.
11. Señal concreta de disposición a pagar.

## Próxima puerta

Al completar cinco sesiones y cumplir la puerta de validación se inicia la fundación productiva: esquema nuevo, sesiones seguras, tenancy, pruebas automáticas y panel mínimo de administración.
