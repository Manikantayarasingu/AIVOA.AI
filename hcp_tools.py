"""
LangGraph tools for the HCP CRM Agent.
5 tools: log_interaction, edit_interaction, get_hcp_profile, schedule_followup, analyze_engagement
"""
import json
from datetime import datetime
from typing import Optional
from langchain_core.tools import tool
from sqlalchemy.orm import Session


# ─── Tool 1: Log Interaction ────────────────────────────────────────────────

@tool
def log_interaction(
    hcp_id: int,
    notes: str,
    interaction_type: str = "visit",
    duration_minutes: int = 30,
    products_discussed: str = "",
    db_session_id: Optional[str] = None,
) -> str:
    """
    Log a new interaction with an HCP. Uses LLM to extract entities and
    generate a structured summary from free-form notes. Persists to PostgreSQL.

    Args:
        hcp_id: The ID of the Healthcare Professional
        notes: Free-form interaction notes (can be verbose/conversational)
        interaction_type: Type of interaction (visit/call/email/conference/webinar)
        duration_minutes: Duration of the interaction in minutes
        products_discussed: Comma-separated list of products discussed
        db_session_id: Internal session identifier

    Returns:
        JSON string with the created interaction ID and AI summary
    """
    return json.dumps({
        "tool": "log_interaction",
        "status": "ready",
        "hcp_id": hcp_id,
        "notes": notes,
        "interaction_type": interaction_type,
        "duration_minutes": duration_minutes,
        "products_discussed": products_discussed,
        "message": "log_interaction tool invoked - will persist to DB via agent executor"
    })


# ─── Tool 2: Edit Interaction ────────────────────────────────────────────────

@tool
def edit_interaction(
    interaction_id: int,
    notes: Optional[str] = None,
    products_discussed: Optional[str] = None,
    duration_minutes: Optional[int] = None,
    follow_up_required: Optional[str] = None,
) -> str:
    """
    Edit an existing logged interaction. Accepts partial updates.
    The LLM will re-summarize updated fields to keep the AI summary coherent.

    Args:
        interaction_id: The ID of the interaction to edit
        notes: Updated interaction notes (optional)
        products_discussed: Updated products list (optional)
        duration_minutes: Updated duration (optional)
        follow_up_required: Updated follow-up notes (optional)

    Returns:
        JSON string confirming the update and new AI summary
    """
    updates = {}
    if notes is not None:
        updates["notes"] = notes
    if products_discussed is not None:
        updates["products_discussed"] = products_discussed
    if duration_minutes is not None:
        updates["duration_minutes"] = duration_minutes
    if follow_up_required is not None:
        updates["follow_up_required"] = follow_up_required

    return json.dumps({
        "tool": "edit_interaction",
        "status": "ready",
        "interaction_id": interaction_id,
        "updates": updates,
        "message": "edit_interaction tool invoked - will update DB record via agent executor"
    })


# ─── Tool 3: Get HCP Profile ─────────────────────────────────────────────────

@tool
def get_hcp_profile(hcp_id: int) -> str:
    """
    Retrieve full HCP profile including interaction history, preferred products,
    visit frequency, and engagement score.

    Args:
        hcp_id: The ID of the Healthcare Professional

    Returns:
        JSON string with HCP profile and interaction summary
    """
    return json.dumps({
        "tool": "get_hcp_profile",
        "status": "ready",
        "hcp_id": hcp_id,
        "message": "get_hcp_profile tool invoked - will fetch from DB via agent executor"
    })


# ─── Tool 4: Schedule Follow-up ──────────────────────────────────────────────

@tool
def schedule_followup(
    hcp_id: int,
    interaction_id: int,
    title: str,
    description: str,
    due_date: str,
) -> str:
    """
    Schedule a follow-up task linked to an HCP and interaction.
    Uses LLM to suggest optimal follow-up timing based on interaction context.

    Args:
        hcp_id: The ID of the Healthcare Professional
        interaction_id: The ID of the related interaction
        title: Follow-up task title
        description: Detailed description of what needs to be done
        due_date: ISO format date string (YYYY-MM-DD) for the follow-up

    Returns:
        JSON string with created follow-up task ID and details
    """
    return json.dumps({
        "tool": "schedule_followup",
        "status": "ready",
        "hcp_id": hcp_id,
        "interaction_id": interaction_id,
        "title": title,
        "description": description,
        "due_date": due_date,
        "message": "schedule_followup tool invoked - will persist to DB via agent executor"
    })


# ─── Tool 5: Analyze Engagement ──────────────────────────────────────────────

@tool
def analyze_engagement(hcp_id: int) -> str:
    """
    Run AI analysis on an HCP's engagement trends across all logged interactions.
    Returns sentiment trajectory, topics of interest, and recommended next actions.

    Args:
        hcp_id: The ID of the Healthcare Professional

    Returns:
        JSON string with engagement analysis, sentiment trend, and AI recommendations
    """
    return json.dumps({
        "tool": "analyze_engagement",
        "status": "ready",
        "hcp_id": hcp_id,
        "message": "analyze_engagement tool invoked - will analyze interaction history via LLM"
    })


# Export all tools
ALL_TOOLS = [
    log_interaction,
    edit_interaction,
    get_hcp_profile,
    schedule_followup,
    analyze_engagement,
]
