import csv
import json
import pandas as pd
from typing import List, Dict, Any
from google.genai import types
from config.agent_config import DEFAULT_MODEL, GENERATION_CONFIG
from utils.rag_utils import initialize_gemini_client
import time

def extract_rules_from_csv(csv_file_path: str) -> List[Dict[str, Any]]:
    """
    Extract business rules from a CSV file and convert them to structured JSON format.
    
    Args:
        csv_file_path (str): Path to the CSV file containing business rules
        
    Returns:
        List[Dict[str, Any]]: List of structured business rules in JSON format
    """
    try:
        # Read CSV file
        df = pd.read_csv(csv_file_path)
        
        # Convert DataFrame to list of dictionaries
        csv_rules = df.to_dict('records')
        
        # Use LLM to convert each CSV row to structured JSON format
        structured_rules = []
        
        for rule in csv_rules:
            structured_rule = _convert_csv_rule_to_json(rule)
            if structured_rule:
                structured_rules.append(structured_rule)
                # Add a delay between requests (adjust the delay as needed)
                time.sleep(2.5)  # At least 2 seconds, add a buffer
        return structured_rules
        
    except Exception as e:
        print(f"Error extracting rules from CSV: {e}")
        return []

def _convert_csv_rule_to_json(csv_rule: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert a single CSV rule row to structured JSON format using LLM.
    
    Args:
        csv_rule (Dict[str, Any]): Single rule from CSV as dictionary
        
    Returns:
        Dict[str, Any]: Structured rule in JSON format
    """
    try:
        client = initialize_gemini_client()
        
        prompt = f"""
Convert this business rule from CSV format to structured JSON format:

CSV Rule: {json.dumps(csv_rule, indent=2)}

Convert to this JSON structure:
{{
  "rule_id": "rule_id from CSV",
  "name": "rule_name from CSV", 
  "category": "category from CSV",
  "description": "description from CSV",
  "summary": "Generate a brief summary of what this rule does",
  "conditions": [
    {{
      "field": "Extract field from condition text",
      "operator": "Extract operator (equals, greater_than, less_than, etc.)",
      "value": "Extract value from condition"
    }}
  ],
  "actions": [
    {{
      "type": "Extract action type from action text",
      "details": "Extract action details"
    }}
  ],
  "priority": "priority from CSV",
  "active": "active status from CSV"
}}

Return only valid JSON, no additional text.
"""
        
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)]
            )
        ]
        
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="application/json"
        )
        
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=generate_content_config,
        )
        
        if hasattr(response, "text"):
            response_text = response.text
        elif hasattr(response, "parts") and len(response.parts) > 0:
            response_text = response.parts[0].text
        elif hasattr(response, "candidates") and len(response.candidates) > 0:
            response_text = response.candidates[0].content.parts[0].text
        else:
            raise ValueError("Could not extract text from response")
        
        # Parse JSON response
        structured_rule = json.loads(response_text)
        return structured_rule
        
    except Exception as e:
        print(f"Error converting CSV rule to JSON: {e}")
        # Fallback to basic conversion if LLM fails
        return _basic_csv_to_json_conversion(csv_rule)

def _basic_csv_to_json_conversion(csv_rule: Dict[str, Any]) -> Dict[str, Any]:
    """
    Basic fallback conversion from CSV to JSON without LLM.
    
    Args:
        csv_rule (Dict[str, Any]): Single rule from CSV as dictionary
        
    Returns:
        Dict[str, Any]: Basic structured rule in JSON format
    """
    return {
        "rule_id": csv_rule.get("rule_id", ""),
        "name": csv_rule.get("rule_name", ""),
        "category": csv_rule.get("category", ""),
        "description": csv_rule.get("description", ""),
        "summary": csv_rule.get("description", ""),
        "conditions": [
            {
                "field": "condition",
                "operator": "raw",
                "value": csv_rule.get("condition", "")
            }
        ],
        "actions": [
            {
                "type": "action",
                "details": csv_rule.get("action", "")
            }
        ],
        "priority": csv_rule.get("priority", "Medium"),
        "active": csv_rule.get("active", True)
    }

def validate_rule_conflicts(new_rule: Dict[str, Any], existing_rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validate a new rule against existing rules to detect potential conflicts.
    
    Args:
        new_rule (Dict[str, Any]): New rule to validate
        existing_rules (List[Dict[str, Any]]): List of existing rules
        
    Returns:
        List[Dict[str, Any]]: List of potential conflicts found
    """
    conflicts = []
    
    for existing_rule in existing_rules:
        # Check for duplicate rule IDs
        if new_rule.get("rule_id") == existing_rule.get("rule_id"):
            conflicts.append({
                "type": "duplicate_id",
                "message": f"Rule ID {new_rule.get('rule_id')} already exists",
                "conflicting_rule": existing_rule.get("name", "Unknown")
            })
        
        # Check for similar conditions (basic check)
        if (new_rule.get("category") == existing_rule.get("category") and
            new_rule.get("name") == existing_rule.get("name")):
            conflicts.append({
                "type": "duplicate_rule",
                "message": f"Similar rule already exists: {existing_rule.get('name')}",
                "conflicting_rule": existing_rule.get("name", "Unknown")
            })
    
    return conflicts

def save_extracted_rules(rules: List[Dict[str, Any]], output_path: str) -> bool:
    """
    Save extracted rules to a JSON file.
    
    Args:
        rules (List[Dict[str, Any]]): List of structured rules
        output_path (str): Path to save the JSON file
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        with open(output_path, 'w') as f:
            json.dump(rules, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving rules: {e}")
        return False