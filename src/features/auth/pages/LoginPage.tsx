import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "../components/AuthLayout";
import { FormAlert } from "../components/FormAlert";
import { GoogleButton } from "../components/GoogleButton";
import { PasswordField } from "../components/PasswordField";
import { getAuthErrorMessage } from "../authErrors";
import { signInWithEmail, signInWithGoogle } from "../authService";
import { loginSchema, type LoginValues } from "../schemas";
import { useFailedAttempts } from "../useFailedAttempts";

export function LoginPage({ redirect }: { redirect: string | undefined }) {
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { locked, secondsLeft, registerFailure, reset } = useFailedAttempts();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async (values) => {
    if (locked) {
      setFormError(`Too many attempts. Please try again in ${secondsLeft}s.`);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(values.email, values.password, values.remember);
      reset();
      toast.success("Welcome back");
    } catch (error) {
      registerFailure();
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  const onGoogle = async () => {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your intelligence workspace."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          New to Cognivax?{" "}
          <Link to="/signup" className="font-semibold text-signal hover:underline">
            Create an account
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

        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Controller
            control={control}
            name="remember"
            render={({ field }) => (
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-xs text-muted-foreground">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                Remember me for 30 days
              </label>
            )}
          />
          <Link to="/forgot-password" className="text-xs font-medium text-signal hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="h-11 w-full text-xs font-semibold"
          disabled={submitting || locked}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {locked ? `Try again in ${secondsLeft}s` : "Sign in"}
        </Button>
      </form>

      <div className="auth-divider my-6">or continue with</div>
      <GoogleButton onClick={onGoogle} loading={googleLoading} disabled={submitting} />

      {redirect && (
        <p className="mt-5 text-center text-[10px] text-faint">
          You'll return to your last page after signing in.
        </p>
      )}
    </AuthLayout>
  );
}
