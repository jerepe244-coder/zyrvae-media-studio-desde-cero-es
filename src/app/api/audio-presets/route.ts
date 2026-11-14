import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { MUSIC_PRESETS, SFX_PRESETS } from "@/lib/audio-presets";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicDir = path.join(process.cwd(), "public");

  const musicAvailability: Record<string, boolean> = {};
  for (const preset of MUSIC_PRESETS) {
    const relativePath = preset.previewPath.replace(/^\//, "");
    musicAvailability[preset.id] = fs.existsSync(path.join(publicDir, relativePath));
  }

  const sfxAvailability: Record<string, boolean> = {};
  for (const preset of SFX_PRESETS) {
    const relativePath = preset.previewPath.replace(/^\//, "");
    sfxAvailability[preset.id] = fs.existsSync(path.join(publicDir, relativePath));
  }

  return NextResponse.json({
    musicAvailability,
    sfxAvailability,
  });
}
