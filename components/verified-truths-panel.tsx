"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { VerifiedTruth } from "@/lib/types";
import { CheckCircle2, BookOpen, FlaskConical } from "lucide-react";

interface VerifiedTruthsPanelProps {
  truths: VerifiedTruth[];
}

export function VerifiedTruthsPanel({ truths }: VerifiedTruthsPanelProps) {
  if (truths.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          No verified truths yet. Complete the full pipeline to see results.
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="flex flex-col gap-3">
        {truths.map((truth) => (
          <Card
            key={truth.id}
            className="border-primary/20 bg-primary/5"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {truth.title}
                  </CardTitle>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30 shrink-0">
                  {truth.scientificVerdict.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                {truth.content}
              </p>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Credibility
                </span>
                <Progress
                  value={truth.credibilityScore}
                  className="h-2 flex-1"
                />
                <span className="text-xs font-mono font-semibold text-primary whitespace-nowrap">
                  {truth.credibilityScore}/100
                </span>
              </div>

              {/* Methods */}
              <div className="flex items-start gap-2 mb-2">
                <FlaskConical className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {truth.methods.map((method) => (
                    <span
                      key={method}
                      className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sources */}
              {truth.sources.length > 0 && (
                <div className="flex items-start gap-2">
                  <BookOpen className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    {truth.sources.map((src) => (
                      <span
                        key={src.id}
                        className="text-[10px] text-muted-foreground"
                      >
                        {src.authors.join(", ")} ({src.year}). {src.text}.{" "}
                        {src.publication}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {truth.insights.length > 0 && (
                <div className="mt-2 p-2 rounded bg-primary/10 border border-primary/20">
                  <p className="text-[10px] font-semibold text-primary mb-0.5">
                    Insights:
                  </p>
                  {truth.insights.map((insight, idx) => (
                    <p
                      key={idx}
                      className="text-[10px] text-foreground/70 leading-relaxed"
                    >
                      {insight}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
