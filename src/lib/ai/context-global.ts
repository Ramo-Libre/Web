export function buildGlobalContext(): string {
	return `# RamoLibre Web — Visión General

RamoLibre Web es un gestor académico que funciona sin conexión. Todos tus datos se guardan en el navegador y se organizan por semestre.

## Datos que maneja

Cada **semestre** contiene su propia copia de los siguientes datos, independientes entre sí:

- **Ramos**: las asignaturas que estás cursando, cada una con nombre y color.
- **Horarios**: la recurrencia semanal de tus clases y actividades.
- **Calendario**: eventos puntuales como exámenes, entregas, reuniones.
- **Notas**: escenarios con reglas de evaluación y resultados de factibilidad.
- **Pendientes**: tareas por hacer, con título, detalle opcional y ramo asociado.
- **Configuración**: preferencias de visualización y comportamiento por semestre.

## Cómo se relacionan los datos

- Los **ramos** se crean dentro de un semestre y pueden tener colores asignados.
- Los eventos de **horario**, los **escenarios de nota** y los **pendientes** pueden vincularse a un ramo.
- Al eliminar un ramo, también se eliminan sus horarios, escenarios y pendientes vinculados.
- Cada semestre es completamente independiente: cambia de semestre activo para ver sus datos.

## Resumen de funcionalidades

- **Semestres y Ramos**: crea períodos académicos y agrega tus asignaturas.
- **Horarios**: define la recurrencia semanal de tus clases con categorías y horarios.
- **Calendario**: visualiza todos tus eventos en una vista mensual.
- **Notas**: crea escenarios de evaluación, ingresa notas y simula resultados.
- **Pendientes**: registra tareas por hacer, sin fecha, con o sin ramo asociado.
- **Configuración**: ajusta el tema y preferencias de visualización.
- **Panel Principal**: resumen inteligente con próxima clase, carga mensual y probabilidades.`;
}
