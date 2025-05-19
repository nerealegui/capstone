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
    global rule_response
    try:
        drl, gdst = json_to_drl_gdst(rule_response)
        verified = verify_drools_execution(drl, gdst)
        if verified:
            # Save files for download
            drl_path = "generated_rule.drl"
            gdst_path = "generated_table.gdst"
            with open(drl_path, "w") as f:
                f.write(drl)
            with open(gdst_path, "w") as f:
                f.write(gdst)
            return (
                "Rule applied successfully! Download your files below.",
                drl_path,
                gdst_path
            )
        else:
            return ("Verification failed.", None, None)
    except Exception as e:
        return (f"Error: {str(e)}", None, None)

def json_to_drl_gdst(json_data):
    """
    Uses Google Gen AI to translate JSON to DRL and GDST file contents.
    Returns (drl_content, gdst_content)
    """
    client = initialize_gemini()
    
    # Simplified prompt for testing
    prompt = (
        "Given the following JSON, generate equivalent Drools DRL and GDST file contents. "
        "Return DRL first, then GDST, separated by a delimiter '---GDST---'.\n\n"
        f"JSON:\n{json.dumps(json_data, indent=2)}"
    )
    
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)]
        )
    ]
    
    # Configure response type to be text
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain"
    )
    
    try:
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=generate_content_config,
        )
        
        print("Response received, attempting to extract DRL and GDST...")
        
        # Check for different response formats
        if hasattr(response, "text"):
            response_text = response.text
        elif hasattr(response, "parts") and len(response.parts) > 0:
            response_text = response.parts[0].text
        elif hasattr(response, "candidates") and len(response.candidates) > 0:
            response_text = response.candidates[0].content.parts[0].text
        else:
            print("Unexpected response structure:", response)
            # Fallback: Try accessing as dictionary
            response_dict = vars(response)
            print("Response dict keys:", response_dict.keys())
            raise ValueError("Could not extract text from response")
        
        print("Response text excerpt:", response_text[:100] + "...")
        
        # Check if the response has our delimiter
        if "---GDST---" in response_text:
            drl, gdst = response_text.split("---GDST---", 1)
            return drl.strip(), gdst.strip()
        else:
            print("Delimiter not found, attempting to split response logically...")
            # If no delimiter, try to split the response in half
            lines = response_text.split("\n")
            midpoint = len(lines) // 2
            drl = "\n".join(lines[:midpoint])
            gdst = "\n".join(lines[midpoint:])
            return drl.strip(), gdst.strip()
            
    except Exception as e:
        print(f"Error processing GenAI response: {e}")
        raise ValueError(f"Error in GenAI response processing: {str(e)}")

def verify_drools_execution(drl_content, gdst_content):
    """
    Placeholder for Drools execution verification.
    Returns True if verification passes, False otherwise.
    """
    # TODO: Integrate with actual Drools engine if available.
    return True

# Placeholder function for chat interaction
def echo(message, history):
    return message

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""

    # Create components to be shared between panels
    name_display = gr.Textbox(value="Name will appear here after input.", label="Name")
    summary_display = gr.Textbox(value="Summary will appear here after input.", label="Summary")
    # Removed JSON display block as requested
    drl_file = gr.File(label="Download DRL")
    gdst_file = gr.File(label="Download GDST")
    status_box = gr.Textbox(label="Status")
   
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
                    # Removed logic block extraction
                    
                    # Return response and values for additional_outputs
                    return response, name, summary
                
                # Create the ChatInterface with additional_outputs
                chat_interface = gr.ChatInterface(
                    fn=chat_and_update,
                    chatbot=gr.Chatbot(),
                    textbox=gr.Textbox(
                        placeholder="Message...",
                        scale=7
                    ),
                    additional_outputs=[name_display, summary_display],

                )
                
            # Right panel
            with gr.Column(scale=1):
                gr.Markdown("# Rule Summary")
                
                name_display.render()
                summary_display.render()
                # Removed logic_display.render() as requested

                preview_button = gr.Button("Preview & Apply", variant="primary")
                preview_button.click(preview_apply_rule, outputs=[status_box, drl_file, gdst_file])
                status_box.render()
                drl_file.render()
                gdst_file.render()
    
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

