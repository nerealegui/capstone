import os
import gradio as gr

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
        model_name="gemini-pro",
        generation_config=generation_config
    )
    
    return model

def chat_function(user_input):
    """Process user input and get response from Gemini API."""
    try:
        model = initialize_gemini()
        response = model.generate_content(user_input)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def preview_apply_rule():
    # Placeholder for preview & apply functionality
    return "Rule applied successfully!"

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""
    # Define the custom CSS to match the UI in the image
    custom_css = """
    body, .gradio-container {
        background-color: #0F1623 !important;
        color: white !important;
    }
    
    .dark-blue-box {
        background-color: #1F2B47 !important;
        border-radius: 8px !important;
        padding: 10px !important;
        margin: 10px 0 !important;
        color: white !important;
    }
    
    .dark-red-box {
        background-color: #342431 !important;
        border-radius: 8px !important;
        padding: 10px !important;
        margin: 10px 0 !important;
        color: white !important;
    }
    
    .gr-button.gr-button-lg {
        background-color: #4056F4 !important;
        color: white !important;
        border: none !important;
    }
    
    .gr-button.gr-button-lg:hover {
        background-color: #3045E3 !important;
    }
    
    .gr-input, textarea, input {
        background-color: #121B2B !important;
        border: 1px solid #1F2B47 !important;
        color: white !important;
    }
    
    .gr-panel {
        background-color: #0F1623 !important;
        border-color: #1F2B47 !important;
    }
    
    .gr-box {
        background-color: #121B2B !important;
        border-color: #1F2B47 !important;
    }
    
    label {
        color: white !important;
    }
    
    h1, h2, h3, h4, p {
        color: white !important;
    }
    """
    
    # Create the interface with the custom theme
    with gr.Blocks(css=custom_css, theme=gr.themes.Base()) as demo:
        with gr.Row():
            # Left panel - Gemini Chat
            with gr.Column(scale=1):
                gr.Markdown("# Gemini Chat")
                
                user_input = gr.Textbox(
                    label="Your Message",
                    placeholder="For part-time employees, change the maximum hours per week from 30 to 25"
                )
                
                chat_output = gr.Textbox(
                    label="Chat Response",
                    value="I'm ready to help you with your rules and questions.",
                    interactive=False
                )
                
                send_button = gr.Button("Send", variant="primary", size="lg")
                
                gr.Markdown("## Rule Resumes")
                rule_items = gr.Textbox(value="Discount Rule", interactive=False)
                
            # Right panel - Rule Management
            with gr.Column(scale=1):
                gr.Markdown("# Rule Management")
                
                gr.Markdown("## Rule Summary")
                
                with gr.Row():
                    with gr.Column():
                        gr.Markdown("### Part-Time Employee Hours")
                        
                        with gr.Column(elem_classes=["dark-blue-box"]):
                            gr.Markdown("#### Before")
                            gr.Markdown("Maximum hours per week: 30")
                        
                        with gr.Column(elem_classes=["dark-red-box"]):
                            gr.Markdown("#### After")
                            gr.Markdown("Maximum hours per week: 25")
                
                preview_button = gr.Button("Preview & Apply", variant="primary", size="lg")
        
        # Define interactions
        send_button.click(chat_function, inputs=user_input, outputs=chat_output)
        preview_button.click(preview_apply_rule)
    
    return demo
