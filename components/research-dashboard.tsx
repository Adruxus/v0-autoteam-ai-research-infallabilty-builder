"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PipelineProgress } from "@/components/pipeline-progress";
import { AgentCards } from "@/components/agent-cards";
import { VerificationPanel } from "@/components/verification-panel";
import { ScientificPanel } from "@/components/scientific-panel";
import { BrainstormPanel } from "@/components/brainstorm-panel";
import { PMOPSPanel } from "@/components/pmops-panel";
import { VerifiedTruthsPanel } from "@/components/verified-truths-panel";
import { StatsSummary } from "@/components/stats-summary";
import type { ResearchSession, AgentDefinition } from "@/lib/types";
import { PipelineStage, AgentRole } from "@/lib/types";
import { createAgentTeam } from "@/lib/agents";
import {
  Play,
  Download,
  Shield,
  RotateCcw,
  Loader2,
} from "lucide-react";

// Stages the agents activate in, mapped for UI animation
const STAGE_AGENT_MAP: Record<PipelineStage, AgentRole[]> = {
  [PipelineStage.INPUT]: [AgentRole.RESEARCH_ANALYST],
  [PipelineStage.RESEARCH]: [AgentRole.RESEARCH_ANALYST],
  [PipelineStage.VERIFICATION]: [AgentRole.VERIFICATION_SPECIALIST],
  [PipelineStage.SCIENTIFIC_METHOD]: [AgentRole.SCIENTIFIC_VALIDATOR],
  [PipelineStage.BRAINSTORMING]: [AgentRole.BRAINSTORM_INNOVATOR],
  [PipelineStage.PMOPS]: [AgentRole.PMOPS_FACILITATOR],
  [PipelineStage.EXPORT]: [AgentRole.OUTPUT_COORDINATOR],
};

const STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.INPUT]: "Parsing research request...",
  [PipelineStage.RESEARCH]: "Searching academic databases...",
  [PipelineStage.VERIFICATION]: "Running 6-point verification...",
  [PipelineStage.SCIENTIFIC_METHOD]: "Applying scientific method...",
  [PipelineStage.BRAINSTORMING]: "Generating novel ideas...",
  [PipelineStage.PMOPS]: "Running P.M.O.P.S. discussion...",
  [PipelineStage.EXPORT]: "Compiling verified truths...",
};

const PIPELINE_STAGES_ORDER: PipelineStage[] = [
  PipelineStage.INPUT,
  PipelineStage.RESEARCH,
  PipelineStage.VERIFICATION,
  PipelineStage.SCIENTIFIC_METHOD,
  PipelineStage.BRAINSTORMING,
  PipelineStage.PMOPS,
  PipelineStage.EXPORT,
];

export function ResearchDashboard() {
  const [userRequest, setUserRequest] = useState("");
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [exportText, setExportText] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<PipelineStage>(
    PipelineStage.INPUT
  );
  const [agents, setAgents] = useState<Record<AgentRole, AgentDefinition>>(
    createAgentTeam()
  );
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateAgentStatuses = useCallback(
    (stage: PipelineStage, status: "working" | "complete") => {
      setAgents((prev) => {
        const updated = { ...prev };
        // Set all agents to idle/complete first
        for (const role of Object.values(AgentRole)) {
          if (updated[role].status === "working") {
            updated[role] = { ...updated[role], status: "complete" };
          }
        }
        // Set active agents for this stage
        const activeAgents = STAGE_AGENT_MAP[stage] ?? [];
        for (const role of activeAgents) {
          updated[role] = {
            ...updated[role],
            status,
            currentTask:
              status === "working" ? STAGE_LABELS[stage] : undefined,
          };
        }
        return updated;
      });
    },
    []
  );

  const runPipeline = useCallback(async () => {
    const trimmed = userRequest.trim();
    if (trimmed.length === 0) return;

    // Reset state
    setError(null);
    setSession(null);
    setExportText("");
    setIsRunning(true);
    setAgents(createAgentTeam());

    // Animate through stages before making the API call
    const controller = new AbortController();
    abortRef.current = controller;

    // Simulate stage progression for visual feedback
    for (let i = 0; i < PIPELINE_STAGES_ORDER.length - 1; i++) {
      if (controller.signal.aborted) break;
      const stage = PIPELINE_STAGES_ORDER[i];
      setCurrentStage(stage);
      updateAgentStatuses(stage, "working");
      await new Promise((resolve) => setTimeout(resolve, 600));
      updateAgentStatuses(stage, "complete");
    }

    if (controller.signal.aborted) {
      setIsRunning(false);
      return;
    }

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRequest: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Pipeline failed with status ${res.status}`);
      }

      const data = await res.json();
      setSession(data.session);
      setExportText(data.exportText);
      setCurrentStage(PipelineStage.EXPORT);
      updateAgentStatuses(PipelineStage.EXPORT, "complete");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // User cancelled
      }
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      // Mark current active agents as error
      setAgents((prev) => {
        const updated = { ...prev };
        for (const role of Object.values(AgentRole)) {
          if (updated[role].status === "working") {
            updated[role] = { ...updated[role], status: "error" };
          }
        }
        return updated;
      });
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [userRequest, updateAgentStatuses]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // First Enter key press starts the pipeline (as specified in requirements)
      if (e.key === "Enter" && !e.shiftKey && !isRunning) {
        e.preventDefault();
        runPipeline();
      }
    },
    [isRunning, runPipeline]
  );

  const handleExport = useCallback(() => {
    if (!exportText || !session) return;

    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `research_${session.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportText, session]);

  const handleReset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setUserRequest("");
    setSession(null);
    setExportText("");
    setIsRunning(false);
    setCurrentStage(PipelineStage.INPUT);
    setAgents(createAgentTeam());
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15 text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground font-sans leading-tight text-balance">
                AI Research Verification System
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Poison & Manipulation Free AI Future
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session && exportText && (
              <Button
                onClick={handleExport}
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export .txt</span>
              </Button>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Pipeline Progress */}
        <Card className="border-border">
          <CardContent className="py-5">
            <PipelineProgress
              currentStage={currentStage}
              isRunning={isRunning}
            />
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              Research Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              <Textarea
                placeholder="Enter your research topic or question. Press Enter to start the pipeline. Use Shift+Enter for new lines."
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] font-mono text-sm bg-secondary/30 border-border resize-none"
                disabled={isRunning}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Enter</kbd> to start
                  {" | "}
                  <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Shift+Enter</kbd> for new line
                </p>
                <Button
                  onClick={runPipeline}
                  disabled={isRunning || userRequest.trim().length === 0}
                  size="sm"
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running Pipeline...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Pipeline
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-4">
              <p className="text-sm text-destructive font-mono">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Agent Team */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Agent Team
          </h2>
          <AgentCards agents={agents} />
        </div>

        {/* Stats */}
        {session && (
          <>
            <Separator />
            <StatsSummary session={session} />
          </>
        )}

        {/* Results Tabs */}
        {session && (
          <>
            <Separator />
            <Tabs defaultValue="verification" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto bg-secondary/50">
                <TabsTrigger value="verification" className="text-xs">
                  Verification
                </TabsTrigger>
                <TabsTrigger value="scientific" className="text-xs">
                  Scientific Method
                </TabsTrigger>
                <TabsTrigger value="brainstorm" className="text-xs">
                  Brainstorming
                </TabsTrigger>
                <TabsTrigger value="pmops" className="text-xs">
                  P.M.O.P.S.
                </TabsTrigger>
                <TabsTrigger value="truths" className="text-xs">
                  Verified Truths
                </TabsTrigger>
                <TabsTrigger value="export" className="text-xs">
                  Export Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="verification" className="mt-4">
                <VerificationPanel
                  verifications={session.verifications}
                  articles={session.articles}
                />
              </TabsContent>

              <TabsContent value="scientific" className="mt-4">
                <ScientificPanel
                  validations={session.scientificValidations}
                  articles={session.articles}
                />
              </TabsContent>

              <TabsContent value="brainstorm" className="mt-4">
                <BrainstormPanel results={session.brainstormResults} />
              </TabsContent>

              <TabsContent value="pmops" className="mt-4">
                <PMOPSPanel discussions={session.pmopsDiscussions} />
              </TabsContent>

              <TabsContent value="truths" className="mt-4">
                <VerifiedTruthsPanel truths={session.verifiedTruths} />
              </TabsContent>

              <TabsContent value="export" className="mt-4">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Export Preview (.txt)
                      </CardTitle>
                      <Button
                        onClick={handleExport}
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <pre className="text-xs font-mono text-muted-foreground bg-secondary/30 rounded-lg p-4 overflow-auto max-h-[500px] whitespace-pre-wrap leading-relaxed">
                      {exportText}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
