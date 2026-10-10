import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Search,
  Inbox,
  MoreHorizontal,
  Copy,
  Pencil,
  Archive,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { statusClass } from "@/config/modules";
import { cn } from "@/lib/utils";
export function IconButton({
  label,
  children,
  onClick,
  className,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      title={label}
      aria-label={label}
      size="icon"
      variant="ghost"
      className={cn("text-muted-foreground", className)}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
export function Avatar({
  name,
  large = false,
  src,
  signal = false,
}: {
  name: string;
  large?: boolean;
  src?: string | undefined;
  signal?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return src ? (
    <img src={src} alt={name} className={cn("avatar object-cover", large && "h-20 w-20")} />
  ) : (
    <span
      title={name}
      className={cn("avatar", signal && "avatar-signal", large && "h-20 w-20 text-2xl")}
    >
      {initials}
    </span>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("status", statusClass(status))}>{status}</span>;
}
export function TagChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-elevated px-2 py-1 text-[10px] text-muted-foreground">
      {children}
    </span>
  );
}
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7 grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        {eyebrow && <p className="micro mb-2">{eyebrow}</p>}
        <h1 className="break-words text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 text-xs leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    </header>
  );
}
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {description && <p className="mt-1 text-[11px] text-faint">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function LoadingSkeletons() {
  return (
    <div className="grid gap-4">
      <div className="h-16 w-2/3 animate-pulse rounded-lg bg-card" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-card" />
    </div>
  );
}
export function EmptyState({
  title = "No records found",
  description = "Try adjusting your search or filters.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Inbox className="h-9 w-9 text-faint" />
      <h3 className="font-semibold">{title}</h3>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Search records…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-0">
      <Search className="absolute left-3 top-3.5 h-4 w-4 text-faint" />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field pl-10"
      />
    </div>
  );
}
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete record?",
  description = "This action cannot be undone.",
  label = "Delete",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  label?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="responsive-dialog rounded-xl bg-card">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export function RowActions({ onAction }: { onAction: (action: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Record actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {[
          { label: "View", icon: Eye },
          { label: "Edit", icon: Pencil },
          { label: "Duplicate", icon: Copy },
          { label: "Archive", icon: Archive },
          { label: "Delete", icon: Trash2 },
        ].map(({ label, icon: Icon }) => (
          <DropdownMenuItem
            key={label}
            className={label === "Delete" ? "text-destructive" : ""}
            onClick={() => onAction(label)}
          >
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1 px-0 text-[11px] text-muted-foreground hover:text-signal"
      onClick={onClick}
    >
      {children}
      <ArrowUpRight className="h-3 w-3" />
    </Button>
  );
}
export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string | undefined;
}) {
  return (
    <label className="block min-w-0">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
