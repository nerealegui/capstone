import json
import pandas as pd
from typing import List, Dict, Any
from google.genai import types
from config.agent_config import DEFAULT_MODEL, GENERATION_CONFIG
from utils.rag_utils import initialize_gemini_client

def extract_rules_from_csv(csv_file_path: str) -> List[Dict[str, Any]]:
    """
    Extract business rules from a CSV file and convert them to structured JSON format.
    Uses a single API call to process all rules at once, with automatic batching for large files.
    
    Args:
        csv_file_path (str): Path to the CSV file containing business rules
        
    Returns:
        List[Dict[str, Any]]: List of structured business rules in JSON format
    """
    try:
        # Read CSV file with proper handling of different delimiters
        try:
            df = pd.read_csv(csv_file_path)
        except Exception as csv_error:
            print(f"Error reading CSV with default delimiter, trying semicolon: {csv_error}")
            df = pd.read_csv(csv_file_path, sep=';')
        
        # Convert DataFrame to list of dictionaries
        csv_rules = df.to_dict('records')
        
        print(f"Found {len(csv_rules)} rules in CSV file")
        
        # Use LLM to convert all CSV rows to structured JSON format
        # For larger files, processing is automatically handled in batches
        max_batch_size = 30
        if len(csv_rules) > max_batch_size:
            print(f"Processing {len(csv_rules)} rules in multiple batches of {max_batch_size}")
            all_rules = []
            
            # Process in batches to avoid context length issues
            for i in range(0, len(csv_rules), max_batch_size):
                batch = csv_rules[i:i+max_batch_size]
                print(f"Processing batch {i//max_batch_size + 1} with {len(batch)} rules")
                batch_rules = _convert_all_csv_rules_to_json(batch)
                all_rules.extend(batch_rules)
            
            return all_rules
        else:
            # Process in a single batch if small enough
            return _convert_all_csv_rules_to_json(csv_rules)
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

def _convert_all_csv_rules_to_json(csv_rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convert multiple CSV rule rows to structured JSON format using a single LLM API call.
    
    Args:
        csv_rules (List[Dict[str, Any]]): List of rules from CSV as dictionaries
        
    Returns:
        List[Dict[str, Any]]: List of structured rules in JSON format
    """
    try:
        client = initialize_gemini_client()
        
        # Print debug info if there are many rules
        num_rules = len(csv_rules)
        print(f"Processing {num_rules} rules in batch")
        
        # Limit the number of rules to avoid exceeding context length
        max_rules_per_batch = 30
        if num_rules > max_rules_per_batch:
            print(f"Warning: Large number of rules detected ({num_rules}). Processing only first {max_rules_per_batch} rules in this batch.")
            csv_rules = csv_rules[:max_rules_per_batch]
        
        prompt = f"""
Convert these business rules from CSV format to structured JSON format.
Return an array of JSON objects, one for each rule.

CSV Rules:
{json.dumps(csv_rules, indent=2)}

Convert each rule to this JSON structure:
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

IMPORTANT: Return only a valid JSON array containing all converted rules, no additional text.
Make sure the output is properly formatted as valid JSON without any markdown formatting or code blocks.
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
        
        # Clean the response text to ensure it's valid JSON
        # Remove any markdown code block indicators and leading/trailing whitespace
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        try:
            # Parse JSON response
            structured_rules = json.loads(response_text)
            if not isinstance(structured_rules, list):
                print(f"Warning: Response is not a list. Got type: {type(structured_rules)}")
                # If we got a single object, wrap it in a list
                if isinstance(structured_rules, dict):
                    structured_rules = [structured_rules]
                else:
                    raise ValueError(f"Response is not a list or dictionary: {type(structured_rules)}")
                
        except json.JSONDecodeError as json_error:
            print(f"JSON parsing error: {json_error}")
            # Log a small sample of the problematic response for debugging
            print(f"Response excerpt (first 100 chars): {response_text[:100]}...")
            print(f"Response excerpt (char position around error): {response_text[max(0, json_error.pos-50):min(len(response_text), json_error.pos+50)]}")
            raise
            
        return structured_rules
        
    except Exception as e:
        print(f"Error converting CSV rules to JSON: {e}")
        # Fallback to processing in smaller batches if we have many rules
        if len(csv_rules) > 10:
            print("Attempting to process in smaller batches...")
            mid = len(csv_rules) // 2
            try:
                first_half = _convert_all_csv_rules_to_json(csv_rules[:mid])
                second_half = _convert_all_csv_rules_to_json(csv_rules[mid:])
                return first_half + second_half
            except Exception as batch_error:
                print(f"Error processing in smaller batches: {batch_error}")
                # Fall back to basic conversion
                pass
        
        # Final fallback to basic conversion if all else fails
        print("Falling back to basic conversion...")
        return [_basic_csv_to_json_conversion(rule) for rule in csv_rules]