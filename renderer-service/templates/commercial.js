/**
 * Plantilla HTML/CSS de alto impacto para comerciales de ZYRVAE Media Studio (1080x1920).
 * Diseñada para animaciones fluidas compatibles tanto con Puppeteer como con navegadores móviles.
 */
export function generateCommercialHtml({
  title = "Comercial ZYRVAE",
  subtitle = "Imprenta de Video Automatizada",
  description = "Diseño premium de alta conversión para anuncios 9:16 Ultra HD.",
  brandName = "ZYRVAE MEDIA STUDIO",
  accentColor = "#6366f1",
  badgeText = "Comercial ZYRVAE",
  statsValue = "+300%",
  statsLabel = "Conversión de Marca",
  callToAction = "Potencia tu Negocio Hoy",
  duration = 10,
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background-color: #09090b;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px 70px 100px;
      -webkit-font-smoothing: antialiased;
    }

    /* Fondo dinámico y orbe con luz de acento */
    .bg-gradient {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 25%, #18182e 0%, #09090b 70%);
      z-index: 0;
    }

    .glow-orb {
      position: absolute;
      width: 800px;
      height: 800px;
      left: 140px;
      top: 250px;
      border-radius: 50%;
      background: radial-gradient(circle, ${accentColor} 0%, transparent 65%);
      filter: blur(120px);
      opacity: 0.35;
      animation: orbFloat ${duration}s infinite ease-in-out alternate;
      z-index: 1;
    }

    @keyframes orbFloat {
      0% {
        transform: translate(-40px, -30px) scale(0.95);
        opacity: 0.3;
      }
      50% {
        transform: translate(50px, 40px) scale(1.1);
        opacity: 0.45;
      }
      100% {
        transform: translate(-30px, 50px) scale(1);
        opacity: 0.35;
      }
    }

    /* Contenido */
    .content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${accentColor}, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 24px;
      box-shadow: 0 10px 25px -5px ${accentColor}80;
    }

    .brand-name {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: #e4e4e7;
    }

    .badge-pill {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      padding: 10px 24px;
      border-radius: 9999px;
      font-size: 18px;
      font-weight: 600;
      color: #d4d4d8;
    }

    /* Sección Principal */
    .hero-section {
      margin-top: 100px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .category-tag {
      display: inline-block;
      align-self: flex-start;
      padding: 8px 20px;
      border-radius: 8px;
      background: ${accentColor}25;
      border: 1px solid ${accentColor}60;
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .main-title {
      font-size: 80px;
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.03em;
      background: linear-gradient(180deg, #ffffff 40%, #a1a1aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .subtitle {
      font-size: 34px;
      font-weight: 500;
      color: #a1a1aa;
      line-height: 1.35;
      animation: fadeInUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Tarjeta de Estadísticas Glassmorphism */
    .metric-card {
      margin-top: 50px;
      padding: 44px 50px;
      border-radius: 32px;
      background: rgba(18, 18, 23, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(30px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      animation: cardReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .metric-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .metric-value {
      font-size: 64px;
      font-weight: 900;
      color: ${accentColor};
      letter-spacing: -0.02em;
    }

    .metric-label {
      font-size: 22px;
      color: #a1a1aa;
      font-weight: 500;
    }

    .metric-tag {
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 20px;
      font-weight: 600;
      color: #f4f4f5;
    }

    /* Footer / CTA */
    .footer-section {
      display: flex;
      flex-direction: column;
      gap: 32px;
      animation: fadeInUp 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .cta-btn {
      width: 100%;
      padding: 34px;
      border-radius: 24px;
      background: linear-gradient(135deg, ${accentColor}, #4f46e5);
      color: #ffffff;
      font-size: 32px;
      font-weight: 800;
      text-align: center;
      letter-spacing: -0.01em;
      box-shadow: 0 20px 40px -10px ${accentColor}80;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    /* Barra de Progreso Dinámica */
    .progress-track {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, ${accentColor}, #ffffff);
      border-radius: 9999px;
      animation: progressAnim ${duration}s linear forwards;
    }

    @keyframes progressAnim {
      from { width: 0%; }
      to { width: 100%; }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes cardReveal {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(50px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="glow-orb"></div>

  <div class="content">
    <!-- Header -->
    <div class="header">
      <div class="brand-logo">
        <div class="logo-badge">Z</div>
        <div class="brand-name">${brandName}</div>
      </div>
      <div class="badge-pill">${badgeText}</div>
    </div>

    <!-- Hero / Mensaje -->
    <div class="hero-section">
      <div class="category-tag">Comercial Ultra HD</div>
      <h1 class="main-title">${title}</h1>
      <p class="subtitle">${subtitle || description}</p>

      <!-- Métrica destacada -->
      <div class="metric-card">
        <div class="metric-info">
          <div class="metric-value">${statsValue}</div>
          <div class="metric-label">${statsLabel}</div>
        </div>
        <div class="metric-tag">Garantizado</div>
      </div>
    </div>

    <!-- Footer & Barra de Progreso -->
    <div class="footer-section">
      <div class="cta-btn">
        <span>${callToAction}</span>
        <span>→</span>
      </div>

      <div class="progress-track">
        <div class="progress-fill"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
