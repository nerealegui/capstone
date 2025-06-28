"""
Tests for Langraph Workflow Orchestrator

This module contains tests for the Langraph-based workflow orchestration
system for business rule management.
"""

import pandas as pd
from unittest.mock import patch, MagicMock
from utils.workflow_orchestrator import BusinessRuleWorkflow, run_business_rule_workflow


class TestWorkflowOrchestrator:
    """Test cases for the Langraph workflow orchestrator"""
    
    def test_create_workflow(self):
        """Test that workflow can be created successfully"""
        workflow = BusinessRuleWorkflow()
        assert workflow.graph is not None
        print("✓ Workflow creation test passed")
    
    @patch('utils.workflow_orchestrator.initialize_gemini_client')
    @patch('utils.workflow_orchestrator.json_to_drl_gdst')
    @patch('utils.workflow_orchestrator.verify_drools_execution')
    @patch('utils.workflow_orchestrator.analyze_rule_conflicts')
    @patch('utils.workflow_orchestrator.assess_rule_impact')
    @patch('utils.workflow_orchestrator.orchestrate_rule_generation')
    @patch('utils.workflow_orchestrator.generate_conversational_response')
    def test_workflow_execution(
        self, 
        mock_generate_response,
        mock_orchestrate,
        mock_assess_impact,
        mock_analyze_conflicts,
        mock_verify,
        mock_json_to_drl,
        mock_init_client
    ):
        """Test complete workflow execution with mocked dependencies"""
        
        # Setup mocks
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"name": "Test Rule", "conditions": ["amount > 100"], "actions": ["apply discount"]}'
        mock_client.models.generate_content.return_value = mock_response
        mock_init_client.return_value = mock_client
        
        mock_analyze_conflicts.return_value = ([], "No conflicts found")
        mock_assess_impact.return_value = {"impact": "low"}
        mock_orchestrate.return_value = (True, "Proceeding with generation", None)
        mock_json_to_drl.return_value = ("drl content", "gdst content")
        mock_verify.return_value = "Verification passed"
        mock_generate_response.return_value = "Rule processed successfully"
        
        # Test workflow execution
        result = run_business_rule_workflow(
            user_input="If order amount is greater than $100, apply 10% discount",
            industry="retail"
        )
        
        # Verify results
        assert result is not None
        assert "response" in result
        assert result.get("error") is None or result.get("error") == ""
        
        print("✓ Workflow execution test passed")
    
    @patch('utils.workflow_orchestrator.initialize_gemini_client')
    def test_workflow_with_error_handling(self, mock_init_client):
        """Test workflow error handling"""
        
        # Setup mock to raise an error
        mock_init_client.side_effect = Exception("API connection failed")
        
        result = run_business_rule_workflow(
            user_input="Test input that will fail",
            industry="generic"
        )
        
        # Verify error handling
        assert result is not None
        assert "error" in result
        assert result["error"] is not None
        
        print("✓ Workflow error handling test passed")
    
    def test_workflow_with_rag_dataframe(self):
        """Test workflow with RAG DataFrame"""
        
        # Create sample RAG DataFrame
        rag_df = pd.DataFrame({
            'text': ['Sample rule about discounts', 'Another business rule'],
            'embeddings': [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
        })
        
        with patch('utils.workflow_orchestrator.initialize_gemini_client') as mock_init_client:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.text = '{"name": "Test Rule", "conditions": [], "actions": []}'
            mock_client.models.generate_content.return_value = mock_response
            mock_init_client.return_value = mock_client
            
            result = run_business_rule_workflow(
                user_input="Create a discount rule",
                rag_df=rag_df,
                industry="retail"
            )
            
            assert result is not None
            assert "response" in result
            
        print("✓ Workflow with RAG DataFrame test passed")


if __name__ == "__main__":
    # Run basic tests
    test_instance = TestWorkflowOrchestrator()
    
    try:
        test_instance.test_create_workflow()
        test_instance.test_workflow_execution()
        test_instance.test_workflow_with_error_handling()
        test_instance.test_workflow_with_rag_dataframe()
        print("\n✅ All workflow tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise