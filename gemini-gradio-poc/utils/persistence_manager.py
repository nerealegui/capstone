"""Persistence manager for knowledge base and rules data with session management."""

import os
import json
import pickle
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path

# Persistence file paths
PERSISTENCE_DIR = "data/sessions"
KB_FILE = "knowledge_base.pkl"
RULES_FILE = "extracted_rules.json"
CHANGELOG_FILE = "change_log.json"
SESSION_METADATA_FILE = "session_metadata.json"


def ensure_persistence_directory():
    """Ensure the persistence directory exists."""
    Path(PERSISTENCE_DIR).mkdir(parents=True, exist_ok=True)


def get_session_file_path(filename: str) -> str:
    """Get the full path for a session file."""
    return os.path.join(PERSISTENCE_DIR, filename)


def save_knowledge_base(df: pd.DataFrame, description: str = "Knowledge base updated") -> Tuple[bool, str]:
    """
    Save knowledge base DataFrame to persistent storage.
    
    Args:
        df (pd.DataFrame): Knowledge base DataFrame to save
        description (str): Description of the change for logging
        
    Returns:
        Tuple[bool, str]: Success status and message
    """
    try:
        ensure_persistence_directory()
        
        # Save DataFrame using pickle for efficient storage of embeddings
        kb_path = get_session_file_path(KB_FILE)
        with open(kb_path, 'wb') as f:
            pickle.dump(df, f)
        
        # Log the change
        log_change("knowledge_base", description, {
            "chunks_count": len(df),
            "file_path": kb_path
        })
        
        # Update session metadata
        update_session_metadata("knowledge_base_last_updated", datetime.now().isoformat())
        
        return True, f"Knowledge base saved successfully with {len(df)} chunks"
        
    except Exception as e:
        return False, f"Error saving knowledge base: {str(e)}"


def load_knowledge_base() -> Tuple[Optional[pd.DataFrame], str]:
    """
    Load knowledge base DataFrame from persistent storage.
    
    Returns:
        Tuple[Optional[pd.DataFrame], str]: Loaded DataFrame (or None) and status message
    """
    try:
        kb_path = get_session_file_path(KB_FILE)
        
        if not os.path.exists(kb_path):
            return None, "No saved knowledge base found"
        
        with open(kb_path, 'rb') as f:
            df = pickle.load(f)
        
        return df, f"Knowledge base loaded successfully with {len(df)} chunks"
        
    except Exception as e:
        return None, f"Error loading knowledge base: {str(e)}"


def save_rules(rules: List[Dict[str, Any]], description: str = "Rules updated") -> Tuple[bool, str]:
    """
    Save extracted rules to persistent storage.
    
    Args:
        rules (List[Dict[str, Any]]): List of rule dictionaries to save
        description (str): Description of the change for logging
        
    Returns:
        Tuple[bool, str]: Success status and message
    """
    try:
        ensure_persistence_directory()
        
        # Save rules as JSON
        rules_path = get_session_file_path(RULES_FILE)
        with open(rules_path, 'w') as f:
            json.dump(rules, f, indent=2)
        
        # Log the change
        log_change("rules", description, {
            "rules_count": len(rules),
            "file_path": rules_path
        })
        
        # Update session metadata
        update_session_metadata("rules_last_updated", datetime.now().isoformat())
        
        return True, f"Rules saved successfully ({len(rules)} rules)"
        
    except Exception as e:
        return False, f"Error saving rules: {str(e)}"


def load_rules() -> Tuple[Optional[List[Dict[str, Any]]], str]:
    """
    Load extracted rules from persistent storage.
    
    Returns:
        Tuple[Optional[List[Dict]], str]: Loaded rules (or None) and status message
    """
    try:
        rules_path = get_session_file_path(RULES_FILE)
        
        if not os.path.exists(rules_path):
            return None, "No saved rules found"
        
        with open(rules_path, 'r') as f:
            rules = json.load(f)
        
        return rules, f"Rules loaded successfully ({len(rules)} rules)"
        
    except Exception as e:
        return None, f"Error loading rules: {str(e)}"


def log_change(component: str, description: str, metadata: Dict[str, Any] = None) -> bool:
    """
    Log a change to the knowledge base or rules for traceability.
    
    Args:
        component (str): Component that changed ('knowledge_base' or 'rules')
        description (str): Description of the change
        metadata (Dict): Additional metadata about the change
        
    Returns:
        bool: Success status
    """
    try:
        ensure_persistence_directory()
        
        # Load existing changelog
        changelog_path = get_session_file_path(CHANGELOG_FILE)
        if os.path.exists(changelog_path):
            with open(changelog_path, 'r') as f:
                changelog = json.load(f)
        else:
            changelog = []
        
        # Add new entry
        entry = {
            "timestamp": datetime.now().isoformat(),
            "component": component,
            "description": description,
            "metadata": metadata or {}
        }
        changelog.append(entry)
        
        # Save updated changelog
        with open(changelog_path, 'w') as f:
            json.dump(changelog, f, indent=2)
        
        return True
        
    except Exception as e:
        print(f"Error logging change: {e}")
        return False


def get_change_log() -> List[Dict[str, Any]]:
    """
    Get the complete change log for the current session.
    
    Returns:
        List[Dict]: List of change log entries
    """
    try:
        changelog_path = get_session_file_path(CHANGELOG_FILE)
        
        if not os.path.exists(changelog_path):
            return []
        
        with open(changelog_path, 'r') as f:
            return json.load(f)
    
    except Exception as e:
        print(f"Error reading change log: {e}")
        return []


def update_session_metadata(key: str, value: Any) -> bool:
    """
    Update session metadata.
    
    Args:
        key (str): Metadata key
        value (Any): Metadata value
        
    Returns:
        bool: Success status
    """
    try:
        ensure_persistence_directory()
        
        # Load existing metadata
        metadata_path = get_session_file_path(SESSION_METADATA_FILE)
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {
                "session_created": datetime.now().isoformat(),
                "session_id": datetime.now().strftime("%Y%m%d_%H%M%S")
            }
        
        # Update metadata
        metadata[key] = value
        metadata["last_modified"] = datetime.now().isoformat()
        
        # Save metadata
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return True
        
    except Exception as e:
        print(f"Error updating session metadata: {e}")
        return False


def get_session_metadata() -> Dict[str, Any]:
    """
    Get session metadata.
    
    Returns:
        Dict: Session metadata
    """
    try:
        metadata_path = get_session_file_path(SESSION_METADATA_FILE)
        
        if not os.path.exists(metadata_path):
            return {}
        
        with open(metadata_path, 'r') as f:
            return json.load(f)
    
    except Exception as e:
        print(f"Error reading session metadata: {e}")
        return {}


def session_exists() -> bool:
    """
    Check if a session with data exists.
    
    Returns:
        bool: True if session data exists
    """
    kb_path = get_session_file_path(KB_FILE)
    rules_path = get_session_file_path(RULES_FILE)
    
    return os.path.exists(kb_path) or os.path.exists(rules_path)


def clear_session() -> Tuple[bool, str]:
    """
    Clear all session data (knowledge base, rules, logs).
    
    Returns:
        Tuple[bool, str]: Success status and message
    """
    try:
        files_to_remove = [KB_FILE, RULES_FILE, CHANGELOG_FILE, SESSION_METADATA_FILE]
        removed_count = 0
        
        for filename in files_to_remove:
            file_path = get_session_file_path(filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                removed_count += 1
        
        return True, f"Session cleared successfully ({removed_count} files removed)"
        
    except Exception as e:
        return False, f"Error clearing session: {str(e)}"


def get_session_summary() -> str:
    """
    Get a summary of the current session.
    
    Returns:
        str: Formatted session summary
    """
    if not session_exists():
        return "No active session found"
    
    metadata = get_session_metadata()
    kb_df, kb_msg = load_knowledge_base()
    rules, rules_msg = load_rules()
    changelog = get_change_log()
    
    summary_parts = []
    
    # Session info
    if metadata:
        created = metadata.get("session_created", "Unknown")
        session_id = metadata.get("session_id", "Unknown")
        summary_parts.append(f"**Session ID:** {session_id}")
        summary_parts.append(f"**Created:** {created}")
    
    # Knowledge base info
    if kb_df is not None:
        summary_parts.append(f"**Knowledge Base:** {len(kb_df)} chunks")
    else:
        summary_parts.append("**Knowledge Base:** Not loaded")
    
    # Rules info
    if rules is not None:
        summary_parts.append(f"**Rules:** {len(rules)} rules")
    else:
        summary_parts.append("**Rules:** Not loaded")
    
    # Change log info
    summary_parts.append(f"**Changes:** {len(changelog)} logged changes")
    
    return "\n".join(summary_parts)