"""
Test conversation storage functionality
"""

import os
import shutil
import tempfile
import sys
sys.path.append('..')
from utils.conversation_storage import ConversationStorage


def test_conversation_storage_basic():
    """Test basic conversation storage functionality."""
    # Create temporary directory for testing
    with tempfile.TemporaryDirectory() as tmp_dir:
        storage = ConversationStorage(storage_dir=tmp_dir)
        
        # Test creating a conversation
        conv_id = storage.create_conversation("Test Conversation")
        assert conv_id is not None
        assert len(conv_id) > 0
        
        # Test listing conversations
        conversations = storage.list_conversations()
        assert len(conversations) == 1
        assert conversations[0]["title"] == "Test Conversation"
        assert conversations[0]["id"] == conv_id
        
        # Test saving a message
        success = storage.save_message(
            conv_id, 
            "Hello, how are you?", 
            "I'm doing well, thank you!"
        )
        assert success is True
        
        # Test loading conversation
        conv_data = storage.load_conversation(conv_id)
        assert conv_data is not None
        assert len(conv_data["messages"]) == 1
        assert conv_data["messages"][0]["user"] == "Hello, how are you?"
        assert conv_data["messages"][0]["assistant"] == "I'm doing well, thank you!"
        
        # Test getting messages for Gradio
        gradio_messages = storage.get_conversation_messages_for_gradio(conv_id)
        assert len(gradio_messages) == 1
        assert gradio_messages[0] == ("Hello, how are you?", "I'm doing well, thank you!")
        
        # Test renaming conversation
        success = storage.rename_conversation(conv_id, "Renamed Conversation")
        assert success is True
        
        conversations = storage.list_conversations()
        assert conversations[0]["title"] == "Renamed Conversation"
        
        # Test deleting conversation
        success = storage.delete_conversation(conv_id)
        assert success is True
        
        conversations = storage.list_conversations()
        assert len(conversations) == 0


if __name__ == "__main__":
    test_conversation_storage_basic()
    print("All conversation storage tests passed!")