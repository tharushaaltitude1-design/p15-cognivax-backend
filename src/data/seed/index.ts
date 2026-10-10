import { categories, moduleKeys, modules } from "@/config/modules";
import type { BaseRecord, Database, TeamMember } from "@/types/domain";
const people = [
  ["Kavindu Jayasinghe", "Founder & Chief Architect", "Architecture", "KJ"],
  ["Sarah Chen", "Head of AI Governance", "Governance", "SC"],
  ["Marcus Williams", "Senior Risk Analyst", "Risk & Compliance", "MW"],
  ["Priya Sharma", "Knowledge Lead", "Knowledge Operations", "PS"],
  ["Alex Morgan", "Decision Scientist", "Strategy", "AM"],
  ["Emily Carter", "Compliance Manager", "Compliance", "EC"],
  ["Daniel Park", "Platform Engineer", "Engineering", "DP"],
  ["Olivia Thompson", "Supply Chain Analyst", "Operations", "OT"],
  ["James Wilson", "Evidence Specialist", "Research", "JW"],
  ["Sofia Rodriguez", "Product Strategist", "Product", "SR"],
];
const titles = {
  knowledge: [
    "AI model risk classification framework",
    "Vendor evaluation methodology v2",
    "Supply chain resilience playbook",
    "GDPR data retention guidelines",
    "Enterprise pricing strategy analysis",
    "Incident response knowledge base",
    "LLM output reliability standards",
    "Third-party security assessment",
    "Critical supplier dependency map",
    "Regulatory change impact framework",
    "Model monitoring best practices",
    "Responsible AI principles",
    "Procurement due diligence checklist",
    "Decision quality measurement",
    "Customer data classification",
    "Business continuity framework",
    "AI bias mitigation research",
    "Operational risk taxonomy",
    "Evidence quality standards",
    "Knowledge lifecycle policy",
  ],
  reasoning: [
    "Evaluate Atlas AI deployment risk",
    "Assess supplier concentration exposure",
    "Review EU compliance readiness",
    "Analyze Q4 pricing adjustments",
    "Investigate inference latency spike",
    "Compare vendor migration scenarios",
    "Assess model hallucination controls",
    "Evaluate Northstar partnership",
    "Review data residency implications",
    "Prioritize supply chain investments",
    "Analyze approval cycle bottlenecks",
    "Evaluate automated underwriting",
    "Assess new market entry risk",
    "Review incident root cause",
    "Validate customer churn hypothesis",
    "Evaluate hybrid cloud architecture",
    "Analyze model drift signals",
    "Review escalation thresholds",
    "Assess contract renewal options",
    "Evaluate knowledge coverage gaps",
  ],
  evidence: [
    "Atlas model evaluation report",
    "Supplier financial health dataset",
    "EU regulatory compliance audit",
    "Q3 customer pricing interviews",
    "Platform incident telemetry",
    "Vendor security certification",
    "LLM benchmark comparison",
    "Northstar financial disclosures",
    "Data residency assessment",
    "Supply chain resilience metrics",
    "Decision cycle analytics report",
    "Underwriting accuracy dataset",
    "APAC market research report",
    "Root cause investigation notes",
    "Customer cohort retention metrics",
    "Infrastructure cost benchmark",
    "Production model drift report",
    "Risk threshold validation",
    "Contract performance review",
    "Knowledge coverage audit",
  ],
  decisions: [
    "Approve Atlas AI pilot deployment",
    "Diversify critical component suppliers",
    "Adopt EU data residency policy",
    "Maintain enterprise pricing tiers",
    "Implement inference failover",
    "Select Meridian as strategic vendor",
    "Mandate model confidence thresholds",
    "Proceed with Northstar evaluation",
    "Enforce regional data boundaries",
    "Increase resilience investment",
    "Streamline low-risk approvals",
    "Pilot automated underwriting",
    "Defer APAC expansion",
    "Update incident escalation policy",
    "Invest in customer retention",
    "Adopt hybrid cloud strategy",
    "Schedule model retraining",
    "Revise risk scoring thresholds",
    "Renew Horizon supplier contract",
    "Establish quarterly knowledge reviews",
  ],
  rules: [
    "High-risk model review gate",
    "Supplier concentration alert",
    "EU data processing restriction",
    "Enterprise discount threshold",
    "Latency escalation trigger",
    "Vendor certification expiry",
    "Low-confidence output routing",
    "Partner exposure limit",
    "Cross-region transfer validation",
    "Inventory resilience threshold",
    "Approval timeout escalation",
    "Underwriting exception flag",
    "Market entry readiness check",
    "Critical incident notification",
    "Churn risk intervention",
    "Cloud budget safeguard",
    "Model drift retraining trigger",
    "Risk score escalation",
    "Contract renewal reminder",
    "Knowledge review scheduling",
  ],
};
export function makeSeed(): Database {
  const team: TeamMember[] = people.map((p, i) => ({
    id: `USR-${i + 1}`,
    name: p[0] ?? "",
    title: p[1] ?? "",
    department: p[2] ?? "",
    initials: p[3] ?? "",
    email:
      i === 0
        ? "kavindu@cognivax.net"
        : `${(p[0] ?? "").toLowerCase().replaceAll(" ", ".")}@cognivax.net`,
    status: "Active",
  }));
  const records: BaseRecord[] = moduleKeys.flatMap((module) =>
    titles[module].map((title, i) => {
      const config = modules[module];
      const day = String((i % 27) + 1).padStart(2, "0");
      const id = `${config.prefix}-${String(i + 1).padStart(module === "knowledge" ? 5 : 4, "0")}`;
      return {
        id,
        module,
        title,
        summary: `An enterprise ${config.singular} addressing ${categories[i % categories.length]?.toLowerCase()} with a documented assessment, supporting sources, and actionable recommendations.`,
        content: `## Executive summary\n${title} establishes a consistent approach for enterprise teams to assess risk and make informed decisions.\n\n## Key findings\nThe review considered operational impact, regulatory obligations, financial exposure and the quality of supporting evidence. Current controls provide a strong foundation, with targeted improvements recommended.\n\n## Recommendations\n1. Validate findings against the latest source data.\n2. Assign clear accountability for implementation.\n3. Reassess outcomes at the scheduled review date.`,
        category: categories[i % categories.length] ?? "AI governance",
        status: config.statuses[i % (config.statuses.length - 1)] ?? "Draft",
        owner: team[i % team.length]?.name ?? "Kavindu Jayasinghe",
        tags:
          [
            ["governance", "ai-models"],
            ["supply-chain", "risk"],
            ["compliance", "gdpr"],
            ["vendors", "assessment"],
            ["pricing", "strategy"],
            ["incident", "operations"],
          ][i % 6] ?? [],
        createdAt: `2026-${String(4 + (i % 6)).padStart(2, "0")}-${day}T09:30:00Z`,
        updatedAt: `2026-10-${String(9 - (i % 9)).padStart(2, "0")}T${String(9 + (i % 8)).padStart(2, "0")}:15:00Z`,
        reviewDate: `2026-10-${String(10 + (i % 20)).padStart(2, "0")}`,
        confidence: 72 + ((i * 7) % 28),
        priority: ["High", "Medium", "Low"][i % 3] ?? "Medium",
        links: moduleKeys
          .filter((k) => k !== module)
          .slice(0, 3)
          .map(
            (k) => `${modules[k].prefix}-${String(i + 1).padStart(k === "knowledge" ? 5 : 4, "0")}`,
          ),
        notes: [],
        source:
          ["Internal research", "Gartner Research", "Compliance Office", "Finance Analytics"][
            i % 4
          ] ?? "Internal research",
        sourceUrl: "https://cognivax.net",
        sourceType: ["Report", "Dataset", "Interview", "Document", "Metric"][i % 5] ?? "Report",
        steps: [
          "Define the business question and evaluation criteria",
          "Gather and validate supporting evidence",
          "Compare alternatives against risk and impact",
          "Document the recommendation and confidence level",
        ],
        objective: `Determine the best course of action to ${title.toLowerCase()}.`,
        context:
          "Enterprise-wide assessment for the Q4 strategic review. Dependencies include compliance, engineering and operations.",
        assumptions:
          "Current source data is representative. Existing controls remain effective during the review period.",
        outcome:
          "Proceed with the recommended approach, subject to ongoing monitoring and quarterly review.",
        alternatives:
          "Maintain the current approach; implement incremental improvements; adopt a full replacement strategy.",
        impact: ["High", "Medium", "Low"][i % 3] ?? "Medium",
        effectiveDate: "2026-10-15",
        condition:
          [
            "risk_score > 80",
            "supplier_share > 0.35",
            "region = EU",
            "discount > 20",
            "latency_ms > 500",
          ][i % 5] ?? "risk_score > 80",
        action: "Flag for review and notify the assigned owner",
        version: 1 + (i % 3),
        attachments: i % 3 === 0 ? [{ name: "assessment-report.pdf", size: 248120 }] : [],
        approvals: [],
      };
    }),
  );
  const activity = Array.from({ length: 60 }, (_, i) => {
    const record = records[(i * 7) % records.length];
    return {
      id: `ACT-${i + 1}`,
      module: record?.module ?? "knowledge",
      action: ["updated", "published", "created", "reviewed", "approved"][i % 5] ?? "updated",
      summary: `${record?.title ?? "Record"} ${["was updated", "was published", "was created", "was reviewed", "was approved"][i % 5]}`,
      recordId: record?.id ?? "",
      user: team[i % 10]?.name ?? "",
      date: `2026-10-${String(9 - (i % 9)).padStart(2, "0")}T${String(16 - (i % 8)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00Z`,
      before: "Draft · Version 1",
      after: "Reviewed · Version 2",
    };
  });
  const notifications = Array.from({ length: 15 }, (_, i) => ({
    id: `NTF-${i + 1}`,
    title:
      [
        "Decision awaiting your approval",
        "New governance exception",
        "Knowledge review scheduled",
        "Evidence verification complete",
        "Workspace digest ready",
      ][i % 5] ?? "",
    description: records[(i * 3) % 100]?.title ?? "",
    type: ["Approvals", "Exceptions", "System", "System", "System"][i % 5] ?? "System",
    read: i > 5,
    date: `2026-10-09T${String(16 - (i % 8)).padStart(2, "0")}:00:00Z`,
    recordId: records[(i * 3) % 100]?.id ?? "",
  }));
  const first = team[0];
  if (!first) throw new Error("Seed user missing");
  return {
    records,
    team,
    activity,
    notifications,
    exceptions: Array.from({ length: 8 }, (_, i) => ({
      id: `EXC-${String(i + 1).padStart(4, "0")}`,
      title:
        [
          "Model review deadline exceeded",
          "Supplier concentration above threshold",
          "Missing compliance evidence",
          "Unapproved data transfer",
          "Vendor certification expired",
          "Risk assessment overdue",
          "Policy acknowledgement missing",
          "Decision review deferred",
        ][i] ?? "",
      description:
        "The control requires review and a documented remediation plan before the next governance cycle.",
      severity: ["High", "Critical", "Medium", "Low"][i % 4] ?? "Medium",
      status: ["Open", "Investigating", "Resolved"][i % 3] ?? "Open",
      assignee: team[i % 10]?.name ?? "",
      date: "2026-10-08",
      resolution: "",
    })),
    profile: {
      ...first,
      company: "Cognivax",
      avatar: "",
      bio: "Building the reasoning infrastructure for better enterprise decisions.",
    },
    settings: {
      workspace: "Cognivax",
      language: "English",
      timezone: "Asia/Colombo",
      dateFormat: "MMM d, yyyy",
      timeFormat: "24-hour",
      landing: "Dashboard",
      density: "comfortable",
      reduceMotion: false,
      collapsed: false,
      intensity: 100,
      notifications: Object.fromEntries(
        ["Approvals", "Exceptions", "Record updates", "Reviews", "System"].map((e) => [
          e,
          { app: true, email: e === "Approvals" },
        ]),
      ),
    },
    recentSearches: [],
  };
}
export const dashboardSeries = [
  { day: "Mon", knowledge: 14, cases: 9 },
  { day: "Tue", knowledge: 22, cases: 12 },
  { day: "Wed", knowledge: 18, cases: 15 },
  { day: "Thu", knowledge: 32, cases: 18 },
  { day: "Fri", knowledge: 26, cases: 14 },
  { day: "Sat", knowledge: 38, cases: 22 },
  { day: "Sun", knowledge: 34, cases: 19 },
];
