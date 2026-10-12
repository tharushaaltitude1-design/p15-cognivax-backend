import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Timer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { signOutUser } from "../authService";
import { useAuth } from "../useAuth";
import { IDLE_TIMEOUT_MS, IDLE_WARNING_MS } from "../constants";

const WARNING_SECONDS = Math.round(IDLE_WARNING_MS / 1000);

export function IdleTimeoutDialog() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);

  useEffect(() => {
    if (!isAuthenticated) {
      setWarning(false);
      return;
    }
    let idleTimer: number;
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;
    const restart = () => {
      window.clearTimeout(idleTimer);
      setWarning(false);
      idleTimer = window.setTimeout(() => setWarning(true), IDLE_TIMEOUT_MS);
    };
    events.forEach((event) => window.addEventListener(event, restart, { passive: true }));
    restart();
    return () => {
      window.clearTimeout(idleTimer);
      events.forEach((event) => window.removeEventListener(event, restart));
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!warning) {
      setSecondsLeft(WARNING_SECONDS);
      return;
    }
    if (secondsLeft <= 0) {
      void (async () => {
        try {
          await signOutUser();
          toast.info("Signed out due to inactivity");
          await navigate({ to: "/login", replace: true });
        } catch {
          setWarning(false);
        }
      })();
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [warning, secondsLeft, navigate]);

  return (
    <Dialog
      open={warning}
      onOpenChange={(open) => {
        if (!open) {
          setWarning(false);
          setSecondsLeft(WARNING_SECONDS);
        }
      }}
    >
      <DialogContent className="responsive-dialog bg-card">
        <DialogTitle className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-warning" />
          Still there?
        </DialogTitle>
        <DialogDescription>
          For your security we'll sign you out in{" "}
          <span className="font-mono text-foreground">{secondsLeft}s</span>. Any activity keeps you
          signed in.
        </DialogDescription>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setSecondsLeft(0)}>
            Sign out now
          </Button>
          <Button
            onClick={() => {
              setWarning(false);
              setSecondsLeft(WARNING_SECONDS);
            }}
          >
            Stay signed in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
