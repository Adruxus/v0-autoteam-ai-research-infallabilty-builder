"""
Core type definitions for the AI Research Verification System.
Uses dataclasses for clean, immutable data structures.
No circular imports, no mutable module-level state.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


# --- Enums ---

class PipelineStage(str, Enum):
    INPUT = "input"
    RESEARCH = "research"
    VERIFICATION = "verification"
    SCIENTIFIC_METHOD = "scientific_method"
    BRAINSTORMING = "brainstorming"
    PMOPS = "pmops"
    EXPORT = "export"


class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    FLAGGED_POISONED = "flagged_poisoned"
    NEEDS_REVIEW = "needs_review"


class CredibilityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    POISONED = "poisoned"


class AgentRole(str, Enum):
    RESEARCH_ANALYST = "research_analyst"
    VERIFICATION_SPECIALIST = "verification_specialist"
    SCIENTIFIC_VALIDATOR = "scientific_validator"
    BRAINSTORM_INNOVATOR = "brainstorm_innovator"
    PMOPS_FACILITATOR = "pmops_facilitator"
    OUTPUT_COORDINATOR = "output_coordinator"


# --- Utility ---

def generate_id(prefix: str) -> str:
    """Generate a unique ID. No shared mutable counter."""
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def now_iso() -> str:
    """Current UTC time in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


# --- Data Classes ---

@dataclass
class Citation:
    id: str = field(default_factory=lambda: generate_id("cit"))
    text: str = ""
    authors: list[str] = field(default_factory=list)
    publication: str = ""
    year: int = 2024
    doi: Optional[str] = None
    url: Optional[str] = None


@dataclass
class Topic:
    id: str = field(default_factory=lambda: generate_id("topic"))
    session_id: str = ""
    title: str = ""
    description: str = ""
    search_queries: list[str] = field(default_factory=list)
    created_at: str = field(default_factory=now_iso)
    status: VerificationStatus = VerificationStatus.PENDING


@dataclass
class Article:
    id: str = field(default_factory=lambda: generate_id("article"))
    topic_id: str = ""
    title: str = ""
    source: str = ""
    url: str = ""
    snippet: str = ""
    source_type: str = "unknown"  # peer_reviewed | curriculum | working_code | reputable_org | unknown
    credibility: CredibilityLevel = CredibilityLevel.MEDIUM
    citations: list[Citation] = field(default_factory=list)
    retrieved_at: str = field(default_factory=now_iso)
    status: VerificationStatus = VerificationStatus.PENDING


@dataclass
class VerificationCheck:
    id: str = field(default_factory=lambda: generate_id("chk"))
    check_type: str = ""
    description: str = ""
    passed: bool = False
    confidence: int = 0
    details: str = ""
    sources: list[str] = field(default_factory=list)


@dataclass
class Verification:
    id: str = field(default_factory=lambda: generate_id("ver"))
    target_id: str = ""
    target_type: str = "article"
    checks: list[VerificationCheck] = field(default_factory=list)
    overall_status: VerificationStatus = VerificationStatus.PENDING
    credibility_score: int = 0
    evidence: list[str] = field(default_factory=list)
    flagged_issues: list[str] = field(default_factory=list)
    verified_at: str = field(default_factory=now_iso)


@dataclass
class ValidationResult:
    score: int = 0
    assessment: str = ""
    evidence: list[str] = field(default_factory=list)
    recommendation: str = ""


@dataclass
class ScientificValidation:
    id: str = field(default_factory=lambda: generate_id("scival"))
    target_id: str = ""
    logical_consistency: ValidationResult = field(default_factory=ValidationResult)
    replicability: ValidationResult = field(default_factory=ValidationResult)
    variable_measurement: ValidationResult = field(default_factory=ValidationResult)
    scalability: ValidationResult = field(default_factory=ValidationResult)
    perspective_analysis: ValidationResult = field(default_factory=ValidationResult)
    poison_detection: ValidationResult = field(default_factory=ValidationResult)
    overall_verdict: str = "needs_more_research"
    extracted_insights: list[str] = field(default_factory=list)
    validated_at: str = field(default_factory=now_iso)


@dataclass
class BrainstormIdea:
    id: str = field(default_factory=lambda: generate_id("idea"))
    title: str = ""
    description: str = ""
    methodology: str = ""
    feasibility_score: int = 0
    innovation_score: int = 0
    evidence_basis: list[str] = field(default_factory=list)
    status: VerificationStatus = VerificationStatus.PENDING


@dataclass
class BrainstormResult:
    id: str = field(default_factory=lambda: generate_id("brn"))
    session_id: str = ""
    base_truth_id: str = ""
    ideas: list[BrainstormIdea] = field(default_factory=list)
    novel_procedures: list[str] = field(default_factory=list)
    method_extensions: list[str] = field(default_factory=list)
    cross_domain_applications: list[str] = field(default_factory=list)
    created_at: str = field(default_factory=now_iso)


@dataclass
class ChatMessage:
    id: str = field(default_factory=lambda: generate_id("msg"))
    agent_id: str = ""
    agent_name: str = ""
    content: str = ""
    timestamp: str = field(default_factory=now_iso)
    referenced_sources: list[str] = field(default_factory=list)


@dataclass
class PMOPSProposal:
    id: str = field(default_factory=lambda: generate_id("prop"))
    agent_id: str = ""
    title: str = ""
    description: str = ""
    pros: list[str] = field(default_factory=list)
    cons: list[str] = field(default_factory=list)
    feasibility: int = 0
    citations: list[str] = field(default_factory=list)


@dataclass
class VoteResult:
    agent_id: str = ""
    agent_name: str = ""
    proposal_id: str = ""
    reasoning: str = ""
    timestamp: str = field(default_factory=now_iso)


@dataclass
class PMOPSDiscussion:
    id: str = field(default_factory=lambda: generate_id("pmops"))
    session_id: str = ""
    topic: str = ""
    proposals: list[PMOPSProposal] = field(default_factory=list)
    chat_log: list[ChatMessage] = field(default_factory=list)
    voting_results: list[VoteResult] = field(default_factory=list)
    winning_proposal_id: str = ""
    performance_review: str = ""
    completed_at: str = field(default_factory=now_iso)


@dataclass
class VerifiedTruth:
    id: str = field(default_factory=lambda: generate_id("truth"))
    session_id: str = ""
    title: str = ""
    content: str = ""
    verification_path: list[str] = field(default_factory=list)
    credibility_score: int = 0
    scientific_verdict: str = ""
    sources: list[Citation] = field(default_factory=list)
    methods: list[str] = field(default_factory=list)
    insights: list[str] = field(default_factory=list)


@dataclass
class ResearchSession:
    id: str = field(default_factory=lambda: generate_id("session"))
    user_request: str = ""
    created_at: str = field(default_factory=now_iso)
    current_stage: PipelineStage = PipelineStage.INPUT
    topics: list[Topic] = field(default_factory=list)
    articles: list[Article] = field(default_factory=list)
    verifications: list[Verification] = field(default_factory=list)
    scientific_validations: list[ScientificValidation] = field(default_factory=list)
    brainstorm_results: list[BrainstormResult] = field(default_factory=list)
    pmops_discussions: list[PMOPSDiscussion] = field(default_factory=list)
    verified_truths: list[VerifiedTruth] = field(default_factory=list)
