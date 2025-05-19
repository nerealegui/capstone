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
def build_knowledge_base_process(
    rag_state_df: pd.DataFrame,
    uploaded_files: list,
    chunk_size: int | None,
    chunk_overlap: int | None
) -> tuple:
    """
    Processes uploaded documents, creates chunks, embeds them,
    and yields status updates before returning the final state and status message.
    """
    yield rag_state_df, "Processing..."

    if not uploaded_files:
        yield pd.DataFrame(), "Please upload documents first."
        return

    if chunk_size is None or chunk_size <= 0 or chunk_overlap is None or chunk_overlap < 0 or chunk_overlap >= chunk_size:
        yield rag_state_df, "Invalid chunk size or overlap. Chunk size > 0, overlap >= 0, overlap < chunk size."
        return

    print(f"Building knowledge base with chunk_size={chunk_size}, chunk_overlap={chunk_overlap}...")
    yield rag_state_df, "Reading documents..."

    file_paths = [f.name for f in uploaded_files if f and hasattr(f, 'name') and f.name]

    if not file_paths:
         yield pd.DataFrame(), "No valid file paths from upload."
         return

    raw_docs = read_documents_from_paths(file_paths)

    if not raw_docs:
         yield pd.DataFrame(), "No readable documents found."
         return

    yield rag_state_df, "Chunking text..."
    all_chunks = []
    all_filenames = []
    for doc in raw_docs:
        chunks = chunk_text(doc['text'], int(chunk_size), int(chunk_overlap))
        all_chunks.extend(chunks)
        all_filenames.extend([doc['filename']] * len(chunks))

    if not all_chunks:
         yield pd.DataFrame(), "No text chunks created from documents."
         return


    yield rag_state_df, f"Embedding {len(all_chunks)} chunks..."
    print(f"Attempting to embed {len(all_chunks)} chunks...")
    try:
        # embed_texts returns a list of (chunk, embedding or None) tuples
        chunk_embedding_pairs = embed_texts(all_chunks, task_type="RETRIEVAL_DOCUMENT")

        # Filter out chunks that failed to embed
        successful_pairs = [(chunk, emb) for chunk, emb in chunk_embedding_pairs if emb is not None]

        if not successful_pairs:
            yield pd.DataFrame(), "Embedding failed for all chunks."
            return

        successful_chunks = [pair[0] for pair in successful_pairs]
        successful_embeddings = [pair[1] for pair in successful_pairs]

        # Align filenames with successful chunks
        original_chunk_data = list(zip(all_filenames, all_chunks))
        filtered_filenames = []
        filtered_chunks_aligned = []
        chunk_original_indices = {id(chunk): idx for idx, chunk in enumerate(all_chunks)} # Use id for uniqueness
        for chunk, emb in chunk_embedding_pairs:
            if emb is not None:
                # Find the original index based on the object's identity if possible,
                # or fall back to value if identities might not match (e.g., after some processing)
                original_idx = chunk_original_indices.get(id(chunk))
                if original_idx is None:
                    # Fallback to value search if identity didn't work
                     try:
                         original_idx = all_chunks.index(chunk)
                     except ValueError:
                          original_idx = None # Still not found


                if original_idx is not None and original_idx < len(all_filenames):
                    filtered_filenames.append(all_filenames[original_idx])
                    filtered_chunks_aligned.append(chunk) # Use the chunk text from pair
                else:
                    print(f"Warning: Could not find original filename for chunk. Appending 'Unknown File'. Chunk start: {chunk[:50]}...")
                    filtered_filenames.append("Unknown File")
                    filtered_chunks_aligned.append(chunk)


        if len(filtered_chunks_aligned) != len(successful_embeddings):
             print("Error: Mismatch between aligned chunks and successful embeddings count after filtering!")
             yield pd.DataFrame(), "Internal error aligning chunks/embeddings."
             return


    except Exception as e:
        status_message = f"An error occurred during embedding: {e}"
        print(status_message)
        yield pd.DataFrame(), status_message
        return


    status_message = "Creating knowledge base index..."
    yield rag_state_df, status_message

    try:
        rag_index_df_new = pd.DataFrame({
            'filename': filtered_filenames,
            'chunk': filtered_chunks_aligned,
            'embedding': successful_embeddings
        })

        status_message = f"✅ Knowledge base built successfully with {len(rag_index_df_new)} chunks."
        print(status_message)
        yield rag_index_df_new, status_message

    except Exception as e:
        status_message = f"An error occurred creating the index: {e}"
        print(status_message)
        yield pd.DataFrame(), s


def chat_with_rag(user_input: str, history: list, rag_state_df: pd.DataFrame) -> tuple:
    global rule_response
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
    # Placeholder for preview & apply functionality
    return "Rule applied successfully!"

# Placeholder function for chat interaction
def echo(message, history):
    return message

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application."""
    # Define the Gradio State variable for the RAG index DataFrame
    # This will persist across user interactions within a session
    # Initialize with an empty DataFrame
    state_rag_df = gr.State(pd.DataFrame())

    # Create components to be shared between panels
    name_display = gr.Textbox(value="Name will appear here after input.", label="Name")
    summary_display = gr.Textbox(value="Summary will appear here after input.", label="Summary")
    logic_display = gr.JSON(value={
        "message": "Logic will appear here after input."
    }, label="Logic")
    #title_display = gr.Textbox(value="Title will appear here after input.", label="Title")
    rag_status_display = gr.Textbox(label="Knowledge Base Status", value="Knowledge base not built yet.", interactive=False)
   
    with gr.Blocks(theme=gr.themes.Base(), css="""
        footer { visibility: hidden; }
        .gradio-container { max-width: 1400px; margin: auto; }
        .gradio-column { flex: 1; min-width: 300px; }
        .rag-config { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .summary-panel { border: 1px solid #ccc; padding: 15px; border-radius: 5px; height: 100%; display: flex; flex-direction: column;}
        .summary-panel > :last-child { margin-top: auto; }
        div[data-testid="file"] > div { width: 100% !important; }
        div[data-testid="json"] textarea { height: 200px !important; }
    """) as demo:
        gr.Markdown("# Rule Management Bot with RAG")

        with gr.Row():
            with gr.Column(scale=2): # Give chat column more space
                gr.Markdown("### Chat Interface")

                chatbot = gr.Chatbot(height=500, show_copy_button=True) # Adjust height, add copy button

                textbox = gr.Textbox(
                        placeholder="Enter your rule description or question here...",
                        scale=7,
                        container=False # Prevent extra div wrapper
                    )

                # Create the ChatInterface wrapper
                # Link to our chat_with_rag function
                chat_interface = gr.ChatInterface(
                    fn=chat_with_rag, # This function processes input, uses RAG, and updates outputs
                    chatbot=chatbot,
                    textbox=textbox,
                    # additional_inputs pass components to the fn
                    # Pass the RAG state to the chat function
                    additional_inputs=[state_rag_df],
                    # additional_outputs receive return values from fn
                    # fn signature: (msg, history, state) -> (response, history, state, add_out1, add_out2, ...)
                    # Map returns to outputs: (response_string, history_list, updated_state_df, name_val, summary_val, logic_val)
                    # Map outputs to components: (chatbot_output, chatbot_history_update, state_rag_df, name_display, summary_display, logic_display)
                    additional_outputs=[name_display, summary_display, logic_display],
                    # Customize buttons if needed
                    # submit_btn="Send",
                    # clear_btn="Clear Chat",
                    # retry_btn="Retry",
                    # undo_btn="Undo Last"
                )
                # chat_interface.render() # No need to render if it's within a block


            with gr.Column(scale=1, elem_classes="summary-panel"): # Give summary panel a class for styling
                gr.Markdown("### Knowledge Base Setup")

                with gr.Accordion("Upload Documents & Configure RAG", open=True, elem_classes="rag-config"):
                    document_upload = gr.File(
                        label="Upload Documents (.docx, .pdf)",
                        file_count="multiple", # Allow multiple files
                        file_types=[".docx", ".pdf"] # Specify allowed types
                    )
                    chunk_size_input = gr.Number(label="Chunk Size", value=500, precision=0, interactive=True)
                    chunk_overlap_input = gr.Number(label="Chunk Overlap", value=50, precision=0, interactive=True)
                    build_kb_button = gr.Button("Build Knowledge Base", variant="primary")
                    rag_status_display.render()


                gr.Markdown("### Rule Summary")
                name_display.render()
                summary_display.render()
                logic_display.render()

                # gr.Spring() # Add a spring to push the button down if needed
                preview_button = gr.Button("Preview & Apply Rule", variant="secondary")


        # --- Event Actions ---

        # Link the "Build Knowledge Base" button to the processing function
        # It takes inputs, updates the state, and updates the status display
        build_kb_button.click(
            # Use the generator function for streaming updates
            build_knowledge_base_process,
            inputs=[state_rag_df, document_upload, chunk_size_input, chunk_overlap_input],
            # The generator yields (state, status) tuples
            # The final return should match the outputs as well
            outputs=[state_rag_df, rag_status_display],
            show_progress="full" # Show progress during the potentially long RAG build
        )

        # Link the "Preview & Apply" button
        preview_button.click(
            preview_apply_rule,
            inputs=[],
            outputs=[]
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

