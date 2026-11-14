import { NextResponse } from "next/server";
import { getAudioPresetAvailability } from "@/lib/studio-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { musicAvailability, sfxAvailability } = getAudioPresetAvailability();
  return NextResponse.json({
    musicAvailability,
    sfxAvailability,
  });
}
