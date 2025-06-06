"""
Tests for JSON Response Handler utility.
"""

import unittest
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from utils.json_response_handler import JsonResponseHandler

class TestJsonResponseHandler(unittest.TestCase):
    """Test case for the JsonResponseHandler utility."""

    def test_clean_json_string(self):
        """Test cleaning of JSON strings with various issues."""
        # Test case 1: JSON with unclosed brackets
        unclosed_json = '{"name": "Test Rule", "conditions": ['
        cleaned = JsonResponseHandler.clean_json_string(unclosed_json)
        self.assertEqual(cleaned, '{"name": "Test Rule", "conditions": []}')
        
        # Test case 2: JSON with text before and after
        text_around_json = 'Here is the rule: {"name": "Test"} Hope this helps!'
        cleaned = JsonResponseHandler.clean_json_string(text_around_json)
        self.assertEqual(cleaned, '{"name": "Test"}')
        
        # Test case 3: JSON with trailing commas
        trailing_comma = '{"name": "Test", "value": 123,}'
        cleaned = JsonResponseHandler.clean_json_string(trailing_comma)
        self.assertEqual(cleaned, '{"name": "Test", "value": 123}')
        
        # Test case 4: JSON with ellipses
        ellipsis_json = '{"data": [...], "more": 123}'
        cleaned = JsonResponseHandler.clean_json_string(ellipsis_json)
        self.assertEqual(cleaned, '{"data": [], "more": 123}')

    def test_parse_json_response(self):
        """Test parsing of JSON responses with cleaning."""
        # Test case 1: Valid JSON
        valid_json = '{"name": "Test Rule", "value": 123}'
        result = JsonResponseHandler.parse_json_response(valid_json)
        self.assertEqual(result, {"name": "Test Rule", "value": 123})
        
        # Test case 2: Invalid JSON that can be fixed
        fixable_json = 'Response: {"name": "Test Rule",}'
        result = JsonResponseHandler.parse_json_response(fixable_json)
        self.assertEqual(result, {"name": "Test Rule"})
        
        # Test case 3: Completely invalid JSON
        invalid_json = "This is not JSON at all"
        with self.assertRaises(ValueError):
            JsonResponseHandler.parse_json_response(invalid_json)

    def test_enhance_json_prompt(self):
        """Test enhancement of prompts for better JSON responses."""
        # Test case 1: Simple prompt
        simple_prompt = "Extract business rules from text"
        enhanced = JsonResponseHandler.enhance_json_prompt(simple_prompt)
        self.assertIn("Return your response as valid JSON", enhanced)
        
        # Test case 2: Prompt that already mentions JSON
        json_prompt = "Extract business rules in JSON format"
        enhanced = JsonResponseHandler.enhance_json_prompt(json_prompt)
        self.assertIn("Important: Your response must be valid", enhanced)

if __name__ == "__main__":
    unittest.main()
