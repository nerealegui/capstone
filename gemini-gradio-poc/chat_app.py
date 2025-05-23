import os
import gradio as gr
from google import genai
from google.genai import types
from agent_config import AGENT1_PROMPT, AGENT2_PROMPT, DEFAULT_MODEL, GENERATION_CONFIG
import json
import pandas as pd
import numpy as np

#initialize initialize_gemini function from rag_utils 
from rag_utils import read_documents_from_paths, chunk_text, embed_texts, retrieve, rag_generate, initialize_gemini_client

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
def build_knowledge_base_process(uploaded_files, chunk_size, chunk_overlap, rag_state_df):
    """
    Processes uploaded documents, creates chunks, embeds them,
    and yields status updates before returning the final state and status message.
    """
    status_message = "Processing..."
    yield status_message, rag_state_df

    if not uploaded_files:
        yield "Please upload documents first.", pd.DataFrame()
        return

    if chunk_size is None or chunk_size <= 0 or chunk_overlap is None or chunk_overlap < 0 or chunk_overlap >= chunk_size:
        yield "Invalid chunk size or overlap. Chunk size > 0, overlap >= 0, overlap < chunk size.", rag_state_df
        return

    print(f"Building knowledge base with chunk_size={chunk_size}, chunk_overlap={chunk_overlap}...")
    yield "Reading documents...", rag_state_df

    file_paths = [f.name for f in uploaded_files if f and hasattr(f, 'name') and f.name]

    if not file_paths:
         yield "No valid file paths from upload.", pd.DataFrame()
         return

    raw_docs = read_documents_from_paths(file_paths)

    if not raw_docs:
         yield "No readable documents found.", pd.DataFrame()
         return

    yield "Chunking text...", rag_state_df
    all_chunks = []
    all_filenames = []
    for doc in raw_docs:
        chunks = chunk_text(doc['text'], int(chunk_size), int(chunk_overlap))
        all_chunks.extend(chunks)
        all_filenames.extend([doc['filename']] * len(chunks))

    if not all_chunks:
         yield "No text chunks created from documents.", pd.DataFrame()
         return

    yield f"Embedding {len(all_chunks)} chunks...", rag_state_df
    print(f"Attempting to embed {len(all_chunks)} chunks...")
    try:
        chunk_embedding_pairs = embed_texts(all_chunks, task_type="RETRIEVAL_DOCUMENT")
        successful_pairs = [(chunk, emb) for chunk, emb in chunk_embedding_pairs if emb is not None]
        if not successful_pairs:
            yield "Embedding failed for all chunks.", pd.DataFrame()
            return
        successful_chunks = [pair[0] for pair in successful_pairs]
        successful_embeddings = [pair[1] for pair in successful_pairs]
        original_chunk_data = list(zip(all_filenames, all_chunks))
        filtered_filenames = []
        filtered_chunks_aligned = []
        chunk_original_indices = {id(chunk): idx for idx, chunk in enumerate(all_chunks)}
        for chunk, emb in chunk_embedding_pairs:
            if emb is not None:
                original_idx = chunk_original_indices.get(id(chunk))
                if original_idx is None:
                     try:
                         original_idx = all_chunks.index(chunk)
                     except ValueError:
                          original_idx = None
                if original_idx is not None and original_idx < len(all_filenames):
                    filtered_filenames.append(all_filenames[original_idx])
                    filtered_chunks_aligned.append(chunk)
                else:
                    print(f"Warning: Could not find original filename for chunk. Appending 'Unknown File'. Chunk start: {chunk[:50]}...")
                    filtered_filenames.append("Unknown File")
                    filtered_chunks_aligned.append(chunk)
        if len(filtered_chunks_aligned) != len(successful_embeddings):
             print("Error: Mismatch between aligned chunks and successful embeddings count after filtering!")
             yield "Internal error aligning chunks/embeddings.", pd.DataFrame()
             return
    except Exception as e:
        status_message = f"An error occurred during embedding: {e}"
        print(status_message)
        yield status_message, pd.DataFrame()
        return
    status_message = "Creating knowledge base index..."
    yield status_message, rag_state_df
    try:
        rag_index_df_new = pd.DataFrame({
            'filename': filtered_filenames,
            'chunk': filtered_chunks_aligned,
            'embedding': successful_embeddings
        })
        status_message = f"✅ Knowledge base built successfully with {len(rag_index_df_new)} chunks."
        print(status_message)
        yield status_message, rag_index_df_new
    except Exception as e:
        status_message = f"An error occurred creating the index: {e}"
        print(status_message)
        yield status_message, pd.DataFrame()


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
         return error_message, history, rag_state_df, "", error_message, {}

    # Determine if RAG should be used (if rag_index_df from state is not empty)
    use_rag = not rag_state_df.empty

    if use_rag:
        print("Using RAG for response generation.")
        try:
            # Call the rag_generate function from rag_utils
            # rag_generate handles building the 'contents' list with history and RAG context
            # It returns a JSON string or an error JSON string
            llm_response_text = rag_generate(
                query=user_input,
                df=rag_state_df, # Pass the RAG DataFrame from state
                agent_prompt=AGENT1_PROMPT, # Use the Agent 1 prompt for RAG
                model_name=DEFAULT_MODEL,
                generation_config=GENERATION_CONFIG,
                history=history, # Pass Gradio chat history (list of tuples) - rag_generate uses this now
                top_k=3 # Or make this configurable, maybe a state variable
            )
            # print(f"Raw LLM Response Text:\n{llm_response_text}") # Debugging

            # Attempt to parse the response as JSON
            try:
                rule_response = json.loads(llm_response_text)
                # Basic validation for expected keys if necessary
                if not isinstance(rule_response, dict):
                     # Or check for specific keys like 'name', 'summary', 'logic'
                     raise json.JSONDecodeError("Response is not a JSON object.", llm_response_text, 0)

            except (json.JSONDecodeError, Exception) as e:
                print(f"Warning: Could not parse LLM response as JSON. Error: {e}")
                print(f"Raw LLM Response received:\n{llm_response_text[:300]}...") # Print start of response
                # Handle non-JSON or invalid JSON response
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
        # Fallback when RAG index is empty
        rule_response = {
            "name": "Knowledge Base Empty",
            "summary": "Knowledge base not built. Please upload documents and click 'Build Knowledge Base' first.",
            "logic": {"message": "RAG index is empty."}
        }

    # Prepare Outputs for Gradio UI 
    # The Chatbot component expects the model's response string.
    # The additional outputs update the side displays.
    # The state needs to be returned to maintain it across turns.

    chatbot_response_string = rule_response.get('summary', 'No summary available.') # Use summary for main chat display

    name_val = rule_response.get('name', 'Name will appear here after input.')
    summary_val = rule_response.get('summary', 'Summary will appear here after input.')
    logic_val = rule_response.get('logic', {"message": "Logic will appear here..."}) # Use initial message

    # Return the tuple of outputs expected by Gradio's ChatInterface fn:
    # (chatbot response string, updated chat history, updated RAG state, additional outputs...)
    # ChatInterface handles updating its own history component internally,
    # so we just need to return the model's response string for the current turn,
    # the (potentially updated) state, and the additional outputs.
    # Note: ChatInterface *expects* the history list as the second return item.
    updated_history = history + [(user_input, chatbot_response_string)]
    return  chatbot_response_string, name_val, summary_val, logic_val

    #     contents = []
    #     # Build contents from history
    #     contents = []
    #     if history:
    #         for user_msg, model_response in history:
    #             # Append user's previous message
    #             contents.append(
    #                 types.Content(
    #                     role="user",
    #                     parts=[types.Part.from_text(text=user_msg)]
    #                 )
    #             )
    #             # Append model's previous response
    #             contents.append(
    #                 types.Content(
    #                     role="model",
    #                     parts=[types.Part.from_text(text=model_response)]
    #                 )
    #             )

    #     # Append the current user input with prompt
    #     contents.append(
    #         types.Content(
    #             role="user",
    #             parts=[types.Part.from_text(text=AGENT1_PROMPT + user_input)]
    #         )
    #     )

    #     generate_content_config = types.GenerateContentConfig(
    #         response_mime_type=GENERATION_CONFIG["response_mime_type"]
    #     )

    #     response = client.models.generate_content(
    #         model=DEFAULT_MODEL,
    #         contents=contents,
    #         config=generate_content_config,
    #     )

    #     print("Response received from Gemini API.")

    #     # Parse the response
    #     parsed_response = json.loads(response.text)

    #     # Validate the response type
    #     if isinstance(parsed_response, dict):
    #         rule_response = parsed_response
    #     else:
    #         rule_response = {
    #             "name": "Unexpected response format",
    #             "summary": "The API returned an unexpected format.",
    #             "logic": {"message": "No logic available."}
    #         }

    #     summary = rule_response.get("summary", "No summary available.")
    #     return summary

    # except Exception as e:
    #     error_message = f"Error: {str(e)}"
    #     rule_response = {
    #         "name": "General Error",
    #         "summary": error_message,
    #         "logic": {"message": "No logic available."}
    #     }
    #     return error_message

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
    client = initialize_gemini_client()  # Use the function from rag_utils
    
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

        with gr.Row():
            # Column 1: Chat Interface
            with gr.Column(scale=1, elem_classes="left-column"):
                gr.Markdown("### Chat Interface")
                chat_interface = gr.ChatInterface(
                    fn=chat_with_rag,
                    chatbot=gr.Chatbot(height=500, show_copy_button=True, type="messages"),
                    textbox=gr.Textbox(
                        placeholder="Enter your rule description or question here...",
                        scale=7
                    ),
                    type="messages"
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

        # Connect outputs to the chat interface (no additional_inputs, use state)
        chat_interface.additional_outputs = [name, summary, logic]
        chat_interface.state = state_rag_df

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

