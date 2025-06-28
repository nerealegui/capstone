"""Test suite for configuration management functionality."""

import unittest
import pytest
import os
import tempfile
from unittest.mock import patch
from utils.config_manager import (
    get_default_config,
    save_config,
    load_config,
    validate_config,
    apply_config_to_runtime,
    get_config_summary,
    reset_config_to_defaults,
    merge_configs
)

class TestConfigManager(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_config_dir = tempfile.mkdtemp()
        self.test_config_file = os.path.join(self.test_config_dir, "test_config.json")
        
    def tearDown(self):
        """Clean up test fixtures."""
        if os.path.exists(self.test_config_file):
            os.remove(self.test_config_file)
        os.rmdir(self.test_config_dir)
    
    def test_get_default_config(self):
        """Test getting default configuration."""
        config = get_default_config()
        
        # Check required keys exist
        required_keys = ["agent_prompts", "model_config", "agent3_settings"]
        for key in required_keys:
            self.assertIn(key, config)
        
        # Check agent prompts structure
        agent_prompt_keys = ["agent1", "agent2", "agent3"]
        for key in agent_prompt_keys:
            self.assertIn(key, config["agent_prompts"])
            self.assertIsInstance(config["agent_prompts"][key], str)
        
        # Check Agent 3 settings
        agent3_keys = ["industry", "enabled"]
        for key in agent3_keys:
            self.assertIn(key, config["agent3_settings"])
    
    @patch('utils.config_manager.CONFIG_FILE')
    def test_save_and_load_config(self, mock_config_file):
        """Test saving and loading configuration."""
        mock_config_file.return_value = self.test_config_file
        
        # Get default config and modify it
        config = get_default_config()
        config["agent3_settings"]["industry"] = "restaurant"
        config["agent3_settings"]["chat_mode"] = "Standard Chat"
        
        # Test saving
        with patch('utils.config_manager.CONFIG_FILE', self.test_config_file):
            success, msg = save_config(config)
            self.assertTrue(success)
            self.assertIn("successfully", msg.lower())
        
        # Test loading
        with patch('utils.config_manager.CONFIG_FILE', self.test_config_file):
            loaded_config, load_msg = load_config()
            self.assertEqual(loaded_config["agent3_settings"]["industry"], "restaurant")
            self.assertEqual(loaded_config["agent3_settings"]["chat_mode"], "Standard Chat")
    
    def test_validate_config(self):
        """Test configuration validation."""
        # Test valid config
        valid_config = get_default_config()
        is_valid, msg = validate_config(valid_config)
        self.assertTrue(is_valid)
        
        # Test invalid config - missing required key
        invalid_config = valid_config.copy()
        del invalid_config["agent_prompts"]
        is_valid, msg = validate_config(invalid_config)
        self.assertFalse(is_valid)
        self.assertIn("agent_prompts", msg.lower())
        
        # Test invalid industry
        invalid_industry_config = get_default_config()
        invalid_industry_config["agent3_settings"]["industry"] = "invalid_industry"
        is_valid, msg = validate_config(invalid_industry_config)
        self.assertFalse(is_valid)
        self.assertIn("industry", msg.lower())
    
    def test_apply_config_to_runtime(self):
        """Test applying configuration to runtime."""
        config = get_default_config()
        success, msg = apply_config_to_runtime(config)
        self.assertTrue(success)
        self.assertIn("successfully", msg.lower())
        
        # Test with invalid config
        invalid_config = {"incomplete": "config"}
        success, msg = apply_config_to_runtime(invalid_config)
        self.assertFalse(success)
        self.assertIn("invalid", msg.lower())
    
    def test_get_config_summary(self):
        """Test configuration summary generation."""
        config = get_default_config()
        summary = get_config_summary(config)
        
        # Check that summary contains expected information
        self.assertIn("Model", summary)
        self.assertIn("Industry", summary)
        self.assertIn("Temperature", summary)
        self.assertIn("Response Format", summary)
    
    @patch('utils.config_manager.CONFIG_FILE')
    def test_reset_config_to_defaults(self, mock_config_file):
        """Test resetting configuration to defaults."""
        mock_config_file.return_value = self.test_config_file
        
        with patch('utils.config_manager.CONFIG_FILE', self.test_config_file):
            success, msg = reset_config_to_defaults()
            self.assertTrue(success)
            self.assertIn("reset", msg.lower())
    
    def test_merge_configs(self):
        """Test merging configurations."""
        default_config = {
            "a": {"x": 1, "y": 2},
            "b": "default_value"
        }
        
        user_config = {
            "a": {"x": 10},  # Override x but keep y
            "c": "new_value"  # Add new key
        }
        
        merged = merge_configs(default_config, user_config)
        
        # Check merged values
        self.assertEqual(merged["a"]["x"], 10)  # Overridden
        self.assertEqual(merged["a"]["y"], 2)   # Preserved
        self.assertEqual(merged["b"], "default_value")  # Preserved
        self.assertEqual(merged["c"], "new_value")  # Added

class TestConfigManagerIntegration(unittest.TestCase):
    """Integration tests for configuration manager with interface functions."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_config_dir = tempfile.mkdtemp()
        self.test_config_file = os.path.join(self.test_config_dir, "test_config.json")
    
    def tearDown(self):
        """Clean up test fixtures."""
        if os.path.exists(self.test_config_file):
            os.remove(self.test_config_file)
        os.rmdir(self.test_config_dir)
    
    @patch('utils.config_manager.CONFIG_FILE')
    def test_save_apply_workflow(self, mock_config_file):
        """Test the complete save and apply workflow."""
        pytest.skip("Skipping integration test requiring gradio - core functionality tested above")
        
if __name__ == '__main__':
    unittest.main()