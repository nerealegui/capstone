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


def chat_with_rag(user_input: str, history: list, rag_state_df: pd.DataFrame):
    global rule_response
    
    # Defensive: ensure rag_state_df is always a DataFrame
    if rag_state_df is None:
        rag_state_df = pd.DataFrame()
    
    # Check for empty input
    if not user_input or not user_input.strip():
        empty_response = "Please enter a message."
        return empty_response, history, "Name will appear here after input.", "Summary will appear here after input.", {"message": "RAG index is empty."}
    
    # Validate API key without storing unused client variable
    try:
        initialize_gemini_client()
    except ValueError as e:
         error_message = f"API Key Error: {e}"
         print(error_message)
         return error_message, history, "Name will appear here after input.", "Summary will appear here after input.", {"message": "RAG index is empty."}
    
    # Determine if RAG should be used (if rag_state_df is not empty)
    use_rag = not rag_state_df.empty

    if use_rag:
        try:
            llm_response_text = rag_generate(
                query=user_input,
                df=rag_state_df,
                agent_prompt=AGENT1_PROMPT,
                model_name=DEFAULT_MODEL,
                generation_config=GENERATION_CONFIG,
                history=history,
                top_k=3
            )
            try:
                rule_response = json.loads(llm_response_text)
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

    # Extract values for the response
    response_summary = rule_response.get('summary', 'No summary available.')
    
    return response_summary


# New separate function to update the rule summary components
def update_rule_summary():
    """Extract rule information from the global rule_response and return for UI update."""
    global rule_response
    
    try:
        if 'rule_response' in globals() and rule_response:
            name_val = rule_response.get('name', 'Name will appear here after input.')
            summary_val = rule_response.get('summary', 'Summary will appear here after input.')
            return name_val, summary_val
        else:
            return "Name will appear here after input.", "Summary will appear here after input."
    except Exception as e:
        print(f"Error in update_rule_summary: {e}")
        return "Error loading rule data", "Error loading rule data"

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

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""
    state_rag_df = gr.State(pd.DataFrame())

    with gr.Blocks(theme=gr.themes.Base(), css="""
        footer { visibility: hidden; }
        .gradio-container { 
            max-width: 1800px; 
            margin: auto; 
        }
        /* Force columns to be equal width and display in a row */
        .equal-row {
            display: flex !important;
            flex-direction: row !important;
            width: 100%;
            gap: 20px;
        }
        .equal-col {
            flex: 1 !important;
            min-width: 300px !important;
            box-sizing: border-box !important;
        }
        /* Column styling */
        .column-box {
            border: 1px solid #ccc;
            border-radius: 5px;
            height: 100%;
            padding: 15px;
        }
    """) as demo:
        gr.Markdown("# Rule Management Bot with RAG")
        
        
        # Create a single row with three equal columns
        with gr.Row(elem_classes=["equal-row"], equal_height=True):
            # Knowledge Base Setup Column
            with gr.Column(elem_classes=["equal-col", "column-box"], scale=1, min_width=300):
                gr.Markdown("### Knowledge Base Setup")
                with gr.Accordion("Upload Documents & Configure RAG", open=True):
                    document_upload = gr.File(
                        label="Upload Documents (.docx, .pdf)",
                        file_count="multiple",
                        file_types=[".docx", ".pdf"],
                        height=150
                    )
                    chunk_size_input = gr.Number(label="Chunk Size", value=500, precision=0, interactive=True)
                    chunk_overlap_input = gr.Number(label="Chunk Overlap", value=50, precision=0, interactive=True)
                    build_kb_button = gr.Button("Build Knowledge Base", variant="primary")
                    rag_status_display = gr.Textbox(
                        label="Knowledge Base Status", 
                        value="Knowledge base not built yet.", 
                        interactive=False
                    )

            # Chat Interface Column
            with gr.Column(elem_classes=["equal-col", "column-box"], scale=1, min_width=300):
                gr.Markdown("### Chat Interface")
                chat_interface = gr.ChatInterface(
                    fn=chat_with_rag,
                    #chatbot=gr.Chatbot(type="messages"),
                    #textbox=gr.Textbox(
                    #    placeholder="Enter your rule description or question here...",
                    #    container=False,
                    #    lines=2
                    #),
                    type="messages",
                    additional_inputs=[state_rag_df],
                )
            
            
            
            # Rule Summary Column
            with gr.Column(elem_classes=["equal-col", "column-box"], scale=1, min_width=300):
                gr.Markdown("### Rule Summary")
                name = gr.Textbox(value="Name will appear here after input.", label="Name")
                summary = gr.Textbox(value="Summary will appear here after input.", label="Summary", lines=3)
                preview_button = gr.Button("Preview & Apply Rule", variant="primary")
                status_box = gr.Textbox(label="Status")
                drl_file = gr.File(label="Download DRL", visible=True, height="auto")
                gdst_file = gr.File(label="Download GDST", visible=True, height="auto")
        
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

        # Auto-refresh rule summary after each chat message
        chat_interface.chatbot.change(
            update_rule_summary,
            outputs=[name, summary]
        )
    return demo

