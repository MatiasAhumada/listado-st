# Prueba del catálogo global

## Preparación

1. Ejecutar `pnpm dev`.
2. Iniciar sesión en `http://localhost:3008/admin/login`.
3. Tener disponible el archivo `C:\Users\Matias\Downloads\MODULOS.xlsx`.

## Importación y revisión administrativa

1. Abrir la pestaña `Catálogo global`.
2. Seleccionar `MODULOS.xlsx` y presionar `Analizar Excel`.
3. Confirmar el siguiente resumen de la lista de referencia:
   - 515 repuestos disponibles.
   - 192 filas sin stock excluidas.
   - 111 próximos ingresos excluidos.
   - 478 filas informativas omitidas.
   - 1296 filas analizadas en total.
4. Buscar por marca o modelo dentro del borrador y verificar que solo aparezcan los 515 disponibles.
5. Mantener la regla inicial en `Agregar 100%` y guardarla.
6. Publicar el catálogo.
7. Confirmar que el borrador desaparece y queda indicada la versión visible para técnicos.

## Consulta técnica

1. Iniciar sesión en `http://localhost:3008/taller/login` con un taller habilitado.
2. Buscar un repuesto disponible por modelo o marca.
3. Confirmar que el costo coincide con el Excel y que el precio sugerido duplica el costo con la regla de 100%.
4. Buscar un repuesto marcado en rojo o como próximo ingreso en el Excel y confirmar que no aparece.
5. Verificar que la pantalla presenta los importes como referencias y aclara que el costo, proveedor y precio final podrán modificarse al presupuestar.

## Cambio de reglas

1. Volver a la pestaña administrativa del catálogo.
2. Agregar rangos de costo en orden ascendente y dejar el último sin límite.
3. Guardar las reglas.
4. Consultar nuevamente desde un técnico y comprobar que la sugerencia publicada se recalcula con la regla vigente.
