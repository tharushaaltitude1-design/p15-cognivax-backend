import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "../authErrors";
import { sendVerificationEmail } from "../authService";
import { useAuth } from "../useAuth";
import { useCooldown } from "../useCooldown";
import { VERIFICATION_RESEND_COOLDOWN_SECONDS } from "../constants";

/** Non-blocking reminder shown in the dashboard until the email is verified. */
export function VerificationBanner() {
  const { isAuthenticated, emailVerified } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const cooldown = useCooldown(VERIFICATION_RESEND_COOLDOWN_SECONDS);

  if (!isAuthenticated || emailVerified || dismissed) return null;

  const resend = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification email sent");
      cooldown.start();
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3"
      role="status"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-warning/30 bg-warning/10 text-warning">
        <Mail className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">Verify your email</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Confirm your address to secure your account and unlock email delivery.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="text-[11px]"
          disabled={sending || cooldown.active}
          onClick={() => void resend()}
        >
          {cooldown.active ? `Resend in ${cooldown.remaining}s` : "Resend"}
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-[11px] text-signal">
          <Link to="/verify-email">Details</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Dismiss verification reminder"
          className="h-8 w-8 text-faint"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
