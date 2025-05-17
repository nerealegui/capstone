import os
import gradio as gr
import json
import re

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

def agent2_generate_drl(agent1_output):
    """
    Generate a DRL file from the Agent 1 output without using RAG
    
    Args:
        agent1_output (dict): The JSON output from Agent 1 with conditions and actions
        
    Returns:
        tuple: (drl_content, rule_name) - The generated DRL content and its rule name
    """
    try:
        # Import here to avoid import errors if not installed
        import google.generativeai as genai
        
        # Convert Agent1 output to format for prompt
        conditions = "\n".join(f"- {cond}" for cond in agent1_output.get("conditions", []))
        actions = "\n".join(f"- {act}" for act in agent1_output.get("actions", []))
        
        # Generate rule name from condition
        cond_keywords = agent1_output.get("conditions", ["GeneratedRule"])
        rule_name = "RuleFor_" + "_".join(cond_keywords[0].split()[:3]).capitalize()
        
        # Prompt for the LLM
        prompt = f"""
You are a Drools rule generation expert.

I need you to convert a business rule into a DRL (Drools Rule Language) file format.

Here is the new rule description you must convert into DRL format:
Rule name: {rule_name}

Conditions:
{conditions}

Actions:
{actions}

Generate the DRL using this format:
rule "RuleName"
when
    <conditions>
then
    <actions>;
end

Be sure to follow the proper Drools syntax. The output should be valid Drools rule language.
"""
        
        # Use the initialized model
        model = initialize_gemini()
        response = model.generate_content(prompt)
        
        # Clean and extract the DRL content
        drl_content = clean_drools_block(response.text)
        
        return drl_content, rule_name
    except Exception as e:
        return f"Error generating DRL file: {str(e)}", None

def agent2_generate_gdst(agent1_output, drl_content):
    """
    Generate a GDST file from the Agent 1 output and DRL content
    
    Args:
        agent1_output (dict): The JSON output from Agent 1 with conditions and actions
        drl_content (str): The generated DRL content
        
    Returns:
        tuple: (gdst_content, rule_name) - The generated GDST content and its rule name
    """
    try:
        # Import here to avoid import errors if not installed
        import google.generativeai as genai
        
        # Extract rule name from DRL content
        match = re.search(r'rule\s+"([^"]+)"', drl_content)
        rule_name = match.group(1) if match else "Generated_Rule"
        
        # Convert Agent1 output to format for prompt
        conditions = "\n".join(f"- {cond}" for cond in agent1_output.get("conditions", []))
        actions = "\n".join(f"- {act}" for act in agent1_output.get("actions", []))
        
        # Prompt for the LLM to generate GDST
        prompt = f"""
You are a Drools expert specializing in Guided Decision Table (GDST) format.

I need you to convert a rule from DRL format to GDST XML format.

Here is the original rule in DRL format:
```
{drl_content}
```

Here are the rule's conditions and actions in plain text:
Conditions:
{conditions}

Actions:
{actions}

Generate a GDST file in XML format for this rule. The file should follow the standard Drools Workbench GDST XML structure.
"""
        
        # Use the initialized model
        model = initialize_gemini()
        response = model.generate_content(prompt)
        
        # Get the raw GDST content
        gdst_content = response.text
        if "```xml" in gdst_content:
            gdst_content = gdst_content.split("```xml")[1].split("```")[0].strip()
        elif "```" in gdst_content:
            gdst_content = gdst_content.split("```")[1].split("```")[0].strip()
            
        return gdst_content, rule_name
    except Exception as e:
        return f"Error generating GDST file: {str(e)}", None

def clean_drools_block(text):
    """
    Clean the response text to extract just the DRL content
    
    Args:
        text (str): The response text containing DRL content 
        
    Returns:
        str: Cleaned DRL content
    """
    # Remove markdown code blocks if present
    if "```drools" in text:
        return text.strip().split("```drools")[1].split("```")[0].strip()
    elif "```drl" in text:
        return text.strip().split("```drl")[1].split("```")[0].strip()
    elif "```" in text:
        return text.strip().split("```")[1].split("```")[0].strip()
    else:
        return text.strip()

def validate_drools_file(drl_content):
    """
    Perform basic validation on the generated DRL file
    
    Args:
        drl_content (str): The DRL content to validate
        
    Returns:
        tuple: (is_valid, error_message) - Whether the file is valid and any error messages
    """
    # Check if the basic structure exists
    required_patterns = [
        (r'rule\s+"[^"]+"', "Missing rule declaration"),
        (r'when', "Missing 'when' clause"),
        (r'then', "Missing 'then' clause"),
        (r'end', "Missing 'end' statement")
    ]
    
    for pattern, error_message in required_patterns:
        if not re.search(pattern, drl_content):
            return False, error_message
    
    # Check for balanced parentheses and brackets
    brackets = {'(': ')', '{': '}', '[': ']'}
    stack = []
    
    for char in drl_content:
        if char in brackets:
            stack.append(char)
        elif char in brackets.values():
            if not stack or char != brackets[stack.pop()]:
                return False, "Unbalanced parentheses or brackets"
    
    if stack:
        return False, "Unbalanced parentheses or brackets"
    
    # Check for semicolons in the "then" section
    then_section = drl_content.split("then")[1].split("end")[0].strip()
    if ";" not in then_section:
        return False, "Missing semicolons in 'then' section"
    
    return True, "DRL file is valid"

def extract_rule_from_chat(history):
    """
    Extract the rule from the chat history
    
    Args:
        history (list): The chat history
        
    Returns:
        dict: The extracted rule as a JSON object, or None if no rule is found
    """
    if not history:
        return None
    
    # Check the last AI message for a JSON structure
    last_ai_message = history[-1][1]
    
    # Look for a JSON structure in the message
    try:
        # Try to find a JSON block in the message
        json_pattern = r'(\{[\s\S]*?\})'
        match = re.search(json_pattern, last_ai_message)
        
        if match:
            json_str = match.group(1)
            # Parse and validate the JSON
            rule_json = json.loads(json_str)
            
            # Check if it has the expected format
            if "conditions" in rule_json and "actions" in rule_json:
                return rule_json
    except json.JSONDecodeError:
        pass
    except Exception:
        pass
    
    return None

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

def preview_apply_rule(history=None):
    """
    Process the rule from the chat and generate DRL and GDST files
    
    Args:
        history (list, optional): The chat history
        
    Returns:
        str: Success or error message
    """
    try:
        if not history:
            return "No chat history available. Please create a rule first."
        
        # Extract rule from chat history
        rule_json = extract_rule_from_chat(history)
        if not rule_json:
            return "No valid rule found in the chat. Please create a rule first."
        
        # Generate DRL file
        drl_content, rule_name = agent2_generate_drl(rule_json)
        if not rule_name:
            return drl_content  # This will be the error message
        
        # Validate DRL file
        is_valid, validation_message = validate_drools_file(drl_content)
        if not is_valid:
            return f"DRL validation failed: {validation_message}"
        
        # Generate GDST file
        gdst_content, _ = agent2_generate_gdst(rule_json, drl_content)
        
        # Return success with the generated files
        return {
            "drl_content": drl_content,
            "gdst_content": gdst_content,
            "rule_name": rule_name,
            "validation_message": validation_message
        }
    except Exception as e:
        return f"Error in preview_apply_rule: {str(e)}"

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
        
        /* Style the file displays */
        .file-display {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            white-space: pre-wrap;
            margin-top: 10px;
        }
        
        /* Success and error messages */
        .success-message {
            color: green;
            font-weight: bold;
        }
        .error-message {
            color: red;
            font-weight: bold;
        }
    """) as demo:
        # Store chat history in state
        chatbot_state = gr.State([])
        
        # Store generated files state
        drl_content_state = gr.State("")
        gdst_content_state = gr.State("")
        rule_name_state = gr.State("")
        
        with gr.Row():
            # Left panel
            with gr.Column(scale=1):
                # Chat Section
                gr.Markdown("# Rule Management Bot")
                chatbot = gr.ChatInterface(
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
                
                # Preview & Apply Button
                preview_button = gr.Button("Preview & Apply", variant="primary")
                
                # File display area (initially hidden)
                with gr.Group(visible=False) as file_display_group:
                    gr.Markdown("## Generated Files")
                    
                    # Status message
                    status_message = gr.Markdown("", elem_classes=["status-message"])
                    
                    # DRL File display
                    gr.Markdown("### DRL File")
                    drl_display = gr.Code(language="java", label="DRL Content")
                    drl_download = gr.Button("Download DRL File", variant="secondary")
                    
                    # GDST File display
                    gr.Markdown("### GDST File")
                    gdst_display = gr.Code(language="xml", label="GDST Content")
                    gdst_download = gr.Button("Download GDST File", variant="secondary")
        
        # Define interactions
        def update_chat_state(history):
            # Keep track of the chat history
            return history
        
        # Function to update the file display area
        def update_file_display(result):
            if isinstance(result, dict):
                # Successful generation
                drl_content = result.get("drl_content", "")
                gdst_content = result.get("gdst_content", "")
                rule_name = result.get("rule_name", "")
                validation_message = result.get("validation_message", "")
                
                # Update states
                return {
                    file_display_group: gr.update(visible=True),
                    status_message: gr.update(value=f"✅ {validation_message}", elem_classes=["success-message"]),
                    drl_display: drl_content,
                    gdst_display: gdst_content,
                    drl_content_state: drl_content,
                    gdst_content_state: gdst_content,
                    rule_name_state: rule_name
                }
            else:
                # Error occurred
                return {
                    file_display_group: gr.update(visible=True),
                    status_message: gr.update(value=f"❌ {result}", elem_classes=["error-message"]),
                    drl_display: "",
                    gdst_display: "",
                    drl_content_state: "",
                    gdst_content_state: "",
                    rule_name_state: ""
                }
        
        # Function to download DRL file
        def download_drl(drl_content, rule_name):
            if not drl_content or not rule_name:
                return None
                
            filename = f"{rule_name}.drl"
            return (drl_content, filename, "text/plain")
            
        # Function to download GDST file
        def download_gdst(gdst_content, rule_name):
            if not gdst_content or not rule_name:
                return None
                
            filename = f"{rule_name}.gdst"
            return (gdst_content, filename, "application/xml")
        
        # Connect the chat interface to state
        chatbot.chatbot.change(update_chat_state, inputs=[chatbot.chatbot], outputs=[chatbot_state])
        
        # Connect the preview button
        preview_button.click(
            fn=preview_apply_rule,
            inputs=[chatbot.chatbot],
            outputs=[
                file_display_group,
                status_message,
                drl_display,
                gdst_display,
                drl_content_state,
                gdst_content_state,
                rule_name_state
            ],
            _js="(history) => {console.log('Processing rule from chat history:', history); return [history];}"
        )
        
        # Connect download buttons
        drl_download.click(
            fn=download_drl,
            inputs=[drl_content_state, rule_name_state],
            outputs=[gr.File()]
        )
        
        gdst_download.click(
            fn=download_gdst,
            inputs=[gdst_content_state, rule_name_state],
            outputs=[gr.File()]
        )
    
    return demo
