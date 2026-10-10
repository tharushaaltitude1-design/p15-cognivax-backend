import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { KeyRound, Loader2, LogOut, MailCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAuthErrorMessage, isAuthErrorCode } from "../authErrors";
import { changePassword, deleteAccount, sendVerificationEmail, signOutUser } from "../authService";
import { changePasswordSchema, type ChangePasswordValues } from "../schemas";
import { useAuth } from "../useAuth";
import { useCooldown } from "../useCooldown";
import { VERIFICATION_RESEND_COOLDOWN_SECONDS } from "../constants";
import { FormAlert } from "./FormAlert";
import { PasswordField } from "./PasswordField";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

const PROVIDER_LABELS: Record<string, string> = {
  password: "Email & password",
  "google.com": "Google",
};

export function SecurityPanel() {
  const { user, providerIds, emailVerified } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasPassword = providerIds.includes("password");
  const hasGoogle = providerIds.includes("google.com");

  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const verifyCooldown = useCooldown(VERIFICATION_RESEND_COOLDOWN_SECONDS);

  const resendVerification = async () => {
    setVerifying(true);
    try {
      await sendVerificationEmail();
      toast.success("Verification email sent");
      verifyCooldown.start();
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      queryClient.clear();
    } finally {
      void navigate({ to: "/login", replace: true });
    }
  };

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm.');
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteAccount(hasPassword ? deletePassword : undefined);
      queryClient.clear();
      toast.success("Your account has been deleted");
      void navigate({ to: "/login", replace: true });
    } catch (error) {
      if (isAuthErrorCode(error, "auth/popup-closed-by-user")) return;
      setDeleteError(getAuthErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        {hasPassword ? (
          <ChangePasswordForm />
        ) : hasGoogle ? (
          <section className="panel p-6">
            <h2 className="section-title">Password</h2>
            <p className="mt-3 flex items-start gap-2 text-xs leading-6 text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              You signed in with Google, so there's no password to manage here. Your sign-in and
              account password are handled by your Google account.
            </p>
          </section>
        ) : null}

        <section className="panel p-6">
          <h2 className="section-title">Email verification</h2>
          <div className="mt-4 flex items-center gap-3">
            <span
              className={
                emailVerified
                  ? "grid h-10 w-10 place-items-center rounded-xl border border-success/30 bg-success/10 text-success"
                  : "grid h-10 w-10 place-items-center rounded-xl border border-warning/30 bg-warning/10 text-warning"
              }
            >
              <MailCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">{emailVerified ? "Verified" : "Not verified"}</p>
              <p className="mt-1 break-all text-[11px] text-faint">{user?.email}</p>
            </div>
          </div>
          {!emailVerified && (
            <Button
              variant="secondary"
              className="mt-4"
              disabled={verifying || verifyCooldown.active}
              onClick={() => void resendVerification()}
            >
              {verifyCooldown.active
                ? `Resend in ${verifyCooldown.remaining}s`
                : "Send verification email"}
            </Button>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <section className="panel p-6">
          <h2 className="section-title mb-5">Sign-in &amp; security</h2>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <div className="min-w-0">
                <dt className="micro">Linked providers</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {providerIds.length === 0 && <span className="text-xs text-faint">Unknown</span>}
                  {providerIds.map((id) => (
                    <span
                      key={id}
                      className="rounded-md border border-border bg-elevated px-2 py-1 text-[10px] text-muted-foreground"
                    >
                      {PROVIDER_LABELS[id] ?? id}
                    </span>
                  ))}
                </dd>
              </div>
            </div>
            {user?.metadata.lastSignInTime && (
              <div className="flex items-start gap-3">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                <div>
                  <dt className="micro">Last sign-in</dt>
                  <dd className="mt-1 text-xs">
                    {format(new Date(user.metadata.lastSignInTime), "MMM d, yyyy · HH:mm")}
                  </dd>
                </div>
              </div>
            )}
          </dl>
          <Button variant="secondary" className="mt-5" onClick={() => setSignOutOpen(true)}>
            <LogOut />
            Sign out
          </Button>
        </section>

        <section className="panel border-destructive/40 p-6">
          <h2 className="section-title flex items-center gap-2 text-destructive">
            <TriangleAlert className="h-4 w-4" />
            Danger zone
          </h2>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            Deleting your account removes your access permanently. This cannot be undone.
          </p>
          <Button variant="destructive" className="mt-4" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </section>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        onConfirm={() => void handleSignOut()}
        title="Sign out?"
        description="You'll need to sign in again to access your workspace."
        label="Sign out"
      />

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeletePassword("");
            setConfirmText("");
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="responsive-dialog bg-card">
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and signs you out. Type{" "}
            <span className="font-mono text-foreground">DELETE</span> to confirm.
          </DialogDescription>
          <div className="space-y-4 pt-2">
            {hasPassword && (
              <PasswordField
                label="Confirm your password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
              />
            )}
            {!hasPassword && hasGoogle && (
              <p className="text-xs text-faint">
                You'll be asked to confirm with your Google account.
              </p>
            )}
            <label className="block">
              <span className="field-label">Confirmation</span>
              <input
                className="field"
                placeholder="DELETE"
                autoComplete="off"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
              />
            </label>
            <FormAlert message={deleteError} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={() => void handleDelete()}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChangePasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const newPassword = watch("newPassword");

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success("Password updated");
      reset();
    } catch (error) {
      if (isAuthErrorCode(error, "auth/requires-recent-login")) {
        setFormError("For your security, please sign in again before changing your password.");
      } else {
        setFormError(getAuthErrorMessage(error));
      }
    }
  });

  return (
    <form className="panel space-y-5 p-6" onSubmit={onSubmit} noValidate>
      <h2 className="section-title">Change password</h2>
      <p className="text-xs leading-6 text-muted-foreground">
        We'll verify your current password before applying the change.
      </p>
      <FormAlert message={formError} />
      <PasswordField
        label="Current password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <div>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <PasswordStrengthMeter password={newPassword ?? ""} />
      </div>
      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound />}
        Update password
      </Button>
    </form>
  );
}
