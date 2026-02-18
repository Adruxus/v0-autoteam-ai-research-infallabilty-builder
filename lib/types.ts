// ============================================================
// AI Research Verification System - Core Type Definitions
// Poison & Manipulation Free AI Future
// ============================================================

/** Unique identifier type for all entities */
export type EntityId = string;

/** Timestamp in ISO 8601 format */
export type ISOTimestamp = string;

// --- Pipeline Stage Enum ---
export enum PipelineStage {
  INPUT = "input",
  RESEARCH = "research",
  VERIFICATION = "verification",
  SCIENTIFIC_METHOD = "scientific_method",
  BRAINSTORMING = "brainstorming",
  PMOPS = "pmops",
  EXPORT = "export",
}

// --- Credibility / Verification Status ---
export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
  FLAGGED_POISONED = "flagged_poisoned",
  NEEDS_REVIEW = "needs_review",
}

export enum CredibilityLevel {
  HIGH = "high",         // Peer-reviewed, replicated, in curricula
  MEDIUM = "medium",     // Cited, reputable source, not yet replicated
  LOW = "low",           // Single source, no peer review
  POISONED = "poisoned", // Detected as data-poisoned or hallucinated
}

// --- Agent Definitions ---
export enum AgentRole {
  RESEARCH_ANALYST = "research_analyst",
  VERIFICATION_SPECIALIST = "verification_specialist",
  SCIENTIFIC_VALIDATOR = "scientific_validator",
  BRAINSTORM_INNOVATOR = "brainstorm_innovator",
  PMOPS_FACILITATOR = "pmops_facilitator",
  OUTPUT_COORDINATOR = "output_coordinator",
}

export interface AgentDefinition {
  id: AgentRole;
  name: string;
  description: string;
  skills: string[];
  status: "idle" | "working" | "complete" | "error";
  currentTask?: string;
}

// --- Research Session ---
export interface ResearchSession {
  id: EntityId;
  userRequest: string;
  createdAt: ISOTimestamp;
  currentStage: PipelineStage;
  topics: Topic[];
  articles: Article[];
  verifications: Verification[];
  scientificValidations: ScientificValidation[];
  brainstormResults: BrainstormResult[];
  pmopsDiscussions: PMOPSDiscussion[];
  verifiedTruths: VerifiedTruth[];
  exportedAt?: ISOTimestamp;
}

// --- Topic ---
export interface Topic {
  id: EntityId;
  sessionId: EntityId;
  title: string;
  description: string;
  searchQueries: string[];
  createdAt: ISOTimestamp;
  status: VerificationStatus;
}

// --- Article / Source ---
export interface Article {
  id: EntityId;
  topicId: EntityId;
  title: string;
  source: string;
  url: string;
  snippet: string;
  sourceType: "peer_reviewed" | "curriculum" | "working_code" | "reputable_org" | "unknown";
  credibility: CredibilityLevel;
  citations: Citation[];
  retrievedAt: ISOTimestamp;
  status: VerificationStatus;
}

export interface Citation {
  id: EntityId;
  text: string;
  authors: string[];
  publication: string;
  year: number;
  doi?: string;
  url?: string;
}

// --- Verification ---
export interface Verification {
  id: EntityId;
  targetId: EntityId;
  targetType: "topic" | "article" | "brainstorm_result";
  checks: VerificationCheck[];
  overallStatus: VerificationStatus;
  credibilityScore: number; // 0-100
  evidence: string[];
  flaggedIssues: string[];
  verifiedAt: ISOTimestamp;
}

export interface VerificationCheck {
  id: EntityId;
  checkType: "web_search" | "curriculum_match" | "peer_review" | "source_reputation" | "cross_reference" | "bias_detection";
  description: string;
  passed: boolean;
  confidence: number; // 0-100
  details: string;
  sources: string[];
}

// --- Scientific Method Validation ---
export interface ScientificValidation {
  id: EntityId;
  targetId: EntityId;
  logicalConsistency: ValidationResult;
  replicability: ValidationResult;
  variableMeasurement: ValidationResult;
  scalability: ValidationResult;
  perspectiveAnalysis: ValidationResult;
  poisonDetection: ValidationResult;
  overallVerdict: "infallible_truth" | "needs_more_research" | "rejected" | "poisoned_data";
  extractedInsights: string[];
  validatedAt: ISOTimestamp;
}

export interface ValidationResult {
  score: number; // 0-100
  assessment: string;
  evidence: string[];
  recommendation: string;
}

// --- Brainstorming ---
export interface BrainstormResult {
  id: EntityId;
  sessionId: EntityId;
  baseTruthId: EntityId;
  ideas: BrainstormIdea[];
  novelProcedures: string[];
  methodExtensions: string[];
  crossDomainApplications: string[];
  createdAt: ISOTimestamp;
}

export interface BrainstormIdea {
  id: EntityId;
  title: string;
  description: string;
  methodology: string;
  feasibilityScore: number; // 0-100
  innovationScore: number;  // 0-100
  evidenceBasis: string[];
  status: VerificationStatus;
}

// --- P.M.O.P.S. ---
export interface PMOPSDiscussion {
  id: EntityId;
  sessionId: EntityId;
  topic: string;
  proposals: PMOPSProposal[];
  chatLog: ChatMessage[];
  votingResults: VoteResult[];
  winningProposalId?: EntityId;
  performanceReview: string;
  completedAt: ISOTimestamp;
}

export interface PMOPSProposal {
  id: EntityId;
  agentId: AgentRole;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  feasibility: number; // 0-100
  citations: string[];
}

export interface ChatMessage {
  id: EntityId;
  agentId: AgentRole;
  agentName: string;
  content: string;
  timestamp: ISOTimestamp;
  referencedSources?: string[];
}

export interface VoteResult {
  agentId: AgentRole;
  agentName: string;
  proposalId: EntityId;
  reasoning: string;
  timestamp: ISOTimestamp;
}

// --- Verified Truth (Final Output) ---
export interface VerifiedTruth {
  id: EntityId;
  sessionId: EntityId;
  title: string;
  content: string;
  verificationPath: EntityId[]; // IDs of all verifications this passed through
  credibilityScore: number;
  scientificVerdict: string;
  sources: Citation[];
  methods: string[];
  insights: string[];
  exportedAt?: ISOTimestamp;
}

// --- Export ---
export interface ExportDocument {
  sessionId: EntityId;
  generatedAt: ISOTimestamp;
  userRequest: string;
  sections: ExportSection[];
  totalVerifiedTruths: number;
  totalSourcesCited: number;
  pipelineStagesCompleted: PipelineStage[];
}

export interface ExportSection {
  title: string;
  content: string;
  citations: Citation[];
  verificationScore: number;
}

// --- API Request/Response ---
export interface PipelineRequest {
  sessionId?: EntityId;
  userRequest: string;
  stage: PipelineStage;
}

export interface PipelineResponse {
  sessionId: EntityId;
  stage: PipelineStage;
  status: "success" | "error" | "in_progress";
  data: Partial<ResearchSession>;
  agentLogs: ChatMessage[];
  errors?: string[];
}
