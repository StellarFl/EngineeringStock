import { cn } from "@/lib/utils/cn";

/** Wordmark. `tight` is the compact form used in the sidebar. */
export function Logo({
  className,
  tight = false,
}: {
  className?: string;
  tight?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-semibold tracking-[-0.04em] text-brand-700 select-none",
        tight ? "text-xl" : "text-2xl tracking-[0.04em] uppercase",
        className,
      )}
    >
      FORGETRACK
    </span>
  );
}
