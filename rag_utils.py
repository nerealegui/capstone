"""
Utility functions for Retrieval-Augmented Generation (RAG)
This module provides shared functionality for implementing RAG with both local and remote documents.
"""

import os
import numpy as np
import pandas as pd
from docx import Document
import PyPDF2
import requests
import tempfile
import io
from typing import List, Dict, Any, Optional, Union
from sklearn.metrics.pairwise import cosine_similarity
from google import genai
from google.genai import types

def read_docx(file_path: str) -> str:
    """
    Read text content from a .docx file
    
    Args:
        file_path: Path to the .docx file
        
    Returns:
        String containing the text content of the file
    """
    doc = Document(file_path)
    doc_text = []
    for para in doc.paragraphs:
        doc_text.append(para.text)
    return "\n".join(doc_text)

def read_pdf(file_path: str) -> str:
    """
    Read text content from a .pdf file
    
    Args:
        file_path: Path to the .pdf file
        
    Returns:
        String containing the text content of the file
    """
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

def read_remote_docx(url: str) -> str:
    """
    Read text content from a remote .docx file
    
    Args:
        url: URL to the .docx file
        
    Returns:
        String containing the text content of the file
    """
    response = requests.get(url)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as temp_file:
        temp_file.write(response.content)
        temp_file_path = temp_file.name
    
    try:
        text = read_docx(temp_file_path)
        os.unlink(temp_file_path)  # Delete the temp file
        return text
    except Exception as e:
        os.unlink(temp_file_path)  # Delete the temp file even if there's an error
        raise e

def read_remote_pdf(url: str) -> str:
    """
    Read text content from a remote .pdf file
    
    Args:
        url: URL to the .pdf file
        
    Returns:
        String containing the text content of the file
    """
    response = requests.get(url)
    pdf_file = io.BytesIO(response.content)
    reader = PyPDF2.PdfReader(pdf_file)
    return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

def read_documents(folder_path: str) -> List[Dict[str, str]]:
    """
    Read all documents (docx and pdf) from a folder
    
    Args:
        folder_path: Path to the folder containing documents
        
    Returns:
        List of dictionaries with filename and text content
    """
    documents = []
    
    # Check if folder exists
    if not os.path.exists(folder_path):
        print(f"Warning: Folder {folder_path} does not exist.")
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

def read_remote_documents(urls: List[str]) -> List[Dict[str, str]]:
    """
    Read documents from remote URLs
    
    Args:
        urls: List of URLs pointing to documents (docx or pdf)
        
    Returns:
        List of dictionaries with URL and text content
    """
    documents = []
    
    for url in urls:
        try:
            if url.lower().endswith('.docx'):
                text = read_remote_docx(url)
                documents.append({'filename': url, 'text': text})
            elif url.lower().endswith('.pdf'):
                text = read_remote_pdf(url)
                documents.append({'filename': url, 'text': text})
            else:
                print(f"Warning: Unsupported file format for URL {url}")
        except Exception as e:
            print(f"Error reading URL {url}: {e}")
    
    return documents

def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """
    Split text into chunks of specified size with overlap
    
    Args:
        text: Text to split into chunks
        chunk_size: Size of each chunk in characters
        chunk_overlap: Number of characters to overlap between chunks
        
    Returns:
        List of text chunks
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - chunk_overlap
    return chunks

def process_documents(documents: List[Dict[str, str]], 
                     chunk_size: int = 500, 
                     chunk_overlap: int = 50) -> pd.DataFrame:
    """
    Process a list of documents into a dataframe with chunked text
    
    Args:
        documents: List of dictionaries with filename and text
        chunk_size: Size of each chunk in characters
        chunk_overlap: Number of characters to overlap between chunks
        
    Returns:
        Dataframe with columns for filename, chunk
    """
    rows = []
    for doc in documents:
        chunks = chunk_text(doc['text'], chunk_size, chunk_overlap)
        for chunk in chunks:
            rows.append({
                'filename': doc['filename'],
                'chunk': chunk
            })
    return pd.DataFrame(rows)

def embed_texts(texts: List[str], client) -> List[List[float]]:
    """
    Generate embeddings for a list of texts using a Gemini model
    
    Args:
        texts: List of texts to embed
        client: Initialized Gemini client
        
    Returns:
        List of embedding vectors
    """
    out = client.models.embed_content(
        model="models/text-embedding-004",
        contents=texts,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
    )
    return [emb.values for emb in out.embeddings]

def create_embedding_df(df: pd.DataFrame, client) -> pd.DataFrame:
    """
    Add embeddings to a dataframe with text chunks
    
    Args:
        df: Dataframe with a 'chunk' column containing text
        client: Initialized Gemini client
        
    Returns:
        Dataframe with added embeddings column
    """
    df_with_embeddings = df.copy()
    embeddings = embed_texts(df['chunk'].tolist(), client)
    df_with_embeddings['embedding'] = embeddings
    return df_with_embeddings

def retrieve(query: str, df: pd.DataFrame, top_k: int = 3) -> pd.DataFrame:
    """
    Retrieve the most similar documents to a query
    
    Args:
        query: Query text
        df: Dataframe with text chunks and embeddings
        top_k: Number of most similar chunks to return
        
    Returns:
        Dataframe of the top_k most similar chunks with similarity scores
    """
    # Make sure the client is initialized
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    
    # embed the query
    q_emb = embed_texts([query], client)[0]
    
    # stack embeddings into an array
    emb_matrix = np.vstack(df["embedding"].values)
    
    # cosine similarity
    sims = cosine_similarity([q_emb], emb_matrix)[0]
    
    df_scores = df.copy()
    df_scores["score"] = sims
    
    return df_scores.sort_values("score", ascending=False).head(top_k)

def setup_rag_system(documents_folder: str, 
                    chunk_size: int = 500, 
                    chunk_overlap: int = 50) -> pd.DataFrame:
    """
    Set up a complete RAG system from a folder of documents
    
    Args:
        documents_folder: Path to folder containing documents
        chunk_size: Size of each chunk in characters
        chunk_overlap: Number of characters to overlap between chunks
        
    Returns:
        Dataframe with processed documents ready for retrieval
    """
    # Make sure the client is initialized
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    
    # Read documents
    documents = read_documents(documents_folder)
    
    # Process into chunks
    df = process_documents(documents, chunk_size, chunk_overlap)
    
    # Add embeddings
    df_with_embeddings = create_embedding_df(df, client)
    
    return df_with_embeddings

def setup_remote_rag_system(urls: List[str],
                          chunk_size: int = 500,
                          chunk_overlap: int = 50) -> pd.DataFrame:
    """
    Set up a complete RAG system from remote documents
    
    Args:
        urls: List of URLs pointing to documents
        chunk_size: Size of each chunk in characters
        chunk_overlap: Number of characters to overlap between chunks
        
    Returns:
        Dataframe with processed documents ready for retrieval
    """
    # Make sure the client is initialized
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    
    # Read remote documents
    documents = read_remote_documents(urls)
    
    # Process into chunks
    df = process_documents(documents, chunk_size, chunk_overlap)
    
    # Add embeddings
    df_with_embeddings = create_embedding_df(df, client)
    
    return df_with_embeddings

def rag_query(query: str, df: pd.DataFrame, top_k: int = 3) -> str:
    """
    Perform a RAG query - retrieve relevant documents and generate a response
    
    Args:
        query: Query text
        df: Dataframe with text chunks and embeddings
        top_k: Number of most similar chunks to return
        
    Returns:
        Retrieved context as a string
    """
    # Make sure the client is initialized
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    
    # Retrieve relevant documents
    results = retrieve(query, df, top_k)
    
    # Extract context
    context = "\n\n".join(results['chunk'].tolist())
    
    return context