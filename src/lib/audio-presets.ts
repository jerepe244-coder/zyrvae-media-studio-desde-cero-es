export interface MusicPreset {
  id: string;
  title: string;
  bpm: number;
  mood: string;
  fileName: string;
  previewPath: string;
}

export interface SfxPreset {
  id: string;
  label: string;
  durationSec: number;
  defaultVolume: number;
  fileName: string;
  previewPath: string;
  sfxPrompt: string;
}

export interface SfxEvent {
  id: string;
  timeSec: number;
  volume: number;
  label?: string;
  customBase64?: string;
}

export const MUSIC_PRESETS: MusicPreset[] = [
  {
    id: "dark-tech",
    title: "Dark Tech Pulse",
    bpm: 124,
    mood: "Oscuro · Ingeniería & SaaS",
    fileName: "dark-tech.mp3",
    previewPath: "/audio/music/dark-tech.mp3",
  },
  {
    id: "minimal-editorial",
    title: "Minimal Editorial",
    bpm: 98,
    mood: "Limpio · Diseño & Autoridad",
    fileName: "minimal-editorial.mp3",
    previewPath: "/audio/music/minimal-editorial.mp3",
  },
  {
    id: "saas-energy",
    title: "SaaS Energy",
    bpm: 128,
    mood: "Dinámico · Conversión Rápida",
    fileName: "saas-energy.mp3",
    previewPath: "/audio/music/saas-energy.mp3",
  },
  {
    id: "ambient-luxury",
    title: "Ambient Luxury",
    bpm: 82,
    mood: "Cinemático · Marca Premium",
    fileName: "ambient-luxury.mp3",
    previewPath: "/audio/music/ambient-luxury.mp3",
  },
];

export const SFX_PRESETS: SfxPreset[] = [
  {
    id: "impact",
    label: "Impacto Seco",
    durationSec: 0.7,
    defaultVolume: 0.95,
    fileName: "impact.mp3",
    previewPath: "/audio/sfx/impact.mp3",
    sfxPrompt:
      "Deep cinematic sub bass impact hit, clean modern architectural slam, tight low end, dry studio quality, no reverb tail",
  },
  {
    id: "whoosh",
    label: "Whoosh Transición",
    durationSec: 0.6,
    defaultVolume: 0.85,
    fileName: "whoosh.mp3",
    previewPath: "/audio/sfx/whoosh.mp3",
    sfxPrompt:
      "Fast sleek modern UI transition whoosh, crisp filtered air sweep, minimal tech motion design, clean studio",
  },
  {
    id: "ui-click",
    label: "Click UI",
    durationSec: 0.5,
    defaultVolume: 0.8,
    fileName: "ui-click.mp3",
    previewPath: "/audio/sfx/ui-click.mp3",
    sfxPrompt:
      "Crisp tactile minimal mouse click and subtle glass UI tap, modern Apple style interface sound, clean dry",
  },
  {
    id: "notification",
    label: "Notificación / Ping",
    durationSec: 1.0,
    defaultVolume: 0.85,
    fileName: "notification.mp3",
    previewPath: "/audio/sfx/notification.mp3",
    sfxPrompt:
      "Modern minimalist digital lead notification chime, two soft warm synth tones, clean luxury tech UI alert",
  },
  {
    id: "riser",
    label: "Riser Ascendente",
    durationSec: 2.5,
    defaultVolume: 0.75,
    fileName: "riser.mp3",
    previewPath: "/audio/sfx/riser.mp3",
    sfxPrompt:
      "Smooth cinematic tension riser, rising clean analog synth sweep building up to a cut, modern tech commercial",
  },
  {
    id: "error-beep",
    label: "Alerta / Error",
    durationSec: 0.8,
    defaultVolume: 0.9,
    fileName: "error-beep.mp3",
    previewPath: "/audio/sfx/error-beep.mp3",
    sfxPrompt:
      "Short subtle low digital error buzz, muted modern UI warning tone, clean non-harsh tech alert",
  },
];

export function getMusicPresetById(id: string): MusicPreset | undefined {
  return MUSIC_PRESETS.find((m) => m.id === id);
}

export function getSfxPresetById(id: string): SfxPreset | undefined {
  return SFX_PRESETS.find((s) => s.id === id);
}

/**
 * Parsea eventos SFX declarados en el HTML mediante:
 * - <meta name="zyrvae-sfx" content="impact@2.0, ui-click@11.5, whoosh@15.0@0.8">
 * - data-sfx="impact@2.0,whoosh@15.0" en cualquier etiqueta (ej. <body>)
 * - Comentario <!-- zyrvae-sfx: impact@2.0, whoosh@15.0 -->
 */
export function parseSfxFromHtml(html: string): SfxEvent[] {
  if (!html || typeof html !== "string") return [];

  const rawSegments: string[] = [];

  const metaRegexA =
    /<meta\b[^>]*\bname\s*=\s*["']zyrvae-sfx["'][^>]*\bcontent\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const metaRegexB =
    /<meta\b[^>]*\bcontent\s*=\s*["']([^"']+)["'][^>]*\bname\s*=\s*["']zyrvae-sfx["'][^>]*>/gi;
  const dataAttrRegex = /\bdata-sfx\s*=\s*["']([^"']+)["']/gi;
  const commentRegex = /<!--\s*zyrvae-sfx\s*:\s*([\s\S]*?)-->/gi;

  for (const regex of [metaRegexA, metaRegexB, dataAttrRegex, commentRegex]) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      if (match[1]) rawSegments.push(match[1]);
    }
  }

  const parsed: SfxEvent[] = [];
  const seen = new Set<string>();

  for (const segment of rawSegments) {
    const tokens = segment.split(/[,\n;]+/);
    for (const rawToken of tokens) {
      const token = rawToken.trim();
      if (!token) continue;

      const parts = token.split("@").map((p) => p.trim());
      if (parts.length < 2) continue;

      const id = parts[0].toLowerCase().replace(/[^a-z0-9_-]/g, "");
      const timeSec = Number(parts[1]);
      if (!id || !Number.isFinite(timeSec) || timeSec < 0) continue;

      const preset = getSfxPresetById(id);
      const rawVol = parts[2] !== undefined ? Number(parts[2]) : preset?.defaultVolume ?? 0.85;
      const volume = Number.isFinite(rawVol)
        ? Math.min(1, Math.max(0.1, Number(rawVol.toFixed(2))))
        : 0.85;

      const normalizedTime = Number(timeSec.toFixed(2));
      const dedupeKey = `${id}@${normalizedTime}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      parsed.push({
        id,
        timeSec: normalizedTime,
        volume,
        label: preset?.label || id,
      });
    }
  }

  return parsed.sort((a, b) => a.timeSec - b.timeSec);
}
