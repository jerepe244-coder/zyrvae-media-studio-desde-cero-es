import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_MUSIC_DIR = path.join(__dirname, "assets", "audio", "music");
const ASSETS_SFX_DIR = path.join(__dirname, "assets", "audio", "sfx");

export const MUSIC_PRESETS = [
  { id: "dark-tech", fileName: "dark-tech.mp3" },
  { id: "minimal-editorial", fileName: "minimal-editorial.mp3" },
  { id: "saas-energy", fileName: "saas-energy.mp3" },
  { id: "ambient-luxury", fileName: "ambient-luxury.mp3" },
];

export const SFX_PRESETS = [
  { id: "impact", fileName: "impact.mp3", defaultVolume: 0.95 },
  { id: "whoosh", fileName: "whoosh.mp3", defaultVolume: 0.85 },
  { id: "ui-click", fileName: "ui-click.mp3", defaultVolume: 0.8 },
  { id: "notification", fileName: "notification.mp3", defaultVolume: 0.85 },
  { id: "riser", fileName: "riser.mp3", defaultVolume: 0.75 },
  { id: "error-beep", fileName: "error-beep.mp3", defaultVolume: 0.9 },
];

export function resolveMusicPresetPath(presetId) {
  if (!presetId || typeof presetId !== "string") return null;
  const cleanId = presetId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const preset = MUSIC_PRESETS.find((m) => m.id === cleanId);
  const candidate = path.join(ASSETS_MUSIC_DIR, preset ? preset.fileName : `${cleanId}.mp3`);
  return fs.existsSync(candidate) ? candidate : null;
}

export function resolveSfxPresetPath(sfxId) {
  if (!sfxId || typeof sfxId !== "string") return null;
  const cleanId = sfxId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const preset = SFX_PRESETS.find((s) => s.id === cleanId);
  const candidate = path.join(ASSETS_SFX_DIR, preset ? preset.fileName : `${cleanId}.mp3`);
  return fs.existsSync(candidate) ? candidate : null;
}
