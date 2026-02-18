"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { PMOPSDiscussion } from "@/lib/types";
import { Vote, MessageSquare, Trophy, Users } from "lucide-react";

interface PMOPSPanelProps {
  discussions: PMOPSDiscussion[];
}

export function PMOPSPanel({ discussions }: PMOPSPanelProps) {
  if (discussions.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          No P.M.O.P.S. discussions yet. Complete verification first.
        </CardContent>
      </Card>
    );
  }

  const discussion = discussions[0];
  const winningProposal = discussion.proposals.find(
    (p) => p.id === discussion.winningProposalId
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Winning Proposal */}
      {winningProposal && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-primary">
                Winning Proposal
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {winningProposal.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {winningProposal.description}
            </p>
            <div className="flex gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Feasibility
                </span>
                <p className="text-lg font-mono font-bold text-primary">
                  {winningProposal.feasibility}
                  <span className="text-xs text-muted-foreground">/100</span>
                </p>
              </div>
              <Separator orientation="vertical" className="h-auto" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Proposed By
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {winningProposal.agentId.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposals */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm">All Proposals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[200px] pr-4">
            <div className="flex flex-col gap-3">
              {discussion.proposals.map((proposal) => {
                const isWinner =
                  proposal.id === discussion.winningProposalId;
                return (
                  <div
                    key={proposal.id}
                    className={`p-3 rounded-lg border ${
                      isWinner
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="text-xs font-semibold text-foreground">
                        {proposal.title}
                      </h5>
                      {isWinner && (
                        <Badge className="bg-primary/20 text-primary text-[10px]">
                          Winner
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {proposal.description}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-success">
                        {`+${proposal.pros.length} pros`}
                      </span>
                      <span className="text-destructive">
                        {`-${proposal.cons.length} cons`}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {proposal.feasibility}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Voting Results */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm">
              Transparent Voting Record
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2">
            {discussion.votingResults.map((vote) => (
              <div
                key={`${vote.agentId}-${vote.proposalId}`}
                className="flex items-start gap-3 p-2 rounded bg-secondary/30 text-xs"
              >
                <span className="font-semibold text-foreground whitespace-nowrap">
                  {vote.agentName}:
                </span>
                <span className="text-muted-foreground leading-relaxed">
                  {vote.reasoning}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Log */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm">
              Discussion Log ({discussion.chatLog.length} messages)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[250px] pr-4">
            <div className="flex flex-col gap-2">
              {discussion.chatLog.map((msg) => (
                <div key={msg.id} className="p-2 rounded bg-secondary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary">
                      {msg.agentName}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
