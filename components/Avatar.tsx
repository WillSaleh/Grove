interface Props {
  background?: string;
  border?: string;
  fontSize?: number;
  initials: string;
  size?: number;
}

// A person's avatar: a solid disc with initials. Defaults to the theme accent + ring so avatars follow
// the active accent color and adapt to dark mode (matching the design's avStyle); callers may override.
export function Avatar({ background = "var(--accent)", border = "3px solid var(--ring)", fontSize = 15, initials, size = 40 }: Props) {
  return (
    <div
      style={{
        alignItems: "center",
        background,
        border,
        borderRadius: 999,
        color: "#fff",
        display: "flex",
        flex: "0 0 auto",
        fontSize,
        fontWeight: 600,
        height: size,
        justifyContent: "center",
        textShadow: "0 2px 6px rgba(0,0,0,.2)",
        width: size,
      }}
    >
      {initials}
    </div>
  );
}
