import os
import gradio as gr
from google import genai
from google.genai import types
from config.agent_config import AGENT1_PROMPT, AGENT2_PROMPT, DEFAULT_MODEL, GENERATION_CONFIG
import json
import pandas as pd
import numpy as np
from utils.rule_extractor import extract_rules

#initialize initialize_gemini function from rag_utils 
from utils.rag_utils import add_extracted_rules_to_rag, read_documents_from_paths, embed_texts, retrieve, rag_generate, initialize_gemini_client
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
    rag_state_df: pd.DataFrame,
    extracted_rules: list 
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
    #yield status_message, result_df
    # Integrate extracted rules into the RAG knowledge base
    if extracted_rules:
        yield "Integrating extracted rules into the knowledge base...", rag_state_df
        updated_rag_state_df = add_extracted_rules_to_rag(extracted_rules, result_df)
    else:
        updated_rag_state_df = result_df

    yield status_message, updated_rag_state_df


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

def extract_rules_handler(file):
    """
    Handles rule extraction for the uploaded file.
    Args:
        file: The uploaded file object (file-like object from Gradio).
    Returns:
        Tuple[str, list]: Status message and extracted rules.
    """
    if file is None:
        return "No file uploaded.", []
    
    # Handle different types of file objects from Gradio
    try:
        # Check if file is a string (file path) or has a 'name' attribute
        if isinstance(file, str):
            # File is a path string
            file_path = file
            file_type = f".{file_path.split('.')[-1].lower()}"
        elif hasattr(file, 'name'):
            # File object with name attribute (could be NamedString or file-like object)
            file_path = str(file)  # Convert to string path
            # Get file extension from the name attribute if available, otherwise from the path
            if hasattr(file, 'name') and '.' in file.name:
                file_type = f".{file.name.split('.')[-1].lower()}"
            else:
                file_type = f".{file_path.split('.')[-1].lower()}"
        else:
            # Fallback: try to treat as file path
            file_path = str(file)
            file_type = f".{file_path.split('.')[-1].lower()}"
        
        # Read file content based on file type
        if file_type in ['.pdf', '.docx', '.xlsx', '.xls']:
            # For binary files, read as binary and let extract_rules handle the conversion
            with open(file_path, 'rb') as f:
                file_content_bytes = f.read()
            # You might need to handle binary files differently in your extract_rules function
            # For now, we'll pass the file path instead of content for binary files
            file_content = file_path  # Pass file path for binary files
        else:
            # For text files (CSV, TXT, etc.), read as text
            with open(file_path, 'r', encoding='utf-8') as f:
                file_content = f.read()
            
    except Exception as e:
        return f"Error reading file: {e}", []

    # Call the extract_rules function
    result = extract_rules(file_content, file_type)
    if result["success"]:
        return "Rules extracted successfully.", result["rules"]
    else:
        return f"Error: {result['error']}", []

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application with two tabs: Configuration and Chat/Rule Summary."""

    # Shared components
    name_display = gr.Textbox(value="Name will appear here after input.", label="Name")
    summary_display = gr.Textbox(value="Summary will appear here after input.", label="Summary")
    drl_file = gr.File(label="Download DRL")
    gdst_file = gr.File(label="Download GDST")
    status_box = gr.Textbox(label="Status")

    # --- State for RAG DataFrame (must be defined before use) ---
    state_rag_df = gr.State(pd.DataFrame())
    extracted_rules = gr.State([])  # State to store extracted rules

    # # Initialize RuleExtractorAgent
    # rule_extractor_agent = extract_rules()
    
    with gr.Blocks(theme=gr.themes.Base(), css="""
        /* Hide footer and labels */
        footer {visibility: hidden}
        label[data-testid='block-label'] {visibility: hidden}
    """) as demo:
        # --- UI Definition ---
        with gr.Tabs():
            # Tab 1: Rule Extraction
            with gr.Tab("Rule Extraction"):
                with gr.Row():
                    with gr.Column(scale=1):
                        gr.Markdown("### Upload Document for Rule Extraction")
                        document_upload = gr.File(label="Upload Document", file_types=[".pdf", ".csv", ".txt"])
                        extract_button = gr.Button("Extract Rules")
                        extraction_status = gr.Textbox(label="Extraction Status", interactive=False)
                        extracted_rules_display = gr.JSON(label="Extracted Rules")

                        extract_button.click(
                            extract_rules_handler,
                            inputs=[document_upload],
                            outputs=[extraction_status, extracted_rules_display]
                        )

            # Tab 2: Configuration
            with gr.Tab("Configuration"):
                with gr.Row():
                    # Knowledge Base Setup Column
                    with gr.Column(elem_classes=["equal-col", "column-box"], scale=1, min_width=300):
                        gr.Markdown("### Knowledge Base Setup")
                        with gr.Accordion("Upload Documents & Configure RAG", open=True):
                            document_upload = gr.File(
                                label="Upload Documents (.docx, .pdf)",
                                file_count="multiple",
                                file_types=['.docx', '.pdf'],
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

                        def build_knowledge_base_process(uploaded_files, chunk_size, chunk_overlap, rag_state_df, extracted_rules):
                            """Builds the knowledge base and includes extracted rules."""
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
                            updated_rag_state_df = add_extracted_rules_to_rag(extracted_rules, result_df)
                            yield status_message, updated_rag_state_df

                        build_kb_button.click(
                            build_knowledge_base_process,
                            inputs=[document_upload, chunk_size_input, chunk_overlap_input, state_rag_df, extracted_rules],
                            outputs=[rag_status_display, state_rag_df]
                        )

            # Tab 3: Chat & Rule Summary
            with gr.Tab("Chat & Rule Summary"):
                with gr.Row():
                    # Left panel: Chat
                    with gr.Column(scale=1):
                        gr.Markdown("# Rule Management Bot")
                        def chat_and_update(user_input, history, rag_state_df):
                            global rule_response
                            response = chat_with_rag(user_input, history, rag_state_df)
                            name = rule_response.get('name', 'Name will appear here after input.')
                            summary = rule_response.get('summary', 'Summary will appear here after input.')
                            return response, name, summary, rag_state_df
                        chat_interface = gr.ChatInterface(
                            fn=chat_and_update,
                            chatbot=gr.Chatbot(),
                            textbox=gr.Textbox(placeholder="Message...", scale=7),
                            additional_outputs=[name_display, summary_display, state_rag_df],
                            additional_inputs=[state_rag_df],
                        )
                    # Right panel: Rule Summary
                    with gr.Column(scale=1):
                        gr.Markdown("# Rule Summary")
                        name_display.render()
                        summary_display.render()
                        preview_button = gr.Button("Preview & Apply", variant="primary")
                        preview_button.click(preview_apply_rule, outputs=[status_box, drl_file, gdst_file])
                        status_box.render()
                        drl_file.render()
                        gdst_file.render()
        # --- Event Actions (must be inside Blocks context) ---
        build_kb_button.click(
            build_knowledge_base_process,
            inputs=[document_upload, chunk_size_input, chunk_overlap_input, state_rag_df],
            outputs=[rag_status_display, state_rag_df]
        )

        # Ensure chat_interface uses state_rag_df as input and output, so it always gets the latest KB
        def chat_and_update(user_input, history, rag_state_df):
            global rule_response
            response = chat_with_rag(user_input, history, rag_state_df)
            name = rule_response.get('name', 'Name will appear here after input.')
            summary = rule_response.get('summary', 'Summary will appear here after input.')
            return response, name, summary, rag_state_df
        chat_interface.fn = chat_and_update
        chat_interface.additional_inputs = [state_rag_df]
        chat_interface.additional_outputs = [name_display, summary_display, state_rag_df]

        preview_button.click(
            preview_apply_rule,
            outputs=[status_box, drl_file, gdst_file]
        )

        chat_interface.chatbot.change(
            update_rule_summary,
            outputs=[name_display, summary_display]
        )
    return demo

