"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentDefinition } from "@/lib/types";
import { AgentRole } from "@/lib/types";
import {
  Search,
  ShieldCheck,
  FlaskConical,
  Lightbulb,
  Users,
  FileOutput,
} from "lucide-react";

const AGENT_ICONS: Record<AgentRole, React.ElementType> = {
  [AgentRole.RESEARCH_ANALYST]: Search,
  [AgentRole.VERIFICATION_SPECIALIST]: ShieldCheck,
  [AgentRole.SCIENTIFIC_VALIDATOR]: FlaskConical,
  [AgentRole.BRAINSTORM_INNOVATOR]: Lightbulb,
  [AgentRole.PMOPS_FACILITATOR]: Users,
  [AgentRole.OUTPUT_COORDINATOR]: FileOutput,
};

function getStatusColor(status: AgentDefinition["status"]): string {
  switch (status) {
    case "idle":
      return "bg-muted text-muted-foreground";
    case "working":
      return "bg-primary/20 text-primary";
    case "complete":
      return "bg-success/20 text-success";
    case "error":
      return "bg-destructive/20 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusLabel(status: AgentDefinition["status"]): string {
  switch (status) {
    case "idle":
      return "Idle";
    case "working":
      return "Working";
    case "complete":
      return "Complete";
    case "error":
      return "Error";
    default:
      return "Unknown";
  }
}

interface AgentCardsProps {
  agents: Record<AgentRole, AgentDefinition>;
}

export function AgentCards({ agents }: AgentCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.values(agents).map((agent) => {
        const Icon = AGENT_ICONS[agent.id];
        return (
          <Card
            key={agent.id}
            className={`border transition-all duration-300 ${
              agent.status === "working"
                ? "border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                : "border-border"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                      agent.status === "working"
                        ? "bg-primary/15 text-primary"
                        : agent.status === "complete"
                          ? "bg-success/15 text-success"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-sm font-semibold font-sans leading-tight">
                    {agent.name}
                  </CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs shrink-0 ${getStatusColor(agent.status)}`}
                >
                  {getStatusLabel(agent.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {agent.description}
              </p>
              {agent.currentTask && (
                <p className="text-xs font-mono text-primary/80 bg-primary/5 rounded px-2 py-1">
                  {agent.currentTask}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-3">
                {agent.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
                {agent.skills.length > 3 && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {`+${agent.skills.length - 3} more`}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
