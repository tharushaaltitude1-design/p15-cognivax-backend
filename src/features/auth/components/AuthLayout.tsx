import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Fingerprint, GitBranch, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: BookOpen, title: "Knowledge", text: "A single, governed source of truth." },
  {
    icon: Fingerprint,
    title: "Evidence-backed reasoning",
    text: "Every claim traced back to its source.",
  },
  {
    icon: GitBranch,
    title: "Decision traceability",
    text: "Understand how and why choices were made.",
  },
] as const;

function BrandPanel() {
  return (
    <aside className="auth-brand" aria-hidden="true">
      <div className="auth-grid" />
      <div className="auth-orb auth-orb-a" />
      <div className="auth-orb auth-orb-b" />
      <div className="relative z-10 flex h-full flex-col">
        <Logo />
        <div className="mt-14 max-w-md">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.15]">
            Reason with evidence. Decide with confidence.
          </h1>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Cognivax connects your knowledge, reasoning and evidence into decisions you can defend.
          </p>
        </div>
        <ul className="mt-12 space-y-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-elevated text-signal">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{title}</span>
                <span className="mt-1 block text-xs leading-6 text-faint">{text}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="relative mt-auto hidden h-44 xl:block">
          <div className="auth-float left-0 top-4 w-52">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span className="micro">Evidence verified</span>
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold">92%</p>
            <div className="mt-3 h-1.5 rounded-full bg-elevated">
              <div className="h-full w-[92%] rounded-full bg-[image:var(--gradient-signal)]" />
            </div>
          </div>
          <div className="auth-float auth-float-delay right-0 top-24 w-48">
            <span className="micro">Decision traceability</span>
            <div className="mt-3 space-y-2">
              {[100, 72, 48].map((width) => (
                <div key={width} className="h-1.5 rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-signal/70"
                    style={{ width: `${String(width)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AuthFooter() {
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);
  return (
    <footer className="mt-8 flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-faint">
        <button
          type="button"
          className="transition-colors hover:text-signal"
          onClick={() => setLegal("terms")}
        >
          Terms
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          className="transition-colors hover:text-signal"
          onClick={() => setLegal("privacy")}
        >
          Privacy
        </button>
      </div>
      <p className="text-[10px] text-faint">
        © {new Date().getFullYear()} Cognivax Innovations. All rights reserved.
      </p>
      <Dialog open={legal !== null} onOpenChange={(open) => !open && setLegal(null)}>
        <DialogContent className="responsive-dialog bg-card">
          <DialogTitle>{legal === "terms" ? "Terms of service" : "Privacy policy"}</DialogTitle>
          <DialogDescription>
            This is placeholder legal copy. The full{" "}
            {legal === "terms" ? "terms" : "privacy policy"} is published before general
            availability.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </footer>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="auth-shell">
      <BrandPanel />
      <main className="auth-main">
        <div className="mb-6 flex items-center justify-center lg:hidden">
          <Link to="/" aria-label="Cognivax">
            <Logo />
          </Link>
        </div>
        <motion.section
          className={cn("auth-card", className)}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <header>
            <h1 className="font-display text-2xl font-extrabold">{title}</h1>
            {subtitle && <p className="mt-2 text-xs leading-6 text-muted-foreground">{subtitle}</p>}
          </header>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-border pt-5">{footer}</div>}
        </motion.section>
        <AuthFooter />
      </main>
    </div>
  );
}
