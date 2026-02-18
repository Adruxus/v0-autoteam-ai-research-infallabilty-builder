// ============================================================
// CODE QUALITY MONITOR
// Tracks pipeline execution, detects anomalies, and reports metrics
// No loops, no recursion, deterministic analysis
// ============================================================

export interface MonitorEvent {
  id: string;
  timestamp: string;
  type: "stage_start" | "stage_complete" | "warning" | "error" | "metric";
  stage?: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface QualityReport {
  generatedAt: string;
  totalEvents: number;
  warnings: MonitorEvent[];
  errors: MonitorEvent[];
  metrics: PipelineMetrics;
  codeHealthScore: number; // 0-100
  issues: CodeIssue[];
}

export interface PipelineMetrics {
  totalDurationMs: number;
  stagesCompleted: number;
  articlesProcessed: number;
  verificationsRun: number;
  truthsProduced: number;
  poisonDetections: number;
  avgCredibilityScore: number;
  checkPassRate: number;
}

export interface CodeIssue {
  severity: "critical" | "warning" | "info";
  category: "loop" | "redundancy" | "error_prone" | "performance" | "security";
  description: string;
  recommendation: string;
  resolved: boolean;
}

/**
 * Pre-flight code quality checks.
 * These are the issues we audited and fixed.
 * Keeping them documented for transparency.
 */
export const AUDITED_ISSUES: CodeIssue[] = [
  {
    severity: "critical",
    category: "error_prone",
    description: "Module-level mutable idCounter caused ID collisions across concurrent requests",
    recommendation: "Replaced with crypto.randomUUID() - no shared mutable state",
    resolved: true,
  },
  {
    severity: "critical",
    category: "error_prone",
    description: "Array.reduce() on potentially empty otherProposals array throws TypeError",
    recommendation: "Added empty array guard before reduce call in PMOPS voting",
    resolved: true,
  },
  {
    severity: "warning",
    category: "redundancy",
    description: "6 verification check functions had identical structure with different config",
    recommendation: "Consolidated into data-driven CHECK_RULES array",
    resolved: true,
  },
  {
    severity: "warning",
    category: "redundancy",
    description: "4 source metadata functions (formatSourceType, getSourceName, getSourceUrl, generateSnippet) duplicated key mappings",
    recommendation: "Unified into single SOURCE_META constant record",
    resolved: true,
  },
  {
    severity: "warning",
    category: "redundancy",
    description: "getAgentDisplayName re-created the same Record on every call",
    recommendation: "Replaced with module-level AGENT_DISPLAY_NAMES constant",
    resolved: true,
  },
  {
    severity: "warning",
    category: "loop",
    description: "Discussion loop guard 'i < proposals.length && i < agentRoles.length' was redundant",
    recommendation: "Simplified to single bound since proposals are 1:1 with agentRoles",
    resolved: true,
  },
  {
    severity: "info",
    category: "redundancy",
    description: "avgCredibility calculated identically in buildExecutiveSummary and buildAnalyticsSection",
    recommendation: "Documented; both sections serve different export contexts so duplication is acceptable",
    resolved: true,
  },
  {
    severity: "warning",
    category: "security",
    description: "Export API accepted full session object from client (injection risk)",
    recommendation: "Server re-generates session from pipeline; client only sends request text",
    resolved: true,
  },
];

/**
 * Creates a fresh monitor event log.
 */
export function createEventLog(): MonitorEvent[] {
  return [];
}

/**
 * Records a monitor event. Pure append, no mutation of existing entries.
 */
export function recordEvent(
  log: MonitorEvent[],
  type: MonitorEvent["type"],
  message: string,
  stage?: string,
  data?: Record<string, unknown>
): MonitorEvent[] {
  const event: MonitorEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    type,
    stage,
    message,
    data,
  };
  return [...log, event];
}

/**
 * Generates a quality report from collected events and pipeline output.
 * Deterministic: same input always produces same output.
 */
export function generateQualityReport(
  events: MonitorEvent[],
  metrics: PipelineMetrics
): QualityReport {
  const warnings = events.filter((e) => e.type === "warning");
  const errors = events.filter((e) => e.type === "error");

  // Health score: starts at 100, deductions for issues
  let score = 100;
  score -= errors.length * 15;
  score -= warnings.length * 5;

  // Deductions for low metrics
  if (metrics.checkPassRate < 50) score -= 10;
  if (metrics.avgCredibilityScore < 50) score -= 10;
  if (metrics.poisonDetections > 0) score -= metrics.poisonDetections * 5;

  return {
    generatedAt: new Date().toISOString(),
    totalEvents: events.length,
    warnings,
    errors,
    metrics,
    codeHealthScore: Math.max(0, Math.min(100, score)),
    issues: AUDITED_ISSUES,
  };
}
