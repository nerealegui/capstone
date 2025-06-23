"""
Simple test of conversation storage integration without full dependencies
"""

import sys
import os
import tempfile
sys.path.append('.')

def test_storage_integration():
    """Test conversation storage integration works."""
    print("Testing conversation storage integration...")
    
    # Test basic import
    try:
        from utils.conversation_storage import conversation_storage
        print("✓ Successfully imported conversation_storage")
    except Exception as e:
        print(f"✗ Failed to import conversation_storage: {e}")
        return False
    
    # Test creating conversation
    try:
        conv_id = conversation_storage.create_conversation("Test Integration")
        print(f"✓ Created conversation with ID: {conv_id}")
    except Exception as e:
        print(f"✗ Failed to create conversation: {e}")
        return False
    
    # Test saving message
    try:
        success = conversation_storage.save_message(
            conv_id, 
            "Hello test", 
            "Hello response", 
            None, 
            "test"
        )
        print(f"✓ Saved message: {success}")
    except Exception as e:
        print(f"✗ Failed to save message: {e}")
        return False
    
    # Test listing conversations
    try:
        conversations = conversation_storage.list_conversations()
        print(f"✓ Listed {len(conversations)} conversations")
    except Exception as e:
        print(f"✗ Failed to list conversations: {e}")
        return False
    
    # Test loading conversation
    try:
        conv_data = conversation_storage.load_conversation(conv_id)
        print(f"✓ Loaded conversation with {len(conv_data['messages'])} messages")
    except Exception as e:
        print(f"✗ Failed to load conversation: {e}")
        return False
    
    print("✓ All conversation storage integration tests passed!")
    return True

if __name__ == "__main__":
    success = test_storage_integration()
    if success:
        print("\n✓ Conversation storage is ready for integration")
    else:
        print("\n✗ Conversation storage integration has issues")