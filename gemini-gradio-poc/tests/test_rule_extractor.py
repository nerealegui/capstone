import pytest
import pandas as pd
import json
import os
import sys
from unittest.mock import patch, MagicMock

# Add the utils directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

from rule_extractor import (
    extract_rules_from_csv, 
    validate_rule_conflicts, 
    save_extracted_rules,
    _basic_csv_to_json_conversion,
    _convert_all_csv_rules_to_json
)

def test_basic_csv_to_json_conversion():
    """Test basic CSV to JSON conversion fallback."""
    csv_rule = {
        "rule_id": "BR001",
        "rule_name": "Test Rule",
        "category": "Discount",
        "description": "Test description",
        "condition": "order > 100",
        "action": "apply 10% discount",
        "priority": "High",
        "active": True
    }
    
    result = _basic_csv_to_json_conversion(csv_rule)
    
    assert result["rule_id"] == "BR001"
    assert result["name"] == "Test Rule"
    assert result["category"] == "Discount"
    assert result["description"] == "Test description"
    assert result["priority"] == "High"
    assert result["active"] == True
    assert len(result["conditions"]) == 1
    assert len(result["actions"]) == 1

def test_validate_rule_conflicts():
    """Test rule conflict validation."""
    existing_rules = [
        {
            "rule_id": "BR001",
            "name": "Existing Rule",
            "category": "Discount"
        }
    ]
    
    # Test duplicate ID conflict
    new_rule_duplicate_id = {
        "rule_id": "BR001",
        "name": "New Rule",
        "category": "Pricing"
    }
    
    conflicts = validate_rule_conflicts(new_rule_duplicate_id, existing_rules)
    assert len(conflicts) == 1
    assert conflicts[0]["type"] == "duplicate_id"
    
    # Test duplicate rule conflict
    new_rule_duplicate_name = {
        "rule_id": "BR002",
        "name": "Existing Rule",
        "category": "Discount"
    }
    
    conflicts = validate_rule_conflicts(new_rule_duplicate_name, existing_rules)
    assert len(conflicts) == 1
    assert conflicts[0]["type"] == "duplicate_rule"
    
    # Test no conflicts
    new_rule_clean = {
        "rule_id": "BR002",
        "name": "New Rule",
        "category": "Pricing"
    }
    
    conflicts = validate_rule_conflicts(new_rule_clean, existing_rules)
    assert len(conflicts) == 0

def test_save_extracted_rules(tmp_path):
    """Test saving extracted rules to file."""
    rules = [
        {
            "rule_id": "BR001",
            "name": "Test Rule",
            "category": "Discount"
        }
    ]
    
    output_path = tmp_path / "test_rules.json"
    result = save_extracted_rules(rules, str(output_path))
    
    assert result == True
    assert output_path.exists()
    
    # Verify content
    with open(output_path, 'r') as f:
        saved_rules = json.load(f)
    
    assert len(saved_rules) == 1
    assert saved_rules[0]["rule_id"] == "BR001"

@patch('rule_extractor.pd.read_csv')
@patch('rule_extractor._convert_all_csv_rules_to_json')
def test_extract_rules_from_csv(mock_convert_all, mock_read_csv):
    """Test CSV rule extraction with batch processing."""
    # Mock CSV data
    mock_df = pd.DataFrame([
        {
            "rule_id": "BR001",
            "rule_name": "Test Rule 1",
            "category": "Discount"
        },
        {
            "rule_id": "BR002",
            "rule_name": "Test Rule 2",
            "category": "Pricing"
    }
    ])
    mock_read_csv.return_value = mock_df
    
    # Mock batch conversion
    mock_convert_all.return_value = [
        {
            "rule_id": "BR001",
            "name": "Test Rule 1",
            "category": "Discount"
        },
        {
            "rule_id": "BR002",
            "name": "Test Rule 2",
            "category": "Pricing"
        }
    ]
    
    result = extract_rules_from_csv("test.csv")
    
    assert len(result) == 2
    assert result[0]["rule_id"] == "BR002"
    mock_read_csv.assert_called_once_with("test.csv")
    mock_convert_all.assert_called_once()

@patch('rule_extractor.initialize_gemini_client')
def test_convert_all_csv_rules_to_json(mock_initialize_client):
    """Test batch conversion of CSV rules to JSON."""
    # Create a mock for the Gemini client and its model
    mock_client = MagicMock()
    mock_model = MagicMock()
    mock_client.models.generate_content.return_value = MagicMock()
    mock_client.models = mock_model
    mock_initialize_client.return_value = mock_client
    
    # Mock the response text
    mock_response = MagicMock()
    mock_response.text = json.dumps([
        {
            "rule_id": "BR001",
            "name": "Test Rule 1",
            "category": "Discount"
        },
        {
            "rule_id": "BR002",
            "name": "Test Rule 2",
            "category": "Pricing"
        }
    ])
    mock_client.models.generate_content.return_value = mock_response
    
    # Test data
    csv_rules = [
        {
            "rule_id": "BR001",
            "rule_name": "Test Rule 1",
            "category": "Discount"
        },
        {
            "rule_id": "BR002",
            "rule_name": "Test Rule 2",
            "category": "Pricing"
        }
    ]
    
    result = _convert_all_csv_rules_to_json(csv_rules)
    
    # Verify the results
    assert len(result) == 2
    assert result[0]["rule_id"] == "BR001"
    assert result[1]["rule_id"] == "BR002"
    
    # Verify the client was called correctly
    mock_initialize_client.assert_called_once()
    mock_client.models.generate_content.assert_called_once()
    
    # Test error handling with fallback
    mock_client.models.generate_content.side_effect = Exception("API Error")
    result = _convert_all_csv_rules_to_json(csv_rules)
    
    # Should fallback to basic conversion
    assert len(result) == 2
    assert result[0]["rule_id"] == "BR001"