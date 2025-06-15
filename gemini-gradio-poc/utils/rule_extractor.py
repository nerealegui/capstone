"""
Enhanced rule extraction utilities with versioning support and refactored design.

Refactoring improvements:
- Modular class structure for better organization
- Enhanced error handling and validation
- Better naming conventions for clarity
- Separated concerns between CSV processing and versioning
- Improved rate limiting and retry logic
"""

import csv
import json
import os
import pandas as pd
import time
from typing import List, Dict, Any, Optional, Tuple
from google.genai import types
from config.agent_config import DEFAULT_MODEL, GENERATION_CONFIG
from utils.rag_utils import initialize_gemini_client
from utils.rule_versioning import create_versioned_rule, update_rule_version


class CSVProcessingError(Exception):
    """Custom exception for CSV processing errors."""
    pass


class RuleExtractionConfig:
    """
    Configuration class for rule extraction parameters.
    Refactoring improvement: Centralized configuration management.
    """
    
    def __init__(self, 
                 request_delay: float = 2.5,
                 max_retries: int = 3,
                 retry_delay: float = 1.0,
                 enable_versioning: bool = True):
        """
        Initialize extraction configuration.
        
        Args:
            request_delay: Delay between AI requests to avoid rate limiting
            max_retries: Maximum number of retry attempts for failed requests
            retry_delay: Delay between retry attempts
            enable_versioning: Whether to add versioning metadata to extracted rules
        """
        self.request_delay = request_delay
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.enable_versioning = enable_versioning


class CSVRuleParser:
    """
    Utility class for parsing CSV rule data with improved validation.
    Refactoring improvement: Separated CSV parsing logic from extraction logic.
    """
    
    @staticmethod
    def load_csv_rules(csv_file_path: str) -> List[Dict[str, Any]]:
        """
        Load and validate CSV rules from file.
        
        Args:
            csv_file_path: Path to the CSV file
            
        Returns:
            List of rule dictionaries from CSV
            
        Raises:
            CSVProcessingError: If CSV loading fails
        """
        if not csv_file_path or not isinstance(csv_file_path, str):
            raise CSVProcessingError("CSV file path must be a non-empty string")
        
        if not os.path.exists(csv_file_path):
            raise CSVProcessingError(f"CSV file not found: {csv_file_path}")
        
        try:
            df = pd.read_csv(csv_file_path)
            
            if df.empty:
                raise CSVProcessingError("CSV file is empty")
            
            # Convert DataFrame to list of dictionaries
            csv_rules = df.to_dict('records')
            
            # Basic validation
            if not csv_rules:
                raise CSVProcessingError("No valid rules found in CSV")
            
            return csv_rules
            
        except pd.errors.EmptyDataError:
            raise CSVProcessingError("CSV file is empty or invalid")
        except pd.errors.ParserError as e:
            raise CSVProcessingError(f"CSV parsing error: {str(e)}")
        except Exception as e:
            raise CSVProcessingError(f"Error loading CSV file: {str(e)}")
    
    @staticmethod
    def validate_csv_rule(csv_rule: Dict[str, Any]) -> bool:
        """
        Validate a single CSV rule entry.
        
        Args:
            csv_rule: Rule dictionary from CSV
            
        Returns:
            True if rule is valid, False otherwise
        """
        if not isinstance(csv_rule, dict):
            return False
        
        # Check for required fields (basic validation)
        required_fields = ['rule_id', 'rule_name']  # Minimum required fields
        
        for field in required_fields:
            if field not in csv_rule or not csv_rule[field]:
                return False
        
        return True


class LLMRuleConverter:
    """
    Utility class for converting CSV rules to JSON using LLM with retry logic.
    Refactoring improvement: Separated LLM interaction logic with enhanced error handling.
    """
    
    def __init__(self, config: RuleExtractionConfig):
        """
        Initialize the converter with configuration.
        
        Args:
            config: Rule extraction configuration
        """
        self.config = config
        self.client = None
    
    def _ensure_client_initialized(self) -> None:
        """Ensure the AI client is initialized."""
        if self.client is None:
            self.client = initialize_gemini_client()
    
    def convert_csv_rule_to_json(self, csv_rule: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Convert a single CSV rule to structured JSON format using LLM with retry logic.
        
        Args:
            csv_rule: Single rule from CSV as dictionary
            
        Returns:
            Structured rule in JSON format, or None if conversion fails
        """
        if not CSVRuleParser.validate_csv_rule(csv_rule):
            print(f"Warning: Invalid CSV rule format: {csv_rule}")
            return None
        
        for attempt in range(self.config.max_retries):
            try:
                return self._attempt_rule_conversion(csv_rule)
            except Exception as e:
                print(f"Conversion attempt {attempt + 1} failed: {e}")
                if attempt < self.config.max_retries - 1:
                    time.sleep(self.config.retry_delay)
                else:
                    print(f"Failed to convert rule after {self.config.max_retries} attempts")
                    return self._fallback_conversion(csv_rule)
        
        return None
    
    def _attempt_rule_conversion(self, csv_rule: Dict[str, Any]) -> Dict[str, Any]:
        """
        Attempt to convert a CSV rule using the LLM.
        
        Args:
            csv_rule: Rule data from CSV
            
        Returns:
            Converted rule in JSON format
            
        Raises:
            Exception: If conversion fails
        """
        self._ensure_client_initialized()
        
        prompt = self._build_conversion_prompt(csv_rule)
        response_text = self._generate_with_llm(prompt)
        structured_rule = self._parse_llm_response(response_text)
        
        return structured_rule
    
    def _build_conversion_prompt(self, csv_rule: Dict[str, Any]) -> str:
        """
        Build the prompt for CSV to JSON conversion.
        Refactoring improvement: Extracted prompt building for reusability.
        
        Args:
            csv_rule: Rule data from CSV
            
        Returns:
            Formatted prompt for LLM
        """
        return f"""
Convert this CSV business rule into a structured JSON format:

CSV Rule Data:
{json.dumps(csv_rule, indent=2)}

Please convert to this JSON structure:
{{
  "rule_id": "rule ID from CSV",
  "name": "rule name from CSV", 
  "category": "category from CSV",
  "description": "description from CSV",
  "summary": "brief natural language summary of the rule",
  "conditions": [
    {{
      "field": "field name",
      "operator": "comparison operator", 
      "value": "comparison value"
    }}
  ],
  "actions": [
    {{
      "type": "action type",
      "details": "action details"
    }}
  ],
  "priority": "priority from CSV",
  "active": "active status from CSV"
}}

Return a single JSON object only (not a list).
"""
    
    def _generate_with_llm(self, prompt: str) -> str:
        """
        Generate content using the LLM with proper error handling.
        
        Args:
            prompt: Generation prompt
            
        Returns:
            Generated response text
            
        Raises:
            Exception: If generation fails
        """
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)]
            )
        ]
        
        response = self.client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        if hasattr(response, "text"):
            return response.text
        elif hasattr(response, "candidates") and len(response.candidates) > 0:
            return response.candidates[0].content.parts[0].text
        else:
            raise Exception("Could not extract text from LLM response")
    
    def _parse_llm_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse and validate the LLM response.
        
        Args:
            response_text: Raw response from LLM
            
        Returns:
            Parsed JSON rule
            
        Raises:
            Exception: If parsing fails
        """
        try:
            structured_rule = json.loads(response_text)
            
            # Validate the result is a dictionary
            if not isinstance(structured_rule, dict):
                raise ValueError(f"Expected a dictionary, but got {type(structured_rule)}")
            
            return structured_rule
            
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response from LLM: {e}")
    
    def _fallback_conversion(self, csv_rule: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fallback conversion when LLM fails.
        Refactoring improvement: Added robust fallback mechanism.
        
        Args:
            csv_rule: Original CSV rule data
            
        Returns:
            Basic JSON structure with available data
        """
        print("Using fallback conversion method")
        
        return {
            "rule_id": csv_rule.get("rule_id", "unknown"),
            "name": csv_rule.get("rule_name", "Unnamed Rule"),
            "category": csv_rule.get("category", "general"),
            "description": csv_rule.get("description", "No description available"),
            "summary": f"Basic rule conversion from CSV: {csv_rule.get('rule_name', 'Unknown')}",
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


class VersionedRuleProcessor:
    """
    Processor for adding versioning information to extracted rules.
    Refactoring improvement: Separated versioning logic from extraction logic.
    """
    
    @staticmethod
    def add_versioning_to_rule(rule_data: Dict[str, Any], 
                              enable_versioning: bool = True) -> Dict[str, Any]:
        """
        Add versioning metadata to an extracted rule.
        
        Args:
            rule_data: Rule data without versioning
            enable_versioning: Whether to add versioning metadata
            
        Returns:
            Rule with versioning metadata (if enabled)
        """
        if not enable_versioning or not isinstance(rule_data, dict):
            return rule_data
        
        try:
            versioned_rule = create_versioned_rule(
                rule_data=rule_data,
                change_type="create",
                change_summary="Rule extracted from CSV upload"
            )
            
            if isinstance(versioned_rule, dict):
                return versioned_rule
            else:
                print(f"Warning: Versioning returned invalid format: {type(versioned_rule)}")
                return rule_data
                
        except Exception as e:
            print(f"Warning: Failed to add versioning metadata: {e}")
            return rule_data


def extract_rules_from_csv(csv_file_path: str, 
                          config: Optional[RuleExtractionConfig] = None) -> List[Dict[str, Any]]:
    """
    Extract business rules from a CSV file and convert them to structured JSON format with versioning.
    
    Refactoring improvements:
    - Better parameter organization with config object
    - Enhanced error handling and validation
    - Separated concerns between parsing, conversion, and versioning
    - Improved rate limiting and retry logic
    
    Args:
        csv_file_path: Path to the CSV file containing business rules
        config: Optional configuration for extraction process
        
    Returns:
        List of structured business rules in JSON format with versioning
        
    Raises:
        CSVProcessingError: If CSV processing fails
    """
    if config is None:
        config = RuleExtractionConfig()
    
    try:
        # Load and validate CSV rules
        csv_rules = CSVRuleParser.load_csv_rules(csv_file_path)
        
        # Initialize converters
        llm_converter = LLMRuleConverter(config)
        
        # Process each rule
        structured_rules = []
        total_rules = len(csv_rules)
        
        print(f"Processing {total_rules} rules from CSV...")
        
        for i, csv_rule in enumerate(csv_rules):
            print(f"Processing rule {i + 1}/{total_rules}: {csv_rule.get('rule_name', 'Unknown')}")
            
            # Convert CSV rule to JSON
            structured_rule = llm_converter.convert_csv_rule_to_json(csv_rule)
            
            if structured_rule:
                # Add versioning metadata if enabled
                versioned_rule = VersionedRuleProcessor.add_versioning_to_rule(
                    structured_rule, config.enable_versioning
                )
                structured_rules.append(versioned_rule)
            else:
                print(f"Warning: Skipping invalid rule: {csv_rule}")
            
            # Rate limiting - add delay between requests
            if i < total_rules - 1:  # Don't delay after the last request
                time.sleep(config.request_delay)
        
        print(f"Successfully processed {len(structured_rules)} out of {total_rules} rules")
        return structured_rules
        
    except CSVProcessingError:
        raise  # Re-raise CSV-specific errors
    except Exception as e:
        raise CSVProcessingError(f"Unexpected error during rule extraction: {str(e)}")


# Legacy function maintained for backward compatibility
def _convert_csv_rule_to_json(csv_rule: Dict[str, Any]) -> Dict[str, Any]:
    """
    Legacy function for backward compatibility.
    Delegates to the new refactored converter.
    
    Args:
        csv_rule: Single rule from CSV as dictionary
        
    Returns:
        Structured rule in JSON format
    """
    config = RuleExtractionConfig()
    converter = LLMRuleConverter(config)
    return converter.convert_csv_rule_to_json(csv_rule)


def _basic_csv_to_json_conversion(csv_rule: Dict[str, Any]) -> Dict[str, Any]:
    """
    Basic fallback conversion from CSV to JSON without LLM.
    Refactoring improvement: Enhanced with better field mapping.
    
    Args:
        csv_rule: Single rule from CSV as dictionary
        
    Returns:
        Basic structured rule in JSON format
    """
    converter = LLMRuleConverter(RuleExtractionConfig())
    return converter._fallback_conversion(csv_rule)


class ConflictDetector:
    """
    Utility class for detecting conflicts between rules.
    Refactoring improvement: Separated conflict detection logic with enhanced algorithms.
    """
    
    @staticmethod
    def detect_rule_conflicts(new_rule: Dict[str, Any], 
                            existing_rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect potential conflicts between a new rule and existing rules.
        
        Args:
            new_rule: New rule to validate
            existing_rules: List of existing rules
            
        Returns:
            List of potential conflicts found
        """
        if not isinstance(new_rule, dict) or not isinstance(existing_rules, list):
            return []
        
        conflicts = []
        
        for existing_rule in existing_rules:
            if not isinstance(existing_rule, dict):
                continue
            
            # Check for duplicate rule IDs
            id_conflicts = ConflictDetector._check_id_conflicts(new_rule, existing_rule)
            conflicts.extend(id_conflicts)
            
            # Check for duplicate rule names/content
            name_conflicts = ConflictDetector._check_name_conflicts(new_rule, existing_rule)
            conflicts.extend(name_conflicts)
            
            # Check for logical conflicts
            logical_conflicts = ConflictDetector._check_logical_conflicts(new_rule, existing_rule)
            conflicts.extend(logical_conflicts)
        
        return conflicts
    
    @staticmethod
    def _check_id_conflicts(new_rule: Dict[str, Any], 
                          existing_rule: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for rule ID conflicts."""
        conflicts = []
        
        new_id = new_rule.get("rule_id")
        existing_id = existing_rule.get("rule_id")
        
        if new_id and existing_id and new_id == existing_id:
            conflicts.append({
                "type": "duplicate_id",
                "message": f"Rule ID '{new_id}' already exists",
                "conflicting_rule": existing_rule.get("name", "Unknown"),
                "severity": "high"
            })
        
        return conflicts
    
    @staticmethod
    def _check_name_conflicts(new_rule: Dict[str, Any], 
                            existing_rule: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for rule name conflicts."""
        conflicts = []
        
        new_name = new_rule.get("name", "").lower()
        existing_name = existing_rule.get("name", "").lower()
        new_category = new_rule.get("category", "").lower()
        existing_category = existing_rule.get("category", "").lower()
        
        if (new_name and existing_name and new_name == existing_name and
            new_category == existing_category):
            conflicts.append({
                "type": "duplicate_rule",
                "message": f"Similar rule already exists: {existing_rule.get('name')}",
                "conflicting_rule": existing_rule.get("name", "Unknown"),
                "severity": "medium"
            })
        
        return conflicts
    
    @staticmethod
    def _check_logical_conflicts(new_rule: Dict[str, Any], 
                               existing_rule: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for logical conflicts between rules."""
        conflicts = []
        
        # Basic check for overlapping conditions
        new_conditions = new_rule.get("conditions", [])
        existing_conditions = existing_rule.get("conditions", [])
        
        if ConflictDetector._conditions_overlap(new_conditions, existing_conditions):
            conflicts.append({
                "type": "logical_conflict",
                "message": f"Conditions may overlap with existing rule: {existing_rule.get('name')}",
                "conflicting_rule": existing_rule.get("name", "Unknown"),
                "severity": "low"
            })
        
        return conflicts
    
    @staticmethod
    def _conditions_overlap(conditions1: List[Dict[str, Any]], 
                          conditions2: List[Dict[str, Any]]) -> bool:
        """Check if two sets of conditions overlap."""
        if not conditions1 or not conditions2:
            return False
        
        # Simple overlap check - can be enhanced with more sophisticated logic
        for cond1 in conditions1:
            for cond2 in conditions2:
                if (cond1.get("field") == cond2.get("field") and
                    cond1.get("operator") == cond2.get("operator")):
                    return True
        
        return False


class EnhancedRuleFileSaver:
    """
    Enhanced utility class for saving extracted rules with versioning support.
    Refactoring improvement: Better file handling with versioning and merge options.
    """
    
    @staticmethod
    def save_rules_to_file(rules: List[Dict[str, Any]], 
                          output_path: str, 
                          update_existing: bool = False) -> bool:
        """
        Save extracted rules to a JSON file with versioning support.
        
        Args:
            rules: List of structured rules
            output_path: Path to save the JSON file
            update_existing: Whether to update existing rules or overwrite
            
        Returns:
            True if successful, False otherwise
        """
        if not rules or not isinstance(rules, list):
            print("Error: No valid rules to save")
            return False
        
        if not output_path:
            print("Error: Output path is required")
            return False
        
        try:
            rules_to_save = rules.copy()
            
            # Handle existing file merging if requested
            if update_existing and os.path.exists(output_path):
                rules_to_save = EnhancedRuleFileSaver._merge_with_existing_rules(
                    rules_to_save, output_path
                )
            
            # Save the rules
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(rules_to_save, f, indent=2, ensure_ascii=False)
            
            print(f"Successfully saved {len(rules_to_save)} rules to {output_path}")
            return True
            
        except Exception as e:
            print(f"Error saving rules to {output_path}: {e}")
            return False
    
    @staticmethod
    def _merge_with_existing_rules(new_rules: List[Dict[str, Any]], 
                                 file_path: str) -> List[Dict[str, Any]]:
        """
        Merge new rules with existing rules in a file.
        
        Args:
            new_rules: List of new rules to add
            file_path: Path to existing rules file
            
        Returns:
            Merged list of rules
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                existing_rules = json.load(f)
            
            if not isinstance(existing_rules, list):
                print("Warning: Existing file format not supported for merging")
                return new_rules
            
            # Create a map of existing rules by rule_id
            existing_map = {rule.get("rule_id"): rule for rule in existing_rules}
            
            # Update or add rules
            for new_rule in new_rules:
                rule_id = new_rule.get("rule_id")
                if rule_id in existing_map:
                    # Update existing rule with versioning
                    updated_rule = update_rule_version(
                        new_rule,
                        change_type="update",
                        change_summary="Rule updated via CSV upload"
                    )
                    existing_map[rule_id] = updated_rule
                else:
                    # Add new rule (should already have versioning from extraction)
                    existing_map[rule_id] = new_rule
            
            return list(existing_map.values())
            
        except Exception as e:
            print(f"Warning: Could not merge with existing rules: {e}")
            return new_rules


# Backward compatibility functions
def validate_rule_conflicts(new_rule: Dict[str, Any], 
                          existing_rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Legacy function for backward compatibility.
    Delegates to the new refactored conflict detector.
    
    Args:
        new_rule: New rule to validate
        existing_rules: List of existing rules
        
    Returns:
        List of potential conflicts found
    """
    return ConflictDetector.detect_rule_conflicts(new_rule, existing_rules)


def save_extracted_rules(rules: List[Dict[str, Any]], 
                        output_path: str, 
                        update_existing: bool = False) -> bool:
    """
    Legacy function for backward compatibility.
    Delegates to the new refactored file saver.
    
    Args:
        rules: List of structured rules
        output_path: Path to save the JSON file
        update_existing: Whether to update existing rules or overwrite
        
    Returns:
        True if successful, False otherwise
    """
    return EnhancedRuleFileSaver.save_rules_to_file(rules, output_path, update_existing)