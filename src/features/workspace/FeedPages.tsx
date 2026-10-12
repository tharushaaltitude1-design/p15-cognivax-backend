import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  Download,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowUpRight,
  Search,
  Clock3,
  Plus,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  EmptyState,
  LoadingSkeletons,
  PageHeader,
  SearchInput,
  StatusBadge,
  TagChip,
} from "@/components/common/primitives";
import {
  useWorkspace,
  useWorkspaceMutation,
  workspaceService,
  exportCSV,
} from "@/services/repository";
import { moduleKeys, modules } from "@/config/modules";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export function ActivityPage() {
  const { data: db, isLoading } = useWorkspace();
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [user, setUser] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit, setLimit] = useState(15);
  const [expanded, setExpanded] = useState<string[]>([]);
  const navigate = useNavigate();
  if (isLoading || !db) return <LoadingSkeletons />;
  const entries = db.activity.filter(
    (a) =>
      (!module || a.module === module) &&
      (!action || a.action === action) &&
      (!user || a.user === user) &&
      (!from || a.date >= from) &&
      (!to || a.date.slice(0, 10) <= to) &&
      `${a.summary} ${a.recordId} ${a.user}`.toLowerCase().includes(search.toLowerCase()),
  );
  const visible = entries.slice(0, limit);
  let lastDay = "";
  return (
    <>
      <PageHeader
        title="Activity"
        description="Every update, every decision. A complete workspace audit trail."
        eyebrow="Oversight / Workspace audit"
        actions={
          <Button variant="secondary" onClick={() => exportCSV(entries, "cognivax-activity.csv")}>
            <Download />
            Export CSV
          </Button>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search activity…" />
        <select
          className="field"
          aria-label="Activity module"
          value={module}
          onChange={(e) => setModule(e.target.value)}
        >
          <option value="">All modules</option>
          {moduleKeys.map((k) => (
            <option value={k} key={k}>
              {modules[k].label}
            </option>
          ))}
          <option value="governance">Governance</option>
        </select>
        <select
          className="field"
          aria-label="Activity action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="">All actions</option>
          {[...new Set(db.activity.map((a) => a.action))].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select
          className="field"
          aria-label="Activity user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        >
          <option value="">All users</option>
          {db.team.map((t) => (
            <option key={t.id}>{t.name}</option>
          ))}
        </select>
        <label className="text-xs text-muted-foreground">
          From
          <input
            aria-label="Activity from date"
            type="date"
            className="field mt-1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          To
          <input
            aria-label="Activity to date"
            type="date"
            className="field mt-1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <div className="panel p-5 sm:p-7">
        {visible.length ? (
          visible.map((a) => {
            const day = format(new Date(a.date), "MMM d, yyyy");
            const heading = day !== lastDay;
            lastDay = day;
            const record = db.records.find((r) => r.id === a.recordId);
            const open = expanded.includes(a.id);
            return (
              <div key={a.id}>
                {heading && (
                  <h2 className="micro mb-4 mt-5 border-b border-border pb-3 first:mt-0">
                    {day === "Oct 9, 2026" ? "Today" : day === "Oct 8, 2026" ? "Yesterday" : day}
                  </h2>
                )}
                <div className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-start gap-4 border-b border-border/50 py-4">
                  <Avatar name={a.user} />
                  <div className="min-w-0">
                    <p className="break-words text-xs leading-6">{a.summary}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-faint">
                      <span>{a.user}</span>
                      <span>·</span>
                      <span className="font-mono">{format(new Date(a.date), "HH:mm")}</span>
                      {record && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 font-mono text-[9px] text-signal"
                          onClick={() =>
                            navigate({
                              to: "/" + record.module + "/$id",
                              params: { id: record.id },
                            })
                          }
                        >
                          {a.recordId}
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {open && (
                      <div className="mt-3 grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
                        <div>
                          <span className="micro">Before</span>
                          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-destructive">
                            {a.before || "No previous state"}
                          </pre>
                        </div>
                        <div>
                          <span className="micro">After</span>
                          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-success">
                            {a.after}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Details for ${a.id}`}
                    aria-expanded={open}
                    onClick={() =>
                      setExpanded((v) => (open ? v.filter((id) => id !== a.id) : [...v, a.id]))
                    }
                  >
                    {open ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState title="No matching activity" />
        )}
        {limit < entries.length && (
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => setLimit((v) => v + 15)}
          >
            Load more · {entries.length - limit} remaining
          </Button>
        )}
      </div>
    </>
  );
}
export function NotificationsPage() {
  const { data: db, isLoading } = useWorkspace();
  const mutation = useWorkspaceMutation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  if (isLoading || !db) return <LoadingSkeletons />;
  const unread = db.notifications.filter((n) => !n.read).length;
  const rows = db.notifications.filter(
    (n) => tab === "All" || (tab === "Unread" ? !n.read : n.type === tab),
  );
  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unread} unread notifications. Stay close to what matters.`}
        eyebrow="Oversight / Inbox"
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              mutation.mutate(() => workspaceService.markAllRead(), {
                onSuccess: () => toast.success("All notifications marked read"),
              })
            }
          >
            <CheckCheck />
            Mark all read
          </Button>
        }
      />
      <div className="panel">
        <div className="flex flex-wrap gap-1 border-b border-border p-4">
          {["All", "Unread", "Approvals", "Exceptions", "System"].map((t) => (
            <Button
              variant={tab === t ? "secondary" : "ghost"}
              key={t}
              className={tab === t ? "text-signal" : "text-faint"}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Unread" && unread > 0 && (
                <span className="rounded bg-signal/10 px-1.5 font-mono text-[10px]">{unread}</span>
              )}
            </Button>
          ))}
        </div>
        {rows.length ? (
          rows.map((n) => (
            <div
              className={cn(
                "grid grid-cols-[32px_minmax(0,1fr)] items-start gap-3 border-b border-border px-4 py-5 sm:grid-cols-[36px_minmax(0,1fr)_auto] sm:px-6",
                !n.read && "bg-signal/3",
              )}
              key={n.id}
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-elevated text-signal">
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start whitespace-normal p-0 text-left"
                  onClick={() => {
                    mutation.mutate(() => workspaceService.notification(n.id, "read"));
                    const r = db.records.find((r) => r.id === n.recordId);
                    if (r) navigate({ to: "/" + r.module + "/$id", params: { id: r.id } });
                    else navigate({ to: "/governance/exceptions" });
                  }}
                >
                  <span>
                    <span className="flex items-center gap-2 text-xs">
                      {n.title}
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />}
                    </span>
                    <span className="mt-2 block text-[11px] text-muted-foreground">
                      {n.description}
                    </span>
                  </span>
                </Button>
                <div className="mt-3 flex items-center gap-3">
                  <TagChip>{n.type}</TagChip>
                  <span className="font-mono text-[9px] text-faint">
                    {format(new Date(n.date), "MMM d · HH:mm")}
                  </span>
                </div>
              </div>
              <div className="col-start-2 flex sm:col-start-auto">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={n.read ? "Mark unread" : "Mark read"}
                  onClick={() =>
                    mutation.mutate(() =>
                      workspaceService.notification(n.id, n.read ? "unread" : "read"),
                    )
                  }
                >
                  <Check className={n.read ? "text-faint" : "text-success"} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete notification"
                  onClick={() =>
                    mutation.mutate(() => workspaceService.notification(n.id, "delete"))
                  }
                >
                  <Trash2 className="text-faint" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="You’re all caught up"
            description="New updates will appear here as your workspace evolves."
          />
        )}
      </div>
    </>
  );
}
export function SearchPage() {
  const { data: db } = useWorkspace();
  const mutation = useWorkspaceMutation();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [type, setType] = useState("All");
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 250);
    return () => clearTimeout(t);
  }, [term]);
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => workspaceService.search(debounced),
  });
  const visible = results.filter((r) => type === "All" || r.module === type);
  return (
    <>
      <PageHeader
        title="Search"
        description="One search. Your entire intelligence workspace."
        eyebrow="Tools / Connected knowledge"
      />
      <div className="mb-5">
        <SearchInput
          value={term}
          onChange={setTerm}
          placeholder="Search titles, IDs, tags and content…"
        />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...moduleKeys].map((k) => (
          <Button
            key={k}
            size="sm"
            variant={type === k ? "secondary" : "ghost"}
            className={type === k ? "text-signal" : "text-muted-foreground"}
            onClick={() => setType(k)}
          >
            {k === "All" ? "All modules" : modules[k as keyof typeof modules].label}
          </Button>
        ))}
      </div>
      {!term && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <section className="panel p-5">
            <h2 className="section-title mb-4">Recent searches</h2>
            {db?.recentSearches.length ? (
              db.recentSearches.map((s) => (
                <Button
                  key={s}
                  variant="ghost"
                  className="w-full justify-start text-xs text-muted-foreground"
                  onClick={() => setTerm(s)}
                >
                  <Clock3 />
                  {s}
                </Button>
              ))
            ) : (
              <p className="text-xs text-faint">Your recent searches will appear here.</p>
            )}
          </section>
          <section className="panel p-5">
            <h2 className="section-title mb-4">Quick actions</h2>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs"
              onClick={() => navigate({ to: "/reasoning/new" })}
            >
              <Plus />
              Create new case
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs"
              onClick={() => navigate({ to: "/settings" })}
            >
              <Settings />
              Go to Settings
            </Button>
          </section>
        </div>
      )}
      {isLoading ? (
        <LoadingSkeletons />
      ) : visible.length ? (
        <div className="space-y-5">
          {moduleKeys
            .filter((k) => type === "All" || type === k)
            .map((k) => {
              const rows = visible.filter((r) => r.module === k);
              if (!rows.length) return null;
              const Icon = modules[k].icon;
              return (
                <section key={k} className="panel overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border p-4">
                    <Icon className="h-4 w-4 text-signal" />
                    <h2 className="section-title">{modules[k].label}</h2>
                    <span className="ml-auto font-mono text-[10px] text-faint">
                      {rows.length} results
                    </span>
                  </div>
                  {rows.map((r) => (
                    <Button
                      key={r.id}
                      variant="ghost"
                      className="grid h-auto w-full grid-cols-[minmax(0,1fr)_auto] gap-3 whitespace-normal rounded-none border-b border-border p-5 text-left"
                      onClick={() => {
                        if (term) mutation.mutate(() => workspaceService.saveSearch(term));
                        navigate({ to: "/" + r.module + "/$id", params: { id: r.id } });
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block text-xs">
                          <Highlight text={r.title} term={debounced} />
                        </span>
                        <span className="mt-2 block font-mono text-[9px] text-faint">
                          {r.id} · {r.category}
                        </span>
                        <span className="mt-2 line-clamp-1 block text-[11px] text-muted-foreground">
                          {r.summary}
                        </span>
                      </span>
                      <ArrowUpRight className="shrink-0 text-faint" />
                    </Button>
                  ))}
                </section>
              );
            })}
        </div>
      ) : (
        <EmptyState
          title="No matching intelligence"
          description="Try a different title, record ID or tag."
        />
      )}
    </>
  );
}
function Highlight({ text, term }: { text: string; term: string }) {
  if (!term) return <>{text}</>;
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-signal/20 text-signal">
        {text.slice(index, index + term.length)}
      </mark>
      {text.slice(index + term.length)}
    </>
  );
}
