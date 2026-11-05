import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CommercialProps, defaultCommercialProps } from "./types";

export const CommercialComposition: React.FC<CommercialProps> = (props) => {
  const {
    title = defaultCommercialProps.title,
    subtitle = defaultCommercialProps.subtitle,
    description = defaultCommercialProps.description,
    brandName = defaultCommercialProps.brandName,
    accentColor = defaultCommercialProps.accentColor,
    badgeText = defaultCommercialProps.badgeText,
    statsValue = defaultCommercialProps.statsValue,
    statsLabel = defaultCommercialProps.statsLabel,
    callToAction = defaultCommercialProps.callToAction,
  } = props;

  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Animaciones Spring
  const badgeSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const descSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 16, stiffness: 75 },
  });

  const cardSpring = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const ctaSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Movimiento flotante orgánico del fondo
  const orbX = interpolate(
    Math.sin(frame / 45),
    [-1, 1],
    [-80, 120]
  );
  const orbY = interpolate(
    Math.cos(frame / 50),
    [-1, 1],
    [-60, 140]
  );
  const orbScale = interpolate(
    Math.sin(frame / 35),
    [-1, 1],
    [0.9, 1.15]
  );

  // Barra de progreso exacta sincronizada al total de frames
  const progressPercent = Math.min(100, Math.max(0, (frame / durationInFrames) * 100));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#09090b",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: "#ffffff",
        overflow: "hidden",
        width,
        height,
      }}
    >
      {/* 1. Fondo dinámico con gradiente radial y orbe luminoso */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 25%, #18182e 0%, #09090b 70%)",
        }}
      />

      {/* Orbe flotante con el color de acento de marca */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          top: "15%",
          left: "10%",
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 68%)`,
          opacity: 0.38,
          filter: "blur(110px)",
          transform: `translate(${orbX}px, ${orbY}px) scale(${orbScale})`,
          pointerEvents: "none",
        }}
      />

      {/* Cuadrícula sutil de fondo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "48px 48px",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      />

      {/* 2. Contenedor principal con espaciado vertical 9:16 (1080x1920) */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "130px 90px",
          boxSizing: "border-box",
        }}
      >
        {/* Encabezado: Badge de Marca */}
        <div
          style={{
            opacity: badgeSpring,
            transform: `translateY(${interpolate(badgeSpring, [0, 1], [-40, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 18,
              padding: "18px 36px",
              borderRadius: 9999,
              backgroundColor: "rgba(24, 24, 27, 0.8)",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: accentColor,
                boxShadow: `0 0 24px ${accentColor}`,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#f4f4f5",
              }}
            >
              {brandName || "ZYRVAE MEDIA STUDIO"}
            </span>
          </div>
        </div>

        {/* Sección Central: Título y Contenido Comercial */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 40,
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          {/* Subtítulo / Tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: titleSpring,
              transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 70,
                height: 6,
                borderRadius: 3,
                backgroundColor: accentColor,
                boxShadow: `0 0 20px ${accentColor}`,
              }}
            />
            <span
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
              }}
            >
              {subtitle || badgeText || "Comercial ZYRVAE"}
            </span>
          </div>

          {/* Título Principal de Alto Impacto */}
          <h1
            style={{
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              margin: 0,
              color: "#ffffff",
              textShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
              opacity: titleSpring,
              transform: `translateY(${interpolate(titleSpring, [0, 1], [50, 0])}px)`,
            }}
          >
            {title}
          </h1>

          {/* Descripción */}
          <p
            style={{
              fontSize: 38,
              lineHeight: 1.45,
              color: "#a1a1aa",
              maxWidth: 920,
              margin: 0,
              opacity: descSpring,
              transform: `translateY(${interpolate(descSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            {description}
          </p>

          {/* Tarjetas de Estadísticas y Prueba Social */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
              marginTop: 15,
              opacity: cardSpring,
              transform: `translateY(${interpolate(cardSpring, [0, 1], [40, 0])}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(24, 24, 27, 0.7)",
                border: "1.5px solid rgba(255, 255, 255, 0.12)",
                padding: "36px 32px",
                borderRadius: 32,
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
              }}
            >
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                {statsValue || "+300%"}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: 8,
                }}
              >
                {statsLabel || "Conversión de Marca"}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "rgba(24, 24, 27, 0.7)",
                border: "1.5px solid rgba(255, 255, 255, 0.12)",
                padding: "36px 32px",
                borderRadius: 32,
                backdropFilter: "blur(20px)",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
              }}
            >
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                1080 × 1920
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: 8,
                }}
              >
                Vertical Ultra HD
              </div>
            </div>
          </div>

          {/* Botón CTA (Call To Action) */}
          {callToAction && (
            <div
              style={{
                marginTop: 10,
                opacity: ctaSpring,
                transform: `scale(${interpolate(ctaSpring, [0, 1], [0.85, 1])})`,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "26px 52px",
                  borderRadius: 24,
                  background: `linear-gradient(135deg, ${accentColor} 0%, #4338ca 100%)`,
                  color: "#ffffff",
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  boxShadow: `0 16px 40px ${accentColor}55`,
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                }}
              >
                {callToAction} →
              </div>
            </div>
          )}
        </div>

        {/* Pie de página con Barra de Progreso y Etiquetas */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {/* Pista de la barra de progreso */}
          <div
            style={{
              width: "100%",
              height: 10,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            {/* Llenado dinámico en tiempo real */}
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${accentColor}, #ec4899)`,
                boxShadow: `0 0 24px ${accentColor}`,
                borderRadius: 5,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 24,
              color: "#71717a",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span>Motor de Video Remotion</span>
            <span>Ultra HD 9:16</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
