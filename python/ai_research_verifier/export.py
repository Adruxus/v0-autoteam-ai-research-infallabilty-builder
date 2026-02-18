"""
Export utility - Generates .txt files from verified research sessions.
Clean, deterministic output with full citation chains.
"""

from __future__ import annotations

from datetime import datetime, timezone

from ai_research_verifier.types import (
    ResearchSession,
    VerificationStatus,
)
from ai_research_verifier.agents import AGENT_DISPLAY_NAMES


def export_to_text(session: ResearchSession) -> str:
    """
    Render a complete research session to a plain text document.
    Deterministic: same session always produces same output.
    """
    div = "=" * 72
    lines: list[str] = []

    # Header
    lines.append(div)
    lines.append("AI RESEARCH VERIFICATION SYSTEM - VERIFIED OUTPUT")
    lines.append("Poison & Manipulation Free AI Research")
    lines.append(div)
    lines.append("")
    lines.append(f"Session: {session.id}")
    lines.append(f"Generated: {datetime.now(timezone.utc).isoformat()}")
    lines.append(f'User Request: "{session.user_request}"')
    lines.append(f"Verified Truths: {len(session.verified_truths)}")
    total_citations = sum(len(t.sources) for t in session.verified_truths)
    lines.append(f"Sources Cited: {total_citations}")
    lines.append("")

    # Executive Summary
    lines.append(div)
    lines.append("[EXECUTIVE SUMMARY]")
    lines.append(div)
    lines.append("")
    lines.append(f"Topics Researched: {len(session.topics)}")
    lines.append(f"Total Articles Analyzed: {len(session.articles)}")
    lines.append(f"Verified Truths: {len(session.verified_truths)}")
    flagged = sum(1 for a in session.articles if a.status == VerificationStatus.FLAGGED_POISONED)
    lines.append(f"Flagged as Poisoned: {flagged}")
    if session.verified_truths:
        avg_cred = round(sum(t.credibility_score for t in session.verified_truths) / len(session.verified_truths))
        lines.append(f"Average Credibility: {avg_cred}/100")
    lines.append("")

    # Verified Truths
    for truth in session.verified_truths:
        lines.append(div)
        lines.append(f"[VERIFIED TRUTH: {truth.title}]")
        lines.append(div)
        lines.append("")
        lines.append(truth.content)
        lines.append(f"Credibility Score: {truth.credibility_score}/100")
        lines.append(f"Scientific Verdict: {truth.scientific_verdict}")
        lines.append("")
        lines.append("Methods:")
        for m in truth.methods:
            lines.append(f"  - {m}")
        if truth.insights:
            lines.append("")
            lines.append("Insights:")
            for i in truth.insights:
                lines.append(f"  - {i}")
        lines.append("")
        if truth.sources:
            lines.append("Citations:")
            for cit in truth.sources:
                authors = ", ".join(cit.authors) if cit.authors else "Unknown"
                lines.append(f'  [{cit.id}] {authors} ({cit.year}). "{cit.text}". {cit.publication}')
                if cit.url:
                    lines.append(f"    URL: {cit.url}")
            lines.append("")

    # Verification Reports
    for ver in session.verifications:
        if ver.overall_status == VerificationStatus.VERIFIED:
            article = next((a for a in session.articles if a.id == ver.target_id), None)
            lines.append(div)
            lines.append(f"[VERIFICATION: {article.title if article else ver.target_id}]")
            lines.append(div)
            lines.append(f"Status: {ver.overall_status.value}")
            lines.append(f"Credibility: {ver.credibility_score}/100")
            lines.append("")
            for c in ver.checks:
                status = "PASS" if c.passed else "FAIL"
                lines.append(f"  [{status}] {c.check_type}: {c.details} ({c.confidence}%)")
            lines.append("")

    # P.M.O.P.S.
    for pmops in session.pmops_discussions:
        lines.append(div)
        lines.append("[P.M.O.P.S. DISCUSSION & PERFORMANCE REVIEW]")
        lines.append(div)
        lines.append("")
        lines.append(pmops.performance_review)
        lines.append("")
        lines.append("=== FULL CHAT LOG ===")
        for msg in pmops.chat_log:
            lines.append(f"[{msg.timestamp}] {msg.agent_name}: {msg.content}")
        lines.append("")

    # Analytics
    lines.append(div)
    lines.append("[ANALYTICS & METRICS]")
    lines.append(div)
    lines.append("")
    total_checks = sum(len(v.checks) for v in session.verifications)
    passed_checks = sum(sum(1 for c in v.checks if c.passed) for v in session.verifications)
    pass_rate = round((passed_checks / total_checks) * 100) if total_checks > 0 else 0
    lines.append(f"Total Verification Checks: {total_checks}")
    lines.append(f"Checks Passed: {passed_checks} ({pass_rate}%)")
    ideas_count = sum(len(b.ideas) for b in session.brainstorm_results)
    lines.append(f"Brainstorm Ideas: {ideas_count}")
    votes_count = sum(len(p.voting_results) for p in session.pmops_discussions)
    lines.append(f"Votes Cast: {votes_count}")
    lines.append("")

    lines.append(div)
    lines.append("END OF DOCUMENT")
    lines.append(div)

    return "\n".join(lines)


def save_export(session: ResearchSession, filepath: str | None = None) -> str:
    """
    Export session to a .txt file.
    Returns the filepath where the file was saved.
    """
    text = export_to_text(session)
    if filepath is None:
        filepath = f"research_{session.id}.txt"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(text)
    return filepath
