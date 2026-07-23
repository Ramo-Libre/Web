<p align="center">
  <img src="https://raw.githubusercontent.com/Ramo-Libre/Core/refs/heads/main/packages/ui-themes/src/assets/web.svg" alt="Ramo Libre" width="96" />
</p>

<h1 align="center">Ramo Libre — Web</h1>

<p align="center">
  <img src="https://img.shields.io/github/license/Ramo-Libre/Web" alt="License" />
  <img src="https://img.shields.io/aur/version/ramolibre" alt="AUR version" />
  <img src="https://img.shields.io/github/actions/workflow/status/Ramo-Libre/Web/deploy.yml?label=deploy" alt="Web deploy" />

</p>

Remake de [RamoLibre](https://github.com/madmti/RamoLibre), un gestor académico que funciona sin conexión y organiza todos tus datos por semestre. El proceso de análisis y diseño se documenta en la [Wiki del proyecto](https://github.com/Ramo-Libre/Web/wiki).

El objetivo de este remake es ofrecer una interfaz más simple y un mejor rendimiento, integrando [Solver](https://github.com/Ramo-Libre/Solver) como módulo WASM para las predicciones y la evaluación del estado de las reglas de aprobación.

Este proyecto está abierto a ideas, sugerencias y contribuciones.

> [!TIP]
> Se recomienda revisar la [Wiki](https://github.com/Ramo-Libre/Web/wiki) para contexto adicional antes de contribuir.

## Tabla de contenidos

- [Funcionalidades](#funcionalidades)
- [Quick start](#quick-start)
- [Créditos y atribuciones](#créditos-y-atribuciones)
- [Licencia](#licencia)

## Funcionalidades

Cada semestre mantiene su propia copia de los datos, organizados en las siguientes secciones e independientes entre sí salvo por su vínculo opcional con un ramo:

- **Semestres y ramos** — crea períodos académicos y agrega tus asignaturas, cada una con nombre y color.
- **Horarios** — define la recurrencia semanal de tus clases y actividades.
- **Calendario** — visualiza eventos puntuales (exámenes, entregas, reuniones) en una vista mensual.
- **Notas** — crea escenarios de evaluación mediante un DSL propio que define ecuaciones, restricciones y dominios, ingresa las notas que ya conoces y simula resultados de factibilidad.
- **Pendientes** — registra tareas por hacer, sin fecha asociada, con detalle opcional y vínculo opcional a un ramo.
- **Panel principal** — resumen del semestre activo: próxima clase, carga mensual de eventos, probabilidad de aprobación por ramo y próximos eventos de la semana.
- **Configuración** — ajusta el tema y las preferencias de visualización por semestre.

Al eliminar un ramo se eliminan también sus horarios, escenarios de nota y pendientes vinculados. Cambiar de semestre activo cambia el conjunto completo de datos visible.

## Quick start

### Requisitos

- [Bun](https://bun.sh)
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)

### Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Ramo-Libre/Web.git Ramo-Libre-Web
   cd Ramo-Libre-Web
   ```

2. Instala las dependencias:

   ```bash
   bun install
   ```

3. Inicia el servidor local de Supabase:

   ```bash
   bunx supabase start
   ```

4. Configura las variables de entorno:

   ```bash
   cp .env.example .env
   ```

   Edita el archivo `.env` con tus credenciales de Supabase y cualquier otra configuración necesaria. Asegúrate de definir correctamente la URL y la publishable key de Supabase.

5. Inicia el servidor de desarrollo:

   ```bash
   bun run dev
   ```

6. Abre `http://localhost:5173` en tu navegador para ver la aplicación en acción.

## Créditos y atribuciones

- **Logo:** basado en [Noto Emoji](https://github.com/googlefonts/noto-emoji) de Google, bajo licencia [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
- **Iconografía:** [Lucide Svelte](https://lucide.dev), bajo licencia [ISC](https://lucide.dev/license).

## Licencia

Distribuido bajo los términos especificados en [LICENSE](LICENSE).
