"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BrainstormResult } from "@/lib/types";
import { Lightbulb, FlaskConical, ArrowRight, Globe } from "lucide-react";

interface BrainstormPanelProps {
  results: BrainstormResult[];
}

export function BrainstormPanel({ results }: BrainstormPanelProps) {
  if (results.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          No brainstorm results yet. Verified data required first.
        </CardContent>
      </Card>
    );
  }

  const result = results[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Ideas */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">
              Generated Ideas ({result.ideas.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[250px] pr-4">
            <div className="flex flex-col gap-3">
              {result.ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-3 rounded-lg border border-border bg-secondary/20"
                >
                  <h5 className="text-xs font-semibold text-foreground mb-1">
                    {idea.title}
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {idea.description}
                  </p>
                  <div className="flex gap-4 mb-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Feasibility
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress
                          value={idea.feasibilityScore}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs font-mono text-foreground">
                          {idea.feasibilityScore}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Innovation
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress
                          value={idea.innovationScore}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs font-mono text-foreground">
                          {idea.innovationScore}
                        </span>
                      </div>
                    </div>
                  </div>
                  <details className="group">
                    <summary className="text-[10px] text-primary cursor-pointer hover:underline">
                      View Methodology
                    </summary>
                    <pre className="text-[10px] text-muted-foreground font-mono mt-1 whitespace-pre-wrap leading-relaxed">
                      {idea.methodology}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Novel Procedures & Extensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-info" />
              <CardTitle className="text-xs">Novel Procedures</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-1.5">
              {result.novelProcedures.map((proc, idx) => (
                <p
                  key={idx}
                  className="text-[10px] text-muted-foreground leading-relaxed"
                >
                  {proc}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-info" />
              <CardTitle className="text-xs">Method Extensions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-1.5">
              {result.methodExtensions.map((ext, idx) => (
                <p
                  key={idx}
                  className="text-[10px] text-muted-foreground leading-relaxed"
                >
                  {ext}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-info" />
              <CardTitle className="text-xs">Cross-Domain</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-1.5">
              {result.crossDomainApplications.map((app, idx) => (
                <p
                  key={idx}
                  className="text-[10px] text-muted-foreground leading-relaxed"
                >
                  {app}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
