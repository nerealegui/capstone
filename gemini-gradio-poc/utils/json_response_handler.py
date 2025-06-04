"""
JSON Response Handler for Gemini API Responses

This module provides utilities for handling JSON responses from Google's Gemini models.
It helps clean up, parse, and validate JSON responses to handle common issues like 
incomplete JSON, formatting errors, and other parsing problems.
"""

import json
import re
import logging
from typing import Dict, List, Any, Union, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class JsonResponseHandler:
    """
    A utility class for handling JSON responses from Gemini models.
    Provides methods to clean and validate JSON responses, with robust error handling.
    """
    
    @staticmethod
    def clean_json_string(json_str: str) -> str:
        """
        Clean a string that contains JSON to make it parseable.
        
        Args:
            json_str (str): The string containing JSON data
            
        Returns:
            str: Cleaned JSON string
        """
        # Log the original string for debugging
        logger.debug(f"Cleaning JSON string: {json_str[:100]}...")
        
        # Remove any leading/trailing non-JSON content
        json_match = re.search(r'(\[|\{).*(\]|\})', json_str, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        
        # Fix truncated JSON
        open_brackets = json_str.count('{') + json_str.count('[')
        close_brackets = json_str.count('}') + json_str.count(']')
        
        if open_brackets > close_brackets:
            # Add missing closing brackets
            json_str += '}' * (json_str.count('{') - json_str.count('}'))
            json_str += ']' * (json_str.count('[') - json_str.count(']'))
        
        # Replace ellipsis in arrays with empty values
        json_str = re.sub(r'\[\s*\.\.\.\s*\]', '[]', json_str)
        
        # Fix trailing commas
        json_str = re.sub(r',\s*(\}|\])', r'\1', json_str)
        
        logger.debug(f"Cleaned JSON string: {json_str[:100]}...")
        return json_str

    @staticmethod
    def parse_json_response(response_text: str) -> Union[Dict[str, Any], List[Any]]:
        """
        Parse a JSON response from text, applying cleaning if needed.
        
        Args:
            response_text (str): Text containing JSON
            
        Returns:
            dict or list: Parsed JSON data
            
        Raises:
            ValueError: If JSON cannot be parsed after cleaning
        """
        try:
            # First attempt direct parsing
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            logger.warning(f"Initial JSON parsing failed: {e}")
            
            # Clean and try again
            cleaned_json = JsonResponseHandler.clean_json_string(response_text)
            try:
                return json.loads(cleaned_json)
            except json.JSONDecodeError as e2:
                logger.error(f"JSON parsing failed even after cleaning: {e2}")
                logger.error(f"Problematic JSON: {cleaned_json}")
                raise ValueError(f"Failed to parse JSON response: {e2}")

    @staticmethod
    def get_json_response_from_gemini(
        model, 
        prompt: str, 
        temperature: float = 0.2, 
        response_mime_type: str = "application/json", 
        max_retries: int = 3
    ) -> Union[Dict[str, Any], List[Any]]:
        """
        Make a request to Gemini with retry logic for getting valid JSON.
        
        Args:
            model: The Gemini model to use
            prompt (str): The prompt to send to the model
            temperature (float): Temperature for generation
            response_mime_type (str): The expected MIME type
            max_retries (int): Maximum number of retries
            
        Returns:
            dict or list: The parsed JSON response
        """
        from google.ai import generativelanguage as glm
        
        retries = 0
        last_error = None
        
        while retries < max_retries:
            try:
                generation_config = glm.GenerationConfig(
                    temperature=temperature,
                    response_mime_type=response_mime_type
                )
                
                response = model.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                
                response_text = response.text
                logger.debug(f"Raw response: {response_text[:200]}...")
                
                return JsonResponseHandler.parse_json_response(response_text)
                
            except Exception as e:
                retries += 1
                last_error = e
                logger.warning(f"Attempt {retries} failed: {e}")
                
                # If we've hit max retries, add explicit instructions for JSON formatting
                if retries == max_retries - 1:
                    prompt += "\nImportant: Your response must be valid JSON. Do not include any text before or after the JSON."
        
        # If we get here, all retries failed
        logger.error(f"All {max_retries} attempts failed to get valid JSON")
        raise ValueError(f"Failed to get valid JSON response after {max_retries} attempts: {last_error}")

    @staticmethod
    def enhance_json_prompt(prompt: str) -> str:
        """
        Enhance a prompt to encourage valid JSON responses from Gemini.
        
        Args:
            prompt (str): Original prompt
            
        Returns:
            str: Enhanced prompt
        """
        # Add JSON-specific instructions to the prompt
        if "json" not in prompt.lower():
            prompt += "\n\nReturn your response as valid JSON."
        
        # Add formatting guidelines
        prompt += "\nImportant: Your response must be valid, properly formatted JSON. Do not include any text before or after the JSON structure."
        
        return prompt
