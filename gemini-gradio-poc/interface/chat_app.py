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
from utils.rule_extractor import extract_rules_from_csv, validate_rule_conflicts, save_extracted_rules

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
        yield "Please upload documents first.", rag_state_df if rag_state_df is not None else pd.DataFrame()
        return
    if chunk_size is None or chunk_size <= 0 or chunk_overlap is None or chunk_overlap < 0 or chunk_overlap >= chunk_size:
        yield "Invalid chunk size or overlap. Chunk size > 0, overlap >= 0, overlap < chunk size.", rag_state_df
        return
    file_paths = [f.name for f in uploaded_files if f and hasattr(f, 'name') and f.name]
    if not file_paths:
        yield "No valid file paths from upload.", rag_state_df if rag_state_df is not None else pd.DataFrame()
        return
    yield "Reading documents...", rag_state_df
    yield "Chunking text...", rag_state_df
    yield f"Embedding chunks...", rag_state_df
    # Pass the existing KB DataFrame for merging
    status_message, result_df = core_build_knowledge_base(file_paths, chunk_size, chunk_overlap, existing_kb_df=rag_state_df)
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

def extract_rules_from_uploaded_csv(csv_file):
    """
    Process uploaded CSV file to extract business rules.
    
    Args:
        csv_file: Gradio file upload object
        
    Returns:
        Tuple[str, str]: Status message and extracted rules JSON as string
    """
    if not csv_file:
        return "Please upload a CSV file first.", ""
    
    try:
        # Extract rules from CSV
        rules = extract_rules_from_csv(csv_file.name)
        
        if not rules:
            return "No rules found in the CSV file.", ""
        
        # Save extracted rules
        output_path = "extracted_rules.json"
        success = save_extracted_rules(rules, output_path)
        
        if success:
            rules_json = json.dumps(rules, indent=2)
            return f"Successfully extracted {len(rules)} rules from CSV.", rules_json
        else:
            return "Error saving extracted rules.", ""
            
    except Exception as e:
        return f"Error processing CSV file: {str(e)}", ""

def validate_new_rule(rule_json_str: str):
    """
    Validate a new rule against existing rules.
    
    Args:
        rule_json_str (str): JSON string of the new rule
        
    Returns:
        str: Validation results
    """
    if not rule_json_str.strip():
        return "Please provide a rule in JSON format."
    
    try:
        new_rule = json.loads(rule_json_str)
        
        # Load existing rules (from sample data for now)
        existing_rules = []
        try:
            with open("data/sample_rules.json", 'r') as f:
                existing_rules = json.load(f)
        except FileNotFoundError:
            pass
        
        # Check for conflicts
        conflicts = validate_rule_conflicts(new_rule, existing_rules)
        
        if conflicts:
            conflict_messages = []
            for conflict in conflicts:
                conflict_messages.append(f"⚠️ {conflict['type']}: {conflict['message']}")
            return "Validation Issues Found:\n" + "\n".join(conflict_messages)
        else:
            return "✅ Rule validation passed. No conflicts detected."
            
    except json.JSONDecodeError as e:
        return f"❌ Invalid JSON format: {str(e)}"
    except Exception as e:
        return f"❌ Validation error: {str(e)}"

def add_rules_to_knowledge_base(rules_json_str: str, rag_state_df: pd.DataFrame):
    """
    Add extracted rules to the RAG knowledge base.
    
    Args:
        rules_json_str (str): JSON string of extracted rules (must be a list of dicts, not a list of lists)
        rag_state_df (pd.DataFrame): Current RAG state
        
    Returns:
        Tuple[str, pd.DataFrame]: Status message and updated RAG DataFrame
    """
    if not rules_json_str.strip():
        return "No rules to add to knowledge base.", rag_state_df
    
    try:
        rules = json.loads(rules_json_str)
        # Defensive: if rules is a list of lists (from DataFrame), error out
        if rules and isinstance(rules, list) and isinstance(rules[0], list):
            return ("❌ Error: Please use the extracted rules JSON, not the table, for KB integration.", rag_state_df)
        # Convert rules to text for RAG indexing
        rule_texts = []
        for rule in rules:
            rule_text = f"""
Rule: {rule.get('name', 'Unknown')}
Category: {rule.get('category', 'Unknown')}
Description: {rule.get('description', 'No description')}
Summary: {rule.get('summary', 'No summary')}
Priority: {rule.get('priority', 'Medium')}
Active: {rule.get('active', True)}
"""
            rule_texts.append(rule_text)
        temp_file = "temp_rules.txt"
        with open(temp_file, 'w') as f:
            f.write("\n".join(rule_texts))
        status_message, result_df = core_build_knowledge_base([temp_file], 300, 50)
        try:
            os.remove(temp_file)
        except:
            pass
        return f"Successfully added {len(rules)} rules to knowledge base. {status_message}", result_df
    except json.JSONDecodeError as e:
        return f"Invalid JSON format: {str(e)}", rag_state_df
    except Exception as e:
        return f"Error adding rules to knowledge base: {str(e)}", rag_state_df

def preview_apply_rule():
    """
    Preview and apply the current rule by validating against existing rules, then generating DRL and GDST files if no conflicts.
    Returns:
        Tuple[str, str, str]: Status message, DRL file path, GDST file path
    """
    global rule_response
    try:
        if 'rule_response' not in globals() or not rule_response:
            return "No rule to apply. Please interact with the chat first.", None, None

        # Validate rule against existing rules
        new_rule = rule_response
        existing_rules = []
        try:
            with open("data/sample_rules.json", 'r') as f:
                existing_rules = json.load(f)
        except FileNotFoundError:
            pass
        conflicts = validate_rule_conflicts(new_rule, existing_rules)
        if conflicts:
            conflict_messages = []
            for conflict in conflicts:
                conflict_messages.append(f"⚠️ {conflict['type']}: {conflict['message']}")
            return ("Validation Issues Found:\n" + "\n".join(conflict_messages), None, None)

        # If no conflicts, generate DRL and GDST
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
    """Create and return the Gradio interface for the Gemini Chat Application with two tabs: Configuration and Chat/Rule Summary."""

    # Shared components
    name_display = gr.Textbox(value="Name will appear here after input.", label="Name")
    summary_display = gr.Textbox(value="Summary will appear here after input.", label="Summary")
    drl_file = gr.File(label="Download DRL")
    gdst_file = gr.File(label="Download GDST")
    status_box = gr.Textbox(label="Status")

    # --- State for RAG DataFrame (must be defined before use) ---
    state_rag_df = gr.State(pd.DataFrame())

    with gr.Blocks(theme=gr.themes.Base(), css="""
        /* Hide footer and labels */
        footer {visibility: hidden}
        label[data-testid='block-label'] {visibility: hidden}
    """) as demo:
        # --- UI Definition ---
        with gr.Tabs():
            # Tab 1: Configuration
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
                        
                        gr.Markdown("### Business Rule Upload & Extraction")
                        with gr.Accordion("Upload Business Rules CSV", open=True):
                            csv_upload = gr.File(
                                label="Upload Business Rules CSV",
                                file_types=['.csv'],
                                height=100
                            )
                            extract_button = gr.Button("Extract Rules from CSV", variant="primary")
                            extraction_status = gr.Textbox(
                                label="Extraction Status",
                                value="Upload a CSV file and click 'Extract Rules' to begin.",
                                interactive=False
                            )
                    
                    # Agent Config Variables Column
                    with gr.Column(scale=1):
                        gr.Markdown("# Agent Configuration")
                        agent1_prompt_box = gr.Textbox(value=AGENT1_PROMPT, label="Agent 1 Prompt", lines=8)
                        agent2_prompt_box = gr.Textbox(value=AGENT2_PROMPT, label="Agent 2 Prompt", lines=4)
                        default_model_box = gr.Textbox(value=DEFAULT_MODEL, label="Default Model")
                        generation_config_box = gr.Textbox(value=json.dumps(GENERATION_CONFIG, indent=2), label="Generation Config (JSON)", lines=6)
                        # Optionally, add a save/apply button here to update config at runtime
                        # gr.Button("Save Config", variant="primary")

            # Tab 2: Business Rules Management
            with gr.Tab("Business Rules"):
                with gr.Row():
                    # Left panel: Extracted Rules & RAG Integration
                    with gr.Column(scale=1):
                        gr.Markdown("### Extracted Rules")
                        # Show extracted rules as a list (name, description)
                        extracted_rules_list = gr.Dataframe(
                            headers=["Name", "Description"],
                            datatype=["str", "str"],
                            label="Extracted Rules List",
                            interactive=False,
                            visible=True,
                            row_count=5,
                            col_count=2
                        )
                        # Hidden textbox to store the JSON for KB integration
                        extracted_rules_display = gr.Textbox(
                            label="Extracted Rules (JSON)",
                            value="Extracted rules will appear here...",
                            lines=15,
                            interactive=False,
                            visible=False
                        )
                        add_to_kb_button = gr.Button("Add Rules to Knowledge Base", variant="primary")
                        kb_integration_status = gr.Textbox(
                            label="Knowledge Base Integration Status",
                            interactive=False
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

        # Business Rules tab event handlers
        def extract_rules_and_list(csv_file):
            status, rules_json = extract_rules_from_uploaded_csv(csv_file)
            # Always ensure rules_json is a valid JSON string (empty list if no rules)
            if not rules_json or rules_json.strip() == '':
                rules_json = '[]'
            try:
                rules = json.loads(rules_json)
                # Flatten if rules is a list of lists
                flat_rules = []
                for r in rules:
                    if isinstance(r, list):
                        flat_rules.extend(r)
                    else:
                        flat_rules.append(r)
                rules_list = [[r.get('name', ''), r.get('description', '')] for r in flat_rules]
                rules_json = json.dumps(flat_rules, indent=2)
            except Exception as e:
                print(f"[DEBUG] Error parsing rules_json: {e}, rules_json: {rules_json}")
                rules_list = []
                rules_json = '[]'
            # Use gr.update to force refresh of the DataFrame UI
            return (
                status,
                rules_json,
                gr.update(value=rules_list, visible=True)
            )
        # The extracted rules table will always be refreshed after extraction (success or fail)
        extract_button.click(
            extract_rules_and_list,
            inputs=[csv_upload],
            outputs=[extraction_status, extracted_rules_display, extracted_rules_list]
        )
        # IMPORTANT: Only pass the JSON textbox as input to add_rules_to_knowledge_base, never the table
        add_to_kb_button.click(
            add_rules_to_knowledge_base,
            inputs=[extracted_rules_display, state_rag_df],
            outputs=[kb_integration_status, state_rag_df]
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

