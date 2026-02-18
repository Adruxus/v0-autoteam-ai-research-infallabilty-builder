"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ScientificValidation, Article } from "@/lib/types";
import {
  Brain,
  Repeat2,
  Gauge,
  TrendingUp,
  Eye,
  ShieldAlert,
} from "lucide-react";

function getVerdictBadge(verdict: ScientificValidation["overallVerdict"]) {
  switch (verdict) {
    case "infallible_truth":
      return (
        <Badge className="bg-success/20 text-success border-success/30">
          Infallible Truth
        </Badge>
      );
    case "needs_more_research":
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30">
          Needs More Research
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          Rejected
        </Badge>
      );
    case "poisoned_data":
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          Poisoned Data
        </Badge>
      );
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

interface ValidationRowProps {
  icon: React.ElementType;
  label: string;
  score: number;
  assessment: string;
  recommendation: string;
}

function ValidationRow({
  icon: Icon,
  label,
  score,
  assessment,
  recommendation,
}: ValidationRowProps) {
  const color =
    score >= 75
      ? "text-success"
      : score >= 50
        ? "text-warning"
        : "text-destructive";

  return (
    <div className="p-3 rounded-lg bg-secondary/20 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className={`ml-auto text-sm font-mono font-bold ${color}`}>
          {score}/100
        </span>
      </div>
      <Progress
        value={score}
        className="h-1.5 mb-2"
      />
      <p className="text-xs text-muted-foreground leading-relaxed mb-1">
        {assessment}
      </p>
      <p className="text-[10px] text-muted-foreground/70 italic">
        {recommendation}
      </p>
    </div>
  );
}

interface ScientificPanelProps {
  validations: ScientificValidation[];
  articles: Article[];
}

export function ScientificPanel({
  validations,
  articles,
}: ScientificPanelProps) {
  if (validations.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          No scientific validations yet. Complete verification first.
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="flex flex-col gap-4">
        {validations.map((v) => {
          const article = articles.find((a) => a.id === v.targetId);
          return (
            <Card key={v.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {article?.title ?? v.targetId}
                  </CardTitle>
                  {getVerdictBadge(v.overallVerdict)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col gap-2">
                  <ValidationRow
                    icon={Brain}
                    label="Logical Consistency"
                    score={v.logicalConsistency.score}
                    assessment={v.logicalConsistency.assessment}
                    recommendation={v.logicalConsistency.recommendation}
                  />
                  <ValidationRow
                    icon={Repeat2}
                    label="Replicability"
                    score={v.replicability.score}
                    assessment={v.replicability.assessment}
                    recommendation={v.replicability.recommendation}
                  />
                  <ValidationRow
                    icon={Gauge}
                    label="Variable Measurement"
                    score={v.variableMeasurement.score}
                    assessment={v.variableMeasurement.assessment}
                    recommendation={v.variableMeasurement.recommendation}
                  />
                  <ValidationRow
                    icon={TrendingUp}
                    label="Scalability"
                    score={v.scalability.score}
                    assessment={v.scalability.assessment}
                    recommendation={v.scalability.recommendation}
                  />
                  <ValidationRow
                    icon={Eye}
                    label="Perspective Analysis"
                    score={v.perspectiveAnalysis.score}
                    assessment={v.perspectiveAnalysis.assessment}
                    recommendation={v.perspectiveAnalysis.recommendation}
                  />
                  <ValidationRow
                    icon={ShieldAlert}
                    label="Poison Detection"
                    score={v.poisonDetection.score}
                    assessment={v.poisonDetection.assessment}
                    recommendation={v.poisonDetection.recommendation}
                  />
                </div>

                {v.extractedInsights.length > 0 && (
                  <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-1">
                      Extracted Insights:
                    </p>
                    {v.extractedInsights.map((insight, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-foreground/80 leading-relaxed"
                      >
                        {insight}
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
