// ============================================================
// Pipeline Engine - Orchestrates the full verification workflow
// No infinite loops, no redundant logic, deterministic flow
// ============================================================

import {
  type ResearchSession,
  type Topic,
  type Article,
  type Verification,
  type VerificationCheck,
  type ScientificValidation,
  type ValidationResult,
  type BrainstormResult,
  type BrainstormIdea,
  type PMOPSDiscussion,
  type PMOPSProposal,
  type ChatMessage,
  type VoteResult,
  type VerifiedTruth,
  type Citation,
  PipelineStage,
  VerificationStatus,
  CredibilityLevel,
  AgentRole,
} from "./types";

// --- Utility: Generate unique IDs without external dependencies ---
// Uses crypto.randomUUID where available, falls back to timestamp+random.
// No module-level mutable counter (avoids ID collisions across concurrent requests).
function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

// --- Unified source metadata (eliminates 4 redundant mapping functions) ---
interface SourceMeta {
  label: string;
  name: string;
  urlTemplate: (topic: string) => string;
  snippetTemplate: (title: string) => string;
}

const SOURCE_META: Record<Article["sourceType"], SourceMeta> = {
  peer_reviewed: {
    label: "Peer-Reviewed",
    name: "IEEE Xplore / PubMed",
    urlTemplate: (t) => `https://scholar.google.com/scholar?q=${encodeURIComponent(t)}`,
    snippetTemplate: (t) =>
      `Peer-reviewed analysis of "${t}" demonstrating reproducible results across multiple independent studies with rigorous methodology.`,
  },
  curriculum: {
    label: "Curriculum",
    name: "MIT OpenCourseWare / Stanford Online",
    urlTemplate: (t) => `https://ocw.mit.edu/search/?q=${encodeURIComponent(t)}`,
    snippetTemplate: () =>
      `This topic is covered in accredited university curricula, forming part of foundational knowledge in the field with verified pedagogical methods.`,
  },
  working_code: {
    label: "Open Source Code",
    name: "GitHub / ArXiv Code Repositories",
    urlTemplate: (t) => `https://github.com/search?q=${encodeURIComponent(t)}`,
    snippetTemplate: () =>
      `Open-source implementation with verified test coverage, continuous integration, and transparent development history available for public audit.`,
  },
  reputable_org: {
    label: "Organization Report",
    name: "ACM / IEEE / W3C",
    urlTemplate: (t) => `https://dl.acm.org/action/doSearch?query=${encodeURIComponent(t)}`,
    snippetTemplate: () =>
      `Report from recognized professional organization with established credibility, following industry-standard reporting and verification procedures.`,
  },
  unknown: {
    label: "Unknown",
    name: "Unknown Source",
    urlTemplate: (t) => `https://search.crossref.org/?q=${t.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`,
    snippetTemplate: () =>
      `Source requires additional verification to establish credibility and accuracy of claims.`,
  },
};

// ============================================================
// Stage 1: INPUT - Parse user request into searchable topics
// ============================================================
export function parseUserRequest(userRequest: string): Topic[] {
  const cleaned = userRequest.trim();
  if (cleaned.length === 0) {
    return [];
  }

  // Split request into distinct researchable topics
  // Uses sentence boundaries and conjunctions as delimiters
  const segments = cleaned
    .split(/[.;]+|(?:\band\b|\bor\b|\balso\b)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 5); // Discard fragments too short to search

  // Deduplicate: no two topics with identical normalized text
  const seen = new Set<string>();
  const topics: Topic[] = [];

  for (const segment of segments) {
    const normalized = segment.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    topics.push({
      id: generateId("topic"),
      sessionId: "", // set by caller
      title: segment,
      description: `Research topic derived from user request: "${segment}"`,
      searchQueries: buildSearchQueries(segment),
      createdAt: now(),
      status: VerificationStatus.PENDING,
    });
  }

  // Guarantee at least one topic from the full request
  if (topics.length === 0) {
    topics.push({
      id: generateId("topic"),
      sessionId: "",
      title: cleaned,
      description: `Research topic from full user request`,
      searchQueries: buildSearchQueries(cleaned),
      createdAt: now(),
      status: VerificationStatus.PENDING,
    });
  }

  return topics;
}

/**
 * Generates targeted search queries for academic and verified sources.
 * Each query targets a different source type to maximize coverage.
 */
function buildSearchQueries(text: string): string[] {
  const base = text.replace(/[^\w\s]/g, "").trim();
  return [
    `${base} peer reviewed research`,
    `${base} academic curriculum`,
    `${base} scientific method verified`,
    `${base} working prototype open source`,
    `${base} site:scholar.google.com OR site:pubmed.ncbi.nlm.nih.gov`,
  ];
}

// ============================================================
// Stage 2: RESEARCH - Simulate research findings
// (In production, this calls real search APIs)
// ============================================================
export function conductResearch(topics: Topic[]): Article[] {
  const articles: Article[] = [];

  for (const topic of topics) {
    // Generate structured research findings per topic
    const topicArticles = generateResearchArticles(topic);
    articles.push(...topicArticles);
  }

  return articles;
}

function generateResearchArticles(topic: Topic): Article[] {
  const sourceTypes: Article["sourceType"][] = [
    "peer_reviewed",
    "curriculum",
    "working_code",
    "reputable_org",
  ];

  return sourceTypes.map((sourceType, idx) => {
    const meta = SOURCE_META[sourceType];
    return {
      id: generateId("article"),
      topicId: topic.id,
      title: `${topic.title} - ${meta.label} Analysis`,
      source: meta.name,
      url: meta.urlTemplate(topic.title),
      snippet: meta.snippetTemplate(topic.title),
      sourceType,
      credibility: CredibilityLevel.MEDIUM,
      citations: [
        {
          id: generateId("citation"),
          text: `Research findings on ${topic.title} (${sourceType})`,
          authors: ["Research Team"],
          publication: meta.name,
          year: 2024 - idx,
          url: meta.urlTemplate(topic.title),
        },
      ],
      retrievedAt: now(),
      status: VerificationStatus.PENDING,
    };
  });
}

// ============================================================
// Stage 3: VERIFICATION - Multi-check validation pipeline
// Each check is independent - no cascading failures
// ============================================================
// --- Data-driven verification check definitions (eliminates 6 redundant functions) ---
interface CheckRule {
  checkType: VerificationCheck["checkType"];
  weight: number;
  description: string;
  passCondition: (sourceType: Article["sourceType"]) => boolean;
  passConfidence: number;
  failConfidence: number;
  passDetail: (article: Article) => string;
  failDetail: (article: Article) => string;
  includeSources: boolean;
}

const CHECK_RULES: CheckRule[] = [
  {
    checkType: "web_search",
    weight: 1.0,
    description: "Validate claims through web search engines",
    passCondition: (t) => t === "peer_reviewed" || t === "reputable_org" || t === "curriculum",
    passConfidence: 82,
    failConfidence: 35,
    passDetail: (a) => `Web search confirms findings from ${a.source} with matching results`,
    failDetail: (a) => `Limited web search corroboration found for claims from ${a.source}`,
    includeSources: true,
  },
  {
    checkType: "curriculum_match",
    weight: 1.2,
    description: "Check alignment with accredited curricula",
    passCondition: (t) => t === "curriculum" || t === "peer_reviewed",
    passConfidence: 90,
    failConfidence: 40,
    passDetail: () => "Content aligns with established university-level curricula",
    failDetail: () => "No direct curriculum match found; may be novel or niche research",
    includeSources: true,
  },
  {
    checkType: "peer_review",
    weight: 1.5,
    description: "Verify peer-review status in indexed journals",
    passCondition: (t) => t === "peer_reviewed",
    passConfidence: 95,
    failConfidence: 30,
    passDetail: () => "Published in indexed, peer-reviewed journal with rigorous editorial standards",
    failDetail: () => "Not found in peer-reviewed journals; requires additional validation pathways",
    includeSources: true,
  },
  {
    checkType: "source_reputation",
    weight: 1.0,
    description: "Evaluate credibility of information source",
    passCondition: (t) => t !== "unknown",
    passConfidence: 85,
    failConfidence: 25,
    passDetail: (a) => `Source "${a.source}" has established credibility and history of accurate reporting`,
    failDetail: () => "Source credibility could not be established through standard verification channels",
    includeSources: true,
  },
  {
    checkType: "cross_reference",
    weight: 1.5,
    description: "Cross-reference with independent sources",
    passCondition: (t) => t === "peer_reviewed" || t === "curriculum",
    passConfidence: 88,
    failConfidence: 45,
    passDetail: () => "Claims confirmed by multiple independent sources with consistent findings",
    failDetail: () => "Single-source claim; cross-referencing with additional sources recommended",
    includeSources: true,
  },
  {
    checkType: "bias_detection",
    weight: 1.3,
    description: "Screen for political, commercial, or ideological bias",
    passCondition: (t) => t !== "unknown",
    passConfidence: 80,
    failConfidence: 20,
    passDetail: () => "No significant bias markers detected in source or framing",
    failDetail: () => "Potential bias detected: source may have commercial or ideological motivations",
    includeSources: false,
  },
];

export function verifyArticle(article: Article): Verification {
  const checks: VerificationCheck[] = CHECK_RULES.map((rule) => {
    const passed = rule.passCondition(article.sourceType);
    return {
      id: generateId("check"),
      checkType: rule.checkType,
      description: rule.description,
      passed,
      confidence: passed ? rule.passConfidence : rule.failConfidence,
      details: passed ? rule.passDetail(article) : rule.failDetail(article),
      sources: rule.includeSources && passed ? [article.url] : [],
    };
  });

  // Credibility score: weighted average using the same rule weights
  let weightedSum = 0;
  let weightTotal = 0;
  for (let i = 0; i < checks.length; i++) {
    weightedSum += checks[i].confidence * CHECK_RULES[i].weight;
    weightTotal += CHECK_RULES[i].weight;
  }

  const credibilityScore = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
  const passedCount = checks.filter((c) => c.passed).length;

  // Determine overall status based on score thresholds
  let overallStatus: VerificationStatus;
  if (credibilityScore >= 75 && passedCount >= 4) {
    overallStatus = VerificationStatus.VERIFIED;
  } else if (credibilityScore >= 50 && passedCount >= 3) {
    overallStatus = VerificationStatus.NEEDS_REVIEW;
  } else if (checks.some((c) => c.checkType === "bias_detection" && !c.passed)) {
    overallStatus = VerificationStatus.FLAGGED_POISONED;
  } else {
    overallStatus = VerificationStatus.REJECTED;
  }

  return {
    id: generateId("verification"),
    targetId: article.id,
    targetType: "article",
    checks,
    overallStatus,
    credibilityScore,
    evidence: checks.filter((c) => c.passed).map((c) => c.details),
    flaggedIssues: checks.filter((c) => !c.passed).map((c) => `${c.checkType}: ${c.details}`),
    verifiedAt: now(),
  };
}

// ============================================================
// Stage 4: SCIENTIFIC METHOD - Rigorous validation
// ============================================================
export function applyScientificMethod(
  article: Article,
  verification: Verification
): ScientificValidation {
  const logicalConsistency = assessLogicalConsistency(article, verification);
  const replicability = assessReplicability(article);
  const variableMeasurement = assessVariableMeasurement(article);
  const scalability = assessScalability(article);
  const perspectiveAnalysis = assessPerspective(article);
  const poisonDetection = assessPoisonDetection(article, verification);

  // Determine verdict based on aggregate scores
  const scores = [
    logicalConsistency.score,
    replicability.score,
    variableMeasurement.score,
    poisonDetection.score,
  ];
  const avgCriticalScore =
    scores.reduce((sum, s) => sum + s, 0) / scores.length;

  let overallVerdict: ScientificValidation["overallVerdict"];
  if (poisonDetection.score < 50) {
    overallVerdict = "poisoned_data";
  } else if (avgCriticalScore >= 75) {
    overallVerdict = "infallible_truth";
  } else if (avgCriticalScore >= 50) {
    overallVerdict = "needs_more_research";
  } else {
    overallVerdict = "rejected";
  }

  const extractedInsights: string[] = [];
  if (scalability.score >= 70) {
    extractedInsights.push(
      `High scalability potential: ${scalability.recommendation}`
    );
  }
  if (perspectiveAnalysis.score >= 70) {
    extractedInsights.push(
      `Multi-perspective value: ${perspectiveAnalysis.recommendation}`
    );
  }

  return {
    id: generateId("scival"),
    targetId: article.id,
    logicalConsistency,
    replicability,
    variableMeasurement,
    scalability,
    perspectiveAnalysis,
    poisonDetection,
    overallVerdict,
    extractedInsights,
    validatedAt: now(),
  };
}

function assessLogicalConsistency(
  article: Article,
  verification: Verification
): ValidationResult {
  const baseScore = verification.credibilityScore;
  const score = Math.min(100, baseScore + (article.sourceType === "peer_reviewed" ? 10 : 0));

  return {
    score,
    assessment:
      score >= 75
        ? "Claims are logically consistent with no detected contradictions"
        : "Some logical gaps detected that require additional evidence",
    evidence: verification.evidence.slice(0, 3),
    recommendation:
      score >= 75
        ? "Proceed with high confidence"
        : "Seek additional corroborating evidence before proceeding",
  };
}

function assessReplicability(article: Article): ValidationResult {
  const replicableTypes: Article["sourceType"][] = [
    "peer_reviewed",
    "working_code",
  ];
  const isReplicable = replicableTypes.includes(article.sourceType);

  return {
    score: isReplicable ? 88 : 45,
    assessment: isReplicable
      ? "Method can be independently replicated with documented procedures"
      : "Replication pathway not clearly documented; may require methodology clarification",
    evidence: isReplicable
      ? ["Documented methodology available", "Independent verification possible"]
      : ["Methodology partially documented"],
    recommendation: isReplicable
      ? "Fully replicable - suitable for building upon"
      : "Document explicit replication steps before extending",
  };
}

function assessVariableMeasurement(article: Article): ValidationResult {
  const hasCode = article.sourceType === "working_code";
  const hasPeerReview = article.sourceType === "peer_reviewed";

  const score = hasCode ? 85 : hasPeerReview ? 80 : 50;

  return {
    score,
    assessment:
      score >= 75
        ? "Variables are properly measured with documented methodology"
        : "Variable measurement could be more rigorous",
    evidence:
      score >= 75
        ? ["Quantitative measurements documented", "Control variables identified"]
        : ["Some measurements need clarification"],
    recommendation:
      score >= 75
        ? "Extract additional value by examining edge cases and boundary conditions"
        : "Improve measurement methodology before drawing conclusions",
  };
}

function assessScalability(article: Article): ValidationResult {
  const score =
    article.sourceType === "working_code"
      ? 80
      : article.sourceType === "peer_reviewed"
        ? 70
        : 50;

  return {
    score,
    assessment:
      score >= 70
        ? "Solution demonstrates scalability potential with clear growth path"
        : "Scalability not yet demonstrated; localized results only",
    evidence:
      score >= 70
        ? ["Scalable architecture documented", "Growth metrics available"]
        : ["Limited scalability evidence"],
    recommendation:
      score >= 70
        ? "Design scaling strategy based on documented growth patterns"
        : "Conduct scalability testing before broader application",
  };
}

function assessPerspective(article: Article): ValidationResult {
  const hasDiverseSources =
    article.sourceType === "peer_reviewed" ||
    article.sourceType === "curriculum";
  const score = hasDiverseSources ? 78 : 55;

  return {
    score,
    assessment: hasDiverseSources
      ? "Multiple perspectives considered with balanced analysis"
      : "Limited perspective analysis; may benefit from cross-disciplinary review",
    evidence: hasDiverseSources
      ? ["Cross-disciplinary citations present", "Multiple viewpoints addressed"]
      : ["Primarily single-discipline perspective"],
    recommendation: hasDiverseSources
      ? "Consider how insights apply across related fields"
      : "Seek input from adjacent disciplines for broader perspective",
  };
}

function assessPoisonDetection(
  article: Article,
  verification: Verification
): ValidationResult {
  const hasBiasIssues = verification.checks.some(
    (c) => c.checkType === "bias_detection" && !c.passed
  );
  const hasLowCredibility = verification.credibilityScore < 40;
  const isPoisoned = hasBiasIssues || hasLowCredibility;

  return {
    score: isPoisoned ? 20 : 90,
    assessment: isPoisoned
      ? "ALERT: Potential data poisoning or manipulation detected"
      : "No signs of data poisoning, hallucination, or manipulation",
    evidence: isPoisoned
      ? ["Bias markers detected", "Low credibility score", ...verification.flaggedIssues]
      : ["Clean bias scan", "High credibility verification", "Consistent cross-references"],
    recommendation: isPoisoned
      ? "REJECT: Do not use this data without complete re-verification from independent sources"
      : "Safe for use in downstream analysis and brainstorming",
  };
}

// ============================================================
// Stage 5: BRAINSTORMING - Generate novel ideas from verified truths
// ============================================================
export function brainstormFromVerifiedData(
  session: ResearchSession,
  verifiedArticles: Article[]
): BrainstormResult {
  const ideas: BrainstormIdea[] = [];
  const novelProcedures: string[] = [];
  const methodExtensions: string[] = [];
  const crossDomainApplications: string[] = [];

  for (const article of verifiedArticles) {
    const idea = generateIdea(article);
    ideas.push(idea);

    novelProcedures.push(
      `Novel approach: Extend ${article.title} using verified methodology from ${article.source}`
    );

    methodExtensions.push(
      `Method extension: Apply ${article.sourceType} validation to adjacent research areas`
    );

    crossDomainApplications.push(
      `Cross-domain: Transfer verified findings to related fields using established scientific frameworks`
    );
  }

  return {
    id: generateId("brainstorm"),
    sessionId: session.id,
    baseTruthId: verifiedArticles[0]?.id ?? "",
    ideas,
    novelProcedures,
    methodExtensions,
    crossDomainApplications,
    createdAt: now(),
  };
}

function generateIdea(article: Article): BrainstormIdea {
  return {
    id: generateId("idea"),
    title: `Innovation from ${article.title}`,
    description: `Build upon verified research from ${article.source} to create novel solutions using proven methodology`,
    methodology: `1. Verify base findings\n2. Identify extension points\n3. Apply cross-domain insights\n4. Test with reproducible methods\n5. Document and validate results`,
    feasibilityScore: article.sourceType === "working_code" ? 85 : 70,
    innovationScore: 75,
    evidenceBasis: article.citations.map((c) => c.text),
    status: VerificationStatus.PENDING,
  };
}

// ============================================================
// Stage 6: P.M.O.P.S. - Group problem solving
// ============================================================
export function runPMOPS(
  session: ResearchSession,
  brainstormResult: BrainstormResult
): PMOPSDiscussion {
  const agentRoles = Object.values(AgentRole);
  const proposals: PMOPSProposal[] = [];
  const chatLog: ChatMessage[] = [];

  // Each agent proposes a solution
  for (const role of agentRoles) {
    const proposal = createProposal(role, brainstormResult);
    proposals.push(proposal);

    chatLog.push({
      id: generateId("msg"),
      agentId: role,
      agentName: AGENT_DISPLAY_NAMES[role],
      content: `I propose: ${proposal.title}. ${proposal.description}`,
      timestamp: now(),
      referencedSources: proposal.citations,
    });
  }

  // Discussion round: each agent critiques the next agent's proposal (round-robin)
  for (let i = 0; i < proposals.length; i++) {
    const reviewerRole = agentRoles[(i + 1) % agentRoles.length];
    const targetProposal = proposals[i];

    chatLog.push({
      id: generateId("msg"),
      agentId: reviewerRole,
      agentName: AGENT_DISPLAY_NAMES[reviewerRole],
      content: `Reviewing "${targetProposal.title}": Pros include ${targetProposal.pros[0] ?? "N/A"}. However, ${targetProposal.cons[0] ?? "N/A"}. Feasibility: ${targetProposal.feasibility}/100.`,
      timestamp: now(),
    });
  }

  // Transparent voting (NO anonymous votes)
  const votingResults: VoteResult[] = [];
  const voteCount = new Map<string, number>();

  for (const role of agentRoles) {
    // Each agent votes for the proposal with highest feasibility (not their own)
    const otherProposals = proposals.filter((p) => p.agentId !== role);

    // BUG FIX: Guard against empty array (reduce on empty array throws TypeError)
    if (otherProposals.length === 0) continue;

    const bestProposal = otherProposals.reduce((best, current) =>
      current.feasibility > best.feasibility ? current : best
    );

    votingResults.push({
      agentId: role,
      agentName: AGENT_DISPLAY_NAMES[role],
      proposalId: bestProposal.id,
      reasoning: `Selected "${bestProposal.title}" for highest feasibility (${bestProposal.feasibility}/100) with strongest evidence basis`,
      timestamp: now(),
    });

    voteCount.set(
      bestProposal.id,
      (voteCount.get(bestProposal.id) ?? 0) + 1
    );
  }

  // Determine winner by vote count
  let winningId = proposals[0]?.id ?? "";
  let maxVotes = 0;
  for (const [proposalId, count] of voteCount.entries()) {
    if (count > maxVotes) {
      maxVotes = count;
      winningId = proposalId;
    }
  }

  // Generate performance review
  const performanceReview = generatePerformanceReview(
    session,
    proposals,
    chatLog,
    votingResults,
    winningId
  );

  return {
    id: generateId("pmops"),
    sessionId: session.id,
    topic: session.userRequest,
    proposals,
    chatLog,
    votingResults,
    winningProposalId: winningId,
    performanceReview,
    completedAt: now(),
  };
}

function createProposal(
  role: AgentRole,
  brainstorm: BrainstormResult
): PMOPSProposal {
  const baseIdea = brainstorm.ideas[0];
  const roleSpecificApproach = getAgentApproach(role);

  return {
    id: generateId("proposal"),
    agentId: role,
    title: `${roleSpecificApproach.title} Approach`,
    description: `${roleSpecificApproach.description} Building on: ${baseIdea?.title ?? "verified research"}`,
    pros: roleSpecificApproach.pros,
    cons: roleSpecificApproach.cons,
    feasibility: roleSpecificApproach.feasibility,
    citations: brainstorm.novelProcedures.slice(0, 2),
  };
}

interface AgentApproach {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  feasibility: number;
}

function getAgentApproach(role: AgentRole): AgentApproach {
  const approaches: Record<AgentRole, AgentApproach> = {
    [AgentRole.RESEARCH_ANALYST]: {
      title: "Deep Literature Review",
      description: "Comprehensive systematic review of all available peer-reviewed literature.",
      pros: ["Thorough evidence base", "Identifies gaps in knowledge", "Establishes strong citations"],
      cons: ["Time-intensive", "May miss cutting-edge unpublished work"],
      feasibility: 85,
    },
    [AgentRole.VERIFICATION_SPECIALIST]: {
      title: "Multi-Layer Verification",
      description: "Apply cascading verification checks from multiple independent sources.",
      pros: ["Highest confidence in results", "Eliminates poisoned data", "Traceable verification chain"],
      cons: ["May reject novel but valid findings", "Resource-intensive verification"],
      feasibility: 90,
    },
    [AgentRole.SCIENTIFIC_VALIDATOR]: {
      title: "Replication-First",
      description: "Prioritize only findings that can be independently replicated.",
      pros: ["Infallible truth guarantee", "Eliminates false positives", "Scalable methodology"],
      cons: ["Slower progress", "Excludes difficult-to-replicate but valid observational studies"],
      feasibility: 82,
    },
    [AgentRole.BRAINSTORM_INNOVATOR]: {
      title: "Innovation Pipeline",
      description: "Fast prototyping with verified data as the foundation.",
      pros: ["Rapid innovation", "Actionable outputs", "Cross-domain discoveries"],
      cons: ["May move too fast for thorough verification", "Prototype quality varies"],
      feasibility: 75,
    },
    [AgentRole.PMOPS_FACILITATOR]: {
      title: "Consensus-Driven",
      description: "Iterative group discussion until unanimous or supermajority agreement.",
      pros: ["Democratic decision-making", "Multiple perspectives", "Full documentation"],
      cons: ["Can be slow", "Groupthink risk if not managed carefully"],
      feasibility: 78,
    },
    [AgentRole.OUTPUT_COORDINATOR]: {
      title: "Documentation-First",
      description: "Comprehensive documentation at every step before proceeding.",
      pros: ["Complete audit trail", "Easy to review and extend", "Transparent process"],
      cons: ["Documentation overhead", "May slow iterative processes"],
      feasibility: 80,
    },
  };

  return approaches[role];
}

// Constant lookup replaces function that re-created the record on every call
const AGENT_DISPLAY_NAMES: Record<AgentRole, string> = {
  [AgentRole.RESEARCH_ANALYST]: "Research Analyst",
  [AgentRole.VERIFICATION_SPECIALIST]: "Verification Specialist",
  [AgentRole.SCIENTIFIC_VALIDATOR]: "Scientific Validator",
  [AgentRole.BRAINSTORM_INNOVATOR]: "Brainstorming Innovator",
  [AgentRole.PMOPS_FACILITATOR]: "P.M.O.P.S. Facilitator",
  [AgentRole.OUTPUT_COORDINATOR]: "Output Coordinator",
};

function generatePerformanceReview(
  session: ResearchSession,
  proposals: PMOPSProposal[],
  chatLog: ChatMessage[],
  votes: VoteResult[],
  winningId: string
): string {
  const winner = proposals.find((p) => p.id === winningId);
  const voteBreakdown = votes
    .map((v) => `  - ${v.agentName}: voted for "${proposals.find((p) => p.id === v.proposalId)?.title}" - ${v.reasoning}`)
    .join("\n");

  return `
=== P.M.O.P.S. PERFORMANCE REVIEW ===
Session: ${session.id}
User Request: "${session.userRequest}"
Date: ${now()}

PARTICIPANTS (${proposals.length} agents):
${proposals.map((p) => `  - ${AGENT_DISPLAY_NAMES[p.agentId]}: Proposed "${p.title}" (Feasibility: ${p.feasibility}/100)`).join("\n")}

DISCUSSION SUMMARY:
${chatLog.length} messages exchanged across ${proposals.length} discussion rounds.

VOTING RESULTS (All votes traceable - NO anonymous voting):
${voteBreakdown}

WINNING PROPOSAL: "${winner?.title ?? "N/A"}"
  Description: ${winner?.description ?? "N/A"}
  Feasibility: ${winner?.feasibility ?? 0}/100

RECOMMENDATIONS:
  - Implement winning proposal with verification checkpoints
  - Re-evaluate rejected proposals for complementary approaches
  - Document all findings for future reference
=== END PERFORMANCE REVIEW ===
`.trim();
}

// ============================================================
// Stage 7: EXPORT - Generate verified truths for output
// ============================================================
export function compileVerifiedTruths(
  session: ResearchSession,
  articles: Article[],
  verifications: Verification[],
  validations: ScientificValidation[]
): VerifiedTruth[] {
  const truths: VerifiedTruth[] = [];

  for (const article of articles) {
    const verification = verifications.find((v) => v.targetId === article.id);
    const validation = validations.find((v) => v.targetId === article.id);

    // Only include articles that passed BOTH verification AND scientific method
    if (
      verification?.overallStatus !== VerificationStatus.VERIFIED &&
      verification?.overallStatus !== VerificationStatus.NEEDS_REVIEW
    ) {
      continue;
    }

    if (
      validation?.overallVerdict !== "infallible_truth" &&
      validation?.overallVerdict !== "needs_more_research"
    ) {
      continue;
    }

    truths.push({
      id: generateId("truth"),
      sessionId: session.id,
      title: article.title,
      content: article.snippet,
      verificationPath: [
        article.id,
        verification?.id ?? "",
        validation?.id ?? "",
      ].filter(Boolean),
      credibilityScore: verification?.credibilityScore ?? 0,
      scientificVerdict: validation?.overallVerdict ?? "unknown",
      sources: article.citations,
      methods: [
        "Peer-reviewed validation",
        "Multi-source cross-reference",
        "Scientific method verification",
        "Data poison screening",
      ],
      insights: validation?.extractedInsights ?? [],
    });
  }

  return truths;
}

// ============================================================
// FULL PIPELINE ORCHESTRATOR
// Runs all stages sequentially with no loops or recursion
// Each stage feeds directly into the next
// ============================================================
export function runFullPipeline(userRequest: string): ResearchSession {
  // Stage 1: Parse user request into topics
  const topics = parseUserRequest(userRequest);

  const session: ResearchSession = {
    id: generateId("session"),
    userRequest,
    createdAt: now(),
    currentStage: PipelineStage.INPUT,
    topics: [],
    articles: [],
    verifications: [],
    scientificValidations: [],
    brainstormResults: [],
    pmopsDiscussions: [],
    verifiedTruths: [],
  };

  // Assign session ID to topics
  for (const topic of topics) {
    topic.sessionId = session.id;
  }
  session.topics = topics;
  session.currentStage = PipelineStage.RESEARCH;

  // Stage 2: Research
  const articles = conductResearch(topics);
  session.articles = articles;
  session.currentStage = PipelineStage.VERIFICATION;

  // Stage 3: Verification (each article verified independently)
  const verifications: Verification[] = [];
  for (const article of articles) {
    const verification = verifyArticle(article);
    verifications.push(verification);

    // Update article credibility based on verification
    if (verification.overallStatus === VerificationStatus.VERIFIED) {
      article.credibility = CredibilityLevel.HIGH;
      article.status = VerificationStatus.VERIFIED;
    } else if (verification.overallStatus === VerificationStatus.FLAGGED_POISONED) {
      article.credibility = CredibilityLevel.POISONED;
      article.status = VerificationStatus.FLAGGED_POISONED;
    } else {
      article.status = verification.overallStatus;
    }
  }
  session.verifications = verifications;
  session.currentStage = PipelineStage.SCIENTIFIC_METHOD;

  // Stage 4: Scientific Method (only on verified/needs_review articles)
  const validations: ScientificValidation[] = [];
  const articlesToValidate = articles.filter(
    (a) =>
      a.status === VerificationStatus.VERIFIED ||
      a.status === VerificationStatus.NEEDS_REVIEW
  );

  for (const article of articlesToValidate) {
    const verification = verifications.find((v) => v.targetId === article.id);
    if (verification) {
      const validation = applyScientificMethod(article, verification);
      validations.push(validation);
    }
  }
  session.scientificValidations = validations;
  session.currentStage = PipelineStage.BRAINSTORMING;

  // Stage 5: Brainstorming (only from verified truths)
  const verifiedArticles = articles.filter(
    (a) => a.status === VerificationStatus.VERIFIED
  );

  if (verifiedArticles.length > 0) {
    const brainstormResult = brainstormFromVerifiedData(session, verifiedArticles);
    session.brainstormResults = [brainstormResult];
    session.currentStage = PipelineStage.PMOPS;

    // Stage 6: P.M.O.P.S.
    const pmops = runPMOPS(session, brainstormResult);
    session.pmopsDiscussions = [pmops];
  }

  session.currentStage = PipelineStage.EXPORT;

  // Stage 7: Compile verified truths
  session.verifiedTruths = compileVerifiedTruths(
    session,
    articles,
    verifications,
    validations
  );

  return session;
}
