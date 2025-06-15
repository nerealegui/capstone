"""
Test suite for Agent 3 versioning utilities.
Tests the versioning-related functions in agent3_utils.py with refactored improvements.

Refactoring improvements in tests:
- Better test organization with logical groupings
- Comprehensive edge case coverage
- Improved test data management and reusability
- Enhanced error handling validation
"""

import pytest
from unittest.mock import patch, MagicMock
from utils.agent3_utils import (
    get_rule_change_summary,
    get_detailed_rule_history,
    add_impact_analysis_to_rule,
    check_rule_modification_impact,
    get_versioning_help_text,
    VersioningResponseFormatter,
    RuleImpactAnalyzer
)


class TestVersioningResponseFormatter:
    """Test the VersioningResponseFormatter utility class."""
    
    def test_format_rule_change_summary_no_history(self):
        """Test formatting when no history exists."""
        version_summary = {"total_versions": 0}
        
        result = VersioningResponseFormatter.format_rule_change_summary("NONEXISTENT", version_summary)
        assert "No version history found" in result
        assert "NONEXISTENT" in result
    
    def test_format_rule_change_summary_with_history(self):
        """Test formatting with comprehensive version history."""
        version_summary = {
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
        
        result = VersioningResponseFormatter.format_rule_change_summary("TEST001", version_summary)
        
        assert "Rule Version Summary for TEST001" in result
        assert "Total versions: 3" in result
        assert "Current version: 3" in result
        assert "v3: Updated conditions ✓ DRL Generated" in result
        assert "v2: Added impact analysis" in result
        assert "v1: Initial creation" in result
        # Check timestamp formatting (should be truncated)
        assert "2025-01-01T10:00:00" in result
        assert ".000Z" not in result  # Microseconds should be removed
    
    def test_format_rule_change_summary_many_versions(self):
        """Test formatting when there are many versions (should show only recent 3)."""
        change_history = []
        for i in range(10, 0, -1):  # Create 10 versions
            change_history.append({
                "version": i,
                "change_summary": f"Change {i}",
                "drl_generated": False,
                "timestamp": f"2025-01-01T{i:02d}:00:00.000Z"
            })
        
        version_summary = {
            "total_versions": 10,
            "current_version": 10,
            "created_at": "2025-01-01T01:00:00.000Z",
            "last_modified": "2025-01-01T10:00:00.000Z",
            "change_history": change_history
        }
        
        result = VersioningResponseFormatter.format_rule_change_summary("MANY_VERSIONS", version_summary)
        
        assert "Total versions: 10" in result
        assert "v10: Change 10" in result
        assert "v9: Change 9" in result
        assert "v8: Change 8" in result
        assert "v7: Change 7" not in result  # Should only show first 3
        assert "and 7 more versions" in result
    
    def test_format_detailed_history_no_history(self):
        """Test detailed history formatting when no history exists."""
        result = VersioningResponseFormatter.format_detailed_history("NOHISTORY", [])
        assert "No version history found" in result
        assert "NOHISTORY" in result
    
    def test_format_detailed_history_with_data(self):
        """Test detailed history formatting with version data."""
        history = [
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
        
        result = VersioningResponseFormatter.format_detailed_history("TEST002", history)
        
        assert "Complete Version History for Rule TEST002" in result
        assert "### Version 2" in result
        assert "**Change Type:** update" in result
        assert "**Summary:** Updated rule conditions" in result
        assert "**DRL Generated:** Yes" in result
        assert "**Impact Analysis:** Medium impact change" in result
        assert "### Version 1" in result
        assert "**Change Type:** create" in result
        assert "**DRL Generated:** No" in result
    
    def test_timestamp_formatting(self):
        """Test timestamp formatting utility method."""
        # Test normal timestamp with microseconds
        timestamp = "2025-01-01T10:30:45.123456"
        formatted = VersioningResponseFormatter._format_timestamp(timestamp)
        assert formatted == "2025-01-01T10:30:45"
        
        # Test timestamp without microseconds
        timestamp = "2025-01-01T10:30:45"
        formatted = VersioningResponseFormatter._format_timestamp(timestamp)
        assert formatted == "2025-01-01T10:30:45"
        
        # Test None timestamp
        formatted = VersioningResponseFormatter._format_timestamp(None)
        assert formatted == "Unknown"
        
        # Test empty timestamp
        formatted = VersioningResponseFormatter._format_timestamp("")
        assert formatted == "Unknown"


class TestRuleImpactAnalyzer:
    """Test the RuleImpactAnalyzer utility class."""
    
    def test_analyze_modification_impact_new_rule(self):
        """Test impact analysis for a new rule (rule not found)."""
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_summary:
            mock_summary.return_value = {"total_versions": 0}
            
            result = RuleImpactAnalyzer.analyze_modification_impact("NEW_RULE", "Add new conditions")
            
            assert "Rule 'NEW_RULE' not found" in result
            assert "new rule creation" in result
    
    def test_analyze_modification_impact_existing_rule(self):
        """Test impact analysis for an existing rule."""
        version_summary = {
            "total_versions": 3,
            "current_version": 3,
            "change_history": [
                {"drl_generated": True, "timestamp": "2025-01-01T12:00:00.000Z"},
                {"drl_generated": False, "timestamp": "2025-01-01T11:00:00.000Z"},
                {"drl_generated": False, "timestamp": "2025-01-01T10:00:00.000Z"}
            ]
        }
        
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_get_summary:
            mock_get_summary.return_value = version_summary
            
            result = RuleImpactAnalyzer.analyze_modification_impact("EXISTING_RULE", "Update discount percentage")
            
            assert "Modification Impact Analysis for Rule EXISTING_RULE" in result
            assert "Current version: 3" in result
            assert "Total previous modifications: 2" in result
            assert "Update discount percentage" in result
            assert "This rule has generated DRL/GDST files" in result
            assert "Last modified: 2025-01-01T12:00:00" in result
    
    def test_analyze_modification_impact_frequent_changes(self):
        """Test impact analysis for frequently modified rules."""
        version_summary = {
            "total_versions": 8,  # More than 5
            "current_version": 8,
            "change_history": [{"drl_generated": False}] * 8
        }
        
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_get_summary:
            mock_get_summary.return_value = version_summary
            
            result = RuleImpactAnalyzer.analyze_modification_impact("FREQUENT_RULE", "Another change")
            
            assert "modified frequently - consider stability" in result
    
    def test_analyze_modification_impact_error_handling(self):
        """Test error handling in modification impact analysis."""
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_summary:
            mock_summary.side_effect = Exception("Analysis error")
            
            result = RuleImpactAnalyzer.analyze_modification_impact("ERROR_RULE", "Test change")
            assert "Error analyzing modification impact" in result


class TestAgent3VersioningIntegrationFunctions:
    """Test the main integration functions for Agent 3 versioning."""
    
    def test_get_rule_change_summary_success(self):
        """Test successful rule change summary retrieval."""
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
    
    def test_get_rule_change_summary_error_handling(self):
        """Test error handling in change summary."""
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_summary:
            mock_summary.side_effect = Exception("Test error")
            
            result = get_rule_change_summary("ERROR_TEST")
            assert "Error retrieving version summary" in result
            assert "ERROR_TEST" in result
    
    def test_get_detailed_rule_history_success(self):
        """Test successful detailed history retrieval."""
        mock_history = [
            {
                "rule_id": "HISTORY_TEST",
                "version_info": {
                    "version": 1,
                    "change_type": "create",
                    "change_summary": "Initial creation",
                    "last_modified": "2025-01-01T10:00:00.000Z",
                    "drl_generated": False
                }
            }
        ]
        
        with patch('utils.agent3_utils.get_rule_version_history') as mock_get_history:
            mock_get_history.return_value = mock_history
            
            result = get_detailed_rule_history("HISTORY_TEST")
            
            assert "Complete Version History for Rule HISTORY_TEST" in result
            assert "### Version 1" in result
            assert "**Change Type:** create" in result
    
    def test_get_detailed_rule_history_error_handling(self):
        """Test error handling in detailed history."""
        with patch('utils.agent3_utils.get_rule_version_history') as mock_history:
            mock_history.side_effect = Exception("History error")
            
            result = get_detailed_rule_history("ERROR_HISTORY")
            assert "Error retrieving detailed history" in result
            assert "ERROR_HISTORY" in result
    
    def test_add_impact_analysis_to_rule_success(self):
        """Test adding impact analysis to a rule successfully."""
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
                sample_rule,
                change_type="impact_analysis",
                change_summary="Added impact analysis from Agent 3",
                impact_analysis=impact_text
            )
            assert result == sample_rule
    
    def test_add_impact_analysis_invalid_rule_data(self):
        """Test handling of invalid rule data."""
        result = add_impact_analysis_to_rule("invalid_data", "Test impact")
        assert result == "invalid_data"
    
    def test_add_impact_analysis_invalid_impact_text(self):
        """Test handling of invalid impact analysis text."""
        sample_rule = {"rule_id": "TEST"}
        
        # Test with None impact analysis
        result = add_impact_analysis_to_rule(sample_rule, None)
        assert result == sample_rule
        
        # Test with empty string
        result = add_impact_analysis_to_rule(sample_rule, "")
        assert result == sample_rule
        
        # Test with non-string type
        result = add_impact_analysis_to_rule(sample_rule, 123)
        assert result == sample_rule
    
    def test_add_impact_analysis_error_handling(self):
        """Test error handling when adding impact analysis."""
        sample_rule = {"rule_id": "ERROR_RULE"}
        impact_text = "Test impact"
        
        with patch('utils.agent3_utils.update_rule_version') as mock_update:
            mock_update.side_effect = Exception("Update error")
            
            result = add_impact_analysis_to_rule(sample_rule, impact_text)
            assert result == sample_rule  # Should return original rule on error
    
    def test_check_rule_modification_impact_success(self):
        """Test successful rule modification impact check."""
        with patch('utils.agent3_utils.RuleImpactAnalyzer.analyze_modification_impact') as mock_analyze:
            mock_analyze.return_value = "Impact analysis result"
            
            result = check_rule_modification_impact("TEST_RULE", "Test changes")
            
            mock_analyze.assert_called_once_with("TEST_RULE", "Test changes")
            assert result == "Impact analysis result"
    
    def test_check_rule_modification_impact_invalid_inputs(self):
        """Test handling of invalid inputs."""
        # Test empty rule_id
        result = check_rule_modification_impact("", "Test changes")
        assert "Error: Rule ID must be a non-empty string" in result
        
        # Test None rule_id
        result = check_rule_modification_impact(None, "Test changes")
        assert "Error: Rule ID must be a non-empty string" in result
        
        # Test empty proposed_changes
        result = check_rule_modification_impact("TEST_RULE", "")
        assert "Error: Proposed changes must be a non-empty string" in result
        
        # Test None proposed_changes
        result = check_rule_modification_impact("TEST_RULE", None)
        assert "Error: Proposed changes must be a non-empty string" in result
    
    def test_get_versioning_help_text(self):
        """Test versioning help text generation."""
        help_text = get_versioning_help_text()
        
        assert "Rule Versioning Features:" in help_text
        assert "Available Commands:" in help_text
        assert "get_rule_change_summary" in help_text
        assert "get_detailed_rule_history" in help_text
        assert "check_rule_modification_impact" in help_text
        assert "Version Information Includes:" in help_text
        assert "Impact Analysis Features:" in help_text
        assert "Best Practices:" in help_text


class TestVersioningIntegrationWithAgent3:
    """Test integration between versioning and Agent 3 functionality."""
    
    def test_comprehensive_workflow_integration(self):
        """Test a complete workflow from rule creation to impact analysis."""
        # Simulate a complete versioning workflow
        
        # Step 1: Get change summary for a rule
        mock_summary = {
            "total_versions": 2,
            "current_version": 2,
            "created_at": "2025-01-01T10:00:00",
            "last_modified": "2025-01-01T12:00:00",
            "change_history": [
                {"version": 2, "change_summary": "Updated conditions", "drl_generated": True, "timestamp": "2025-01-01T12:00:00"},
                {"version": 1, "change_summary": "Initial creation", "drl_generated": False, "timestamp": "2025-01-01T10:00:00"}
            ]
        }
        
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_get_summary:
            mock_get_summary.return_value = mock_summary
            
            # Get change summary
            summary_result = get_rule_change_summary("WORKFLOW_TEST")
            assert "Rule Version Summary for WORKFLOW_TEST" in summary_result
            assert "Total versions: 2" in summary_result
            
            # Check modification impact
            impact_result = check_rule_modification_impact("WORKFLOW_TEST", "Add new condition")
            assert "Modification Impact Analysis for Rule WORKFLOW_TEST" in impact_result
            assert "Current version: 2" in impact_result
    
    def test_error_recovery_and_graceful_degradation(self):
        """Test that errors in one function don't break others."""
        # Test that if one versioning function fails, others still work
        
        with patch('utils.agent3_utils.get_rule_version_summary') as mock_summary:
            # First call succeeds, second call fails
            mock_summary.side_effect = [
                {
                    "total_versions": 1, 
                    "current_version": 1, 
                    "created_at": "2025-01-01T10:00:00",
                    "last_modified": "2025-01-01T10:00:00",
                    "change_history": []
                },
                Exception("Test error")
            ]
            
            # First call should succeed
            result1 = get_rule_change_summary("SUCCESS_RULE")
            assert "Total versions: 1" in result1
            
            # Second call should handle error gracefully
            result2 = get_rule_change_summary("ERROR_RULE")
            assert "Error retrieving version summary" in result2


if __name__ == "__main__":
    pytest.main([__file__])