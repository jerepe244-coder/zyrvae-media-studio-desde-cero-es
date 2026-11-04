# ZYRVAE Media Studio

> Plataforma web premium para la gestión y creación de videos comerciales ZYRVAE.

---

## 🚀 Fase 1: Diseño Visual & UI (Mock)

En esta primera fase se ha desarrollado la interfaz visual completa con diseño de nivel premium (estilo Vercel / Linear), modo oscuro en paleta **Zinc**, componentes accesibles y animaciones sutiles.

### Stack Tecnológico
- **Framework:** Next.js (App Router, React 19)
- **Estilos:** Tailwind CSS v4 (Tema oscuro Zinc)
- **Componentes UI:** Shadcn UI (`button`, `card`, `input`, `select`, `badge`, `dialog`)
- **Iconografía:** Lucide React
- **Animaciones:** Framer Motion

---

## 📱 Estructura de Navegación & Layout

- **Sidebar Lateral Fijo (Desktop):**
  - Logotipo **ZYRVAE Media Studio**
  - Acceso directo a **Biblioteca** (`/library`)
  - Acceso directo a **Estudio** (`/studio`)
  - Indicador de estado y versión
- **Navegación Móvil (Responsive):**
  - Header superior compacto con logo ZYRVAE
  - Barra de navegación inferior flotante con iconos táctiles

---

## 🎬 Pantallas Implementadas

### 1. Biblioteca de Videos (`/library`)
- Grilla de tarjetas interactivas con miniaturas de aspecto cinematográfico.
- 6 videos comerciales simulados con metadatos reales (título, fecha, duración, ratio de aspecto).
- Badges con código de color:
  - **En Drive** (Verde esmeralda)
  - **Renderizando** (Amarillo ámbar con spinner)
  - **Borrador** (Gris zinc)
- Filtros interactivos por estado ("Todos", "En Drive", "Renderizando", "Borradores").
- Buscador por título.
- Botón superior derecho **"+ Nuevo Video"** que abre un modal `Dialog` para iniciar un nuevo proyecto y redirigir al Estudio.

### 2. Estudio de Creación (`/studio`)
- **Columna Izquierda (Formulario de Parámetros):**
  - `Input`: Nombre del video comercial.
  - `Select`: Plantilla ("Comercial ZYRVAE", "Caso de Éxito", "Reel").
  - Selectores de formato (9:16 vertical, 16:9 horizontal) y duración (15s, 30s, 60s).
  - Botón **"Renderizar Video"** que despliega el modal interactivo de confirmación con aviso de *"Próximamente"* (el motor de renderizado HyperFrames / Remotion se integrará en fases posteriores).
- **Columna Derecha (Simulador Móvil 9:16):**
  - Chasis realista de smartphone con Dynamic Island y relación de aspecto vertical 9:16.
  - Botón de **Play** central con micro-interacción.
  - Título y etiqueta de **"Previsualización"**.
  - Canvas interactivo que sincroniza en tiempo real el título, la plantilla y los parámetros configurados en el formulario.

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en modo producción
npm start
```
