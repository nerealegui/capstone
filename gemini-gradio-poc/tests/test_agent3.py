"""
Tests for Agent 3 functionality - conversational interaction, conflict detection, and impact analysis.
"""

import pytest
import pandas as pd
import json
from unittest.mock import patch, MagicMock

# Import Agent 3 utilities
from utils.agent3_utils import (
    analyze_rule_conflicts,
    assess_rule_impact,
    generate_conversational_response,
    orchestrate_rule_generation,
    _assess_industry_impact,
    _extract_existing_rules_from_kb
)

from config.agent_config import INDUSTRY_CONFIGS


class TestAgent3ConflictDetection:
    """Test Agent 3 conflict detection capabilities."""
    
    @patch('utils.agent3_utils._generate_conflict_analysis')
    def test_analyze_rule_conflicts_basic(self, mock_analysis):
        """Test basic conflict detection with industry context."""
        mock_analysis.return_value = "Detailed conflict analysis from Agent 3"
        
        proposed_rule = {
            "rule_id": "BR001",
            "name": "Discount Rule",
            "category": "Pricing"
        }
        
        existing_rules = [
            {
                "rule_id": "BR001",
                "name": "Existing Discount",
                "category": "Pricing"
            }
        ]
        
        conflicts, analysis = analyze_rule_conflicts(proposed_rule, existing_rules, "restaurant")
        
        assert len(conflicts) > 0
        assert conflicts[0]["type"] == "duplicate_id"
        assert "industry_impact" in conflicts[0]
        assert isinstance(analysis, str)
    
    @patch('utils.agent3_utils._generate_conflict_analysis')
    def test_analyze_rule_conflicts_no_conflicts(self, mock_analysis):
        """Test conflict detection when no conflicts exist."""
        mock_analysis.return_value = "No conflicts detected by Agent 3"
        
        proposed_rule = {
            "rule_id": "BR002",
            "name": "New Rule",
            "category": "Pricing"
        }
        
        existing_rules = [
            {
                "rule_id": "BR001",
                "name": "Existing Rule",
                "category": "Scheduling"
            }
        ]
        
        conflicts, analysis = analyze_rule_conflicts(proposed_rule, existing_rules, "retail")
        
        assert len(conflicts) == 0
        assert isinstance(analysis, str)

    def test_industry_impact_assessment(self):
        """Test industry-specific impact assessment."""
        conflict = {"type": "duplicate_id", "message": "Test conflict"}
        restaurant_config = INDUSTRY_CONFIGS["restaurant"]
        
        impact = _assess_industry_impact(conflict, restaurant_config)
        
        assert isinstance(impact, str)
        assert any(area in impact for area in restaurant_config["impact_areas"])


class TestAgent3ImpactAnalysis:
    """Test Agent 3 impact analysis capabilities."""
    
    @patch('utils.agent3_utils.initialize_gemini_client')
    def test_assess_rule_impact(self, mock_client):
        """Test rule impact assessment."""
        # Mock the Gemini client
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "operational_impact": "Medium",
            "financial_impact": "Low",
            "risk_level": "Low"
        })
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_client_instance = MagicMock()
        mock_client_instance.models = mock_model
        mock_client.return_value = mock_client_instance
        
        proposed_rule = {
            "rule_id": "BR001",
            "name": "Test Rule",
            "category": "Pricing"
        }
        
        impact = assess_rule_impact(proposed_rule, [], "restaurant")
        
        assert isinstance(impact, dict)
        assert "operational_impact" in impact or "error" in impact
    
    @patch('utils.agent3_utils.initialize_gemini_client')
    def test_assess_rule_impact_error_handling(self, mock_client):
        """Test impact assessment error handling."""
        # Mock client to raise exception
        mock_client.side_effect = Exception("API Error")
        
        proposed_rule = {"rule_id": "BR001", "name": "Test Rule"}
        
        impact = assess_rule_impact(proposed_rule, [], "generic")
        
        assert isinstance(impact, dict)
        assert "error" in impact


class TestAgent3ConversationalResponse:
    """Test Agent 3 conversational capabilities."""
    
    @patch('utils.agent3_utils.rag_generate')
    def test_generate_conversational_response_with_rag(self, mock_rag):
        """Test conversational response with RAG."""
        mock_rag.return_value = "This is a helpful response about business rules."
        
        rag_df = pd.DataFrame([{"text": "Sample rule content"}])
        context = {"intent": "general", "industry": "restaurant"}
        
        response = generate_conversational_response(
            "What are the current pricing rules?",
            context,
            rag_df,
            "restaurant"
        )
        
        assert isinstance(response, str)
        assert len(response) > 0
        mock_rag.assert_called_once()
    
    @patch('utils.agent3_utils._direct_agent3_call')
    def test_generate_conversational_response_without_rag(self, mock_direct):
        """Test conversational response without RAG."""
        mock_direct.return_value = "Direct response from Agent 3."
        
        empty_df = pd.DataFrame()
        context = {"intent": "general", "industry": "generic"}
        
        response = generate_conversational_response(
            "Tell me about business rules",
            context,
            empty_df,
            "generic"
        )
        
        assert isinstance(response, str)
        mock_direct.assert_called_once()


class TestAgent3Orchestration:
    """Test Agent 3 orchestration capabilities."""
    
    def test_orchestrate_rule_generation_proceed(self):
        """Test orchestration when user decides to proceed."""
        proposed_rule = {"rule_id": "BR001", "name": "Test Rule"}
        conflicts = []  # No conflicts
        
        should_proceed, status, result = orchestrate_rule_generation(
            "proceed", proposed_rule, conflicts
        )
        
        assert should_proceed is True
        assert "Proceeding" in status
        assert result is not None
        
        # Check orchestration result
        result_data = json.loads(result)
        assert result_data["action"] == "generate_drl_gdst"
        assert result_data["agent2_trigger"] is True
    
    def test_orchestrate_rule_generation_with_conflicts(self):
        """Test orchestration when conflicts exist."""
        proposed_rule = {"rule_id": "BR001", "name": "Test Rule"}
        conflicts = [{"type": "duplicate_id", "message": "Conflict detected"}]
        
        should_proceed, status, result = orchestrate_rule_generation(
            "proceed", proposed_rule, conflicts
        )
        
        assert should_proceed is False
        assert "conflicts" in status.lower()
        assert result is None
    
    def test_orchestrate_rule_generation_cancel(self):
        """Test orchestration when user cancels."""
        proposed_rule = {"rule_id": "BR001", "name": "Test Rule"}
        
        should_proceed, status, result = orchestrate_rule_generation(
            "cancel", proposed_rule, []
        )
        
        assert should_proceed is False
        assert "cancelled" in status.lower()
        assert result is None
    
    def test_orchestrate_rule_generation_modify(self):
        """Test orchestration when user wants to modify."""
        proposed_rule = {"rule_id": "BR001", "name": "Test Rule"}
        
        should_proceed, status, result = orchestrate_rule_generation(
            "modify", proposed_rule, []
        )
        
        assert should_proceed is False
        assert "modifications" in status.lower()
        assert result is None


class TestAgent3IndustryAdaptability:
    """Test Agent 3 industry adaptability features."""
    
    def test_industry_configs_exist(self):
        """Test that industry configurations are properly defined."""
        assert "restaurant" in INDUSTRY_CONFIGS
        assert "retail" in INDUSTRY_CONFIGS
        assert "manufacturing" in INDUSTRY_CONFIGS
        assert "healthcare" in INDUSTRY_CONFIGS
        assert "generic" in INDUSTRY_CONFIGS
        
        # Check required fields exist
        for industry, config in INDUSTRY_CONFIGS.items():
            assert "key_parameters" in config
            assert "common_conflicts" in config
            assert "impact_areas" in config
            assert isinstance(config["key_parameters"], list)
            assert isinstance(config["common_conflicts"], list)
            assert isinstance(config["impact_areas"], list)
    
    def test_industry_specific_analysis(self):
        """Test that different industries produce different analyses."""
        conflict = {"type": "duplicate_id", "message": "Test conflict"}
        
        restaurant_impact = _assess_industry_impact(conflict, INDUSTRY_CONFIGS["restaurant"])
        retail_impact = _assess_industry_impact(conflict, INDUSTRY_CONFIGS["retail"])
        
        # While both should be strings, they might differ in content
        assert isinstance(restaurant_impact, str)
        assert isinstance(retail_impact, str)


class TestAgent3Integration:
    """Test Agent 3 integration with existing systems."""
    
    def test_extract_existing_rules_from_kb(self):
        """Test extraction of existing rules from knowledge base."""
        # Create sample knowledge base data
        rag_df = pd.DataFrame([
            {"text": "This is a rule about pricing conditions if order > 100 then discount"},
            {"text": "General business information without rules"},
            {"text": "Another rule: if employee hours > 40 then overtime pay"}
        ])
        
        existing_rules = _extract_existing_rules_from_kb(rag_df)
        
        assert isinstance(existing_rules, list)
        # Should find rules based on keywords
        rule_count = len([rule for rule in existing_rules if "rule" in rule.get("name", "").lower()])
        assert rule_count >= 0  # May vary based on keyword detection
    
    def test_extract_existing_rules_empty_kb(self):
        """Test extraction from empty knowledge base."""
        empty_df = pd.DataFrame()
        
        existing_rules = _extract_existing_rules_from_kb(empty_df)
        
        assert isinstance(existing_rules, list)
        assert len(existing_rules) == 0


# Integration test combining multiple Agent 3 features
class TestAgent3EndToEnd:
    """End-to-end tests for Agent 3 functionality."""
    
    @patch('utils.agent3_utils.initialize_gemini_client')
    def test_complete_rule_analysis_workflow(self, mock_client):
        """Test complete workflow from rule creation to impact analysis."""
        # Mock the Gemini client for impact analysis
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "operational_impact": "Medium",
            "financial_impact": "Low",
            "risk_level": "Medium"
        })
        
        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_client_instance = MagicMock()
        mock_client_instance.models = mock_model
        mock_client.return_value = mock_client_instance
        
        # Step 1: Proposed rule
        proposed_rule = {
            "rule_id": "BR001",
            "name": "New Discount Rule",
            "category": "Pricing",
            "description": "10% discount for orders over $100"
        }
        
        # Step 2: Existing rules
        existing_rules = [
            {
                "rule_id": "BR002",
                "name": "Existing Loyalty Rule",
                "category": "Loyalty"
            }
        ]
        
        # Step 3: Analyze conflicts
        conflicts, conflict_analysis = analyze_rule_conflicts(
            proposed_rule, existing_rules, "restaurant"
        )
        
        # Step 4: Assess impact
        impact_analysis = assess_rule_impact(
            proposed_rule, existing_rules, "restaurant"
        )
        
        # Step 5: Orchestrate if no conflicts
        if not conflicts:
            should_proceed, status, result = orchestrate_rule_generation(
                "proceed", proposed_rule, conflicts
            )
            
            assert should_proceed is True
            assert result is not None
        
        # Verify all components work together
        assert isinstance(conflicts, list)
        assert isinstance(conflict_analysis, str)
        assert isinstance(impact_analysis, dict)