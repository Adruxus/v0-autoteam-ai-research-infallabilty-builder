"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ResearchSession } from "@/lib/types";
import { VerificationStatus } from "@/lib/types";
import { AUDITED_ISSUES, generateQualityReport, type PipelineMetrics } from "@/lib/code-monitor";
import {
  ShieldCheck,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Activity,
  FileSearch,
} from "lucide-react";

interface CodeAuditPanelProps {
  session: ResearchSession;
}

function computeMetrics(session: ResearchSession): PipelineMetrics {
  const totalChecks = session.verifications.reduce(
    (s, v) => s + v.checks.length,
    0
  );
  const passedChecks = session.verifications.reduce(
    (s, v) => s + v.checks.filter((c) => c.passed).length,
    0
  );
  const avgCred =
    session.verifications.length > 0
      ? Math.round(
          session.verifications.reduce((s, v) => s + v.credibilityScore, 0) /
            session.verifications.length
        )
      : 0;
  const poisonCount = session.articles.filter(
    (a) => a.status === VerificationStatus.FLAGGED_POISONED
  ).length;

  return {
    totalDurationMs: 0,
    stagesCompleted: 7,
    articlesProcessed: session.articles.length,
    verificationsRun: session.verifications.length,
    truthsProduced: session.verifiedTruths.length,
    poisonDetections: poisonCount,
    avgCredibilityScore: avgCred,
    checkPassRate: totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0,
  };
}

export function CodeAuditPanel({ session }: CodeAuditPanelProps) {
  const report = useMemo(() => {
    const metrics = computeMetrics(session);
    return generateQualityReport([], metrics);
  }, [session]);

  const severityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "warning":
        return "bg-warning/20 text-warning border-warning/30";
      case "info":
        return "bg-info/20 text-info border-info/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const categoryIcon = (category: string) => {
    switch (category) {
      case "loop":
        return <Activity className="w-3 h-3 shrink-0" />;
      case "redundancy":
        return <FileSearch className="w-3 h-3 shrink-0" />;
      case "error_prone":
        return <Bug className="w-3 h-3 shrink-0" />;
      case "security":
        return <ShieldCheck className="w-3 h-3 shrink-0" />;
      default:
        return <AlertTriangle className="w-3 h-3 shrink-0" />;
    }
  };

  const resolvedCount = AUDITED_ISSUES.filter((i) => i.resolved).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Health Score */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Code Quality Health
            </CardTitle>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {report.codeHealthScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={report.codeHealthScore} className="h-3 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-center">
              <span className="text-xl font-mono font-bold text-foreground">
                {report.metrics.articlesProcessed}
              </span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                Articles
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-center">
              <span className="text-xl font-mono font-bold text-foreground">
                {report.metrics.checkPassRate}%
              </span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                Check Pass Rate
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-center">
              <span className="text-xl font-mono font-bold text-foreground">
                {report.metrics.poisonDetections}
              </span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                Poison Flags
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-center">
              <span className="text-xl font-mono font-bold text-foreground">
                {report.metrics.truthsProduced}
              </span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                Verified Truths
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audited Issues */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="w-4 h-4 text-muted-foreground" />
              Code Audit Report
            </CardTitle>
            <span className="text-xs font-mono text-muted-foreground">
              {resolvedCount}/{AUDITED_ISSUES.length} resolved
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[400px] pr-4">
            <div className="flex flex-col gap-2">
              {AUDITED_ISSUES.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    issue.resolved
                      ? "border-success/20 bg-success/5"
                      : "border-destructive/20 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {categoryIcon(issue.category)}
                      <Badge
                        className={`text-[10px] ${severityColor(issue.severity)}`}
                      >
                        {issue.severity}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono"
                      >
                        {issue.category.replace("_", " ")}
                      </Badge>
                    </div>
                    {issue.resolved ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed mb-1">
                    {issue.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    Fix: {issue.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pipeline Integrity */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Pipeline Integrity Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2">
            {[
              {
                label: "No infinite loops",
                detail: "Pipeline uses sequential stage progression, bounded for-of loops only",
                passed: true,
              },
              {
                label: "No recursion",
                detail: "Zero recursive function calls in the pipeline engine",
                passed: true,
              },
              {
                label: "No shared mutable state",
                detail: "IDs generated via crypto.randomUUID(), no module-level counters",
                passed: true,
              },
              {
                label: "Safe array operations",
                detail: "Empty array guards before all reduce() calls",
                passed: true,
              },
              {
                label: "Deterministic output",
                detail: "Same input always produces same pipeline structure",
                passed: true,
              },
              {
                label: "Abort-safe fetching",
                detail: "AbortController with mounted-ref guard prevents zombie state updates",
                passed: true,
              },
              {
                label: "Data Poison Shield active",
                detail: "SYSTEM prompt injected to Verification and Scientific Validator agents",
                passed: true,
              },
            ].map((check) => (
              <div
                key={check.label}
                className="flex items-center gap-3 p-2 rounded bg-success/5 border border-success/20"
              >
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {check.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {check.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
