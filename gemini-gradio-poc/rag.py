"""
RAG (Retrieval Augmented Generation) functionality for the chatbot application.
This module provides functions for both local and remote document retrieval.
"""

import os
import re
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

# Import document processing libraries if needed
try:
    from docx import Document
    import PyPDF2
except ImportError:
    # These will be imported only when needed
    pass

def read_docx(file_path: str) -> str:
    """
    Read text from a .docx file.
    
    Args:
        file_path: Path to the .docx file.
        
    Returns:
        Extracted text from the document.
    """
    # Import docx only when needed
    if 'Document' not in globals():
        from docx import Document
        
    doc = Document(file_path)
    doc_text = []
    for para in doc.paragraphs:
        doc_text.append(para.text)
    return "\n".join(doc_text)

def read_pdf(file_path: str) -> str:
    """
    Read text from a PDF file.
    
    Args:
        file_path: Path to the PDF file.
        
    Returns:
        Extracted text from the PDF.
    """
    # Import PyPDF2 only when needed
    if 'PyPDF2' not in globals():
        import PyPDF2
        
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

def read_documents(folder_path: str) -> List[Dict[str, str]]:
    """
    Read documents from a folder (only .docx and .pdf supported).
    
    Args:
        folder_path: Path to the folder containing documents.
        
    Returns:
        List of dictionaries with filenames and document text.
    """
    documents = []
    if not os.path.exists(folder_path):
        os.makedirs(folder_path, exist_ok=True)
        print(f"Created folder: {folder_path}")
        return documents
        
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if filename.endswith(".docx"):
            try:
                text = read_docx(file_path)
                documents.append({'filename': filename, 'text': text})
            except Exception as e:
                print(f"Error reading DOCX {filename}: {e}")
        elif filename.endswith(".pdf"):
            try:
                text = read_pdf(file_path)
                documents.append({'filename': filename, 'text': text})
            except Exception as e:
                print(f"Error reading PDF {filename}: {e}")
    return documents

def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """
    Split text into chunks of fixed size with optional overlap.
    
    Args:
        text: Text to chunk.
        chunk_size: Size of each chunk.
        chunk_overlap: Overlap between chunks.
        
    Returns:
        List of text chunks.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - chunk_overlap
    return chunks

def embed_texts(texts: List[str], client, model: str = "models/text-embedding-004") -> List[List[float]]:
    """
    Create embeddings for a list of texts using Gemini API.
    
    Args:
        texts: List of texts to embed.
        client: Gemini API client.
        model: Model to use for embeddings.
        
    Returns:
        List of embeddings (each embedding is a list of floats).
    """
    from google.genai import types
    out = client.models.embed_content(
        model=model,
        contents=texts,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
    )
    return [emb.values for emb in out.embeddings]

def retrieve(query: str, df: pd.DataFrame, top_k: int = 3) -> pd.DataFrame:
    """
    Retrieve most relevant documents for a query using cosine similarity.
    
    Args:
        query: Query text.
        df: DataFrame with embeddings.
        top_k: Number of top results to return.
        
    Returns:
        DataFrame with top k most relevant documents.
    """
    # This is a placeholder - the actual implementation requires
    # embedding the query using the same client and model used for the documents
    # For now, it assumes the query embedding is already provided
    
    # Stack document embeddings into an array
    emb_matrix = np.vstack(df["embedding"].values)
    # Cosine similarity
    from sklearn.metrics.pairwise import cosine_similarity
    sims = cosine_similarity([query], emb_matrix)[0]
    # Add scores to DataFrame
    df_scores = df.copy()
    df_scores["score"] = sims
    # Return top k results
    return df_scores.sort_values("score", ascending=False).head(top_k)

def create_embeddings_dataframe(folder_path: str, client, chunk_size: int = 500, chunk_overlap: int = 50) -> pd.DataFrame:
    """
    Create a DataFrame with document chunks and their embeddings.
    
    Args:
        folder_path: Path to the folder containing documents.
        client: Gemini API client.
        chunk_size: Size of each chunk.
        chunk_overlap: Overlap between chunks.
        
    Returns:
        DataFrame with filename, chunk, and embedding columns.
    """
    # Read documents
    raw_docs = read_documents(folder_path)
    
    # Create chunks
    all_chunks = []
    all_filenames = []
    
    for doc in raw_docs:
        chunks = chunk_text(doc['text'], chunk_size, chunk_overlap)
        all_chunks.extend(chunks)
        all_filenames.extend([doc['filename']] * len(chunks))
    
    # Generate embeddings
    if not all_chunks:
        print(f"No documents found in {folder_path}")
        return pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
        
    embeddings = embed_texts(all_chunks, client)
    
    # Create DataFrame
    df = pd.DataFrame({
        'filename': all_filenames,
        'chunk': all_chunks,
        'embedding': embeddings
    })
    
    return df

def rag_query(query: str, df: pd.DataFrame, client, top_k: int = 3, system_prompt: str = None) -> str:
    """
    Execute a RAG query.
    
    Args:
        query: User query.
        df: DataFrame with document chunks and embeddings.
        client: Gemini API client.
        top_k: Number of top results to return.
        system_prompt: Optional system prompt to control the response format.
        
    Returns:
        Response from the LLM.
    """
    from google.genai import types
    
    # If there's no data, just call the LLM directly without context
    if df.empty:
        prompt = system_prompt or """
        You are an expert in translating restaurant business rules into structured logic.
        Your task is to extract the key logic (conditions and actions) from the user's sentence.
        
        Respond with structured JSON like this:
        {
          "conditions": [...],
          "actions": [...]
        }
        """
        
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=f"{prompt}\n\nQuestion: {query}")]
            )
        ]
        
        response_type = "application/json" if "json" in prompt.lower() else "text/plain"
        generate_content_config = types.GenerateContentConfig(response_mime_type=response_type)
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=generate_content_config
        )
        
        return response.text
    
    # Embed the query
    query_emb = embed_texts([query], client)[0]
    
    # Retrieve relevant documents
    docs = retrieve(query_emb, df, top_k)
    
    # Prepare the prompt with context from retrieved documents
    context = "\n\n".join([f"Document: {row['filename']}\nContent: {row['chunk']}" 
                         for _, row in docs.iterrows()])
    
    prompt = system_prompt or """
    You are an expert in translating restaurant business rules into structured logic.
    Your task is to extract the key logic (conditions and actions) from the user's sentence.
    
    Use the following reference documents to help you understand the context:
    
    {context}
    
    Respond with structured JSON like this:
    {
      "conditions": [...],
      "actions": [...]
    }
    """
    
    prompt = prompt.replace("{context}", context)
    
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=f"{prompt}\n\nQuestion: {query}")]
        )
    ]
    
    response_type = "application/json" if "json" in prompt.lower() else "text/plain"
    generate_content_config = types.GenerateContentConfig(response_mime_type=response_type)
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=contents,
        config=generate_content_config
    )
    
    return response.text

def save_drl_to_file(drl_content: str, directory: str) -> str:
    """
    Save DRL content to a file.
    
    Args:
        drl_content: DRL rule content.
        directory: Directory to save the file.
        
    Returns:
        Path to the saved file.
    """
    # Ensure the output directory exists
    os.makedirs(directory, exist_ok=True)
    
    # Trim leading and trailing spaces and backticks
    drl_content = drl_content.strip("`\n")
    
    # Extract the rule name
    match = re.search(r'rule\s+"([^"]+)"', drl_content.strip())
    if match:
        rule_name = match.group(1)  # Extracted rule name
    else:
        rule_name = f"rule_{os.urandom(4).hex()}"  # Generate random name if not found
    
    # Set filename
    filename = f"{rule_name}.drl"
    filepath = os.path.join(directory, filename)
    
    # Write the DRL content to file
    with open(filepath, "w") as f:
        f.write(drl_content)
    
    return filepath

# Example system prompts
AGENT1_SYSTEM_PROMPT = """
You are an expert in translating restaurant business rules into structured logic.
Your task is to extract the key logic (conditions and actions) from the user's sentence.

Use the following reference documents to help you understand the context:

{context}

Respond with structured JSON like this:
{
  "conditions": [...],
  "actions": [...]
}
"""

AGENT2_SYSTEM_PROMPT = """
You are an expert in translating business rules into Drools syntax.
Your task is to convert the structured JSON representation of a rule into proper Drools rule language (DRL) format.

Use the following reference documents to help you understand the syntax and structure:

{context}

The input JSON should be converted to a DRL rule following this template:

rule "RuleName"
when
    <conditions>
then
    <actions>;
end
"""

# Paths for document folders
DEFAULT_DOCUMENTS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "documents")
AGENT1_DOCUMENTS_PATH = os.path.join(DEFAULT_DOCUMENTS_PATH, "agent1")
AGENT2_DOCUMENTS_PATH = os.path.join(DEFAULT_DOCUMENTS_PATH, "agent2")
DRL_FILES_PATH = os.path.join(DEFAULT_DOCUMENTS_PATH, "drl_files")