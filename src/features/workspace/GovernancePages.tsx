import { useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import {
  Plus,
  ShieldCheck,
  TriangleAlert,
  FileClock,
  Users,
  Download,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  PageHeader,
  Avatar,
  StatusBadge,
  SectionCard,
  TextLink,
  SearchInput,
  EmptyState,
  Field,
  LoadingSkeletons,
} from "@/components/common/primitives";
import { governanceNav } from "@/config/navigation";
import {
  useWorkspace,
  useWorkspaceMutation,
  workspaceService,
  exportCSV,
} from "@/services/repository";
import type { ActivityEntry, ExceptionRecord } from "@/types/domain";
import { format } from "date-fns";
import { toast } from "sonner";
function GovernanceTabs({ active }: { active: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
      {governanceNav.map((n) => (
        <Button
          asChild
          variant={active === n.label ? "secondary" : "ghost"}
          className={active === n.label ? "text-signal" : "text-muted-foreground"}
          key={n.path}
        >
          <Link to={n.path}>
            <n.icon />
            {n.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
export function GovernancePage() {
  const { data: db, isLoading } = useWorkspace();
  const navigate = useNavigate();
  if (isLoading || !db) return <LoadingSkeletons />;
  const open = db.exceptions.filter((e) => e.status !== "Resolved");
  const score = Math.round((1 - open.length / (db.records.length + db.exceptions.length)) * 100);
  return (
    <>
      <PageHeader
        title="Governance"
        description="Confidence through accountability. A clear view of your controls."
        eyebrow="Oversight / Governance"
        actions={
          <Button onClick={() => navigate({ to: "/governance/exceptions" })}>
            <Plus />
            Log exception
          </Button>
        }
      />
      <GovernanceTabs active="Overview" />
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Compliance score", value: `${score}%`, icon: ShieldCheck },
          { label: "Open exceptions", value: open.length, icon: TriangleAlert },
          { label: "Change records", value: db.activity.length, icon: FileClock },
          { label: "Team members", value: db.team.length, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div className="panel p-5" key={label}>
            <Icon className="mb-4 h-5 w-5 text-signal" />
            <p className="micro">{label}</p>
            <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <SectionCard
          title="Governance health"
          description="A strong foundation for responsible intelligence."
        >
          <div className="relative mx-auto my-8 h-40 w-40">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="var(--elevated)"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="var(--success)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${score * 4.27} 427`}
              />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <span className="font-display text-4xl font-extrabold">{score}%</span>
              <span className="micro mt-2">Compliant</span>
            </div>
          </div>
          <div className="space-y-3 p-5">
            {[
              "Audit trail enabled",
              "Evidence traceability",
              "Decision approval tracking",
              "Knowledge review scheduling",
            ].map((t) => (
              <div
                key={t}
                className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground"
              >
                <span>{t}</span>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="Open exceptions"
          description="Active issues needing review and resolution."
          action={
            <TextLink onClick={() => navigate({ to: "/governance/exceptions" })}>View all</TextLink>
          }
        >
          <div className="space-y-1 p-5">
            {open.map((e) => (
              <Button
                key={e.id}
                variant="ghost"
                className="grid h-auto w-full grid-cols-[minmax(0,1fr)_auto] gap-3 whitespace-normal border-b border-border px-0 py-4 text-left"
                onClick={() => navigate({ to: "/governance/exceptions" })}
              >
                <span className="min-w-0">
                  <span className="block text-xs">{e.title}</span>
                  <span className="mt-2 block font-mono text-[9px] text-faint">
                    {e.id} · {e.assignee}
                  </span>
                </span>
                <StatusBadge status={e.severity} />
              </Button>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard
        title="Recent changes"
        className="mt-5"
        action={
          <TextLink onClick={() => navigate({ to: "/governance/changes" })}>
            All change records
          </TextLink>
        }
      >
        <div className="p-5">
          {db.activity.slice(0, 5).map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 border-b border-border py-4 last:border-0"
            >
              <Avatar name={a.user} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs">{a.summary}</p>
                <p className="micro mt-2">
                  {a.user} · {a.recordId}
                </p>
              </div>
              <span className="font-mono text-[9px] text-faint">
                {format(new Date(a.date), "MMM d")}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
export function ChangesPage() {
  const { data: db, isLoading } = useWorkspace();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [selected, setSelected] = useState<ActivityEntry>();
  if (isLoading || !db) return <LoadingSkeletons />;
  const rows = db.activity.filter(
    (a) =>
      (!action || a.action === action) &&
      `${a.summary} ${a.user} ${a.recordId}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Change Records"
        description="Who changed what, when, and why. Nothing lost in translation."
        actions={
          <Button variant="secondary" onClick={() => exportCSV(rows, "change-records.csv")}>
            <Download />
            Export CSV
          </Button>
        }
      />
      <GovernanceTabs active="Change Records" />
      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search changes…" />
        <select
          className="field"
          aria-label="Change action filter"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="">All actions</option>
          {[...new Set(db.activity.map((a) => a.action))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="panel overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Change</th>
              <th>Action</th>
              <th>Changed by</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 30).map((a) => (
              <tr key={a.id}>
                <td>
                  <Button
                    variant="ghost"
                    className="h-auto max-w-sm whitespace-normal px-0 text-left text-xs"
                    onClick={() => setSelected(a)}
                  >
                    {a.summary}
                  </Button>
                  <p className="micro mt-2">{a.recordId}</p>
                </td>
                <td>
                  <StatusBadge status={a.action} />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar name={a.user} />
                    <span className="text-xs text-muted-foreground">{a.user.split(" ")[0]}</span>
                  </div>
                </td>
                <td>
                  <span className="font-mono text-[10px] text-faint">
                    {format(new Date(a.date), "MMM d · HH:mm")}
                  </span>
                </td>
                <td>
                  <Button
                    aria-label={`View change ${a.id}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelected(a)}
                  >
                    <ArrowUpRight />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-3 p-4 md:hidden">
          {rows.slice(0, 30).map((a) => (
            <Button
              key={a.id}
              variant="ghost"
              className="h-auto w-full justify-start whitespace-normal border border-border p-4 text-left"
              onClick={() => setSelected(a)}
            >
              <span>
                <span className="block text-xs">{a.summary}</span>
                <span className="micro mt-2 block">
                  {a.user} · {format(new Date(a.date), "MMM d")}
                </span>
              </span>
            </Button>
          ))}
        </div>
        {!rows.length && <EmptyState />}
      </div>
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(undefined)}>
        <SheetContent className="w-full max-w-[95vw] overflow-auto sm:max-w-lg">
          <SheetTitle>Change details</SheetTitle>
          <SheetDescription>
            {selected?.id} · {selected?.recordId}
          </SheetDescription>
          {selected && (
            <div className="mt-8 space-y-6">
              <h2 className="text-lg font-bold">{selected.summary}</h2>
              <div className="flex items-center gap-3">
                <Avatar name={selected.user} />
                <div>
                  <p className="text-xs">{selected.user}</p>
                  <p className="micro mt-1">
                    {format(new Date(selected.date), "MMM d, yyyy · HH:mm")}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                <span className="micro text-destructive">Before</span>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap font-mono text-xs">
                  − {selected.before || "No prior version"}
                </pre>
              </div>
              <div className="rounded-xl border border-success/20 bg-success/5 p-5">
                <span className="micro text-success">After</span>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap font-mono text-xs">
                  + {selected.after}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
export function ExceptionsPage() {
  const { data: db, isLoading } = useWorkspace();
  const mutation = useWorkspaceMutation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState<ExceptionRecord>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [assignee, setAssignee] = useState("Kavindu Jayasinghe");
  const [resolution, setResolution] = useState("");
  const [error, setError] = useState("");
  if (isLoading || !db) return <LoadingSkeletons />;
  const rows = db.exceptions.filter(
    (e) =>
      (!status || e.status === status) &&
      `${e.title} ${e.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Exceptions"
        description="Surface the risks. Document the response. Close the loop."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Log exception
          </Button>
        }
      />
      <GovernanceTabs active="Exceptions" />
      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <SearchInput value={search} onChange={setSearch} />
        <select
          className="field"
          aria-label="Exception status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {["Open", "Investigating", "Resolved"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((e) => (
          <article key={e.id} className="panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="micro">{e.id}</span>
              <StatusBadge status={e.severity} />
            </div>
            <h2 className="text-sm font-bold leading-6">{e.title}</h2>
            <p className="my-3 text-xs leading-6 text-muted-foreground">{e.description}</p>
            <div className="mb-4 flex items-center justify-between">
              <StatusBadge status={e.status} />
              <Avatar name={e.assignee} />
            </div>
            {e.resolution && (
              <p className="mb-4 rounded-lg bg-elevated p-3 text-xs text-success">{e.resolution}</p>
            )}
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              {e.status === "Open" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    mutation.mutate(
                      () => workspaceService.exception({ status: "Investigating" }, e.id),
                      { onSuccess: () => toast.success("Investigation started") },
                    )
                  }
                >
                  Investigate
                </Button>
              )}
              {e.status !== "Resolved" && (
                <Button size="sm" onClick={() => setResolving(e)}>
                  <Check />
                  Resolve
                </Button>
              )}
              {e.status === "Resolved" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    mutation.mutate(() => workspaceService.exception({ status: "Open" }, e.id), {
                      onSuccess: () => toast.success("Exception reopened"),
                    })
                  }
                >
                  Reopen
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!rows.length && <EmptyState title="No matching exceptions" />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="responsive-dialog bg-card">
          <DialogTitle>Log governance exception</DialogTitle>
          <DialogDescription>Document a control gap and assign accountability.</DialogDescription>
          <Field label="Title" error={error}>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea
              className="field"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Severity">
              <select
                className="field"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                {["Low", "Medium", "High", "Critical"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Assignee">
              <select
                className="field"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                {db.team.map((t) => (
                  <option key={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Button
            onClick={() => {
              if (title.length < 5 || description.length < 10) {
                setError("Add a title of at least 5 characters and a description of at least 10.");
                return;
              }
              mutation.mutate(
                () => workspaceService.exception({ title, description, severity, assignee }),
                {
                  onSuccess: () => {
                    toast.success("Exception logged");
                    setOpen(false);
                    setTitle("");
                    setDescription("");
                    setError("");
                  },
                },
              );
            }}
          >
            Log exception
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={!!resolving} onOpenChange={(v) => !v && setResolving(undefined)}>
        <DialogContent className="responsive-dialog bg-card">
          <DialogTitle>Resolve exception</DialogTitle>
          <DialogDescription>{resolving?.title}</DialogDescription>
          <Field label="Resolution notes">
            <textarea
              className="field"
              rows={4}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </Field>
          <Button
            disabled={resolution.trim().length < 5}
            onClick={() => {
              mutation.mutate(
                () => workspaceService.exception({ status: "Resolved", resolution }, resolving?.id),
                {
                  onSuccess: () => {
                    toast.success("Exception resolved");
                    setResolving(undefined);
                    setResolution("");
                  },
                },
              );
            }}
          >
            Confirm resolution
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function TeamPage() {
  const { data: db, isLoading } = useWorkspace();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  if (isLoading || !db) return <LoadingSkeletons />;
  const rows = db.team.filter(
    (t) =>
      (!department || t.department === department) &&
      `${t.name} ${t.email} ${t.title}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Team Directory"
        description="The people behind your enterprise intelligence."
        actions={
          <Button onClick={() => setInvite(true)}>
            <Plus />
            Invite member
          </Button>
        }
      />
      <GovernanceTabs active="Team Directory" />
      <div className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search team…" />
        <select
          className="field"
          aria-label="Department filter"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All departments</option>
          {[...new Set(db.team.map((t) => t.department))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((t) => (
          <article className="panel p-6" key={t.id}>
            <div className="mb-5 flex items-center justify-between">
              <Avatar name={t.name} large />
              <StatusBadge status={t.status} />
            </div>
            <h2 className="text-base font-bold">{t.name}</h2>
            <p className="mt-2 text-xs text-muted-foreground">{t.title}</p>
            <p className="micro mt-3">{t.department}</p>
            <a
              href={`mailto:${t.email}`}
              className="mt-5 flex min-h-11 items-center gap-2 border-t border-border pt-3 text-[11px] text-signal"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 truncate">{t.email}</span>
            </a>
          </article>
        ))}
      </div>
      {!rows.length && <EmptyState />}
      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent className="responsive-dialog bg-card">
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            Preview an invitation. Delivery is not enabled in this demo.
          </DialogDescription>
          <Field label="Full name">
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email address" error={error}>
            <input
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button
            onClick={() => {
              if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
                setError("Enter a name and valid email address");
                return;
              }
              toast.success(`Demo invitation prepared for ${name}. No email sent.`);
              setInvite(false);
              setEmail("");
              setName("");
            }}
          >
            Prepare invitation
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
