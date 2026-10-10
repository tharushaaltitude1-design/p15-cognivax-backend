import { CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function FormAlert({
  message,
  tone = "error",
  className,
}: {
  message?: string | null;
  tone?: "error" | "success";
  className?: string;
}) {
  if (!message) return null;
  const isError = tone === "error";
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-5",
        isError
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-success/40 bg-success/10 text-success",
        className,
      )}
    >
      {isError ? (
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span className="min-w-0">{message}</span>
    </div>
  );
}
