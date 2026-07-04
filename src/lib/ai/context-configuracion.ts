export function buildConfiguracionContext(): string {
	return `# Configuración

La configuración te permite personalizar la apariencia y el comportamiento de RamoLibre. Cada semestre tiene su propia configuración independiente.

## Tema visual

Puedes cambiar la apariencia de la interfaz eligiendo entre diferentes temas:
- Tema oscuro (predeterminado)
- Tema claro
- Otros temas disponibles

## Preferencias de visualización

**Horarios:**
- Mostrar eventos del calendario dentro de la vista de horarios semanales.
- Orientación de la vista: normal (días en columnas, horas en filas) o rotada (días en filas, horas en columnas).

**Calendario:**
- Mostrar los horarios recurrentes dentro de la vista mensual del calendario.

**Barra lateral:**
- Mantener la barra lateral colapsada o expandida.

## Comportamiento

**Al eliminar un ramo:**
- También se eliminan sus horarios y escenarios vinculados automáticamente.

## Ejemplos

**Cambiar a tema claro:**
1. Ir a Configuración.
2. Seleccionar el tema claro.
3. La interfaz se actualiza al instante.

**Ajustar visualización:**
1. Activar "Mostrar horarios en el calendario" para ver tus clases en la vista mensual.
2. Cambiar la orientación del horario a "rotada" para ver los días en filas.`;
}
