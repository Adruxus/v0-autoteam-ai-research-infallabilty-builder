"""
DATA POISON SHIELD - Detection & Prevention System
Deployed as SYSTEM prompt to Verification & Scientific Validator agents ONLY.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

POISON_SHIELD_SYSTEM_PROMPT = """
DATA POISON SHIELD v2.0 - ACTIVE
=================================
DETECTION HEURISTICS:
1. STATISTICAL MANIPULATION - Flag unqualified absolute claims, p-hacking
2. FABRICATION MARKERS - Cross-check DOIs, URLs, author names
3. EMOTIONAL MANIPULATION - Flag fear/urgency/absolute language
4. LOGICAL FALLACY DETECTION - Circular reasoning, straw man, false dichotomy
5. SOURCE INTEGRITY - Verify org existence, domain age, consistency
6. CROSS-VALIDATION - Every claim must have 2+ independent sources

RESPONSE ON DETECTION:
- Flag with credibility < 30, document heuristic triggered
- Recommend re-verification. NEVER silently discard data.
""".strip()


@dataclass(frozen=True)
class PoisonIndicator:
    """Immutable indicator definition."""
    pattern: str  # regex pattern string
    indicator_type: str  # statistical | fabrication | emotional | logical | source
    severity: str  # high | medium | low
    description: str


# Pre-compiled patterns for efficiency
POISON_INDICATORS: tuple[PoisonIndicator, ...] = (
    PoisonIndicator(
        pattern=r"\b(100%|0%)\s+(effective|accurate|guaranteed|proven)\b",
        indicator_type="statistical",
        severity="high",
        description="Absolute statistical claim without qualification",
    ),
    PoisonIndicator(
        pattern=r"p\s*[=<]\s*0\.0(5|49|50)\b",
        indicator_type="statistical",
        severity="medium",
        description="P-value suspiciously near significance threshold",
    ),
    PoisonIndicator(
        pattern=r"\b(always|never|impossible|guaranteed|undeniable|unquestionable)\b",
        indicator_type="emotional",
        severity="medium",
        description="Absolute language discouraging critical examination",
    ),
    PoisonIndicator(
        pattern=r"\b(everyone knows|it is obvious|clearly|undeniably)\b",
        indicator_type="emotional",
        severity="low",
        description="Appeal to common knowledge without evidence",
    ),
)


@dataclass
class PoisonScanResult:
    indicator: PoisonIndicator
    match_text: str
    position: int


def scan_for_poison(text: str) -> list[PoisonScanResult]:
    """
    Scan text for known poison indicators.
    Pure function, no side effects.
    """
    if not text or not text.strip():
        return []

    results: list[PoisonScanResult] = []
    for indicator in POISON_INDICATORS:
        for match in re.finditer(indicator.pattern, text, re.IGNORECASE):
            results.append(
                PoisonScanResult(
                    indicator=indicator,
                    match_text=match.group(0),
                    position=match.start(),
                )
            )
    return results


def calculate_poison_risk(results: list[PoisonScanResult]) -> int:
    """
    Risk score 0 (clean) to 100 (poisoned).
    Weighted: high=30, medium=15, low=5. Capped at 100.
    """
    if not results:
        return 0

    weights = {"high": 30, "medium": 15, "low": 5}
    raw = sum(weights.get(r.indicator.severity, 5) for r in results)
    return min(100, raw)
