interface Props {
  border?: string;
  fontSize?: number;
  initials: string;
  size?: number;
}

// The signed-in person / friend avatar: a soft green disc with initials. Colors are fixed brand green
// (the design's `av` gradient stops are decorative and collapse to a single green in practice).
export function Avatar({ border = "3px solid #fff", fontSize = 15, initials, size = 40 }: Props) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#4a5759",
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
