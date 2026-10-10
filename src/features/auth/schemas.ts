import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordChecks {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= PASSWORD_MIN_LENGTH,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  checks: PasswordChecks;
}

const STRENGTH_LABELS = ["Enter a password", "Weak", "Fair", "Good", "Strong"] as const;

/** Maps requirement checks to a 0–4 strength score used by the meter. */
export function getPasswordStrength(password: string): PasswordStrength {
  const checks = getPasswordChecks(password);
  const passed = Object.values(checks).filter(Boolean).length;
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (password.length === 0) score = 0;
  else if (passed <= 1) score = 1;
  else if (passed === 2) score = 2;
  else if (passed === 3) score = 3;
  else score = 4;
  return { score, label: STRENGTH_LABELS[score], checks };
}

const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a symbol");

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80, "That name is too long"),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "Please accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Choose a password different from your current one",
    path: ["newPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
