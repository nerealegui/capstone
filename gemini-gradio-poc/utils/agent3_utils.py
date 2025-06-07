"""
Agent 3 utilities for conversational interaction, conflict detection, impact analysis, and orchestration.
Implements the enhanced business rules management capabilities including rule versioning support.
"""

import json
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
from google import genai
from google.genai import types

from config.agent_config import (
    AGENT3_PROMPT, 
    AGENT3_GENERATION_CONFIG, 
    DEFAULT_MODEL, 
    INDUSTRY_CONFIGS
)
from utils.rag_utils import initialize_gemini_client, rag_generate
from utils.rule_extractor import validate_rule_conflicts
from utils.rule_versioning import (
    get_rule_version_history, 
    get_rule_version_summary, 
    update_rule_version
)


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
    industry: str = "generic"
) -> str:
    """
    Generate Agent 3 conversational response with context awareness.
    
    Args:
        user_query: User's question or request
        context: Current context including rules, conflicts, etc.
        rag_df: RAG knowledge base DataFrame
        industry: Industry context
    
    Returns:
        Conversational response from Agent 3
    """
    industry_config = INDUSTRY_CONFIGS.get(industry, INDUSTRY_CONFIGS["generic"])
    
    # Build enhanced prompt with industry context
    enhanced_prompt = _build_agent3_prompt(user_query, context, industry_config)
    
    # Use RAG if knowledge base is available
    if not rag_df.empty:
        response = rag_generate(
            query=enhanced_prompt,
            df=rag_df,
            agent_prompt=AGENT3_PROMPT,
            model_name=DEFAULT_MODEL,
            generation_config=AGENT3_GENERATION_CONFIG,
            history=[],
            top_k=3
        )
    else:
        # Direct LLM call if no RAG
        response = _direct_agent3_call(enhanced_prompt)
    
    return response


def orchestrate_rule_generation(
    user_decision: str, 
    proposed_rule: Dict[str, Any],
    conflicts: List[Dict[str, Any]]
) -> Tuple[bool, str, Optional[str]]:
    """
    Orchestrate the rule generation process after user confirmation.
    
    Args:
        user_decision: User's decision (proceed, modify, cancel)
        proposed_rule: The rule to be processed
        conflicts: Any identified conflicts
    
    Returns:
        Tuple of (should_proceed, status_message, orchestration_result)
    """
    import datetime
    import os
    
    # Normalize the decision for consistent handling
    decision = user_decision.lower().strip()
    
    # Log the orchestration request
    print(f"[Agent3] Orchestration request: decision='{decision}', rule='{proposed_rule.get('name', 'Unnamed')}', conflicts={len(conflicts)}")
    
    if decision in ['proceed', 'yes', 'confirm', 'apply']:
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
    
    elif decision in ['modify', 'edit', 'change']:
        print(f"[Agent3] Modification requested for '{proposed_rule.get('name', 'Unnamed')}'")
        return False, "Please provide the modifications you'd like to make.", None
    
    else:  # cancel, no, stop
        print(f"[Agent3] Cancellation requested for '{proposed_rule.get('name', 'Unnamed')}'")
        return False, "Rule generation cancelled.", None


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

    Detected Conflicts: {json.dumps(conflicts, indent=2)}
    
    Key Industry Parameters: {industry_config['key_parameters']}
    
    Check all the current defined rules and check if the proposed rule could conflict with any existing rule.
    Provide a clear, conversational analysis of these conflicts and recommend resolution strategies.
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


def _direct_agent3_call(prompt: str) -> str:
    """Make direct call to Agent 3 when RAG is not available."""
    client = initialize_gemini_client()
    
    full_prompt = f"{AGENT3_PROMPT}\n\n{prompt}"
    contents = [types.Content(role="user", parts=[types.Part.from_text(text=full_prompt)])]
    
    try:
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(**AGENT3_GENERATION_CONFIG)
        )
        return response.text
    except Exception as e:
        return f"I apologize, but I encountered an error processing your request: {str(e)}"


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

# === Rule Versioning Functions for Agent 3 ===

def get_rule_change_summary(rule_id: str) -> str:
    """
    Get a formatted summary of rule changes for Agent 3 to present to users.
    
    Args:
        rule_id: The ID of the rule to get change summary for
        
    Returns:
        Formatted string with rule change information
    """
    try:
        version_summary = get_rule_version_summary(rule_id)
        
        if version_summary["total_versions"] == 0:
            return f"No version history found for rule '{rule_id}'."
        
        summary_lines = [
            f"**Rule Version Summary for {rule_id}:**",
            f"- Total versions: {version_summary['total_versions']}",
            f"- Current version: {version_summary['current_version']}",
            f"- Created: {version_summary['created_at'][:19] if version_summary['created_at'] else 'Unknown'}",
            f"- Last modified: {version_summary['last_modified'][:19] if version_summary['last_modified'] else 'Unknown'}",
            "",
            "**Recent Changes:**"
        ]
        
        # Show last 3 changes
        recent_changes = version_summary['change_history'][:3]
        for change in recent_changes:
            change_line = f"- v{change['version']}: {change['change_summary']}"
            if change['drl_generated']:
                change_line += " ✓ DRL Generated"
            if change['timestamp']:
                change_line += f" ({change['timestamp'][:19]})"
            summary_lines.append(change_line)
        
        if len(version_summary['change_history']) > 3:
            summary_lines.append(f"... and {len(version_summary['change_history']) - 3} more versions")
        
        return "\n".join(summary_lines)
        
    except Exception as e:
        return f"Error retrieving version summary for rule '{rule_id}': {str(e)}"

def get_detailed_rule_history(rule_id: str) -> str:
    """
    Get detailed version history for a rule formatted for Agent 3.
    
    Args:
        rule_id: The ID of the rule
        
    Returns:
        Detailed formatted string with complete version history
    """
    try:
        history = get_rule_version_history(rule_id)
        
        if not history:
            return f"No version history found for rule '{rule_id}'."
        
        history_lines = [f"**Complete Version History for Rule {rule_id}:**", ""]
        
        for version_data in history:
            version_info = version_data.get("version_info", {})
            version_lines = [
                f"### Version {version_info.get('version', 'Unknown')}",
                f"- **Change Type:** {version_info.get('change_type', 'Unknown')}",
                f"- **Summary:** {version_info.get('change_summary', 'No summary')}",
                f"- **Timestamp:** {version_info.get('last_modified', 'Unknown')[:19] if version_info.get('last_modified') else 'Unknown'}",
                f"- **DRL Generated:** {'Yes' if version_info.get('drl_generated') else 'No'}"
            ]
            
            if version_info.get('impact_analysis'):
                version_lines.append(f"- **Impact Analysis:** {version_info['impact_analysis']}")
            
            version_lines.append("")  # Empty line between versions
            history_lines.extend(version_lines)
        
        return "\n".join(history_lines)
        
    except Exception as e:
        return f"Error retrieving detailed history for rule '{rule_id}': {str(e)}"

def add_impact_analysis_to_rule(rule_data: Dict[str, Any], impact_analysis: str) -> Dict[str, Any]:
    """
    Add impact analysis to a rule and update its version.
    
    Args:
        rule_data: The rule data dictionary
        impact_analysis: The impact analysis text to add
        
    Returns:
        Updated rule with impact analysis and new version
    """
    try:
        updated_rule = update_rule_version(
            rule_data,
            change_type="impact_analysis",
            change_summary="Added impact analysis from Agent 3",
            impact_analysis=impact_analysis
        )
        return updated_rule
    except Exception as e:
        print(f"Error adding impact analysis to rule: {e}")
        return rule_data

def check_rule_modification_impact(rule_id: str, proposed_changes: str) -> str:
    """
    Analyze the potential impact of modifying an existing rule.
    
    Args:
        rule_id: The ID of the rule to be modified
        proposed_changes: Description of the proposed changes
        
    Returns:
        Impact analysis string
    """
    try:
        # Get rule history to understand impact
        version_summary = get_rule_version_summary(rule_id)
        
        if version_summary["total_versions"] == 0:
            return f"Impact Analysis: Rule '{rule_id}' not found. This would be a new rule creation."
        
        impact_lines = [
            f"**Modification Impact Analysis for Rule {rule_id}:**",
            f"- Current version: {version_summary['current_version']}",
            f"- Total previous modifications: {version_summary['total_versions'] - 1}",
            f"- Proposed changes: {proposed_changes}",
            "",
            "**Potential Impacts:**"
        ]
        
        # Check if DRL was previously generated
        has_drl = any(change.get('drl_generated', False) for change in version_summary['change_history'])
        if has_drl:
            impact_lines.append("- ⚠️  This rule has generated DRL/GDST files that may need regeneration")
        
        # Check modification frequency
        if version_summary['total_versions'] > 5:
            impact_lines.append("- ⚠️  This rule has been modified frequently - consider stability")
        
        recent_changes = version_summary['change_history'][:2]
        if len(recent_changes) > 1:
            last_change = recent_changes[0].get('timestamp', '')
            if last_change:
                impact_lines.append(f"- Last modified: {last_change[:19]}")
        
        impact_lines.extend([
            "",
            "**Recommendation:** Review conflicts with existing rules before proceeding."
        ])
        
        return "\n".join(impact_lines)
        
    except Exception as e:
        return f"Error analyzing modification impact: {str(e)}"