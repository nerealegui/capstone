"""Tests for conversation storage functionality."""

import pytest
import tempfile
import shutil
import pandas as pd
import json
from pathlib import Path
from utils.conversation_storage import ConversationStorage


class TestConversationStorage:
    """Test suite for ConversationStorage class."""
    
    @pytest.fixture
    def temp_storage(self):
        """Create temporary storage for testing."""
        temp_dir = tempfile.mkdtemp()
        storage = ConversationStorage(storage_dir=temp_dir)
        yield storage
        shutil.rmtree(temp_dir)
    
    def test_initialization(self, temp_storage):
        """Test storage initialization."""
        storage = temp_storage
        
        # Check that storage directory and files are created
        assert storage.storage_dir.exists()
        assert storage.conversations_file.exists()
        assert storage.knowledge_base_file.exists()
        assert storage.rules_file.exists()
        assert storage.metadata_file.exists()
    
    def test_save_and_load_conversation(self, temp_storage):
        """Test saving and loading conversations."""
        storage = temp_storage
        
        # Test data
        conv_id = "test_conv_123"
        title = "Test Conversation"
        history = [["User message", "Bot response"], ["Another message", "Another response"]]
        metadata = {"industry": "restaurant", "mode": "Enhanced Agent 3"}
        
        # Save conversation
        success = storage.save_conversation(conv_id, title, history, metadata=metadata)
        assert success
        
        # Load conversation
        loaded_conv = storage.load_conversation(conv_id)
        assert loaded_conv is not None
        assert loaded_conv["id"] == conv_id
        assert loaded_conv["title"] == title
        assert loaded_conv["history"] == history
        assert loaded_conv["metadata"] == metadata
        assert loaded_conv["message_count"] == 2
    
    def test_save_conversation_with_rag_state(self, temp_storage):
        """Test saving conversation with RAG state DataFrame."""
        storage = temp_storage
        
        # Create test DataFrame
        rag_df = pd.DataFrame({
            "chunk": ["chunk1", "chunk2"],
            "filename": ["file1.pdf", "file2.pdf"],
            "embedding": [[0.1, 0.2], [0.3, 0.4]]
        })
        
        conv_id = "test_rag_conv"
        title = "RAG Test"
        history = [["Test message", "Test response"]]
        
        # Save with RAG state
        success = storage.save_conversation(conv_id, title, history, rag_state_df=rag_df)
        assert success
        
        # Load and verify RAG state
        loaded_conv = storage.load_conversation(conv_id)
        assert loaded_conv is not None
        assert "rag_state_df" in loaded_conv
        
        loaded_df = loaded_conv["rag_state_df"]
        assert isinstance(loaded_df, pd.DataFrame)
        assert len(loaded_df) == 2
        assert list(loaded_df.columns) == ["chunk", "filename", "embedding"]
    
    def test_list_conversations(self, temp_storage):
        """Test listing conversations."""
        storage = temp_storage
        
        # Save multiple conversations
        conversations = [
            ("conv1", "First Conversation", [["msg1", "resp1"]]),
            ("conv2", "Second Conversation", [["msg2", "resp2"], ["msg3", "resp3"]]),
            ("conv3", "Third Conversation", [])
        ]
        
        for conv_id, title, history in conversations:
            storage.save_conversation(conv_id, title, history)
        
        # List conversations
        conv_list = storage.list_conversations()
        assert len(conv_list) == 3
        
        # Check that conversations are sorted by updated_at (most recent first)
        titles = [conv["title"] for conv in conv_list]
        assert "Third Conversation" in titles  # Most recently added should be first
        
        # Verify conversation summary structure
        conv = conv_list[0]
        assert "id" in conv
        assert "title" in conv
        assert "created_at" in conv
        assert "updated_at" in conv
        assert "message_count" in conv
        assert "industry" in conv
        assert "mode" in conv
    
    def test_delete_conversation(self, temp_storage):
        """Test deleting conversations."""
        storage = temp_storage
        
        conv_id = "delete_test"
        storage.save_conversation(conv_id, "To Delete", [["msg", "resp"]])
        
        # Verify conversation exists
        assert storage.load_conversation(conv_id) is not None
        
        # Delete conversation
        success = storage.delete_conversation(conv_id)
        assert success
        
        # Verify conversation is deleted
        assert storage.load_conversation(conv_id) is None
        
        # Test deleting non-existent conversation
        success = storage.delete_conversation("non_existent")
        assert not success
    
    def test_rename_conversation(self, temp_storage):
        """Test renaming conversations."""
        storage = temp_storage
        
        conv_id = "rename_test"
        original_title = "Original Title"
        new_title = "New Title"
        
        storage.save_conversation(conv_id, original_title, [["msg", "resp"]])
        
        # Rename conversation
        success = storage.rename_conversation(conv_id, new_title)
        assert success
        
        # Verify title changed
        loaded_conv = storage.load_conversation(conv_id)
        assert loaded_conv["title"] == new_title
        
        # Test renaming non-existent conversation
        success = storage.rename_conversation("non_existent", "New Title")
        assert not success
    
    def test_conversation_id_generation(self, temp_storage):
        """Test conversation ID generation."""
        storage = temp_storage
        
        # Generate multiple IDs
        ids = [storage.create_new_conversation_id() for _ in range(10)]
        
        # Check that all IDs are unique
        assert len(set(ids)) == 10
        
        # Check ID format
        for conv_id in ids:
            assert conv_id.startswith("conv_")
            assert len(conv_id) == 13  # "conv_" + 8 hex chars
    
    def test_conversation_title_generation(self, temp_storage):
        """Test conversation title generation."""
        storage = temp_storage
        
        # Test normal message
        title = storage.generate_conversation_title("Create a rule for discounts")
        assert title == "Create a rule for discounts"
        
        # Test long message
        long_message = "This is a very long message that should be truncated to 50 characters because it's too long"
        title = storage.generate_conversation_title(long_message)
        assert len(title) <= 53  # 50 chars + "..."
        assert title.endswith("...")
        
        # Test empty message
        title = storage.generate_conversation_title("")
        assert "Conversation" in title
        assert len(title) > 10  # Should include date/time
    
    def test_knowledge_base_storage(self, temp_storage):
        """Test knowledge base storage and loading."""
        storage = temp_storage
        
        # Create test DataFrame
        rag_df = pd.DataFrame({
            "chunk": ["chunk1", "chunk2", "chunk3"],
            "filename": ["file1.pdf", "file2.pdf", "file3.pdf"],
            "embedding": [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]
        })
        
        # Save knowledge base
        success = storage.save_knowledge_base(rag_df)
        assert success
        
        # Load knowledge base
        loaded_df = storage.load_knowledge_base()
        assert isinstance(loaded_df, pd.DataFrame)
        assert len(loaded_df) == 3
        assert list(loaded_df.columns) == ["chunk", "filename", "embedding"]
        
        # Test empty knowledge base
        empty_df = pd.DataFrame()
        success = storage.save_knowledge_base(empty_df)
        assert success
        
        loaded_empty = storage.load_knowledge_base()
        assert isinstance(loaded_empty, pd.DataFrame)
        assert len(loaded_empty) == 0
    
    def test_rules_storage(self, temp_storage):
        """Test rules storage and loading."""
        storage = temp_storage
        
        # Test rules data
        rules = [
            {"rule_id": "R001", "name": "Discount Rule", "description": "10% discount rule"},
            {"rule_id": "R002", "name": "Pricing Rule", "description": "Dynamic pricing rule"}
        ]
        
        # Save rules
        success = storage.save_rules(rules)
        assert success
        
        # Load rules
        loaded_rules = storage.load_rules()
        assert loaded_rules == rules
        
        # Test empty rules
        success = storage.save_rules([])
        assert success
        
        loaded_empty = storage.load_rules()
        assert loaded_empty == []
    
    def test_storage_stats(self, temp_storage):
        """Test storage statistics."""
        storage = temp_storage
        
        # Add some data
        storage.save_conversation("conv1", "Test 1", [["msg", "resp"]])
        storage.save_conversation("conv2", "Test 2", [["msg", "resp"]])
        
        rag_df = pd.DataFrame({"chunk": ["c1", "c2"], "filename": ["f1", "f2"]})
        storage.save_knowledge_base(rag_df)
        
        rules = [{"rule_id": "R001", "name": "Rule 1"}]
        storage.save_rules(rules)
        
        # Get stats
        stats = storage.get_storage_stats()
        
        assert stats["conversation_count"] == 2
        assert stats["knowledge_base_entries"] == 2
        assert stats["rules_count"] == 1
        assert "storage_created" in stats
        assert "last_updated" in stats
        assert stats["last_conversation"] in ["conv1", "conv2"]
    
    def test_json_serialization_error_handling(self, temp_storage):
        """Test error handling in JSON operations."""
        storage = temp_storage
        
        # Test loading from invalid file path - storage should be disabled
        invalid_storage = ConversationStorage(storage_dir="/invalid/nonexistent/path")
        
        # Storage should be disabled
        assert not invalid_storage.storage_enabled
        
        # Should handle errors gracefully
        result = invalid_storage.load_conversation("test")
        assert result is None
        
        # Save operations should fail when storage is disabled
        success = invalid_storage.save_conversation("test", "Test", [])
        assert not success


def test_global_storage_instance():
    """Test global storage instance function."""
    from utils.conversation_storage import get_storage
    
    # Get two instances
    storage1 = get_storage()
    storage2 = get_storage()
    
    # Should be the same instance
    assert storage1 is storage2
    assert isinstance(storage1, ConversationStorage)