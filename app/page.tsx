// Grove — the living timeline of a walk with God. This page is intentionally thin: the interactive
// experience lives in <TimelineApp>, which reads the journey from the Zustand store.
import { TimelineApp } from "@/components/TimelineApp";

export default function Home() {
  return <TimelineApp />;
}
