import os
import gradio as gr
from google.genai import types

# MOVE THIS TO A CONFIG FILE
# Default prompts
AGENT1_PROMPT = """
You are an expert in translating restaurant business rules into structured logic.
Your task is to extract the key logic (conditions and actions) from the user's sentence.

Respond strictly in JSON format with two keys:
- "logic": containing "conditions" and "actions".
- "summary": a brief natural language summary of the rule.
"""

AGENT2_PROMPT = """You are an expert in translating business rules into Drools syntax.
Your task is to convert the structured JSON representation of a rule into proper Drools rule language (DRL) format."""



def initialize_gemini():
    """Initialize the Gemini API with the API key from environment variables."""
    import google.genai as genai
    from google.genai import types

    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("Google API key not found in environment variables. Please check your .env file.")

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(api_version="v1alpha")
    )
    return client

import json

def chat_function(user_input, history):
    try:
        client = initialize_gemini()
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=AGENT1_PROMPT + user_input)],
            )
        ]
        generate_content_config = types.GenerateContentConfig(response_mime_type="application/json")

        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=contents,
            config=generate_content_config,
        )

        response_json = json.loads(response.text)

        logic = response_json.get("logic", {})
        summary = response_json.get("summary", "")

        conditions = logic.get("conditions", "No conditions provided.")
        actions = logic.get("actions", "No actions provided.")

        logic_markdown = f"### Conditions\n{conditions}\n\n### Actions\n{actions}"

        return summary, logic_markdown

    except Exception as e:
        error_message = f"Error: {str(e)}"
        return error_message, ""

def preview_apply_rule():
    # Placeholder for preview & apply functionality
    return "Rule applied successfully!"

# Placeholder function for chat interaction
# This function should be replaced with the actual chat logic
def echo(message, history):
    return message

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""

    logic_display = gr.Markdown("## Logic will appear here after input.")
    summary_display = gr.Markdown("## Summary will appear here after input.")

    
    # Create the interface with the base theme
    with gr.Blocks(theme=gr.themes.Base(), css="""
        /* Hide footer and labels */
        footer {visibility: hidden}
        label[data-testid='block-label'] {visibility: hidden}
    """) as demo:
        with gr.Row():
            # Left panel
            
            with gr.Column(scale=1):
                gr.Markdown("# Rule Management Bot")
                chat_interface = gr.ChatInterface(
                    fn=chat_function,
                    chatbot=gr.Chatbot(),
                    textbox=gr.Textbox(
                        placeholder="Message...",
                        scale=7
                    ),
                    undo_btn=None,
                    clear_btn=None,
                    retry_btn=None
                )

                """ # Manually connect outputs
                chat_interface.chatbot.change(
                    fn=chat_function,
                    inputs=[chat_interface.textbox],
                    #outputs=[logic_display, summary_display]
                    outputs=[summary_display]
                ) """
                
            # Right panel
            with gr.Column(scale=1):
                gr.Markdown("# Existing Rules")
                with gr.Group(elem_classes=["rules-section"]):
                    gr.Markdown("Rule 1")
                    gr.Markdown("Rule 2")
                    gr.Markdown("Rule 3")

                gr.Markdown("# Rule Summary")
                
                
                preview_button = gr.Button("Preview & Apply", variant="primary")

        preview_button.click(preview_apply_rule)
    
    return demo


def agent1_process(user_input: str) -> dict:
    """
    Agent 1: Extract conditions and actions from natural language.
    Uses RAG to provide context from business documents.
    
    Args:
        user_input: Natural language description of the business rule.
        
    Returns:
        JSON representation of the rule.
    """
    # Implement the logic to extract conditions and actions from user_input
    # This is a placeholder for the actual implementation
    

    conditions = extract_conditions(user_input)
    actions = extract_actions(user_input)
    return {
        "conditions": conditions,
        "actions": actions
    }

