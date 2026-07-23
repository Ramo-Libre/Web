export function buildPendientesContext(): string {
	return `# Pendientes

Los pendientes son una lista simple de tareas que necesitas hacer, sin fecha ni hora asociada. A diferencia de los eventos del calendario, los pendientes solo tienen un eje: se hizo o no se hizo.

## Características

- Cada pendiente tiene un **título** (obligatorio) y un **detalle opcional** (texto plano, sin formato).
- Pueden tener un **ramo asociado** (opcional), que los identifica con el color del ramo.
- El estado es binario: **pendiente** o **completado**.
- Los pendientes completados se ocultan por defecto (no se borran).
- Se pueden crear, editar y eliminar desde la vista de pendientes.
- El orden es por inserción (no hay ordenamiento por fecha o prioridad).

## Vista de pendientes

La página de pendientes muestra:
- Filtros por estado: "Pendiente" y "Completado".
- Filtros por ramo: muestra solo los pendientes de ramos específicos.
- Botón "Nuevo" para crear un pendiente.
- Cada pendiente se muestra como una tarjeta con:
  - Indicador circular de estado (lleno = completado, vacío = pendiente).
  - Borde izquierdo del color del ramo (si tiene).
  - Texto tachado y opaco si está completado.
  - Preview del detalle (si tiene).

## Crear o editar pendiente

Al crear o editar un pendiente:
- Escribir el título (requerido).
- Opcionalmente agregar un detalle (texto plano, sin formato).
- Seleccionar un ramo (opcional).
- Confirmar con "Crear" o "Guardar".
- Si está editando, puede eliminar el pendiente.

## Panel Principal (Dashboard)

El dashboard muestra un resumen de pendientes:
- Anillo de progreso con el porcentaje de completados.
- Desglose por ramo con barra de progreso y fracción hecha/total.
- Fila "Otros" para pendientes sin ramo asociado.
- Es de solo lectura, sin interacción.

## Ejemplos

**Crear pendiente:**
1. Ir a Pendientes.
2. Hacer clic en "Nuevo".
3. Escribir "Entregar informe de laboratorio".
4. Seleccionar ramo "Física II".
5. Confirmar.

**Marcar como completado:**
1. Ir a Pendientes.
2. Hacer clic en el indicador circular del pendiente.
3. El pendiente se marca como completado y se oculta de la vista predeterminada.

**Ver completados:**
1. Ir a Pendientes.
2. Activar el filtro "Completado".
3. Se muestran los pendientes completados con texto tachado.`;
}
