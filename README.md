# ZYRVAE Media Studio

> Plataforma web premium para la gestión y creación de videos comerciales ZYRVAE.

---

## 🚀 Arquitectura Híbrida Nube-Servidor: HTML a Video MP4

Para superar los límites de tiempo de ejecución de Vercel y evitar cierres por sobrecalentamiento/RAM en dispositivos móviles de usuarios, ZYRVAE Media Studio adopta una arquitectura en dos capas independientes:

```
[ Celular o Compu del Empleado ] 
             │
             ▼ (Rellena datos y da clic en "Generar Video MP4")
   [ Frontend en Vercel ]
             │
             ▼ (POST /api/render)
[ Backend Dedicado en Render.com / Railway ] 
             │
             ▼ (Puppeteer Headless + FFmpeg)
     [ Genera MP4 fluido ]
             │
             ▼ (Stream directo)
    [ Descarga Directa ] ──► Archivo guardado automáticamente en el dispositivo
```

### 📈 Ventajas Clave
* 📱 **Compatibilidad Total (Mobile-Friendly):** Todo el trabajo pesado de renderizado ocurre en el servidor en la nube. Un empleado puede generar el video desde un teléfono móvil de gama baja en la calle; la memoria del dispositivo no se ve afectada.
* ⚡ **Estabilidad y Sin Límites de Tiempo:** Ejecuciones completas y fluidas a 30fps sin los cortes de timeout (10-60s) de funciones serverless tradicionales.
* 💰 **Costo Inicial de $0 USD:** Desplegable en las capas gratuitas de Render.com o Railway con configuración Docker lista para producción.
* 🔒 **Escalabilidad y Mantenimiento Simple:** Frontend y motor de renderizado desacoplados.

👉 **Instrucciones de Despliegue en 2 minutos:** Consulta la guía en [`DEPLOYMENT_RENDER_RAILWAY.md`](DEPLOYMENT_RENDER_RAILWAY.md).

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
- Integración opcional con Google Drive para almacenamiento centralizado.
- Filtros interactivos por estado ("Todos", "En Drive", "Renderizando", "Borradores").
- Buscador por título.

### 2. Estudio de Creación (`/studio`)
- **Modo HTML / CSS:** Editor y renderizador de plantillas HTML animadas directas a MP4.
- **Modo Remotion / Comercial:** Formulario interactivo con variables dinámicas de marca (título, subtítulo, cifras de impacto, color de acento, llamada a la acción).
- **Simulador Móvil 9:16 en Vivo:** Previsualización en tiempo real adaptada a pantallas verticales con chasis de smartphone.
- **Generación y Descarga Directa:** Al presionar "Generar Video MP4", el archivo MP4 se empaqueta en la nube y se descarga automáticamente en el dispositivo.

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias del frontend Next.js
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en modo producción
npm start

# Iniciar microservicio de renderizado localmente
cd renderer-service
npm install
npm start
```
