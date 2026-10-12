import { useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { CircleCheck, LogOut, MailCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AuthLayout } from "../components/AuthLayout";
import { getAuthErrorMessage } from "../authErrors";
import { reloadCurrentUser, sendVerificationEmail, signOutUser } from "../authService";
import { useAuth } from "../useAuth";
import { useCooldown } from "../useCooldown";
import { VERIFICATION_RESEND_COOLDOWN_SECONDS } from "../constants";

const STEPS = [
  "Open the verification email we sent to your inbox.",
  "Click the secure verification link inside.",
  "Return here and press “I've verified my email”.",
];

export function VerifyEmailPage() {
  const { user, emailVerified } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const cooldown = useCooldown(VERIFICATION_RESEND_COOLDOWN_SECONDS);
  const navigate = useNavigate();

  const resend = async () => {
    setResending(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification email sent");
      cooldown.start();
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const checkVerified = async () => {
    setChecking(true);
    try {
      const fresh = await reloadCurrentUser();
      if (fresh?.emailVerified) {
        toast.success("Email verified. You're all set.");
        await navigate({ to: "/", replace: true });
      } else {
        toast.info("Not verified yet. Please check your inbox.");
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setChecking(false);
    }
  };

  const signOutNow = async () => {
    try {
      await signOutUser();
    } finally {
      await navigate({ to: "/login", replace: true });
    }
  };

  if (!user) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle="Sign in to manage your email verification."
        footer={
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/login" className="font-semibold text-signal hover:underline">
              Back to sign in
            </Link>
          </p>
        }
      >
        <p className="text-sm text-muted-foreground">
          You need to be signed in to verify your email address.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={emailVerified ? "Email verified" : "Verify your email"}
      subtitle={
        emailVerified ? "Your account is fully activated." : `We sent a link to ${user.email}.`
      }
      footer={
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="font-semibold text-signal hover:underline">
            Skip for now
          </Link>
        </p>
      }
    >
      {emailVerified ? (
        <div className="flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-success/30 bg-success/10 text-success">
            <CircleCheck className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm text-muted-foreground">
            Thanks for confirming your email. You have full access to your workspace.
          </p>
          <Button
            type="button"
            className="mt-6 h-11 w-full text-xs font-semibold"
            onClick={() => void navigate({ to: "/" })}
          >
            Go to dashboard
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-elevated text-signal">
              <MailCheck className="h-4 w-4" />
            </span>
            <span className="min-w-0 break-all text-xs text-muted-foreground">{user.email}</span>
          </div>
          <ol className="mt-5 space-y-3">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 text-xs leading-6 text-muted-foreground"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border bg-elevated font-mono text-[10px] text-signal">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-6 space-y-3">
            <Button
              type="button"
              className="h-11 w-full text-xs font-semibold"
              disabled={checking}
              onClick={() => void checkVerified()}
            >
              {checking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CircleCheck className="h-4 w-4" />
              )}
              I've verified my email
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 w-full text-xs font-semibold"
              disabled={resending || cooldown.active}
              onClick={() => void resend()}
            >
              {cooldown.active ? `Resend in ${cooldown.remaining}s` : "Resend verification email"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full text-xs text-muted-foreground"
              onClick={() => void signOutNow()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
