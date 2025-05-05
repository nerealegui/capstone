import os
import gradio as gr

prompt = (f"You are an expert in translating restaurant business rules into structured logic. Your task is to extract the key logic (conditions and actions) from the user's sentence. Here is the sentence: ")

def initialize_gemini():
    """Initialize the Gemini API with the API key from environment variables."""
    # Import the module here so it's only imported after dependencies are installed
    import google.generativeai as genai
    
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("Google API key not found in environment variables. Please check your .env file.")
    
    genai.configure(api_key=api_key)
    
    # Set up the model
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 1024,
    }
    
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=generation_config
    )
    
    return model




def chat_function(user_input,history):
    """Process user input and get response from Gemini API."""
    try:
        model = initialize_gemini()
        # We can use the history parameter to provide context from previous exchanges:
        # For example:
        # context = ""
        # if history:
        #     for human_msg, ai_msg in history[-3:]:  # Use the last 3 exchanges
        #         context += f"User: {human_msg}\nAssistant: {ai_msg}\n"
        # full_prompt = f"{context}{prompt}{user_input}"
        # response = model.generate_content(full_prompt)
        response = model.generate_content(prompt + user_input)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def preview_apply_rule():
    # Placeholder for preview & apply functionality
    return "Rule applied successfully!"

# Placeholder function for chat interaction
# This function should be replaced with the actual chat logic
def echo(message, history):
    return message

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""
    
    # Create the interface with the base theme
    with gr.Blocks(theme=gr.themes.Base(), css="""
        /* Hide footer and labels */
        footer {visibility: hidden}
        label[data-testid='block-label'] {visibility: hidden}
    """) as demo:
        with gr.Row():
            # Left panel
            
            with gr.Column(scale=1):
                # Chat Section
                gr.Markdown("# Rule Management Bot")
                gr.ChatInterface(
                    fn=chat_function,
                    chatbot=gr.Chatbot(),
                    textbox=gr.Textbox(
                        placeholder="Message...",
                        scale=7
                    ),
                    undo_btn=None,
                    clear_btn=None,
                    retry_btn=None,
                )
                
            # Right panel
            with gr.Column(scale=1):
                # Existing Rules Header
                gr.Markdown("# Existing Rules")
                
                # Existing Rules Section - Using Group instead of deprecated Box
                with gr.Group(elem_classes=["rules-section"]):
                    gr.Markdown("Rule 1")
                    gr.Markdown("Rule 2")
                    gr.Markdown("Rule 3")

                # Rule Summary Header
                gr.Markdown("# Rule Summary")
                
                # Rule Content - Using Group instead of deprecated Box
                with gr.Group(elem_classes=["rules-section"]):
                    gr.Markdown("## Part-Time Employee Hours")
                    
                    gr.Markdown("### Before")
                    gr.Markdown("Maximum hours per week: 30")
                    
                    gr.Markdown("### After")
                    gr.Markdown("Maximum hours per week: 25")
                
                preview_button = gr.Button("Preview & Apply", variant="primary")
        
        # Define interactions
        preview_button.click(preview_apply_rule)
    
    return demo
