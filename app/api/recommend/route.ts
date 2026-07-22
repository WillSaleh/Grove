// Tier C: serves the faked tag → plan recommendation from lib/recommend.ts. Only build if the rec becomes a live demo beat.
// Stub for now — not wired into the My Journey experience.
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
