import {
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  Fingerprint,
  GitBranch,
  Workflow,
  ShieldCheck,
  Activity,
  Bell,
  Search,
  UserRound,
  Settings,
  FileClock,
  TriangleAlert,
  Users,
} from "lucide-react";
export const navigation = [
  {
    group: "Workspace",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
      { label: "Knowledge", path: "/knowledge", icon: BookOpen },
      { label: "Reasoning", path: "/reasoning", icon: BrainCircuit },
      { label: "Evidence", path: "/evidence", icon: Fingerprint },
      { label: "Decisions", path: "/decisions", icon: GitBranch },
      { label: "Business Rules", path: "/rules", icon: Workflow },
    ],
  },
  {
    group: "Oversight",
    items: [
      { label: "Governance", path: "/governance", icon: ShieldCheck },
      { label: "Activity", path: "/activity", icon: Activity },
      { label: "Notifications", path: "/notifications", icon: Bell },
    ],
  },
  { group: "Tools", items: [{ label: "Search", path: "/search", icon: Search }] },
  {
    group: "Account",
    items: [
      { label: "Profile", path: "/profile", icon: UserRound },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
] as const;
export const governanceNav = [
  { label: "Overview", path: "/governance", icon: ShieldCheck },
  { label: "Change Records", path: "/governance/changes", icon: FileClock },
  { label: "Exceptions", path: "/governance/exceptions", icon: TriangleAlert },
  { label: "Team Directory", path: "/governance/team", icon: Users },
] as const;
