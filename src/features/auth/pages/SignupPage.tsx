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
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter";
import { getAuthErrorMessage } from "../authErrors";
import { signInWithGoogle, signUpWithEmail } from "../authService";
import { signupSchema, type SignupValues } from "../schemas";

export function SignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const password = watch("password");

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await signUpWithEmail(values.name, values.email, values.password);
      toast.success("Account created. Check your inbox to verify your email.");
    } catch (error) {
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
      title="Create your account"
      subtitle="Start reasoning with evidence in minutes."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-signal hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <FormAlert message={formError} className="mb-5" />
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <label className="block min-w-0">
          <span className="field-label">Full name</span>
          <input
            autoComplete="name"
            autoFocus
            placeholder="Your name"
            className="field"
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
          {errors.name && (
            <span className="mt-1 block text-xs text-destructive" role="alert">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="block min-w-0">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="email"
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

        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field }) => (
            <div>
              <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-xs text-muted-foreground">
                <Checkbox
                  className="mt-0.5"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <span>
                  I agree to the Cognivax Terms of Service and acknowledge the Privacy Policy.
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="mt-1 block text-xs text-destructive" role="alert">
                  {errors.acceptTerms.message}
                </span>
              )}
            </div>
          )}
        />

        <Button
          type="submit"
          className="h-11 w-full text-xs font-semibold"
          disabled={submitting || googleLoading}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <div className="auth-divider my-6">or continue with</div>
      <GoogleButton onClick={onGoogle} loading={googleLoading} disabled={submitting} />
    </AuthLayout>
  );
}
