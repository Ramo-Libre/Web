export function buildHorariosContext(): string {
	return `# Horarios

Los horarios definen la recurrencia semanal de tus clases y actividades. Pueden ser eventos que se repiten cada semana o eventos que ocurren una sola vez.

## Tipos de eventos

**Eventos recurrentes:**
- Se repiten semanalmente en los días seleccionados.
- Tienen un rango de fechas durante el cual aplican (inicio y fin).
- Ejemplo: "Clase de Cálculo" todos los Lunes y Miércoles de marzo a junio.

**Eventos one-off (una sola vez):**
- Ocurren en una fecha específica.
- Ejemplo: "Examen parcial" el 15 de junio.

## Campos de un evento

- **Título**: texto opcional para identificar el evento.
- **Categoría**: define el tipo de actividad. Las categorías disponibles son:
  - Examen
  - Clase
  - Laboratorio
  - Ayudantía
  - Taller
  - Urgente
  - Evento
  - Entrega
  - Viaje
  - Otro
- **Descripción**: texto opcional con notas adicionales.
- **Hora de inicio y hora de fin**: en formato de 24 horas (ej. 10:00, 14:30).
- **Ramo vinculado**: opcional, conecta el evento con un ramo.
- **Días de la semana** (para recurrentes): Lun(1), Mar(2), Mié(3), Jue(4), Vie(5), Sáb(6), Dom(7).
- **Fecha específica** (para one-off): día exacto en formato año-mes-día.
- **Rango de fechas** (para recurrentes): desde cuándo y hasta cuándo aplica la recurrencia.

## Vista semanal

Los horarios se muestran en una cuadrícula semanal con los días en columnas y las horas en filas. Cada evento aparece como una barra coloreada según el color del ramo vinculado. Puedes alternar entre vista normal (días en columnas) y vista rotada (días en filas).

## Ejemplos

**Crear evento recurrente:**
1. Categoría: Clase
2. Título: "Cálculo I"
3. Días: Lunes y Miércoles
4. Hora: 10:00 a 11:30
5. Ramo: "Cálculo I"
6. Rango: desde 2026-03-01 hasta 2026-06-30

**Crear evento one-off:**
1. Categoría: Examen
2. Título: "Prueba 1"
3. Fecha: 2026-04-15
4. Hora: 09:00 a 10:30
5. Ramo: "Cálculo I"`;
}
