"""
AI Research Verification System
Poison & Manipulation Free AI Future

A multi-agent research verification pipeline implementing:
- Procedural Method Of Problem Solving (P.M.O.P.S.)
- 6-point verification checklist
- Scientific method validation
- Data poison shield
- Transparent voting and documentation

Install:
    pip install -e .
    # or
    python -m pip install -e .

Usage:
    from ai_research_verifier import run_pipeline
    session = run_pipeline("your research question here")
"""

__version__ = "1.0.0"
__author__ = "AI Research Verification Team"

from ai_research_verifier.pipeline import run_pipeline  # noqa: F401
from ai_research_verifier.types import ResearchSession  # noqa: F401
