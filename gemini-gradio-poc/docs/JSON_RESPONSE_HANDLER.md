# JSON Response Handler for Gemini API

## Overview

The `JsonResponseHandler` is a utility class designed to handle JSON responses from Google's Gemini models. It provides robust error handling and cleaning methods to ensure valid JSON is returned from the API, even when the raw response contains formatting issues.

## Problem Solved

When using Gemini models to generate JSON responses, several issues can occur:

1. Responses sometimes include text before or after the actual JSON
2. JSON might be truncated, leaving unclosed brackets
3. Invalid syntax like trailing commas or ellipses might be included
4. The model might not properly format the JSON structure

This utility addresses these issues by:
- Detecting and extracting valid JSON from responses
- Repairing common JSON formatting errors
- Enhancing prompts to encourage valid JSON responses
- Handling exceptions with informative error messages

## How to Use

### Basic Usage

```python
from utils.json_response_handler import JsonResponseHandler
import json

# For parsing and cleaning JSON responses
try:
    response_text = "Some response with JSON: { 'name': 'Test Rule'..."  # Truncated JSON
    parsed_json = JsonResponseHandler.parse_json_response(response_text)
    print(parsed_json)
except ValueError as e:
    print(f"Error: {e}")
```

### Enhancing Prompts for Better JSON Responses

```python
from utils.json_response_handler import JsonResponseHandler

# Original prompt
prompt = "Extract business rules from this text"

# Enhanced prompt for JSON responses
enhanced_prompt = JsonResponseHandler.enhance_json_prompt(prompt)
# Will add instructions for valid JSON formatting
```

### Working with Gemini API

```python
from utils.json_response_handler import JsonResponseHandler
from google import genai

# Initialize Gemini client
genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-1.5-pro")

# Get a JSON response with robust error handling
try:
    prompt = "Extract the business rule from this text"
    result = JsonResponseHandler.get_json_response_from_gemini(
        model=model,
        prompt=prompt,
        temperature=0.2
    )
    print(result)
except ValueError as e:
    print(f"Error: {e}")
```

## Methods

### `clean_json_string(json_str)`
Cleans a JSON string by fixing common formatting issues.

### `parse_json_response(response_text)`
Attempts to parse a JSON response, applying cleaning if needed.

### `get_json_response_from_gemini(model, prompt, temperature, response_mime_type, max_retries)`
Makes a request to Gemini with retry logic for getting valid JSON.

### `enhance_json_prompt(prompt)`
Enhances a prompt to encourage valid JSON responses.

## Integration with Project

This handler is integrated with:
1. `chat_app.py` - For parsing responses in chat interactions
2. `rag_utils.py` - For handling JSON responses during RAG generation
3. Any other component that needs to work with Gemini API JSON responses

## Changelog

- **v1.0.0** (June 4, 2025): Initial implementation
  - Added JSON response cleaning and parsing
  - Added retry mechanism with improved prompting
  - Added prompt enhancement for better JSON responses
  - Integrated with chat_app.py and rag_utils.py
