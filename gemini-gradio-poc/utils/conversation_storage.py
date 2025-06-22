"""
Conversation Storage Manager - LocalStorage-like functionality for conversation persistence.

This module provides localStorage-like functionality using JSON files to persist:
- Conversation history and metadata
- Knowledge base entries
- Business rules
- User preferences

Designed for single-user MVP use with easy migration path to real localStorage/cloud storage.
"""

import json
import os
import uuid
import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import pandas as pd


class ConversationStorage:
    """Manages persistent storage for conversations, knowledge base, and rules."""
    
    def __init__(self, storage_dir: str = "data/local_storage"):
        """
        Initialize storage manager.
        
        Args:
            storage_dir: Directory for storing JSON files (simulates localStorage)
        """
        self.storage_dir = Path(storage_dir)
        self.storage_enabled = True
        
        try:
            self.storage_dir.mkdir(parents=True, exist_ok=True)
        except (PermissionError, OSError) as e:
            print(f"Warning: Could not create storage directory {storage_dir}: {e}")
            self.storage_enabled = False
        
        # Storage file paths
        self.conversations_file = self.storage_dir / "conversations.json"
        self.knowledge_base_file = self.storage_dir / "knowledge_base.json"
        self.rules_file = self.storage_dir / "rules.json"
        self.metadata_file = self.storage_dir / "metadata.json"
        
        # Initialize files if they don't exist and storage is enabled
        if self.storage_enabled:
            self._initialize_storage()
    
    def _initialize_storage(self):
        """Initialize storage files with empty structures."""
        default_data = {
            "conversations": {},
            "knowledge_base": [],
            "rules": [],
            "metadata": {
                "last_conversation_id": None,
                "conversation_count": 0,
                "created_at": datetime.datetime.now().isoformat()
            }
        }
        
        for file_path, key in [
            (self.conversations_file, "conversations"),
            (self.knowledge_base_file, "knowledge_base"),
            (self.rules_file, "rules"),
            (self.metadata_file, "metadata")
        ]:
            if not file_path.exists():
                with open(file_path, 'w') as f:
                    json.dump(default_data[key], f, indent=2)
    
    # Conversation Management
    def save_conversation(self, conversation_id: str, title: str, history: List, 
                         rag_state_df: pd.DataFrame = None, metadata: Dict = None) -> bool:
        """
        Save a conversation with its history and metadata.
        
        Args:
            conversation_id: Unique identifier for the conversation
            title: Display title for the conversation
            history: Chat history (list of message pairs)
            rag_state_df: Knowledge base state dataframe
            metadata: Additional metadata (industry, mode, etc.)
            
        Returns:
            bool: Success status
        """
        if not self.storage_enabled:
            return False
            
        try:
            conversations = self._load_json(self.conversations_file)
            
            conversation_data = {
                "id": conversation_id,
                "title": title,
                "history": history,
                "rag_state": rag_state_df.to_dict() if rag_state_df is not None else {},
                "metadata": metadata or {},
                "created_at": conversations.get(conversation_id, {}).get("created_at", datetime.datetime.now().isoformat()),
                "updated_at": datetime.datetime.now().isoformat(),
                "message_count": len(history) if history else 0
            }
            
            conversations[conversation_id] = conversation_data
            self._save_json(self.conversations_file, conversations)
            
            # Update metadata
            self._update_metadata(last_conversation_id=conversation_id)
            
            return True
        except Exception as e:
            print(f"Error saving conversation: {e}")
            return False
    
    def load_conversation(self, conversation_id: str) -> Optional[Dict]:
        """
        Load a conversation by ID.
        
        Args:
            conversation_id: Unique identifier for the conversation
            
        Returns:
            Dict with conversation data or None if not found
        """
        try:
            conversations = self._load_json(self.conversations_file)
            conversation = conversations.get(conversation_id)
            
            if conversation and "rag_state" in conversation:
                # Convert rag_state back to DataFrame
                rag_dict = conversation["rag_state"]
                if rag_dict:
                    conversation["rag_state_df"] = pd.DataFrame.from_dict(rag_dict)
                else:
                    conversation["rag_state_df"] = pd.DataFrame()
            
            return conversation
        except Exception as e:
            print(f"Error loading conversation: {e}")
            return None
    
    def list_conversations(self) -> List[Dict]:
        """
        Get list of all conversations with summary info.
        
        Returns:
            List of conversation summaries
        """
        try:
            conversations = self._load_json(self.conversations_file)
            
            conversation_list = []
            for conv_id, conv_data in conversations.items():
                summary = {
                    "id": conv_id,
                    "title": conv_data.get("title", "Untitled Conversation"),
                    "created_at": conv_data.get("created_at"),
                    "updated_at": conv_data.get("updated_at"),
                    "message_count": conv_data.get("message_count", 0),
                    "industry": conv_data.get("metadata", {}).get("industry", "generic"),
                    "mode": conv_data.get("metadata", {}).get("mode", "Enhanced Agent 3")
                }
                conversation_list.append(summary)
            
            # Sort by updated_at (most recent first)
            conversation_list.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
            return conversation_list
            
        except Exception as e:
            print(f"Error listing conversations: {e}")
            return []
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """
        Delete a conversation.
        
        Args:
            conversation_id: Unique identifier for the conversation
            
        Returns:
            bool: Success status
        """
        try:
            conversations = self._load_json(self.conversations_file)
            if conversation_id in conversations:
                del conversations[conversation_id]
                self._save_json(self.conversations_file, conversations)
                return True
            return False
        except Exception as e:
            print(f"Error deleting conversation: {e}")
            return False
    
    def rename_conversation(self, conversation_id: str, new_title: str) -> bool:
        """
        Rename a conversation.
        
        Args:
            conversation_id: Unique identifier for the conversation
            new_title: New title for the conversation
            
        Returns:
            bool: Success status
        """
        try:
            conversations = self._load_json(self.conversations_file)
            if conversation_id in conversations:
                conversations[conversation_id]["title"] = new_title
                conversations[conversation_id]["updated_at"] = datetime.datetime.now().isoformat()
                self._save_json(self.conversations_file, conversations)
                return True
            return False
        except Exception as e:
            print(f"Error renaming conversation: {e}")
            return False
    
    def create_new_conversation_id(self) -> str:
        """Generate a new unique conversation ID."""
        return f"conv_{uuid.uuid4().hex[:8]}"
    
    def generate_conversation_title(self, first_message: str) -> str:
        """
        Generate a conversation title from the first message.
        
        Args:
            first_message: First user message in the conversation
            
        Returns:
            str: Generated title
        """
        if not first_message:
            return f"Conversation {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        # Take first 50 chars and clean up
        title = first_message[:50].strip()
        if len(first_message) > 50:
            title += "..."
        
        # Remove newlines and excessive whitespace
        title = " ".join(title.split())
        
        return title
    
    # Knowledge Base Management
    def save_knowledge_base(self, rag_df: pd.DataFrame) -> bool:
        """
        Save knowledge base data.
        
        Args:
            rag_df: Knowledge base DataFrame
            
        Returns:
            bool: Success status
        """
        try:
            kb_data = {
                "data": rag_df.to_dict() if rag_df is not None and not rag_df.empty else {},
                "updated_at": datetime.datetime.now().isoformat(),
                "entry_count": len(rag_df) if rag_df is not None else 0
            }
            self._save_json(self.knowledge_base_file, kb_data)
            return True
        except Exception as e:
            print(f"Error saving knowledge base: {e}")
            return False
    
    def load_knowledge_base(self) -> pd.DataFrame:
        """
        Load knowledge base data.
        
        Returns:
            pd.DataFrame: Knowledge base data
        """
        try:
            kb_data = self._load_json(self.knowledge_base_file)
            if kb_data and "data" in kb_data and kb_data["data"]:
                return pd.DataFrame.from_dict(kb_data["data"])
            return pd.DataFrame()
        except Exception as e:
            print(f"Error loading knowledge base: {e}")
            return pd.DataFrame()
    
    # Rules Management
    def save_rules(self, rules: List[Dict]) -> bool:
        """
        Save business rules data.
        
        Args:
            rules: List of rule dictionaries
            
        Returns:
            bool: Success status
        """
        try:
            rules_data = {
                "rules": rules,
                "updated_at": datetime.datetime.now().isoformat(),
                "rule_count": len(rules)
            }
            self._save_json(self.rules_file, rules_data)
            return True
        except Exception as e:
            print(f"Error saving rules: {e}")
            return False
    
    def load_rules(self) -> List[Dict]:
        """
        Load business rules data.
        
        Returns:
            List[Dict]: List of rules
        """
        try:
            rules_data = self._load_json(self.rules_file)
            return rules_data.get("rules", []) if rules_data else []
        except Exception as e:
            print(f"Error loading rules: {e}")
            return []
    
    # Utility Methods
    def _load_json(self, file_path: Path) -> Dict:
        """Load JSON data from file."""
        try:
            if file_path.exists():
                with open(file_path, 'r') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            return {}
    
    def _save_json(self, file_path: Path, data: Any) -> bool:
        """Save data to JSON file."""
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)  # default=str handles datetime objects
            return True
        except Exception as e:
            print(f"Error saving {file_path}: {e}")
            return False
    
    def _update_metadata(self, **kwargs):
        """Update metadata file."""
        try:
            metadata = self._load_json(self.metadata_file)
            metadata.update(kwargs)
            metadata["updated_at"] = datetime.datetime.now().isoformat()
            
            # Update conversation count
            if "last_conversation_id" in kwargs:
                conversations = self._load_json(self.conversations_file)
                metadata["conversation_count"] = len(conversations)
            
            self._save_json(self.metadata_file, metadata)
        except Exception as e:
            print(f"Error updating metadata: {e}")
    
    def get_storage_stats(self) -> Dict:
        """Get storage statistics."""
        try:
            conversations = self._load_json(self.conversations_file)
            kb_data = self._load_json(self.knowledge_base_file)
            rules_data = self._load_json(self.rules_file)
            metadata = self._load_json(self.metadata_file)
            
            return {
                "conversation_count": len(conversations),
                "knowledge_base_entries": kb_data.get("entry_count", 0),
                "rules_count": rules_data.get("rule_count", 0),
                "storage_created": metadata.get("created_at"),
                "last_updated": metadata.get("updated_at"),
                "last_conversation": metadata.get("last_conversation_id")
            }
        except Exception as e:
            print(f"Error getting storage stats: {e}")
            return {}


# Global storage instance
_storage_instance = None

def get_storage() -> ConversationStorage:
    """Get the global storage instance."""
    global _storage_instance
    if _storage_instance is None:
        _storage_instance = ConversationStorage()
    return _storage_instance