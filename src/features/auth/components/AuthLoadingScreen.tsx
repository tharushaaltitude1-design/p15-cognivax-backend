import { Logo } from "@/components/common/Logo";

export function AuthLoadingScreen({ message = "Securing your workspace" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="flex flex-col items-center gap-6 text-center">
        <Logo />
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-signal"
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
