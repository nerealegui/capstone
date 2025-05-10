import os
import gradio as gr
import json
import pandas as pd
from typing import Dict, Any
import sys
from pathlib import Path

# Try to import the rag module
try:
    from . import rag
except ImportError:
    # If that fails, try a direct import
    try:
        import rag
    except ImportError:
        # If all else fails, add the current directory to the path and try again
        current_dir = os.path.dirname(os.path.abspath(__file__))
        sys.path.insert(0, current_dir)
        import rag

# Global variables for document dataframes and current rule
agent1_df = pd.DataFrame()
agent2_df = pd.DataFrame()
current_rule_json = None

# Default prompts
AGENT1_PROMPT = """You are an expert in translating restaurant business rules into structured logic. 
Your task is to extract the key logic (conditions and actions) from the user's sentence."""

AGENT2_PROMPT = """You are an expert in translating business rules into Drools syntax.
Your task is to convert the structured JSON representation of a rule into proper Drools rule language (DRL) format."""

# Document paths
DOCUMENTS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "documents")
AGENT1_DOCUMENTS_PATH = os.path.join(DOCUMENTS_PATH, "agent1")
AGENT2_DOCUMENTS_PATH = os.path.join(DOCUMENTS_PATH, "agent2")
DRL_FILES_PATH = os.path.join(DOCUMENTS_PATH, "drl_files")

def initialize_gemini():
    """Initialize the Gemini API with the API key from environment variables."""
    # Import the module here so it's only imported after dependencies are installed
    import google.generativeai as genai
    from google.genai import ClientConfig
    
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("Google API key not found in environment variables. Please check your .env file.")
    
    # Configure the client
    client = genai.Client(
        api_key=api_key,
        client_config=ClientConfig(timeout=120)
    )
    
    return client

def initialize_embeddings():
    """Initialize document embeddings for both agents."""
    global agent1_df, agent2_df
    
    client = initialize_gemini()
    
    print(f"Loading documents from {AGENT1_DOCUMENTS_PATH}")
    agent1_df = rag.create_embeddings_dataframe(AGENT1_DOCUMENTS_PATH, client)
    print(f"Found {len(agent1_df)} chunks for Agent 1")
    
    print(f"Loading documents from {AGENT2_DOCUMENTS_PATH}")
    agent2_df = rag.create_embeddings_dataframe(AGENT2_DOCUMENTS_PATH, client)
    print(f"Found {len(agent2_df)} chunks for Agent 2")

def agent1_process(user_input: str) -> Dict[str, Any]:
    """
    Agent 1: Extract conditions and actions from natural language.
    Uses RAG to provide context from business documents.
    
    Args:
        user_input: Natural language description of the business rule.
        
    Returns:
        JSON representation of the rule.
    """
    client = initialize_gemini()
    
    # Use RAG to process the query
    result = rag.rag_query(
        query=user_input,
        df=agent1_df,
        client=client,
        top_k=3,
        system_prompt=rag.AGENT1_SYSTEM_PROMPT
    )
    
    # Parse the result as JSON
    try:
        return json.loads(result)
    except json.JSONDecodeError:
        # If the result is not valid JSON, extract it from the text
        import re
        json_match = re.search(r'```json\s*(.*?)\s*```', result, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Return a default structure if parsing fails
        return {
            "conditions": [],
            "actions": []
        }

def agent2_process(rule_json: Dict[str, Any]) -> str:
    """
    Agent 2: Generate DRL rules from JSON.
    Uses RAG to provide context from existing DRL files.
    
    Args:
        rule_json: JSON representation of the rule.
        
    Returns:
        DRL rule as text.
    """
    client = initialize_gemini()
    
    # Convert JSON to string for the query
    rule_str = json.dumps(rule_json, indent=2)
    
    # Use RAG to process the query
    result = rag.rag_query(
        query=rule_str,
        df=agent2_df,
        client=client,
        top_k=3,
        system_prompt=rag.AGENT2_SYSTEM_PROMPT
    )
    
    # Clean the result
    clean_result = result.strip()
    if clean_result.startswith("```") and clean_result.endswith("```"):
        clean_result = "\n".join(clean_result.split("\n")[1:-1])
    
    # Save the DRL to file
    file_path = rag.save_drl_to_file(clean_result, DRL_FILES_PATH)
    print(f"DRL file saved at: {file_path}")
    
    return clean_result

def chat_function(user_input, history):
    """Process user input with Agent 1 only for rule extraction and wait for user validation."""
    try:
        # Ensure embeddings are initialized
        if agent1_df.empty or agent2_df.empty:
            initialize_embeddings()
        
        # Process the input with Agent 1 only
        rule_json = agent1_process(user_input)
        
        # Store the extracted rule JSON for later use by Agent 2
        global current_rule_json
        current_rule_json = rule_json
        
        # Return a formatted response for user validation
        response = f"""
I've analyzed your business rule and extracted the following logic:

**Extracted Logic:**
```json
{json.dumps(rule_json, indent=2)}
```

Please validate if this extraction is correct. If it looks good, click the "Preview & Apply" button to generate the Drools rule.
"""
        return response
    except Exception as e:
        import traceback
        return f"Error: {str(e)}\n\n{traceback.format_exc()}"

def preview_apply_rule():
    """Generate and apply the Drools rule once the user has validated the extracted logic."""
    try:
        global current_rule_json
        
        # Check if we have a rule to process
        if not current_rule_json:
            return "Error: No rule has been extracted yet. Please describe a business rule in the chat first."
        
        # Process the result with Agent 2
        drl_rule = agent2_process(current_rule_json)
        
        # Return the generated rule
        return f"""Rule generated successfully:
```
{drl_rule}
```

The rule has been saved to the knowledge base and can now be applied."""
    except Exception as e:
        import traceback
        return f"Error: {str(e)}\n\n{traceback.format_exc()}"

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""
    
    # Initialize document embeddings on startup
    try:
        initialize_embeddings()
    except Exception as e:
        print(f"Warning: Failed to initialize embeddings: {e}")
    
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
                        placeholder="Describe your business rule here...",
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
                    rule_summary = gr.Markdown("No rule extracted yet. Please describe a business rule in the chat.")
                
                preview_button = gr.Button("Preview & Apply", variant="primary")
        
        # Define interactions
        preview_button.click(
            fn=preview_apply_rule,
            outputs=rule_summary
        )
    
    return demo
