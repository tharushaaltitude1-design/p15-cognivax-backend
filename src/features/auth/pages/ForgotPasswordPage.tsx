import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthLayout } from "../components/AuthLayout";
import { FormAlert } from "../components/FormAlert";
import { getAuthErrorMessage, isAuthErrorCode } from "../authErrors";
import { sendPasswordReset } from "../authService";
import { forgotPasswordSchema, type ForgotPasswordValues } from "../schemas";
import { useCooldown } from "../useCooldown";
import { VERIFICATION_RESEND_COOLDOWN_SECONDS } from "../constants";

export function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const cooldown = useCooldown(VERIFICATION_RESEND_COOLDOWN_SECONDS);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const sendReset = async (email: string) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSubmittedEmail(email);
      cooldown.start();
    } catch (error) {
      // Never reveal whether an account exists — only surface real failures.
      if (!isAuthErrorCode(error, "auth/user-not-found")) {
        setFormError(getAuthErrorMessage(error));
      } else {
        setSubmittedEmail(email);
        cooldown.start();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = handleSubmit((values) => sendReset(values.email));

  if (submittedEmail) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="We've sent password reset instructions if an account exists for that email."
        footer={
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/login" className="font-semibold text-signal hover:underline">
              Back to sign in
            </Link>
          </p>
        }
      >
        <div className="flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-border bg-elevated text-signal">
            <MailCheck className="h-7 w-7" />
          </span>
          <p className="mt-5 break-all text-sm text-muted-foreground">
            A reset link was sent to{" "}
            <span className="font-semibold text-foreground">{submittedEmail}</span>. The link
            expires shortly, so use it soon.
          </p>
          <FormAlert message={formError} className="mt-5 w-full text-left" />
          <Button
            type="button"
            variant="secondary"
            className="mt-6 h-11 w-full text-xs font-semibold"
            disabled={submitting || cooldown.active}
            onClick={() => void sendReset(getValues("email"))}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {cooldown.active ? `Resend in ${cooldown.remaining}s` : "Resend email"}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure reset link."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-signal hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <FormAlert message={formError} className="mb-5" />
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <label className="block min-w-0">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@company.com"
            className="field"
            aria-invalid={errors.email ? true : undefined}
            {...register("email")}
          />
          {errors.email && (
            <span className="mt-1 block text-xs text-destructive" role="alert">
              {errors.email.message}
            </span>
          )}
        </label>
        <Button
          type="submit"
          className="h-11 w-full text-xs font-semibold"
          disabled={submitting || cooldown.active}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {cooldown.active ? `Try again in ${cooldown.remaining}s` : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
