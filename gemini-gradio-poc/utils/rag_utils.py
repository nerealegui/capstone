import os
import PyPDF2 # type: ignore
from docx import Document
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import time
from config.agent_config import *
from google import genai
from google.genai import types
import json
from utils.json_response_handler import JsonResponseHandler

# Initialize Gemini client globally (will be properly initialized on first use with API key)
# Initialize to None; it will be set when initialize_gemini_client is called.
client = None

def initialize_gemini_client():
    """Initializes or returns the global Gemini client using google.genai."""
    global client
    if client is None:
        api_key = os.environ.get('GOOGLE_API_KEY')
        if not api_key or not api_key.strip():
            raise ValueError("Google API key not found or is empty. Please check your .env file.")

        try:
            client = genai.Client(api_key=api_key)
            print("✅ Gemini client (google.genai) initialized successfully.")
        except Exception as e:
            print(f"❌ Failed to initialize Gemini client (google.genai): {e}")
            print("Please double-check your GOOGLE_API_KEY and internet connection.")
            # Ensure client is None if initialization failed
            client = None
            raise e  # Re-raise the exception

    # Return the initialized client instance
    return client

# Function to read docx files
def read_docx(file_path):
    """Reads text from a .docx file."""
    try:
        doc = Document(file_path)
        doc_text = [para.text for para in doc.paragraphs]
        return "\n".join(filter(None, doc_text))
    except Exception as e:
        print(f"Error reading DOCX {os.path.basename(file_path)}: {e}")
        return None

# Function to read pdf files
def read_pdf(file_path):
    """Reads text from a .pdf file."""
    try:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            if reader.is_encrypted:
                try:
                    reader.decrypt('')
                except Exception:
                    print(f"Warning: Could not decrypt PDF {os.path.basename(file_path)}. Skipping.")
                    return None
            return "\n".join(filter(None, [page.extract_text() for page in reader.pages if page.extract_text()]))
    except Exception as e:
        print(f"Error reading PDF {os.path.basename(file_path)}: {e}")
        return None

def read_documents_from_paths(file_paths):
    """Reads text from a list of document file paths."""
    documents = []
    if not file_paths:
        return documents
    print(f"Attempting to read {len(file_paths)} documents...")
    for file_path in file_paths:
        if not file_path: continue
        filename = os.path.basename(file_path)
        print(f"  Reading {filename}...")
        try:
            if os.path.exists(file_path) and os.path.isfile(file_path):
                if filename.lower().endswith(".docx"):
                    text = read_docx(file_path)
                    if text is not None and text.strip():
                        documents.append({'filename': filename, 'text': text})
                        print(f"    ✅ Read {filename}")
                    else:
                         print(f"    ⚠️  {filename} is empty or could not be read successfully.")
                elif filename.lower().endswith(".pdf"):
                    text = read_pdf(file_path)
                    if text is not None and text.strip():
                        documents.append({'filename': filename, 'text': text})
                        print(f"    ✅ Read {filename}")
                    else:
                        print(f"    ⚠️  {filename} is empty or could not be read successfully.")
                elif filename.lower().endswith(".txt"):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        text = f.read()
                    if text is not None and text.strip():
                        documents.append({'filename': filename, 'text': text})
                        print(f"    ✅ Read {filename}")
                    else:
                        print(f"    ⚠️  {filename} is empty or could not be read successfully.")
                else:
                    print(f"  Skipping unsupported file type: {filename}")
            else:
                 print(f"  Skipping path as it does not appear to be a valid file: {file_path}")
        except Exception as e:
             print(f"  An unexpected error occurred while reading {filename}: {e}")

    print(f"Finished reading documents. Successfully read {len(documents)} documents.")
    return documents

# Function to split the test into fixed size chunks with overlap
def chunk_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    """
    Splits text into chunks of a fixed size with optional overlap.
    Ensures valid chunk_size and chunk_overlap.
    """
    chunks = []
    if not text or not isinstance(text, str):
        return chunks
    if not isinstance(chunk_size, int) or chunk_size <= 0:
        print(f"Warning: Invalid chunk_size: {chunk_size}. Must be a positive integer.")
        return []
    if not isinstance(chunk_overlap, int) or chunk_overlap < 0:
        print(f"Warning: Invalid chunk_overlap: {chunk_overlap}. Must be a non-negative integer.")
        chunk_overlap = 0

    chunk_overlap = min(chunk_overlap, chunk_size - 1) if chunk_size > 1 else 0

    start = 0
    text_len = len(text)
    while start < text_len:
        end = start + chunk_size
        chunk = text[start:min(end, text_len)]
        chunks.append(chunk)
        next_start = start + chunk_size
        if end >= text_len:
            break
        start = next_start - chunk_overlap
        if start >= text_len and end < text_len:
             break # Safety break

    chunks = [chunk for chunk in chunks if chunk]
    return chunks

# Function to create embeddings for a list of texts
def embed_texts(texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[tuple[str, list[float] | None]]:
    """
    Generates embeddings for a list of text strings using Gemini's embedding model
    via google.genai.
    Handles potential API errors and returns a list of (text, embedding vector or None) tuples.
    """
    if not texts:
        return []

    # Ensure client is initialized (this will check API key internally)
    gemini_client_instance = initialize_gemini_client() # Get the initialized Client instance

    embedding_model = EMBEDDING_MODEL
    paired_results = [] # List of (text, embedding or None)

    batch_size = 100 # Process in batches

    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i+batch_size]
        attempt = 0
        max_attempts = 5
        success = False
        batch_embeddings = [None] * len(batch_texts) # Placeholders for this batch

        while attempt < max_attempts and not success:
            try:
                # Call embed_content via the client's models attribute
                out = gemini_client_instance.models.embed_content(
                    model=embedding_model,
                    contents=batch_texts, # Use 'contents' for list of strings in genai.Client
                    config=types.EmbedContentConfig(task_type=task_type)
                )

                # Check if embeddings are returned and match the batch size
                if out and out.embeddings and len(out.embeddings) == len(batch_texts):
                    batch_embeddings = [emb.values for emb in out.embeddings]
                    success = True
                else:
                    attempt += 1
                    print(f"Embedding batch {i//batch_size + 1} returned unexpected result (Attempt {attempt}).")

            except Exception as e:
                attempt += 1
                print(f"Embedding batch {i//batch_size + 1} failed (Attempt {attempt}): {e}")

            if not success and attempt < max_attempts:
                wait_time = 5 * (2 ** attempt)
                print(f"Waiting {wait_time:.2f} seconds before retrying batch {i//batch_size + 1}...")
                time.sleep(wait_time)

        # After retries, add the results (or None) to the main list
        for j, text in enumerate(batch_texts):
            paired_results.append((text, batch_embeddings[j] if success else None))

    successful_count = sum(1 for _, emb in paired_results if emb is not None)
    if successful_count != len(texts):
        print(f"Warning: Successfully embedded {successful_count} out of {len(texts)} texts.")
        # The return format handles None embeddings for failed ones

    return paired_results

# Defining a function to calculate cosine similarity
def retrieve(query: str, df: pd.DataFrame, top_k: int = 3) -> pd.DataFrame:
    """
    Embeds a query and finds the top_k most similar document chunks from the DataFrame.
    Uses google.genai for query embedding.
    """
    if df is None or df.empty or 'embedding' not in df.columns or 'chunk' not in df.columns:
        return pd.DataFrame(columns=['filename', 'chunk', 'score'])

    df_valid_embeddings = df[df['embedding'].apply(lambda x: isinstance(x, (list, np.ndarray)) and len(x) > 0)].copy()

    if df_valid_embeddings.empty:
        return pd.DataFrame(columns=['filename', 'chunk', 'score'])

    try:
        emb_matrix = np.vstack(df_valid_embeddings["embedding"].apply(np.asarray).values)
    except Exception as e:
        print(f"Error preparing embedding matrix for retrieval: {e}")
        return pd.DataFrame(columns=['filename', 'chunk', 'score'])

    # Embed the query
    try:
        # Call embed_texts within rag_utils, which now uses genai.Client
        query_embedding_result_pair = embed_texts([query], task_type="RETRIEVAL_QUERY")

        if not query_embedding_result_pair or query_embedding_result_pair[0][1] is None:
            print("Error: Failed to embed query.")
            return pd.DataFrame(columns=['filename', 'chunk', 'score'])
        q_emb = query_embedding_result_pair[0][1]

    except Exception as e:
        print(f"Error embedding query for retrieval: {e}")
        return pd.DataFrame(columns=['filename', 'chunk', 'score'])

    try:
        q_emb_2d = np.asarray(q_emb).reshape(1, -1)
        sims = cosine_similarity(q_emb_2d, emb_matrix)[0]
    except Exception as e:
        print(f"Error calculating cosine similarity: {e}")
        return pd.DataFrame(columns=['filename', 'chunk', 'score'])

    df_scores = df_valid_embeddings.copy()
    df_scores["score"] = sims

    top_k = min(top_k, len(df_scores))
    return df_scores.sort_values("score", ascending=False).head(top_k).reset_index(drop=True)

# RAG Chain (Combining Retrieval of most relevant resutls based on a score and LLM Call) 
def rag_generate(query: str, df: pd.DataFrame, agent_prompt: str, model_name: str, generation_config: types.GenerateContentConfig, history: list, top_k: int = 3) -> str:
    """
    Performs RAG: retrieves relevant document chunks and uses them as context
    for generating a response with the LLM via google.genai.
    Includes chat history in the prompt.
    Returns a JSON string representing the rule or an error.
    """
    print(f"Performing RAG generation for query: '{query}'")
    
    # Debug: Show history at entry point
    print(f"\n=== DEBUG: History Analysis ===")
    print(f"History type: {type(history)}")
    print(f"History length: {len(history) if history else 0}")
    if history:
        print(f"First history item type: {type(history[0]) if len(history) > 0 else 'N/A'}")
        print(f"First history item content: {history[0] if len(history) > 0 else 'N/A'}")
        # Show structure of first few items
        for i, item in enumerate(history[:3]):  # Show first 3 items
            print(f"\nHistory item {i}:")
            print(f"  Type: {type(item)}")
            if isinstance(item, (list, tuple)):
                print(f"  Length: {len(item)}")
                if len(item) > 0:
                    print(f"  Item[0] type: {type(item[0])}, preview: {str(item[0])[:100]}...")
                if len(item) > 1:
                    print(f"  Item[1] type: {type(item[1])}, preview: {str(item[1])[:100]}...")
            elif isinstance(item, dict):
                print(f"  Keys: {list(item.keys())}")
                for key in list(item.keys())[:3]:  # Show first 3 keys
                    print(f"  {key}: {str(item[key])[:100]}...")
            else:
                print(f"  Content preview: {str(item)[:100]}...")
    print(f"=== END DEBUG: History Analysis ===\n")

    # Ensure client is initialized
    gemini_client_instance = initialize_gemini_client() # Get the initialized Client instance

    # --- Build the 'contents' list including history and RAG context ---
    contents = []

    # 1. Add previous conversation history
    if history:
        print(f"Including {len(history)} turns of chat history.")
        print(f"History structure: {type(history)} with items of type: {[type(item) for item in history[:2]]}")
        
        for i, item in enumerate(history):
            try:
                print(f"\n--- Processing history item {i} ---")
                print(f"Item type: {type(item)}")
                print(f"Item content: {item}")
                
                # Handle different possible history formats
                if isinstance(item, (list, tuple)) and len(item) >= 2:
                    # Extract first two elements as user_msg and model_response
                    user_msg, model_response = item[0], item[1]
                    print(f"Extracted from list/tuple - User: '{str(user_msg)[:50]}...', Model: '{str(model_response)[:50]}...'")
                elif isinstance(item, dict):
                    # If it's a dictionary, look for common keys
                    if 'role' in item and 'content' in item:
                        # Handle dict format with role/content
                        print(f"Dict with role/content - Role: {item['role']}, Content: '{item['content'][:50]}...'")
                        contents.append(
                            types.Content(
                                role=item['role'],
                                parts=[types.Part.from_text(text=item['content'])]
                            )
                        )
                        continue
                    else:
                        # Handle other dict formats
                        user_msg = item.get('user', item.get('input', ''))
                        model_response = item.get('assistant', item.get('output', item.get('response', '')))
                        print(f"Dict with user/assistant keys - User: '{str(user_msg)[:50]}...', Model: '{str(model_response)[:50]}...'")
                else:
                    print(f"Warning: Unexpected history item format at index {i}: {type(item)} - {item}")
                    continue
                
                # Validate that we have non-empty content before adding to contents
                if not user_msg or not str(user_msg).strip():
                    print(f"Warning: Empty user message in history item {i}, skipping")
                    continue
                
                if not model_response or not str(model_response).strip():
                    print(f"Warning: Empty model response in history item {i}, skipping")
                    continue
                
                # Append user's previous message
                print(f"Adding user message to contents: '{str(user_msg)[:50]}...'")
                contents.append(
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=str(user_msg))]
                    )
                )
                # Append model's previous response
                print(f"Adding model response to contents: '{str(model_response)[:50]}...'")
                contents.append(
                    types.Content(
                        role="model",
                        parts=[types.Part.from_text(text=str(model_response))]
                    )
                )
                print(f"--- Successfully processed history item {i} ---")
            except Exception as e:
                print(f"Error processing history item {i}: {e}. Item: {item}")
                continue
    
    # 2. Retrieve relevant chunks based on the current user query
    retrieved_docs_df = retrieve(query, df, top_k)

    context_text = ""
    if not retrieved_docs_df.empty:
        print(f"Retrieved {len(retrieved_docs_df)} relevant chunks.")
        context_text = "Context from Knowledge Base (relevant documents/chunks):\n"
        for index, row in retrieved_docs_df.iterrows():
            context_text += f"--- Document: {row['filename']} ---\n{row['chunk']}\n\n"
        context_text += "------------------------\n\n"
    else:
        print("No relevant documents retrieved for the query.")
        context_text = "Context from Knowledge Base (relevant documents/chunks):\nNo relevant context found.\n\n------------------------\n\n"


    # 3. Combine Agent Prompt, RAG Context, and Current User Query for the final user turn
    # Place the prompt and context *before* the user's query in the final turn's text part
    # Enhance the agent prompt for better JSON responses 
    enhanced_prompt = enhance_json_prompt(agent_prompt)
    current_user_turn_text = f"{enhanced_prompt}\n\n{context_text}User Query: {query}"

    # Validate inputs before creating the API call
    if not query or not query.strip():
        print("ERROR: User query is empty or None")
        return json.dumps({
            "name": "Input Validation Error",
            "summary": "User query cannot be empty",
            "logic": {"message": "Please provide a valid query."}
        })
    
    if not agent_prompt or not agent_prompt.strip():
        print("ERROR: Agent prompt is empty or None")
        return json.dumps({
            "name": "Configuration Error",
            "summary": "Agent prompt is not configured properly",
            "logic": {"message": "System configuration error."}
        })
    
    if not current_user_turn_text or not current_user_turn_text.strip():
        print("ERROR: Final user turn text is empty")
        print(f"Debug - query: '{query}', agent_prompt length: {len(agent_prompt) if agent_prompt else 0}, context_text length: {len(context_text) if context_text else 0}")
        return json.dumps({
            "name": "Text Construction Error",
            "summary": "Failed to construct valid input text",
            "logic": {"message": "Internal error in text construction."}
        })

    print(f"Debug - Final user turn text length: {len(current_user_turn_text)}")
    print(f"Debug - First 100 chars: {current_user_turn_text[:100]}...")

    # 4. Append the current user turn to the contents list
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=current_user_turn_text)]
        )
    )

    # Debug: Show final contents structure before API call
    print(f"\n=== DEBUG: Final Contents Structure ===")
    print(f"Total content items: {len(contents)}")
    for idx, content in enumerate(contents):
        print(f"\nContent {idx}:")
        print(f"  Role: {content.role}")
        if content.parts and content.parts[0]:
            text_preview = content.parts[0].text[:100] if hasattr(content.parts[0], 'text') else 'N/A'
            print(f"  Text preview: {text_preview}...")
            print(f"  Text length: {len(content.parts[0].text) if hasattr(content.parts[0], 'text') else 0}")
    print(f"=== END DEBUG: Final Contents Structure ===\n")

    # --- Call the LLM with the constructed 'contents' list ---
    try:
        print(f"Calling LLM ({model_name}) with 'contents' list (history + RAG + prompt) via google.genai...")
        
        # Additional validation before API call
        if not contents:
            print("ERROR: Contents list is empty")
            return json.dumps({
                "name": "API Input Error",
                "summary": "No content to send to AI model",
                "logic": {"message": "Contents list is empty."}
            })
        
        # Validate each content item
        for idx, content in enumerate(contents):
            if not content.parts or not content.parts[0] or not content.parts[0].text:
                print(f"ERROR: Content at index {idx} has empty text part")
                print(f"Content role: {content.role}, parts: {content.parts}")
                return json.dumps({
                    "name": "Content Validation Error",
                    "summary": f"Content item {idx} has empty text",
                    "logic": {"message": "Invalid content structure."}
                })
            if not content.parts[0].text.strip():
                print(f"ERROR: Content at index {idx} has whitespace-only text")
                print(f"Content text: '{content.parts[0].text}'")
                return json.dumps({
                    "name": "Content Validation Error",
                    "summary": f"Content item {idx} contains only whitespace",
                    "logic": {"message": "Content must contain non-whitespace text."}
                })
        
        print(f"Debug - About to call API with {len(contents)} content items")
        print(f"Debug - Model: {model_name}")
        print(f"Debug - Generation config: {generation_config}")
        
        # Use client.models.generate_content for the older library
        response = gemini_client_instance.models.generate_content(
            model=model_name,
            contents=contents, # Pass the constructed contents list
            config=generation_config, # Use 'config'
        )

        if not response or not response.candidates or not response.candidates[0].content.parts:
            error_msg = "LLM returned no text content or no candidates."
            print(f"Warning: {error_msg}")
            return json.dumps({
                "name": "LLM Response Error",
                "summary": error_msg,
                "logic": {"message": "Empty LLM response."}
            })

        llm_response_text = response.text
        print("LLM response received.")

        # Use JsonResponseHandler to handle the response
        try:
            # Attempt to parse and validate the JSON, which will clean it if needed
            parsed_json = JsonResponseHandler.parse_json_response(llm_response_text)
            # If successful, re-serialize to ensure proper JSON formatting
            return json.dumps(parsed_json)
        except ValueError:
            print(f"Warning: LLM response is not valid JSON even after cleaning.")
            print(f"Raw LLM Response received:\n{llm_response_text[:300]}...")
            return json.dumps({
                 "name": "LLM JSON Error",
                 "summary": f"The AI returned a response, but it wasn't valid JSON. Raw response start: {llm_response_text[:150]}...",
                 "logic": {"message": "LLM response was not in expected JSON format."}
            })

    except Exception as e:
        print(f"Error during LLM generation with RAG context via google.genai: {e}")
        return json.dumps({
            "name": "LLM Generation Error",
            "summary": f"An error occurred during AI response generation: {str(e)}",
            "logic": {"message": "LLM generation failed."}
        })

def enhance_json_prompt(prompt: str) -> str:
    """
    Enhances a prompt to encourage valid JSON responses from Gemini.
    
    Args:
        prompt (str): Original prompt
        
    Returns:
        str: Enhanced prompt with JSON-specific instructions
    """
    # Use JsonResponseHandler's enhance_json_prompt method
    return JsonResponseHandler.enhance_json_prompt(prompt)
