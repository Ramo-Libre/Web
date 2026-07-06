export function buildDashboardContext(): string {
	return `# Panel Principal

El panel principal es el resumen inteligente de tu semestre activo. Muestra información clave de un vistazo, organizada en varias secciones.

## Próxima clase

Muestra la clase o evento más próximo según el día y hora actual:
- Nombre del ramo y su color.
- Hora de inicio.
- Estado actual ("En curso" si está ocurriendo ahora, o la hora de inicio si está próxima).
- Si no hay clases programadas, muestra un mensaje indicándolo.

## Carga mensual

Gráfico de línea que muestra la cantidad de eventos por cada día del mes actual:
- El eje horizontal son los días del mes.
- El eje vertical es la cantidad de eventos.
- Una línea roja punteada indica el día de hoy.
- Área sombreada bajo la línea para mejor visualización.

## Probabilidades

Lista de barras, una por cada ramo:
- Nombre del ramo y su color.
- Barra de progreso con el porcentaje de factibilidad.
- Si un ramo está garantizado (100%), la barra se muestra completa en color verde.
- Si no hay escenarios, la sección no se muestra.

## Próximos eventos

Lista de eventos en los próximos 7 días:
- Fecha y día de la semana.
- Categoría del evento con su icono.
- Título del evento.
- Nombre del ramo vinculado (si aplica).
- Hora del evento.
- Al hacer clic en un evento, se abre su detalle en el calendario.

## Ejemplos

**Interpretar el panel:**
1. Ver la próxima clase: "Cálculo I" a las 10:00, "En curso".
2. Revisar la carga mensual: los días con más eventos tienen el pico más alto en el gráfico.
3. Ver probabilidades: "Cálculo I" tiene 85% de factibilidad, "Álgebra" está garantizado al 100%.
4. Consultar próximos eventos: "Examen parcial" el viernes 15 a las 09:00.`;
}
