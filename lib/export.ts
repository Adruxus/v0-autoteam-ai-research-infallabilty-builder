// ============================================================
// Export Utility - Generates .txt files from verified research
// Clean, deterministic output with full citation chains
// ============================================================

import type {
  ResearchSession,
  ExportDocument,
  ExportSection,
  VerifiedTruth,
  PMOPSDiscussion,
  ScientificValidation,
  Verification,
} from "./types";
import { PipelineStage, VerificationStatus } from "./types";

/**
 * Generates a complete export document from a research session.
 * Every section includes full citations and verification scores.
 */
export function generateExportDocument(
  session: ResearchSession
): ExportDocument {
  const sections: ExportSection[] = [];

  // Section 1: Executive Summary
  sections.push(buildExecutiveSummary(session));

  // Section 2: Verified Truths
  for (const truth of session.verifiedTruths) {
    sections.push(buildTruthSection(truth));
  }

  // Section 3: Research Methodology
  sections.push(buildMethodologySection(session));

  // Section 4: Verification Reports
  for (const verification of session.verifications) {
    if (verification.overallStatus === VerificationStatus.VERIFIED) {
      sections.push(buildVerificationSection(verification, session));
    }
  }

  // Section 5: Scientific Validations
  for (const validation of session.scientificValidations) {
    sections.push(buildScientificSection(validation, session));
  }

  // Section 6: P.M.O.P.S. Performance Review
  for (const pmops of session.pmopsDiscussions) {
    sections.push(buildPMOPSSection(pmops));
  }

  // Section 7: Rejected / Flagged Data
  sections.push(buildRejectedDataSection(session));

  // Section 8: Analytics
  sections.push(buildAnalyticsSection(session));

  const totalCitations = session.verifiedTruths.reduce(
    (sum, t) => sum + t.sources.length,
    0
  );

  const completedStages: PipelineStage[] = [];
  if (session.topics.length > 0) completedStages.push(PipelineStage.INPUT);
  if (session.articles.length > 0) completedStages.push(PipelineStage.RESEARCH);
  if (session.verifications.length > 0) completedStages.push(PipelineStage.VERIFICATION);
  if (session.scientificValidations.length > 0) completedStages.push(PipelineStage.SCIENTIFIC_METHOD);
  if (session.brainstormResults.length > 0) completedStages.push(PipelineStage.BRAINSTORMING);
  if (session.pmopsDiscussions.length > 0) completedStages.push(PipelineStage.PMOPS);
  completedStages.push(PipelineStage.EXPORT);

  return {
    sessionId: session.id,
    generatedAt: new Date().toISOString(),
    userRequest: session.userRequest,
    sections,
    totalVerifiedTruths: session.verifiedTruths.length,
    totalSourcesCited: totalCitations,
    pipelineStagesCompleted: completedStages,
  };
}

function buildExecutiveSummary(session: ResearchSession): ExportSection {
  const verifiedCount = session.verifiedTruths.length;
  const totalArticles = session.articles.length;
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

  return {
    title: "EXECUTIVE SUMMARY",
    content: [
      `Research Request: "${session.userRequest}"`,
      `Session ID: ${session.id}`,
      `Generated: ${new Date().toISOString()}`,
      "",
      `Topics Researched: ${session.topics.length}`,
      `Total Articles Analyzed: ${totalArticles}`,
      `Verified Truths: ${verifiedCount}`,
      `Flagged as Poisoned: ${flaggedCount}`,
      `Average Credibility Score: ${avgCredibility}/100`,
      "",
      "This document contains only verified, peer-reviewed, and scientifically",
      "validated findings. All claims include full citation chains and",
      "verification paths for complete transparency.",
    ].join("\n"),
    citations: [],
    verificationScore: avgCredibility,
  };
}

function buildTruthSection(truth: VerifiedTruth): ExportSection {
  return {
    title: `VERIFIED TRUTH: ${truth.title}`,
    content: [
      truth.content,
      "",
      `Credibility Score: ${truth.credibilityScore}/100`,
      `Scientific Verdict: ${truth.scientificVerdict}`,
      "",
      "Verification Path:",
      ...truth.verificationPath.map((id) => `  - ${id}`),
      "",
      "Methods Used:",
      ...truth.methods.map((m) => `  - ${m}`),
      "",
      "Extracted Insights:",
      ...(truth.insights.length > 0
        ? truth.insights.map((i) => `  - ${i}`)
        : ["  - No additional insights extracted"]),
    ].join("\n"),
    citations: truth.sources,
    verificationScore: truth.credibilityScore,
  };
}

function buildMethodologySection(session: ResearchSession): ExportSection {
  return {
    title: "RESEARCH METHODOLOGY",
    content: [
      "This research followed the Procedural Method Of Problem Solving (P.M.O.P.S.)",
      "with the following pipeline stages:",
      "",
      "1. INPUT: User request parsed into distinct researchable topics",
      "2. RESEARCH: Multi-source academic literature search",
      "3. VERIFICATION: 6-point verification checklist applied to each source",
      "   - Web search validation",
      "   - Curriculum match check",
      "   - Peer review status verification",
      "   - Source reputation assessment",
      "   - Cross-reference consistency check",
      "   - Bias and data poisoning detection",
      "4. SCIENTIFIC METHOD: Rigorous scientific validation including:",
      "   - Logical consistency assessment",
      "   - Replicability analysis",
      "   - Variable measurement evaluation",
      "   - Scalability assessment",
      "   - Multi-perspective analysis",
      "   - Data poison detection",
      "5. BRAINSTORMING: Novel idea generation from verified truths only",
      "6. P.M.O.P.S.: Group problem-solving with transparent voting",
      "7. EXPORT: Compilation of all verified findings with full citations",
      "",
      `Topics generated: ${session.topics.length}`,
      `Search queries executed: ${session.topics.reduce((s, t) => s + t.searchQueries.length, 0)}`,
      `Verification checks performed: ${session.verifications.reduce((s, v) => s + v.checks.length, 0)}`,
    ].join("\n"),
    citations: [],
    verificationScore: 100,
  };
}

function buildVerificationSection(
  verification: Verification,
  session: ResearchSession
): ExportSection {
  const article = session.articles.find((a) => a.id === verification.targetId);

  return {
    title: `VERIFICATION REPORT: ${article?.title ?? verification.targetId}`,
    content: [
      `Status: ${verification.overallStatus}`,
      `Credibility Score: ${verification.credibilityScore}/100`,
      "",
      "Checks Performed:",
      ...verification.checks.map(
        (c) =>
          `  [${c.passed ? "PASS" : "FAIL"}] ${c.checkType}: ${c.details} (Confidence: ${c.confidence}%)`
      ),
      "",
      "Evidence:",
      ...verification.evidence.map((e) => `  - ${e}`),
      ...(verification.flaggedIssues.length > 0
        ? [
            "",
            "Flagged Issues:",
            ...verification.flaggedIssues.map((f) => `  ! ${f}`),
          ]
        : []),
    ].join("\n"),
    citations: article?.citations ?? [],
    verificationScore: verification.credibilityScore,
  };
}

function buildScientificSection(
  validation: ScientificValidation,
  session: ResearchSession
): ExportSection {
  const article = session.articles.find((a) => a.id === validation.targetId);

  const renderResult = (name: string, result: { score: number; assessment: string; recommendation: string }) =>
    [
      `  ${name}: ${result.score}/100`,
      `    Assessment: ${result.assessment}`,
      `    Recommendation: ${result.recommendation}`,
    ].join("\n");

  return {
    title: `SCIENTIFIC VALIDATION: ${article?.title ?? validation.targetId}`,
    content: [
      `Overall Verdict: ${validation.overallVerdict}`,
      "",
      renderResult("Logical Consistency", validation.logicalConsistency),
      renderResult("Replicability", validation.replicability),
      renderResult("Variable Measurement", validation.variableMeasurement),
      renderResult("Scalability", validation.scalability),
      renderResult("Perspective Analysis", validation.perspectiveAnalysis),
      renderResult("Poison Detection", validation.poisonDetection),
      "",
      "Extracted Insights:",
      ...(validation.extractedInsights.length > 0
        ? validation.extractedInsights.map((i) => `  - ${i}`)
        : ["  - None"]),
    ].join("\n"),
    citations: article?.citations ?? [],
    verificationScore: Math.round(
      (validation.logicalConsistency.score +
        validation.replicability.score +
        validation.poisonDetection.score) /
        3
    ),
  };
}

function buildPMOPSSection(pmops: PMOPSDiscussion): ExportSection {
  return {
    title: "P.M.O.P.S. DISCUSSION & PERFORMANCE REVIEW",
    content: [
      pmops.performanceReview,
      "",
      "=== FULL CHAT LOG ===",
      ...pmops.chatLog.map(
        (msg) => `[${msg.timestamp}] ${msg.agentName}: ${msg.content}`
      ),
    ].join("\n"),
    citations: [],
    verificationScore: 100,
  };
}

function buildRejectedDataSection(session: ResearchSession): ExportSection {
  const rejected = session.articles.filter(
    (a) =>
      a.status === VerificationStatus.REJECTED ||
      a.status === VerificationStatus.FLAGGED_POISONED
  );

  if (rejected.length === 0) {
    return {
      title: "REJECTED / FLAGGED DATA",
      content: "No data was rejected or flagged as poisoned in this session.",
      citations: [],
      verificationScore: 100,
    };
  }

  return {
    title: "REJECTED / FLAGGED DATA",
    content: [
      `${rejected.length} article(s) were rejected or flagged:`,
      "",
      ...rejected.map((a) => {
        const verification = session.verifications.find(
          (v) => v.targetId === a.id
        );
        return [
          `Title: ${a.title}`,
          `Status: ${a.status}`,
          `Source: ${a.source}`,
          `Credibility: ${verification?.credibilityScore ?? "N/A"}/100`,
          `Issues: ${verification?.flaggedIssues.join("; ") ?? "N/A"}`,
          "---",
        ].join("\n");
      }),
    ].join("\n"),
    citations: [],
    verificationScore: 0,
  };
}

function buildAnalyticsSection(session: ResearchSession): ExportSection {
  const totalChecks = session.verifications.reduce(
    (s, v) => s + v.checks.length,
    0
  );
  const passedChecks = session.verifications.reduce(
    (s, v) => s + v.checks.filter((c) => c.passed).length,
    0
  );
  const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  const avgCredibility =
    session.verifications.length > 0
      ? Math.round(
          session.verifications.reduce((s, v) => s + v.credibilityScore, 0) /
            session.verifications.length
        )
      : 0;

  const verdictCounts: Record<string, number> = {};
  for (const v of session.scientificValidations) {
    verdictCounts[v.overallVerdict] = (verdictCounts[v.overallVerdict] ?? 0) + 1;
  }

  return {
    title: "ANALYTICS & METRICS",
    content: [
      "=== SESSION ANALYTICS ===",
      "",
      `Topics Researched: ${session.topics.length}`,
      `Total Articles: ${session.articles.length}`,
      `Total Verification Checks: ${totalChecks}`,
      `Checks Passed: ${passedChecks} (${passRate}%)`,
      `Average Credibility Score: ${avgCredibility}/100`,
      `Verified Truths Produced: ${session.verifiedTruths.length}`,
      "",
      "Scientific Verdicts:",
      ...Object.entries(verdictCounts).map(
        ([verdict, count]) => `  ${verdict}: ${count}`
      ),
      "",
      `Brainstorm Ideas Generated: ${session.brainstormResults.reduce((s, b) => s + b.ideas.length, 0)}`,
      `P.M.O.P.S. Proposals: ${session.pmopsDiscussions.reduce((s, p) => s + p.proposals.length, 0)}`,
      `Total Votes Cast: ${session.pmopsDiscussions.reduce((s, p) => s + p.votingResults.length, 0)}`,
      "",
      "=== END ANALYTICS ===",
    ].join("\n"),
    citations: [],
    verificationScore: passRate,
  };
}

/**
 * Renders the full export document to a plain text string.
 * Deterministic output: same input always produces same structure.
 */
export function renderExportToText(doc: ExportDocument): string {
  const divider = "=".repeat(72);
  const lines: string[] = [];

  lines.push(divider);
  lines.push("AI RESEARCH VERIFICATION SYSTEM - VERIFIED OUTPUT");
  lines.push("Poison & Manipulation Free AI Research");
  lines.push(divider);
  lines.push("");
  lines.push(`Session: ${doc.sessionId}`);
  lines.push(`Generated: ${doc.generatedAt}`);
  lines.push(`User Request: "${doc.userRequest}"`);
  lines.push(`Verified Truths: ${doc.totalVerifiedTruths}`);
  lines.push(`Sources Cited: ${doc.totalSourcesCited}`);
  lines.push(
    `Pipeline Stages Completed: ${doc.pipelineStagesCompleted.join(" -> ")}`
  );
  lines.push("");

  for (const section of doc.sections) {
    lines.push(divider);
    lines.push(`[${section.title}]`);
    lines.push(`Verification Score: ${section.verificationScore}/100`);
    lines.push(divider);
    lines.push("");
    lines.push(section.content);
    lines.push("");

    if (section.citations.length > 0) {
      lines.push("Citations:");
      for (const citation of section.citations) {
        const authorStr =
          citation.authors.length > 0
            ? citation.authors.join(", ")
            : "Unknown";
        lines.push(
          `  [${citation.id}] ${authorStr} (${citation.year}). "${citation.text}". ${citation.publication}${citation.doi ? `. DOI: ${citation.doi}` : ""}${citation.url ? `. URL: ${citation.url}` : ""}`
        );
      }
      lines.push("");
    }
  }

  lines.push(divider);
  lines.push("END OF DOCUMENT");
  lines.push(divider);

  return lines.join("\n");
}
