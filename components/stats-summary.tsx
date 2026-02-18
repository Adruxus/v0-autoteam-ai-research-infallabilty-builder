"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ResearchSession } from "@/lib/types";
import { VerificationStatus } from "@/lib/types";
import {
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  FlaskConical,
  Lightbulb,
  Vote,
} from "lucide-react";

interface StatsSummaryProps {
  session: ResearchSession | null;
}

export function StatsSummary({ session }: StatsSummaryProps) {
  if (!session) {
    return null;
  }

  const totalArticles = session.articles.length;
  const verifiedCount = session.verifiedTruths.length;
  const flaggedCount = session.articles.filter(
    (a) => a.status === VerificationStatus.FLAGGED_POISONED
  ).length;
  const avgCredibility =
    session.verifiedTruths.length > 0
      ? Math.round(
          session.verifiedTruths.reduce((s, t) => s + t.credibilityScore, 0) /
            session.verifiedTruths.length
        )
      : 0;
  const ideasCount = session.brainstormResults.reduce(
    (s, b) => s + b.ideas.length,
    0
  );
  const votesCount = session.pmopsDiscussions.reduce(
    (s, p) => s + p.votingResults.length,
    0
  );

  const stats = [
    {
      label: "Articles Analyzed",
      value: totalArticles,
      icon: BookOpen,
      color: "text-info",
    },
    {
      label: "Verified Truths",
      value: verifiedCount,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Flagged Poisoned",
      value: flaggedCount,
      icon: ShieldAlert,
      color: "text-destructive",
    },
    {
      label: "Avg. Credibility",
      value: `${avgCredibility}%`,
      icon: FlaskConical,
      color: "text-primary",
    },
    {
      label: "Ideas Generated",
      value: ideasCount,
      icon: Lightbulb,
      color: "text-warning",
    },
    {
      label: "Votes Cast",
      value: votesCount,
      icon: Vote,
      color: "text-info",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-4 px-3 text-center">
              <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <span className="text-2xl font-mono font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
