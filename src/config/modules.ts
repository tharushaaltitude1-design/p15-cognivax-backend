import { BookOpen, BrainCircuit, Fingerprint, GitBranch, Workflow } from "lucide-react";
import type { ModuleKey } from "@/types/domain";
export const modules = {
  knowledge: {
    label: "Knowledge",
    singular: "knowledge record",
    short: "Knowledge",
    prefix: "KNW",
    description: "The collective intelligence behind every decision.",
    icon: BookOpen,
    statuses: ["Draft", "Published", "Under review", "Archived"],
  },
  reasoning: {
    label: "Reasoning",
    singular: "case",
    short: "Case",
    prefix: "CASE-2026",
    description: "Turn complex questions into clear, defensible conclusions.",
    icon: BrainCircuit,
    statuses: ["Draft", "Open", "Awaiting evidence", "Under review", "Concluded", "Archived"],
  },
  evidence: {
    label: "Evidence",
    singular: "evidence item",
    short: "Evidence",
    prefix: "EVD",
    description: "Verified sources. Stronger reasoning. Better outcomes.",
    icon: Fingerprint,
    statuses: ["Verified", "Pending", "Disputed", "Superseded", "Archived"],
  },
  decisions: {
    label: "Decisions",
    singular: "decision",
    short: "Decision",
    prefix: "DEC",
    description: "A transparent record of what we decide, and why.",
    icon: GitBranch,
    statuses: ["Draft", "Pending approval", "Approved", "Rejected", "Superseded", "Archived"],
  },
  rules: {
    label: "Business Rules",
    singular: "rule",
    short: "Rule",
    prefix: "RULE",
    description: "Operational intelligence, translated into action.",
    icon: Workflow,
    statuses: ["Active", "Inactive", "Draft", "Archived"],
  },
} satisfies Record<
  ModuleKey,
  {
    label: string;
    singular: string;
    short: string;
    prefix: string;
    description: string;
    icon: typeof BookOpen;
    statuses: string[];
  }
>;
export const moduleKeys: ModuleKey[] = ["knowledge", "reasoning", "evidence", "decisions", "rules"];
export const categories = [
  "AI governance",
  "Supply chain",
  "Compliance",
  "Vendor evaluation",
  "Pricing strategy",
  "Incident analysis",
];
export function statusClass(status: string) {
  if (["Published", "Verified", "Approved", "Active", "Concluded", "Resolved"].includes(status))
    return "status-success";
  if (["Disputed", "Rejected", "Critical"].includes(status)) return "status-danger";
  if (["Under review", "Awaiting evidence", "Pending approval", "Pending", "High"].includes(status))
    return "status-warning";
  if (["Open", "Investigating"].includes(status)) return "status-signal";
  return "status-neutral";
}
