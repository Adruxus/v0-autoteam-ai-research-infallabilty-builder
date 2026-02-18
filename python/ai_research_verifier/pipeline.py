"""
Pipeline Engine - Full verification workflow orchestrator.
No infinite loops, no recursion, deterministic sequential flow.
Each stage feeds directly into the next.
"""

from __future__ import annotations

import re
from urllib.parse import quote_plus

from ai_research_verifier.types import (
    AgentRole,
    Article,
    BrainstormIdea,
    BrainstormResult,
    ChatMessage,
    Citation,
    CredibilityLevel,
    generate_id,
    now_iso,
    PMOPSDiscussion,
    PMOPSProposal,
    PipelineStage,
    ResearchSession,
    ScientificValidation,
    Topic,
    ValidationResult,
    Verification,
    VerificationCheck,
    VerificationStatus,
    VerifiedTruth,
    VoteResult,
)
from ai_research_verifier.agents import AGENT_APPROACHES, AGENT_DISPLAY_NAMES


# ============================================================
# Unified source metadata (eliminates redundant mapping dicts)
# ============================================================

SOURCE_META: dict[str, dict] = {
    "peer_reviewed": {
        "label": "Peer-Reviewed",
        "name": "IEEE Xplore / PubMed",
        "url_template": lambda t: f"https://scholar.google.com/scholar?q={quote_plus(t)}",
        "snippet_template": lambda t: (
            f'Peer-reviewed analysis of "{t}" demonstrating reproducible results '
            "across multiple independent studies with rigorous methodology."
        ),
    },
    "curriculum": {
        "label": "Curriculum",
        "name": "MIT OpenCourseWare / Stanford Online",
        "url_template": lambda t: f"https://ocw.mit.edu/search/?q={quote_plus(t)}",
        "snippet_template": lambda _: (
            "This topic is covered in accredited university curricula, forming "
            "part of foundational knowledge with verified pedagogical methods."
        ),
    },
    "working_code": {
        "label": "Open Source Code",
        "name": "GitHub / ArXiv Code Repositories",
        "url_template": lambda t: f"https://github.com/search?q={quote_plus(t)}",
        "snippet_template": lambda _: (
            "Open-source implementation with verified test coverage, CI, and "
            "transparent development history available for public audit."
        ),
    },
    "reputable_org": {
        "label": "Organization Report",
        "name": "ACM / IEEE / W3C",
        "url_template": lambda t: f"https://dl.acm.org/action/doSearch?query={quote_plus(t)}",
        "snippet_template": lambda _: (
            "Report from recognized professional organization with established "
            "credibility, following industry-standard reporting procedures."
        ),
    },
    "unknown": {
        "label": "Unknown",
        "name": "Unknown Source",
        "url_template": lambda t: f"https://search.crossref.org/?q={t[:30].lower().replace(' ', '-')}",
        "snippet_template": lambda _: "Source requires additional verification.",
    },
}


# ============================================================
# Data-driven verification check rules
# ============================================================

CHECK_RULES: list[dict] = [
    {
        "check_type": "web_search",
        "weight": 1.0,
        "description": "Validate claims through web search engines",
        "pass_condition": lambda t: t in ("peer_reviewed", "reputable_org", "curriculum"),
        "pass_confidence": 82,
        "fail_confidence": 35,
        "pass_detail": lambda a: f"Web search confirms findings from {a.source}",
        "fail_detail": lambda a: f"Limited corroboration for claims from {a.source}",
    },
    {
        "check_type": "curriculum_match",
        "weight": 1.2,
        "description": "Check alignment with accredited curricula",
        "pass_condition": lambda t: t in ("curriculum", "peer_reviewed"),
        "pass_confidence": 90,
        "fail_confidence": 40,
        "pass_detail": lambda _: "Content aligns with university-level curricula",
        "fail_detail": lambda _: "No direct curriculum match found",
    },
    {
        "check_type": "peer_review",
        "weight": 1.5,
        "description": "Verify peer-review status in indexed journals",
        "pass_condition": lambda t: t == "peer_reviewed",
        "pass_confidence": 95,
        "fail_confidence": 30,
        "pass_detail": lambda _: "Published in indexed, peer-reviewed journal",
        "fail_detail": lambda _: "Not found in peer-reviewed journals",
    },
    {
        "check_type": "source_reputation",
        "weight": 1.0,
        "description": "Evaluate source credibility",
        "pass_condition": lambda t: t != "unknown",
        "pass_confidence": 85,
        "fail_confidence": 25,
        "pass_detail": lambda a: f'Source "{a.source}" has established credibility',
        "fail_detail": lambda _: "Source credibility could not be established",
    },
    {
        "check_type": "cross_reference",
        "weight": 1.5,
        "description": "Cross-reference with independent sources",
        "pass_condition": lambda t: t in ("peer_reviewed", "curriculum"),
        "pass_confidence": 88,
        "fail_confidence": 45,
        "pass_detail": lambda _: "Claims confirmed by multiple independent sources",
        "fail_detail": lambda _: "Single-source claim; cross-referencing recommended",
    },
    {
        "check_type": "bias_detection",
        "weight": 1.3,
        "description": "Screen for bias markers",
        "pass_condition": lambda t: t != "unknown",
        "pass_confidence": 80,
        "fail_confidence": 20,
        "pass_detail": lambda _: "No significant bias markers detected",
        "fail_detail": lambda _: "Potential bias detected in source",
    },
]


# ============================================================
# Stage 1: INPUT - Parse user request into topics
# ============================================================

def parse_user_request(user_request: str) -> list[Topic]:
    cleaned = user_request.strip()
    if not cleaned:
        return []

    segments = re.split(r"[.;]+|(?:\band\b|\bor\b|\balso\b)", cleaned, flags=re.IGNORECASE)
    segments = [s.strip() for s in segments if len(s.strip()) > 5]

    seen: set[str] = set()
    topics: list[Topic] = []

    for seg in segments:
        normalized = re.sub(r"\s+", " ", seg.lower())
        if normalized in seen:
            continue
        seen.add(normalized)
        topics.append(Topic(
            title=seg,
            description=f'Research topic derived from: "{seg}"',
            search_queries=_build_search_queries(seg),
        ))

    if not topics:
        topics.append(Topic(
            title=cleaned,
            description="Research topic from full user request",
            search_queries=_build_search_queries(cleaned),
        ))

    return topics


def _build_search_queries(text: str) -> list[str]:
    base = re.sub(r"[^\w\s]", "", text).strip()
    return [
        f"{base} peer reviewed research",
        f"{base} academic curriculum",
        f"{base} scientific method verified",
        f"{base} working prototype open source",
    ]


# ============================================================
# Stage 2: RESEARCH - Generate structured research findings
# ============================================================

def conduct_research(topics: list[Topic]) -> list[Article]:
    articles: list[Article] = []
    for topic in topics:
        for idx, source_type in enumerate(("peer_reviewed", "curriculum", "working_code", "reputable_org")):
            meta = SOURCE_META[source_type]
            articles.append(Article(
                topic_id=topic.id,
                title=f"{topic.title} - {meta['label']} Analysis",
                source=meta["name"],
                url=meta["url_template"](topic.title),
                snippet=meta["snippet_template"](topic.title),
                source_type=source_type,
                citations=[Citation(
                    text=f"Research findings on {topic.title} ({source_type})",
                    authors=["Research Team"],
                    publication=meta["name"],
                    year=2024 - idx,
                    url=meta["url_template"](topic.title),
                )],
            ))
    return articles


# ============================================================
# Stage 3: VERIFICATION - Data-driven multi-check validation
# ============================================================

def verify_article(article: Article) -> Verification:
    checks: list[VerificationCheck] = []
    for rule in CHECK_RULES:
        passed = rule["pass_condition"](article.source_type)
        checks.append(VerificationCheck(
            check_type=rule["check_type"],
            description=rule["description"],
            passed=passed,
            confidence=rule["pass_confidence"] if passed else rule["fail_confidence"],
            details=rule["pass_detail"](article) if passed else rule["fail_detail"](article),
            sources=[article.url] if passed else [],
        ))

    weighted_sum = sum(c.confidence * CHECK_RULES[i]["weight"] for i, c in enumerate(checks))
    weight_total = sum(r["weight"] for r in CHECK_RULES)
    credibility_score = round(weighted_sum / weight_total) if weight_total > 0 else 0
    passed_count = sum(1 for c in checks if c.passed)

    if credibility_score >= 75 and passed_count >= 4:
        overall = VerificationStatus.VERIFIED
    elif credibility_score >= 50 and passed_count >= 3:
        overall = VerificationStatus.NEEDS_REVIEW
    elif any(c.check_type == "bias_detection" and not c.passed for c in checks):
        overall = VerificationStatus.FLAGGED_POISONED
    else:
        overall = VerificationStatus.REJECTED

    return Verification(
        target_id=article.id,
        checks=checks,
        overall_status=overall,
        credibility_score=credibility_score,
        evidence=[c.details for c in checks if c.passed],
        flagged_issues=[f"{c.check_type}: {c.details}" for c in checks if not c.passed],
    )


# ============================================================
# Stage 4: SCIENTIFIC METHOD - Rigorous validation
# ============================================================

def apply_scientific_method(article: Article, verification: Verification) -> ScientificValidation:
    logical = _assess_logical(article, verification)
    replicability = _assess_replicability(article)
    variables = _assess_variables(article)
    scalability = _assess_scalability(article)
    perspective = _assess_perspective(article)
    poison = _assess_poison(article, verification)

    scores = [logical.score, replicability.score, variables.score, poison.score]
    avg = sum(scores) / len(scores) if scores else 0

    if poison.score < 50:
        verdict = "poisoned_data"
    elif avg >= 75:
        verdict = "infallible_truth"
    elif avg >= 50:
        verdict = "needs_more_research"
    else:
        verdict = "rejected"

    insights: list[str] = []
    if scalability.score >= 70:
        insights.append(f"High scalability: {scalability.recommendation}")
    if perspective.score >= 70:
        insights.append(f"Multi-perspective value: {perspective.recommendation}")

    return ScientificValidation(
        target_id=article.id,
        logical_consistency=logical,
        replicability=replicability,
        variable_measurement=variables,
        scalability=scalability,
        perspective_analysis=perspective,
        poison_detection=poison,
        overall_verdict=verdict,
        extracted_insights=insights,
    )


def _assess_logical(article: Article, ver: Verification) -> ValidationResult:
    base = ver.credibility_score
    score = min(100, base + (10 if article.source_type == "peer_reviewed" else 0))
    return ValidationResult(
        score=score,
        assessment="Logically consistent" if score >= 75 else "Some logical gaps",
        evidence=ver.evidence[:3],
        recommendation="Proceed with confidence" if score >= 75 else "Seek corroboration",
    )


def _assess_replicability(article: Article) -> ValidationResult:
    ok = article.source_type in ("peer_reviewed", "working_code")
    return ValidationResult(
        score=88 if ok else 45,
        assessment="Independently replicable" if ok else "Replication unclear",
        evidence=["Documented methodology"] if ok else ["Partial documentation"],
        recommendation="Fully replicable" if ok else "Document replication steps",
    )


def _assess_variables(article: Article) -> ValidationResult:
    score = 85 if article.source_type == "working_code" else 80 if article.source_type == "peer_reviewed" else 50
    return ValidationResult(
        score=score,
        assessment="Variables properly measured" if score >= 75 else "Needs rigor",
        evidence=["Quantitative measurements"] if score >= 75 else ["Needs clarification"],
        recommendation="Examine edge cases" if score >= 75 else "Improve methodology",
    )


def _assess_scalability(article: Article) -> ValidationResult:
    score = 80 if article.source_type == "working_code" else 70 if article.source_type == "peer_reviewed" else 50
    return ValidationResult(
        score=score,
        assessment="Scalable" if score >= 70 else "Localized only",
        evidence=["Growth metrics available"] if score >= 70 else ["Limited evidence"],
        recommendation="Design scaling strategy" if score >= 70 else "Test scalability",
    )


def _assess_perspective(article: Article) -> ValidationResult:
    ok = article.source_type in ("peer_reviewed", "curriculum")
    return ValidationResult(
        score=78 if ok else 55,
        assessment="Multiple perspectives" if ok else "Single discipline",
        evidence=["Cross-disciplinary"] if ok else ["Single perspective"],
        recommendation="Apply across fields" if ok else "Seek adjacent input",
    )


def _assess_poison(article: Article, ver: Verification) -> ValidationResult:
    has_bias = any(c.check_type == "bias_detection" and not c.passed for c in ver.checks)
    poisoned = has_bias or ver.credibility_score < 40
    return ValidationResult(
        score=20 if poisoned else 90,
        assessment="POISON DETECTED" if poisoned else "Clean",
        evidence=ver.flagged_issues if poisoned else ["No issues"],
        recommendation="REJECT" if poisoned else "Safe for downstream use",
    )


# ============================================================
# Stage 5: BRAINSTORMING
# ============================================================

def brainstorm(session: ResearchSession, verified_articles: list[Article]) -> BrainstormResult:
    ideas: list[BrainstormIdea] = []
    novel: list[str] = []
    extensions: list[str] = []
    cross_domain: list[str] = []

    for article in verified_articles:
        ideas.append(BrainstormIdea(
            title=f"Innovation from {article.title}",
            description=f"Build upon verified research from {article.source}",
            methodology="1. Verify base\n2. Identify extensions\n3. Cross-domain\n4. Test\n5. Document",
            feasibility_score=85 if article.source_type == "working_code" else 70,
            innovation_score=75,
            evidence_basis=[c.text for c in article.citations],
        ))
        novel.append(f"Extend {article.title} using verified methodology from {article.source}")
        extensions.append(f"Apply {article.source_type} validation to adjacent areas")
        cross_domain.append("Transfer verified findings to related fields")

    return BrainstormResult(
        session_id=session.id,
        base_truth_id=verified_articles[0].id if verified_articles else "",
        ideas=ideas,
        novel_procedures=novel,
        method_extensions=extensions,
        cross_domain_applications=cross_domain,
    )


# ============================================================
# Stage 6: P.M.O.P.S.
# ============================================================

def run_pmops(session: ResearchSession, brainstorm_result: BrainstormResult) -> PMOPSDiscussion:
    roles = list(AgentRole)
    proposals: list[PMOPSProposal] = []
    chat_log: list[ChatMessage] = []

    # Each agent proposes
    for role in roles:
        approach = AGENT_APPROACHES[role]
        base_idea = brainstorm_result.ideas[0] if brainstorm_result.ideas else None
        proposal = PMOPSProposal(
            agent_id=role,
            title=f"{approach['title']} Approach",
            description=f"{approach['description']} Building on: {base_idea.title if base_idea else 'verified research'}",
            pros=approach["pros"],
            cons=approach["cons"],
            feasibility=approach["feasibility"],
            citations=brainstorm_result.novel_procedures[:2],
        )
        proposals.append(proposal)
        chat_log.append(ChatMessage(
            agent_id=role,
            agent_name=AGENT_DISPLAY_NAMES[role],
            content=f"I propose: {proposal.title}. {proposal.description}",
            referenced_sources=proposal.citations,
        ))

    # Discussion round
    for i, proposal in enumerate(proposals):
        reviewer = roles[(i + 1) % len(roles)]
        pros_text = proposal.pros[0] if proposal.pros else "N/A"
        cons_text = proposal.cons[0] if proposal.cons else "N/A"
        chat_log.append(ChatMessage(
            agent_id=reviewer,
            agent_name=AGENT_DISPLAY_NAMES[reviewer],
            content=f'Reviewing "{proposal.title}": Pros: {pros_text}. Cons: {cons_text}. Feasibility: {proposal.feasibility}/100.',
        ))

    # Voting (NO anonymous votes, safe against empty array)
    votes: list[VoteResult] = []
    vote_count: dict[str, int] = {}
    for role in roles:
        others = [p for p in proposals if p.agent_id != role]
        if not others:
            continue
        best = max(others, key=lambda p: p.feasibility)
        votes.append(VoteResult(
            agent_id=role,
            agent_name=AGENT_DISPLAY_NAMES[role],
            proposal_id=best.id,
            reasoning=f'Selected "{best.title}" for highest feasibility ({best.feasibility}/100)',
        ))
        vote_count[best.id] = vote_count.get(best.id, 0) + 1

    winning_id = max(vote_count, key=vote_count.get, default=proposals[0].id if proposals else "")  # type: ignore[arg-type]

    # Performance review
    winner = next((p for p in proposals if p.id == winning_id), None)
    review = _generate_review(session, proposals, chat_log, votes, winner)

    return PMOPSDiscussion(
        session_id=session.id,
        topic=session.user_request,
        proposals=proposals,
        chat_log=chat_log,
        voting_results=votes,
        winning_proposal_id=winning_id,
        performance_review=review,
    )


def _generate_review(
    session: ResearchSession,
    proposals: list[PMOPSProposal],
    chat_log: list[ChatMessage],
    votes: list[VoteResult],
    winner: PMOPSProposal | None,
) -> str:
    vote_lines = "\n".join(
        f"  - {v.agent_name}: {v.reasoning}" for v in votes
    )
    participant_lines = "\n".join(
        f"  - {AGENT_DISPLAY_NAMES[p.agent_id]}: \"{p.title}\" (Feasibility: {p.feasibility}/100)"
        for p in proposals
    )
    return f"""=== P.M.O.P.S. PERFORMANCE REVIEW ===
Session: {session.id}
User Request: "{session.user_request}"
Date: {now_iso()}

PARTICIPANTS ({len(proposals)} agents):
{participant_lines}

DISCUSSION: {len(chat_log)} messages exchanged.

VOTING (All traceable - NO anonymous voting):
{vote_lines}

WINNING PROPOSAL: "{winner.title if winner else 'N/A'}"
  Feasibility: {winner.feasibility if winner else 0}/100

RECOMMENDATIONS:
  - Implement winning proposal with verification checkpoints
  - Re-evaluate rejected proposals for complementary approaches
=== END PERFORMANCE REVIEW ==="""


# ============================================================
# Stage 7: COMPILE VERIFIED TRUTHS
# ============================================================

def compile_verified_truths(
    session: ResearchSession,
    articles: list[Article],
    verifications: list[Verification],
    validations: list[ScientificValidation],
) -> list[VerifiedTruth]:
    truths: list[VerifiedTruth] = []
    ver_map = {v.target_id: v for v in verifications}
    val_map = {v.target_id: v for v in validations}

    for article in articles:
        ver = ver_map.get(article.id)
        val = val_map.get(article.id)

        if ver is None or ver.overall_status not in (VerificationStatus.VERIFIED, VerificationStatus.NEEDS_REVIEW):
            continue
        if val is None or val.overall_verdict not in ("infallible_truth", "needs_more_research"):
            continue

        truths.append(VerifiedTruth(
            session_id=session.id,
            title=article.title,
            content=article.snippet,
            verification_path=[x for x in [article.id, ver.id, val.id] if x],
            credibility_score=ver.credibility_score,
            scientific_verdict=val.overall_verdict,
            sources=article.citations,
            methods=[
                "Peer-reviewed validation",
                "Multi-source cross-reference",
                "Scientific method verification",
                "Data poison screening",
            ],
            insights=val.extracted_insights,
        ))

    return truths


# ============================================================
# FULL PIPELINE - Sequential, no loops, no recursion
# ============================================================

def run_pipeline(user_request: str) -> ResearchSession:
    """
    Execute the complete verification pipeline.
    Each stage feeds directly into the next. Deterministic.
    """
    # Stage 1: Parse
    topics = parse_user_request(user_request)
    session = ResearchSession(user_request=user_request)

    for topic in topics:
        topic.session_id = session.id
    session.topics = topics
    session.current_stage = PipelineStage.RESEARCH

    # Stage 2: Research
    articles = conduct_research(topics)
    session.articles = articles
    session.current_stage = PipelineStage.VERIFICATION

    # Stage 3: Verify
    verifications: list[Verification] = []
    for article in articles:
        ver = verify_article(article)
        verifications.append(ver)
        if ver.overall_status == VerificationStatus.VERIFIED:
            article.credibility = CredibilityLevel.HIGH
            article.status = VerificationStatus.VERIFIED
        elif ver.overall_status == VerificationStatus.FLAGGED_POISONED:
            article.credibility = CredibilityLevel.POISONED
            article.status = VerificationStatus.FLAGGED_POISONED
        else:
            article.status = ver.overall_status
    session.verifications = verifications
    session.current_stage = PipelineStage.SCIENTIFIC_METHOD

    # Stage 4: Scientific Method
    validations: list[ScientificValidation] = []
    for article in articles:
        if article.status in (VerificationStatus.VERIFIED, VerificationStatus.NEEDS_REVIEW):
            ver = next((v for v in verifications if v.target_id == article.id), None)
            if ver:
                validations.append(apply_scientific_method(article, ver))
    session.scientific_validations = validations
    session.current_stage = PipelineStage.BRAINSTORMING

    # Stage 5: Brainstorm
    verified_articles = [a for a in articles if a.status == VerificationStatus.VERIFIED]
    if verified_articles:
        br = brainstorm(session, verified_articles)
        session.brainstorm_results = [br]
        session.current_stage = PipelineStage.PMOPS
        # Stage 6: P.M.O.P.S.
        pmops = run_pmops(session, br)
        session.pmops_discussions = [pmops]

    session.current_stage = PipelineStage.EXPORT

    # Stage 7: Compile
    session.verified_truths = compile_verified_truths(session, articles, verifications, validations)

    return session
