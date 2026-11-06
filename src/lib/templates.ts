// Catálogo Oficial de Plantillas Publicitarias Animadas de ZYRVAE Media Studio
// Cada plantilla está optimizada con animaciones CSS continuas (@keyframes)
// y se sincroniza dinámicamente con la duración que elija el usuario (15s, 30s, 60s).

export interface AdTemplate {
  id: string;
  name: string;
  description: string;
  category: "E-Commerce" | "SaaS & Tech" | "Gastronomía" | "Apps & Móvil" | "Kinetic & Viral" | "Educación";
  defaultDuration: number;
  aspectRatio: "9:16" | "16:9" | "1:1";
  accentColor: string;
  badge: string;
  generateHtml: (seconds?: number) => string;
}

export const TEMPLATES: AdTemplate[] = [
  {
    id: "zyrvae-core",
    name: "Lanzamiento Tech ZYRVAE",
    description: "Diseño premium para software, agencias o servicios con métricas flotantes, orbes de luz y badges modernos.",
    category: "SaaS & Tech",
    defaultDuration: 15,
    aspectRatio: "9:16",
    accentColor: "#6366f1",
    badge: "Popular",
    generateHtml: (seconds = 15) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>Comercial ZYRVAE - Imprenta de Video</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #09090b; color: #ffffff; }
    .canvas {
      position: relative; width: 1080px; height: 1920px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 120px 80px;
      background: radial-gradient(circle at 50% 25%, #2e1065 0%, #09090b 70%);
      overflow: hidden;
    }
    .orb {
      position: absolute; width: 700px; height: 700px; border-radius: 50%;
      background: radial-gradient(circle, #6366f1 0%, transparent 70%);
      opacity: 0.35; filter: blur(80px); animation: float 6s ease-in-out infinite alternate;
    }
    @keyframes float {
      0% { transform: translate(50px, 120px) scale(0.9); }
      100% { transform: translate(320px, 400px) scale(1.2); }
    }
    .badge {
      display: inline-flex; align-items: center; gap: 16px;
      padding: 16px 32px; border-radius: 9999px;
      background: rgba(24, 24, 27, 0.8); border: 1px solid rgba(255, 255, 255, 0.15);
      width: fit-content; z-index: 10;
      animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .badge-dot { width: 16px; height: 16px; border-radius: 50%; background: #10b981; box-shadow: 0 0 20px #10b981; }
    .badge-text { font-size: 24px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #f4f4f5; }
    .hero { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 36px; margin: auto 0; }
    .tag { font-size: 32px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.2em; }
    .title { font-size: 88px; font-weight: 900; line-height: 1.05; letter-spacing: -0.04em; color: #ffffff; }
    .title span { color: #a855f7; }
    .desc { font-size: 36px; line-height: 1.45; color: #a1a1aa; max-width: 920px; }
    .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 10px; }
    .stat-card {
      background: rgba(24, 24, 27, 0.75); border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 32px; border-radius: 28px;
    }
    .stat-val { font-size: 54px; font-weight: 900; color: #ffffff; }
    .stat-lbl { font-size: 22px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }
    .footer { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 24px; }
    .progress-track { width: 100%; height: 10px; background: rgba(255, 255, 255, 0.12); border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #6366f1, #ec4899); animation: fillProgress ${seconds}s linear forwards; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
    .foot-labels { display: flex; justify-content: space-between; font-size: 24px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body data-duration="${seconds}" data-width="1080" data-height="1920">
  <div class="canvas">
    <div class="orb"></div>
    <div class="badge">
      <span class="badge-dot"></span>
      <span class="badge-text">ZYRVAE MEDIA STUDIO</span>
    </div>
    <div class="hero">
      <span class="tag">Convertidor HTML a Video</span>
      <h1 class="title">Tu publicidad en código, <span>convertida a MP4</span> al instante.</h1>
      <p class="desc">Imprenta automatizada en resolución vertical 9:16 lista para Reels, TikTok y Shorts.</p>
      <div class="card-grid">
        <div class="stat-card">
          <div class="stat-val">+300%</div>
          <div class="stat-lbl">Retención Visual</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">9:16 HD</div>
          <div class="stat-lbl">Vertical Nativo</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="foot-labels">
        <span>Renderizado a Video MP4</span>
        <span>9:16 Vertical</span>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: "flash-sale",
    name: "Oferta Flash / Descuento",
    description: "Anuncio de alto impacto para e-commerce y promociones con tipografía bold, contador y barra de urgencia.",
    category: "E-Commerce",
    defaultDuration: 15,
    aspectRatio: "9:16",
    accentColor: "#f43f5e",
    badge: "Alta Conversión",
    generateHtml: (seconds = 15) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>Oferta Flash - ZYRVAE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #09090b; color: #ffffff; }
    .canvas {
      position: relative; width: 1080px; height: 1920px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 120px 80px;
      background: radial-gradient(circle at 50% 20%, #4c0519 0%, #09090b 70%);
      overflow: hidden;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 16px;
      padding: 18px 36px; border-radius: 9999px;
      background: #f43f5e; color: #ffffff; font-size: 26px; font-weight: 800;
      letter-spacing: 0.12em; text-transform: uppercase; width: fit-content;
      animation: pulseBadge 2s ease-in-out infinite;
    }
    @keyframes pulseBadge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.04); }
    }
    .hero { display: flex; flex-direction: column; gap: 36px; margin: auto 0; }
    .discount { font-size: 150px; font-weight: 900; color: #fb7185; line-height: 1; letter-spacing: -0.04em; text-shadow: 0 0 60px rgba(244,63,94,0.5); }
    .title { font-size: 82px; font-weight: 900; line-height: 1.08; color: #ffffff; }
    .desc { font-size: 36px; line-height: 1.45; color: #fda4af; }
    .cta {
      background: linear-gradient(135deg, #f43f5e, #be123c); color: #ffffff; font-size: 38px; font-weight: 800;
      text-align: center; padding: 36px; border-radius: 28px; margin-top: 20px;
      box-shadow: 0 10px 40px -10px rgba(244,63,94,0.6);
      animation: ctaFloat 3s ease-in-out infinite alternate;
    }
    @keyframes ctaFloat { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
    .progress-track { width: 100%; height: 10px; background: rgba(255,255,255,0.12); border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: #f43f5e; animation: fillProgress ${seconds}s linear forwards; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
  </style>
</head>
<body data-duration="${seconds}">
  <div class="canvas">
    <div class="badge">🔥 OFERTA POR TIEMPO LIMITADO</div>
    <div class="hero">
      <div class="discount">50% OFF</div>
      <h1 class="title">Gran Venta Exclusiva de Temporada</h1>
      <p class="desc">Aprovecha descuentos directos en toda nuestra línea premium antes de que termine hoy.</p>
      <div class="cta">Comprar con Descuento Ahora →</div>
    </div>
    <div class="progress-track"><div class="progress-fill"></div></div>
  </div>
</body>
</html>`,
  },
  {
    id: "restaurant-gourmet",
    name: "Gastronomía / Menú Gourmet",
    description: "Ideal para restaurantes, cafeterías, dark kitchens o delivery con estética cálida y llamada directa a ordenar.",
    category: "Gastronomía",
    defaultDuration: 15,
    aspectRatio: "9:16",
    accentColor: "#f59e0b",
    badge: "Restaurantes",
    generateHtml: (seconds = 15) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>Gastronomía - ZYRVAE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #0c0a09; color: #ffffff; }
    .canvas {
      position: relative; width: 1080px; height: 1920px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 120px 80px;
      background: radial-gradient(circle at 50% 20%, #451a03 0%, #0c0a09 70%);
      overflow: hidden;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 14px;
      padding: 16px 32px; border-radius: 9999px;
      background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24; font-size: 24px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
      width: fit-content;
    }
    .hero { display: flex; flex-direction: column; gap: 32px; margin: auto 0; }
    .subtag { font-size: 30px; font-weight: 800; color: #f59e0b; letter-spacing: 0.2em; text-transform: uppercase; }
    .title { font-size: 86px; font-weight: 900; line-height: 1.05; color: #fef3c7; }
    .desc { font-size: 34px; line-height: 1.5; color: #d6d3d1; }
    .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
    .card-item {
      background: rgba(28, 25, 23, 0.8); border: 1px solid rgba(245, 158, 11, 0.2);
      padding: 30px; border-radius: 24px;
    }
    .card-title { font-size: 42px; font-weight: 900; color: #f59e0b; }
    .card-desc { font-size: 22px; color: #a8a29e; margin-top: 6px; }
    .cta {
      background: linear-gradient(135deg, #f59e0b, #d97706); color: #0c0a09; font-size: 38px; font-weight: 900;
      text-align: center; padding: 36px; border-radius: 28px; margin-top: 15px;
      box-shadow: 0 12px 35px -8px rgba(245,158,11,0.5);
    }
    .progress-track { width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: #f59e0b; animation: fillProgress ${seconds}s linear forwards; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
  </style>
</head>
<body data-duration="${seconds}">
  <div class="canvas">
    <div class="badge">✨ NUEVO MENÚ DE AUTOR</div>
    <div class="hero">
      <span class="subtag">Experiencia Culinaria</span>
      <h1 class="title">Sabores creados para emocionar tu paladar.</h1>
      <p class="desc">Ingredientes frescos de temporada preparados por expertos chefs cada día.</p>
      <div class="cards">
        <div class="card-item">
          <div class="card-title">★ 4.9</div>
          <div class="card-desc">Calificación Clientes</div>
        </div>
        <div class="card-item">
          <div class="card-title">Envío Gratis</div>
          <div class="card-desc">En tu primer pedido</div>
        </div>
      </div>
      <div class="cta">Ordenar Ahora por Delivery →</div>
    </div>
    <div class="progress-track"><div class="progress-fill"></div></div>
  </div>
</body>
</html>`,
  },
  {
    id: "app-showcase",
    name: "App Showcase / Lanzamiento Móvil",
    description: "Diseño para apps de productividad, fintech o redes sociales con mockup visual, valoraciones y badges de tiendas.",
    category: "Apps & Móvil",
    defaultDuration: 15,
    aspectRatio: "9:16",
    accentColor: "#06b6d4",
    badge: "Apps & SaaS",
    generateHtml: (seconds = 15) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>App Showcase - ZYRVAE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #020617; color: #ffffff; }
    .canvas {
      position: relative; width: 1080px; height: 1920px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 120px 80px;
      background: radial-gradient(circle at 50% 30%, #083344 0%, #020617 70%);
      overflow: hidden;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 14px;
      padding: 16px 32px; border-radius: 9999px;
      background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4);
      color: #22d3ee; font-size: 24px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
      width: fit-content;
    }
    .hero { display: flex; flex-direction: column; gap: 34px; margin: auto 0; }
    .tag { font-size: 30px; font-weight: 800; color: #06b6d4; letter-spacing: 0.2em; text-transform: uppercase; }
    .title { font-size: 88px; font-weight: 900; line-height: 1.05; color: #ffffff; }
    .title span { color: #22d3ee; }
    .desc { font-size: 36px; line-height: 1.45; color: #94a3b8; }
    .mockup-box {
      background: rgba(15, 23, 42, 0.85); border: 1.5px solid rgba(6, 182, 212, 0.25);
      border-radius: 32px; padding: 40px; margin-top: 10px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .mockup-stat { font-size: 58px; font-weight: 900; color: #38bdf8; }
    .mockup-lbl { font-size: 22px; color: #94a3b8; margin-top: 4px; }
    .cta {
      background: linear-gradient(135deg, #06b6d4, #0284c7); color: #ffffff; font-size: 38px; font-weight: 900;
      text-align: center; padding: 36px; border-radius: 28px; margin-top: 15px;
      box-shadow: 0 12px 35px -8px rgba(6,182,212,0.5);
    }
    .progress-track { width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: #06b6d4; animation: fillProgress ${seconds}s linear forwards; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
  </style>
</head>
<body data-duration="${seconds}">
  <div class="canvas">
    <div class="badge">🚀 NUEVA VERSIÓN DISPONIBLE</div>
    <div class="hero">
      <span class="tag">App Móvil Inteligente</span>
      <h1 class="title">Gestiona todo tu flujo en <span>segundos</span>.</h1>
      <p class="desc">Automatización sin esfuerzo, sincronización en tiempo real y diseño intuitivo.</p>
      <div class="mockup-box">
        <div>
          <div class="mockup-stat">+100.000</div>
          <div class="mockup-lbl">Usuarios Activos</div>
        </div>
        <div style="text-align: right;">
          <div class="mockup-stat">4.9 ★</div>
          <div class="mockup-lbl">En App Store & Google Play</div>
        </div>
      </div>
      <div class="cta">Descargar Gratis Ahora →</div>
    </div>
    <div class="progress-track"><div class="progress-fill"></div></div>
  </div>
</body>
</html>`,
  },
  {
    id: "kinetic-viral",
    name: "Tipografía Cinética / Mensaje Viral",
    description: "Estilo directo en blanco, negro y amarillo neón para ganchos de Reels, citas, frases o mensajes contundentes.",
    category: "Kinetic & Viral",
    defaultDuration: 15,
    aspectRatio: "9:16",
    accentColor: "#eab308",
    badge: "Viral",
    generateHtml: (seconds = 15) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>Kinetic Viral - ZYRVAE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000000; color: #ffffff; }
    .canvas {
      position: relative; width: 1080px; height: 1920px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 140px 80px;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 14px;
      padding: 16px 32px; border-radius: 9999px;
      background: #facc15; color: #000000; font-size: 26px; font-weight: 900;
      letter-spacing: 0.15em; text-transform: uppercase; width: fit-content;
    }
    .hero { display: flex; flex-direction: column; gap: 40px; margin: auto 0; }
    .huge-line-1 { font-size: 96px; font-weight: 900; line-height: 1; letter-spacing: -0.05em; color: #71717a; text-transform: uppercase; }
    .huge-line-2 { font-size: 110px; font-weight: 900; line-height: 0.95; letter-spacing: -0.05em; color: #ffffff; text-transform: uppercase; }
    .huge-line-3 { font-size: 110px; font-weight: 900; line-height: 0.95; letter-spacing: -0.05em; color: #facc15; text-transform: uppercase; }
    .tagline { font-size: 38px; color: #a1a1aa; line-height: 1.4; max-width: 880px; margin-top: 15px; }
    .footer-box {
      background: #18181b; border: 1px solid #27272a;
      padding: 34px; border-radius: 28px;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 30px; font-weight: 800; color: #f4f4f5;
    }
    .progress-track { width: 100%; height: 12px; background: #27272a; border-radius: 6px; overflow: hidden; margin-top: 24px; }
    .progress-fill { height: 100%; width: 0%; background: #facc15; animation: fillProgress ${seconds}s linear forwards; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
  </style>
</head>
<body data-duration="${seconds}">
  <div class="canvas">
    <div class="badge">⚡ LA REGLA DE ORO</div>
    <div class="hero">
      <div class="huge-line-1">Deja de hacer</div>
      <div class="huge-line-2">Anuncios que</div>
      <div class="huge-line-3">Nadie Recuerda.</div>
      <p class="tagline">El 80% del éxito en redes consiste en atrapar la atención en los primeros 3 segundos.</p>
    </div>
    <div>
      <div class="footer-box">
        <span>Síguenos para más consejos</span>
        <span style="color: #facc15;">@zyrvae.studio</span>
      </div>
      <div class="progress-track"><div class="progress-fill"></div></div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: "masterclass-event",
    name: "Masterclass / Curso & Webinar",
    description: "Diseño para convocatorias a directos, conferencias o cursos online con fecha, cupos y llamada a registrarse.",
    category: "Educación",
    defaultDuration: 30,
    aspectRatio: "9:16",
    accentColor: "#8b5cf6",
    badge: "Eventos",
    generateHtml: (seconds = 30) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>Masterclass - ZYRVAE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #09090b; color: #ffffff; }
    .canvas {
      position: relative; width: 1080px; height: 1920px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 120px 80px;
      background: radial-gradient(circle at 50% 25%, #3b0764 0%, #09090b 70%);
      overflow: hidden;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 14px;
      padding: 16px 32px; border-radius: 9999px;
      background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4);
      color: #c084fc; font-size: 24px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
      width: fit-content;
    }
    .hero { display: flex; flex-direction: column; gap: 34px; margin: auto 0; }
    .tag { font-size: 30px; font-weight: 800; color: #c084fc; letter-spacing: 0.2em; text-transform: uppercase; }
    .title { font-size: 84px; font-weight: 900; line-height: 1.08; color: #ffffff; }
    .title span { color: #a855f7; }
    .desc { font-size: 34px; line-height: 1.45; color: #d4d4d8; }
    .info-card {
      background: rgba(24, 24, 27, 0.85); border: 1px solid rgba(168, 85, 247, 0.25);
      border-radius: 28px; padding: 36px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .info-row { font-size: 30px; font-weight: 700; color: #f4f4f5; display: flex; align-items: center; gap: 14px; }
    .cta {
      background: linear-gradient(135deg, #a855f7, #7c3aed); color: #ffffff; font-size: 38px; font-weight: 900;
      text-align: center; padding: 36px; border-radius: 28px; margin-top: 15px;
      box-shadow: 0 12px 35px -8px rgba(168,85,247,0.5);
    }
    .progress-track { width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: #a855f7; animation: fillProgress ${seconds}s linear forwards; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
  </style>
</head>
<body data-duration="${seconds}">
  <div class="canvas">
    <div class="badge">🔴 EN VIVO • CLASE GRATUITA</div>
    <div class="hero">
      <span class="tag">Masterclass Online</span>
      <h1 class="title">Domina la Creación de <span>Video con Código</span> e IA.</h1>
      <p class="desc">Aprende paso a paso la metodología para producir cientos de creativos publicitarios escalables.</p>
      <div class="info-card">
        <div class="info-row">🗓️ Este Jueves a las 20:00 hs (GTM-3)</div>
        <div class="info-row" style="color: #c084fc;">⏳ Cupos estrictamente limitados a 100 personas</div>
      </div>
      <div class="cta">Reservar Mi Lugar Gratis →</div>
    </div>
    <div class="progress-track"><div class="progress-fill"></div></div>
  </div>
</body>
</html>`,
  },
];

export const getTemplateById = (id: string): AdTemplate | undefined => {
  return TEMPLATES.find((t) => t.id === id);
};
