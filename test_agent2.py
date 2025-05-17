#!/usr/bin/env python

import os
import json
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from gemini_gradio_poc.chat_app import agent2_generate_drl, validate_drools_file, agent2_generate_gdst

# Set API key for testing - replace with your own API key or set in .env file
api_key = os.environ.get('GOOGLE_API_KEY')
if not api_key:
    print("Warning: No API key found. Please set GOOGLE_API_KEY environment variable.")
    print("Skipping test.")
    sys.exit(1)

# Sample rule from Agent 1
sample_rule = {
    "conditions": [
        "Restaurant size is large"
    ],
    "actions": [
        "Change required base number of employees from 10 to 12"
    ]
}

def test_agent2():
    print("Testing Agent 2 functionality...")
    
    # Generate DRL file
    print("\n1. Generating DRL file...")
    drl_content, rule_name = agent2_generate_drl(sample_rule)
    print(f"Rule name: {rule_name}")
    print(f"DRL content:\n{drl_content}")
    
    # Validate DRL file
    print("\n2. Validating DRL file...")
    is_valid, message = validate_drools_file(drl_content)
    print(f"Validation result: {is_valid}")
    print(f"Validation message: {message}")
    
    # Generate GDST file
    print("\n3. Generating GDST file...")
    gdst_content, _ = agent2_generate_gdst(sample_rule, drl_content)
    print(f"GDST content:\n{gdst_content[:500]}...")  # Show first 500 chars
    
    return {
        "drl_content": drl_content,
        "gdst_content": gdst_content,
        "rule_name": rule_name,
        "is_valid": is_valid,
        "validation_message": message
    }

if __name__ == "__main__":
    test_agent2()