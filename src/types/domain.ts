export type ModuleKey = "knowledge" | "reasoning" | "evidence" | "decisions" | "rules";
export interface BaseRecord {
  id: string;
  module: ModuleKey;
  title: string;
  summary: string;
  content: string;
  category: string;
  status: string;
  owner: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  reviewDate: string;
  confidence: number;
  priority: string;
  links: string[];
  notes: { text: string; date: string; author: string }[];
  source: string;
  sourceUrl: string;
  sourceType: string;
  steps: string[];
  objective: string;
  context: string;
  assumptions: string;
  outcome: string;
  alternatives: string;
  impact: string;
  effectiveDate: string;
  condition: string;
  action: string;
  version: number;
  attachments: { name: string; size: number }[];
  approvals: { action: string; comment: string; date: string; user: string }[];
}
export interface KnowledgeRecord extends BaseRecord {
  module: "knowledge";
}
export interface ReasoningCase extends BaseRecord {
  module: "reasoning";
}
export interface EvidenceItem extends BaseRecord {
  module: "evidence";
}
export interface Decision extends BaseRecord {
  module: "decisions";
}
export interface BusinessRule extends BaseRecord {
  module: "rules";
}
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  status: string;
  initials: string;
}
export interface UserProfile extends TeamMember {
  company: string;
  avatar: string;
  bio: string;
}
export interface ActivityEntry {
  id: string;
  module: string;
  action: string;
  summary: string;
  recordId: string;
  user: string;
  date: string;
  before: string;
  after: string;
}
export interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  read: boolean;
  date: string;
  recordId: string;
}
export interface ExceptionRecord {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  assignee: string;
  date: string;
  resolution: string;
}
export interface ChangeRecord extends ActivityEntry {}
export interface AppSettings {
  workspace: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  landing: string;
  density: string;
  reduceMotion: boolean;
  collapsed: boolean;
  intensity: number;
  notifications: Record<string, { app: boolean; email: boolean }>;
}
export interface Database {
  records: BaseRecord[];
  team: TeamMember[];
  activity: ActivityEntry[];
  notifications: Notification[];
  exceptions: ExceptionRecord[];
  profile: UserProfile;
  settings: AppSettings;
  recentSearches: string[];
}
