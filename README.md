<p align="center">
  <img src="https://raw.githubusercontent.com/Ramo-Libre/Core/refs/heads/main/packages/ui-themes/src/assets/web.svg" alt="Ramo Libre" width="96" />
</p>

<h1 align="center">Ramo Libre — Web</h1>

<p align="center">
  <a href="https://opensource.org/license/mit">
    <img src="https://img.shields.io/github/license/Ramo-Libre/Web" alt="License" />
  </a>
  <a href="https://aur.archlinux.org/packages/ramolibre">
    <img src="https://img.shields.io/aur/version/ramolibre" alt="AUR version" />
  </a>
  <a href="https://github.com/Ramo-Libre/Web/releases/latest">
    <img src="https://img.shields.io/github/v/release/Ramo-Libre/Web" alt="Web deploy" />
  </a>
  <a href="https://github.com/Ramo-Libre/Web/releases/latest">
    <img src="https://img.shields.io/github/actions/workflow/status/Ramo-Libre/Web/android.yml?label=android" alt="Web deploy" />
  </a>
</p>

Remake de [RamoLibre](https://github.com/madmti/RamoLibre), un gestor académico que funciona sin conexión y organiza todos tus datos por semestre. El proceso de análisis y diseño se documenta en la [Wiki del proyecto](https://github.com/Ramo-Libre/Web/wiki).

El objetivo de este remake es ofrecer una interfaz más simple y un mejor rendimiento, integrando [Solver](https://github.com/Ramo-Libre/Solver) como módulo WASM para las predicciones y la evaluación del estado de las reglas de aprobación.

Este proyecto está abierto a ideas, sugerencias y contribuciones.

> [!TIP]
> Se recomienda revisar la [Wiki](https://github.com/Ramo-Libre/Web/wiki) para contexto adicional antes de contribuir.

## Tabla de contenidos

- [Filosofía de diseño](#filosofía-de-diseño)
- [Funcionalidades](#funcionalidades)
- [Descargas](#descargas)
- [Quick start](#quick-start)
- [Créditos y atribuciones](#créditos-y-atribuciones)
- [Licencia](#licencia)


## Filosofía de diseño

Ramo Libre Web no busca ser una suite de gestión académica exhaustiva, sino una herramienta de seguimiento: se usa para agregar algo cuando surge y dar un vistazo día a día, no para pasar tiempo dentro de la app. Toda decisión sobre qué agregar o cómo diseñarlo se evalúa contra los siguientes criterios:

1. **Independencia.** Cada feature debe poder existir sin depender de las demás. Por debajo, las únicas features reales son *Schedule* (Horarios y Eventos son dos vistas de la misma feature) y *Escenarios*; no se tocan entre sí. Ramos es la única excepción consciente, ya que existe específicamente para organizar los datos del resto en categorías.

2. **Valor real al día a día.** Toda feature debe resolver algo que efectivamente ocurre en el semestre a semestre de un estudiante, consultado de forma pasiva y breve — no gestión activa ni sesiones largas de uso.

3. **Simplicidad.** La interacción hacia afuera debe ser trivial, incluso cuando el problema que resuelve por dentro no lo sea (es el caso de los Escenarios de Notas: un DSL expresivo por dentro, pero de uso trivial por fuera — se ingresan las reglas una vez y después solo se completan notas a medida que se conocen).

4. **Alcance acotado.** Lo que no es gestión académica del día a día no entra a esta app, aunque esté relacionado. Casos de uso distintos —como simular combinaciones de notas con sliders— se resuelven en herramientas separadas del ecosistema Ramo Libre, no como una sección más de esta.

5. **Nada "por si acaso".** Ninguna feature, campo o configuración se agrega por intuición o margen especulativo. Si no hay una razón concreta y verificable para incluir algo, no se incluye — y ante la duda, se prefiere omitir antes que sobrecargar.

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

## Descargas

Los instaladores multiplataforma se generan manualmente con el workflow [`Build & Commit Installers`](.github/workflows/build-artifacts.yml) de GitHub Actions (trigger `workflow_dispatch`, nunca automático) y quedan disponibles en la rama [`artifacts`](https://github.com/Ramo-Libre/Web/tree/artifacts). Cada artefacto usa como versión el último tag publicado por el proceso de versionado semántico.

### Descarga directa (última versión)

Los enlaces apuntan siempre al último build generado, sin necesidad de conocer el número de versión:

- **Linux (Debian):** [`ramolibre_latest_amd64.deb`](https://raw.githubusercontent.com/Ramo-Libre/Web/artifacts/ramolibre_latest_amd64.deb)
- **Linux (Red Hat):** [`ramolibre_latest-1.x86_64.rpm`](https://raw.githubusercontent.com/Ramo-Libre/Web/artifacts/ramolibre_latest-1.x86_64.rpm)
- **Linux (AppImage):** [`ramolibre_latest_amd64.AppImage`](https://raw.githubusercontent.com/Ramo-Libre/Web/artifacts/ramolibre_latest_amd64.AppImage)
- **Windows (MSI):** [`ramolibre_latest_x64.msi`](https://raw.githubusercontent.com/Ramo-Libre/Web/artifacts/ramolibre_latest_x64.msi)
- **Android (APK):** [`ramolibre_latest.apk`](https://raw.githubusercontent.com/Ramo-Libre/Web/artifacts/ramolibre_latest.apk)

### Convención de nombres

Los archivos con versión (`ramolibre_<version>_amd64.deb`, etc.) también quedan publicados en la misma rama:

| Plataforma | Formato | Archivo |
| --- | --- | --- |
| Linux | Debian (`.deb`) | `ramolibre_<version>_amd64.deb` |
| Linux | Red Hat (`.rpm`) | `ramolibre-<version>-1.x86_64.rpm` |
| Linux | AppImage | `ramolibre_<version>_amd64.AppImage` |
| Windows | Instalador MSI | `ramolibre_<version>_x64.msi` |
| Android | APK | `ramolibre_<version>.apk` |

> [!NOTE]
> - El instalador de Windows (`.msi`) no está firmado con firma de código, por lo que Windows SmartScreen puede mostrar una advertencia al instalarlo.
> - El paquete de AUR (`ramolibre`) no usa estos artefactos: se compila desde el código fuente del tag correspondiente mediante un proceso manual separado.

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
