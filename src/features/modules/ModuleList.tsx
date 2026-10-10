import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Download,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  PageHeader,
  StatusBadge,
  Avatar,
  SearchInput,
  EmptyState,
  LoadingSkeletons,
  ConfirmDialog,
  RowActions,
  TagChip,
} from "@/components/common/primitives";
import { modules, categories } from "@/config/modules";
import { useRecords, useWorkspace, useRecordMutation, exportCSV } from "@/services/repository";
import type { BaseRecord, ModuleKey } from "@/types/domain";
import { format } from "date-fns";
import { toast } from "sonner";
export function ModuleList({ module }: { module: ModuleKey }) {
  const config = modules[module];
  const navigate = useNavigate();
  const { data: db } = useWorkspace();
  const mutation = useRecordMutation(module);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [owner, setOwner] = useState("");
  const [tag, setTag] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [view, setView] = useState("All records");
  const [cards, setCards] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("updated");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string[]>([]);
  const [filters, setFilters] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  const {
    data: rows = [],
    isLoading,
    isError,
    refetch,
  } = useRecords(module, {
    search: debounced,
    status,
    category,
    owner: view === "Mine" ? (db?.profile.name ?? "Kavindu Jayasinghe") : owner,
    tag,
    from,
    to,
  });
  const sorted = useMemo(
    () =>
      [...rows]
        .sort((a, b) =>
          sort === "title"
            ? a.title.localeCompare(b.title)
            : b.updatedAt.localeCompare(a.updatedAt),
        )
        .filter((r) => view !== "Recently updated" || r.updatedAt > "2026-10-05"),
    [rows, sort, view],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / 8));
  const visible = sorted.slice((Math.min(page, pages) - 1) * 8, Math.min(page, pages) * 8);
  const all = db?.records.filter((r) => r.module === module) ?? [];
  const open = (r: BaseRecord, edit = false) =>
    navigate({ to: "/" + module + (edit ? "/$id/edit" : "/$id"), params: { id: r.id } });
  function action(r: BaseRecord, a: string) {
    if (a === "View" || a === "Edit") {
      open(r, a === "Edit");
      return;
    }
    if (a === "Delete") {
      setDeleting([r.id]);
      return;
    }
    mutation.mutate(
      a === "Duplicate"
        ? { action: "create", data: { ...r, title: r.title + " (copy)", status: "Draft" } }
        : { action: "update", id: r.id, data: { status: "Archived" } },
      {
        onSuccess: (result) => {
          toast.success(a === "Duplicate" ? "Record duplicated" : "Record archived");
          if (result && a === "Duplicate") open(result);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  }
  const filterControls = (
    <>
      <select
        aria-label="Filter by status"
        className="field"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
      >
        <option value="">All statuses</option>
        {config.statuses.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select
        aria-label="Filter by category"
        className="field"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setPage(1);
        }}
      >
        <option value="">All categories</option>
        {categories.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select
        aria-label="Filter by owner"
        className="field"
        value={owner}
        onChange={(e) => {
          setOwner(e.target.value);
          setPage(1);
        }}
      >
        <option value="">All owners</option>
        {db?.team.map((t) => (
          <option key={t.id}>{t.name}</option>
        ))}
      </select>
      <select
        aria-label="Filter by tag"
        className="field"
        value={tag}
        onChange={(e) => {
          setTag(e.target.value);
          setPage(1);
        }}
      >
        <option value="">All tags</option>
        {[...new Set(all.flatMap((r) => r.tags))].map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <label className="text-xs text-muted-foreground">
        From
        <input
          type="date"
          aria-label="Updated from"
          className="field mt-1"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </label>
      <label className="text-xs text-muted-foreground">
        To
        <input
          type="date"
          aria-label="Updated to"
          className="field mt-1"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </label>
    </>
  );
  return (
    <>
      <PageHeader
        title={config.label}
        description={config.description}
        eyebrow="Workspace / Intelligence"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                exportCSV(
                  sorted.map(({ id, title, status, owner, category, updatedAt }) => ({
                    id,
                    title,
                    status,
                    owner,
                    category,
                    updatedAt,
                  })),
                  `${module}.csv`,
                )
              }
            >
              <Download />
              Export CSV
            </Button>
            <Button onClick={() => navigate({ to: "/" + module + "/new" })}>
              <Plus />
              New {config.singular}
            </Button>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {config.statuses.slice(0, 4).map((s) => (
          <div key={s} className="panel p-4">
            <p className="micro">{s}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-display text-2xl font-bold">
                {all.filter((r) => r.status === s).length}
              </span>
              <StatusBadge status={s} />
            </div>
          </div>
        ))}
      </div>
      <div className="panel overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap gap-1">
              {["All records", "Mine", "Recently updated"].map((v) => (
                <Button
                  variant={v === view ? "secondary" : "ghost"}
                  size="sm"
                  key={v}
                  onClick={() => {
                    setView(v);
                    setPage(1);
                  }}
                  className={v === view ? "text-signal" : "text-faint"}
                >
                  {v}
                </Button>
              ))}
            </div>
            <div className="flex shrink-0">
              <Button
                aria-label="Table view"
                variant={cards ? "ghost" : "secondary"}
                size="icon"
                onClick={() => setCards(false)}
              >
                <List />
              </Button>
              <Button
                aria-label="Card view"
                variant={cards ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setCards(true)}
              >
                <LayoutGrid />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={`Search ${config.label.toLowerCase()}…`}
            />
            <Button variant="secondary" onClick={() => setFilters(true)}>
              <SlidersHorizontal />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
          <div className="mt-3 hidden grid-cols-4 gap-2 lg:grid">
            {filterControls.props.children.slice(0, 4)}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-faint">
              {sorted.length} records
              {(status || category || owner || tag || from || to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 text-[10px] text-signal"
                  onClick={() => {
                    setStatus("");
                    setCategory("");
                    setOwner("");
                    setTag("");
                    setFrom("");
                    setTo("");
                  }}
                >
                  Clear filters
                  <X className="h-3 w-3" />
                </Button>
              )}
            </span>
            <select
              aria-label="Sort records"
              className="bg-transparent text-[10px] text-muted-foreground"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="updated">Recently updated</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-signal/5 px-4 py-2">
            <span className="mr-auto text-xs text-signal">{selected.length} selected</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                selected.forEach((id) =>
                  mutation.mutate({ action: "update", id, data: { status: "Archived" } }),
                );
                setSelected([]);
                toast.success("Selected records archived");
              }}
            >
              Archive
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleting(selected)}>
              Delete
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Clear selection"
              onClick={() => setSelected([])}
            >
              <X />
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="p-5">
            <LoadingSkeletons />
          </div>
        ) : isError ? (
          <EmptyState
            title="Could not load records"
            action={<Button onClick={() => refetch()}>Retry</Button>}
          />
        ) : !visible.length ? (
          <EmptyState
            action={
              <Button onClick={() => navigate({ to: "/" + module + "/new" })}>
                <Plus />
                New {config.singular}
              </Button>
            }
          />
        ) : (
          <>
            <div className={cards ? "hidden" : "hidden md:block"}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8">
                      <input
                        type="checkbox"
                        aria-label="Select all visible records"
                        checked={visible.every((r) => selected.includes(r.id))}
                        onChange={(e) =>
                          setSelected(e.target.checked ? visible.map((r) => r.id) : [])
                        }
                      />
                    </th>
                    <th>Record</th>
                    <th>Status</th>
                    <th className="hidden xl:table-cell">Category</th>
                    <th>Owner</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${r.title}`}
                          checked={selected.includes(r.id)}
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [...selected, r.id]
                                : selected.filter((id) => id !== r.id),
                            )
                          }
                        />
                      </td>
                      <td className="max-w-[300px]">
                        <Button
                          variant="ghost"
                          className="h-auto max-w-full justify-start whitespace-normal p-0 text-left text-xs"
                          onClick={() => open(r)}
                        >
                          {r.title}
                        </Button>
                        <div className="mt-1 font-mono text-[9px] text-faint">{r.id}</div>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="hidden xl:table-cell">
                        <span className="text-[10px] text-muted-foreground">{r.category}</span>
                      </td>
                      <td>
                        <Avatar name={r.owner} />
                      </td>
                      <td className="whitespace-nowrap text-faint">
                        {format(new Date(r.updatedAt), "MMM d")}
                      </td>
                      <td>
                        <RowActions onAction={(a) => action(r, a)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className={
                cards ? "grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-3 p-4 md:hidden"
              }
            >
              {visible.map((r) => (
                <article key={r.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-faint">{r.id}</span>
                    <RowActions onAction={(a) => action(r, a)} />
                  </div>
                  <Button
                    variant="ghost"
                    className="mb-3 h-auto w-full justify-start whitespace-normal px-0 text-left"
                    onClick={() => open(r)}
                  >
                    {r.title}
                  </Button>
                  <StatusBadge status={r.status} />
                  <p className="my-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {r.summary}
                  </p>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.owner} />
                      <span className="text-[10px] text-faint">{r.owner.split(" ")[0]}</span>
                    </div>
                    <span className="text-[10px] text-faint">{r.category}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-[10px] text-faint">
            Page {Math.min(page, pages)} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next page"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
      <Sheet open={filters} onOpenChange={setFilters}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-auto rounded-t-xl">
          <SheetTitle>Filter {config.label.toLowerCase()}</SheetTitle>
          <SheetDescription>Narrow records by status, ownership, tags and dates.</SheetDescription>
          <div className="my-5 grid gap-3 sm:grid-cols-2">{filterControls}</div>
          <Button onClick={() => setFilters(false)}>Apply filters</Button>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={deleting.length > 0}
        onOpenChange={(v) => !v && setDeleting([])}
        title={`Delete ${deleting.length} record${deleting.length === 1 ? "" : "s"}?`}
        description="Records and their cross-links will be removed from this demo workspace."
        onConfirm={() => {
          deleting.forEach((id) => mutation.mutate({ action: "delete", id }));
          setSelected([]);
          setDeleting([]);
          toast.success("Records deleted");
        }}
      />
    </>
  );
}
