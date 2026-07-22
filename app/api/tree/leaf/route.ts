// POST /api/tree/leaf → add a leaf. Thin handler: validate the body, call treeRepository.addLeaf(), return the saved entry.
// Stub for now — entry creation happens client-side against the store until the backend is wired in.
import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
