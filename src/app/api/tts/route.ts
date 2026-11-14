import { NextResponse } from "next/server";
import {
  fetchElevenLabsVoices,
  synthesizeElevenLabsVoice,
} from "@/lib/studio-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchElevenLabsVoices();

  if (!result.ok) {
    return NextResponse.json(
      {
        configured: result.configured,
        voices: [],
        ...(result.upstreamStatus !== undefined
          ? { upstreamStatus: result.upstreamStatus }
          : {}),
        error: result.error,
        ...(result.details ? { details: result.details } : {}),
      },
      { status: result.status }
    );
  }

  return NextResponse.json({
    configured: true,
    voices: result.voices,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      text?: unknown;
      voiceId?: unknown;
      stability?: unknown;
      similarityBoost?: unknown;
    } | null;

    const result = await synthesizeElevenLabsVoice({
      text: typeof body?.text === "string" ? body.text : "",
      voiceId: typeof body?.voiceId === "string" ? body.voiceId : "",
      stability: body?.stability !== undefined ? Number(body.stability) : undefined,
      similarityBoost:
        body?.similarityBoost !== undefined ? Number(body.similarityBoost) : undefined,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          ...(result.details ? { details: result.details } : {}),
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      mimeType: result.mimeType,
      ext: result.ext,
      sizeBytes: result.sizeBytes,
      base64: result.base64,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Error inesperado generando la locución con ElevenLabs.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
