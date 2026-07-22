import type { CSSProperties } from "react";

// The gold/green "answered prayer" flourish — a ring burst, a soft glow, and ten petals opening outward.
// The caller positions this inside a `position: relative` (or absolutely-placed) parent.
const COLORS = ["#4a5759", "#4a5759", "#2997ff", "#2997ff", "#4a5759"];

const GLOW_STYLE: CSSProperties = {
  animation: "gr-glow .95s ease-out both",
  background: "rgba(74,87,89,.28)",
  borderRadius: 999,
  height: 96,
  left: 0,
  pointerEvents: "none",
  position: "absolute",
  top: 0,
  transform: "translate(-50%,-50%)",
  width: 96,
};

const BURST_STYLE: CSSProperties = {
  animation: "gr-burst .85s ease-out both",
  border: "2.5px solid rgba(74,87,89,.85)",
  borderRadius: 999,
  height: 18,
  left: 0,
  pointerEvents: "none",
  position: "absolute",
  top: 0,
  transform: "translate(-50%,-50%)",
  width: 18,
};

export function Bloom() {
  return (
    <>
      <div style={GLOW_STYLE} />
      <div style={BURST_STYLE} />
      {Array.from({ length: 10 }, (_, k) => (
        <div key={k} style={{ left: 0, position: "absolute", top: 0, transform: `rotate(${k * 36}deg)` }}>
          <div
            style={{
              animation: "gr-petal .9s cubic-bezier(.2,.7,.3,1) both",
              animationDelay: `${k * 0.015}s`,
              background: COLORS[k % COLORS.length],
              borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
              height: 16,
              left: -4.5,
              position: "absolute",
              top: 0,
              transformOrigin: "50% 100%",
              width: 9,
            }}
          />
        </div>
      ))}
    </>
  );
}
