"""
Agent definitions and system prompts for the 6-agent team.
Each agent has a defined role with no overlapping responsibilities.
"""

from ai_research_verifier.types import AgentRole
from ai_research_verifier.poison_shield import POISON_SHIELD_SYSTEM_PROMPT


# --- Display Names (constant lookup, not a function that rebuilds a dict) ---

AGENT_DISPLAY_NAMES: dict[str, str] = {
    AgentRole.RESEARCH_ANALYST: "Research Analyst",
    AgentRole.VERIFICATION_SPECIALIST: "Verification Specialist",
    AgentRole.SCIENTIFIC_VALIDATOR: "Scientific Validator",
    AgentRole.BRAINSTORM_INNOVATOR: "Brainstorming Innovator",
    AgentRole.PMOPS_FACILITATOR: "P.M.O.P.S. Facilitator",
    AgentRole.OUTPUT_COORDINATOR: "Output Coordinator",
}


# --- Agent Skills ---

AGENT_SKILLS: dict[str, list[str]] = {
    AgentRole.RESEARCH_ANALYST: [
        "Academic database search (PubMed, IEEE, JSTOR)",
        "Curriculum analysis and source verification",
        "Citation extraction and formatting",
        "Technical document data extraction",
    ],
    AgentRole.VERIFICATION_SPECIALIST: [
        "Cross-source validation",
        "Bias and propaganda detection",
        "Data poisoning identification",
        "Source reputation assessment",
        "Fact-checking protocols",
    ],
    AgentRole.SCIENTIFIC_VALIDATOR: [
        "Logical reasoning assessment",
        "Reproducibility analysis",
        "Variable measurement evaluation",
        "Scalability assessment",
        "Multi-perspective analysis",
    ],
    AgentRole.BRAINSTORM_INNOVATOR: [
        "Creative problem-solving",
        "Novel idea generation",
        "Methodology extension",
        "Cross-domain application",
        "Prototype development guidance",
    ],
    AgentRole.PMOPS_FACILITATOR: [
        "Group discussion management",
        "Transparent voting administration",
        "Performance review generation",
        "Chat log preservation",
        "Consensus building",
    ],
    AgentRole.OUTPUT_COORDINATOR: [
        "Data organization and formatting",
        "File generation and export",
        "Analytics and metrics",
        "System prompt shield implementation",
        "Scientific documentation",
    ],
}


# --- System Prompts ---
# The Poison Shield is injected ONLY into Verification and Scientific Validator

AGENT_SYSTEM_PROMPTS: dict[str, str] = {
    AgentRole.RESEARCH_ANALYST: (
        "You are the Research Analyst Agent. Search for peer-reviewed, "
        "curricula-verified, and academic research only. Never fabricate "
        "citations. Always include DOI or verifiable URL."
    ),
    AgentRole.VERIFICATION_SPECIALIST: (
        f"{POISON_SHIELD_SYSTEM_PROMPT}\n\n"
        "You are the Verification Specialist. Cross-validate every claim "
        "against 2+ independent sources. Apply the 6-point checklist."
    ),
    AgentRole.SCIENTIFIC_VALIDATOR: (
        f"{POISON_SHIELD_SYSTEM_PROMPT}\n\n"
        "You are the Scientific Method Validator. Check logical consistency, "
        "replicability, variable measurement, scalability, and perspective."
    ),
    AgentRole.BRAINSTORM_INNOVATOR: (
        "You are the Brainstorming Innovator. Build only upon verified data. "
        "Every idea must include methodology, evidence basis, and feasibility."
    ),
    AgentRole.PMOPS_FACILITATOR: (
        "You are the P.M.O.P.S. Facilitator. Manage group discussion, "
        "run transparent voting (NO anonymous votes), generate performance reviews."
    ),
    AgentRole.OUTPUT_COORDINATOR: (
        "You are the Output Coordinator. Compile all verified data into "
        "clean .txt exports with full citation chains and analytics."
    ),
}


# --- Agent Approach for PMOPS Proposals ---

AGENT_APPROACHES: dict[str, dict] = {
    AgentRole.RESEARCH_ANALYST: {
        "title": "Deep Literature Review",
        "description": "Comprehensive systematic review of peer-reviewed literature.",
        "pros": ["Thorough evidence base", "Identifies gaps", "Strong citations"],
        "cons": ["Time-intensive", "May miss unpublished work"],
        "feasibility": 85,
    },
    AgentRole.VERIFICATION_SPECIALIST: {
        "title": "Multi-Layer Verification",
        "description": "Cascading verification from multiple independent sources.",
        "pros": ["Highest confidence", "Eliminates poisoned data", "Traceable chain"],
        "cons": ["May reject novel findings", "Resource-intensive"],
        "feasibility": 90,
    },
    AgentRole.SCIENTIFIC_VALIDATOR: {
        "title": "Replication-First",
        "description": "Prioritize independently replicable findings.",
        "pros": ["Infallible truth guarantee", "No false positives", "Scalable"],
        "cons": ["Slower progress", "Excludes observational studies"],
        "feasibility": 82,
    },
    AgentRole.BRAINSTORM_INNOVATOR: {
        "title": "Innovation Pipeline",
        "description": "Fast prototyping with verified data as foundation.",
        "pros": ["Rapid innovation", "Actionable outputs", "Cross-domain"],
        "cons": ["Speed vs thoroughness tradeoff", "Prototype quality varies"],
        "feasibility": 75,
    },
    AgentRole.PMOPS_FACILITATOR: {
        "title": "Consensus-Driven",
        "description": "Iterative discussion until supermajority agreement.",
        "pros": ["Democratic", "Multiple perspectives", "Full documentation"],
        "cons": ["Can be slow", "Groupthink risk"],
        "feasibility": 78,
    },
    AgentRole.OUTPUT_COORDINATOR: {
        "title": "Documentation-First",
        "description": "Comprehensive documentation at every step.",
        "pros": ["Complete audit trail", "Easy to extend", "Transparent"],
        "cons": ["Documentation overhead", "May slow iteration"],
        "feasibility": 80,
    },
}
