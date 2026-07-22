import type { CSSProperties } from "react";

// Thin wrapper over the Phosphor icon web font (loaded in the root layout). The design references
// icons as `ph-duotone ph-mountains` etc.; this keeps that in one place and marks them decorative.
type IconWeight = "bold" | "duotone" | "fill" | "regular";

const WEIGHT_CLASS: Record<IconWeight, string> = {
  bold: "ph-bold",
  duotone: "ph-duotone",
  fill: "ph-fill",
  regular: "ph",
};

interface Props {
  className?: string;
  name: string;
  style?: CSSProperties;
  weight?: IconWeight;
}

export function Icon({ className, name, style, weight = "regular" }: Props) {
  return (
    <i
      aria-hidden="true"
      className={`${WEIGHT_CLASS[weight]} ${name}${className ? ` ${className}` : ""}`}
      style={style}
    />
  );
}
