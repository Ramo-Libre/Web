# Ramo Libre Web ![](https://img.shields.io/github/license/madmti/ramo-libre-web)

Este repo es para el remake de la aplicacion RamoLibre (una aplicacion para gestionar cosas de la vida universitaria), el proceso de analisis y diseño se esta documentando en la [Wiki del Proyecto](https://github.com/madmti/Ramo-Libre-Web/wiki). **Este proyecto esta abierto a ideas, sugerencias y contribuciones**.

Ahora integrando [GradeSolver](https://github.com/madmti/GradeSolver) como modulo **WASM** para las predicciones y evaluacion del estado de las reglas de aprobacion. La principal idea de este remake es dar una "interfaz mas facil" y un uso simple, mientras se mejora el performance.

> [!TIP]
> Se recomienda revisar la [Wiki](https://github.com/madmti/Ramo-Libre-Web/wiki) para contexto y mas informacion. Tambien consultar el estado del Proyecto en el [Project Board](https://github.com/users/madmti/projects/5/views/2)

## Quick Start
1. Clona el repositorio
```bash
git clone https://github.com/madmti/Ramo-Libre-Web.git
cd Ramo-Libre-Web
```
2. Instala las dependencias
```bash
pnpm install
```
3. Inicia el servidor local de supabase
```bash
pnpx supabase start
```
4. Configura las variables de entorno
```bash
cp .env.example .env
```
Edita el archivo `.env` con tus credenciales de Supabase y cualquier otra configuración necesaria. Asegúrate de configurar correctamente la URL y la publishable key de Supabase.
5. Inicia el servidor de desarrollo
```bash
pnpm run dev
```
5. Abre tu navegador en `http://localhost:5173` para ver la aplicación en acción.
