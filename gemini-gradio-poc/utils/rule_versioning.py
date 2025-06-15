"""
Rule Versioning and Traceability System

This module provides comprehensive rule versioning functionality with improved design:
- Modular class structure with single responsibility principle
- Enhanced error handling and validation 
- Better naming conventions for clarity
- Reduced code duplication through helper methods
- Comprehensive type hints and documentation
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple, Union
from pathlib import Path


class VersionMetadata:
    """
    Encapsulates version metadata for better organization and validation.
    Refactoring improvement: Separate metadata handling from main versioning logic.
    """
    
    def __init__(self, 
                 version: int = 1,
                 change_type: str = "create",
                 change_summary: Optional[str] = None,
                 impact_analysis: Optional[str] = None,
                 user: str = "system",
                 drl_generated: bool = False):
        """
        Initialize version metadata with validation.
        
        Args:
            version: Version number (must be positive integer)
            change_type: Type of change ('create', 'update', 'modify', 'drl_generation', 'impact_analysis')
            change_summary: Brief description of changes
            impact_analysis: Optional impact analysis from Agent 3
            user: User who made the change
            drl_generated: Whether DRL/GDST files were generated
            
        Raises:
            ValueError: If version is not a positive integer or change_type is invalid
        """
        if not isinstance(version, int) or version < 1:
            raise ValueError("Version must be a positive integer")
        
        valid_change_types = {"create", "update", "modify", "drl_generation", "impact_analysis"}
        if change_type not in valid_change_types:
            raise ValueError(f"Change type must be one of: {valid_change_types}")
        
        timestamp = datetime.now().isoformat()
        
        self.version = version
        self.created_at = timestamp
        self.last_modified = timestamp  
        self.change_type = change_type
        self.change_summary = change_summary or f"Rule {change_type}"
        self.impact_analysis = impact_analysis
        self.user = user
        self.drl_generated = drl_generated
        self.drl_generation_timestamp = timestamp if drl_generated else None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert metadata to dictionary format."""
        return {
            "version": self.version,
            "created_at": self.created_at,
            "last_modified": self.last_modified,
            "change_type": self.change_type,
            "change_summary": self.change_summary,
            "impact_analysis": self.impact_analysis,
            "user": self.user,
            "drl_generated": self.drl_generated,
            "drl_generation_timestamp": self.drl_generation_timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VersionMetadata':
        """Create VersionMetadata from dictionary."""
        metadata = cls.__new__(cls)  # Create without calling __init__
        metadata.__dict__.update(data)
        return metadata


class VersionHistoryManager:
    """
    Manages version history persistence with improved error handling.
    Refactoring improvement: Separate history management from core versioning logic.
    """
    
    def __init__(self, storage_path: Union[str, Path] = "data/rule_versions"):
        """
        Initialize history manager with validation.
        
        Args:
            storage_path: Directory path where version history is stored
        """
        self.storage_path = Path(storage_path)
        self._ensure_storage_directory()
    
    def _ensure_storage_directory(self) -> None:
        """Create storage directory if it doesn't exist."""
        try:
            self.storage_path.mkdir(parents=True, exist_ok=True)
        except (OSError, PermissionError) as e:
            raise RuntimeError(f"Failed to create version storage directory: {e}")
    
    def save_version_to_history(self, rule_id: str, rule_data: Dict[str, Any]) -> bool:
        """
        Save a rule version to history with proper error handling.
        
        Args:
            rule_id: The ID of the rule
            rule_data: The rule data to save
            
        Returns:
            True if successful, False otherwise
        """
        if not rule_id:
            print("Warning: Cannot save to history - rule_id is empty")
            return False
        
        history_file = self._get_history_file_path(rule_id)
        
        try:
            # Load existing history or start fresh
            history = self._load_history_from_file(history_file)
            
            # Add current rule to history
            history.append(rule_data.copy())
            
            # Save updated history
            return self._save_history_to_file(history_file, history)
            
        except Exception as e:
            print(f"Error saving rule version to history: {e}")
            return False
    
    def load_history(self, rule_id: str) -> List[Dict[str, Any]]:
        """
        Load version history for a rule with error handling.
        
        Args:
            rule_id: The ID of the rule
            
        Returns:
            List of historical versions, sorted by version number (newest first)
        """
        if not rule_id:
            return []
        
        history_file = self._get_history_file_path(rule_id)
        
        if not history_file.exists():
            return []
        
        try:
            history = self._load_history_from_file(history_file)
            return self._sort_history_by_version(history)
        except Exception as e:
            print(f"Error reading rule history for {rule_id}: {e}")
            return []
    
    def _get_history_file_path(self, rule_id: str) -> Path:
        """Get the file path for a rule's history."""
        return self.storage_path / f"{rule_id}_history.json"
    
    def _load_history_from_file(self, history_file: Path) -> List[Dict[str, Any]]:
        """Load history from JSON file."""
        if not history_file.exists():
            return []
        
        with open(history_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _save_history_to_file(self, history_file: Path, history: List[Dict[str, Any]]) -> bool:
        """Save history to JSON file."""
        try:
            with open(history_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error writing history file {history_file}: {e}")
            return False
    
    def _sort_history_by_version(self, history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sort history by version number (descending)."""
        return sorted(
            history, 
            key=lambda x: x.get("version_info", {}).get("version", 0), 
            reverse=True
        )


class RuleVersionManager:
    """
    Core rule versioning manager with improved modularity and error handling.
    Refactoring improvements:
    - Separated concerns between metadata, history, and core logic
    - Improved error handling and validation
    - Better method naming for clarity
    - Reduced method sizes for better readability
    """
    
    def __init__(self, storage_path: Union[str, Path] = "data/rule_versions"):
        """
        Initialize the rule version manager.
        
        Args:
            storage_path: Directory path where version history is stored
        """
        self.history_manager = VersionHistoryManager(storage_path)
    
    def create_versioned_rule(self, 
                            rule_data: Dict[str, Any], 
                            change_type: str = "create",
                            change_summary: Optional[str] = None, 
                            impact_analysis: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new rule with versioning metadata.
        Refactoring improvement: More descriptive method name and better parameter validation.
        
        Args:
            rule_data: The rule dictionary to add versioning to
            change_type: Type of change
            change_summary: Brief description of the changes made
            impact_analysis: Optional impact analysis from Agent 3
            
        Returns:
            Rule dictionary with versioning metadata added
            
        Raises:
            ValueError: If rule_data is not a dictionary
        """
        if not isinstance(rule_data, dict):
            raise ValueError("Rule data must be a dictionary")
        
        rule_id = rule_data.get("rule_id", "")
        version_number = self._calculate_next_version(rule_id)
        
        try:
            metadata = VersionMetadata(
                version=version_number,
                change_type=change_type,
                change_summary=change_summary,
                impact_analysis=impact_analysis
            )
            
            versioned_rule = rule_data.copy()
            versioned_rule["version_info"] = metadata.to_dict()
            
            return versioned_rule
            
        except Exception as e:
            print(f"Error creating versioned rule: {e}")
            # Return original rule if versioning fails
            return rule_data
    
    def update_rule_version(self, 
                          rule_data: Dict[str, Any], 
                          change_type: str = "update",
                          change_summary: Optional[str] = None,
                          impact_analysis: Optional[str] = None,
                          drl_generated: bool = False) -> Dict[str, Any]:
        """
        Update versioning metadata for an existing rule.
        Refactoring improvement: Better separation of concerns and error handling.
        
        Args:
            rule_data: The rule dictionary to update
            change_type: Type of change made
            change_summary: Brief description of the changes
            impact_analysis: Optional impact analysis
            drl_generated: Whether DRL/GDST files were generated
            
        Returns:
            Updated rule dictionary with new version metadata
        """
        if not isinstance(rule_data, dict):
            print("Warning: Rule data must be a dictionary")
            return rule_data
        
        rule_id = rule_data.get("rule_id", "")
        
        try:
            # Save current version to history before updating
            if "version_info" in rule_data:
                self.history_manager.save_version_to_history(rule_id, rule_data)
            
            # Create new version metadata
            version_number = self._calculate_next_version(rule_id)
            original_created_at = self._extract_original_created_at(rule_data)
            
            metadata = VersionMetadata(
                version=version_number,
                change_type=change_type,
                change_summary=change_summary,
                impact_analysis=impact_analysis,
                drl_generated=drl_generated
            )
            
            # Preserve original creation timestamp
            if original_created_at:
                metadata.created_at = original_created_at
            
            updated_rule = rule_data.copy()
            updated_rule["version_info"] = metadata.to_dict()
            
            return updated_rule
            
        except Exception as e:
            print(f"Error updating rule version: {e}")
            return rule_data
    
    def get_rule_history(self, rule_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve version history for a specific rule.
        
        Args:
            rule_id: The ID of the rule to get history for
            
        Returns:
            List of historical versions, ordered by version number (newest first)
        """
        return self.history_manager.load_history(rule_id)
    
    def get_version_summary(self, rule_id: str) -> Dict[str, Any]:
        """
        Get a comprehensive summary of version information for a rule.
        Refactoring improvement: Better structure and error handling.
        
        Args:
            rule_id: The ID of the rule
            
        Returns:
            Dictionary containing version summary information
        """
        try:
            history = self.get_rule_history(rule_id)
            
            if not history:
                return self._create_empty_version_summary(rule_id)
            
            return self._create_version_summary_from_history(rule_id, history)
            
        except Exception as e:
            print(f"Error creating version summary for {rule_id}: {e}")
            return self._create_empty_version_summary(rule_id)
    
    def _calculate_next_version(self, rule_id: str) -> int:
        """
        Calculate the next version number for a rule.
        Refactoring improvement: Extracted as separate method for clarity.
        
        Args:
            rule_id: The ID of the rule
            
        Returns:
            Next version number (integer)
        """
        try:
            history = self.get_rule_history(rule_id)
            if not history:
                return 1
            
            # Get the highest version number and increment
            max_version = max(
                h.get("version_info", {}).get("version", 0) 
                for h in history
            )
            return max_version + 1
            
        except Exception:
            return 1
    
    def _extract_original_created_at(self, rule_data: Dict[str, Any]) -> Optional[str]:
        """Extract original creation timestamp from rule data."""
        return rule_data.get("version_info", {}).get("created_at")
    
    def _create_empty_version_summary(self, rule_id: str) -> Dict[str, Any]:
        """Create an empty version summary for rules with no history."""
        return {
            "rule_id": rule_id,
            "total_versions": 0,
            "current_version": 0,
            "created_at": None,
            "last_modified": None,
            "change_history": []
        }
    
    def _create_version_summary_from_history(self, rule_id: str, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create version summary from history data."""
        latest = history[0] if history else {}
        version_info = latest.get("version_info", {})
        
        change_history = []
        for version in history:
            v_info = version.get("version_info", {})
            change_history.append({
                "version": v_info.get("version", 0),
                "timestamp": v_info.get("last_modified"),
                "change_type": v_info.get("change_type"),
                "change_summary": v_info.get("change_summary"),
                "drl_generated": v_info.get("drl_generated", False)
            })
        
        return {
            "rule_id": rule_id,
            "total_versions": len(history),
            "current_version": version_info.get("version", 0),
            "created_at": version_info.get("created_at"),
            "last_modified": version_info.get("last_modified"),
            "change_history": change_history
        }


# Convenience functions for external use (maintaining backward compatibility)
# Refactoring improvement: Cleaner function names and better documentation

def create_versioned_rule(rule_data: Dict[str, Any], 
                         change_type: str = "create",
                         change_summary: Optional[str] = None,
                         impact_analysis: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new rule with versioning metadata.
    Convenience function that creates a RuleVersionManager instance.
    
    Args:
        rule_data: The rule data dictionary
        change_type: Type of change ('create', 'update', 'modify')
        change_summary: Brief description of the changes
        impact_analysis: Optional impact analysis
        
    Returns:
        Rule with versioning metadata added
    """
    manager = RuleVersionManager()
    return manager.create_versioned_rule(rule_data, change_type, change_summary, impact_analysis)


def update_rule_version(rule_data: Dict[str, Any], 
                       change_type: str = "update",
                       change_summary: Optional[str] = None,
                       impact_analysis: Optional[str] = None,
                       drl_generated: bool = False) -> Dict[str, Any]:
    """
    Update a rule with new versioning metadata.
    Convenience function that creates a RuleVersionManager instance.
    
    Args:
        rule_data: The rule data dictionary
        change_type: Type of change made
        change_summary: Brief description of the changes
        impact_analysis: Optional impact analysis
        drl_generated: Whether DRL/GDST files were generated
        
    Returns:
        Updated rule with new version metadata
    """
    manager = RuleVersionManager()
    return manager.update_rule_version(rule_data, change_type, change_summary, impact_analysis, drl_generated)


def get_rule_version_history(rule_id: str) -> List[Dict[str, Any]]:
    """
    Get version history for a rule.
    Convenience function for Agent 3 and other components.
    
    Args:
        rule_id: The ID of the rule
        
    Returns:
        List of historical versions
    """
    manager = RuleVersionManager()
    return manager.get_rule_history(rule_id)


def get_rule_version_summary(rule_id: str) -> Dict[str, Any]:
    """
    Get version summary for a rule.
    Convenience function for Agent 3 and other components.
    
    Args:
        rule_id: The ID of the rule
        
    Returns:
        Version summary information
    """
    manager = RuleVersionManager()
    return manager.get_version_summary(rule_id)