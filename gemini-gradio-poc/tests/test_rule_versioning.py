"""
Comprehensive test suite for rule versioning functionality.
Tests the refactored RuleVersionManager, VersionMetadata, and VersionHistoryManager classes.

Refactoring improvements in tests:
- Modular test structure with separate classes for different components
- Better test organization and naming
- Comprehensive edge case coverage
- Improved test data management
"""

import pytest
import json
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from unittest.mock import patch, mock_open

from utils.rule_versioning import (
    VersionMetadata,
    VersionHistoryManager,
    RuleVersionManager,
    create_versioned_rule,
    update_rule_version,
    get_rule_version_history,
    get_rule_version_summary
)


class TestVersionMetadata:
    """Test the VersionMetadata class with improved validation."""
    
    def test_create_metadata_with_defaults(self):
        """Test creating metadata with default values."""
        metadata = VersionMetadata()
        
        assert metadata.version == 1
        assert metadata.change_type == "create"
        assert metadata.change_summary == "Rule create"
        assert metadata.impact_analysis is None
        assert metadata.user == "system"
        assert metadata.drl_generated is False
        assert metadata.drl_generation_timestamp is None
        assert isinstance(metadata.created_at, str)
        assert isinstance(metadata.last_modified, str)
    
    def test_create_metadata_with_custom_values(self):
        """Test creating metadata with custom values."""
        metadata = VersionMetadata(
            version=3,
            change_type="update",
            change_summary="Updated business logic",
            impact_analysis="Medium impact change",
            user="admin",
            drl_generated=True
        )
        
        assert metadata.version == 3
        assert metadata.change_type == "update"
        assert metadata.change_summary == "Updated business logic"
        assert metadata.impact_analysis == "Medium impact change"
        assert metadata.user == "admin"
        assert metadata.drl_generated is True
        assert metadata.drl_generation_timestamp is not None
    
    def test_metadata_validation_invalid_version(self):
        """Test validation for invalid version numbers."""
        with pytest.raises(ValueError, match="Version must be a positive integer"):
            VersionMetadata(version=0)
        
        with pytest.raises(ValueError, match="Version must be a positive integer"):
            VersionMetadata(version=-1)
        
        with pytest.raises(ValueError, match="Version must be a positive integer"):
            VersionMetadata(version="invalid")
    
    def test_metadata_validation_invalid_change_type(self):
        """Test validation for invalid change types."""
        with pytest.raises(ValueError, match="Change type must be one of"):
            VersionMetadata(change_type="invalid_type")
    
    def test_metadata_to_dict_conversion(self):
        """Test converting metadata to dictionary."""
        metadata = VersionMetadata(
            version=2,
            change_type="update",
            change_summary="Test change",
            impact_analysis="Low impact"
        )
        
        result = metadata.to_dict()
        
        assert isinstance(result, dict)
        assert result["version"] == 2
        assert result["change_type"] == "update"
        assert result["change_summary"] == "Test change"
        assert result["impact_analysis"] == "Low impact"
        assert "created_at" in result
        assert "last_modified" in result
    
    def test_metadata_from_dict_conversion(self):
        """Test creating metadata from dictionary."""
        data = {
            "version": 2,
            "created_at": "2025-01-01T10:00:00",
            "last_modified": "2025-01-01T11:00:00",
            "change_type": "update",
            "change_summary": "Test change",
            "impact_analysis": "Low impact",
            "user": "test_user",
            "drl_generated": True,
            "drl_generation_timestamp": "2025-01-01T11:00:00"
        }
        
        metadata = VersionMetadata.from_dict(data)
        
        assert metadata.version == 2
        assert metadata.change_type == "update"
        assert metadata.change_summary == "Test change"
        assert metadata.impact_analysis == "Low impact"
        assert metadata.user == "test_user"
        assert metadata.drl_generated is True


class TestVersionHistoryManager:
    """Test the VersionHistoryManager class with improved file handling."""
    
    def setup_method(self):
        """Set up test environment with temporary directory."""
        self.temp_dir = tempfile.mkdtemp()
        self.history_manager = VersionHistoryManager(self.temp_dir)
        
        self.sample_rule = {
            "rule_id": "TEST001",
            "name": "Test Rule",
            "version_info": {
                "version": 1,
                "change_type": "create",
                "change_summary": "Initial creation"
            }
        }
    
    def teardown_method(self):
        """Clean up test environment."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_storage_directory_creation(self):
        """Test that storage directory is created properly."""
        assert self.history_manager.storage_path.exists()
        assert self.history_manager.storage_path.is_dir()
    
    def test_storage_directory_creation_failure(self):
        """Test handling of storage directory creation failure."""
        with patch('pathlib.Path.mkdir') as mock_mkdir:
            mock_mkdir.side_effect = PermissionError("Permission denied")
            
            with pytest.raises(RuntimeError, match="Failed to create version storage directory"):
                VersionHistoryManager("/invalid/path")
    
    def test_save_version_to_history_success(self):
        """Test successful saving of version to history."""
        result = self.history_manager.save_version_to_history("TEST001", self.sample_rule)
        
        assert result is True
        
        # Verify file was created
        history_file = self.history_manager._get_history_file_path("TEST001")
        assert history_file.exists()
        
        # Verify content
        with open(history_file, 'r') as f:
            history = json.load(f)
        
        assert len(history) == 1
        assert history[0]["rule_id"] == "TEST001"
    
    def test_save_version_empty_rule_id(self):
        """Test handling of empty rule_id."""
        result = self.history_manager.save_version_to_history("", self.sample_rule)
        assert result is False
    
    def test_load_history_existing_file(self):
        """Test loading history from existing file."""
        # Save some history first
        self.history_manager.save_version_to_history("TEST002", self.sample_rule)
        
        # Create a second version
        version2_rule = self.sample_rule.copy()
        version2_rule["version_info"]["version"] = 2
        self.history_manager.save_version_to_history("TEST002", version2_rule)
        
        # Load and verify
        history = self.history_manager.load_history("TEST002")
        
        assert len(history) == 2
        # Should be sorted by version (newest first)
        assert history[0]["version_info"]["version"] == 2
        assert history[1]["version_info"]["version"] == 1
    
    def test_load_history_nonexistent_file(self):
        """Test loading history for non-existent rule."""
        history = self.history_manager.load_history("NONEXISTENT")
        assert history == []
    
    def test_load_history_empty_rule_id(self):
        """Test loading history with empty rule_id."""
        history = self.history_manager.load_history("")
        assert history == []
    
    def test_load_history_file_corruption(self):
        """Test handling of corrupted history file."""
        # Create a corrupted file
        history_file = self.history_manager._get_history_file_path("CORRUPTED")
        with open(history_file, 'w') as f:
            f.write("invalid json content")
        
        # Should handle gracefully
        history = self.history_manager.load_history("CORRUPTED")
        assert history == []


class TestRuleVersionManager:
    """Test the main RuleVersionManager class with comprehensive coverage."""
    
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
    
    def test_create_versioned_rule_success(self):
        """Test creating a versioned rule successfully."""
        versioned_rule = self.version_manager.create_versioned_rule(
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
        
        # Original rule data should be preserved
        assert versioned_rule["rule_id"] == "TEST001"
        assert versioned_rule["name"] == "Test Rule"
    
    def test_create_versioned_rule_invalid_data(self):
        """Test handling of invalid rule data."""
        with pytest.raises(ValueError, match="Rule data must be a dictionary"):
            self.version_manager.create_versioned_rule("invalid_data")
    
    def test_update_rule_version_success(self):
        """Test updating rule version successfully."""
        # Create initial versioned rule
        versioned_rule = self.version_manager.create_versioned_rule(self.sample_rule.copy())
        
        # Update it
        updated_rule = self.version_manager.update_rule_version(
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
        
        # Original creation timestamp should be preserved
        original_created_at = versioned_rule["version_info"]["created_at"]
        assert version_info["created_at"] == original_created_at
        
        # Should have saved previous version to history
        history = self.version_manager.get_rule_history("TEST001")
        assert len(history) == 1
        assert history[0]["version_info"]["version"] == 1
    
    def test_update_rule_version_invalid_data(self):
        """Test handling of invalid rule data in update."""
        result = self.version_manager.update_rule_version("invalid_data")
        assert result == "invalid_data"  # Should return original data
    
    def test_get_version_summary_with_history(self):
        """Test getting version summary with existing history."""
        # Create and update a rule multiple times
        rule = self.version_manager.create_versioned_rule(self.sample_rule.copy())
        rule = self.version_manager.update_rule_version(rule, change_summary="First update")
        rule = self.version_manager.update_rule_version(rule, change_summary="Second update", drl_generated=True)
        
        summary = self.version_manager.get_version_summary("TEST001")
        
        assert summary["rule_id"] == "TEST001"
        assert summary["total_versions"] == 2  # Previous versions in history
        assert summary["current_version"] == 2  # Latest version from history
        assert len(summary["change_history"]) == 2
        
        # Check change history order (newest first)
        assert summary["change_history"][0]["version"] == 2
        assert summary["change_history"][1]["version"] == 1
    
    def test_get_version_summary_no_history(self):
        """Test getting version summary for rule with no history."""
        summary = self.version_manager.get_version_summary("NONEXISTENT")
        
        assert summary["rule_id"] == "NONEXISTENT"
        assert summary["total_versions"] == 0
        assert summary["current_version"] == 0
        assert summary["created_at"] is None
        assert summary["last_modified"] is None
        assert summary["change_history"] == []
    
    def test_calculate_next_version_no_history(self):
        """Test version calculation with no existing history."""
        version = self.version_manager._calculate_next_version("NEW_RULE")
        assert version == 1
    
    def test_calculate_next_version_with_history(self):
        """Test version calculation with existing history."""
        # Create rule and update it a few times
        rule = self.version_manager.create_versioned_rule(self.sample_rule.copy())
        rule = self.version_manager.update_rule_version(rule)
        rule = self.version_manager.update_rule_version(rule)
        
        # Current rule has version 3, history has versions 1 and 2
        # Next version should be 3 (the algorithm gets max from history + 1)
        next_version = self.version_manager._calculate_next_version("TEST001")
        assert next_version == 3


class TestVersioningUtilityFunctions:
    """Test the convenience utility functions with improved coverage."""
    
    def test_create_versioned_rule_utility(self):
        """Test the create_versioned_rule utility function."""
        sample_rule = {
            "rule_id": "UTIL_TEST",
            "name": "Utility Test Rule",
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
    
    def test_update_rule_version_utility(self):
        """Test the update_rule_version utility function."""
        # Create initial versioned rule
        sample_rule = {
            "rule_id": "UTIL_TEST2",
            "name": "Test Rule 2",
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
            change_summary="Rule updated via utility",
            drl_generated=True
        )
        
        version_info = updated_rule["version_info"]
        assert version_info["version"] == 2
        assert version_info["change_type"] == "update"
        assert version_info["change_summary"] == "Rule updated via utility"
        assert version_info["drl_generated"] is True
        # Should preserve original creation timestamp
        assert version_info["created_at"] == "2025-01-01T00:00:00"
    
    @patch('utils.rule_versioning.RuleVersionManager')
    def test_get_rule_version_history_utility(self, mock_manager_class):
        """Test the get_rule_version_history utility function."""
        mock_manager = mock_manager_class.return_value
        mock_manager.get_rule_history.return_value = [{"version": 1}]
        
        result = get_rule_version_history("UTIL_TEST3")
        
        mock_manager_class.assert_called_once()
        mock_manager.get_rule_history.assert_called_once_with("UTIL_TEST3")
        assert result == [{"version": 1}]
    
    @patch('utils.rule_versioning.RuleVersionManager')
    def test_get_rule_version_summary_utility(self, mock_manager_class):
        """Test the get_rule_version_summary utility function."""
        mock_manager = mock_manager_class.return_value
        mock_manager.get_version_summary.return_value = {"total_versions": 2}
        
        result = get_rule_version_summary("UTIL_TEST4")
        
        mock_manager_class.assert_called_once()
        mock_manager.get_version_summary.assert_called_once_with("UTIL_TEST4")
        assert result == {"total_versions": 2}


class TestVersioningIntegrationAndEdgeCases:
    """Test integration scenarios and edge cases with improved coverage."""
    
    def setup_method(self):
        """Set up test environment."""
        self.temp_dir = tempfile.mkdtemp()
        self.version_manager = RuleVersionManager(self.temp_dir)
    
    def teardown_method(self):
        """Clean up test environment."""
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_version_metadata_structure_completeness(self):
        """Test that version metadata has all required fields."""
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
    
    def test_timestamp_format_validation(self):
        """Test that timestamps are in valid ISO format."""
        rule = {"rule_id": "TIME_TEST", "name": "Time Test Rule"}
        versioned_rule = create_versioned_rule(rule)
        
        created_at = versioned_rule["version_info"]["created_at"]
        last_modified = versioned_rule["version_info"]["last_modified"]
        
        # Should be able to parse as ISO datetime
        datetime.fromisoformat(created_at)
        datetime.fromisoformat(last_modified)
    
    def test_rule_without_rule_id(self):
        """Test handling of rules without rule_id."""
        rule_without_id = {"name": "No ID Rule"}
        
        # Should still work but version tracking will be limited
        versioned_rule = create_versioned_rule(rule_without_id)
        assert "version_info" in versioned_rule
        assert versioned_rule["version_info"]["version"] == 1
    
    def test_multiple_concurrent_updates(self):
        """Test handling of multiple updates to the same rule."""
        rule = {
            "rule_id": "CONCURRENT_TEST",
            "name": "Concurrent Test Rule"
        }
        
        # Create initial version
        v1 = self.version_manager.create_versioned_rule(rule.copy())
        
        # Multiple updates
        v2 = self.version_manager.update_rule_version(v1, change_summary="Update 1")
        v3 = self.version_manager.update_rule_version(v2, change_summary="Update 2", drl_generated=True)
        v4 = self.version_manager.update_rule_version(v3, change_summary="Update 3")
        
        # Verify final state
        assert v4["version_info"]["version"] == 4
        
        # Verify history
        history = self.version_manager.get_rule_history("CONCURRENT_TEST")
        assert len(history) == 3  # v1, v2, v3 should be in history
        
        # Verify summary
        summary = self.version_manager.get_version_summary("CONCURRENT_TEST")
        assert summary["total_versions"] == 3
        assert summary["current_version"] == 3  # Latest from history
    
    def test_error_handling_in_version_summary(self):
        """Test error handling in version summary creation."""
        with patch.object(self.version_manager, 'get_rule_history') as mock_history:
            mock_history.side_effect = Exception("Test error")
            
            summary = self.version_manager.get_version_summary("ERROR_TEST")
            
            # Should return empty summary on error
            assert summary["rule_id"] == "ERROR_TEST"
            assert summary["total_versions"] == 0
            assert summary["current_version"] == 0


if __name__ == "__main__":
    pytest.main([__file__])