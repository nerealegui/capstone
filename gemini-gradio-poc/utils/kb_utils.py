import pandas as pd
from utils.rag_utils import read_documents_from_paths, chunk_text, embed_texts
from typing import List, Tuple

def core_build_knowledge_base(file_paths: List[str], chunk_size: int = 500, chunk_overlap: int = 50, existing_kb_df: pd.DataFrame = None) -> Tuple[str, pd.DataFrame]:
    """
    Core logic for building the knowledge base, separated for testability.
    Args:
        file_paths (list): List of file paths.
        chunk_size (int, optional): Chunk size. Defaults to 500.
        chunk_overlap (int, optional): Chunk overlap. Defaults to 50.
        existing_kb_df (pd.DataFrame, optional): Existing KB DataFrame to merge with. Defaults to None.
    Returns:
        Tuple[str, pd.DataFrame]: Status message and resulting DataFrame.
    """
    raw_docs = read_documents_from_paths(file_paths)
    if not raw_docs:
        return "No readable documents found.", existing_kb_df if existing_kb_df is not None else pd.DataFrame()
    all_chunks = []
    all_filenames = []
    for doc in raw_docs:
        chunks = chunk_text(doc['text'], int(chunk_size), int(chunk_overlap))
        all_chunks.extend(chunks)
        all_filenames.extend([doc['filename']] * len(chunks))
    if not all_chunks:
        return "No text chunks created from documents.", existing_kb_df if existing_kb_df is not None else pd.DataFrame()
    try:
        chunk_embedding_pairs = embed_texts(all_chunks, task_type="RETRIEVAL_DOCUMENT")
        successful_pairs = [(chunk, emb) for chunk, emb in chunk_embedding_pairs if emb is not None]
        if not successful_pairs:
            return "Embedding failed for all chunks.", existing_kb_df if existing_kb_df is not None else pd.DataFrame()
        successful_chunks = [pair[0] for pair in successful_pairs]
        successful_embeddings = [pair[1] for pair in successful_pairs]
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
                    filtered_filenames.append("Unknown File")
                    filtered_chunks_aligned.append(chunk)
        if len(filtered_chunks_aligned) != len(successful_embeddings):
            return "Internal error aligning chunks/embeddings.", existing_kb_df if existing_kb_df is not None else pd.DataFrame()
    except Exception as e:
        return f"An error occurred during embedding: {e}", existing_kb_df if existing_kb_df is not None else pd.DataFrame()
    try:
        rag_index_df_new = pd.DataFrame({
            'filename': filtered_filenames,
            'chunk': filtered_chunks_aligned,
            'embedding': successful_embeddings
        })
        # Merge with existing KB if provided
        if existing_kb_df is not None and not existing_kb_df.empty:
            merged_kb = pd.concat([existing_kb_df, rag_index_df_new], ignore_index=True)
            # Deduplicate based on 'chunk' content (and optionally 'filename')
            merged_kb = merged_kb.drop_duplicates(subset=['filename', 'chunk'], keep='last').reset_index(drop=True)
            return f"Knowledge base merged successfully with {len(merged_kb)} chunks.", merged_kb
        else:
            return f"Knowledge base built successfully with {len(rag_index_df_new)} chunks.", rag_index_df_new
    except Exception as e:
        return f"An error occurred creating the index: {e}", existing_kb_df if existing_kb_df is not None else pd.DataFrame()
