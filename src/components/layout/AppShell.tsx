import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  Plus,
  Search,
  Command as CommandIcon,
  LogOut,
  Keyboard,
  MoreHorizontal,
  Settings,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, ConfirmDialog, IconButton, StatusBadge } from "@/components/common/primitives";
import { Logo } from "@/components/common/Logo";
import { navigation, governanceNav } from "@/config/navigation";
import { moduleKeys, modules } from "@/config/modules";
import { useWorkspace, useWorkspaceMutation, workspaceService } from "@/services/repository";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getInitials, useAuth } from "@/features/auth/useAuth";
import { signOutUser } from "@/features/auth/authService";
import { VerificationBanner } from "@/features/auth/components/VerificationBanner";
export function UserMenu({
  children,
  onShortcut,
  onSignOut,
}: {
  children: ReactNode;
  onShortcut: () => void;
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserRound />
            View profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShortcut}>
          <Keyboard />
          Keyboard shortcuts
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const { data: db } = useWorkspace();
  const mutation = useWorkspaceMutation();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [governance, setGovernance] = useState(false);
  const [command, setCommand] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const [term, setTerm] = useState("");
  const { data: results = [] } = useQuery({
    queryKey: ["search", term],
    queryFn: () => workspaceService.search(term),
    enabled: command && term.length > 0,
  });
  useEffect(() => {
    setCollapsed(db?.settings.collapsed ?? false);
    document.documentElement.classList.toggle("compact", db?.settings.density === "compact");
    document.documentElement.classList.toggle("reduce-motion", db?.settings.reduceMotion ?? false);
  }, [db?.settings]);
  useEffect(() => {
    setDrawer(false);
    if (path.startsWith("/governance")) setGovernance(true);
  }, [path]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommand((v) => !v);
      }
      if (
        e.key === "?" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)
      ) {
        setShortcuts(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const unread = db?.notifications.filter((n) => !n.read).length ?? 0;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const name = user?.displayName || user?.email?.split("@")[0] || "Team member";
  const email = user?.email ?? "";
  const avatar = user?.photoURL ?? undefined;
  const handleSignOut = async () => {
    try {
      await signOutUser();
      queryClient.clear();
      toast.success("Signed out");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out");
    } finally {
      void navigate({ to: "/login", replace: true });
    }
  };
  const toggleCollapse = () => {
    const value = !collapsed;
    setCollapsed(value);
    mutation.mutate(() => workspaceService.updateSettings({ collapsed: value }));
  };
  const sidebar = (mobile = false) => (
    <aside className={cn("sidebar", mobile && "drawer-sidebar")} aria-label="Main navigation">
      <div
        className={cn(
          "flex h-24 shrink-0 items-center justify-center px-6",
          collapsed && !mobile && "px-2",
        )}
      >
        <Link to="/" aria-label="Cognivax dashboard">
          <Logo collapsed={collapsed && !mobile} />
        </Link>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3">
        {navigation.map((group) => (
          <div className="mb-5" key={group.group}>
            {(!collapsed || mobile) && <p className="micro mb-2 px-3">{group.group}</p>}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = item.path === "/" ? path === "/" : path.startsWith(item.path);
              return (
                <div key={item.path}>
                  {item.label === "Governance" ? (
                    <Button
                      variant="ghost"
                      className={cn(
                        "nav-link w-full justify-start",
                        active && "active",
                        collapsed && !mobile && "justify-center px-0",
                      )}
                      aria-expanded={governance}
                      title={item.label}
                      onClick={() => {
                        if (collapsed && !mobile) navigate({ to: "/governance" });
                        else setGovernance((v) => !v);
                      }}
                    >
                      <Icon className="h-[17px] w-[17px] shrink-0" />
                      {(!collapsed || mobile) && (
                        <>
                          <span className="min-w-0 flex-1 text-left">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 transition-transform",
                              governance && "rotate-180",
                            )}
                          />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Link
                      to={item.path}
                      aria-current={active ? "page" : undefined}
                      title={item.label}
                      className={cn(
                        "nav-link",
                        active && "active",
                        collapsed && !mobile && "justify-center px-0",
                      )}
                    >
                      <Icon className="h-[17px] w-[17px] shrink-0" />
                      {(!collapsed || mobile) && (
                        <>
                          <span className="min-w-0 flex-1">{item.label}</span>
                          {item.label === "Notifications" && unread > 0 && (
                            <span className="rounded-md bg-signal/10 px-1.5 py-0.5 font-mono text-[10px] text-signal">
                              {unread}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )}
                  {item.label === "Governance" && governance && (!collapsed || mobile) && (
                    <div className="my-1 ml-6 border-l border-border pl-2">
                      {governanceNav.map((nav) => (
                        <Link
                          key={nav.path}
                          to={nav.path}
                          className={cn(
                            "nav-link min-h-9 py-2 text-[11px]",
                            path === nav.path && "text-signal",
                          )}
                          aria-current={path === nav.path ? "page" : undefined}
                        >
                          {nav.label}
                          {nav.label === "Exceptions" && (
                            <span className="ml-auto font-mono text-[10px] text-warning">
                              {db?.exceptions.filter((e) => e.status !== "Resolved").length}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="shrink-0 border-t border-border p-3">
        {(!collapsed || mobile) && (
          <div className="mb-3 flex items-center gap-2 px-3">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground">All systems operational</span>
          </div>
        )}
        <UserMenu onShortcut={() => setShortcuts(true)} onSignOut={() => setConfirmSignOut(true)}>
          <Button
            variant="ghost"
            className={cn(
              "h-auto w-full justify-start gap-2.5 p-2",
              collapsed && !mobile && "justify-center",
            )}
          >
            <Avatar name={name} src={avatar} signal />
            {(!collapsed || mobile) && (
              <>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[11px] font-semibold">{name}</span>
                  <span className="mt-1 block truncate text-[9px] text-faint">{email}</span>
                </span>
                <ChevronDown className="h-3 w-3 text-faint" />
              </>
            )}
          </Button>
        </UserMenu>
        {!mobile && (
          <Button
            variant="ghost"
            className="mt-2 hidden h-8 w-full text-faint lg:flex"
            onClick={toggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight />
            ) : (
              <>
                <ChevronsLeft />
                <span className="text-[10px]">Collapse sidebar</span>
              </>
            )}
          </Button>
        )}
      </div>
    </aside>
  );
  const current =
    path === "/"
      ? "Dashboard"
      : path
          .split("/")
          .filter(Boolean)
          .map((s) => (s === "rules" ? "Business Rules" : s.charAt(0).toUpperCase() + s.slice(1)))
          .join(" / ");
  return (
    <div className={cn(collapsed && "app-collapsed")}>
      {sidebar()}
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent
          side="left"
          className="w-[280px] max-w-[90vw] p-0"
          onTouchStart={(e) => {
            e.currentTarget.dataset["touch"] = String(e.touches[0]?.clientX ?? 0);
          }}
          onTouchEnd={(e) => {
            if (Number(e.currentTarget.dataset["touch"]) - (e.changedTouches[0]?.clientX ?? 0) > 70)
              setDrawer(false);
          }}
        >
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
          <SheetDescription className="sr-only">Cognivax navigation and account</SheetDescription>
          {sidebar(true)}
        </SheetContent>
      </Sheet>
      <div className="app-main">
        <header className="sticky top-0 z-20 grid h-[78px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton
              label="Open navigation"
              className="shrink-0 lg:hidden"
              onClick={() => setDrawer(true)}
            >
              <Menu />
            </IconButton>
            <div className="hidden min-w-0 items-center gap-2 text-[11px] text-faint xl:flex">
              <span>Workspace</span>
              <ChevronRight className="h-3 w-3" />
              <span className="truncate text-muted-foreground">{current}</span>
            </div>
            <Button
              variant="secondary"
              className="h-10 min-w-0 flex-1 justify-start rounded-full border border-border/70 bg-surface px-4 text-faint xl:ml-auto xl:max-w-[290px]"
              onClick={() => setCommand(true)}
            >
              <Search className="shrink-0" />
              <span className="truncate text-[11px]">Search anything…</span>
              <span className="ml-auto hidden shrink-0 items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[9px] sm:flex">
                <CommandIcon className="h-2.5 w-2.5" />K
              </span>
            </Button>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-9 gap-1.5 px-2.5 text-[11px] sm:px-3">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New</span>
                  <ChevronDown className="hidden h-3 w-3 sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {moduleKeys.map((k) => (
                  <DropdownMenuItem key={k} onClick={() => navigate({ to: "/" + k + "/new" })}>
                    <Plus />
                    New {modules[k].singular}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="relative h-9 w-9 text-muted-foreground"
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {unread > 0 && (
                    <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-signal" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[340px] max-w-[calc(100vw-24px)] bg-card p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] text-signal"
                    onClick={() => mutation.mutate(() => workspaceService.markAllRead())}
                  >
                    Mark all read
                  </Button>
                </div>
                {db?.notifications.slice(0, 5).map((n) => (
                  <Button
                    key={n.id}
                    variant="ghost"
                    className="h-auto w-full justify-start whitespace-normal border-b border-border py-3 text-left"
                    onClick={() => {
                      mutation.mutate(() => workspaceService.notification(n.id, "read"));
                      navigate({ to: "/notifications" });
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs">{n.title}</span>
                      <span className="mt-1 block text-[10px] text-faint">{n.description}</span>
                    </span>
                  </Button>
                ))}
                <Button asChild variant="ghost" className="mt-2 w-full text-xs text-signal">
                  <Link to="/notifications">View all notifications</Link>
                </Button>
              </PopoverContent>
            </Popover>
            <span className="hidden h-5 w-px bg-border sm:block" />
            <UserMenu
              onShortcut={() => setShortcuts(true)}
              onSignOut={() => setConfirmSignOut(true)}
            >
              <Button variant="ghost" className="h-10 w-10 p-0" aria-label="Account menu">
                <Avatar name={name} src={avatar} signal />
              </Button>
            </UserMenu>
          </div>
        </header>
        <main className="page-content motion-page">
          <VerificationBanner />
          {children}
        </main>
        <footer className="mx-8 hidden justify-between border-t border-border/60 py-5 font-mono text-[9px] text-faint md:flex">
          <span>COGNIVAX · ENTERPRISE REASONING & KNOWLEDGE ENGINE</span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-success" />
            WORKSPACE CONNECTED<span className="ml-3">v1.0.0</span>
          </span>
        </footer>
      </div>
      <nav
        aria-label="Mobile tabs"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        {navigation[0].items
          .filter((i) => ["Dashboard", "Knowledge", "Reasoning", "Decisions"].includes(i.label))
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-[9px] text-faint",
                (item.path === "/" ? path === "/" : path.startsWith(item.path)) && "text-signal",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        <Button
          variant="ghost"
          className="h-16 flex-col gap-1 rounded-none text-[9px] text-faint"
          onClick={() => setDrawer(true)}
        >
          <MoreHorizontal className="h-5 w-5" />
          More
        </Button>
      </nav>
      <Dialog open={command} onOpenChange={setCommand}>
        <DialogContent className="responsive-dialog overflow-hidden rounded-xl bg-card p-0">
          <DialogTitle className="sr-only">Search Cognivax</DialogTitle>
          <DialogDescription className="sr-only">
            Search records and jump to pages
          </DialogDescription>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search records, actions, or pages…"
              value={term}
              onValueChange={setTerm}
            />
            <CommandList className="max-h-[60dvh]">
              <CommandEmpty>No matching records.</CommandEmpty>
              {term ? (
                moduleKeys.map((k) => (
                  <CommandGroup heading={modules[k].label} key={k}>
                    {results
                      .filter((r) => r.module === k)
                      .slice(0, 5)
                      .map((r) => (
                        <CommandItem
                          key={r.id}
                          onSelect={() => {
                            setCommand(false);
                            workspaceService.saveSearch(term);
                            navigate({ to: "/" + k + "/$id", params: { id: r.id } });
                          }}
                        >
                          <Search className="h-4 w-4 text-signal" />
                          <span className="min-w-0 flex-1 truncate">{r.title}</span>
                          <span className="font-mono text-[9px] text-faint">{r.id}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                ))
              ) : (
                <>
                  {db?.recentSearches.length ? (
                    <CommandGroup heading="Recent searches">
                      {db.recentSearches.map((s) => (
                        <CommandItem key={s} onSelect={() => setTerm(s)}>
                          <Search />
                          {s}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : null}
                  <CommandGroup heading="Quick actions">
                    {moduleKeys.map((k) => (
                      <CommandItem
                        key={k}
                        onSelect={() => {
                          setCommand(false);
                          navigate({ to: "/" + k + "/new" });
                        }}
                      >
                        <Plus />
                        Create new {modules[k].singular}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Go to">
                    {navigation
                      .flatMap((g) => [...g.items])
                      .map((i) => (
                        <CommandItem
                          key={i.path}
                          onSelect={() => {
                            setCommand(false);
                            navigate({ to: i.path });
                          }}
                        >
                          <i.icon />
                          {i.label}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
            <div className="flex justify-between border-t border-border px-4 py-3 font-mono text-[9px] text-faint">
              <span>↑ ↓ navigate · ↵ open</span>
              <span>ESC to close</span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
      <Dialog open={shortcuts} onOpenChange={setShortcuts}>
        <DialogContent className="responsive-dialog bg-card">
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Workspace shortcuts</DialogDescription>
          <div className="flex justify-between border-b border-border py-3">
            Global search<kbd className="font-mono text-signal">⌘ / Ctrl + K</kbd>
          </div>
          <div className="flex justify-between border-b border-border py-3">
            Keyboard shortcuts<kbd className="font-mono text-signal">?</kbd>
          </div>
          <div className="flex justify-between py-3">
            Close dialog<kbd className="font-mono text-signal">Esc</kbd>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmSignOut}
        onOpenChange={setConfirmSignOut}
        onConfirm={() => void handleSignOut()}
        title="Sign out?"
        description="You'll need to sign in again to access your workspace."
        label="Sign out"
      />
    </div>
  );
}
