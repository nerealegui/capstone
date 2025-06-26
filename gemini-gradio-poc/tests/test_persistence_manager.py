"""
Unit tests for the persistence manager module.
"""

import unittest
import os
import tempfile
import shutil
import pandas as pd
import json
from unittest.mock import patch
from datetime import datetime

# Add the parent directory to the path so we can import from utils
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.persistence_manager import (
    save_knowledge_base,
    load_knowledge_base,
    save_rules,
    load_rules,
    log_change,
    get_change_log,
    update_session_metadata,
    get_session_metadata,
    session_exists,
    clear_session,
    get_session_summary,
    PERSISTENCE_DIR,
    KB_FILE,
    RULES_FILE,
    CHANGELOG_FILE,
    SESSION_METADATA_FILE
)


class TestPersistenceManager(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures with temporary directory."""
        self.test_dir = tempfile.mkdtemp()
        # Patch the PERSISTENCE_DIR to use our test directory
        self.persistence_dir_patcher = patch('utils.persistence_manager.PERSISTENCE_DIR', self.test_dir)
        self.persistence_dir_patcher.start()
        
    def tearDown(self):
        """Clean up test fixtures."""
        self.persistence_dir_patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    def test_save_and_load_knowledge_base(self):
        """Test saving and loading knowledge base DataFrame."""
        # Create test DataFrame
        test_df = pd.DataFrame({
            'filename': ['doc1.pdf', 'doc2.pdf'],
            'chunk': ['chunk1 text', 'chunk2 text'],
            'embedding': [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
        })
        
        # Test saving
        success, save_msg = save_knowledge_base(test_df, "Test save operation")
        self.assertTrue(success)
        self.assertIn("successfully", save_msg.lower())
        self.assertIn("2 chunks", save_msg)
        
        # Test loading
        loaded_df, load_msg = load_knowledge_base()
        self.assertIsNotNone(loaded_df)
        self.assertIn("successfully", load_msg.lower())
        self.assertEqual(len(loaded_df), 2)
        
        # Verify data integrity
        pd.testing.assert_frame_equal(test_df, loaded_df)
    
    def test_save_and_load_rules(self):
        """Test saving and loading rules."""
        # Create test rules
        test_rules = [
            {
                "name": "Test Rule 1",
                "description": "A test rule",
                "category": "test",
                "priority": "high",
                "active": True
            },
            {
                "name": "Test Rule 2", 
                "description": "Another test rule",
                "category": "test",
                "priority": "medium",
                "active": False
            }
        ]
        
        # Test saving
        success, save_msg = save_rules(test_rules, "Test rules save")
        self.assertTrue(success)
        self.assertIn("successfully", save_msg.lower())
        self.assertIn("2 rules", save_msg)
        
        # Test loading
        loaded_rules, load_msg = load_rules()
        self.assertIsNotNone(loaded_rules)
        self.assertIn("successfully", load_msg.lower())
        self.assertEqual(len(loaded_rules), 2)
        
        # Verify data integrity
        self.assertEqual(test_rules, loaded_rules)
    
    def test_change_logging(self):
        """Test change logging functionality."""
        # Log some changes
        success1 = log_change("knowledge_base", "Added new documents", {"count": 5})
        success2 = log_change("rules", "Updated rule priority", {"rule_id": "rule1"})
        
        self.assertTrue(success1)
        self.assertTrue(success2)
        
        # Retrieve change log
        changes = get_change_log()
        self.assertEqual(len(changes), 2)
        
        # Verify change structure
        change1 = changes[0]
        self.assertEqual(change1["component"], "knowledge_base")
        self.assertEqual(change1["description"], "Added new documents")
        self.assertEqual(change1["metadata"]["count"], 5)
        self.assertIn("timestamp", change1)
        
        change2 = changes[1]
        self.assertEqual(change2["component"], "rules")
        self.assertEqual(change2["description"], "Updated rule priority")
        self.assertEqual(change2["metadata"]["rule_id"], "rule1")
    
    def test_session_metadata(self):
        """Test session metadata management."""
        # Update metadata
        success1 = update_session_metadata("test_key", "test_value")
        success2 = update_session_metadata("numeric_key", 42)
        
        self.assertTrue(success1)
        self.assertTrue(success2)
        
        # Retrieve metadata
        metadata = get_session_metadata()
        self.assertEqual(metadata["test_key"], "test_value")
        self.assertEqual(metadata["numeric_key"], 42)
        self.assertIn("session_created", metadata)
        self.assertIn("session_id", metadata)
        self.assertIn("last_modified", metadata)
    
    def test_session_exists(self):
        """Test session existence detection."""
        # Initially no session should exist
        self.assertFalse(session_exists())
        
        # Create some session data
        test_df = pd.DataFrame({'test': [1, 2, 3]})
        save_knowledge_base(test_df, "Test session creation")
        
        # Now session should exist
        self.assertTrue(session_exists())
    
    def test_clear_session(self):
        """Test session clearing functionality."""
        # Create session data
        test_df = pd.DataFrame({'test': [1, 2, 3]})
        test_rules = [{"name": "test", "active": True}]
        
        save_knowledge_base(test_df, "Create test session")
        save_rules(test_rules, "Add test rules")
        log_change("test", "Test change")
        update_session_metadata("test", "value")
        
        # Verify session exists
        self.assertTrue(session_exists())
        
        # Clear session
        success, clear_msg = clear_session()
        self.assertTrue(success)
        self.assertIn("successfully", clear_msg.lower())
        
        # Verify session is cleared
        self.assertFalse(session_exists())
        
        # Verify loading returns None/empty
        kb_df, _ = load_knowledge_base()
        rules, _ = load_rules()
        changes = get_change_log()
        metadata = get_session_metadata()
        
        self.assertIsNone(kb_df)
        self.assertIsNone(rules)
        self.assertEqual(len(changes), 0)
        self.assertEqual(len(metadata), 0)
    
    def test_get_session_summary(self):
        """Test session summary generation."""
        # Test with no session
        summary = get_session_summary()
        self.assertEqual(summary, "No active session found")
        
        # Create session data
        test_df = pd.DataFrame({'test': [1, 2, 3]})
        test_rules = [{"name": "test1"}, {"name": "test2"}]
        
        save_knowledge_base(test_df, "Test KB")
        save_rules(test_rules, "Test rules")
        log_change("test", "Test change")
        
        # Test with session data
        summary = get_session_summary()
        self.assertIn("Session ID:", summary)
        self.assertIn("Knowledge Base:** 3 chunks", summary)
        self.assertIn("Rules:** 2 rules", summary)
        self.assertIn("Changes:** 3 logged changes", summary)  # 2 from saves + 1 manual
    
    def test_load_nonexistent_data(self):
        """Test loading when no data exists."""
        # Test loading KB when none exists
        kb_df, kb_msg = load_knowledge_base()
        self.assertIsNone(kb_df)
        self.assertIn("No saved knowledge base found", kb_msg)
        
        # Test loading rules when none exist
        rules, rules_msg = load_rules()
        self.assertIsNone(rules)
        self.assertIn("No saved rules found", rules_msg)
        
        # Test getting change log when none exists
        changes = get_change_log()
        self.assertEqual(len(changes), 0)
        
        # Test getting metadata when none exists
        metadata = get_session_metadata()
        self.assertEqual(len(metadata), 0)
    
    def test_empty_dataframe_handling(self):
        """Test handling of empty DataFrames."""
        empty_df = pd.DataFrame()
        
        success, save_msg = save_knowledge_base(empty_df, "Empty DataFrame test")
        self.assertTrue(success)
        self.assertIn("0 chunks", save_msg)
        
        loaded_df, load_msg = load_knowledge_base()
        self.assertIsNotNone(loaded_df)
        self.assertEqual(len(loaded_df), 0)
    
    def test_empty_rules_handling(self):
        """Test handling of empty rules list."""
        empty_rules = []
        
        success, save_msg = save_rules(empty_rules, "Empty rules test")
        self.assertTrue(success)
        self.assertIn("0 rules", save_msg)
        
        loaded_rules, load_msg = load_rules()
        self.assertIsNotNone(loaded_rules)
        self.assertEqual(len(loaded_rules), 0)


if __name__ == '__main__':
    unittest.main()