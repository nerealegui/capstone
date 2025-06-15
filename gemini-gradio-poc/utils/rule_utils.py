"""
Rule utilities with enhanced versioning support and refactored design.

Refactoring improvements:
- Modular function design with single responsibility principle
- Enhanced error handling and validation
- Better parameter naming for clarity
- Separated concerns between DRL generation and versioning
- Comprehensive type hints and documentation
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, Any, Tuple, Union, Optional
from google.genai import types
from config.agent_config import DEFAULT_MODEL, GENERATION_CONFIG
from utils.rag_utils import initialize_gemini_client
from utils.rule_versioning import update_rule_version


class DRLGenerationError(Exception):
    """Custom exception for DRL generation errors."""
    pass


class RuleFileManager:
    """
    Utility class for managing rule file operations.
    Refactoring improvement: Separated file operations into dedicated class.
    """
    
    @staticmethod
    def find_rule_files(rule_storage_paths: list) -> list:
        """
        Find existing rule files in potential storage locations.
        
        Args:
            rule_storage_paths: List of potential file paths to check
            
        Returns:
            List of existing file paths
        """
        existing_files = []
        for file_path in rule_storage_paths:
            path = Path(file_path)
            if path.exists():
                existing_files.append(path)
        return existing_files
    
    @staticmethod
    def load_rules_from_file(file_path: Path) -> Union[Dict[str, Any], list, None]:
        """
        Load rules from a JSON file with error handling.
        
        Args:
            file_path: Path to the JSON file
            
        Returns:
            Parsed JSON data or None if error
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading rules from {file_path}: {e}")
            return None
    
    @staticmethod
    def save_rules_to_file(file_path: Path, rules_data: Union[Dict[str, Any], list]) -> bool:
        """
        Save rules to a JSON file with error handling.
        
        Args:
            file_path: Path to save the file
            rules_data: Rules data to save
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(rules_data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving rules to {file_path}: {e}")
            return False


class DRLContentCleaner:
    """
    Utility class for cleaning generated DRL and GDST content.
    Refactoring improvement: Separated content cleaning logic.
    """
    
    @staticmethod
    def clean_drl_content(content: str) -> str:
        """
        Clean DRL content by removing unwanted markup.
        
        Args:
            content: Raw DRL content
            
        Returns:
            Cleaned DRL content
        """
        # Remove code block markers
        cleaned = re.sub(r"```drl|```", "", content)
        return cleaned.strip()
    
    @staticmethod
    def clean_gdst_content(content: str) -> str:
        """
        Clean GDST content by removing unwanted markup.
        
        Args:
            content: Raw GDST content
            
        Returns:
            Cleaned GDST content
        """
        # Remove code block markers
        cleaned = re.sub(r"```gdst|```", "", content)
        return cleaned.strip()


def json_to_drl_gdst(json_data: Dict[str, Any], 
                     update_rule_version_info: bool = True, 
                     rule_storage_path: str = "data/rules") -> Tuple[str, str]:
    """
    Uses Google Gen AI to translate JSON to DRL and GDST file contents with versioning support.
    
    Refactoring improvements:
    - Better parameter naming and documentation
    - Separated concerns between generation and versioning
    - Enhanced error handling with custom exceptions
    - Improved content cleaning logic
    
    Args:
        json_data: The JSON rule data to convert
        update_rule_version_info: Whether to update rule versioning info
        rule_storage_path: Path where JSON rules are stored
        
    Returns:
        Tuple of (drl_content, gdst_content)
        
    Raises:
        DRLGenerationError: If generation fails
        ValueError: If input validation fails
    """
    if not isinstance(json_data, dict):
        raise ValueError("JSON data must be a dictionary")
    
    try:
        client = initialize_gemini_client()
        prompt = _build_generation_prompt(json_data)
        
        response_text = _generate_content_with_ai(client, prompt)
        drl_content, gdst_content = _parse_generated_content(response_text)
        
        # Update rule versioning information if requested
        if update_rule_version_info and json_data.get("rule_id"):
            _update_rule_with_drl_generation_info(json_data, rule_storage_path)
        
        return drl_content, gdst_content
        
    except Exception as e:
        raise DRLGenerationError(f"Failed to generate DRL/GDST content: {str(e)}")


def _build_generation_prompt(json_data: Dict[str, Any]) -> str:
    """
    Build the comprehensive prompt for DRL/GDST generation.
    Refactoring improvement: Extracted prompt building for clarity and reusability.
    
    Args:
        json_data: The JSON rule data
        
    Returns:
        Complete prompt string for AI generation
    """
    base_prompt = (
        "Given the following JSON, generate equivalent Drools DRL and GDST file contents. "
        "Return DRL first, then GDST, separated by a delimiter '---GDST---'.\n\n"
        f"JSON:\n{json.dumps(json_data, indent=2)}\n\n"
    )
    
    guidelines = """
🔧 General Instructions:
- Use the Drools rule language syntax and conventions.
- Assume all domain objects used in rules are strongly typed Java objects.
- If you are creating a rule, clearly define the object's class name, fields, and package in a comment above the rule (or include a class stub).
- If you are modifying an already existing rule, just import it using its full package name (e.g., `com.example.classify_restaurant_size`).

📄 DRL File Guidelines:
- Use proper type bindings (e.g., `$order: Order(...)`) and not `Map` or untyped objects.
- If the object is undefined or new (when you are creating a new rule), mention it as a note or include a class definition block in comments.
- Do not include code fences or markdown formatting.
- Do not use package rules, only use package com

📄 GDST File Guidelines:
- Set the correct `<factType>` and `<factTypePackage>` for each pattern and action.
- Include all object types used in the `<imports>` section.
- If a new rule is created, include the new objects definition or a description of expected fields in a comment.

🛑 Never use untyped `Map` unless explicitly instructed. Always prefer typed fact classes.

Your output must be executable by Drools and help the developer avoid compilation errors due to missing object types.

Do not include any additional text, just return the DRL and GDST contents in the specified format, so I am able to run it with drools directly.
"""
    
    return base_prompt + guidelines


def _generate_content_with_ai(client, prompt: str) -> str:
    """
    Generate content using the AI client with proper error handling.
    Refactoring improvement: Extracted AI interaction for better testability.
    
    Args:
        client: Initialized AI client
        prompt: Generation prompt
        
    Returns:
        Generated response text
        
    Raises:
        DRLGenerationError: If AI generation fails
    """
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)]
        )
    ]
    
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain"
    )
    
    try:
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=generate_content_config,
        )
        
        # Extract response text with multiple fallback methods
        if hasattr(response, "text"):
            return response.text
        elif hasattr(response, "parts") and len(response.parts) > 0:
            return response.parts[0].text
        elif hasattr(response, "candidates") and len(response.candidates) > 0:
            return response.candidates[0].content.parts[0].text
        else:
            raise DRLGenerationError("Could not extract text from AI response")
            
    except Exception as e:
        raise DRLGenerationError(f"AI content generation failed: {str(e)}")


def _parse_generated_content(response_text: str) -> Tuple[str, str]:
    """
    Parse the generated content into DRL and GDST components.
    Refactoring improvement: Extracted parsing logic for clarity.
    
    Args:
        response_text: Raw response from AI
        
    Returns:
        Tuple of (cleaned_drl_content, cleaned_gdst_content)
    """
    if "---GDST---" in response_text:
        drl_raw, gdst_raw = response_text.split("---GDST---", 1)
    else:
        # Fallback: split content in half
        lines = response_text.split("\n")
        midpoint = len(lines) // 2
        drl_raw = "\n".join(lines[:midpoint])
        gdst_raw = "\n".join(lines[midpoint:])
    
    # Clean the content
    drl_content = DRLContentCleaner.clean_drl_content(drl_raw)
    gdst_content = DRLContentCleaner.clean_gdst_content(gdst_raw)
    
    return drl_content, gdst_content


def _update_rule_with_drl_generation_info(json_data: Dict[str, Any], rule_storage_path: str) -> None:
    """
    Update the JSON rule file with DRL generation information.
    Refactoring improvement: Simplified and more robust file updating.
    
    Args:
        json_data: The rule data that was used for DRL generation
        rule_storage_path: Path where JSON rules are stored
    """
    rule_id = json_data.get("rule_id")
    if not rule_id:
        return
    
    try:
        # Update rule with versioning info for DRL generation
        updated_rule = update_rule_version(
            json_data.copy(),
            change_type="drl_generation",
            change_summary="Generated DRL and GDST files from JSON rule",
            drl_generated=True
        )
        
        # Find and update rule files
        potential_paths = [
            Path(rule_storage_path) / "extracted_rules.json",
            Path("data") / "extracted_rules.json",
            Path("extracted_rules.json")
        ]
        
        for rules_file in potential_paths:
            if rules_file.exists():
                _update_rule_in_specific_file(rules_file, updated_rule)
                break
        
    except Exception as e:
        print(f"Warning: Could not update rule versioning info: {e}")


def _update_rule_in_specific_file(rules_file_path: Path, updated_rule: Dict[str, Any]) -> None:
    """
    Update a specific rule in a JSON rules file.
    Refactoring improvement: More robust file updating with better error handling.
    
    Args:
        rules_file_path: Path to the JSON rules file
        updated_rule: The updated rule data
    """
    try:
        rules_data = RuleFileManager.load_rules_from_file(rules_file_path)
        if rules_data is None:
            return
        
        # Handle both list of rules and single rule formats
        if isinstance(rules_data, list):
            _update_rule_in_list(rules_data, updated_rule)
        elif isinstance(rules_data, dict) and rules_data.get("rule_id") == updated_rule.get("rule_id"):
            rules_data = updated_rule
        
        # Save the updated rules
        RuleFileManager.save_rules_to_file(rules_file_path, rules_data)
        
    except Exception as e:
        print(f"Error updating rule in file {rules_file_path}: {e}")


def _update_rule_in_list(rules_list: list, updated_rule: Dict[str, Any]) -> None:
    """
    Update a rule within a list of rules.
    Refactoring improvement: Extracted list updating logic.
    
    Args:
        rules_list: List of rules to update
        updated_rule: The updated rule data
    """
    rule_id = updated_rule.get("rule_id")
    for i, rule in enumerate(rules_list):
        if rule.get("rule_id") == rule_id:
            rules_list[i] = updated_rule
            break


def load_rule_with_version_info(rule_id: str, rule_storage_path: str = "data/rules") -> Optional[Dict[str, Any]]:
    """
    Load a rule with its version information from storage.
    Refactoring improvement: Better error handling and path management.
    
    Args:
        rule_id: The ID of the rule to load
        rule_storage_path: Path where rules are stored
        
    Returns:
        Rule dictionary with version info, or None if not found
    """
    if not rule_id:
        return None
    
    potential_paths = [
        Path(rule_storage_path) / "extracted_rules.json",
        Path("data") / "extracted_rules.json", 
        Path("extracted_rules.json")
    ]
    
    for rules_file in potential_paths:
        rule_data = _search_rule_in_file(rules_file, rule_id)
        if rule_data:
            return rule_data
    
    return None


def _search_rule_in_file(rules_file: Path, rule_id: str) -> Optional[Dict[str, Any]]:
    """
    Search for a specific rule in a file.
    Refactoring improvement: Extracted search logic for reusability.
    
    Args:
        rules_file: Path to the rules file
        rule_id: ID of the rule to find
        
    Returns:
        Rule data if found, None otherwise
    """
    try:
        rules_data = RuleFileManager.load_rules_from_file(rules_file)
        if rules_data is None:
            return None
        
        # Handle both list and single rule formats
        if isinstance(rules_data, list):
            for rule in rules_data:
                if rule.get("rule_id") == rule_id:
                    return rule
        elif isinstance(rules_data, dict) and rules_data.get("rule_id") == rule_id:
            return rules_data
            
    except Exception as e:
        print(f"Error searching rule in file {rules_file}: {e}")
    
    return None


def verify_drools_execution(drl_content: str, gdst_content: str) -> bool:
    """
    Verify that the generated DRL and GDST content is valid for Drools execution.
    
    Args:
        drl_content: Generated DRL content
        gdst_content: Generated GDST content
        
    Returns:
        True if content appears valid, False otherwise
    """
    if not drl_content or not gdst_content:
        return False
    
    # Basic validation checks
    if not drl_content.strip() or not gdst_content.strip():
        return False
    
    # Check for basic DRL structure
    if "rule" not in drl_content.lower() or "when" not in drl_content.lower():
        return False
    
    # Check for basic GDST/XML structure
    if "<" not in gdst_content or ">" not in gdst_content:
        return False
    
    # TODO: Integrate with actual Drools engine if available for deeper validation
    return True
