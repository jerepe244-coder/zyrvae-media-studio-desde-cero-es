"use client";

import * as React from "react";
import Link from "next/link";
import {
  Play,
  Loader2,
  Download,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Smartphone,
  Code2,
  Copy,
  Check,
  Trash2,
  Clock,
  Sparkles,
  Lightbulb,
  HelpCircle,
  FileCode2,
  ArrowLeft,
  Bookmark,
  FolderOpen,
  Film,
  Gauge,
  Eye,
  EyeOff,
  Music,
  Mic,
  Volume2,
  Square,
  Plus,
  Wand2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { renderHtmlToMp4InBrowser } from "@/lib/browser-mp4-converter";
import { TEMPLATES, AdTemplate, getTemplateById } from "@/lib/templates";
import { saveProject, getSavedProjectById } from "@/lib/user-library";
import {
  MUSIC_PRESETS,
  SFX_PRESETS,
  SfxEvent,
  getMusicPresetById,
  getSfxPresetById,
  parseSfxFromHtml,
} from "@/lib/audio-presets";

const DEFAULT_RENDERER_URL =
  process.env.NEXT_PUBLIC_RENDERER_URL || "https://zyrvae-video-renderer.onrender.com";

// Plantilla inicial por defecto
const createSampleAdHtml = (seconds: number = 15) => {
  const tpl = getTemplateById("zyrvae-core");
  return tpl ? tpl.generateHtml(seconds) : "";
};

// Generador de Reglas Técnicas de Renderizado para IAs (ChatGPT, Claude, Gemini, DeepSeek)
export const getTechnicalAiPrompt = (
  durationSec: number = 15,
  aspectRatio: string = "9:16",
  width: number = 1080,
  height: number = 1920,
  fps: number = 30
): string => {
  const durationLabel =
    durationSec === 60
      ? "60 segundos (1 minuto)"
      : durationSec > 60
      ? `${durationSec} segundos (~${(durationSec / 60).toFixed(1)} min)`
      : `${durationSec} segundos`;

  return `Actúa como un desarrollador frontend experto en renderizado automatizado de video web.
Genera un ÚNICO archivo HTML autónomo (con CSS y JavaScript embebidos), diseñado específicamente para ser convertido directamente a video MP4 fluido en ZYRVAE Media Studio.

REGLAS TÉCNICAS OBLIGATORIAS PARA EL RENDERIZADO:

1. ARCHIVO 100% AUTÓNOMO Y AUTOCONTENIDO:
   - Todo el CSS debe estar dentro de la etiqueta <style> y cualquier script dentro de <script>.
   - No enlaces archivos locales ni hojas de estilo externas relativas. Todo debe estar embebido en el mismo archivo.

2. CERO INTERACTIVIDAD HUMANA NI CONTROLES DE REPRODUCTOR:
   - El renderizador captura fotogramas de forma automática y desatendida; no hay interacción de un usuario.
   - NO incluyas controles de video, botones de Play/Pause, barras de reproducción web, paneles laterales ni eventos que esperen "click" o "hover".
   - NO uses etiquetas <video> externas que dependan de reproducción manual o de streaming externo inestable.

3. ANIMACIONES CONTINUAS Y AUTOMÁTICAS (CSS @keyframes):
   - Todo el movimiento debe comenzar automáticamente en el segundo 0 (animation-delay: 0s o inmediato).
   - Usa animaciones CSS fluidas (@keyframes) priorizando propiedades aceleradas por GPU (transform: translate, scale, rotate y opacity).
   - El dinamismo visual debe mantenerse activo de principio a fin sin quedarse congelado como una imagen fija.

4. SINCRONIZACIÓN CON LA DURACIÓN DEL VIDEO:
   - Duración total del video configurada: ${durationLabel} a ${fps} FPS (${Math.round(durationSec * fps)} cuadros).
   - Configura las animaciones, transiciones o bucles para que se sincronicen armónicamente a lo largo de estos ${durationSec} segundos (sin cortarse antes de tiempo ni frenarse).

5. FORMATO, RESOLUCIÓN Y ENCUADRE:
   - Proporción seleccionada: ${aspectRatio} (${width}px de ancho por ${height}px de alto).
   - Aplica en el CSS base:
     html, body {
       width: 100%;
       height: 100%;
       margin: 0;
       padding: 0;
       overflow: hidden;
       box-sizing: border-box;
     }
   - Esto evita barras de desplazamiento (scroll) o desbordes en el video MP4 final.

6. EFECTOS DE SONIDO (SFX) SINCRONIZADOS (OPCIONAL):
   - Para disparar efectos de sonido automáticos al compás de las transiciones en FFmpeg, incluí dentro del <head> una etiqueta meta estándar con formato <id>@<segundos> (y volumen opcional @<0.1-1.0>):
     <meta name="zyrvae-sfx" content="impact@2.0, ui-click@11.5, whoosh@15.0@0.8">
   - IDs disponibles: impact, whoosh, ui-click, notification, riser, error-beep.

============================================================
INFORMACIÓN CREATIVA DEL ANUNCIO (TOTALMENTE A TU ELECCIÓN):
Pega o describe aquí lo que deseas que contenga tu anuncio:
- Tu producto o servicio: [DESCRIBE AQUÍ]
- Tu mensaje o textos clave: [DESCRIBE AQUÍ]
- Tu estilo visual, colores o temática: [DESCRIBE AQUÍ]
============================================================`;
};

const MASTER_AI_PROMPT = getTechnicalAiPrompt(15, "9:16", 1080, 1920);

const DURATION_PRESETS = [
  { seconds: 15, label: "15s", desc: "Reel / Story Rápido", badge: "Más Rápido" },
  { seconds: 30, label: "30s", desc: "Comercial Estándar" },
  { seconds: 60, label: "1 min", desc: "Anuncio Completo" },
];

export default function StudioPage() {
  // Pestaña en vista móvil: "editor" o "preview"
  const [mobileTab, setMobileTab] = React.useState<"editor" | "preview">("editor");

  // Parámetros de salida del video
  const [durationSeconds, setDurationSeconds] = React.useState<number>(15);
  const [fps, setFps] = React.useState<30 | 60>(30);
  const [aspectRatio, setAspectRatio] = React.useState<"9:16" | "16:9" | "1:1">("9:16");
  const [cleanVideoMode, setCleanVideoMode] = React.useState<boolean>(true);
  const [showSafeZones, setShowSafeZones] = React.useState<boolean>(false);
  const [htmlTitle, setHtmlTitle] = React.useState<string>("Comercial_ZYRVAE");

  // Pista de música opcional (.mp3 / .wav o preset integrado)
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const previewMusicRef = React.useRef<HTMLAudioElement | null>(null);
  const [selectedMusicPresetId, setSelectedMusicPresetId] = React.useState<string>("");
  const [isMusicPreviewPlaying, setIsMusicPreviewPlaying] = React.useState<boolean>(false);
  const [musicAvailability, setMusicAvailability] = React.useState<Record<string, boolean>>({});
  const [sfxAvailability, setSfxAvailability] = React.useState<Record<string, boolean>>({});
  const [audioFile, setAudioFile] = React.useState<{
    name: string;
    ext: "mp3" | "wav";
    sizeBytes: number;
    base64: string;
  } | null>(null);

  // Efectos de Sonido (SFX) sincronizados por timestamp
  const [sfxEvents, setSfxEvents] = React.useState<SfxEvent[]>(() =>
    parseSfxFromHtml(createSampleAdHtml(15))
  );
  const lastParsedSfxSigRef = React.useRef<string>(
    JSON.stringify(parseSfxFromHtml(createSampleAdHtml(15)))
  );
  const [newSfxId, setNewSfxId] = React.useState<string>("impact");
  const [newSfxTime, setNewSfxTime] = React.useState<string>("2.0");
  const [customSfxPrompt, setCustomSfxPrompt] = React.useState<string>("");
  const [isGeneratingSfx, setIsGeneratingSfx] = React.useState<boolean>(false);
  const [sfxError, setSfxError] = React.useState<string | null>(null);

  // Voz en Off con ElevenLabs
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [elevenVoices, setElevenVoices] = React.useState<
    Array<{
      voice_id: string;
      name: string;
      category?: string;
      labels?: Record<string, string>;
      preview_url?: string | null;
    }>
  >([]);
  const [voicesLoading, setVoicesLoading] = React.useState<boolean>(true);
  const [ttsConfigured, setTtsConfigured] = React.useState<boolean>(true);
  const [voicesError, setVoicesError] = React.useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>("");
  const [ttsText, setTtsText] = React.useState<string>("");
  const [isGeneratingVoice, setIsGeneratingVoice] = React.useState<boolean>(false);
  const [ttsError, setTtsError] = React.useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState<boolean>(false);
  const [voiceoverAudio, setVoiceoverAudio] = React.useState<{
    base64: string;
    sizeBytes: number;
    voiceName: string;
    dataUrl: string;
  } | null>(null);

  // Estado del código HTML y versión debounced para el visor
  const [htmlCode, setHtmlCode] = React.useState<string>(() => createSampleAdHtml(15));
  const [debouncedHtml, setDebouncedHtml] = React.useState<string>(() => createSampleAdHtml(15));
  const [copied, setCopied] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(0);
  const [bannerNotice, setBannerNotice] = React.useState<string | null>(null);

  // Modales
  const [showPromptModal, setShowPromptModal] = React.useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = React.useState(false);
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);
  const [showResultModal, setShowResultModal] = React.useState(false);

  // URL del microservicio de renderizado
  const [rendererUrl, setRendererUrl] = React.useState<string>(DEFAULT_RENDERER_URL);

  // Estado de conversión y progreso en vivo
  const [isLoading, setIsLoading] = React.useState(false);
  const [progressPercent, setProgressPercent] = React.useState<number>(0);
  const [progressStatus, setProgressStatus] = React.useState<string>("");
  const [progressPhase, setProgressPhase] = React.useState<string>("");
  const [progressFrames, setProgressFrames] = React.useState<{
    frame: number;
    totalFrames: number;
  } | null>(null);
  const [usingBrowserFallback, setUsingBrowserFallback] = React.useState<boolean>(false);

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
    details?: string;
    engine?: string;
    downloadUrl?: string;
    filename?: string;
    usedFallback?: boolean;
  } | null>(null);

  // Dimensiones según la proporción seleccionada
  const dimensions = React.useMemo(() => {
    switch (aspectRatio) {
      case "16:9":
        return { width: 1920, height: 1080, label: "16:9 Horizontal (YouTube)" };
      case "1:1":
        return { width: 1080, height: 1080, label: "1:1 Cuadrado (Instagram)" };
      case "9:16":
      default:
        return { width: 1080, height: 1920, label: "9:16 Vertical (TikTok/Reels)" };
    }
  }, [aspectRatio]);

  // Cargar plantilla o proyecto desde query params al montar la página
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const templateParam = params.get("template");
    const projectParam = params.get("projectId");
    const titleParam = params.get("title");

    if (templateParam) {
      const tpl = getTemplateById(templateParam);
      if (tpl) {
        const code = tpl.generateHtml(tpl.defaultDuration);
        setHtmlCode(code);
        setDebouncedHtml(code);
        setHtmlTitle(tpl.name.replace(/\s+/g, "_"));
        setDurationSeconds(tpl.defaultDuration);
        setAspectRatio(tpl.aspectRatio);
        setBannerNotice(`Plantilla cargada: "${tpl.name}"`);
        setTimeout(() => setBannerNotice(null), 4000);
      }
    } else if (projectParam) {
      const proj = getSavedProjectById(projectParam);
      if (proj) {
        setHtmlCode(proj.htmlCode);
        setDebouncedHtml(proj.htmlCode);
        setHtmlTitle(proj.title);
        setDurationSeconds(proj.durationSeconds || 15);
        setAspectRatio(proj.aspectRatio || "9:16");
        setBannerNotice(`Proyecto cargado: "${proj.title}"`);
        setTimeout(() => setBannerNotice(null), 4000);
      }
    } else if (titleParam) {
      setHtmlTitle(titleParam.replace(/\s+/g, "_"));
    }
  }, []);

  // Prompt técnico sincronizado con la duración, FPS y dimensiones seleccionadas actualmente
  const dynamicAiPrompt = React.useMemo(() => {
    return getTechnicalAiPrompt(
      durationSeconds,
      aspectRatio,
      dimensions.width,
      dimensions.height,
      fps
    );
  }, [durationSeconds, aspectRatio, dimensions.width, dimensions.height, fps]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(dynamicAiPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error("Error al copiar prompt:", err);
    }
  };

  // Detector de animaciones CSS continuas en el código
  const hasAnimations = React.useMemo(() => {
    if (!debouncedHtml.trim()) return true;
    return /@keyframes|animation\s*:|requestAnimationFrame/i.test(debouncedHtml);
  }, [debouncedHtml]);

  // Referencia y escala para el iframe HTML responsivo
  const phoneContainerRef = React.useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = React.useState<number>(0.26);

  // HTML limpio para vista previa sin paneles interactivos
  const previewHtml = React.useMemo(() => {
    if (!cleanVideoMode) return debouncedHtml;
    const hasKeyframes = /@keyframes/i.test(debouncedHtml);
    const autoMotion = !hasKeyframes
      ? `@keyframes __zyrvae_cinematic_motion {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.04) translateY(-8px); }
          100% { transform: scale(1.08) translateY(0); }
        }
        img, .bg, .hero, .card, .main, [class*="card"], [class*="hero"], [class*="poster"], [class*="banner"] {
          animation: __zyrvae_cinematic_motion ${durationSeconds}s ease-in-out infinite alternate !important;
        }`
      : "";

    const cleanStyle = `<style id="__zyrvae_clean_preview">
      .panel, #panel, .controls, #controls, .toolbar, #toolbar, .sidebar, #sidebar,
      .player-controls, .video-controls, .control-bar, .playback-bar,
      .vjs-control-bar, .plyr__controls, .jw-controls,
      button[class*="play"], button[id*="play"], [aria-label*="play" i], [aria-label*="reproducir" i],
      .play-btn, .play-button, .btn-play, #play-button, #playBtn, .btn-reproducir,
      .timeline, #timeline {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      video, canvas, .video, #video, .video-container, .player, #player, .composition, .canvas, #canvas, .main-stage {
        max-width: 100% !important;
        max-height: 100% !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        margin: 0 auto !important;
      }
      ${autoMotion}
    </style>`;
    if (debouncedHtml.includes("<head>")) {
      return debouncedHtml.replace("<head>", `<head>${cleanStyle}`);
    }
    return `${cleanStyle}${debouncedHtml}`;
  }, [debouncedHtml, cleanVideoMode, durationSeconds]);

  // Debounce del HTML para la vista previa y sincronización automática de SFX declarados en HTML
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(htmlCode);
      const parsedFromHtml = parseSfxFromHtml(htmlCode);
      const nextSig = JSON.stringify(parsedFromHtml);
      if (nextSig !== lastParsedSfxSigRef.current) {
        lastParsedSfxSigRef.current = nextSig;
        setSfxEvents(parsedFromHtml);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [htmlCode]);

  // Precalentar servidor en la nube de fondo
  React.useEffect(() => {
    let active = true;
    const warmUpEngines = async () => {
      try {
        const res = await fetch("/api/render", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (active && data?.rendererUrl) {
          setRendererUrl(String(data.rendererUrl).replace(/\/$/, ""));
        }
      } catch {}

      try {
        await fetch(`${DEFAULT_RENDERER_URL.replace(/\/$/, "")}/health`, {
          mode: "cors",
          cache: "no-store",
        });
      } catch {}
    };
    warmUpEngines();
    return () => {
      active = false;
    };
  }, []);

  // Calcular escala para el visor según resolución activa
  React.useEffect(() => {
    const updateScale = () => {
      if (phoneContainerRef.current) {
        const width = phoneContainerRef.current.clientWidth;
        if (width > 0) {
          setPreviewScale((width - 24) / dimensions.width);
        }
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [mobileTab, dimensions.width]);

  // Cambiar duración y sincronizar con el código HTML si aplica
  const handleChangeDuration = (sec: number) => {
    setDurationSeconds(sec);
    if (htmlCode.includes("fillProgress")) {
      const updated = htmlCode
        .replace(/fillProgress\s+\d+s/gi, `fillProgress ${sec}s`)
        .replace(/data-duration=["']\d+["']/gi, `data-duration="${sec}"`);
      setHtmlCode(updated);
      setDebouncedHtml(updated);
    }
  };

  // Cargar una plantilla oficial
  const handleSelectTemplate = (tpl: AdTemplate) => {
    const code = tpl.generateHtml(tpl.defaultDuration);
    setHtmlCode(code);
    setDebouncedHtml(code);
    setHtmlTitle(tpl.name.replace(/\s+/g, "_"));
    setDurationSeconds(tpl.defaultDuration);
    setAspectRatio(tpl.aspectRatio);
    setShowTemplatesModal(false);
    setBannerNotice(`Plantilla cargada: "${tpl.name}"`);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  // Guardar proyecto en Biblioteca local
  const handleSaveProject = () => {
    try {
      saveProject({
        title: htmlTitle || "Mi Anuncio ZYRVAE",
        htmlCode,
        durationSeconds,
        aspectRatio,
        type: "draft",
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Error al guardar proyecto:", err);
    }
  };

  // Copiar código HTML al portapapeles
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  // Descargar automáticamente un Blob MP4 en el dispositivo del usuario
  const triggerMp4Download = (blob: Blob, rawTitle: string): { url: string; filename: string } => {
    const cleanName =
      (rawTitle || "Comercial_ZYRVAE")
        .replace(/\.mp4$/i, "")
        .replace(/[^a-zA-Z0-9_\-\s]/g, "")
        .trim()
        .replace(/\s+/g, "_") || "Comercial_ZYRVAE";
    const filename = `${cleanName}.mp4`;
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 2000);

    return { url, filename };
  };

  // Cargar voces disponibles de ElevenLabs (GET /api/tts) y disponibilidad de presets locales
  React.useEffect(() => {
    let active = true;

    const loadAudioAvailability = async () => {
      try {
        const res = await fetch("/api/audio-presets", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (active && res.ok && data) {
          if (data.musicAvailability) setMusicAvailability(data.musicAvailability);
          if (data.sfxAvailability) setSfxAvailability(data.sfxAvailability);
        }
      } catch {}
    };

    const loadVoices = async () => {
      try {
        const res = await fetch("/api/tts", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!active) return;

        if (res.status === 503 || data?.configured === false) {
          setTtsConfigured(false);
          setVoicesError(data?.error || "ELEVENLABS_API_KEY no configurada.");
          return;
        }

        if (!res.ok || !Array.isArray(data?.voices)) {
          setVoicesError(data?.error || "No se pudieron cargar las voces de ElevenLabs.");
          return;
        }

        setTtsConfigured(true);
        setVoicesError(null);
        setElevenVoices(data.voices);
        if (data.voices.length > 0) {
          setSelectedVoiceId((prev) => prev || data.voices[0].voice_id);
        }
      } catch {
        if (active) {
          setVoicesError("No se pudo conectar con /api/tts.");
        }
      } finally {
        if (active) {
          setVoicesLoading(false);
        }
      }
    };

    loadAudioAvailability();
    loadVoices();

    return () => {
      active = false;
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (previewMusicRef.current) {
        previewMusicRef.current.pause();
        previewMusicRef.current = null;
      }
    };
  }, []);

  const selectedVoiceObj = React.useMemo(
    () => elevenVoices.find((v) => v.voice_id === selectedVoiceId) || null,
    [elevenVoices, selectedVoiceId]
  );

  const selectedMusicPresetObj = React.useMemo(
    () => (selectedMusicPresetId ? getMusicPresetById(selectedMusicPresetId) || null : null),
    [selectedMusicPresetId]
  );

  const combinedAudioBytes =
    (audioFile?.sizeBytes || 0) +
    (voiceoverAudio?.sizeBytes || 0) +
    sfxEvents.reduce(
      (sum, ev) => sum + (ev.customBase64 ? Math.round((ev.customBase64.length * 3) / 4) : 0),
      0
    );

  const handlePreviewMusicPreset = () => {
    if (!selectedMusicPresetObj) return;
    if (previewMusicRef.current) {
      previewMusicRef.current.pause();
      previewMusicRef.current = null;
      if (isMusicPreviewPlaying) {
        setIsMusicPreviewPlaying(false);
        return;
      }
    }

    const audio = new Audio(selectedMusicPresetObj.previewPath);
    previewMusicRef.current = audio;
    setIsMusicPreviewPlaying(true);
    audio.onended = () => setIsMusicPreviewPlaying(false);
    audio.onerror = () => {
      setIsMusicPreviewPlaying(false);
      setBannerNotice(
        `El archivo "${selectedMusicPresetObj.fileName}" todavía está pendiente en public/audio/music/. Podés subir un .mp3 propio.`
      );
      setTimeout(() => setBannerNotice(null), 4500);
    };
    audio.play().catch(() => setIsMusicPreviewPlaying(false));
  };

  const handleAddSfxEvent = () => {
    const parsedTime = Math.max(0, Math.min(durationSeconds - 0.1, Number(newSfxTime) || 0));
    const preset = getSfxPresetById(newSfxId);
    const nextEvent: SfxEvent = {
      id: newSfxId,
      timeSec: Number(parsedTime.toFixed(2)),
      volume: preset?.defaultVolume ?? 0.85,
      label: preset?.label || newSfxId,
    };
    setSfxEvents((prev) => [...prev, nextEvent].sort((a, b) => a.timeSec - b.timeSec));
  };

  const handleSyncSfxFromHtml = () => {
    const parsed = parseSfxFromHtml(htmlCode);
    lastParsedSfxSigRef.current = JSON.stringify(parsed);
    setSfxEvents(parsed);
    setBannerNotice(
      parsed.length > 0
        ? `${parsed.length} marcador(es) SFX sincronizados desde el HTML.`
        : "No se encontraron etiquetas zyrvae-sfx en el HTML."
    );
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleGenerateAiSfx = async () => {
    const prompt = customSfxPrompt.trim();
    if (!prompt || isGeneratingSfx) return;

    setIsGeneratingSfx(true);
    setSfxError(null);
    try {
      const res = await fetch("/api/sfx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: prompt,
          durationSeconds: 1.5,
          promptInfluence: 0.4,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.base64) {
        throw new Error(data?.error || "No se pudo generar el efecto SFX.");
      }

      const parsedTime = Math.max(0, Math.min(durationSeconds - 0.1, Number(newSfxTime) || 0));
      const newEvent: SfxEvent = {
        id: "custom-ai",
        timeSec: Number(parsedTime.toFixed(2)),
        volume: 0.9,
        label: `IA: ${prompt.slice(0, 22)}${prompt.length > 22 ? "…" : ""}`,
        customBase64: data.base64,
      };
      setSfxEvents((prev) => [...prev, newEvent].sort((a, b) => a.timeSec - b.timeSec));
      setCustomSfxPrompt("");
    } catch (err: unknown) {
      setSfxError(err instanceof Error ? err.message : "Error generando SFX con ElevenLabs.");
    } finally {
      setIsGeneratingSfx(false);
    }
  };

  const handlePreviewVoice = () => {
    const previewUrl = selectedVoiceObj?.preview_url;
    if (!previewUrl) return;

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      if (isPreviewPlaying) {
        setIsPreviewPlaying(false);
        return;
      }
    }

    const audio = new Audio(previewUrl);
    previewAudioRef.current = audio;
    setIsPreviewPlaying(true);
    audio.onended = () => setIsPreviewPlaying(false);
    audio.onerror = () => setIsPreviewPlaying(false);
    audio.play().catch(() => setIsPreviewPlaying(false));
  };

  const handleGenerateVoiceover = async () => {
    const cleanText = ttsText.trim();
    if (!cleanText || !selectedVoiceId || isGeneratingVoice) return;

    setIsGeneratingVoice(true);
    setTtsError(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          voiceId: selectedVoiceId,
          stability: 0.5,
          similarityBoost: 0.75,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.base64) {
        throw new Error(data?.error || "No se pudo generar la locución.");
      }

      setVoiceoverAudio({
        base64: data.base64,
        sizeBytes: typeof data.sizeBytes === "number" ? data.sizeBytes : Math.round((data.base64.length * 3) / 4),
        voiceName: selectedVoiceObj?.name || "Voz ElevenLabs",
        dataUrl: `data:audio/mpeg;base64,${data.base64}`,
      });
    } catch (err: unknown) {
      setTtsError(err instanceof Error ? err.message : "Error generando voz en off.");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Cargar pista de audio opcional (.mp3 / .wav) — límite 3.5 MB para respetar el tope de 4.5 MB en Vercel
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".mp3") && !lower.endsWith(".wav")) {
      setBannerNotice("Formato de audio no compatible. Adjunta un archivo .mp3 o .wav.");
      setTimeout(() => setBannerNotice(null), 4000);
      e.target.value = "";
      return;
    }

    const MAX_AUDIO_BYTES = Math.floor(3.5 * 1024 * 1024);
    if (file.size > MAX_AUDIO_BYTES) {
      setBannerNotice(
        "El audio supera 3.5 MB (límite de Vercel 4.5 MB con Base64). Te recomendamos usar un .mp3 comprimido en lugar de .wav."
      );
      setTimeout(() => setBannerNotice(null), 6000);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      setAudioFile({
        name: file.name,
        ext: lower.endsWith(".wav") ? "wav" : "mp3",
        sizeBytes: file.size,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  // Conversión asíncrona de HTML a MP4 con progreso real y respaldo local en navegador
  const handleRenderVideo = async () => {
    if (isLoading || !htmlCode.trim()) return;

    setIsLoading(true);
    setFeedback(null);
    setUsingBrowserFallback(false);
    setProgressPercent(2);
    setProgressPhase("queued");
    setProgressFrames({ frame: 0, totalFrames: Math.round(durationSeconds * fps) });
    setProgressStatus("Encolando trabajo en el motor de renderizado...");

    const safeTitle = htmlTitle.trim() || "Comercial_ZYRVAE";
    const requestPayload = {
      mode: "html",
      html: htmlCode,
      title: safeTitle,
      duration: durationSeconds,
      fps,
      width: dimensions.width,
      height: dimensions.height,
      cleanVideo: cleanVideoMode,
      audioData: audioFile?.base64 || null,
      audioExt: audioFile?.ext || null,
      musicPresetId: audioFile ? null : selectedMusicPresetId || null,
      voiceoverBase64: voiceoverAudio?.base64 || null,
      voiceoverExt: voiceoverAudio ? "mp3" : null,
      sfxEvents: sfxEvents.map((ev) => ({
        id: ev.id,
        timeSec: ev.timeSec,
        volume: ev.volume,
        ...(ev.customBase64 ? { customBase64: ev.customBase64, ext: "mp3" } : {}),
      })),
      async: true,
    };

    const formatPhaseLabel = (
      phase: string,
      frame?: number,
      totalFrames?: number,
      queuePosition?: number
    ) => {
      switch (phase) {
        case "queued":
          return queuePosition && queuePosition > 0
            ? `En cola de espera (turno ${queuePosition})...`
            : "En cola de renderizado...";
        case "capturing":
          return frame && totalFrames
            ? `Capturando fotograma ${frame} de ${totalFrames} (${fps} FPS)...`
            : "Capturando fotogramas PNG deterministas...";
        case "encoding":
          return "Codificando MP4 H.264 (CRF 18)...";
        case "done":
          return "¡Video compilado! Descargando MP4...";
        default:
          return "Procesando video...";
      }
    };

    const pollJobUntilDone = async (
      statusEndpointBuilder: (jobId: string) => string,
      downloadEndpointBuilder: (jobId: string, statusData: Record<string, unknown>) => string[],
      jobId: string
    ): Promise<Blob> => {
      const maxWaitMs = 15 * 60 * 1000;
      const startedAt = Date.now();

      while (Date.now() - startedAt < maxWaitMs) {
        await new Promise((r) => setTimeout(r, 1500));

        const statusRes = await fetch(statusEndpointBuilder(jobId), {
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
        if (!statusRes.ok) {
          throw new Error(`No se pudo consultar el estado del trabajo (${statusRes.status}).`);
        }

        const data = (await statusRes.json()) as Record<string, unknown>;
        const status = String(data.status || data.phase || "capturing");
        const frame = typeof data.frame === "number" ? data.frame : 0;
        const totalFrames =
          typeof data.totalFrames === "number" ? data.totalFrames : Math.round(durationSeconds * fps);
        const queuePosition = typeof data.queuePosition === "number" ? data.queuePosition : 0;
        const percent = typeof data.percent === "number" ? data.percent : 0;

        setProgressPhase(status);
        setProgressFrames({ frame, totalFrames });
        setProgressPercent(Math.max(2, Math.min(99, percent)));
        setProgressStatus(formatPhaseLabel(status, frame, totalFrames, queuePosition));

        if (status === "error") {
          throw new Error(String(data.error || "El servidor reportó un error durante el renderizado."));
        }

        if (status === "done") {
          setProgressPercent(99);
          setProgressStatus("Descargando MP4 terminado...");
          const candidateUrls = downloadEndpointBuilder(jobId, data);
          for (const dlUrl of candidateUrls) {
            if (!dlUrl) continue;
            try {
              const fileRes = await fetch(dlUrl, { cache: "no-store" });
              if (fileRes.ok) {
                const blob = await fileRes.blob();
                if (blob.size >= 500) return blob;
              }
            } catch {}
          }
          throw new Error("El archivo MP4 terminó de renderizarse pero falló la descarga.");
        }
      }

      throw new Error("El trabajo excedió el tiempo máximo de espera.");
    };

    try {
      let mp4Blob: Blob | null = null;
      let usedEngine = "Motor Cloud Dedicado (Puppeteer WAAPI + FFmpeg H.264)";
      let usedFallback = false;

      // ETAPA 1: Llamada directa asíncrona al renderer-service (sin pasar por timeout ni tope de 4.5 MB de Vercel)
      const targetCloudUrl = (rendererUrl || DEFAULT_RENDERER_URL).replace(/\/$/, "");
      try {
        const directRes = await fetch(`${targetCloudUrl}/render`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, video/mp4",
          },
          body: JSON.stringify(requestPayload),
          signal: AbortSignal.timeout(15000),
        });

        const directType = directRes.headers.get("content-type") || "";
        if (directRes.ok && directType.includes("application/json")) {
          const jobInit = await directRes.json();
          if (jobInit?.jobId) {
            usedEngine = "Motor Cloud Dedicado (Async Job · Puppeteer + FFmpeg)";
            mp4Blob = await pollJobUntilDone(
              (id) => `${targetCloudUrl}/render?jobId=${encodeURIComponent(id)}`,
              (id) => [
                `${targetCloudUrl}/render/download/${encodeURIComponent(id)}`,
                `/api/render?jobId=${encodeURIComponent(id)}&download=1`,
              ],
              jobInit.jobId
            );
          }
        } else if (
          directRes.ok &&
          (directType.includes("video/mp4") || directType.includes("octet-stream"))
        ) {
          mp4Blob = await directRes.blob();
        }
      } catch (directErr) {
        console.warn("[Conversor MP4] Aviso en llamada directa, pasando a API proxy:", directErr);
      }

      // ETAPA 2: Proxy API (/api/render) con trabajo asíncrono + polling
      if (!mp4Blob) {
        const sfxCustomChars = sfxEvents.reduce(
          (acc, ev) => acc + (ev.customBase64 ? ev.customBase64.length : 0),
          0
        );
        const proxyAudioBase64Chars =
          (audioFile?.base64.length || 0) + (voiceoverAudio?.base64.length || 0) + sfxCustomChars;
        const MAX_PROXY_AUDIO_CHARS = Math.ceil(3.5 * 1024 * 1024 * 1.37);
        if (proxyAudioBase64Chars > MAX_PROXY_AUDIO_CHARS) {
          throw new Error(
            "La suma de música y voz en off supera el límite de 3.5 MB del proxy Vercel. Usá una pista .mp3 más liviana o conectá directamente con el renderer-service."
          );
        }

        let proxyPayloadTooLargeMessage: string | null = null;
        try {
          setProgressStatus("Conectando vía API proxy de estudio...");
          const apiRes = await fetch("/api/render", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestPayload),
            signal: AbortSignal.timeout(18000),
          });

          if (apiRes.status === 413) {
            const errBody = await apiRes.json().catch(() => null);
            proxyPayloadTooLargeMessage =
              errBody?.message ||
              "El archivo de audio excede el límite de 4.5 MB del proxy Vercel. Usá un .mp3 menor a 3 MB.";
          } else {
            const apiType = apiRes.headers.get("content-type") || "";
            if (apiRes.ok && apiType.includes("application/json")) {
              const jobInit = await apiRes.json();
              if (jobInit?.jobId) {
                usedEngine = "Servidor Cloud de Video MP4 (Async Proxy)";
                mp4Blob = await pollJobUntilDone(
                  (id) => `/api/render?jobId=${encodeURIComponent(id)}`,
                  (id, statusData) => [
                    typeof statusData.directDownloadUrl === "string"
                      ? statusData.directDownloadUrl
                      : "",
                    `/api/render?jobId=${encodeURIComponent(id)}&download=1`,
                  ],
                  jobInit.jobId
                );
              }
            } else if (
              apiRes.ok &&
              (apiType.includes("video/mp4") || apiType.includes("octet-stream"))
            ) {
              mp4Blob = await apiRes.blob();
              usedEngine = "Servidor Cloud de Video MP4";
            }
          }
        } catch (apiErr) {
          console.warn(
            "[Conversor MP4] Aviso en API proxy, activando motor local de respaldo:",
            apiErr
          );
        }

        if (proxyPayloadTooLargeMessage) {
          throw new Error(proxyPayloadTooLargeMessage);
        }
      }

      // ETAPA 3: Fallback explícito al motor local del navegador
      if (!mp4Blob || mp4Blob.size < 500) {
        usedFallback = true;
        setUsingBrowserFallback(true);
        setProgressPhase("fallback");
        usedEngine = "Motor Local de Navegador (Respaldo — sin audio externo)";
        mp4Blob = await renderHtmlToMp4InBrowser({
          html: htmlCode,
          durationSeconds,
          fps,
          width: dimensions.width,
          height: dimensions.height,
          cleanVideo: cleanVideoMode,
          onProgress: (pct, statusText, meta) => {
            setProgressPercent(pct);
            setProgressStatus(statusText);
            if (meta) {
              setProgressFrames(meta);
            }
          },
        });
      }

      setProgressPhase("done");
      setProgressPercent(100);
      setProgressStatus("¡Descargando archivo MP4!");

      const { url, filename } = triggerMp4Download(mp4Blob, safeTitle);
      const durText = durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`;

      try {
        saveProject({
          title: safeTitle,
          htmlCode,
          durationSeconds,
          aspectRatio,
          type: "rendered",
        });
      } catch {}

      setFeedback({
        type: "success",
        message: `¡Tu código fue convertido a MP4 (${durText} @ ${fps} FPS) con éxito! La descarga de "${filename}" comenzó automáticamente.`,
        engine: usedEngine,
        downloadUrl: url,
        filename,
        usedFallback,
      });
      setShowResultModal(true);
    } catch (err: unknown) {
      console.error("Error al convertir a MP4:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({
        type: "error",
        message: "Ocurrió un inconveniente al generar el archivo MP4.",
        details: errorMsg,
      });
      setShowResultModal(true);
    } finally {
      setIsLoading(false);
      setProgressPercent(0);
      setProgressStatus("");
      setProgressPhase("");
      setProgressFrames(null);
    }
  };

  return (
    <div className="px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto space-y-5 md:space-y-6">
      {/* ========================================================= */}
      {/* BARRA SUPERIOR: ENCABEZADO Y ACCIONES PRINCIPALES         */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3.5 pb-4 border-b border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link
                href="/library"
                className="hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Biblioteca de Plantillas
              </Link>
              <span>/</span>
              <span className="text-zinc-300">Estudio de Video MP4</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Film className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400" />
              Estudio de Video HTML a MP4
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Crea o pega tu código con animaciones CSS y expórtalo a video .MP4 listo para publicar.
            </p>
          </div>

          {/* Barra de Acciones Globales del Estudio */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón: Cargar Plantilla */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatesModal(true)}
              className="h-8 text-xs border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold gap-1.5 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Cargar Plantilla
            </Button>

            {/* Botón: Reglas Técnicas IA */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPromptModal(true)}
              className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium gap-1.5"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              Reglas para IA ({durationSeconds === 60 ? "1 min" : `${durationSeconds}s`})
            </Button>

            {/* Botón: Guardar Proyecto */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveProject}
              className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
              title="Guardar proyecto en tu biblioteca local"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                  Guardar
                </>
              )}
            </Button>

            {/* Ir a Biblioteca */}
            <Link href="/library">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 gap-1.5"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Biblioteca
              </Button>
            </Link>
          </div>
        </div>

        {/* Notificación si se cargó una plantilla o proyecto */}
        {bannerNotice && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 animate-in fade-in slide-in-from-top-1">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {bannerNotice}
            </span>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Barra móvil para alternar entre "Código HTML" y "Vista Previa" */}
        <div className="lg:hidden flex items-center bg-zinc-900/95 p-1 rounded-xl border border-zinc-800 shadow-md sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-30 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileTab === "editor"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 className="h-4 w-4" />
            Editor & Ajustes
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileTab === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Vista Previa {aspectRatio}
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CUERPO PRINCIPAL: 2 COLUMNAS (EDITOR + VISOR EN VIVO)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* COLUMNA IZQUIERDA: FLUJO SECUENCIAL 1-2-3 */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileTab === "editor" ? "block" : "hidden lg:block"
          }`}
        >
          {/* PASO 1: CONFIGURACIÓN DE SALIDA (DURACIÓN & FORMATO) */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                    1
                  </span>
                  Configuración del Video MP4
                </CardTitle>
                <span className="text-[11px] font-mono text-zinc-400">
                  {dimensions.width}×{dimensions.height} • {durationSeconds}s • {fps} FPS
                </span>
              </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-5 pb-4 pt-0 space-y-4">
              {/* Nombre del archivo */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Nombre del archivo de video (.mp4)
                </label>
                <Input
                  value={htmlTitle}
                  disabled={isLoading}
                  onChange={(e) => setHtmlTitle(e.target.value)}
                  placeholder="Ej: Comercial_ZYRVAE"
                  className="h-8 sm:h-9 bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs sm:text-sm focus:border-indigo-500 rounded-xl"
                />
              </div>

              {/* Grid 2 columnas: Duración y Formato */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Duración */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      Duración del Video
                    </label>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                      {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.seconds}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleChangeDuration(preset.seconds)}
                        className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                          durationSeconds === preset.seconds
                            ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <span className="text-xs font-bold block">{preset.label}</span>
                        <span className="text-[9px] text-zinc-500 block truncate">
                          {preset.desc.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Duración custom */}
                  <div className="flex items-center gap-2 pt-0.5 text-xs text-zinc-400">
                    <span className="text-[11px] text-zinc-400">Personalizado:</span>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      disabled={isLoading}
                      value={durationSeconds}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= 120) {
                          handleChangeDuration(val);
                        }
                      }}
                      className="w-14 px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-center text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[11px] text-zinc-500">seg (1-120s)</span>
                  </div>
                </div>

                {/* Formato / Aspect Ratio */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
                      Proporción & Formato
                    </label>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                      {aspectRatio}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setAspectRatio("9:16")}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        aspectRatio === "9:16"
                          ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xs font-bold block">9:16</span>
                      <span className="text-[9px] text-zinc-500 block">Reels/TikTok</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setAspectRatio("16:9")}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        aspectRatio === "16:9"
                          ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xs font-bold block">16:9</span>
                      <span className="text-[9px] text-zinc-500 block">YouTube</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setAspectRatio("1:1")}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        aspectRatio === "1:1"
                          ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xs font-bold block">1:1</span>
                      <span className="text-[9px] text-zinc-500 block">Cuadrado</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Selector de FPS y Calidad */}
              <div className="pt-1 border-t border-zinc-800/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs pt-2">
                  <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                    FPS y Calidad de Captura
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {Math.round(durationSeconds * fps)} cuadros • CRF 18
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setFps(30)}
                    className={`py-2 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      fps === 30
                        ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">30 FPS Estándar</span>
                      <span className="text-[10px] text-zinc-400 block">Meta Ads / Reels / TikTok</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/90 text-indigo-300">
                      30p
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setFps(60)}
                    className={`py-2 px-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      fps === 60
                        ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">60 FPS Ultra Fluido</span>
                      <span className="text-[10px] text-zinc-400 block">Máxima suavidad (2× cuadros)</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/90 text-emerald-300">
                      60p
                    </span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PASO 2: CÓDIGO HTML / CSS DEL ANUNCIO */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="pb-2.5 pt-4 px-4 sm:px-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                      2
                    </span>
                    Código HTML / CSS del Anuncio
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    El código debe ser autónomo y contener animaciones CSS (@keyframes).
                  </CardDescription>
                </div>

                {/* Acciones del editor */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => setShowTemplatesModal(true)}
                    className="h-7 text-[11px] border-zinc-800 hover:bg-zinc-800 text-indigo-300 gap-1.5"
                  >
                    <Sparkles className="h-3 w-3" />
                    Plantillas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={handleCopyHtml}
                    className="h-7 text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-zinc-400" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => {
                      setHtmlCode("");
                      setDebouncedHtml("");
                    }}
                    className="h-7 text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 gap-1"
                    title="Limpiar código"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-5 pb-4 space-y-3">
              {/* Textarea optimizada */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-400">
                    Documento HTML integrado:
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {htmlCode.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={13}
                  value={htmlCode}
                  disabled={isLoading}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<!DOCTYPE html><html><head>...</head><body>...</body></html>"
                  spellCheck={false}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 text-xs sm:text-[13px] font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y leading-relaxed"
                />

                {/* Detector de Animación Contextual */}
                {!hasAnimations && debouncedHtml.trim() && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs text-amber-200 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-300">
                          Aviso: Este código no contiene animaciones continuas (@keyframes)
                        </p>
                        <p className="text-zinc-300 mt-0.5 text-[11px] leading-relaxed">
                          Para que el video MP4 tenga movimiento continuo durante los{" "}
                          {durationSeconds === 60 ? "60 segundos" : `${durationSeconds} segundos`} sin
                          quedar congelado, debe incluir animaciones CSS automáticas.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPromptModal(true)}
                      className="shrink-0 h-7 text-[11px] border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                    >
                      Ver Reglas Técnicas
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PASO 3: EXPORTACIÓN Y CONVERSIÓN A MP4 */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl rounded-2xl">
            <CardContent className="pt-4 px-4 sm:px-5 pb-5 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                    3
                  </span>
                  Exportar a Video MP4
                </CardTitle>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`} • {fps} FPS • H.264
                </span>
              </div>

              {/* Modo Publicación Limpio */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="cleanVideoCheckbox"
                  checked={cleanVideoMode}
                  disabled={isLoading}
                  onChange={(e) => setCleanVideoMode(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="cleanVideoCheckbox"
                  className="text-xs cursor-pointer select-none space-y-0.5"
                >
                  <span className="font-semibold text-zinc-200 block">
                    Modo Publicación Limpio (Ocultar botones de reproducción web)
                  </span>
                  <span className="text-[11px] text-zinc-400 block leading-normal">
                    Elimina automáticamente botones de Play/Pause y paneles laterales para que el archivo .MP4 quede limpio y profesional.
                  </span>
                </label>
              </div>

              {/* Música de Fondo (Presets + Archivo propio) */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Music className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="font-semibold text-zinc-200">
                      Música de Fondo (Presets / MP3)
                    </span>
                  </div>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    disabled={isLoading}
                    onChange={handleAudioFileChange}
                    className="hidden"
                  />
                  {audioFile ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setAudioFile(null);
                        if (audioInputRef.current) audioInputRef.current.value = "";
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Quitar archivo
                    </button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isLoading}
                      onClick={() => audioInputRef.current?.click()}
                      className="h-7 text-[11px] border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                    >
                      Subir .mp3/.wav
                    </Button>
                  )}
                </div>

                {!audioFile && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedMusicPresetId}
                        disabled={isLoading}
                        onChange={(e) => {
                          setSelectedMusicPresetId(e.target.value);
                          if (previewMusicRef.current) {
                            previewMusicRef.current.pause();
                            setIsMusicPreviewPlaying(false);
                          }
                        }}
                        className="flex-1 min-w-0 h-8 px-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Sin música preset</option>
                        {MUSIC_PRESETS.map((preset) => {
                          const available = musicAvailability[preset.id];
                          return (
                            <option key={preset.id} value={preset.id}>
                              {preset.title} ({preset.bpm} BPM){available === false ? " · Archivo pendiente" : ""}
                            </option>
                          );
                        })}
                      </select>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!selectedMusicPresetObj || isLoading}
                        onClick={handlePreviewMusicPreset}
                        className="h-8 px-2.5 text-[11px] border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 shrink-0"
                      >
                        {isMusicPreviewPlaying ? (
                          <>
                            <Square className="h-3 w-3 mr-1 text-indigo-400" />
                            Parar
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                            Preview
                          </>
                        )}
                      </Button>
                    </div>
                    {selectedMusicPresetObj && (
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-zinc-400 truncate">
                          {selectedMusicPresetObj.mood} · Loop automático ({voiceoverAudio ? "vol 20%" : "vol 55%"})
                        </span>
                        {musicAvailability[selectedMusicPresetObj.id] === false ? (
                          <span className="text-amber-300 font-mono shrink-0">Archivo pendiente</span>
                        ) : (
                          <span className="text-emerald-300 font-mono shrink-0">Preset listo</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {audioFile ? (
                  <p className="text-[11px] font-mono text-emerald-300 truncate">
                    ✓ {audioFile.name} ({(audioFile.sizeBytes / (1024 * 1024)).toFixed(2)} MB) — {voiceoverAudio ? "Música al 20% bajo voz (AAC 192k)" : "Música al 55% (AAC 192k)"}
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500">
                    Elegí un preset integrado o subí tu .mp3 propio (máx. 3.5 MB). Se ajusta en loop a {durationSeconds}s.
                  </p>
                )}
              </div>

              {/* Efectos de Sonido (SFX) Sincronizados */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-zinc-200">
                      Efectos de Sonido (SFX) ({sfxEvents.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleSyncSfxFromHtml}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline"
                  >
                    Leer del HTML
                  </button>
                </div>

                {sfxEvents.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Sin SFX activos. Agregá uno abajo o declará <code className="text-zinc-300">&lt;meta name=&quot;zyrvae-sfx&quot; content=&quot;impact@2.0,whoosh@8.0&quot;&gt;</code> en tu HTML.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {sfxEvents.map((ev, idx) => {
                      const isCustomAi = Boolean(ev.customBase64);
                      const isMissingFile = !isCustomAi && sfxAvailability[ev.id] === false;
                      return (
                        <div
                          key={`${ev.id}-${idx}`}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px]"
                        >
                          {isCustomAi ? (
                            <span className="flex-1 min-w-0 truncate text-cyan-300 font-medium px-1">
                              {ev.label || "SFX IA"}
                            </span>
                          ) : (
                            <select
                              value={ev.id}
                              disabled={isLoading}
                              onChange={(e) => {
                                const nextId = e.target.value;
                                const preset = getSfxPresetById(nextId);
                                setSfxEvents((prev) =>
                                  prev.map((item, i) =>
                                    i === idx
                                      ? { ...item, id: nextId, label: preset?.label || nextId }
                                      : item
                                  )
                                );
                              }}
                              className="flex-1 min-w-0 h-7 px-1.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100"
                            >
                              {SFX_PRESETS.map((sp) => (
                                <option key={sp.id} value={sp.id}>
                                  {sp.label}{sfxAvailability[sp.id] === false ? " (pendiente)" : ""}
                                </option>
                              ))}
                            </select>
                          )}

                          {isMissingFile && (
                            <span
                              title={`Falta ${ev.id}.mp3 en public/audio/sfx/`}
                              className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] shrink-0"
                            >
                              Pendiente
                            </span>
                          )}

                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              min={0}
                              max={Math.max(0, durationSeconds - 0.1)}
                              step={0.1}
                              disabled={isLoading}
                              value={ev.timeSec}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                setSfxEvents((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, timeSec: val } : item))
                                );
                              }}
                              className="w-14 h-7 px-1.5 rounded bg-zinc-950 border border-zinc-700 text-right font-mono text-zinc-100"
                            />
                            <span className="text-zinc-500">s</span>
                          </div>

                          <input
                            type="number"
                            min={0.1}
                            max={1}
                            step={0.05}
                            title="Volumen (0.1 - 1.0)"
                            disabled={isLoading}
                            value={ev.volume}
                            onChange={(e) => {
                              const val = Math.min(1, Math.max(0.1, Number(e.target.value) || 0.85));
                              setSfxEvents((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, volume: val } : item))
                              );
                            }}
                            className="w-12 h-7 px-1 rounded bg-zinc-950 border border-zinc-700 text-right font-mono text-zinc-200 shrink-0"
                          />

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => setSfxEvents((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 rounded text-red-300 hover:bg-red-500/20 shrink-0"
                            title="Quitar SFX"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-1.5 pt-1">
                  <select
                    value={newSfxId}
                    disabled={isLoading}
                    onChange={(e) => setNewSfxId(e.target.value)}
                    className="flex-1 min-w-0 h-7 px-2 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-100"
                  >
                    {SFX_PRESETS.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.label} ({sp.durationSec}s){sfxAvailability[sp.id] === false ? " · Pendiente" : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, durationSeconds - 0.1)}
                    step={0.1}
                    disabled={isLoading}
                    value={newSfxTime}
                    onChange={(e) => setNewSfxTime(e.target.value)}
                    placeholder="Seg"
                    className="w-16 h-7 px-2 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] font-mono text-zinc-100"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleAddSfxEvent}
                    className="h-7 px-2 text-[11px] border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 shrink-0"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar SFX
                  </Button>
                </div>

                {ttsConfigured && (
                  <div className="pt-1 border-t border-zinc-800/70 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        maxLength={250}
                        disabled={isLoading || isGeneratingSfx}
                        value={customSfxPrompt}
                        onChange={(e) => setCustomSfxPrompt(e.target.value)}
                        placeholder="SFX con ElevenLabs (ej. deep bass drop impact)..."
                        className="flex-1 min-w-0 h-7 px-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-100 placeholder:text-zinc-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isLoading || isGeneratingSfx || !customSfxPrompt.trim()}
                        onClick={handleGenerateAiSfx}
                        className="h-7 px-2 text-[11px] border-fuchsia-500/40 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-200 shrink-0"
                      >
                        {isGeneratingSfx ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Wand2 className="h-3 w-3 mr-1" />
                            Generar SFX
                          </>
                        )}
                      </Button>
                    </div>
                    {sfxError && <p className="text-[11px] text-red-400">{sfxError}</p>}
                  </div>
                )}
              </div>

              {/* Voz en Off con ElevenLabs */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Mic className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" />
                    <span className="font-semibold text-zinc-200">
                      Voz en Off (ElevenLabs)
                    </span>
                  </div>
                  {voiceoverAudio && (
                    <button
                      type="button"
                      disabled={isLoading || isGeneratingVoice}
                      onClick={() => setVoiceoverAudio(null)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Quitar voz
                    </button>
                  )}
                </div>

                {!ttsConfigured ? (
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    Configurá <code className="text-amber-200">ELEVENLABS_API_KEY</code> en el entorno del servidor para habilitar la locución IA sin exponer la clave en el navegador.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedVoiceId}
                        disabled={isLoading || isGeneratingVoice || voicesLoading || elevenVoices.length === 0}
                        onChange={(e) => {
                          setSelectedVoiceId(e.target.value);
                          if (previewAudioRef.current) {
                            previewAudioRef.current.pause();
                            setIsPreviewPlaying(false);
                          }
                        }}
                        className="flex-1 min-w-0 h-8 px-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                      >
                        {voicesLoading ? (
                          <option value="">Cargando voces...</option>
                        ) : elevenVoices.length === 0 ? (
                          <option value="">Sin voces disponibles</option>
                        ) : (
                          elevenVoices.map((voice) => {
                            const accent = voice.labels?.accent || voice.labels?.language || voice.category || "";
                            return (
                              <option key={voice.voice_id} value={voice.voice_id}>
                                {voice.name}{accent ? ` (${accent})` : ""}
                              </option>
                            );
                          })
                        )}
                      </select>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!selectedVoiceObj?.preview_url || isLoading}
                        onClick={handlePreviewVoice}
                        title="Escuchar muestra gratuita de ElevenLabs sin gastar créditos"
                        className="h-8 px-2.5 text-[11px] border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 shrink-0"
                      >
                        {isPreviewPlaying ? (
                          <>
                            <Square className="h-3 w-3 mr-1 text-fuchsia-400" />
                            Parar
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5 mr-1 text-fuchsia-400" />
                            Preview
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <textarea
                        rows={3}
                        maxLength={3000}
                        disabled={isLoading || isGeneratingVoice}
                        value={ttsText}
                        onChange={(e) => setTtsText(e.target.value)}
                        placeholder="Escribí acá el guion de la locución para tu anuncio..."
                        className="w-full px-2.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 resize-y"
                      />
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Modelo: eleven_multilingual_v2 · MP3 128kbps</span>
                        <span className={ttsText.length > 2800 ? "text-amber-300 font-mono" : "font-mono"}>
                          {ttsText.length} / 3000
                        </span>
                      </div>
                    </div>

                    {voicesError && (
                      <p className="text-[11px] text-amber-300">{voicesError}</p>
                    )}
                    {ttsError && (
                      <p className="text-[11px] text-red-400">{ttsError}</p>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      disabled={isLoading || isGeneratingVoice || !ttsText.trim() || !selectedVoiceId}
                      onClick={handleGenerateVoiceover}
                      className="w-full h-8 text-xs font-medium bg-fuchsia-600/90 hover:bg-fuchsia-500 text-white"
                    >
                      {isGeneratingVoice ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Sintetizando voz...
                        </>
                      ) : voiceoverAudio ? (
                        <>
                          <Mic className="h-3.5 w-3.5 mr-1.5" />
                          Regenerar Voz en Off
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5 mr-1.5" />
                          Generar Voz en Off
                        </>
                      )}
                    </Button>

                    {voiceoverAudio && (
                      <div className="space-y-1.5 pt-1">
                        <audio
                          controls
                          src={voiceoverAudio.dataUrl}
                          className="w-full h-8"
                        />
                        <p className="text-[11px] font-mono text-fuchsia-300 truncate">
                          ✓ Voz lista ({voiceoverAudio.voiceName} · {(voiceoverAudio.sizeBytes / 1024).toFixed(0)} KB)
                          {audioFile || selectedMusicPresetId ? " — Se mezclará con música al 20%" : ""}
                        </p>
                      </div>
                    )}

                    {combinedAudioBytes > 3.5 * 1024 * 1024 && (
                      <p className="text-[11px] text-amber-300 leading-relaxed">
                        Aviso: música + voz suman {(combinedAudioBytes / (1024 * 1024)).toFixed(2)} MB (&gt; 3.5 MB). Si se usa el proxy de Vercel en vez de conexión directa al renderer-service, podría exceder el límite de 4.5 MB.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Aviso claro si se activó el Fallback Local del Navegador */}
              {usingBrowserFallback && isLoading && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-300">
                      Usando renderizador local del navegador (modo respaldo)
                    </p>
                    <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                      El servidor dedicado (renderer-service) no respondió a tiempo. El video se está codificando localmente en tu navegador (la mezcla de audio externo no está disponible en modo local).
                    </p>
                  </div>
                </div>
              )}

              {/* Barra de Progreso en Vivo */}
              {isLoading && (
                <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-indigo-300 font-medium flex items-center gap-2 truncate">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400 shrink-0" />
                      <span className="truncate">{progressStatus || "Convirtiendo HTML a MP4..."}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-indigo-400 shrink-0">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.max(4, progressPercent)}%` }}
                    />
                  </div>
                  {progressFrames && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>
                        Estado: {progressPhase || "procesando"}
                      </span>
                      <span>
                        {progressFrames.frame} / {progressFrames.totalFrames} cuadros ({fps} FPS)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón Principal de Conversión */}
              <div>
                <Button
                  onClick={handleRenderVideo}
                  disabled={isLoading || !htmlCode.trim()}
                  className="w-full h-12 text-sm font-semibold rounded-xl transition-all shadow-lg gap-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Convirtiendo HTML a MP4 ({durationSeconds}s)...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 text-white fill-white" />
                      Convertir HTML a MP4 y Descargar ({durationSeconds === 60 ? "1 min" : `${durationSeconds}s`})
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  Descarga directa del archivo MP4 en resolución {dimensions.width}×{dimensions.height} compatible con TikTok, Reels y WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: MOCKUP DE DISPOSITIVO / PREVISUALIZACIÓN */}
        <div
          className={`lg:col-span-5 flex flex-col items-center justify-center space-y-3 ${
            mobileTab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Barra superior del visor */}
          <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[340px] flex items-center justify-between px-2 text-xs gap-2">
            <span className="font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 text-[11px]">
              <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
              Vista Previa en Vivo
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSafeZones((v) => !v)}
                className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border transition-colors ${
                  showSafeZones
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
                title="Mostrar/ocultar guías de Safe Zones (Reels, TikTok, Shorts) — solo visual, no se exporta"
              >
                {showSafeZones ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                Safe Zone
              </button>
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Reiniciar animación"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-zinc-800 text-zinc-400"
              >
                {dimensions.width}×{dimensions.height}
              </Badge>
            </div>
          </div>

          {/* Smartphone / Screen Container */}
          <div
            ref={phoneContainerRef}
            className={`relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[340px] ${
              aspectRatio === "16:9"
                ? "aspect-[16/9] rounded-2xl max-w-[420px]"
                : aspectRatio === "1:1"
                ? "aspect-square rounded-2xl"
                : "aspect-[9/16] rounded-[2.5rem]"
            } p-3 sm:p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-[4px] sm:border-[5px] border-zinc-800 shadow-2xl shadow-black ring-1 ring-zinc-700/50 flex flex-col`}
          >
            {/* Dynamic Island en 9:16 */}
            {aspectRatio === "9:16" && (
              <div className="absolute top-3.5 sm:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="w-20 sm:w-24 h-3.5 sm:h-4 bg-zinc-950 rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-zinc-800" />
                </div>
              </div>
            )}

            {/* Pantalla del Mockup */}
            <div className="relative flex-1 rounded-[1.8rem] overflow-hidden bg-zinc-950 border border-zinc-800/80 flex flex-col">
              <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                    <p className="text-xs font-semibold text-zinc-200">
                      Generando archivo .MP4 ({progressPercent}%)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {progressStatus || "Procesando fotogramas..."}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      width: dimensions.width,
                      height: dimensions.height,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "center center",
                    }}
                    className="relative shrink-0 pointer-events-auto"
                  >
                    <iframe
                      key={iframeKey}
                      srcDoc={previewHtml || "<body style='background:#09090b;'></body>"}
                      title="Previsualización de Código HTML"
                      sandbox="allow-scripts"
                      style={{ width: dimensions.width, height: dimensions.height }}
                      className="border-0 bg-zinc-950"
                    />

                    {/* Overlay visual de Safe Zones (Reels / TikTok / Shorts) — NO se incluye en el MP4 */}
                    {showSafeZones && (
                      <div className="absolute inset-0 pointer-events-none z-20">
                        {/* Zona superior (15%) */}
                        <div
                          style={{ height: "15%" }}
                          className="absolute top-0 left-0 right-0 bg-rose-500/20 border-b-2 border-dashed border-rose-400 flex items-end justify-center pb-3"
                        >
                          <span className="px-4 py-1 bg-black/75 text-rose-200 font-mono text-2xl tracking-widest uppercase">
                            UI SUPERIOR (15%)
                          </span>
                        </div>

                        {/* Zona inferior Reels / TikTok / Shorts (22%) */}
                        <div
                          style={{ height: "22%" }}
                          className="absolute bottom-0 left-0 right-0 bg-rose-500/20 border-t-2 border-dashed border-rose-400 flex items-start justify-center pt-4"
                        >
                          <span className="px-4 py-1 bg-black/75 text-rose-200 font-mono text-2xl tracking-widest uppercase">
                            UI REELS / TIKTOK / SHORTS (22%)
                          </span>
                        </div>

                        {/* Zona lateral derecha botones de interacción (12%) */}
                        <div
                          style={{ top: "15%", bottom: "22%", width: "12%" }}
                          className="absolute right-0 bg-amber-500/15 border-l-2 border-dashed border-amber-400 flex items-center justify-center"
                        >
                          <span className="px-2 py-1 bg-black/75 text-amber-200 font-mono text-xl -rotate-90 whitespace-nowrap uppercase">
                            BOTONES (12%)
                          </span>
                        </div>

                        {/* Rectángulo verde de área segura de contenido */}
                        <div
                          style={{ top: "15%", bottom: "22%", left: "7%", right: "12%" }}
                          className="absolute border-2 border-dashed border-emerald-400/80"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Badge flotante indicador HTML LIVE */}
                <div className="absolute top-6 left-3.5 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md text-[10px] text-zinc-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {aspectRatio} • {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}
                  </span>
                </div>
              </div>

              {/* Home bar inferior */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-1 bg-zinc-600/60 rounded-full pointer-events-none z-30" />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center max-w-[300px] leading-relaxed">
            El archivo de video final se grabará fotograma a fotograma exactamente como se ve en esta previsualización.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: SELECTOR RÁPIDO DE PLANTILLAS OFICIALES            */}
      {/* ========================================================= */}
      <Dialog open={showTemplatesModal} onOpenChange={setShowTemplatesModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-white">
                  Cargar Plantilla Animada
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Selecciona una plantilla prediseñada para cargarla en el editor con 1 clic.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className="group p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-indigo-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {tpl.defaultDuration}s • 9:16
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-100 group-hover:text-white transition-colors text-sm mt-2">
                    {tpl.name}
                  </h4>
                  <p className="text-zinc-400 text-xs line-clamp-2 mt-1">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                  <span>Cargar en el Estudio</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
            <Link href="/library" onClick={() => setShowTemplatesModal(false)}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-zinc-800 text-zinc-300 hover:text-white text-xs gap-1.5"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Ver Todas en la Biblioteca
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatesModal(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white text-xs"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: REGLAS TÉCNICAS DE RENDERIZADO PARA IA             */}
      {/* ========================================================= */}
      <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Lightbulb className="h-5 w-5 text-amber-400" />
              </span>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-white">
                  Reglas Técnicas para IAs ({durationSeconds === 60 ? "1 min (60s)" : `${durationSeconds}s`} · {aspectRatio})
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Instrucciones técnicas indispensables para que ChatGPT, Claude o tu IA generen código que se renderice a video MP4 fluido.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 my-2">
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-zinc-300 space-y-1.5">
              <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-indigo-400" />
                Libertad creativa + Precisión técnica
              </p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Este prompt <strong className="text-zinc-200">no te impone cómo debe ser tu anuncio</strong> (el guion, estética, temática y producto los decides tú libremente). Establece las <strong className="text-indigo-300">reglas técnicas de renderizado</strong> para que el motor de video pueda exportar un MP4 animado de <strong className="text-white">{durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`}</strong> sin controles de reproductor ni fotos fijas.
              </p>
            </div>

            {/* Selector rápido de duración dentro del modal */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
              <span className="text-zinc-400 font-medium">Sincronizado con duración:</span>
              <div className="flex items-center gap-1.5">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    type="button"
                    onClick={() => handleChangeDuration(preset.seconds)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      durationSeconds === preset.seconds
                        ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500/50"
                        : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Reglas listas para copiar a tu IA:</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {aspectRatio} · {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-black/90 border border-zinc-800 text-zinc-200 text-[11px] sm:text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto select-all">
                {dynamicAiPrompt}
              </pre>
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPromptModal(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white"
            >
              Cerrar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCopyPrompt}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-medium"
            >
              {copiedPrompt ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  ¡Reglas Copiadas!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar Reglas Técnicas
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL DE RESULTADO: REPRODUCTOR MP4 Y DESCARGA            */}
      {/* ========================================================= */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center mb-2 mx-auto sm:mx-0 ${
                feedback?.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {feedback?.type === "success" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <DialogTitle className="text-base sm:text-lg font-semibold">
              {feedback?.type === "success"
                ? "¡Video MP4 Generado y Descargado!"
                : "Error al generar video"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs leading-relaxed pt-1">
              {feedback?.message}
            </DialogDescription>
          </DialogHeader>

          {feedback?.details && (
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 max-h-32 overflow-y-auto">
              {feedback.details}
            </div>
          )}

          {feedback?.type === "success" && (
            <div className="space-y-3">
              {feedback.downloadUrl && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black flex justify-center max-h-56">
                  <video
                    src={feedback.downloadUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-56 max-w-full object-contain"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Archivo:</span>
                  <span className="font-mono text-zinc-200">{feedback.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolución:</span>
                  <span className="font-mono text-zinc-200">
                    {dimensions.width}×{dimensions.height} ({aspectRatio} · {fps} FPS)
                  </span>
                </div>
                {feedback.engine && (
                  <div className="flex justify-between">
                    <span>Motor empleado:</span>
                    <span
                      className={`font-mono text-[11px] truncate max-w-[200px] ${
                        feedback.usedFallback ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {feedback.engine}
                    </span>
                  </div>
                )}
              </div>

              {feedback.usedFallback && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
                  Aviso: Este video se exportó con el renderizador local del navegador porque el servicio dedicado no estuvo disponible.
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-row items-center justify-between gap-2 pt-2 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResultModal(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white"
            >
              Cerrar
            </Button>
            {feedback?.type === "success" && feedback?.downloadUrl && (
              <Button
                onClick={() => {
                  if (feedback.downloadUrl) {
                    const a = document.createElement("a");
                    a.href = feedback.downloadUrl;
                    a.download = feedback.filename || "video.mp4";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Volver a Descargar MP4
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
