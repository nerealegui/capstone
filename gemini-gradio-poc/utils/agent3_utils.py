"""
Agent 3 utilities for conversational interaction, conflict detection, impact analysis, and orchestration.
Implements the enhanced business rules management capabilities.
"""

import json
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
from google.genai import types

from config.agent_config import (
    AGENT3_PROMPT, 
    AGENT3_GENERATION_CONFIG, 
    DEFAULT_MODEL, 
    INDUSTRY_CONFIGS
)
from utils.rag_utils import initialize_gemini_client, rag_generate
from utils.rule_extractor import validate_rule_conflicts


def analyze_rule_conflicts(
    proposed_rule: Dict[str, Any], 
    existing_rules: List[Dict[str, Any]], 
    industry: str = "generic"
) -> Tuple[List[Dict[str, Any]], str]:
    """
    Enhanced conflict detection with industry-specific analysis.
    
    Args:
        proposed_rule: The new rule being proposed
        existing_rules: List of existing rules in the knowledge base
        industry: Industry context for conflict analysis
    
    Returns:
        Tuple of (conflicts_list, detailed_analysis)
    """
    # Basic conflict detection using existing validation
    basic_conflicts = validate_rule_conflicts(proposed_rule, existing_rules)
    
    # Industry-specific conflict analysis
    industry_config = INDUSTRY_CONFIGS.get(industry, INDUSTRY_CONFIGS["generic"])
    
    enhanced_conflicts = []
    for conflict in basic_conflicts:
        enhanced_conflict = conflict.copy()
        enhanced_conflict["industry_impact"] = _assess_industry_impact(
            conflict, industry_config
        )
        enhanced_conflicts.append(enhanced_conflict)
    
    # Generate detailed analysis using Agent 3
    detailed_analysis = _generate_conflict_analysis(
        proposed_rule, existing_rules, enhanced_conflicts, industry_config
    )
    
    return enhanced_conflicts, detailed_analysis


def assess_rule_impact(
    proposed_rule: Dict[str, Any], 
    existing_rules: List[Dict[str, Any]], 
    industry: str = "generic"
) -> Dict[str, Any]:
    """
    Analyze the operational and business impact of a proposed rule modification.
    
    Args:
        proposed_rule: The rule being analyzed
        existing_rules: Existing rules for context
        industry: Industry context for impact analysis
    
    Returns:
        Impact analysis results
    """
    industry_config = INDUSTRY_CONFIGS.get(industry, INDUSTRY_CONFIGS["generic"])
    
    # Generate impact analysis using Agent 3
    impact_analysis = _generate_impact_analysis(
        proposed_rule, existing_rules, industry_config
    )
    
    return impact_analysis


def generate_conversational_response(
    user_query: str, 
    context: Dict[str, Any], 
    rag_df: pd.DataFrame,
    industry: str = "generic",
    history: List[List[str]] = None
) -> str:
    """
    Generate Agent 3 conversational response with context awareness.
    
    Args:
        user_query: User's question or request
        context: Current context including rules, conflicts, etc.
        rag_df: RAG knowledge base DataFrame
        industry: Industry context
        history: Chat history as list of [user_message, assistant_message] pairs
        
    Returns:
        Conversational response from Agent 3
    """
    industry_config = INDUSTRY_CONFIGS.get(industry, INDUSTRY_CONFIGS["generic"])
    
    # Build enhanced prompt with industry context
    enhanced_prompt = _build_agent3_prompt(user_query, context, industry_config)
    
    # Process history to maintain context
    if history is None:
        history = []
    
    # Ensure history is properly formatted
    formatted_history = []
    for h in history:
        if isinstance(h, list) and len(h) == 2:
            formatted_history.append(h)
    
    # Use RAG if knowledge base is available
    if not rag_df.empty:
        response = rag_generate(
            query=enhanced_prompt,
            df=rag_df,
            agent_prompt=AGENT3_PROMPT,
            model_name=DEFAULT_MODEL,
            generation_config=AGENT3_GENERATION_CONFIG,
            history=formatted_history,  # Pass the formatted history
            top_k=3
        )
    else:
        # Direct LLM call if no RAG
        response = _direct_agent3_call(enhanced_prompt, formatted_history)
    
    return response


def orchestrate_rule_generation(
    proposed_rule: Dict[str, Any],
    conflicts: List[Dict[str, Any]]
) -> Tuple[bool, str, Optional[str]]:
    """
    Orchestrate the rule generation process without a proceed flag.
    
    Args:
        proposed_rule: The rule to be processed
        conflicts: Any identified conflicts
    
    Returns:
        Tuple of (should_proceed, status_message, orchestration_result)
    """
    import datetime
    import os

    # Log the orchestration request
    print(f"[Agent3] Orchestration request: rule='{proposed_rule.get('name', 'Unnamed')}', conflicts={len(conflicts)}")

    if conflicts:
        print(f"[Agent3] Orchestration blocked due to {len(conflicts)} conflicts")
        return False, "Cannot proceed with conflicts. Please resolve them first.", None

    # Signal to trigger Agent 2 for DRL/GDST generation
    orchestration_result = {
        "action": "generate_drl_gdst",
        "rule_data": proposed_rule,
        "agent2_trigger": True,
        "timestamp": datetime.datetime.now().isoformat(),
        "requester": "agent3"
    }

    # Create a log entry for the orchestration
    try:
        os.makedirs("logs", exist_ok=True)
        log_file = os.path.join("logs", "orchestration.log")

        with open(log_file, "a") as f:
            f.write(f"{orchestration_result['timestamp']} - Orchestrating rule: {proposed_rule.get('name')}\n")

        print(f"[Agent3] Orchestration successful for '{proposed_rule.get('name', 'Unnamed')}'")
    except Exception as e:
        print(f"[Agent3] Warning: Could not log orchestration: {e}")

    return True, "Proceeding with rule generation...", json.dumps(orchestration_result)


def _assess_industry_impact(conflict: Dict[str, Any], industry_config: Dict[str, Any]) -> str:
    """Assess the industry-specific impact of a conflict."""
    conflict_type = conflict.get("type", "unknown")
    impact_areas = industry_config["impact_areas"]
    
    impact_mapping = {
        "duplicate_id": f"May affect {impact_areas[0]} and {impact_areas[1]}",
        "duplicate_rule": f"Could impact {impact_areas[1]} and {impact_areas[2]}",
        "logical_conflict": f"Risk to {impact_areas[0]} and {impact_areas[3]}"
    }
    
    return impact_mapping.get(conflict_type, f"General impact on {impact_areas[0]}")


def _generate_conflict_analysis(
    proposed_rule: Dict[str, Any], 
    existing_rules: List[Dict[str, Any]], 
    conflicts: List[Dict[str, Any]], 
    industry_config: Dict[str, Any]
) -> str:
    """Generate detailed conflict analysis using Agent 3."""
    client = initialize_gemini_client()
    
    prompt = f"""
    Analyze the following rule conflicts in the context of {industry_config}:
    
    Proposed Rule: {json.dumps(proposed_rule, indent=2)}
    
    Existing Rules: {json.dumps(existing_rules, indent=2)}

    Key Industry Parameters: {industry_config['key_parameters']}

    Detected Conflicts: {json.dumps(conflicts, indent=2)}
    
    Assess impact on: {industry_config['impact_areas']}
    
    Provide structured analysis including:
    - Operational impact
    - Financial implications  
    - Risk assessment
    - Implementation considerations
    
    Check the existing rules for potential impacts, and suggest modifications to the proposed rule based on the existing rules and industry context.
    Provide a clear, conversational analysis of these conflicts and recommend resolution strategies.
    Check if any existing rule can be modified with the new values from the proposed rule to resolve conflicts.
    If the conflicts are solved with a rule modification, tell the user which rule to modify and how, and if this is already what they are doing, tell them to proceed.
    Format a comprehensive response that the user can understand, with clear impact ratings (High/Medium/Low).
    Format the answer in a way that can be easily understood by a business user, avoiding technical jargon.
    Provide a clear, conversational analysis of these conflicts and recommend resolution strategies.
    Do NOT use any Markdown formatting (like #, *, or **). Instead, use line breaks and clear spacing to separate sections for readability in a plain text box.
    """
    
    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    
    try:
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(**AGENT3_GENERATION_CONFIG)
        )
        return response.text
    except Exception as e:
        return f"Error analyzing conflicts: {str(e)}"

def _generate_impact_analysis(
    proposed_rule: Dict[str, Any], 
    existing_rules: List[Dict[str, Any]], 
    industry_config: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate impact analysis using Agent 3."""
    client = initialize_gemini_client()
    
    prompt = f"""
    Analyze the business impact of this proposed rule:
    
    Proposed Rule: {json.dumps(proposed_rule, indent=2)}
    
    Existing Rules: {json.dumps(existing_rules, indent=2)}

    Industry Context: {industry_config}
    
    Assess impact on: {industry_config['impact_areas']}
    
    Provide structured analysis including:
    - Operational impact
    - Financial implications  
    - Risk assessment
    - Implementation considerations
    
    Check the existing rules for potential impacts, and suggest modifications to the proposed rule based on the existing rules and industry context.

    Format a comprehensive response that the user can understand, with clear impact ratings (High/Medium/Low).
    """
    # Format as JSON with clear impact ratings (High/Medium/Low).
    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    
    try:
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
           
    except Exception as e:
        return {
            "error": f"Impact analysis failed: {str(e)}",
            "operational_impact": "Unknown",
            "financial_impact": "Unknown", 
            "risk_level": "Medium"
        }


def _build_agent3_prompt(
    user_query: str, 
    context: Dict[str, Any], 
    industry_config: Dict[str, Any]
) -> str:
    """Build enhanced prompt for Agent 3 with context and industry specifics."""
    base_prompt = f"""
    Industry Context: {industry_config}
    
    Current Context: {json.dumps(context, indent=2)}
    
    User Query: {user_query}
    
    Please provide a helpful, conversational response that considers the industry context and current state.
    """
    
    return base_prompt


def _direct_agent3_call(
    prompt: str, 
    history: List[List[str]] = None
) -> str:
    """Make a direct call to the LLM using Agent 3's configuration.
    
    Args:
        prompt: The prompt to send to the model
        history: Chat history as list of [user_message, assistant_message] pairs
        
    Returns:
        Model response as string
    """
    client = initialize_gemini_client()
    
    # Build contents list with history
    contents = []
    
    # Add history messages first
    if history:
        for user_msg, assistant_msg in history:
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_msg)]))
            contents.append(types.Content(role="model", parts=[types.Part.from_text(text=assistant_msg)]))
    
    # Add the current prompt
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=prompt)]))
    
    try:
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(**AGENT3_GENERATION_CONFIG)
        )
        return response.text
    except Exception as e:
        return f"Error generating response: {str(e)}"


def _extract_existing_rules_from_kb(rag_df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Extract existing rules from the knowledge base for conflict analysis."""
    if rag_df.empty:
        return []
    
    # This is a simplified extraction - in a real implementation, 
    # you might want to parse the knowledge base more intelligently
    try:
        # Look for rule-like content in the knowledge base
        existing_rules = []
        for idx, row in rag_df.iterrows():
            text = row.get('text', '')
            if 'rule' in text.lower() and ('condition' in text.lower() or 'if' in text.lower()):
                # Create a simple rule representation
                existing_rules.append({
                    "rule_id": f"KB_{idx}",
                    "name": f"Knowledge Base Rule {idx}",
                    "description": text[:200] + "..." if len(text) > 200 else text,
                    "source": "knowledge_base"
                })
        return existing_rules
    except Exception as e:
        print(f"Error extracting existing rules: {e}")
        return []



def check_rule_modification_impact(rule_id: str, proposed_changes: str) -> str:
    """
    Analyze the potential impact of modifying an existing rule.
    
    Args:
        rule_id: The ID of the rule to be modified
        proposed_changes: Description of the proposed changes
        
    Returns:
        Impact analysis string
    """
    impact_lines = [
        f"**Modification Impact Analysis for Rule {rule_id}:**",
        f"- Proposed changes: {proposed_changes}",
        "",
        "**Potential Impacts:**"
    ]
    
    # Generate potential impacts based on change description
    impacts = [
        "1. May affect existing business processes that depend on this rule.",
        "2. Could introduce conflicts with other rules (conflict analysis recommended).",
        "3. Backward compatibility with existing data should be verified.",
        "4. Testing in a non-production environment is recommended before deployment."
    ]
    
    impact_lines.extend(impacts)
    
    impact_lines.extend([
        "",
        "**Recommendation:** Review conflicts with existing rules before proceeding."
    ])
    
    return "\n".join(impact_lines)


