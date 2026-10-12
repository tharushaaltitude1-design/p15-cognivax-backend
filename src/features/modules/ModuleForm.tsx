import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Save,
  ArrowLeft,
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Upload,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  PageHeader,
  Field,
  LoadingSkeletons,
  TagChip,
  SearchInput,
  StatusBadge,
} from "@/components/common/primitives";
import { modules, categories } from "@/config/modules";
import { useRecord, useRecordMutation, useWorkspace } from "@/services/repository";
import type { BaseRecord, ModuleKey } from "@/types/domain";
import { toast } from "sonner";
const schema = z.object({
  title: z.string().min(5, "Use at least 5 characters").max(160),
  summary: z.string().min(10, "Use at least 10 characters").max(600),
  content: z.string(),
  category: z.string().min(1),
  owner: z.string().min(1),
  status: z.string(),
  reviewDate: z.string(),
  confidence: z.coerce.number().min(0).max(100),
  priority: z.string(),
  source: z.string(),
  sourceUrl: z.union([z.literal(""), z.string().url("Enter a valid URL")]),
  sourceType: z.string(),
  objective: z.string(),
  context: z.string(),
  assumptions: z.string(),
  outcome: z.string(),
  alternatives: z.string(),
  impact: z.string(),
  effectiveDate: z.string(),
  condition: z.string(),
  action: z.string(),
});
type Values = z.infer<typeof schema>;
export function ModuleForm({ module, id }: { module: ModuleKey; id?: string }) {
  const config = modules[module];
  const navigate = useNavigate();
  const { data: db } = useWorkspace();
  const { data: record, isLoading } = useRecord(module, id ?? "");
  const mutation = useRecordMutation(module);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([]);
  const [picker, setPicker] = useState(false);
  const [query, setQuery] = useState("");
  const [extraDirty, setExtraDirty] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      category: "AI governance",
      owner: "",
      status: config.statuses[0] ?? "Draft",
      reviewDate: "2026-10-30",
      confidence: 85,
      priority: "Medium",
      source: "",
      sourceUrl: "",
      sourceType: "Document",
      objective: "",
      context: "",
      assumptions: "",
      outcome: "",
      alternatives: "",
      impact: "Medium",
      effectiveDate: "2026-10-15",
      condition: "",
      action: "",
    },
  });
  useEffect(() => {
    if (record && id) {
      reset(record);
      setTags(record.tags);
      setLinks(record.links);
      setSteps(record.steps);
      setAttachments(record.attachments);
    }
  }, [record, id, reset]);
  useEffect(() => {
    if (!id && db?.profile.name) setValue("owner", db.profile.name);
  }, [db?.profile.name, id, setValue]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty || extraDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, extraDirty]);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target.closest("a") : null;
      if (
        target &&
        (isDirty || extraDirty) &&
        !window.confirm("Leave without saving your changes?")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [isDirty, extraDirty]);
  const submit = (values: Values, draft = false) =>
    mutation.mutate(
      {
        action: id ? "update" : "create",
        ...(id ? { id } : {}),
        data: {
          ...values,
          status: draft ? "Draft" : values.status,
          tags,
          links,
          steps,
          attachments,
        },
      },
      {
        onSuccess: (r) => {
          reset(values);
          setExtraDirty(false);
          toast.success(draft ? "Draft saved" : "Record saved");
          if (r) navigate({ to: "/" + module + "/$id", params: { id: r.id } });
        },
        onError: (e) => toast.error(e.message),
      },
    );
  const input = (name: keyof Values, label: string, type = "text") => (
    <Field label={label} error={errors[name]?.message}>
      <input type={type} className="field" {...register(name)} />
    </Field>
  );
  const textarea = (name: keyof Values, label: string, rows = 4) => (
    <Field label={label} error={errors[name]?.message}>
      <textarea className="field resize-y" rows={rows} {...register(name)} />
    </Field>
  );
  if (id && isLoading) return <LoadingSkeletons />;
  return (
    <>
      <PageHeader
        title={`${id ? "Edit" : "New"} ${config.singular}`}
        description="Document the context. Connect the evidence. Build a clear record."
        eyebrow={`${config.label} / ${id ?? "New record"}`}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              if (!(isDirty || extraDirty) || window.confirm("Discard unsaved changes?"))
                navigate({ to: "/" + module });
            }}
          >
            <ArrowLeft />
            Back
          </Button>
        }
      />
      <form onSubmit={handleSubmit((v) => submit(v))} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="panel space-y-5 p-5 sm:p-6">
              <h2 className="section-title">Record details</h2>
              {input(
                "title",
                module === "decisions"
                  ? "Decision statement"
                  : module === "rules"
                    ? "Rule name"
                    : "Title",
              )}
              {textarea("summary", "Summary", 3)}
              <span className="micro -mt-3 block text-right">
                {watch("summary")?.length ?? 0} / 600
              </span>
              {module === "knowledge" && (
                <>
                  {textarea("content", "Full content · Markdown", 10)}
                  <p className="micro text-right">{watch("content")?.length ?? 0} characters</p>
                </>
              )}
              {module === "reasoning" && (
                <>
                  {textarea("objective", "Objective", 3)}
                  {textarea("context", "Context", 3)}
                  {textarea("assumptions", "Assumptions", 3)}
                </>
              )}
              {module === "decisions" && (
                <>
                  {textarea("content", "Rationale", 6)}
                  {textarea("alternatives", "Alternatives considered", 4)}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {input("effectiveDate", "Effective date", "date")}
                    <Field label="Impact level">
                      <select className="field" {...register("impact")}>
                        {["Low", "Medium", "High"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              )}
              {module === "evidence" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {input("source", "Source name")}
                    <Field label="Source type">
                      <select className="field" {...register("sourceType")}>
                        {["Document", "Dataset", "Interview", "Report", "Metric"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  {input("sourceUrl", "Source URL", "url")}
                  {textarea("content", "Findings", 5)}
                </>
              )}
              {module === "rules" && (
                <div className="grid gap-4">
                  <div className="rounded-xl border border-signal/20 bg-signal/5 p-4">
                    <span className="micro text-signal">IF · Condition</span>
                    <input
                      className="field mt-2 font-mono"
                      placeholder="risk_score > 80"
                      {...register("condition")}
                    />
                  </div>
                  <div className="rounded-xl border border-border bg-elevated p-4">
                    <span className="micro">THEN · Outcome</span>
                    <textarea
                      className="field mt-2"
                      rows={3}
                      {...register("action")}
                      placeholder="Route to manual review"
                    />
                  </div>
                </div>
              )}
            </section>
            {module === "reasoning" && (
              <section className="panel p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="section-title">Reasoning steps</h2>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSteps((s) => [...s, ""]);
                      setExtraDirty(true);
                    }}
                  >
                    <Plus />
                    Add step
                  </Button>
                </div>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-2"
                    >
                      <span className="mt-3 font-mono text-xs text-signal">{i + 1}</span>
                      <textarea
                        aria-label={`Reasoning step ${i + 1}`}
                        className="field"
                        value={step}
                        onChange={(e) => {
                          setSteps((s) => s.map((v, j) => (j === i ? e.target.value : v)));
                          setExtraDirty(true);
                        }}
                      />
                      <div className="flex flex-col">
                        <Button
                          type="button"
                          aria-label={`Move step ${i + 1} up`}
                          disabled={i === 0}
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSteps((s) => {
                              const a = [...s];
                              const prior = a[i - 1];
                              if (prior !== undefined) {
                                a[i - 1] = step;
                                a[i] = prior;
                              }
                              return a;
                            });
                            setExtraDirty(true);
                          }}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          type="button"
                          aria-label={`Remove step ${i + 1}`}
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSteps((s) => s.filter((_, j) => j !== i));
                            setExtraDirty(true);
                          }}
                        >
                          <X />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5">{textarea("outcome", "Outcome / conclusion")}</div>
              </section>
            )}
            {(module === "evidence" || module === "knowledge") && (
              <section className="panel p-5">
                <h2 className="section-title mb-4">
                  {module === "evidence" ? "Attachments" : "Sources"}
                </h2>
                {module === "knowledge" && (
                  <div className="mb-5 grid gap-4 sm:grid-cols-2">
                    {input("source", "Source name")}
                    {input("sourceUrl", "Source URL", "url")}
                  </div>
                )}
                <label
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-muted-foreground"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setAttachments((a) => [
                      ...a,
                      ...Array.from(e.dataTransfer.files).map((f) => ({
                        name: f.name,
                        size: f.size,
                      })),
                    ]);
                    setExtraDirty(true);
                  }}
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Drop files or browse</span>
                  <span className="micro">Attachment metadata only · Demo workspace</span>
                  <input
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      setAttachments((a) => [
                        ...a,
                        ...Array.from(e.target.files ?? []).map((f) => ({
                          name: f.name,
                          size: f.size,
                        })),
                      ]);
                      setExtraDirty(true);
                    }}
                  />
                </label>
                {attachments.map((a, i) => (
                  <div key={i} className="mt-3 flex items-center justify-between text-xs">
                    <span className="truncate">
                      {a.name} · {Math.round(a.size / 1024)} KB
                    </span>
                    <Button
                      type="button"
                      aria-label={`Remove ${a.name}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAttachments((a) => a.filter((_, j) => j !== i));
                        setExtraDirty(true);
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </section>
            )}
          </div>
          <aside className="space-y-6">
            <section className="panel space-y-5 p-5">
              <h2 className="section-title">Metadata</h2>
              <div className="rounded-lg border border-border bg-surface px-3 py-2">
                <span className="micro">Record ID</span>
                <p className="mt-1 font-mono text-xs text-signal">
                  {id ??
                    `${config.prefix}-${String((db?.records.filter((r) => r.module === module).length ?? 20) + 1).padStart(module === "knowledge" ? 5 : 4, "0")}`}
                </p>
              </div>
              <Field label="Status">
                <select className="field" {...register("status")}>
                  {config.statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select className="field" {...register("category")}>
                  {categories.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Owner">
                <select className="field" {...register("owner")}>
                  {Array.from(
                    new Set(
                      [db?.profile.name, ...(db?.team.map((t) => t.name) ?? [])].filter(
                        (name): name is string => Boolean(name),
                      ),
                    ),
                  ).map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </Field>
              {input("reviewDate", "Review date", "date")}
              <Field
                label={module === "evidence" ? "Reliability score (%)" : "Confidence (%)"}
                error={errors.confidence?.message}
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="field"
                  {...register("confidence")}
                />
              </Field>
              {(module === "reasoning" || module === "rules") && (
                <Field label="Priority">
                  <select className="field" {...register("priority")}>
                    {["Low", "Medium", "High", "Critical"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Tags">
                <div className="mb-2 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1">
                      <TagChip>{t}</TagChip>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        aria-label={`Remove tag ${t}`}
                        onClick={() => {
                          setTags(tags.filter((v) => v !== t));
                          setExtraDirty(true);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
                <input
                  className="field"
                  placeholder="Add tag, then Enter"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      if (tag.trim()) {
                        setTags([...new Set([...tags, tag.trim()])]);
                        setTag("");
                        setExtraDirty(true);
                      }
                    }
                  }}
                />
              </Field>
            </section>
            <section className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Linked records</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Link records"
                  onClick={() => setPicker(true)}
                >
                  <Link2 />
                </Button>
              </div>
              {links.length ? (
                links.map((link) => (
                  <div key={link} className="mb-2 flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="font-mono text-[10px] text-signal">{link}</span>
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                        {db?.records.find((r) => r.id === link)?.title}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Unlink ${link}`}
                      onClick={() => {
                        setLinks((l) => l.filter((v) => v !== link));
                        setExtraDirty(true);
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-faint">No linked records</p>
              )}
              <Button
                type="button"
                variant="secondary"
                className="mt-4 w-full text-xs"
                onClick={() => setPicker(true)}
              >
                <Plus />
                Link a record
              </Button>
            </section>
          </aside>
        </div>
        <div className="sticky bottom-16 z-10 flex flex-wrap justify-end gap-3 rounded-xl border border-border bg-surface/95 p-4 backdrop-blur-md md:bottom-4">
          <Button
            type="button"
            variant="secondary"
            disabled={mutation.isPending}
            onClick={handleSubmit((v) => submit(v, true))}
          >
            Save draft
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            <Save />
            {mutation.isPending ? "Saving…" : "Save record"}
          </Button>
        </div>
      </form>
      <Dialog open={picker} onOpenChange={setPicker}>
        <DialogContent className="responsive-dialog bg-card">
          <DialogTitle>Link records</DialogTitle>
          <DialogDescription>
            Connect knowledge, cases, evidence, decisions and rules.
          </DialogDescription>
          <SearchInput value={query} onChange={setQuery} />
          <div className="max-h-[45dvh] space-y-2 overflow-auto">
            {db?.records
              .filter(
                (r) =>
                  r.id !== id && `${r.title} ${r.id}`.toLowerCase().includes(query.toLowerCase()),
              )
              .map((r) => (
                <label
                  key={r.id}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border p-3"
                >
                  <input
                    type="checkbox"
                    checked={links.includes(r.id)}
                    onChange={(e) => {
                      setLinks((l) =>
                        e.target.checked ? [...l, r.id] : l.filter((v) => v !== r.id),
                      );
                      setExtraDirty(true);
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs">{r.title}</span>
                    <span className="font-mono text-[9px] text-faint">{r.id}</span>
                  </span>
                </label>
              ))}
          </div>
          <Button onClick={() => setPicker(false)}>Done · {links.length} linked</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
