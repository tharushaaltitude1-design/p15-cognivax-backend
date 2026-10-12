import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import {
  Pencil,
  Copy,
  Archive,
  Trash2,
  ArrowLeft,
  Check,
  X,
  FileText,
  ExternalLink,
  Play,
  MessageSquare,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  PageHeader,
  StatusBadge,
  Avatar,
  LoadingSkeletons,
  EmptyState,
  ConfirmDialog,
  TagChip,
  Field,
} from "@/components/common/primitives";
import { modules } from "@/config/modules";
import { useRecord, useRecordMutation, useWorkspace } from "@/services/repository";
import type { ModuleKey } from "@/types/domain";
import { format } from "date-fns";
import { toast } from "sonner";
export function ModuleDetail({ module, id }: { module: ModuleKey; id: string }) {
  const { data: r, isLoading } = useRecord(module, id);
  const { data: db } = useWorkspace();
  const mutation = useRecordMutation(module);
  const navigate = useNavigate();
  const config = modules[module];
  const [tab, setTab] = useState("Overview");
  const [deleting, setDeleting] = useState(false);
  const [approval, setApproval] = useState("");
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");
  const [sample, setSample] = useState('{"risk_score": 85}');
  const [testResult, setTestResult] = useState("");
  if (isLoading) return <LoadingSkeletons />;
  if (!r)
    return (
      <EmptyState
        title="Record not found"
        description="This record may have been removed."
        action={
          <Button onClick={() => navigate({ to: "/" + module })}>Back to {config.label}</Button>
        }
      />
    );
  const update = (data: Parameters<typeof mutation.mutate>[0]["data"], message: string) =>
    mutation.mutate(
      { action: "update", id, data: data ?? {} },
      { onSuccess: () => toast.success(message), onError: (e) => toast.error(e.message) },
    );
  const related =
    db?.records.filter((record) => r.links.includes(record.id) || record.links.includes(id)) ?? [];
  const history = db?.activity.filter((a) => a.recordId === id) ?? [];
  return (
    <>
      <Button
        variant="ghost"
        className="mb-4 h-8 px-0 text-xs text-faint"
        onClick={() => navigate({ to: "/" + module })}
      >
        <ArrowLeft />
        Back to {config.label}
      </Button>
      <PageHeader
        title={r.title}
        eyebrow={`${config.label} / ${id}`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate({ to: "/" + module + "/$id/edit", params: { id } })}
            >
              <Pencil />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Duplicate record"
              onClick={() =>
                mutation.mutate(
                  { action: "create", data: { ...r, title: r.title + " (copy)", status: "Draft" } },
                  {
                    onSuccess: (copy) => {
                      toast.success("Record duplicated");
                      if (copy) navigate({ to: "/" + module + "/$id", params: { id: copy.id } });
                    },
                  },
                )
              }
            >
              <Copy />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Archive record"
              onClick={() => update({ status: "Archived" }, "Record archived")}
            >
              <Archive />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete record"
              className="text-destructive"
              onClick={() => setDeleting(true)}
            >
              <Trash2 />
            </Button>
          </>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={r.status} />
        <span className="text-[11px] text-faint">Version {r.version}</span>
        {module === "rules" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              update(
                { status: r.status === "Active" ? "Inactive" : "Active" },
                "Rule status updated",
              )
            }
          >
            {r.status === "Active" ? "Deactivate" : "Activate"} rule
          </Button>
        )}
        {module === "decisions" && r.status === "Pending approval" && (
          <>
            <Button size="sm" onClick={() => setApproval("Approve")}>
              <Check />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setApproval("Reject")}>
              <X />
              Reject
            </Button>
          </>
        )}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap gap-1 border-b border-border px-4 py-3">
            {["Overview", "Linked Records", "History", "Comments / Notes"].map((t) => (
              <Button
                key={t}
                variant={tab === t ? "secondary" : "ghost"}
                className={tab === t ? "text-signal" : "text-muted-foreground"}
                onClick={() => setTab(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <div className="p-5 sm:p-7">
            {tab === "Overview" && (
              <div className="space-y-7">
                <div>
                  <h2 className="section-title mb-3">Summary</h2>
                  <p className="text-sm leading-7 text-muted-foreground">{r.summary}</p>
                </div>
                {module === "reasoning" ? (
                  <>
                    <Info title="Objective" text={r.objective} />
                    <Info title="Context & assumptions" text={`${r.context}\n\n${r.assumptions}`} />
                    <div>
                      <h2 className="section-title mb-5">Reasoning chain</h2>
                      {r.steps.map((step, i) => (
                        <div key={i} className="relative ml-4 border-l border-border pb-6 pl-8">
                          <span className="absolute -left-3 top-0 grid h-6 w-6 place-items-center rounded-full border border-signal/40 bg-card font-mono text-[10px] text-signal">
                            {i + 1}
                          </span>
                          <p className="text-xs leading-6 text-muted-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                    <Info title="Conclusion" text={r.outcome} />
                  </>
                ) : module === "rules" ? (
                  <>
                    <div className="rounded-xl border border-signal/20 bg-signal/5 p-5">
                      <span className="micro text-signal">IF</span>
                      <pre className="mt-3 overflow-auto whitespace-pre-wrap break-all font-mono text-sm">
                        {r.condition}
                      </pre>
                    </div>
                    <div className="rounded-xl border border-border bg-elevated p-5">
                      <span className="micro">THEN</span>
                      <p className="mt-3 text-sm text-muted-foreground">{r.action}</p>
                    </div>
                    <div className="border-t border-border pt-5">
                      <h2 className="section-title mb-4">Test rule</h2>
                      <Field label="Sample input · JSON">
                        <textarea
                          className="field font-mono"
                          rows={3}
                          value={sample}
                          onChange={(e) => setSample(e.target.value)}
                        />
                      </Field>
                      <Button
                        className="mt-3"
                        onClick={() => {
                          try {
                            const input: unknown = JSON.parse(sample);
                            if (typeof input !== "object" || !input)
                              throw new Error("Invalid input");
                            const match = r.condition.match(/^(\w+)\s*(>|<|=)\s*(.+)$/);
                            if (!match) {
                              setTestResult("Simulated evaluation: sent for manual review.");
                              return;
                            }
                            const [, field, op, value] = match;
                            const actual = field ? Reflect.get(input, field) : undefined;
                            const expected = Number(value);
                            const passed =
                              op === ">"
                                ? Number(actual) > expected
                                : op === "<"
                                  ? Number(actual) < expected
                                  : String(actual) === value?.trim();
                            setTestResult(
                              passed ? `MATCH · ${r.action}` : "NO MATCH · No action triggered",
                            );
                          } catch {
                            toast.error("Enter valid JSON");
                          }
                        }}
                      >
                        <Play />
                        Run test
                      </Button>
                      {testResult && (
                        <p className="mt-4 rounded-lg bg-elevated p-4 font-mono text-xs text-signal">
                          {testResult}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Markdown text={r.content} />
                    {module === "decisions" && (
                      <>
                        <Info title="Alternatives considered" text={r.alternatives} />
                        <Info
                          title="Approval tracker"
                          text={r.approvals.length ? "" : "Awaiting the next approval action."}
                        />
                        {r.approvals.map((a, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-lg border border-border p-4"
                          >
                            <Avatar name={a.user} />
                            <div>
                              <StatusBadge status={a.action} />
                              <p className="mt-2 text-xs text-muted-foreground">{a.comment}</p>
                              <span className="micro">
                                {a.user} · {format(new Date(a.date), "MMM d, HH:mm")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {(module === "knowledge" || module === "evidence") && (
                      <div className="border-t border-border pt-5">
                        <h2 className="section-title mb-4">Sources & attachments</h2>
                        <a
                          href={r.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 text-xs text-signal"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {r.source} · {r.sourceType}
                        </a>
                        {r.attachments.map((a, i) => (
                          <div
                            key={i}
                            className="mt-3 flex items-center gap-3 rounded-lg border border-border p-3 text-xs text-muted-foreground"
                          >
                            <FileText className="h-4 w-4 text-faint" />
                            {a.name}
                            <span className="ml-auto text-faint">
                              {Math.round(a.size / 1024)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {tab === "Linked Records" && (
              <div className="space-y-3">
                {related.length ? (
                  related.map((record) => (
                    <Button
                      variant="ghost"
                      key={record.id}
                      className="h-auto w-full justify-start whitespace-normal rounded-xl border border-border p-4 text-left"
                      onClick={() =>
                        navigate({ to: "/" + record.module + "/$id", params: { id: record.id } })
                      }
                    >
                      <Link2 className="shrink-0 text-signal" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs">{record.title}</span>
                        <span className="mt-1 block font-mono text-[10px] text-faint">
                          {record.id} · {modules[record.module].label}
                        </span>
                      </span>
                      <StatusBadge status={record.status} />
                    </Button>
                  ))
                ) : (
                  <EmptyState
                    title="No linked records"
                    description="Edit this record to connect supporting material."
                  />
                )}
              </div>
            )}
            {tab === "History" && (
              <>
                {history.length ? (
                  history.map((a) => (
                    <div key={a.id} className="flex gap-4 border-b border-border py-4">
                      <Avatar name={a.user} />
                      <div className="min-w-0">
                        <p className="text-xs">{a.summary}</p>
                        <p className="mt-2 font-mono text-[10px] text-faint">
                          {a.user} · {format(new Date(a.date), "MMM d, yyyy · HH:mm")}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 font-mono text-[10px]">
                          <span className="text-destructive">
                            − {a.before || "No previous version"}
                          </span>
                          <span className="text-success">+ {a.after}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="History begins here"
                    description="Future updates will appear in this record’s timeline."
                  />
                )}
              </>
            )}
            {tab === "Comments / Notes" && (
              <div>
                <div className="space-y-4">
                  {r.notes.map((n, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-border p-4"
                    >
                      <Avatar name={n.author} />
                      <div>
                        <p className="text-xs leading-6">{n.text}</p>
                        <p className="micro mt-2">
                          {n.author} · {format(new Date(n.date), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <textarea
                  aria-label="Add a note"
                  className="field mt-5"
                  rows={4}
                  placeholder="Add context, observations, or a review note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  className="mt-3"
                  disabled={!note.trim()}
                  onClick={() => {
                    update(
                      {
                        notes: [
                          ...r.notes,
                          {
                            text: note,
                            author: db?.profile.name ?? "Kavindu Jayasinghe",
                            date: new Date().toISOString(),
                          },
                        ],
                      },
                      "Note added",
                    );
                    setNote("");
                  }}
                >
                  <MessageSquare />
                  Add note
                </Button>
              </div>
            )}
          </div>
        </section>
        <aside className="panel h-fit space-y-5 p-5">
          <h2 className="section-title">Record information</h2>
          <div>
            <span className="micro">Owner</span>
            <div className="mt-2 flex items-center gap-2">
              <Avatar name={r.owner} />
              <span className="text-xs">{r.owner}</span>
            </div>
          </div>
          {[
            ["Category", r.category],
            ["Created", format(new Date(r.createdAt), "MMM d, yyyy")],
            ["Updated", format(new Date(r.updatedAt), "MMM d, yyyy")],
            ["Review date", r.reviewDate],
            ["Priority", r.priority],
            ["Confidence", `${r.confidence}%`],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="micro">{label}</span>
              <p className="mt-1.5 text-xs text-muted-foreground">{value}</p>
            </div>
          ))}
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <progress value={r.confidence} max={100} className="h-1.5 w-full accent-signal" />
          </div>
          <div>
            <span className="micro">Tags</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {r.tags.map((t) => (
                <TagChip key={t}>{t}</TagChip>
              ))}
            </div>
          </div>
        </aside>
      </div>
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        onConfirm={() =>
          mutation.mutate(
            { action: "delete", id },
            {
              onSuccess: () => {
                toast.success("Record deleted");
                navigate({ to: "/" + module });
              },
            },
          )
        }
      />
      <Dialog open={!!approval} onOpenChange={(v) => !v && setApproval("")}>
        <DialogContent className="responsive-dialog bg-card">
          <DialogTitle>{approval} decision</DialogTitle>
          <DialogDescription>Add a comment to the permanent approval history.</DialogDescription>
          <textarea
            aria-label="Approval comment"
            rows={4}
            className="field"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Reason for this decision…"
          />
          <Button
            disabled={!comment.trim()}
            onClick={() => {
              update(
                {
                  status: approval === "Approve" ? "Approved" : "Rejected",
                  approvals: [
                    ...r.approvals,
                    {
                      action: approval === "Approve" ? "Approved" : "Rejected",
                      comment,
                      date: new Date().toISOString(),
                      user: db?.profile.name ?? "Kavindu Jayasinghe",
                    },
                  ],
                },
                `Decision ${approval === "Approve" ? "approved" : "rejected"}`,
              );
              setApproval("");
              setComment("");
            }}
          >
            Confirm {approval.toLowerCase()}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
function Info({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="section-title mb-3">{title}</h2>
      <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{text}</p>
    </div>
  );
}
function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split("\n").map((line, i) =>
        line.startsWith("## ") ? (
          <h2 className="section-title pt-3" key={i}>
            {line.slice(3)}
          </h2>
        ) : (
          <p key={i} className="text-sm leading-7 text-muted-foreground">
            {line}
          </p>
        ),
      )}
    </div>
  );
}
