import pandas as pd
from unittest.mock import patch, MagicMock
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'interface'))
from chat_app import build_knowledge_base_process

def make_file_mock(name):
    mock = MagicMock()
    mock.name = name
    return mock

def test_build_knowledge_base_process_success():
    # Arrange
    uploaded_files = [make_file_mock("file1.txt"), make_file_mock("file2.txt")]
    chunk_size = 10
    chunk_overlap = 2
    rag_state_df = pd.DataFrame()
    # Patch dependencies
    with patch("chat_app.read_documents_from_paths") as mock_read_docs, \
         patch("chat_app.chunk_text") as mock_chunk_text, \
         patch("chat_app.embed_texts") as mock_embed_texts:
        # Mock document reading
        mock_read_docs.return_value = [
            {"filename": "file1.txt", "text": "abc def ghi jkl mno pqr stu vwx yz"},
            {"filename": "file2.txt", "text": "123 456 789 012 345 678 901 234 567"}
        ]
        # Mock chunking
        mock_chunk_text.side_effect = lambda text, size, overlap: [text[:size]]
        # Mock embedding
        mock_embed_texts.return_value = [("abc def ghi", [0.1, 0.2, 0.3]), ("123 456 789", [0.4, 0.5, 0.6])]
        # Act
        gen = build_knowledge_base_process(uploaded_files, chunk_size, chunk_overlap, rag_state_df)
        results = list(gen)
        # Assert
        assert any("successfully" in msg for msg, df in results)
        assert any(isinstance(df, pd.DataFrame) and not df.empty for msg, df in results)

def test_build_knowledge_base_process_no_files():
    gen = build_knowledge_base_process([], 10, 2, pd.DataFrame())
    results = list(gen)
    assert any("upload documents" in msg.lower() for msg, df in results)

def test_build_knowledge_base_process_invalid_chunk():
    files = [make_file_mock("file1.txt")]
    gen = build_knowledge_base_process(files, 0, 0, pd.DataFrame())
    results = list(gen)
    assert any("invalid chunk size" in msg.lower() for msg, df in results)

def test_build_knowledge_base_process_no_valid_paths():
    files = [MagicMock()]  # No .name attribute
    gen = build_knowledge_base_process(files, 10, 2, pd.DataFrame())
    results = list(gen)
    assert any("no valid file paths" in msg.lower() for msg, df in results)

def test_build_knowledge_base_process_embedding_failure():
    files = [make_file_mock("file1.txt")]
    with patch("chat_app.read_documents_from_paths") as mock_read_docs, \
         patch("chat_app.chunk_text") as mock_chunk_text, \
         patch("chat_app.embed_texts") as mock_embed_texts:
        mock_read_docs.return_value = [{"filename": "file1.txt", "text": "abc def ghi"}]
        mock_chunk_text.return_value = ["abc def ghi"]
        mock_embed_texts.return_value = [("abc def ghi", None)]
        gen = build_knowledge_base_process(files, 10, 2, pd.DataFrame())
        results = list(gen)
        assert any("embedding failed" in msg.lower() for msg, df in results)
