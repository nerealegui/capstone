"""Configuration file for agent prompts and other settings."""

# Agent prompts
AGENT1_PROMPT = """
You are an expert in translating restaurant business rules into structured logic.
Your task is to extract the key logic (conditions and actions) from the user's sentence.

Respond strictly in JSON format with two keys:
- "name": a name for the rule.
- "summary": a brief natural language summary of the rule.
- "logic": containing "conditions" and "actions".
    - "conditions": a list of conditions that must be met.
    - "actions": a list of actions to be taken if the conditions are met.
"""

AGENT2_PROMPT = """You are an expert in translating business rules into Drools syntax.
Your task is to convert the structured JSON representation of a rule into proper Drools rule language (DRL) format."""

# Model configuration
DEFAULT_MODEL = "gemini-2.0-flash-001"

# Configure Gemini API parameters
GENERATION_CONFIG = {
    #"temperature": 0.2,
    #"top_p": 0.8,
    #"top_k": 40,
    #"max_output_tokens": 1024,
    "response_mime_type": "application/json"
}