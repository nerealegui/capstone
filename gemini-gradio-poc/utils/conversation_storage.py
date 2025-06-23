"""
Conversation Storage Utility

Handles persistence of chat conversations, knowledge base, and rules using local file storage.
This provides localStorage-like functionality for a single-user desktop application.
"""

import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path


class ConversationStorage:
    """Manages conversation persistence using local JSON files."""
    
    def __init__(self, storage_dir: str = "conversations"):
        """
        Initialize conversation storage.
        
        Args:
            storage_dir: Directory to store conversation files
        """
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(exist_ok=True)
        
        # File paths for different data types
        self.conversations_index_file = self.storage_dir / "conversations_index.json"
        self.conversations_dir = self.storage_dir / "chats"
        self.conversations_dir.mkdir(exist_ok=True)
    
    def _load_conversations_index(self) -> Dict[str, Any]:
        """Load the conversations index file."""
        if self.conversations_index_file.exists():
            try:
                with open(self.conversations_index_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                pass
        return {"conversations": []}
    
    def _save_conversations_index(self, index_data: Dict[str, Any]):
        """Save the conversations index file."""
        with open(self.conversations_index_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)
    
    def create_conversation(self, title: str = None) -> str:
        """
        Create a new conversation.
        
        Args:
            title: Optional conversation title. If None, generates from timestamp.
            
        Returns:
            str: Unique conversation ID
        """
        conversation_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        if title is None:
            title = f"Conversation {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        # Create conversation metadata
        conversation_meta = {
            "id": conversation_id,
            "title": title,
            "created_at": timestamp,
            "updated_at": timestamp,
            "message_count": 0,
            "preview": ""
        }
        
        # Create empty conversation data
        conversation_data = {
            "metadata": conversation_meta,
            "messages": [],
            "rag_state": None,
            "industry": "generic"
        }
        
        # Save conversation file
        conversation_file = self.conversations_dir / f"{conversation_id}.json"
        with open(conversation_file, 'w', encoding='utf-8') as f:
            json.dump(conversation_data, f, indent=2, ensure_ascii=False)
        
        # Update index
        index_data = self._load_conversations_index()
        index_data["conversations"].append(conversation_meta)
        self._save_conversations_index(index_data)
        
        return conversation_id
    
    def save_message(self, conversation_id: str, user_message: str, assistant_message: str,
                    rag_state: Any = None, industry: str = "generic") -> bool:
        """
        Save a message pair to a conversation.
        
        Args:
            conversation_id: ID of the conversation
            user_message: User's message
            assistant_message: Assistant's response
            rag_state: Current RAG state (if any)
            industry: Industry context
            
        Returns:
            bool: True if saved successfully
        """
        try:
            conversation_file = self.conversations_dir / f"{conversation_id}.json"
            
            if not conversation_file.exists():
                return False
            
            # Load existing conversation
            with open(conversation_file, 'r', encoding='utf-8') as f:
                conversation_data = json.load(f)
            
            # Add new message
            timestamp = datetime.now().isoformat()
            message_entry = {
                "timestamp": timestamp,
                "user": user_message,
                "assistant": assistant_message
            }
            
            conversation_data["messages"].append(message_entry)
            conversation_data["industry"] = industry
            
            # Update metadata
            conversation_data["metadata"]["updated_at"] = timestamp
            conversation_data["metadata"]["message_count"] = len(conversation_data["messages"])
            conversation_data["metadata"]["preview"] = user_message[:100] + "..." if len(user_message) > 100 else user_message
            
            # Save RAG state if provided (convert to serializable format)
            if rag_state is not None:
                try:
                    # Convert pandas DataFrame to dict if needed
                    if hasattr(rag_state, 'to_dict'):
                        conversation_data["rag_state"] = rag_state.to_dict('records')
                    else:
                        conversation_data["rag_state"] = rag_state
                except Exception:
                    # If serialization fails, skip RAG state
                    pass
            
            # Save conversation
            with open(conversation_file, 'w', encoding='utf-8') as f:
                json.dump(conversation_data, f, indent=2, ensure_ascii=False)
            
            # Update index
            index_data = self._load_conversations_index()
            for conv in index_data["conversations"]:
                if conv["id"] == conversation_id:
                    conv.update(conversation_data["metadata"])
                    break
            self._save_conversations_index(index_data)
            
            return True
            
        except Exception as e:
            print(f"Error saving message: {e}")
            return False
    
    def load_conversation(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """
        Load a conversation by ID.
        
        Args:
            conversation_id: ID of the conversation to load
            
        Returns:
            Dict containing conversation data or None if not found
        """
        try:
            conversation_file = self.conversations_dir / f"{conversation_id}.json"
            
            if not conversation_file.exists():
                return None
            
            with open(conversation_file, 'r', encoding='utf-8') as f:
                return json.load(f)
                
        except Exception as e:
            print(f"Error loading conversation: {e}")
            return None
    
    def list_conversations(self) -> List[Dict[str, Any]]:
        """
        Get list of all conversations, sorted by most recent first.
        
        Returns:
            List of conversation metadata dictionaries
        """
        index_data = self._load_conversations_index()
        conversations = index_data.get("conversations", [])
        
        # Sort by updated_at, most recent first
        conversations.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        
        return conversations
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """
        Delete a conversation.
        
        Args:
            conversation_id: ID of the conversation to delete
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            # Remove conversation file
            conversation_file = self.conversations_dir / f"{conversation_id}.json"
            if conversation_file.exists():
                conversation_file.unlink()
            
            # Update index
            index_data = self._load_conversations_index()
            index_data["conversations"] = [
                conv for conv in index_data["conversations"] 
                if conv["id"] != conversation_id
            ]
            self._save_conversations_index(index_data)
            
            return True
            
        except Exception as e:
            print(f"Error deleting conversation: {e}")
            return False
    
    def rename_conversation(self, conversation_id: str, new_title: str) -> bool:
        """
        Rename a conversation.
        
        Args:
            conversation_id: ID of the conversation to rename
            new_title: New title for the conversation
            
        Returns:
            bool: True if renamed successfully
        """
        try:
            # Update conversation file
            conversation_file = self.conversations_dir / f"{conversation_id}.json"
            if not conversation_file.exists():
                return False
            
            with open(conversation_file, 'r', encoding='utf-8') as f:
                conversation_data = json.load(f)
            
            conversation_data["metadata"]["title"] = new_title
            conversation_data["metadata"]["updated_at"] = datetime.now().isoformat()
            
            with open(conversation_file, 'w', encoding='utf-8') as f:
                json.dump(conversation_data, f, indent=2, ensure_ascii=False)
            
            # Update index
            index_data = self._load_conversations_index()
            for conv in index_data["conversations"]:
                if conv["id"] == conversation_id:
                    conv["title"] = new_title
                    conv["updated_at"] = conversation_data["metadata"]["updated_at"]
                    break
            self._save_conversations_index(index_data)
            
            return True
            
        except Exception as e:
            print(f"Error renaming conversation: {e}")
            return False
    
    def get_conversation_messages_for_gradio(self, conversation_id: str) -> List[Tuple[str, str]]:
        """
        Get conversation messages in Gradio ChatInterface format.
        
        Args:
            conversation_id: ID of the conversation
            
        Returns:
            List of (user_message, assistant_message) tuples
        """
        conversation_data = self.load_conversation(conversation_id)
        if not conversation_data:
            return []
        
        messages = []
        for msg in conversation_data.get("messages", []):
            messages.append((msg["user"], msg["assistant"]))
        
        return messages


# Global instance for use throughout the application
conversation_storage = ConversationStorage()