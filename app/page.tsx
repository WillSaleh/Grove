// Grove — the living timeline of a walk with God. Auth happens first; once signed in, GroveApp
// loads the user's journey from the backend and renders TimelineApp.
import { GroveApp } from "@/components/GroveApp";

export default function Home() {
  return <GroveApp />;
}
