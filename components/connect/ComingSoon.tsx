import { Icon } from "@/components/Icon";

interface Props {
  icon: string;
  note: string;
  title: string;
}

// Temporary themed placeholder for Connect views that are still being built out.
export function ComingSoon({ icon, note, title }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-canvas px-6 text-center">
      <Icon className="text-[44px] text-accent" name={icon} weight="duotone" />
      <h1 className="mt-4 font-display text-[clamp(22px,3vw,30px)] font-semibold tracking-[-.02em] text-content">{title}</h1>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-subtle">{note}</p>
    </div>
  );
}
