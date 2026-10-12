import { Link } from "@/lib/router-compat";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthLayout } from "../components/AuthLayout";

export function AuthActionErrorPage({ message }: { message: string | undefined }) {
  return (
    <AuthLayout
      title="This link can't be used"
      subtitle="The authentication link may be invalid, expired, or already used."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Need help? Contact your workspace administrator.
        </p>
      }
    >
      <div className="flex flex-col items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <p className="mt-5 text-sm text-muted-foreground">
          {message ?? "Please request a new link and try again."}
        </p>
        <div className="mt-6 grid w-full gap-3">
          <Button asChild className="h-11 w-full text-xs font-semibold">
            <Link to="/login">Return to sign in</Link>
          </Button>
          <Button asChild variant="secondary" className="h-11 w-full text-xs font-semibold">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
