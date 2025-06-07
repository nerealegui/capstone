"""
Test suite for rule versioning functionality.
Tests the RuleVersionManager class and related versioning utilities.
"""

import pytest
import json
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from unittest.mock import patch, mock_open

from utils.rule_versioning import (
    RuleVersionManager,
    create_versioned_rule,
    update_rule_version,
    get_rule_version_history,
    get_rule_version_summary
)

class TestRuleVersionManager:
    """Test the RuleVersionManager class."""
    
    def setup_method(self):
        """Set up test environment."""
        self.temp_dir = tempfile.mkdtemp()
        self.version_manager = RuleVersionManager(self.temp_dir)
        
        self.sample_rule = {
            "rule_id": "TEST001",
            "name": "Test Rule",
            "category": "Testing",
            "description": "A test rule for versioning",
            "conditions": [{"field": "test", "operator": "equals", "value": "true"}],
            "actions": [{"type": "test_action", "details": "test"}],
            "priority": "Medium",
            "active": True
        }
    
    def teardown_method(self):
        """Clean up test environment."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_add_version_metadata(self):
        """Test adding version metadata to a rule."""
        versioned_rule = self.version_manager.add_version_metadata(
            self.sample_rule.copy(),
            change_type="create",
            change_summary="Initial rule creation",
            impact_analysis="Low impact - new rule"
        )
        
        assert "version_info" in versioned_rule
        version_info = versioned_rule["version_info"]
        
        assert version_info["version"] == 1
        assert version_info["change_type"] == "create"
        assert version_info["change_summary"] == "Initial rule creation"
        assert version_info["impact_analysis"] == "Low impact - new rule"
        assert version_info["user"] == "system"
        assert version_info["drl_generated"] is False
        assert version_info["drl_generation_timestamp"] is None
        
        # Check timestamp format
        assert isinstance(version_info["created_at"], str)
        assert isinstance(version_info["last_modified"], str)
    
    def test_update_version_metadata(self):
        """Test updating version metadata for an existing rule."""
        # First create a versioned rule
        versioned_rule = self.version_manager.add_version_metadata(
            self.sample_rule.copy()
        )
        
        # Then update it
        updated_rule = self.version_manager.update_version_metadata(
            versioned_rule,
            change_type="update",
            change_summary="Updated rule conditions",
            impact_analysis="Medium impact - condition changes",
            drl_generated=True
        )
        
        version_info = updated_rule["version_info"]
        assert version_info["version"] == 2
        assert version_info["change_type"] == "update"
        assert version_info["change_summary"] == "Updated rule conditions"
        assert version_info["impact_analysis"] == "Medium impact - condition changes"
        assert version_info["drl_generated"] is True
        assert version_info["drl_generation_timestamp"] is not None
    
    def test_get_next_version_number(self):
        """Test version number increment."""
        rule_id = "TEST001"
        
        # No history should return version 1
        assert self.version_manager._get_next_version_number(rule_id) == 1
        
        # Create a mock history file
        history_file = Path(self.temp_dir) / f"{rule_id}_history.json"
        mock_history = [
            {"version_info": {"version": 1}},
            {"version_info": {"version": 2}},
            {"version_info": {"version": 3}}
        ]
        with open(history_file, 'w') as f:
            json.dump(mock_history, f)
        
        # Should return 4 (next version)
        assert self.version_manager._get_next_version_number(rule_id) == 4
    
    def test_save_version_to_history(self):
        """Test saving a version to history."""
        rule_id = "TEST001"
        versioned_rule = self.version_manager.add_version_metadata(
            self.sample_rule.copy()
        )
        
        success = self.version_manager._save_version_to_history(rule_id, versioned_rule)
        assert success is True
        
        # Check if history file was created
        history_file = Path(self.temp_dir) / f"{rule_id}_history.json"
        assert history_file.exists()
        
        # Check history content
        with open(history_file, 'r') as f:
            history = json.load(f)
        
        assert len(history) == 1
        assert history[0]["rule_id"] == rule_id
    
    def test_get_rule_history(self):
        """Test retrieving rule history."""
        rule_id = "TEST001"
        
        # No history initially
        history = self.version_manager.get_rule_history(rule_id)
        assert history == []
        
        # Create versions
        rule1 = self.version_manager.add_version_metadata(self.sample_rule.copy())
        # Note: update_version_metadata automatically saves the current version to history
        rule2 = self.version_manager.update_version_metadata(rule1)
        
        # Get history
        history = self.version_manager.get_rule_history(rule_id)
        assert len(history) == 1  # Only the first version should be in history
        
        # Should contain the previous version (version 1)
        assert history[0]["version_info"]["version"] == 1
    
    def test_get_version_summary(self):
        """Test getting version summary."""
        rule_id = "TEST001"
        
        # No history
        summary = self.version_manager.get_version_summary(rule_id)
        assert summary["total_versions"] == 0
        assert summary["current_version"] == 0
        
        # Create version history
        rule1 = self.version_manager.add_version_metadata(self.sample_rule.copy())
        # update_version_metadata saves the previous version to history automatically
        rule2 = self.version_manager.update_version_metadata(rule1, drl_generated=True)
        
        summary = self.version_manager.get_version_summary(rule_id)
        assert summary["total_versions"] == 1  # Only the previous version is in history
        assert summary["current_version"] == 1  # Latest version from history
        assert summary["rule_id"] == rule_id
        assert len(summary["change_history"]) == 1


class TestVersioningUtilityFunctions:
    """Test utility functions for versioning."""
    
    def test_create_versioned_rule(self):
        """Test creating a versioned rule."""
        sample_rule = {
            "rule_id": "TEST002",
            "name": "Test Rule 2",
            "category": "Testing"
        }
        
        versioned_rule = create_versioned_rule(
            sample_rule,
            change_type="create",
            change_summary="Test rule creation"
        )
        
        assert "version_info" in versioned_rule
        assert versioned_rule["version_info"]["version"] == 1
        assert versioned_rule["version_info"]["change_type"] == "create"
        assert versioned_rule["version_info"]["change_summary"] == "Test rule creation"
    
    def test_update_rule_version(self):
        """Test updating rule version."""
        # Create initial versioned rule
        sample_rule = {
            "rule_id": "TEST003",
            "name": "Test Rule 3",
            "category": "Testing",
            "version_info": {
                "version": 1,
                "created_at": "2025-01-01T00:00:00",
                "last_modified": "2025-01-01T00:00:00",
                "change_type": "create",
                "change_summary": "Initial creation",
                "user": "system",
                "drl_generated": False
            }
        }
        
        updated_rule = update_rule_version(
            sample_rule,
            change_type="update",
            change_summary="Rule updated",
            drl_generated=True
        )
        
        version_info = updated_rule["version_info"]
        assert version_info["version"] == 2
        assert version_info["change_type"] == "update"
        assert version_info["change_summary"] == "Rule updated"
        assert version_info["drl_generated"] is True
        assert version_info["created_at"] == "2025-01-01T00:00:00"  # Should preserve original
    
    @patch('utils.rule_versioning.RuleVersionManager')
    def test_get_rule_version_history(self, mock_manager_class):
        """Test getting rule version history via utility function."""
        mock_manager = mock_manager_class.return_value
        mock_manager.get_rule_history.return_value = [{"version": 1}]
        
        result = get_rule_version_history("TEST004")
        
        mock_manager_class.assert_called_once()
        mock_manager.get_rule_history.assert_called_once_with("TEST004")
        assert result == [{"version": 1}]
    
    @patch('utils.rule_versioning.RuleVersionManager')
    def test_get_rule_version_summary(self, mock_manager_class):
        """Test getting rule version summary via utility function."""
        mock_manager = mock_manager_class.return_value
        mock_manager.get_version_summary.return_value = {"total_versions": 1}
        
        result = get_rule_version_summary("TEST005")
        
        mock_manager_class.assert_called_once()
        mock_manager.get_version_summary.assert_called_once_with("TEST005")
        assert result == {"total_versions": 1}


class TestVersioningIntegration:
    """Test integration between versioning and other components."""
    
    def setup_method(self):
        """Set up test environment."""
        self.temp_dir = tempfile.mkdtemp()
    
    def teardown_method(self):
        """Clean up test environment."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_version_metadata_structure(self):
        """Test that version metadata has the correct structure."""
        rule = {
            "rule_id": "STRUCTURE_TEST",
            "name": "Structure Test Rule"
        }
        
        versioned_rule = create_versioned_rule(rule, "create", "Test creation")
        version_info = versioned_rule["version_info"]
        
        # Check all required fields are present
        required_fields = [
            "version", "created_at", "last_modified", "change_type",
            "change_summary", "impact_analysis", "user", "drl_generated",
            "drl_generation_timestamp"
        ]
        
        for field in required_fields:
            assert field in version_info, f"Missing required field: {field}"
    
    def test_timestamp_format(self):
        """Test that timestamps are in ISO format."""
        rule = {"rule_id": "TIME_TEST", "name": "Time Test Rule"}
        versioned_rule = create_versioned_rule(rule)
        
        created_at = versioned_rule["version_info"]["created_at"]
        last_modified = versioned_rule["version_info"]["last_modified"]
        
        # Should be able to parse as ISO datetime
        datetime.fromisoformat(created_at)
        datetime.fromisoformat(last_modified)
    
    def test_rule_id_requirement(self):
        """Test handling of rules without rule_id."""
        rule_without_id = {"name": "No ID Rule"}
        
        # Should still work but version tracking will be limited
        versioned_rule = create_versioned_rule(rule_without_id)
        assert "version_info" in versioned_rule
        assert versioned_rule["version_info"]["version"] == 1


if __name__ == "__main__":
    pytest.main([__file__])