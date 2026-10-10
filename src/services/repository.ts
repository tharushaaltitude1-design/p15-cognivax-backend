import { doc, getDoc, setDoc } from "firebase/firestore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { makeSeed, dashboardSeries } from "@/data/seed";
import { modules } from "@/config/modules";
import { getFirebaseFirestore } from "@/lib/firebase/firestore";
import { isBrowser } from "@/lib/firebase/config";
import type {
  AppSettings,
  BaseRecord,
  Database,
  ModuleKey,
  UserProfile,
  ExceptionRecord,
} from "@/types/domain";

/**
 * Storage layer for the workspace.
 *
 * When a user is signed in the whole workspace document is persisted to
 * Cloud Firestore at `users/{uid}` (created from the demo seed the first time
 * a user signs in, so no account starts empty). When no user is active — SSR
 * or unit tests — it transparently falls back to the original localStorage
 * demo store so the app keeps working without a backend.
 */
let database: Database | undefined;
let workspaceUid: string | null = null;
let loadedUid: string | null = null;
let loadPromise: Promise<Database> | null = null;
const LOCAL_KEY = "cognivax-demo-v1";

/** Points the storage layer at a signed-in user's Firestore workspace. `null` restores demo mode. */
export function setWorkspaceUser(uid: string | null): void {
  if (uid === workspaceUid) return;
  workspaceUid = uid;
  loadedUid = null;
  loadPromise = null;
  database = undefined;
}

function isRemote(): boolean {
  return workspaceUid !== null;
}

function readLocal(): Database | undefined {
  if (!isBrowser) return undefined;
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) return JSON.parse(stored) as Database;
  } catch {
    /* seed remains valid */
  }
  return undefined;
}

function getDatabase(): Database {
  if (!database) database = readLocal() ?? makeSeed();
  return database;
}

async function loadRemote(uid: string): Promise<Database> {
  const ref = doc(getFirebaseFirestore(), "users", uid);
  const snapshot = await getDoc(ref);
  const payload = snapshot.data() as { data?: Database } | undefined;
  if (snapshot.exists() && payload?.data) return payload.data;
  const seed = makeSeed();
  await setDoc(ref, { data: seed, seededAt: new Date().toISOString() });
  return seed;
}

/** Resolves the active workspace, seeding Firestore on a user's very first sign-in. */
async function ensureLoaded(): Promise<Database> {
  if (isRemote()) {
    if (loadedUid === workspaceUid && database) return database;
    if (!loadPromise) {
      const uid = workspaceUid as string;
      loadPromise = loadRemote(uid)
        .then((loaded) => {
          database = loaded;
          loadedUid = uid;
          return loaded;
        })
        .catch((error) => {
          loadPromise = null;
          throw error;
        });
    }
    return loadPromise;
  }
  if (!database) database = readLocal() ?? makeSeed();
  return database;
}

async function persist(): Promise<void> {
  const current = getDatabase();
  if (isRemote()) {
    const ref = doc(getFirebaseFirestore(), "users", workspaceUid as string);
    await setDoc(ref, { data: current, updatedAt: new Date().toISOString() });
    return;
  }
  if (isBrowser) localStorage.setItem(LOCAL_KEY, JSON.stringify(current));
}

const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 240));

export interface ListQuery {
  search?: string;
  status?: string;
  owner?: string;
  category?: string;
  tag?: string;
  from?: string;
  to?: string;
}

export interface Repository<T> {
  list(query?: ListQuery): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(input: Partial<T>): Promise<T>;
  update(id: string, input: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

function audit(record: BaseRecord, action: string, before = "") {
  const db = getDatabase();
  const date = new Date().toISOString();
  db.activity.unshift({
    id: `ACT-${Date.now()}-${db.activity.length}`,
    module: record.module,
    action,
    summary: `${record.title} ${action}`,
    recordId: record.id,
    user: db.profile.name,
    date,
    before,
    after: record.status,
  });
  if (["status changed", "approved", "rejected", "archived"].includes(action))
    db.notifications.unshift({
      id: `NTF-${Date.now()}`,
      title: `${modules[record.module].short} ${action}`,
      description: record.title,
      type: action === "approved" || action === "rejected" ? "Approvals" : "System",
      read: false,
      date,
      recordId: record.id,
    });
}

export class LocalRepository implements Repository<BaseRecord> {
  constructor(public module: ModuleKey) {}

  async list(query: ListQuery = {}) {
    await ensureLoaded();
    await delay();
    return getDatabase().records.filter(
      (r) =>
        r.module === this.module &&
        (!query.search ||
          `${r.title} ${r.id} ${r.tags.join(" ")}`
            .toLowerCase()
            .includes(query.search.toLowerCase())) &&
        (!query.status || r.status === query.status) &&
        (!query.owner || r.owner === query.owner) &&
        (!query.category || r.category === query.category) &&
        (!query.tag || r.tags.includes(query.tag)) &&
        (!query.from || r.updatedAt >= query.from) &&
        (!query.to || r.updatedAt.slice(0, 10) <= query.to),
    );
  }

  async getById(id: string) {
    await ensureLoaded();
    await delay();
    return getDatabase().records.find((r) => r.id === id);
  }

  async create(input: Partial<BaseRecord>) {
    await ensureLoaded();
    await delay();
    const db = getDatabase();
    const max = Math.max(
      0,
      ...db.records
        .filter((r) => r.module === this.module)
        .map((r) => Number(r.id.split("-").at(-1))),
    );
    const seed = makeSeed().records.find((r) => r.module === this.module);
    if (!seed) throw new Error("Unknown module");
    const now = new Date().toISOString();
    const record: BaseRecord = {
      ...seed,
      ...input,
      id: `${modules[this.module].prefix}-${String(max + 1).padStart(this.module === "knowledge" ? 5 : 4, "0")}`,
      module: this.module,
      createdAt: now,
      updatedAt: now,
      notes: [],
      approvals: [],
      version: 1,
    };
    db.records.unshift(record);
    audit(record, "created");
    await persist();
    return record;
  }

  async update(id: string, input: Partial<BaseRecord>) {
    await ensureLoaded();
    await delay();
    const record = getDatabase().records.find((r) => r.id === id);
    if (!record) throw new Error("Record not found");
    const before = record.status;
    Object.assign(record, input, { updatedAt: new Date().toISOString() });
    audit(record, input.status && input.status !== before ? "status changed" : "updated", before);
    await persist();
    return record;
  }

  async remove(id: string) {
    await ensureLoaded();
    await delay();
    const db = getDatabase();
    const record = db.records.find((r) => r.id === id);
    if (record) audit(record, "deleted", record.status);
    db.records = db.records.filter((r) => r.id !== id);
    for (const r of db.records) r.links = r.links.filter((link) => link !== id);
    await persist();
  }
}

export const repositories = {
  knowledge: new LocalRepository("knowledge"),
  reasoning: new LocalRepository("reasoning"),
  evidence: new LocalRepository("evidence"),
  decisions: new LocalRepository("decisions"),
  rules: new LocalRepository("rules"),
};

export const workspaceService = {
  async get() {
    await ensureLoaded();
    await delay();
    return structuredClone(getDatabase());
  },
  async updateProfile(input: Partial<UserProfile>) {
    await ensureLoaded();
    Object.assign(getDatabase().profile, input);
    await persist();
  },
  async updateSettings(input: Partial<AppSettings>) {
    await ensureLoaded();
    Object.assign(getDatabase().settings, input);
    await persist();
  },
  async notification(id: string, action: "read" | "unread" | "delete") {
    await ensureLoaded();
    const db = getDatabase();
    if (action === "delete") db.notifications = db.notifications.filter((n) => n.id !== id);
    else {
      const n = db.notifications.find((n) => n.id === id);
      if (n) n.read = action === "read";
    }
    await persist();
  },
  async markAllRead() {
    await ensureLoaded();
    getDatabase().notifications.forEach((n) => (n.read = true));
    await persist();
  },
  async exception(input: Partial<ExceptionRecord>, id?: string) {
    await ensureLoaded();
    const db = getDatabase();
    const existing = db.exceptions.find((e) => e.id === id);
    if (existing) Object.assign(existing, input);
    else
      db.exceptions.unshift({
        id: `EXC-${Date.now()}`,
        title: "",
        description: "",
        severity: "Medium",
        status: "Open",
        assignee: db.profile.name,
        date: new Date().toISOString(),
        resolution: "",
        ...input,
      });
    const title = existing?.title ?? input.title ?? "Exception";
    db.activity.unshift({
      id: `ACT-${Date.now()}`,
      module: "governance",
      action: existing ? "updated" : "created",
      summary: `Exception ${title} ${existing ? "updated" : "created"}`,
      recordId: existing?.id ?? db.exceptions[0]?.id ?? "",
      user: db.profile.name,
      date: new Date().toISOString(),
      before: "",
      after: input.status ?? "Open",
    });
    db.notifications.unshift({
      id: `NTF-${Date.now()}`,
      title: existing ? "Exception updated" : "New governance exception",
      description: title,
      type: "Exceptions",
      read: false,
      date: new Date().toISOString(),
      recordId: "",
    });
    await persist();
  },
  async search(term: string) {
    await ensureLoaded();
    await delay();
    return getDatabase().records.filter((r) =>
      `${r.title} ${r.id} ${r.summary} ${r.tags.join(" ")}`
        .toLowerCase()
        .includes(term.toLowerCase()),
    );
  },
  async saveSearch(term: string) {
    await ensureLoaded();
    const db = getDatabase();
    db.recentSearches = [term, ...db.recentSearches.filter((s) => s !== term)].slice(0, 6);
    await persist();
  },
  async reset() {
    await ensureLoaded();
    database = makeSeed();
    loadedUid = workspaceUid;
    await persist();
  },
  export() {
    return JSON.stringify(getDatabase(), null, 2);
  },
  async import(text: string) {
    await ensureLoaded();
    const parsed: unknown = JSON.parse(text);
    if (
      typeof parsed !== "object" ||
      !parsed ||
      !("records" in parsed) ||
      !("settings" in parsed) ||
      !("profile" in parsed) ||
      !("team" in parsed) ||
      !("activity" in parsed) ||
      !("notifications" in parsed) ||
      !("exceptions" in parsed)
    )
      throw new Error("Invalid Cognivax export");
    const candidate = parsed as Database;
    if (
      !Array.isArray(candidate.records) ||
      !candidate.records.every((r) => r.id && r.title && r.module in modules)
    )
      throw new Error("Invalid records");
    database = candidate;
    loadedUid = workspaceUid;
    await persist();
  },
  charts() {
    return dashboardSeries;
  },
};

export const useWorkspace = () =>
  useQuery({ queryKey: ["workspace"], queryFn: () => workspaceService.get() });

export const useRecords = (module: ModuleKey, query: ListQuery = {}) =>
  useQuery({
    queryKey: ["records", module, query],
    queryFn: () => repositories[module].list(query),
  });

export const useRecord = (module: ModuleKey, id: string) =>
  useQuery({ queryKey: ["record", module, id], queryFn: () => repositories[module].getById(id) });

export function useWorkspaceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: () => Promise<unknown>) => task(),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useRecordMutation(module: ModuleKey) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      action: "create" | "update" | "delete";
      id?: string;
      data?: Partial<BaseRecord>;
    }) => {
      if (input.action === "create") return repositories[module].create(input.data ?? {});
      if (!input.id) throw new Error("Missing record ID");
      if (input.action === "delete") return repositories[module].remove(input.id);
      return repositories[module].update(input.id, input.data ?? {});
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function download(text: string, name: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCSV(rows: object[], name: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0] ?? {});
  const csv = [
    keys.join(","),
    ...rows.map((row) =>
      keys
        .map((k) => '"' + String(Reflect.get(row, k) ?? "").replaceAll('"', '""') + '"')
        .join(","),
    ),
  ].join("\n");
  download(csv, name, "text/csv");
}
