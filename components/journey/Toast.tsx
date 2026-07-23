import { Icon } from "@/components/Icon";

export type ToastState = {
  icon: string;
  message: string;
};

interface Props {
  toast: ToastState | null;
}

export function Toast({ toast }: Props) {
  if (!toast) {
    return null;
  }

  return (
    <div
      className="fixed bottom-[30px] left-1/2 z-[95] inline-flex -translate-x-1/2 items-center gap-[9px] rounded-full bg-content px-5 py-[13px] text-sm font-semibold text-white"
      style={{ animation: "gr-toast .3s cubic-bezier(.22,.61,.36,1) both" }}
    >
      <Icon className="text-accent" name={toast.icon} weight="fill" /> {toast.message}
    </div>
  );
}
