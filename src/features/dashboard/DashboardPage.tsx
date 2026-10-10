import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  TriangleAlert,
  Check,
  BookOpen,
  BrainCircuit,
  Fingerprint,
  GitBranch,
  Workflow,
  Activity,
  CircleCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  LoadingSkeletons,
  PageHeader,
  SectionCard,
  StatusBadge,
  TextLink,
} from "@/components/common/primitives";
import { useWorkspace, workspaceService } from "@/services/repository";
import { modules } from "@/config/modules";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
const chartColors = [
  "var(--signal)",
  "var(--primary)",
  "var(--signal-light)",
  "var(--border)",
  "var(--faint)",
];
function Sparkline({ seed = 0 }: { seed?: number }) {
  return (
    <svg viewBox="0 0 80 30" width="75" height="30" aria-hidden="true">
      <path
        d={
          seed % 2 === 0
            ? "M0 25 9 21 17 24 26 15 34 18 44 9 54 13 65 5 79 3"
            : "M0 23 10 25 20 16 30 18 40 11 50 13 60 5 69 10 79 4"
        }
        fill="none"
        stroke="var(--signal)"
        strokeWidth="1.5"
      />
      <path d="M0 28H80" stroke="var(--border)" strokeDasharray="2 3" />
    </svg>
  );
}
function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  href,
  index,
}: {
  label: string;
  value: string | number;
  trend: string;
  icon: LucideIcon;
  href: string;
  index: number;
}) {
  const navigate = useNavigate();
  return (
    <article
      className="panel group cursor-pointer p-4 transition-colors hover:border-signal/40"
      onClick={() => navigate({ to: href })}
      tabIndex={0}
      role="link"
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate({ to: href });
      }}
      aria-label={`View ${label}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-faint" />
        <span className="min-w-0 truncate text-[11px] text-muted-foreground">{label}</span>
        <ArrowUpRight className="ml-auto h-3 w-3 text-faint opacity-0 group-hover:opacity-100" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="font-display text-[29px] font-extrabold leading-none">{value}</p>
          <p className="mt-3 text-[9px] text-success">
            <span className="mr-1">↗</span>
            {trend}
            <span className="ml-1 text-faint">vs last month</span>
          </p>
        </div>
        <Sparkline seed={index} />
      </div>
    </article>
  );
}
export function DashboardPage() {
  const { data: db, isLoading } = useWorkspace();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Good afternoon");
  const [date, setDate] = useState("Friday, October 9, 2026");
  const [range, setRange] = useState("This week");
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(9);
  useEffect(() => {
    const now = new Date();
    setGreeting(
      now.getHours() < 12
        ? "Good morning"
        : now.getHours() < 18
          ? "Good afternoon"
          : "Good evening",
    );
    setDate(format(now, "EEEE, MMMM d, yyyy"));
  }, []);
  if (isLoading || !db) return <LoadingSkeletons />;
  const records = db.records;
  const knowledge = records.filter((r) => r.module === "knowledge");
  const cases = records.filter((r) => r.module === "reasoning");
  const evidence = records.filter((r) => r.module === "evidence");
  const decisions = records.filter((r) => r.module === "decisions");
  const rules = records.filter((r) => r.module === "rules");
  const exceptionCount = db.exceptions.filter((e) => e.status !== "Resolved").length;
  const verified = evidence.filter((r) => r.status === "Verified").length;
  const kpis = [
    {
      label: "Knowledge records",
      value: knowledge.length,
      trend: "+12.8%",
      icon: BookOpen,
      href: "/knowledge",
    },
    {
      label: "Open cases",
      value: cases.filter((r) => !["Concluded", "Archived"].includes(r.status)).length,
      trend: "+8.2%",
      icon: BrainCircuit,
      href: "/reasoning",
    },
    {
      label: "Evidence verified",
      value: `${Math.round((verified / Math.max(1, evidence.length)) * 100)}%`,
      trend: "+6.4%",
      icon: Fingerprint,
      href: "/evidence",
    },
    {
      label: "Pending decisions",
      value: decisions.filter((r) => r.status === "Pending approval").length,
      trend: "−3.1%",
      icon: GitBranch,
      href: "/decisions",
    },
    {
      label: "Active rules",
      value: rules.filter((r) => r.status === "Active").length,
      trend: "+15.3%",
      icon: Workflow,
      href: "/rules",
    },
    {
      label: "Open exceptions",
      value: exceptionCount,
      trend: "−18.5%",
      icon: TriangleAlert,
      href: "/governance/exceptions",
    },
  ];
  const caseStats = modules.reasoning.statuses
    .filter((s) => s !== "Archived")
    .map((s) => ({ name: s, value: cases.filter((r) => r.status === s).length }));
  const outcome = modules.decisions.statuses
    .filter((s) => s !== "Archived")
    .map((s) => ({
      name: s === "Pending approval" ? "Pending" : s,
      value: decisions.filter((r) => r.status === s).length,
    }));
  const reliability = [
    { name: "A · High", value: evidence.filter((r) => r.confidence >= 90).length },
    {
      name: "B · Good",
      value: evidence.filter((r) => r.confidence >= 80 && r.confidence < 90).length,
    },
    {
      name: "C · Fair",
      value: evidence.filter((r) => r.confidence >= 70 && r.confidence < 80).length,
    },
    { name: "D · Low", value: evidence.filter((r) => r.confidence < 70).length },
  ];
  const attention = records
    .filter(
      (r) =>
        r.status === "Pending approval" || r.status === "Disputed" || r.status === "Under review",
    )
    .slice(0, 4);
  const recent = [...records].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const activity = db.activity.slice(0, 4);
  const series = workspaceService
    .charts()
    .map((s, i) => ({
      ...s,
      knowledge: range === "This month" ? s.knowledge * ((i % 2) + 2) : s.knowledge,
      cases: range === "This month" ? s.cases * 2 : s.cases,
    }));
  return (
    <>
      <PageHeader
        title={`${greeting}, ${db.profile.name.split(" ")[0]}`}
        description="Here’s what’s happening across your intelligence workspace."
        eyebrow={date}
        actions={
          <>
            <Button
              variant="secondary"
              className="h-10 text-[11px]"
              onClick={() => setRange(range === "This week" ? "This month" : "This week")}
            >
              <CalendarDays />
              {range}
              <ChevronDownIcon />
            </Button>
            <Button className="h-10 text-[11px]" onClick={() => navigate({ to: "/reasoning/new" })}>
              <Plus />
              New case
            </Button>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((k, i) => (
          <StatCard {...k} key={k.label} index={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <SectionCard
          title="Workspace activity"
          description="Knowledge and reasoning, moving forward."
          action={
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-[9px] text-muted-foreground sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                Knowledge
              </span>
              <span className="hidden items-center gap-1.5 text-[9px] text-muted-foreground sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-faint" />
                Reasoning
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="View activity"
                className="h-6 w-6"
                onClick={() => navigate({ to: "/activity" })}
              >
                <MoreHorizontal />
              </Button>
            </div>
          }
        >
          <div className="mt-5 flex items-baseline gap-3 px-5">
            <span className="font-display text-3xl font-extrabold">
              {series.reduce((n, s) => n + s.knowledge + s.cases, 0)}
            </span>
            <span className="text-[10px] text-faint">total events</span>
            <span className="ml-1 text-[10px] text-success">↗ 24.6%</span>
          </div>
          <div className="h-[213px] min-w-0 px-3 pb-4 pt-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 5, right: 12, bottom: 0, left: -28 }}>
                <defs>
                  <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--signal)" stopOpacity={0.2} />
                    <stop offset="1" stopColor="var(--signal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} dy={8} />
                <YAxis axisLine={false} tickLine={false} tickCount={4} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active ? (
                      <div className="chart-tooltip text-xs">
                        <p className="mb-2 text-faint">{label}</p>
                        {payload?.map((p) => (
                          <p key={p.dataKey}>
                            {p.name}: {p.value}
                          </p>
                        ))}
                      </div>
                    ) : null
                  }
                />
                <Area
                  name="Knowledge"
                  dataKey="knowledge"
                  type="monotone"
                  stroke="var(--signal)"
                  strokeWidth={2}
                isAnimationActive={false}
                  fill="url(#activity-fill)"
                />
                <Area
                  name="Reasoning"
                  dataKey="cases"
                  type="monotone"
                  stroke="var(--faint)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-2 border-t border-border px-5 py-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <span className="text-[10px] text-faint">
              An active workspace is an informed workspace.
            </span>
            <TextLink onClick={() => navigate({ to: "/activity" })}>View activity</TextLink>
          </div>
        </SectionCard>
        <SectionCard
          title="Needs your attention"
          description="A little focus makes a big difference."
          action={
            <span className="rounded-full border border-warning/20 bg-warning/10 px-2 py-1 font-mono text-[9px] text-warning">
              {attention.length} ITEMS
            </span>
          }
        >
          <div className="mt-3 px-5">
            {attention.map((r, i) => {
              const Icon =
                r.module === "decisions"
                  ? GitBranch
                  : r.module === "evidence"
                    ? Fingerprint
                    : BookOpen;
              return (
                <Button
                  key={r.id}
                  variant="ghost"
                  className="grid h-auto w-full grid-cols-[32px_minmax(0,1fr)_auto] gap-3 whitespace-normal rounded-none border-b border-border px-0 py-4 text-left"
                  onClick={() => navigate({ to: "/" + r.module + "/$id", params: { id: r.id } })}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg",
                      i % 2 ? "bg-signal/10 text-signal" : "bg-warning/10 text-warning",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-medium">{r.title}</span>
                    <span className="mt-1 block text-[9px] text-faint">
                      {r.id} <span className="mx-1">·</span> {r.status}
                    </span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-faint" />
                </Button>
              );
            })}
          </div>
          <div className="px-5 py-3">
            <TextLink onClick={() => navigate({ to: "/governance" })}>
              View all outstanding items
            </TextLink>
          </div>
        </SectionCard>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        <SectionCard
          title="Cases by status"
          description={`${cases.length} reasoning cases`}
          action={
            <TextLink onClick={() => navigate({ to: "/reasoning" })}>
              <ArrowUpRight />
            </TextLink>
          }
        >
          <div className="flex items-center gap-3 p-5">
            <div className="relative h-36 w-[45%] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseStats}
                    innerRadius="70%"
                    outerRadius="95%"
                    isAnimationActive={false} paddingAngle={5}
                    dataKey="value"
                    stroke="transparent"
                    cornerRadius={3}
                  >
                    {caseStats.map((s, i) => (
                      <Cell key={s.name} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                <span className="font-display text-2xl font-extrabold">{cases.length}</span>
                <span className="micro mt-1">Total cases</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              {caseStats.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-[9px]">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      ["bg-signal", "bg-primary", "bg-signal-light", "bg-border", "bg-faint"][i],
                    )}
                  />
                  <span className="min-w-0 truncate text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Decision outcomes"
          description="From consideration to conviction."
          action={
            <TextLink onClick={() => navigate({ to: "/decisions" })}>
              <ArrowUpRight />
            </TextLink>
          }
        >
          <div className="h-[184px] px-2 pb-3 pt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcome} margin={{ left: -30, right: 12, top: 0, bottom: 0 }}>
                <defs>
                  <pattern
                    id="bar-hatch"
                    width="5"
                    height="5"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect width="5" height="5" fill="var(--signal)" />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="5"
                      stroke="var(--signal-light)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fontSize: 8 }}
                />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tickCount={3} />
                <Tooltip
                  cursor={{ fill: "var(--elevated)" }}
                  content={({ active, payload }) =>
                    active ? (
                      <div className="chart-tooltip text-xs">
                        {payload?.[0]?.payload.name}: {payload?.[0]?.value}
                      </div>
                    ) : null
                  }
                />
                <Bar isAnimationActive={false} dataKey="value" fill="url(#bar-hatch)" radius={[5, 5, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard
          title="Evidence reliability"
          description="Confidence starts with quality sources."
          action={
            <TextLink onClick={() => navigate({ to: "/evidence" })}>
              <ArrowUpRight />
            </TextLink>
          }
        >
          <div className="space-y-4 px-5 pb-5 pt-6">
            {reliability.map((s, i) => (
              <div
                key={s.name}
                className="grid grid-cols-[65px_minmax(0,1fr)_22px] items-center gap-3"
              >
                <span className="font-mono text-[9px] text-muted-foreground">{s.name}</span>
                <div className="h-4 rounded bg-elevated">
                  <svg width="100%" height="16">
                    <defs>
                      <pattern
                        id={`reliability-${i}`}
                        width="5"
                        height="5"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(45)"
                      >
                        <rect
                          width="5"
                          height="5"
                          fill={i === 3 ? "var(--faint)" : "var(--signal)"}
                        />
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="5"
                          stroke="var(--signal-light)"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect
                      width={`${Math.max(4, (s.value / evidence.length) * 100)}%`}
                      height="16"
                      rx="3"
                      fill={`url(#reliability-${i})`}
                    />
                  </svg>
                </div>
                <span className="font-mono text-[10px] text-faint">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <SectionCard
          title="Recently updated"
          description="Your workspace, always evolving."
          action={<TextLink onClick={() => navigate({ to: "/search" })}>View all records</TextLink>}
        >
          <div className="mt-4 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const Icon = modules[r.module].icon;
                  return (
                    <tr key={r.id}>
                      <td>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            navigate({ to: "/" + r.module + "/$id", params: { id: r.id } })
                          }
                          className="grid h-auto grid-cols-[26px_minmax(0,1fr)] gap-2 whitespace-normal p-0 text-left"
                        >
                          <span className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-elevated">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-1 text-[11px]">{r.title}</span>
                            <span className="mt-1 block font-mono text-[8px] text-faint">
                              {r.id}
                            </span>
                          </span>
                        </Button>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <Avatar name={r.owner} />
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="text-[10px] text-faint">
                          {format(new Date(r.updatedAt), "MMM d")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="space-y-2 px-5 pb-4 md:hidden">
              {recent.map((r) => (
                <Button
                  variant="ghost"
                  key={r.id}
                  className="h-auto w-full justify-between whitespace-normal border-b border-border px-0 py-3 text-left"
                  onClick={() => navigate({ to: "/" + r.module + "/$id", params: { id: r.id } })}
                >
                  <span className="min-w-0">
                    <span className="block text-[11px]">{r.title}</span>
                    <span className="micro mt-1 block">{r.id}</span>
                  </span>
                  <ChevronRight className="shrink-0" />
                </Button>
              ))}
            </div>
          </div>
        </SectionCard>
        <div className="grid gap-5">
          <SectionCard
            title="Upcoming reviews"
            action={
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous review week"
                  className="h-6 w-6"
                  onClick={() => setCalendarOffset((v) => v - 7)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next review week"
                  className="h-6 w-6"
                  onClick={() => setCalendarOffset((v) => v + 7)}
                >
                  <ChevronRight />
                </Button>
              </div>
            }
          >
            <div className="p-5">
              <div className="mb-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }, (_, i) => {
                  const day = 6 + i + calendarOffset;
                  return (
                    <Button
                      key={i}
                      variant="ghost"
                      className={cn(
                        "h-14 flex-col gap-2 rounded-lg px-0",
                        selectedDay === day && "border border-signal/40 bg-signal/10 text-signal",
                      )}
                      onClick={() => setSelectedDay(day)}
                    >
                      <span className="font-mono text-[8px] text-faint">
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][i]}
                      </span>
                      <span className="text-xs">{day}</span>
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                className="grid h-auto w-full grid-cols-[28px_minmax(0,1fr)_auto] gap-2 rounded-lg bg-elevated px-3 py-3 text-left"
                onClick={() =>
                  navigate({
                    to: "/knowledge/$id",
                    params: { id: knowledge[selectedDay % knowledge.length]?.id ?? "KNW-00001" },
                  })
                }
              >
                <CalendarDays className="h-4 w-4 text-signal" />
                <span className="min-w-0">
                  <span className="block truncate text-[10px]">Quarterly knowledge review</span>
                  <span className="mt-1 block text-[9px] text-faint">
                    Oct {selectedDay} · 10:00 AM
                  </span>
                </span>
                <Avatar name="Priya Sharma" />
              </Button>
            </div>
          </SectionCard>
          <section className="panel flex items-center gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-success/15 bg-success/5 text-success">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[11px] font-semibold">Intelligence, running smoothly.</h3>
              <p className="mt-1 text-[9px] text-faint">
                All services healthy · Last checked just now
              </p>
            </div>
            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
          </section>
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <SectionCard
          title="Recent activity"
          action={
            <TextLink onClick={() => navigate({ to: "/activity" })}>Full activity log</TextLink>
          }
        >
          <div className="px-5 py-2">
            {activity.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 border-b border-border py-3 last:border-0"
              >
                <Avatar name={a.user} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px]">
                    <span className="font-semibold">{a.user.split(" ")[0]}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      {a.action} a{" "}
                      {a.module === "reasoning"
                        ? "case"
                        : a.module === "rules"
                          ? "rule"
                          : a.module + " record"}
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-1 h-auto max-w-full truncate px-0 text-[10px] text-faint"
                    onClick={() => {
                      const r = records.find((r) => r.id === a.recordId);
                      if (r) navigate({ to: "/" + r.module + "/$id", params: { id: r.id } });
                    }}
                  >
                    {records.find((r) => r.id === a.recordId)?.title}
                  </Button>
                </div>
                <span className="shrink-0 font-mono text-[8px] text-faint">
                  {format(new Date(a.date), "HH:mm")}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
        <section className="panel relative overflow-hidden p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-signal" />
            <span className="micro text-signal">Connected intelligence</span>
          </div>
          <h2 className="mt-5 max-w-[220px] text-xl font-extrabold leading-8">
            Good decisions don’t happen in isolation.
          </h2>
          <p className="mt-3 max-w-[240px] text-[11px] leading-6 text-muted-foreground">
            Connect your knowledge, reasoning and evidence. Make every decision traceable.
          </p>
          <Button
            variant="secondary"
            className="mt-5 h-9 text-[10px]"
            onClick={() => navigate({ to: "/knowledge" })}
          >
            Explore your knowledge
            <ArrowUpRight />
          </Button>
          <svg
            viewBox="0 0 140 140"
            className="pointer-events-none absolute -bottom-3 -right-3 w-28 opacity-30"
            aria-hidden="true"
          >
            <path
              d="m70 10 52 30v60l-52 30-52-30V40L70 10Zm0 30 26 15v30l-26 15-26-15V55L70 40Z"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="1"
            />
            <path d="M18 40 70 70l52-30M70 70v60M70 10v30" stroke="var(--signal)" strokeWidth="1" />
          </svg>
        </section>
      </div>
    </>
  );
}
function ChevronDownIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="m2 4 3 3 3-3" stroke="currentColor" />
    </svg>
  );
}
