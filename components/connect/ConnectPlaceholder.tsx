import { Icon } from "@/components/Icon";

// Connect (community) is still being designed. The tab is switchable, but the experience is not built yet.
export function ConnectPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-parchment px-6 text-center">
      <Icon className="text-[44px] text-brand/70" name="ph-users-three" weight="duotone" />
      <h1 className="mt-4 font-display text-[clamp(22px,3vw,30px)] font-semibold tracking-[-.02em] text-ink">
        Connect is coming soon
      </h1>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
        This is where you’ll see how God is moving in your friends’ journeys — their milestones, answered
        prayers, and the verses carrying them. We’re still designing it.
      </p>
    </div>
  );
}
