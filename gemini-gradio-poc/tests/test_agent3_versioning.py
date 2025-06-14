"""
Test suite for Agent 3 versioning utilities.
Tests the versioning-related functions in agent3_utils.py.
"""

import pytest
from unittest.mock import patch, MagicMock
from utils.agent3_utils import (
    get_rule_change_summary,
    get_detailed_rule_history,
    add_impact_analysis_to_rule,
    check_rule_modification_impact
)

class TestAgent3VersioningUtils:
    """Test Agent 3 versioning utility functions."""
    
    def test_get_rule_change_summary_no_history(self):
        """Test change summary when no history exists."""
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_summary:
            mock_summary.return_value = {"total_versions": 0}
            
            result = get_rule_change_summary("NONEXISTENT")
            assert "No version history found" in result
            assert "NONEXISTENT" in result
    
    def test_get_rule_change_summary_with_history(self):
        """Test change summary with version history."""
        mock_summary = {
            "total_versions": 3,
            "current_version": 3,
            "created_at": "2025-01-01T10:00:00.000Z",
            "last_modified": "2025-01-01T12:00:00.000Z",
            "change_history": [
                {
                    "version": 3,
                    "change_summary": "Updated conditions",
                    "drl_generated": True,
                    "timestamp": "2025-01-01T12:00:00.000Z"
                },
                {
                    "version": 2, 
                    "change_summary": "Added impact analysis",
                    "drl_generated": False,
                    "timestamp": "2025-01-01T11:00:00.000Z"
                },
                {
                    "version": 1,
                    "change_summary": "Initial creation",
                    "drl_generated": False,
                    "timestamp": "2025-01-01T10:00:00.000Z"
                }
            ]
        }
        
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_get_summary:
            mock_get_summary.return_value = mock_summary
            
            result = get_rule_change_summary("TEST001")
            
            assert "Rule Version Summary for TEST001" in result
            assert "Total versions: 3" in result
            assert "Current version: 3" in result
            assert "v3: Updated conditions ✓ DRL Generated" in result
            assert "v2: Added impact analysis" in result
            assert "v1: Initial creation" in result
    
    def test_get_rule_change_summary_error_handling(self):
        """Test error handling in change summary."""
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_summary:
            mock_summary.side_effect = Exception("Test error")
            
            result = get_rule_change_summary("ERROR_TEST")
            assert "Error retrieving version summary" in result
            assert "ERROR_TEST" in result
    
    def test_get_detailed_rule_history_no_history(self):
        """Test detailed history when no history exists."""
        with patch('utils.agent3_utils.get_rule_version_history') as mock_history:
            mock_history.return_value = []
            
            result = get_detailed_rule_history("NOHISTORY")
            assert "No version history found" in result
            assert "NOHISTORY" in result
    
    def test_get_detailed_rule_history_with_data(self):
        """Test detailed history with version data."""
        mock_history = [
            {
                "rule_id": "TEST002",
                "version_info": {
                    "version": 2,
                    "change_type": "update",
                    "change_summary": "Updated rule conditions",
                    "last_modified": "2025-01-01T12:00:00.000Z",
                    "drl_generated": True,
                    "impact_analysis": "Medium impact change"
                }
            },
            {
                "rule_id": "TEST002", 
                "version_info": {
                    "version": 1,
                    "change_type": "create",
                    "change_summary": "Initial rule creation",
                    "last_modified": "2025-01-01T10:00:00.000Z",
                    "drl_generated": False,
                    "impact_analysis": None
                }
            }
        ]
        
        with patch('utils.agent3_utils.get_rule_version_history') as mock_get_history:
            mock_get_history.return_value = mock_history
            
            result = get_detailed_rule_history("TEST002")
            
            assert "Complete Version History for Rule TEST002" in result
            assert "### Version 2" in result
            assert "**Change Type:** update" in result
            assert "**Summary:** Updated rule conditions" in result
            assert "**DRL Generated:** Yes" in result
            assert "**Impact Analysis:** Medium impact change" in result
            assert "### Version 1" in result
            assert "**Change Type:** create" in result
            assert "**DRL Generated:** No" in result
    
    def test_get_detailed_rule_history_error_handling(self):
        """Test error handling in detailed history."""
        with patch('utils.agent3_utils.get_rule_version_history') as mock_history:
            mock_history.side_effect = Exception("History error")
            
            result = get_detailed_rule_history("ERROR_HISTORY")
            assert "Error retrieving detailed history" in result
            assert "ERROR_HISTORY" in result
    
    def test_add_impact_analysis_to_rule(self):
        """Test adding impact analysis to a rule."""
        sample_rule = {
            "rule_id": "IMPACT_TEST",
            "name": "Impact Test Rule",
            "version_info": {"version": 1}
        }
        
        impact_text = "This change will affect customer discount calculations"
        
        with patch('utils.agent3_utils.update_rule_version') as mock_update:
            mock_update.return_value = sample_rule.copy()
            
            result = add_impact_analysis_to_rule(sample_rule, impact_text)
            
            mock_update.assert_called_once_with(
                sample_rule.copy(),
                change_type="impact_analysis",
                change_summary="Added impact analysis from Agent 3",
                impact_analysis=impact_text
            )
            assert result == sample_rule
    
    def test_add_impact_analysis_error_handling(self):
        """Test error handling when adding impact analysis."""
        sample_rule = {"rule_id": "ERROR_RULE"}
        impact_text = "Test impact"
        
        with patch('utils.agent3_utils.update_rule_version') as mock_update:
            mock_update.side_effect = Exception("Update error")
            
            result = add_impact_analysis_to_rule(sample_rule, impact_text)
            assert result == sample_rule  # Should return original rule on error
    
    def test_check_rule_modification_impact_new_rule(self):
        """Test impact analysis for a new rule (rule not found)."""
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_summary:
            mock_summary.return_value = {"total_versions": 0}
            
            result = check_rule_modification_impact("NEW_RULE", "Add new conditions")
            
            assert "Rule 'NEW_RULE' not found" in result
            assert "new rule creation" in result
    
    def test_check_rule_modification_impact_existing_rule(self):
        """Test impact analysis for an existing rule."""
        mock_summary = {
            "total_versions": 3,
            "current_version": 3,
            "change_history": [
                {"drl_generated": True, "timestamp": "2025-01-01T12:00:00.000Z"},
                {"drl_generated": False, "timestamp": "2025-01-01T11:00:00.000Z"},
                {"drl_generated": False, "timestamp": "2025-01-01T10:00:00.000Z"}
            ]
        }
        
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_get_summary:
            mock_get_summary.return_value = mock_summary
            
            result = check_rule_modification_impact("EXISTING_RULE", "Update discount percentage")
            
            assert "Modification Impact Analysis for Rule EXISTING_RULE" in result
            assert "Current version: 3" in result
            assert "Total previous modifications: 2" in result
            assert "Update discount percentage" in result
            assert "This rule has generated DRL/GDST files" in result
            assert "Last modified: 2025-01-01T12:00:00" in result
    
    def test_check_rule_modification_impact_frequent_changes(self):
        """Test impact analysis for frequently modified rules."""
        mock_summary = {
            "total_versions": 8,  # More than 5
            "current_version": 8,
            "change_history": [{"drl_generated": False}] * 8
        }
        
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_get_summary:
            mock_get_summary.return_value = mock_summary
            
            result = check_rule_modification_impact("FREQUENT_RULE", "Another change")
            
            assert "modified frequently - consider stability" in result
    
    def test_check_rule_modification_impact_error_handling(self):
        """Test error handling in modification impact analysis."""
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_summary:
            mock_summary.side_effect = Exception("Analysis error")
            
            result = check_rule_modification_impact("ERROR_RULE", "Test change")
            assert "Error analyzing modification impact" in result


class TestVersioningIntegrationWithAgent3:
    """Test integration between versioning and Agent 3 functionality."""
    
    def test_version_summary_formatting(self):
        """Test that version summaries are properly formatted for user display."""
        mock_summary = {
            "total_versions": 2,
            "current_version": 2,
            "created_at": "2025-01-01T10:30:45.123456",
            "last_modified": "2025-01-01T14:15:30.654321",
            "change_history": [
                {
                    "version": 2,
                    "change_summary": "Updated business logic",
                    "drl_generated": True,
                    "timestamp": "2025-01-01T14:15:30.654321"
                }
            ]
        }
        
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_get_summary:
            mock_get_summary.return_value = mock_summary
            
            result = get_rule_change_summary("FORMAT_TEST")
            
            # Check timestamp formatting (should be truncated to 19 chars)
            assert "2025-01-01T10:30:45" in result
            assert "2025-01-01T14:15:30" in result
            # Should not contain microseconds
            assert ".123456" not in result
            assert ".654321" not in result
    
    def test_impact_analysis_integration(self):
        """Test that impact analysis integrates properly with versioning."""
        rule_data = {
            "rule_id": "INTEGRATION_TEST",
            "name": "Integration Test Rule"
        }
        
        impact_analysis = "This rule change will affect the entire discount system"
        
        with patch('utils.agent3_utils.update_rule_version') as mock_update:
            expected_result = rule_data.copy()
            expected_result["version_info"] = {"impact_analysis": impact_analysis}
            mock_update.return_value = expected_result
            
            result = add_impact_analysis_to_rule(rule_data, impact_analysis)
            
            mock_update.assert_called_once()
            call_args = mock_update.call_args
            assert call_args[1]["change_type"] == "impact_analysis"
            assert call_args[1]["impact_analysis"] == impact_analysis


if __name__ == "__main__":
    pytest.main([__file__])