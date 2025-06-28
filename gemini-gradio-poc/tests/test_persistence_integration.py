"""
Integration test for the persistence functionality with the chat app.
"""

import unittest
import os
import tempfile
import shutil
import pandas as pd
from unittest.mock import patch

# Add the parent directory to the path so we can import from utils  
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.persistence_manager import (
    save_knowledge_base,
    load_knowledge_base,
    save_rules,
    load_rules,
    clear_session,
    session_exists,
    get_session_summary
)


class TestPersistenceIntegration(unittest.TestCase):
    
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
    
    def test_full_session_workflow(self):
        """Test the complete session workflow from empty to populated to cleared."""
        
        # 1. Start with no session
        self.assertFalse(session_exists())
        summary = get_session_summary()
        self.assertEqual(summary, "No active session found")
        
        # 2. Add knowledge base data
        kb_df = pd.DataFrame({
            'filename': ['doc1.pdf', 'doc2.pdf', 'doc3.pdf'],
            'chunk': ['First chunk text', 'Second chunk text', 'Third chunk text'],
            'embedding': [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]
        })
        
        success, msg = save_knowledge_base(kb_df, "Initial KB setup")
        self.assertTrue(success)
        self.assertTrue(session_exists())
        
        # 3. Add rules data
        rules = [
            {
                "name": "Business Rule 1",
                "description": "First business rule",
                "category": "operations",
                "priority": "high",
                "active": True
            },
            {
                "name": "Business Rule 2", 
                "description": "Second business rule",
                "category": "compliance",
                "priority": "medium",
                "active": True
            }
        ]
        
        success, msg = save_rules(rules, "Initial rules setup")
        self.assertTrue(success)
        
        # 4. Verify session summary shows correct data
        summary = get_session_summary()
        self.assertIn("Knowledge Base:** 3 chunks", summary)
        self.assertIn("Rules:** 2 rules", summary)
        self.assertIn("Changes:** 2 logged changes", summary)  # KB save + rules save
        
        # 5. Simulate app restart by loading data
        loaded_kb, kb_msg = load_knowledge_base()
        loaded_rules, rules_msg = load_rules()
        
        self.assertIsNotNone(loaded_kb)
        self.assertIsNotNone(loaded_rules)
        self.assertEqual(len(loaded_kb), 3)
        self.assertEqual(len(loaded_rules), 2)
        
        # Verify data integrity
        pd.testing.assert_frame_equal(kb_df, loaded_kb)
        self.assertEqual(rules, loaded_rules)
        
        # 6. Add more data (simulating adding files to existing session)
        additional_kb = pd.DataFrame({
            'filename': ['doc4.pdf'],
            'chunk': ['Fourth chunk text'],
            'embedding': [[0.7, 0.8]]
        })
        
        # Merge with existing (this simulates how the real app works)
        merged_kb = pd.concat([loaded_kb, additional_kb], ignore_index=True)
        success, msg = save_knowledge_base(merged_kb, "Added new document doc4.pdf")
        self.assertTrue(success)
        
        # 7. Verify the session now has updated data
        updated_summary = get_session_summary()
        self.assertIn("Knowledge Base:** 4 chunks", updated_summary)
        self.assertIn("Changes:** 3 logged changes", updated_summary)
        
        # 8. Clear session and verify it's empty
        success, clear_msg = clear_session()
        self.assertTrue(success)
        self.assertFalse(session_exists())
        
        # Verify loading after clear returns None
        cleared_kb, _ = load_knowledge_base()
        cleared_rules, _ = load_rules()
        self.assertIsNone(cleared_kb)
        self.assertIsNone(cleared_rules)
        
        final_summary = get_session_summary()
        self.assertEqual(final_summary, "No active session found")
    
    def test_incremental_kb_updates(self):
        """Test incremental knowledge base updates (simulating multiple file uploads)."""
        
        # First upload
        kb1 = pd.DataFrame({
            'filename': ['doc1.pdf', 'doc1.pdf'],
            'chunk': ['Chapter 1 content', 'Chapter 2 content'],
            'embedding': [[0.1, 0.2], [0.3, 0.4]]
        })
        save_knowledge_base(kb1, "Uploaded doc1.pdf")
        
        # Second upload - add to existing
        loaded_kb, _ = load_knowledge_base()
        new_kb = pd.DataFrame({
            'filename': ['doc2.pdf'],
            'chunk': ['Introduction to doc2'],
            'embedding': [[0.5, 0.6]]
        })
        merged_kb = pd.concat([loaded_kb, new_kb], ignore_index=True)
        save_knowledge_base(merged_kb, "Added doc2.pdf to existing KB")
        
        # Third upload - add more
        loaded_kb, _ = load_knowledge_base()
        new_kb2 = pd.DataFrame({
            'filename': ['doc3.pdf', 'doc3.pdf'],
            'chunk': ['Doc3 section A', 'Doc3 section B'],
            'embedding': [[0.7, 0.8], [0.9, 1.0]]
        })
        final_kb = pd.concat([loaded_kb, new_kb2], ignore_index=True)
        save_knowledge_base(final_kb, "Added doc3.pdf to existing KB")
        
        # Verify final state
        final_loaded_kb, msg = load_knowledge_base()
        self.assertEqual(len(final_loaded_kb), 5)  # 2 + 1 + 2 chunks
        self.assertIn("5 chunks", msg)
        
        # Verify all filenames are preserved
        filenames = final_loaded_kb['filename'].tolist()
        self.assertIn('doc1.pdf', filenames)
        self.assertIn('doc2.pdf', filenames)
        self.assertIn('doc3.pdf', filenames)
    
    def test_error_handling(self):
        """Test error handling in persistence operations."""
        
        # Test with invalid data types (should still work due to pandas flexibility)
        try:
            invalid_df = pd.DataFrame({'invalid': [None, None]})
            success, msg = save_knowledge_base(invalid_df, "Invalid data test")
            self.assertTrue(success)  # Should still work
        except Exception as e:
            self.fail(f"save_knowledge_base should handle invalid data gracefully: {e}")
        
        # Test with invalid rules (should still work with JSON serialization)
        try:
            weird_rules = [{"name": None, "data": [1, 2, 3]}]
            success, msg = save_rules(weird_rules, "Weird rules test")
            self.assertTrue(success)  # Should still work
        except Exception as e:
            self.fail(f"save_rules should handle weird data gracefully: {e}")


if __name__ == '__main__':
    unittest.main()