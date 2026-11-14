import { NextResponse } from "next/server";
import { generateElevenLabsSfx } from "@/lib/studio-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      text?: unknown;
      durationSeconds?: unknown;
      promptInfluence?: unknown;
    } | null;

    const result = await generateElevenLabsSfx({
      text: typeof body?.text === "string" ? body.text : "",
      durationSeconds:
        body?.durationSeconds !== undefined ? Number(body.durationSeconds) : undefined,
      promptInfluence:
        body?.promptInfluence !== undefined ? Number(body.promptInfluence) : undefined,
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
        error: "Error inesperado generando SFX con ElevenLabs.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
