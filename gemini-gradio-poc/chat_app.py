import os
import gradio as gr
from google import genai
from google.genai import types
from agent_config import AGENT1_PROMPT, AGENT2_PROMPT, DEFAULT_MODEL, GENERATION_CONFIG
import json


def initialize_gemini():
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("Google API key not found in environment variables. Please check your .env file.")

    client = genai.Client(
        api_key=api_key
    )
    return client

def chat_function(user_input, history):
    global rule_response
    try:
        client = initialize_gemini()

        contents = []
        # Build contents from history
        contents = []
        if history:
            for user_msg, model_response in history:
                # Append user's previous message
                contents.append(
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=user_msg)]
                    )
                )
                # Append model's previous response
                contents.append(
                    types.Content(
                        role="model",
                        parts=[types.Part.from_text(text=model_response)]
                    )
                )

        # Append the current user input with prompt
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=AGENT1_PROMPT + user_input)]
            )
        )

        generate_content_config = types.GenerateContentConfig(
            response_mime_type=GENERATION_CONFIG["response_mime_type"]
        )

        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=generate_content_config,
        )

        print("Response received from Gemini API.")

        # Parse the response
        parsed_response = json.loads(response.text)

        # Validate the response type
        if isinstance(parsed_response, dict):
            rule_response = parsed_response
        else:
            rule_response = {
                "name": "Unexpected response format",
                "summary": "The API returned an unexpected format.",
                "logic": {"message": "No logic available."}
            }

        summary = rule_response.get("summary", "No summary available.")
        return summary

    except Exception as e:
        error_message = f"Error: {str(e)}"
        rule_response = {
            "name": "General Error",
            "summary": error_message,
            "logic": {"message": "No logic available."}
        }
        return error_message

def preview_apply_rule():
    # Placeholder for preview & apply functionality
    return "Rule applied successfully!"

# Placeholder function for chat interaction
def echo(message, history):
    return message

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""

    # Create components to be shared between panels
    name_display = gr.Textbox(value="Name will appear here after input.", label="Name")
    summary_display = gr.Textbox(value="Summary will appear here after input.", label="Summary")
    logic_display = gr.JSON(value={
        "message": "Logic will appear here after input."
    }, label="Logic")
   
    with gr.Blocks(theme=gr.themes.Base(), css="""
        /* Hide footer and labels */
        footer {visibility: hidden}
        label[data-testid='block-label'] {visibility: hidden}
    """) as demo:
        with gr.Row():
            # Left panel
            with gr.Column(scale=1):
                gr.Markdown("# Rule Management Bot")
                
                # Modified chat function that returns a tuple containing the response
                # and the values for additional_outputs
                def chat_and_update(user_input, history):
                    global rule_response  # Access the global variable
                    
                    # Process the user input
                    response = chat_function(user_input, history)
                    
                    # Get values from rule_response for the additional outputs
                    name = rule_response.get('name', 'Name will appear here after input.')
                    summary = rule_response.get('summary', 'Summary will appear here after input.')
                    logic = rule_response.get('logic', {"message": "No logic available."})
                    
                    # Return response and values for additional_outputs
                    return response, name, summary, logic
                
                # Create the ChatInterface with additional_outputs
                chat_interface = gr.ChatInterface(
                    fn=chat_and_update,
                    chatbot=gr.Chatbot(),
                    textbox=gr.Textbox(
                        placeholder="Message...",
                        scale=7
                    ),
                    additional_outputs=[name_display, summary_display, logic_display],

                )
                
            # Right panel
            with gr.Column(scale=1):
                gr.Markdown("# Rule Summary")
                
                name_display.render()
                summary_display.render()
                logic_display.render()

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

