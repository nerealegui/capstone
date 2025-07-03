"""
File generation utilities for business rules.
This module handles the generation of DRL and GDST files from rule responses.
"""

import json
from typing import Tuple, Dict, Any
from utils.agent3_utils import analyze_rule_conflicts, orchestrate_rule_generation
from utils.rule_utils import json_to_drl_gdst, verify_drools_execution


def handle_generation(rule_response: Dict[str, Any], industry: str) -> Tuple[str, str, str]:
    """
    Handle file generation for business rules.
    
    Args:
        rule_response (Dict[str, Any]): Rule response dictionary
        industry (str): Selected industry context
    
    Returns:
        Tuple: (status_message, drl_file_path, gdst_file_path)
    """
    try:
        # Get existing rules for validation using persistence manager
        existing_rules = []
        try:
            from utils.persistence_manager import load_rules
            rules, _ = load_rules()
            if rules is not None:
                existing_rules = rules
        except Exception as e:
            print(f"Warning: Could not load existing rules for generation: {e}")
            pass
        
        # Check for conflicts first
        conflicts, conflict_analysis = analyze_rule_conflicts(
            rule_response, existing_rules, industry
        )
        should_proceed, status_msg, orchestration_result_json = orchestrate_rule_generation(rule_response, conflicts)
        
        # Parse the orchestration result
        try:
            if orchestration_result_json:
                orchestration_result = json.loads(orchestration_result_json)
            else:
                orchestration_result = None
            
            if orchestration_result and orchestration_result.get("agent2_trigger", False):
                # Get the rule data from the orchestration result
                rule_data = orchestration_result.get("rule_data", {})
                
                # Call Agent 2 to generate DRL and GDST
                drl, gdst = json_to_drl_gdst(rule_data)
                verified = verify_drools_execution(drl, gdst)
                
                if verified:
                    # Save files for download
                    drl_path = "generated_rule.drl"
                    gdst_path = "generated_table.gdst"
                    with open(drl_path, "w") as f:
                        f.write(drl)
                    with open(gdst_path, "w") as f:
                        f.write(gdst)
                    
                    message = (
                        f"### ✓ Rule Generation Successful\n\n"
                        f"**Rule:** {rule_data.get('name', 'Unnamed Rule')}\n\n"
                        f"**Files have been created:**\n"
                        f"- **DRL**: {drl_path}\n"
                        f"- **GDST**: {gdst_path}\n\n"
                        f"You can download the files below."
                    )
                    return message, drl_path, gdst_path
                else:
                    return "### ⚠️ Generation Issue\n\nRule syntax verified, but execution verification failed.", None, None
            
            return f"### ℹ️ Status Update\n\n{status_msg} {orchestration_result.get('action', '') if orchestration_result else ''}", None, None
            
        except json.JSONDecodeError:
            return f"### ⚠️ Processing Error\n\nError processing orchestration result.\n\n{status_msg}", None, None
        except Exception as e:
            return f"### ❌ Generation Error\n\nAn error occurred during rule generation:\n\n```\n{str(e)}\n```", None, None
            
    except Exception as e:
        return f"### ❌ Generation Error\n\nAn error occurred during rule generation:\n\n```\n{str(e)}\n```", None, None
