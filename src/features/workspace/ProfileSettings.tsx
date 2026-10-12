import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import {
  Save,
  Upload,
  Download,
  Trash2,
  Copy,
  ShieldCheck,
  Loader2,
  Bell,
  Palette,
  Database,
  Plug,
  Keyboard,
  Info,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Avatar,
  ConfirmDialog,
  Field,
  LoadingSkeletons,
  PageHeader,
  StatusBadge,
} from "@/components/common/primitives";
import {
  useWorkspace,
  useWorkspaceMutation,
  workspaceService,
  download,
} from "@/services/repository";
import { moduleKeys, modules } from "@/config/modules";
import type { AppSettings } from "@/types/domain";
import { format } from "date-fns";
import { toast } from "sonner";
import { SecurityPanel } from "@/features/auth/components/SecurityPanel";
import { getAuthErrorMessage } from "@/features/auth/authErrors";
import { updateUserProfile } from "@/features/auth/authService";
import { useAuth } from "@/features/auth/useAuth";

const AVATAR_SIZE = 128;

async function resizeAvatar(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("read"));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("decode"));
    element.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  const scale = Math.min(AVATAR_SIZE / image.width, AVATAR_SIZE / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, (AVATAR_SIZE - width) / 2, (AVATAR_SIZE - height) / 2, width, height);
  return canvas.toDataURL("image/jpeg", 0.8);
}
export function ProfilePage() {
  const { data: db, isLoading } = useWorkspace();
  const mutation = useWorkspaceMutation();
  const { user, emailVerified, refreshUser, providerIds } = useAuth();
  const hasGoogle = providerIds.includes("google.com");
  const googleManaged = hasGoogle;
  const [tab, setTab] = useState("Personal Info");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (db) {
      setTitle(db.profile.title);
      setDepartment(db.profile.department);
      setBio(db.profile.bio);
    }
  }, [db]);
  useEffect(() => {
    setName(user?.displayName ?? user?.email?.split("@")[0] ?? "");
  }, [user]);
  if (isLoading || !db) return <LoadingSkeletons />;
  const displayName = user?.displayName || user?.email?.split("@")[0] || db.profile.name;
  const email = user?.email ?? db.profile.email;
  const avatar = user?.photoURL ?? db.profile.avatar;
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (!googleManaged) {
        await updateUserProfile({ displayName: name.trim() });
      }
      await mutation.mutateAsync(() =>
        workspaceService.updateProfile({ name: name.trim(), title, department, bio }),
      );
      await refreshUser();
      toast.success("Profile saved");
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  };
  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await resizeAvatar(file);
      await updateUserProfile({ photoURL: dataUrl });
      await mutation.mutateAsync(() => workspaceService.updateProfile({ avatar: dataUrl }));
      await refreshUser();
      toast.success("Profile photo updated");
    } catch (caught) {
      toast.error(getAuthErrorMessage(caught));
    } finally {
      setUploading(false);
    }
  };
  return (
    <>
      <PageHeader
        title="Profile"
        description="Your place in the connected intelligence workspace."
        eyebrow="Account / Personal workspace"
      />
      <section className="panel mb-6 grid gap-5 p-6 sm:grid-cols-[80px_minmax(0,1fr)_auto]">
        <div className="relative w-20">
          <Avatar name={displayName} src={avatar} large signal />
          {!googleManaged && (
            <label
              title="Upload profile photo"
              className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-border bg-elevated"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <input
                aria-label="Upload avatar"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAvatar(file);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="break-words text-xl font-extrabold">{displayName}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{db.profile.title}</p>
          <p className="mt-2 break-all text-xs text-faint">{email}</p>
          <p className="micro mt-3">
            {db.profile.department} · {db.profile.company}
          </p>
          {googleManaged && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-elevated px-2 py-1 text-[10px] text-faint">
              <ShieldCheck className="h-3 w-3 text-signal" />
              Name and photo managed by Google
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status="Active" />
          {emailVerified ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2 py-1 text-[10px] text-success">
              <ShieldCheck className="h-3 w-3" />
              Email verified
            </span>
          ) : (
            <Button asChild variant="ghost" size="sm" className="text-[10px] text-warning">
              <Link to="/verify-email">Verify email</Link>
            </Button>
          )}
        </div>
      </section>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border pb-4">
        {["Personal Info", "Preferences", "Security", "My Activity", "Owned Records"].map((t) => (
          <Button
            key={t}
            variant={tab === t ? "secondary" : "ghost"}
            className={tab === t ? "text-signal" : "text-faint"}
            onClick={() => setTab(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      {tab === "Personal Info" && (
        <form className="panel max-w-4xl space-y-5 p-6" onSubmit={saveProfile}>
          <h2 className="section-title">Personal information</h2>
          {googleManaged && (
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-signal" />
                Managed by Google
              </p>
              <p className="mt-2 text-[11px] leading-6 text-faint">
                Your display name and profile photo are synced from your Google account and can't be
                changed here. To update them, edit your Google profile.
              </p>
            </div>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" error={error}>
              <input
                required
                readOnly={googleManaged}
                disabled={googleManaged}
                className={googleManaged ? "field cursor-not-allowed opacity-70" : "field"}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Email">
              <input
                readOnly
                type="email"
                className="field cursor-not-allowed opacity-70"
                value={email}
              />
            </Field>
            <Field label="Job title">
              <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Department">
              <input
                className="field"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Bio">
            <textarea
              className="field"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </Field>
          <p className="text-[11px] text-faint">
            {googleManaged
              ? "Your Google account is the source of truth for your name and photo. Email and email verification are managed by your sign-in provider and can't be edited here."
              : "Your email address is managed by your sign-in provider and can't be edited here."}
          </p>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save />}
            Save changes
          </Button>
        </form>
      )}
      {tab === "Preferences" && (
        <div className="panel max-w-3xl space-y-5 p-6">
          <h2 className="section-title">Personal preferences</h2>
          <SettingToggle
            title="Reduce motion"
            description="Minimize workspace animations."
            checked={db.settings.reduceMotion}
            onChange={(value) =>
              mutation.mutate(() => workspaceService.updateSettings({ reduceMotion: value }))
            }
          />
          <Field label="Display density">
            <select
              className="field"
              value={db.settings.density}
              onChange={(e) =>
                mutation.mutate(() => workspaceService.updateSettings({ density: e.target.value }))
              }
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </Field>
          <Button asChild variant="secondary">
            <Link to="/settings">All workspace preferences</Link>
          </Button>
        </div>
      )}
      {tab === "Security" && <SecurityPanel />}
      {tab === "My Activity" && (
        <section className="panel p-6">
          {db.activity
            .filter((a) => a.user === db.profile.name)
            .map((a) => (
              <div key={a.id} className="flex gap-3 border-b border-border py-4">
                <Avatar name={a.user} />
                <div>
                  <p className="text-xs leading-6">{a.summary}</p>
                  <span className="micro">{format(new Date(a.date), "MMM d, yyyy · HH:mm")}</span>
                </div>
              </div>
            ))}
        </section>
      )}
      {tab === "Owned Records" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {moduleKeys.map((k) => (
            <Button asChild variant="ghost" className="panel h-auto justify-start p-6" key={k}>
              <Link to={`/${k}`}>
                <Database className="mr-4 h-6 w-6 text-signal" />
                <div>
                  <h2 className="section-title">{modules[k].label}</h2>
                  <p className="mt-3 text-3xl font-bold">
                    {db.records.filter((r) => r.module === k && r.owner === db.profile.name).length}
                  </p>
                  <p className="mt-2 text-xs text-faint">Owned records</p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-b border-border py-4">
      <div className="min-w-0">
        <h3 className="text-xs font-medium">{title}</h3>
        <p className="mt-1 text-[11px] leading-5 text-faint">{description}</p>
      </div>
      <Switch aria-label={title} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
const tabs = [
  { name: "General", icon: SettingsIcon },
  { name: "Notifications", icon: Bell },
  { name: "Appearance", icon: Palette },
  { name: "Data & Privacy", icon: Database },
  { name: "Integrations", icon: Plug },
  { name: "Keyboard Shortcuts", icon: Keyboard },
  { name: "About", icon: Info },
];
export function SettingsPage() {
  const { data: db, isLoading } = useWorkspace();
  const mutation = useWorkspaceMutation();
  const [tab, setTab] = useState("General");
  const [reset, setReset] = useState(false);
  const [workspace, setWorkspace] = useState("Cognivax");
  const [webhook, setWebhook] = useState("");
  const [connected, setConnected] = useState(false);
  const workspaceName = db?.settings.workspace;
  useEffect(() => {
    if (workspaceName) setWorkspace(workspaceName);
  }, [workspaceName]);
  if (isLoading || !db) return <LoadingSkeletons />;
  const settings = db.settings;
  const update = (input: Partial<AppSettings>) =>
    mutation.mutate(() => workspaceService.updateSettings(input), {
      onError: (e) => toast.error(e.message),
    });
  return (
    <>
      <PageHeader
        title="Settings"
        description="Shape your workspace around the way you work."
        eyebrow="Account / Workspace configuration"
      />
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex flex-wrap gap-1 lg:flex-col lg:self-start">
          {tabs.map(({ name, icon: Icon }) => (
            <Button
              key={name}
              variant={tab === name ? "secondary" : "ghost"}
              className={`shrink-0 justify-start ${tab === name ? "text-signal" : "text-muted-foreground"}`}
              onClick={() => setTab(name)}
            >
              <Icon />
              {name}
            </Button>
          ))}
        </nav>
        <div className="panel min-w-0 p-5 sm:p-7">
          <h2 className="mb-6 text-lg font-bold">{tab}</h2>
          {tab === "General" && (
            <div className="max-w-2xl space-y-5">
              <Field label="Workspace name">
                <input
                  className="field"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  onBlur={() => {
                    if (workspace.trim()) update({ workspace });
                  }}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <SettingsSelect
                  label="Language"
                  value={settings.language}
                  options={["English", "සිංහල", "Deutsch", "Français"]}
                  onChange={(language) => update({ language })}
                />
                <SettingsSelect
                  label="Timezone"
                  value={settings.timezone}
                  options={[
                    "Asia/Colombo",
                    "UTC",
                    "Europe/London",
                    "America/New_York",
                    "Asia/Singapore",
                  ]}
                  onChange={(timezone) => update({ timezone })}
                />
                <SettingsSelect
                  label="Date format"
                  value={settings.dateFormat}
                  options={["MMM d, yyyy", "dd/MM/yyyy", "yyyy-MM-dd"]}
                  onChange={(dateFormat) => update({ dateFormat })}
                />
                <SettingsSelect
                  label="Time format"
                  value={settings.timeFormat}
                  options={["24-hour", "12-hour"]}
                  onChange={(timeFormat) => update({ timeFormat })}
                />
                <SettingsSelect
                  label="Default landing page"
                  value={settings.landing}
                  options={["Dashboard", "Knowledge", "Reasoning", "Decisions"]}
                  onChange={(landing) => update({ landing })}
                />
              </div>
              <Button
                onClick={() => {
                  update({ workspace });
                  toast.success("Workspace settings saved");
                }}
              >
                <Save />
                Save changes
              </Button>
            </div>
          )}
          {tab === "Notifications" && (
            <div>
              <div className="mb-3 grid grid-cols-[minmax(0,1fr)_70px_70px] text-center font-mono text-[10px] text-faint">
                <span className="text-left">EVENT</span>
                <span>IN-APP</span>
                <span>EMAIL</span>
              </div>
              {Object.entries(settings.notifications).map(([event, config]) => (
                <div
                  key={event}
                  className="grid grid-cols-[minmax(0,1fr)_70px_70px] items-center border-t border-border py-5"
                >
                  <span className="min-w-0 text-xs">{event}</span>
                  <Switch
                    className="mx-auto"
                    aria-label={`${event} in-app`}
                    checked={config.app}
                    onCheckedChange={(value) =>
                      update({
                        notifications: {
                          ...settings.notifications,
                          [event]: { ...config, app: value },
                        },
                      })
                    }
                  />
                  <Switch
                    className="mx-auto"
                    aria-label={`${event} email`}
                    checked={config.email}
                    onCheckedChange={(value) =>
                      update({
                        notifications: {
                          ...settings.notifications,
                          [event]: { ...config, email: value },
                        },
                      })
                    }
                  />
                </div>
              ))}
              <p className="mt-6 text-xs text-faint">
                Email preferences are stored locally. Delivery is not enabled in Phase 1.
              </p>
            </div>
          )}
          {tab === "Appearance" && (
            <div className="max-w-2xl space-y-5">
              <div className="rounded-xl border border-border bg-surface p-5">
                <span className="micro">Workspace theme</span>
                <div className="mt-3 flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full border border-signal bg-background" />
                  <span className="text-xs">Cognivax Dark</span>
                  <StatusBadge status="Active" />
                </div>
              </div>
              <Field label={`Accent intensity · ${settings.intensity}%`}>
                <input
                  type="range"
                  aria-label="Accent intensity"
                  min="50"
                  max="100"
                  value={settings.intensity}
                  className="h-11 w-full accent-signal"
                  onChange={(e) => {
                    const intensity = Number(e.target.value);
                    update({ intensity });
                    document.documentElement.style.setProperty(
                      "--accent-intensity",
                      String(intensity / 100),
                    );
                  }}
                />
              </Field>
              <SettingsSelect
                label="Density"
                value={settings.density}
                options={["comfortable", "compact"]}
                onChange={(density) => update({ density })}
              />
              <SettingToggle
                title="Reduce motion"
                description="Keep animations to a minimum."
                checked={settings.reduceMotion}
                onChange={(reduceMotion) => update({ reduceMotion })}
              />
              <SettingToggle
                title="Collapsed sidebar"
                description="Use a compact, icon-only navigation."
                checked={settings.collapsed}
                onChange={(collapsed) => update({ collapsed })}
              />
            </div>
          )}
          {tab === "Data & Privacy" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h3 className="text-sm font-semibold">Export workspace</h3>
                  <p className="mt-2 text-xs text-faint">
                    Download all records, activity and settings as JSON.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    download(
                      workspaceService.export(),
                      "cognivax-workspace.json",
                      "application/json",
                    )
                  }
                >
                  <Download />
                  Export JSON
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <h3 className="text-sm font-semibold">Import workspace</h3>
                  <p className="mt-2 text-xs text-faint">Restore a Cognivax demo export.</p>
                </div>
                <Button variant="secondary" asChild>
                  <label className="cursor-pointer">
                    <Upload />
                    Import JSON
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const text = await file.text();
                        mutation.mutate(() => workspaceService.import(text), {
                          onSuccess: () => toast.success("Workspace imported"),
                          onError: () => toast.error("Invalid Cognivax export file"),
                        });
                        e.target.value = "";
                      }}
                    />
                  </label>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold">Reset demo data</h3>
                  <p className="mt-2 text-xs text-faint">
                    Restore the original sample records and preferences.
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setReset(true)}>
                  <Trash2 />
                  Reset data
                </Button>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5">
                <h3 className="text-xs font-semibold">Workspace data retention</h3>
                <p className="mt-3 text-xs leading-6 text-muted-foreground">
                  When you are signed in, your workspace is synced to Cloud Firestore under your
                  account and available on any device you sign in from. It stays private to you and
                  is never shared with other users. You can export a backup at any time.
                </p>
              </div>
            </div>
          )}
          {tab === "Integrations" && (
            <div className="grid gap-5 xl:grid-cols-2">
              <section className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Database className="h-6 w-6 text-warning" />
                  <h3 className="text-sm font-bold">Firebase</h3>
                  <span className="ml-auto rounded-full bg-success/10 px-2 py-1 font-mono text-[9px] text-success">
                    CONNECTED
                  </span>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">
                  Firebase Authentication and Cloud Firestore are active. Your workspace is stored
                  privately under your account and seeded with demo data on first sign-in.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() =>
                    toast.info("Firebase Authentication and Cloud Firestore are connected.")
                  }
                >
                  Connection details
                </Button>
              </section>
              <section className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-4 text-sm font-bold">Webhooks</h3>
                <Field label="Endpoint URL">
                  <input
                    type="url"
                    className="field"
                    placeholder="https://example.com/events"
                    value={webhook}
                    onChange={(e) => setWebhook(e.target.value)}
                  />
                </Field>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => {
                    try {
                      new URL(webhook);
                      setConnected(!connected);
                      toast.success(
                        connected
                          ? "Demo webhook disabled"
                          : "Demo webhook configured. No requests sent.",
                      );
                    } catch {
                      toast.error("Enter a valid endpoint URL");
                    }
                  }}
                >
                  {connected ? "Disable demo webhook" : "Configure demo webhook"}
                </Button>
              </section>
              <section className="rounded-xl border border-border bg-surface p-5 xl:col-span-2">
                <h3 className="mb-4 text-sm font-bold">API keys · Demo</h3>
                <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-elevated p-3">
                  <code className="min-w-0 flex-1 truncate text-xs text-faint">
                    cgx_demo_••••••••••••••••2026
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Copy demo API key"
                    onClick={() => {
                      navigator.clipboard.writeText("cgx_demo_not_a_real_api_key_2026");
                      toast.success("Demo key copied");
                    }}
                  >
                    <Copy />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-faint">
                  This masked sample key has no access to any service.
                </p>
              </section>
            </div>
          )}
          {tab === "Keyboard Shortcuts" && (
            <div>
              {[
                ["Global search", "⌘ / Ctrl + K"],
                ["Open shortcuts", "?"],
                ["Navigate menus", "↑ / ↓"],
                ["Open selected result", "Enter"],
                ["Close dialogs", "Escape"],
                ["Move to next field", "Tab"],
              ].map(([label, key]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-border py-4"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <kbd className="rounded-md border border-border bg-elevated px-3 py-2 font-mono text-[10px] text-signal">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          )}
          {tab === "About" && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-extrabold">
                cognivax<span className="text-signal">.</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Enterprise Reasoning & Knowledge Engine
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  ["Version", "1.0.0 · Phase 1"],
                  ["Build", "October 2026"],
                  ["Workspace", "Cloud synced"],
                  ["Data provider", "Cloud Firestore"],
                  ["Domain", "cognivax.net"],
                  ["Framework", "React · TanStack Start"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="micro">{label}</span>
                    <p className="mt-2 text-xs">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={reset}
        onOpenChange={setReset}
        title="Reset the demo workspace?"
        description="All changes will be replaced with the original demo data. Export a backup first."
        label="Reset data"
        onConfirm={() =>
          mutation.mutate(() => workspaceService.reset(), {
            onSuccess: () => toast.success("Demo workspace reset"),
          })
        }
      />
    </>
  );
}
function SettingsSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}
