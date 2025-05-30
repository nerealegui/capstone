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
    _basic_csv_to_json_conversion
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
@patch('rule_extractor._convert_csv_rule_to_json')
def test_extract_rules_from_csv(mock_convert, mock_read_csv):
    """Test CSV rule extraction."""
    # Mock CSV data
    mock_df = pd.DataFrame([
        {
            "rule_id": "BR001",
            "rule_name": "Test Rule",
            "category": "Discount"
        }
    ])
    mock_read_csv.return_value = mock_df
    
    # Mock conversion
    mock_convert.return_value = {
        "rule_id": "BR001",
        "name": "Test Rule",
        "category": "Discount"
    }
    
    result = extract_rules_from_csv("test.csv")
    
    assert len(result) == 1
    assert result[0]["rule_id"] == "BR001"
    mock_read_csv.assert_called_once_with("test.csv")
    mock_convert.assert_called_once()