"use client";

import { PipelineStage } from "@/lib/types";
import {
  Search,
  BookOpen,
  ShieldCheck,
  FlaskConical,
  Lightbulb,
  Users,
  Download,
} from "lucide-react";

const STAGES = [
  { key: PipelineStage.INPUT, label: "Input", icon: Search },
  { key: PipelineStage.RESEARCH, label: "Research", icon: BookOpen },
  { key: PipelineStage.VERIFICATION, label: "Verify", icon: ShieldCheck },
  { key: PipelineStage.SCIENTIFIC_METHOD, label: "Science", icon: FlaskConical },
  { key: PipelineStage.BRAINSTORMING, label: "Brainstorm", icon: Lightbulb },
  { key: PipelineStage.PMOPS, label: "P.M.O.P.S.", icon: Users },
  { key: PipelineStage.EXPORT, label: "Export", icon: Download },
];

function getStageIndex(stage: PipelineStage): number {
  return STAGES.findIndex((s) => s.key === stage);
}

interface PipelineProgressProps {
  currentStage: PipelineStage;
  isRunning: boolean;
}

export function PipelineProgress({ currentStage, isRunning }: PipelineProgressProps) {
  const currentIdx = getStageIndex(currentStage);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isComplete = idx < currentIdx || (idx === currentIdx && !isRunning && currentStage === PipelineStage.EXPORT);
          const isCurrent = idx === currentIdx && isRunning;
          const isPending = idx > currentIdx || (idx === currentIdx && !isRunning && currentStage !== PipelineStage.EXPORT);

          let containerClass =
            "flex flex-col items-center gap-1.5 flex-1 min-w-0";
          let iconWrapperClass =
            "flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-300";
          let labelClass = "text-xs font-mono truncate max-w-full text-center";

          if (isComplete) {
            iconWrapperClass += " bg-primary/20 border-primary text-primary";
            labelClass += " text-primary";
          } else if (isCurrent) {
            iconWrapperClass +=
              " bg-primary/10 border-primary text-primary animate-pulse-glow";
            labelClass += " text-foreground font-semibold";
          } else {
            iconWrapperClass +=
              " bg-secondary border-border text-muted-foreground";
            labelClass += " text-muted-foreground";
          }

          // Connector line between stages
          const showConnector = idx < STAGES.length - 1;

          return (
            <div key={stage.key} className="flex items-center flex-1 min-w-0">
              <div className={containerClass}>
                <div className={iconWrapperClass}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={labelClass}>{stage.label}</span>
              </div>
              {showConnector && (
                <div
                  className={`h-0.5 flex-1 min-w-2 mx-1 mt-[-1.25rem] rounded-full transition-all duration-300 ${
                    idx < currentIdx
                      ? "bg-primary"
                      : idx === currentIdx && isCurrent
                        ? "bg-primary/40"
                        : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
