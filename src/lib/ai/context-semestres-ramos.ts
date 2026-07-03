export function buildSemestresRamosContext(): string {
	return `# Semestres y Ramos

## Semestres

Los semestres son períodos académicos que agrupan tus datos. Puedes tener varios y elegir cuál está activo.

**Campos de un semestre:**
- **Nombre**: texto libre, ej. "2026-1", "Primer Semestre", "Verano 2026"

**Acciones disponibles:**
- Crear un nuevo semestre con un nombre.
- Cambiar el semestre activo para ver sus datos.
- Renombrar un semestre existente.
- Eliminar un semestre (borra todos sus datos: ramos, horarios, calendario, notas y configuración).
- Al crear un semestre, se activa automáticamente.

## Ramos

Los ramos son las asignaturas que cursas. Se agregan dentro del semestre activo.

**Campos de un ramo:**
- **Nombre**: texto libre, ej. "Cálculo I", "Álgebra Lineal"
- **Color**: uno de 18 colores disponibles (rojo, naranja, amarillo, verde, turquesa, celeste, azul, índigo, violeta, morado, rosado, slate)

**Acciones disponibles:**
- Agregar un ramo con nombre y color.
- Editar el nombre o color de un ramo existente.
- Eliminar un ramo (opcionalmente borra sus horarios y escenarios vinculados, según la configuración).
- Ver el detalle de un ramo con sus horarios y escenarios.

## Ejemplos

**Crear un semestre y agregar ramos:**
1. Crear semestre "2026-1"
2. Agregar ramo "Cálculo I" con color azul
3. Agregar ramo "Álgebra Lineal" con color verde
4. Agregar ramo "Física" con color rojo
5. Cambiar al semestre "2025-2" para ver sus ramos

**Renombrar y eliminar:**
1. Renombrar semestre "2026-1" a "Primer Semestre 2026"
2. Eliminar ramo "Física" (con o sin limpieza de datos vinculados)
3. Eliminar semestre completo "2025-2" (se borran todos sus datos)`;
}
