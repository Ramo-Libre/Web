export function buildCalendarioContext(): string {
	return `# Calendario

El calendario muestra una vista mensual con todos tus eventos combinados: tanto los horarios recurrentes como los eventos one-off.

## Vista mensual

- Los días del mes se muestran en una cuadrícula.
- Los días con eventos tienen un indicador visual.
- El día actual se resalta con un color distintivo.
- Puedes navegar entre meses usando los controles anterior y siguiente.
- Los eventos se ven al hacer clic en un día.

## Filtros

Puedes filtrar los eventos que se muestran en el calendario:

- **Por ramo**: muestra solo los eventos de un ramo específico.
- **Por categoría**: muestra solo eventos de ciertas categorías (exámenes, clases, laboratorios, etc.).
- **Ver horarios**: opción para incluir o excluir los horarios recurrentes en la vista del calendario.

## Eventos

Cada evento en el calendario muestra:
- El título del evento.
- La hora (si tiene).
- El color del ramo al que está vinculado (si aplica).
- La categoría (examen, clase, etc.).

Al hacer clic en un evento puedes ver su detalle completo y editarlo.

## Ejemplos

**Navegar y filtrar:**
1. Ir al mes de junio 2026.
2. Activar el filtro "Ver horarios" para incluir las clases recurrentes.
3. Filtrar por ramo "Cálculo I" para ver solo sus eventos.
4. Hacer clic en el día 15 para ver el examen programado.

**Crear evento desde el calendario:**
1. Ir al mes de julio 2026.
2. Hacer clic en el día 10.
3. Crear un evento "Entrega informe" categoría Otro, sin ramo vinculado.`;
}
