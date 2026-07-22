// GET /api/tree → the current TestimonyTree. Thin handler: call treeRepository.getTree() and return JSON.
// Stub for now — the UI reads the journey from the client store until the backend is wired in.
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
