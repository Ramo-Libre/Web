export function buildNotasContext(): string {
	return `# Notas y Escenarios

Los escenarios te permiten definir reglas de evaluación para calcular notas y simular resultados. Cada escenario puede vincularse a un ramo.

## Campos de un escenario

- **Nombre**: texto libre, ej. "Nota Final", "Aprobación".
- **Ramo vinculado**: opcional, conecta el escenario con un ramo.
- **Reglas**: un script en el Lenguaje de Dominio Específico (DSL) de RamoLibre que define las ecuaciones, restricciones y dominios del escenario.
- **Entradas de notas**: valores numéricos que ingresas para cada variable libre (ej. C1 = 65, C2 = 80).
- **Resultados**: el sistema calcula automáticamente:
  - **Factibilidad**: si es posible aprobar con alguna combinación de notas.
  - **Probabilidad**: porcentaje de factibilidad.
  - **Restricciones incumplidas**: qué condiciones no se están cumpliendo.
  - **Variables libres**: qué notas puedes ajustar.
   - **Estrategia de resolución**: método usado para el cálculo (Balance, Mínimo, Seguro, Uniforme).

## Tipos de reglas

Las reglas se agrupan en tres tipos para visualización:
- **Asignaciones**: variables que se calculan automáticamente (ej. "Nota Final = promedio de certámenes").
- **Restricciones**: condiciones que deben cumplirse para aprobar (ej. "Nota Final >= 55").
- **Dominios**: rangos válidos para las variables libres (ej. "C1 entre 0 y 100").

## Botón de ayuda para las reglas

Dentro del editor de reglas hay un botón **"Copiar Contexto IA"** que entrega la documentación completa del DSL, incluyendo sintaxis, funciones disponibles (promedio, mínimo, máximo, etc.) y ejemplos. Úsalo cuando necesites ayuda para escribir o modificar las reglas de un escenario.

## Ejemplos

**Crear escenario básico:**
1. Nombre: "Nota Final Cálculo"
2. Ramo: "Cálculo I"
3. Escribir las reglas: definir variables libres, asignaciones y restricciones.
4. Ingresar notas: C1 = 70, C2 = 60.
5. Ver resultado: factibilidad y probabilidad calculadas automáticamente.

**Simular diferentes resultados:**
1. Cambiar la estrategia a "Seguro".
2. Ajustar las notas ingresadas.
3. Ver cómo cambian los resultados.`;
}
