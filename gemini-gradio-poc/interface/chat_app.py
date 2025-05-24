import os
import gradio as gr
from google import genai
from google.genai import types
from config.agent_config import AGENT1_PROMPT, AGENT2_PROMPT, DEFAULT_MODEL, GENERATION_CONFIG
import json
import pandas as pd
import numpy as np

#initialize initialize_gemini function from rag_utils 
from utils.rag_utils import read_documents_from_paths, embed_texts, retrieve, rag_generate, initialize_gemini_client
from utils.kb_utils import core_build_knowledge_base
from utils.rule_utils import json_to_drl_gdst, verify_drools_execution

# Commented out initialize_gemini function because it will live in rag_utils.py
# def initialize_gemini():
#     api_key = os.environ.get('GOOGLE_API_KEY')
#     if not api_key:
#         raise ValueError("Google API key not found in environment variables. Please check your .env file.")

#     client = genai.Client(
#         api_key=api_key
#     )
#     return client

# New function to build_knowledge_base_process, which calls functions in rag_utils.
def build_knowledge_base_process(
    uploaded_files: list, 
    chunk_size: int, 
    chunk_overlap: int, 
    rag_state_df: pd.DataFrame
):
    """
    Gradio generator for building the knowledge base. Handles UI status updates and delegates core logic to kb_utils.core_build_knowledge_base.
    Args:
        uploaded_files (list): List of uploaded file-like objects (must have .name attribute).
        chunk_size (int): Size of each text chunk.
        chunk_overlap (int): Overlap between chunks.
        rag_state_df (pd.DataFrame): Existing RAG state DataFrame.
    Yields:
        Tuple[str, pd.DataFrame]: Status message and updated RAG DataFrame.
    """
    # --- Gradio generator logic ---
    yield "Processing...", rag_state_df
    if not uploaded_files:
        yield "Please upload documents first.", pd.DataFrame()
        return
    if chunk_size is None or chunk_size <= 0 or chunk_overlap is None or chunk_overlap < 0 or chunk_overlap >= chunk_size:
        yield "Invalid chunk size or overlap. Chunk size > 0, overlap >= 0, overlap < chunk size.", rag_state_df
        return
    file_paths = [f.name for f in uploaded_files if f and hasattr(f, 'name') and f.name]
    if not file_paths:
        yield "No valid file paths from upload.", pd.DataFrame()
        return
    yield "Reading documents...", rag_state_df
    yield "Chunking text...", rag_state_df
    yield f"Embedding chunks...", rag_state_df
    status_message, result_df = core_build_knowledge_base(file_paths, chunk_size, chunk_overlap)
    yield status_message, result_df


def chat_with_rag(user_input: str, history: list, rag_state_df: pd.DataFrame) -> tuple:
    global rule_response
    # Defensive: ensure rag_state_df is always a DataFrame
    if rag_state_df is None:
        rag_state_df = pd.DataFrame()
    try:
        client = initialize_gemini_client()
    except ValueError as e:
         error_message = f"API Key Error: {e}"
         print(error_message)
         # Return error for chatbot and empty values for displays, return original state
         # ChatInterface fn returns (response, history, state, additional_outputs...)
         return error_message, history, "Name will appear here after input.", "Summary will appear here after input.", {"message": "RAG index is empty."}
    
    # Determine if RAG should be used (if rag_index_df from state is not empty)
    use_rag = not rag_state_df.empty

    if use_rag:
        print("Using RAG for response generation.")
        try:
            llm_response_text = rag_generate(
                query=user_input,
                df=rag_state_df, # Pass the RAG DataFrame from state
                agent_prompt=AGENT1_PROMPT, # Use the Agent 1 prompt for RAG
                model_name=DEFAULT_MODEL,
                generation_config=GENERATION_CONFIG,
                history=history, # Pass Gradio chat history (list of tuples) - rag_generate uses this now
                top_k=3 # Or make this configurable, maybe a state variable
            )
            # DEBUG: After parsing llm_response_text
            print("LLM raw response:", llm_response_text)
            try:
                rule_response = json.loads(llm_response_text)
                # DEBUG: After parsing rule_response
                print("Parsed rule_response:", rule_response)
                if not isinstance(rule_response, dict):
                     raise json.JSONDecodeError("Response is not a JSON object.", llm_response_text, 0)
            except (json.JSONDecodeError, Exception) as e:
                print(f"Warning: Could not parse LLM response as JSON. Error: {e}")
                print(f"Raw LLM Response received:\n{llm_response_text[:300]}...")
                rule_response = {
                    "name": "LLM Response Parse Error",
                    "summary": f"The AI returned a response, but it wasn't valid JSON. Raw response start: {llm_response_text[:150]}...",
                    "logic": {"message": "Response was not in expected JSON format."}
                }
        except Exception as e:
            print(f"An error occurred during RAG generation: {e}")
            rule_response = {
                "name": "RAG Generation Error",
                "summary": f"An error occurred during RAG response generation: {str(e)}",
                "logic": {"message": "RAG failed."}
            }
    else:
        print("Knowledge base is empty. RAG is not active.")
        rule_response = {
            "name": "Knowledge Base Empty",
            "summary": "Knowledge base not built. Please upload documents and click 'Build Knowledge Base' first.",
            "logic": {"message": "RAG index is empty."}
        }

    chatbot_response_string = rule_response.get('summary', 'No summary available.')
    name_val = rule_response.get('name', 'Name will appear here after input.')
    summary_val = rule_response.get('summary', 'Summary will appear here after input.')
    logic_val = rule_response.get('logic', {"message": "Logic will appear here..."})

    updated_history = history + [(user_input, chatbot_response_string)]

    # Debug; Before returning
    print("Returning to Gradio:")
    print("  name_val:", name_val)
    print("  summary_val:", summary_val)
    print("  logic_val:", logic_val)
    # Return outputs in the order expected by Gradio ChatInterface:
    # (response, history, name, summary, logic, state)
    return chatbot_response_string, updated_history, name_val, summary_val, logic_val, rag_state_df

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

# Placeholder function for chat interaction
def echo(message, history):
    return message

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""
    state_rag_df = gr.State(pd.DataFrame())

    with gr.Blocks(theme=gr.themes.Base(), css="""
        footer { visibility: hidden; }
        .gradio-container { max-width: 1400px; margin: auto; }
        .gradio-column { flex: 1; min-width: 300px; }
        .rag-config { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .summary-panel { border: 1px solid #ccc; padding: 15px; border-radius: 5px; height: 100%; display: flex; flex-direction: column;}
        .summary-panel > :last-child { margin-top: auto; }
        .left-column { width: 33%; }
        .middle-column { width: 33%; }
        .right-column { width: 33%; }
    """) as demo:
        gr.Markdown("# Rule Management Bot with RAG")

        # --- Define outputs for ChatInterface (move these above ChatInterface creation) ---
        with gr.Row():

            # Column 1: Chat Interface
            with gr.Column(scale=1, elem_classes="left-column"):
                gr.Markdown("### Chat Interface")
                name_placeholder = gr.Textbox(visible=False)
                summary_placeholder = gr.Textbox(visible=False)
                logic_placeholder = gr.Textbox(visible=False)
                chat_interface = gr.ChatInterface(
                    fn=chat_with_rag,
                    chatbot=gr.Chatbot(height=500, show_copy_button=True, type="messages"),
                    textbox=gr.Textbox(
                        placeholder="Enter your rule description or question here...",
                        scale=7
                    ),
                    type="messages",
                    additional_inputs=[state_rag_df],
                    
                )

            # Column 2: Knowledge Base Setup
            with gr.Column(scale=1, elem_classes="middle-column"):
                gr.Markdown("### Knowledge Base Setup")
                with gr.Accordion("Upload Documents & Configure RAG", open=True, elem_classes="rag-config"):
                    document_upload = gr.File(
                        label="Upload Documents (.docx, .pdf)",
                        file_count="multiple",
                        file_types=[".docx", ".pdf"]
                    )
                    chunk_size_input = gr.Number(label="Chunk Size", value=500, precision=0, interactive=True)
                    chunk_overlap_input = gr.Number(label="Chunk Overlap", value=50, precision=0, interactive=True)
                    build_kb_button = gr.Button("Build Knowledge Base", variant="primary")
                    rag_status_display = gr.Textbox(
                        label="Knowledge Base Status", 
                        value="Knowledge base not built yet.", 
                        interactive=False
                    )

            # Column 3: Rule Summary
            with gr.Column(scale=1, elem_classes="right-column summary-panel"):
                gr.Markdown("### Rule Summary")
                name = gr.Textbox(value="Name will appear here after input.", label="Name")
                summary = gr.Textbox(value="Summary will appear here after input.", label="Summary")
                logic = gr.Textbox(value="Logic will appear here after input.", label="Logic")
                preview_button = gr.Button("Preview & Apply Rule", variant="primary")
                status_box = gr.Textbox(label="Status")
                drl_file = gr.File(label="Download DRL")
                gdst_file = gr.File(label="Download GDST")

        # Now that name, summary, logic are defined, set them as additional_outputs
        chat_interface.additional_outputs = [name, summary, logic, state_rag_df]
        
        #DEBUG
        print("Gradio additional_outputs mapping:", chat_interface.additional_outputs)
        # --- Event Actions ---
        build_kb_button.click(
            build_knowledge_base_process,
            inputs=[document_upload, chunk_size_input, chunk_overlap_input, state_rag_df],
            outputs=[rag_status_display, state_rag_df]
        )

        preview_button.click(
            preview_apply_rule,
            outputs=[status_box, drl_file, gdst_file]
        )

    return demo

# This file is imported by run_gradio_ui.py


# def agent1_process(user_input: str) -> dict:
#     """
#     Agent 1: Extract conditions and actions from natural language.
#     Uses RAG to provide context from business documents.
    
#     Args:
#         user_input: Natural language description of the business rule.
        
#     Returns:
#         JSON representation of the rule.
#     """
#     # Implement the logic to extract conditions and actions from user_input
#     # This is a placeholder for the actual implementation
    

#     conditions = extract_conditions(user_input)
#     actions = extract_actions(user_input)
#     return {
#         "conditions": conditions,
#         "actions": actions
#     }

