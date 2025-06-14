"""
Rule Versioning and Traceability System

This module provides comprehensive rule versioning functionality including:
- Version tracking for rule changes
- Historical record maintenance
- Impact analysis storage
- Metadata management for rule modifications
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path

class RuleVersionManager:
    """
    Manages rule versioning, history tracking, and metadata for business rules.
    """
    
    def __init__(self, version_storage_path: str = "data/rule_versions"):
        """
        Initialize the rule version manager.
        
        Args:
            version_storage_path: Directory path where version history is stored
        """
        self.version_storage_path = Path(version_storage_path)
        self.version_storage_path.mkdir(parents=True, exist_ok=True)
    
    def add_version_metadata(self, rule: Dict[str, Any], change_type: str = "create", 
                           change_summary: Optional[str] = None, 
                           impact_analysis: Optional[str] = None) -> Dict[str, Any]:
        """
        Add versioning metadata to a rule.
        
        Args:
            rule: The rule dictionary to add versioning to
            change_type: Type of change ('create', 'update', 'modify')
            change_summary: Brief description of the changes made
            impact_analysis: Optional impact analysis from Agent 3
            
        Returns:
            Rule dictionary with versioning metadata added
        """
        rule_id = rule.get("rule_id", "")
        current_version = self._get_next_version_number(rule_id)
        timestamp = datetime.now().isoformat()
        
        # Add version metadata to the rule
        rule["version_info"] = {
            "version": current_version,
            "created_at": timestamp,
            "last_modified": timestamp,
            "change_type": change_type,
            "change_summary": change_summary or f"Rule {change_type}",
            "impact_analysis": impact_analysis,
            "user": "system",  # MVP: no user data
            "drl_generated": False,  # Track if DRL/GDST files were generated
            "drl_generation_timestamp": None
        }
        
        return rule
    
    def update_version_metadata(self, rule: Dict[str, Any], change_type: str = "update",
                               change_summary: Optional[str] = None,
                               impact_analysis: Optional[str] = None,
                               drl_generated: bool = False) -> Dict[str, Any]:
        """
        Update versioning metadata for an existing rule.
        
        Args:
            rule: The rule dictionary to update
            change_type: Type of change made
            change_summary: Brief description of the changes
            impact_analysis: Optional impact analysis
            drl_generated: Whether DRL/GDST files were generated
            
        Returns:
            Updated rule dictionary with new version metadata
        """
        rule_id = rule.get("rule_id", "")
        
        # Save current version to history before updating
        if "version_info" in rule:
            self._save_version_to_history(rule_id, rule)
        
        # Create new version
        current_version = self._get_next_version_number(rule_id)
        timestamp = datetime.now().isoformat()
        
        # Update version metadata
        rule["version_info"] = {
            "version": current_version,
            "created_at": rule.get("version_info", {}).get("created_at", timestamp),
            "last_modified": timestamp,
            "change_type": change_type,
            "change_summary": change_summary or f"Rule {change_type}",
            "impact_analysis": impact_analysis,
            "user": "system",  # MVP: no user data
            "drl_generated": drl_generated,
            "drl_generation_timestamp": timestamp if drl_generated else None
        }
        
        return rule
    
    def get_rule_history(self, rule_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve version history for a specific rule.
        
        Args:
            rule_id: The ID of the rule to get history for
            
        Returns:
            List of historical versions, ordered by version number (newest first)
        """
        history_file = self.version_storage_path / f"{rule_id}_history.json"
        
        if not history_file.exists():
            return []
        
        try:
            with open(history_file, 'r') as f:
                history = json.load(f)
            # Sort by version number (descending)
            return sorted(history, key=lambda x: x.get("version_info", {}).get("version", 0), reverse=True)
        except Exception as e:
            print(f"Error reading rule history for {rule_id}: {e}")
            return []
    
    def get_version_summary(self, rule_id: str) -> Dict[str, Any]:
        """
        Get a summary of version information for a rule.
        
        Args:
            rule_id: The ID of the rule
            
        Returns:
            Dictionary containing version summary information
        """
        history = self.get_rule_history(rule_id)
        
        if not history:
            return {
                "rule_id": rule_id,
                "total_versions": 0,
                "current_version": 0,
                "created_at": None,
                "last_modified": None,
                "change_history": []
            }
        
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
    
    def _get_next_version_number(self, rule_id: str) -> int:
        """
        Get the next version number for a rule.
        
        Args:
            rule_id: The ID of the rule
            
        Returns:
            Next version number (integer)
        """
        history = self.get_rule_history(rule_id)
        if not history:
            return 1
        
        # Get the highest version number and increment
        max_version = max(h.get("version_info", {}).get("version", 0) for h in history)
        return max_version + 1
    
    def _save_version_to_history(self, rule_id: str, rule: Dict[str, Any]) -> bool:
        """
        Save a rule version to the history file.
        
        Args:
            rule_id: The ID of the rule
            rule: The rule data to save
            
        Returns:
            True if successful, False otherwise
        """
        history_file = self.version_storage_path / f"{rule_id}_history.json"
        
        try:
            # Load existing history
            history = []
            if history_file.exists():
                with open(history_file, 'r') as f:
                    history = json.load(f)
            
            # Add current rule to history
            history.append(rule.copy())
            
            # Save updated history
            with open(history_file, 'w') as f:
                json.dump(history, f, indent=2)
            
            return True
        except Exception as e:
            print(f"Error saving rule version to history: {e}")
            return False

def create_versioned_rule(rule_data: Dict[str, Any], change_type: str = "create",
                         change_summary: Optional[str] = None,
                         impact_analysis: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new rule with versioning metadata.
    
    Args:
        rule_data: The rule data dictionary
        change_type: Type of change ('create', 'update', 'modify')
        change_summary: Brief description of the changes
        impact_analysis: Optional impact analysis
        
    Returns:
        Rule with versioning metadata added
    """
    version_manager = RuleVersionManager()
    return version_manager.add_version_metadata(
        rule_data, change_type, change_summary, impact_analysis
    )
    
def update_rule_version(rule_data: Dict[str, Any], change_type: str = "update",
                       change_summary: Optional[str] = None,
                       impact_analysis: Optional[str] = None,
                       drl_generated: bool = False) -> Dict[str, Any]:
    """
    Update a rule with new versioning metadata.
    
    Args:
        rule_data: The rule data dictionary
        change_type: Type of change made
        change_summary: Brief description of the changes
        impact_analysis: Optional impact analysis
        drl_generated: Whether DRL/GDST files were generated
        
    Returns:
        Updated rule with new version metadata
    """
    version_manager = RuleVersionManager()
    return version_manager.update_version_metadata(
        rule_data, change_type, change_summary, impact_analysis, drl_generated
    )

def get_rule_version_history(rule_id: str) -> List[Dict[str, Any]]:
    """
    Get version history for a rule (convenience function for Agent 3).
    
    Args:
        rule_id: The ID of the rule
        
    Returns:
        List of historical versions
    """
    version_manager = RuleVersionManager()
    return version_manager.get_rule_history(rule_id)

def get_rule_version_summary(rule_id: str) -> Dict[str, Any]:
    """
    Get version summary for a rule (convenience function for Agent 3).
    
    Args:
        rule_id: The ID of the rule
        
    Returns:
        Version summary information
    """
    version_manager = RuleVersionManager()
    return version_manager.get_version_summary(rule_id)