# 🚀 Despliegue del Motor de Renderizado HTML a MP4 (Render.com & Railway)

Este repositorio implementa una **Arquitectura Híbrida Nube-Servidor** para ZYRVAE Media Studio:
- **Frontend:** Next.js desplegado en **Vercel** (ligero, veloz, sin consumo intensivo de CPU ni límites de memoria).
- **Backend de Renderizado:** Microservicio dedicado con Chromium Headless (Puppeteer) + FFmpeg desplegado en **Render.com** o **Railway** (capa gratuita de $0 USD, sin límites de tiempo de 10s ni crasheos por RAM en teléfonos).

---

## 📐 Diagrama de Flujo

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

---

## 🛠️ Opción 1: Despliegue en Render.com (Capa Gratuita $0 USD)

### Método A: Vía Blueprint automático (`render.yaml` incluido)
1. Inicia sesión en [Render.com](https://dashboard.render.com).
2. Haz clic en **"Blueprints"** -> **"New Blueprint Instance"**.
3. Conecta este repositorio: `jerepe244-coder/zyrvae-media-studio-desde-cero-es`.
4. Render detectará automáticamente el archivo `render.yaml` del repositorio:
   - **Nombre:** `zyrvae-video-renderer`
   - **Entorno:** `Docker`
   - **Plan:** `Free` ($0/mes)
5. Haz clic en **"Apply"**.
6. En 2-3 minutos tu servicio estará activo con una URL pública como:
   `https://zyrvae-video-renderer.onrender.com`

### Método B: Manual (Web Service)
1. En el Dashboard de Render, pulsa **"New +"** -> **"Web Service"**.
2. Conecta el repositorio de GitHub.
3. Configura los siguientes campos:
   - **Language / Runtime:** `Docker`
   - **Root Directory:** (dejar en blanco o `renderer-service`)
   - **Dockerfile Path:** `./renderer-service/Dockerfile`
   - **Docker Context:** `./renderer-service`
   - **Instance Type:** `Free`
   - **Health Check Path:** `/health`
4. Pulsa **"Create Web Service"**.

---

## 🚂 Opción 2: Despliegue en Railway

1. Inicia sesión en [Railway.app](https://railway.app).
2. Haz clic en **"New Project"** -> **"Deploy from GitHub repo"**.
3. Selecciona `jerepe244-coder/zyrvae-media-studio-desde-cero-es`.
4. Si configuras Root Directory, especifica `renderer-service`, o Railway usará automáticamente el archivo `railway.json` incluido en la raíz.
5. Railway compilará el `Dockerfile` instalando Chromium y FFmpeg automáticamente.
6. En **Settings** -> **Networking**, haz clic en **"Generate Domain"** para obtener tu URL pública (ejemplo: `https://renderer-service-production.up.railway.app`).

---

## 🔗 Conexión con Vercel (Paso Final)

Una vez que tengas la URL de tu microservicio en Render o Railway:

1. Ve a tu proyecto en el panel de **Vercel** (`Settings` -> `Environment Variables`).
2. Agrega la variable:
   - **Nombre:** `RENDERER_URL`
   - **Valor:** `https://tu-servicio.onrender.com` (o la URL de Railway)
3. Haz un **Redeploy** en Vercel para aplicar la variable.

¡Listo! A partir de ese momento, cada vez que cualquier empleado presione **"Generar Video MP4"** desde un celular o computadora:
1. Vercel enviará los datos al microservidor en Render/Railway.
2. El servidor capturará los fotogramas y los empaquetará con FFmpeg a 30fps Ultra HD.
3. El archivo MP4 final se enviará en streaming directo y se descargará automáticamente en el dispositivo del usuario.

---

## 🧪 Pruebas Locales del Microservicio

Si deseas ejecutar el microservicio en tu máquina local:

```bash
# Entrar a la carpeta del microservicio
cd renderer-service

# Instalar dependencias
npm install

# Iniciar servidor en el puerto 8080
npm start
```

Comprobar salud:
```bash
curl http://localhost:8080/health
```
