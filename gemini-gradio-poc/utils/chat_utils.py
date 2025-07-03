"""
Chat utility functions for handling different chat modes and interactions.
This module contains the core chat logic separated from UI concerns.
"""

import json
import pandas as pd
from typing import Dict, List, Any, Tuple
from config.agent_config import AGENT1_PROMPT, DEFAULT_MODEL, GENERATION_CONFIG
from utils.json_response_handler import JsonResponseHandler
from utils.rag_utils import rag_generate, initialize_gemini_client
from utils.workflow_orchestrator import run_business_rule_workflow
from utils.agent3_utils import analyze_rule_conflicts, assess_rule_impact

# Module-level variable to store the last rule response
last_rule_response = {}

def chat_with_rag(user_input: str, history: list, rag_state_df: pd.DataFrame) -> str:
    """
    Chat function using RAG (Retrieval-Augmented Generation).
    
    Args:
        user_input (str): User's input message
        history (list): Chat history
        rag_state_df (pd.DataFrame): RAG state DataFrame
        
    Returns:
        str: Response summary
    """
    global last_rule_response
    
    # Defensive: ensure rag_state_df is always a DataFrame
    if rag_state_df is None:
        rag_state_df = pd.DataFrame()
    
    # Check for empty input
    if not user_input or not user_input.strip():
        return "Please enter a message."
    
    # Validate API key without storing unused client variable
    try:
        initialize_gemini_client()
    except ValueError as e:
        error_message = f"API Key Error: {e}"
        print(error_message)
        return error_message
    
    # Determine if RAG should be used (if rag_state_df is not empty)
    use_rag = not rag_state_df.empty

    if use_rag:
        try:
            llm_response_text = rag_generate(
                query=user_input,
                df=rag_state_df,
                agent_prompt=AGENT1_PROMPT,
                model_name=DEFAULT_MODEL,
                generation_config=GENERATION_CONFIG,
                history=history,
                top_k=3
            )
            try:
                # Use the JsonResponseHandler to parse the response
                rule_response = JsonResponseHandler.parse_json_response(llm_response_text)
                print("Parsed rule_response:", rule_response)
                if not isinstance(rule_response, dict):
                    raise ValueError("Response is not a JSON object.")
                last_rule_response = rule_response
            except (json.JSONDecodeError, ValueError, Exception) as e:
                print(f"Warning: Could not parse LLM response as JSON. Error: {e}")
                print(f"Raw LLM Response received:\n{llm_response_text[:300]}...")
                rule_response = {
                    "name": "LLM Response Parse Error",
                    "summary": f"The AI returned a response, but it wasn't valid JSON. Raw response start: {llm_response_text[:150]}...",
                    "logic": {"message": "Response was not in expected JSON format."}
                }
                last_rule_response = rule_response
        except Exception as e:
            rule_response = {
                "name": "RAG Generation Error",
                "summary": f"An error occurred during RAG response generation: {str(e)}",
                "logic": {"message": "RAG failed."}
            }
            last_rule_response = rule_response
    else:
        print("Knowledge base is empty. RAG is not active.")
        rule_response = {
            "name": "Knowledge Base Empty",
            "summary": "Knowledge base not built. Please upload documents and click 'Build Knowledge Base' first.",
            "logic": {"message": "RAG index is empty."}
        }
        last_rule_response = rule_response

    # Extract values for the response
    return rule_response.get('summary', 'No summary available.')


def chat_with_agent3(user_input: str, history: list, rag_state_df: pd.DataFrame, industry: str = "generic") -> str:
    """
    Enhanced Agent 3 conversation with Langraph workflow orchestration.
    
    Langraph Workflow uses all 3 agents:
    - Agent 1: Natural language → structured JSON rule parsing
    - Agent 3: Conflict analysis, impact assessment, and orchestration decisions
    - Agent 2: DRL/GDST file generation (when needed)
    
    Args:
        user_input (str): User's input message
        history (list): Chat history
        rag_state_df (pd.DataFrame): RAG state DataFrame
        industry (str): Industry context
        
    Returns:
        str: Formatted response with workflow status
    """
    global last_rule_response
    
    # Defensive: ensure rag_state_df is always a DataFrame
    if rag_state_df is None:
        rag_state_df = pd.DataFrame()
    
    try:
        print(f"[Chat] 🔄 Using Langraph workflow orchestration for: {user_input[:50]}...")
        
        # Create status message for user feedback
        status_prefix = "🔄 **Langraph Workflow Active**\n\n"
        
        # Run Langraph workflow
        workflow_result = run_business_rule_workflow(
            user_input=user_input,
            rag_df=rag_state_df if not rag_state_df.empty else None,
            industry=industry,
            history=history
        )
        
        # Extract results for UI updates
        if workflow_result.get("structured_rule"):
            rule_response = workflow_result["structured_rule"]
            # Add workflow metadata
            rule_response["workflow_type"] = "langraph"
            rule_response["summary"] = workflow_result.get("response", "")
            
            # Add workflow execution details
            if workflow_result.get("conflicts"):
                rule_response["conflicts_found"] = len(workflow_result["conflicts"])
            if workflow_result.get("verification_result"):
                rule_response["verification"] = workflow_result["verification_result"]
                
            # Add status information to the response
            status_info = "\n\n---\n**Workflow Status:**\n"
            status_info += f"✅ Agent 1: Rule parsed successfully\n"
            status_info += f"✅ Agent 3: Analyzed {rule_response.get('conflicts_found', 0)} conflicts\n"
            if workflow_result.get("drl_content"):
                status_info += f"✅ Agent 2: Generated DRL/GDST files\n"
            if workflow_result.get("verification_result"):
                status_info += f"✅ Files verified: {workflow_result['verification_result']}\n"
                
            # Store for UI updates
            last_rule_response = rule_response
                
        else:
            # Default rule_response for non-rule conversations
            rule_response = {
                "name": "Langraph Workflow Response",
                "summary": workflow_result.get("response", ""),
                "workflow_type": "langraph",
                "logic": {"message": "Processed via Langraph workflow"}
            }
            status_info = "\n\n---\n**Workflow Status:**\n✅ Processed via Langraph workflow orchestration\n"
            
            # Store for UI updates
            last_rule_response = rule_response
        
        base_response = workflow_result.get("response", "I processed your request using the Langraph workflow.")
        response = status_prefix + base_response + status_info
        
        # Handle errors
        if workflow_result.get("error"):
            print(f"[Chat] Langraph workflow error: {workflow_result['error']}")
            return f"⚠️ **Langraph workflow encountered an error.**\n\nError: {workflow_result['error']}\n\nPlease try again or check your configuration."
        
        return response
        
    except Exception as e:
        print(f"[Chat] Langraph workflow failed: {e}")
        return f"⚠️ **Langraph workflow failed.**\n\nError: {str(e)}\n\nPlease check your configuration and try again."


def analyze_impact_only(rule_response: Dict[str, Any], industry: str = "generic") -> Tuple[str, None, None]:
    """
    Analyze impact without generating drools files - for Enhanced Agent 3 mode.
    
    Args:
        rule_response (Dict[str, Any]): Rule response dictionary
        industry (str): Industry context
        
    Returns:
        Tuple[str, None, None]: Status message with analysis, no files
    """
    try:
        if not rule_response:
            return "No rule to analyze. Please interact with the chat first.", None, None

        # Get existing rules for validation using persistence manager
        existing_rules = []
        try:
            from utils.persistence_manager import load_rules
            rules, _ = load_rules()
            if rules is not None:
                existing_rules = rules
        except Exception as e:
            print(f"Warning: Could not load existing rules for analysis: {e}")
            pass

        # Use Agent 3 for enhanced conflict detection and impact analysis
        conflicts, conflict_analysis = analyze_rule_conflicts(
            rule_response, existing_rules, industry
        )
        
        impact_analysis = assess_rule_impact(
            rule_response, existing_rules, industry
        )

        if conflicts:
            conflict_messages = []
            for conflict in conflicts:
                impact_info = conflict.get('industry_impact', 'No impact analysis available')
                conflict_messages.append(
                    f"⚠️ {conflict['type']}: {conflict['message']}\n"
                    f"   Industry Impact: {impact_info}"
                )
            
            detailed_message = (
                "⚠️ Conflicts Detected by Agent 3:\n\n" + 
                "\n\n".join(conflict_messages) + 
                f"\n\n📊 Detailed Analysis:\n{conflict_analysis}\n\n" +
                f"📈 Impact Assessment:\n{json.dumps(impact_analysis, indent=2)}\n\n" +
                "Please use the Decision Support section below to proceed, modify, or cancel."
            )
            return (detailed_message, None, None)

        # If no conflicts, show positive impact analysis
        success_message = (
            f"📈 Detailed Analysis:\n{conflict_analysis}\n\n" +
            "Rule is ready for implementation. Use the Decision Support section below to proceed."
        )
        
        return (success_message, None, None)
            
    except Exception as e:
        return (f"Agent 3 Analysis Error: {str(e)}", None, None)


def get_last_rule_response() -> Dict[str, Any]:
    """Get the last rule response for UI updates."""
    return last_rule_response
