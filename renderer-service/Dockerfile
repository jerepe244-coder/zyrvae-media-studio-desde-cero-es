# Dockerfile optimizado para ZYRVAE Video Renderer v2.0 en Render.com y Railway
FROM node:20-bookworm-slim

# Instalar Chromium, FFmpeg y fuentes para renderizado nítido de tipografías
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ffmpeg \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-freefont-ttf \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Configurar variables de entorno para que Puppeteer use el Chromium del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    FFMPEG_PATH=/usr/bin/ffmpeg \
    NODE_ENV=production \
    PORT=8080

WORKDIR /app

# Copiar manifiestos e instalar dependencias de producción
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Copiar el código fuente del microservicio
COPY . .

# Exponer el puerto
EXPOSE 8080

# Iniciar el microservicio con límite de memoria optimizado para contenedor de 512MB
CMD ["node", "--max-old-space-size=320", "server.js"]
