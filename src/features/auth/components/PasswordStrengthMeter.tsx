import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getPasswordStrength, type PasswordChecks } from "../schemas";

const REQUIREMENTS: { key: keyof PasswordChecks; label: string }[] = [
  { key: "length", label: "8+ characters" },
  { key: "upper", label: "Uppercase letter" },
  { key: "lower", label: "Lowercase letter" },
  { key: "number", label: "Number" },
  { key: "symbol", label: "Symbol" },
];

const BAR_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-signal",
  "bg-success",
] as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, checks } = getPasswordStrength(password);
  const active = password.length > 0;

  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-4 gap-2" aria-hidden="true">
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={cn(
                "h-1 rounded-full transition-colors",
                active && score >= segment ? BAR_COLORS[score] : "bg-elevated",
              )}
            />
          ))}
        </div>
        <span className="w-24 text-right font-mono text-[10px] uppercase text-faint">
          {active ? label : ""}
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {REQUIREMENTS.map(({ key, label: requirement }) => {
          const passed = checks[key];
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-2 text-[11px]",
                passed ? "text-success" : "text-faint",
              )}
            >
              {passed ? (
                <Check className="h-3 w-3 shrink-0" />
              ) : (
                <X className="h-3 w-3 shrink-0 text-faint" />
              )}
              {requirement}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
