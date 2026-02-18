"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Verification, Article } from "@/lib/types";
import { VerificationStatus } from "@/lib/types";
import { CheckCircle2, XCircle, AlertTriangle, Shield } from "lucide-react";

function getStatusBadge(status: VerificationStatus) {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return (
        <Badge className="bg-success/20 text-success border-success/30 gap-1">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </Badge>
      );
    case VerificationStatus.REJECTED:
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </Badge>
      );
    case VerificationStatus.FLAGGED_POISONED:
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1">
          <Shield className="w-3 h-3" /> Poisoned
        </Badge>
      );
    case VerificationStatus.NEEDS_REVIEW:
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
          <AlertTriangle className="w-3 h-3" /> Needs Review
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          Pending
        </Badge>
      );
  }
}

interface VerificationPanelProps {
  verifications: Verification[];
  articles: Article[];
}

export function VerificationPanel({
  verifications,
  articles,
}: VerificationPanelProps) {
  if (verifications.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          No verification data yet. Run the pipeline to see results.
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="flex flex-col gap-3">
        {verifications.map((v) => {
          const article = articles.find((a) => a.id === v.targetId);
          return (
            <Card key={v.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {article?.title ?? v.targetId}
                  </CardTitle>
                  {getStatusBadge(v.overallStatus)}
                </div>
                {article && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {article.source} | {article.sourceType.replace("_", " ")}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Credibility
                  </span>
                  <Progress value={v.credibilityScore} className="h-2 flex-1" />
                  <span className="text-xs font-mono font-semibold text-foreground whitespace-nowrap">
                    {v.credibilityScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {v.checks.map((check) => (
                    <div
                      key={check.id}
                      className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded ${
                        check.passed
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {check.passed ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 shrink-0" />
                      )}
                      <span className="truncate">
                        {check.checkType.replace(/_/g, " ")}
                      </span>
                      <span className="ml-auto font-mono shrink-0">
                        {check.confidence}%
                      </span>
                    </div>
                  ))}
                </div>

                {v.flaggedIssues.length > 0 && (
                  <div className="mt-3 p-2 rounded bg-destructive/5 border border-destructive/20">
                    <p className="text-xs font-semibold text-destructive mb-1">
                      Flagged Issues:
                    </p>
                    {v.flaggedIssues.map((issue, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-destructive/80 leading-relaxed"
                      >
                        {issue}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
