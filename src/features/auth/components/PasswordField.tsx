import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    { label, error, hint, className, id, name, onKeyUp, onKeyDown, ...props },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const fieldId = id ?? (name ? `field-${name}` : undefined);
    const errorId = fieldId ? `${fieldId}-error` : undefined;

    const detectCaps = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (typeof event.getModifierState === "function") {
        setCapsLock(event.getModifierState("CapsLock"));
      }
    };

    return (
      <label className="block min-w-0" htmlFor={fieldId}>
        <span className="field-label">{label}</span>
        <span className="relative block">
          <input
            {...props}
            ref={ref}
            id={fieldId}
            name={name}
            type={visible ? "text" : "password"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error && errorId ? errorId : undefined}
            className={cn(
              "field pr-12",
              error && "border-destructive/70 focus-visible:ring-destructive",
              className,
            )}
            onKeyUp={(event) => {
              detectCaps(event);
              onKeyUp?.(event);
            }}
            onKeyDown={(event) => {
              detectCaps(event);
              onKeyDown?.(event);
            }}
          />
          <button
            type="button"
            className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-lg text-faint transition-colors hover:text-foreground"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
        {capsLock && (
          <span className="auth-caps mt-2" role="status">
            <Lock className="h-3 w-3" />
            Caps Lock is on
          </span>
        )}
        {hint && !error && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
        {error && (
          <span id={errorId} className="mt-1 block text-xs text-destructive" role="alert">
            {error}
          </span>
        )}
      </label>
    );
  },
);
