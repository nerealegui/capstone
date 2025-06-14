"""Configuration management system for saving and loading agent configurations."""

import json
import os
from typing import Dict, Any, Tuple
from config.agent_config import (
    AGENT1_PROMPT, AGENT2_PROMPT, AGENT3_PROMPT, 
    DEFAULT_MODEL, GENERATION_CONFIG, AGENT3_GENERATION_CONFIG,
    INDUSTRY_CONFIGS
)

# Configuration file path
CONFIG_FILE = "config/user_config.json"

def reload_prompts_from_defaults() -> Tuple[bool, str]:
    """
    Force reload prompts from agent_config.py into the runtime configuration.
    
    Returns:
        Tuple[bool, str]: Reload status and message
    """
    try:
        # Load default configuration
        default_config = get_default_config()
        
        # Extract prompts from default configuration
        prompts = default_config["agent_prompts"]
        
        # Load existing configuration
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
        else:
            config = default_config
        
        # Update prompts in the existing configuration
        config["agent_prompts"] = prompts
        
        # Save updated configuration
        success, msg = save_config(config)
        if success:
            return True, "Prompts reloaded successfully from defaults."
        else:
            return False, f"Error saving updated configuration: {msg}"
    
    except Exception as e:
        return False, f"Error reloading prompts: {str(e)}"

def get_default_config() -> Dict[str, Any]:
    """Get the default configuration."""
    return {
        "agent_prompts": {
            "agent1": AGENT1_PROMPT,
            "agent2": AGENT2_PROMPT,
            "agent3": AGENT3_PROMPT
        },
        "model_config": {
            "default_model": DEFAULT_MODEL,
            "generation_config": GENERATION_CONFIG,
            "agent3_generation_config": AGENT3_GENERATION_CONFIG
        },
        "agent3_settings": {
            "industry": "generic",
            "chat_mode": "Enhanced Agent 3",
            "enabled": True
        },
        "ui_settings": {
            "default_tab": "Chat & Rule Summary"
        }
    }

def save_config(config: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Save configuration to file.
    
    Args:
        config (Dict): Configuration dictionary to save
        
    Returns:
        Tuple[bool, str]: Success status and message
    """
    try:
        # Ensure config directory exists
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        
        return True, f"Configuration saved successfully to {CONFIG_FILE}"
    
    except Exception as e:
        return False, f"Error saving configuration: {str(e)}"

def load_config() -> Tuple[Dict[str, Any], str]:
    """
    Load configuration from file, or return default if file doesn't exist.
    
    Returns:
        Tuple[Dict, str]: Configuration dictionary and status message
    """
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
            
            # Validate and merge with defaults to ensure all keys exist
            default_config = get_default_config()
            merged_config = merge_configs(default_config, config)
            
            return merged_config, f"Configuration loaded from {CONFIG_FILE}"
        else:
            default_config = get_default_config()
            return default_config, "Using default configuration (no saved config found)"
    
    except Exception as e:
        default_config = get_default_config()
        return default_config, f"Error loading configuration: {str(e)}. Using defaults."

def merge_configs(default: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge user configuration with default configuration.
    
    Args:
        default (Dict): Default configuration
        user (Dict): User configuration
        
    Returns:
        Dict: Merged configuration
    """
    result = default.copy()
    
    for key, value in user.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_configs(result[key], value)
        else:
            result[key] = value
    
    return result

def validate_config(config: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate configuration structure and values.
    
    Args:
        config (Dict): Configuration to validate
        
    Returns:
        Tuple[bool, str]: Validation status and message
    """
    try:
        # Check required top-level keys
        required_keys = ["agent_prompts", "model_config", "agent3_settings"]
        for key in required_keys:
            if key not in config:
                return False, f"Missing required configuration key: {key}"
        
        # Check agent prompts
        agent_prompt_keys = ["agent1", "agent2", "agent3"]
        for key in agent_prompt_keys:
            if key not in config["agent_prompts"]:
                return False, f"Missing agent prompt: {key}"
            if not isinstance(config["agent_prompts"][key], str):
                return False, f"Agent prompt {key} must be a string"
        
        # Check model config
        model_keys = ["default_model", "generation_config"]
        for key in model_keys:
            if key not in config["model_config"]:
                return False, f"Missing model config key: {key}"
        
        # Check Agent 3 settings
        agent3_keys = ["industry", "chat_mode", "enabled"]
        for key in agent3_keys:
            if key not in config["agent3_settings"]:
                return False, f"Missing Agent 3 setting: {key}"
        
        # Validate industry selection
        if config["agent3_settings"]["industry"] not in INDUSTRY_CONFIGS:
            return False, f"Invalid industry: {config['agent3_settings']['industry']}"
        
        # Validate chat mode
        valid_modes = ["Standard Chat", "Enhanced Agent 3"]
        if config["agent3_settings"]["chat_mode"] not in valid_modes:
            return False, f"Invalid chat mode: {config['agent3_settings']['chat_mode']}"
        
        return True, "Configuration is valid"
    
    except Exception as e:
        return False, f"Configuration validation error: {str(e)}"

def apply_config_to_runtime(config: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Apply configuration changes to runtime variables.
    
    Args:
        config (Dict): Configuration to apply
        
    Returns:
        Tuple[bool, str]: Application status and message
    """
    try:
        # Note: In a production system, you might want to modify the actual config module
        # For now, we'll return success as the configuration will be used by the UI
        
        # Validate configuration first
        is_valid, validation_msg = validate_config(config)
        if not is_valid:
            return False, f"Cannot apply invalid configuration: {validation_msg}"
        
        # In a real implementation, you might update global variables or reload modules
        # For this implementation, the UI will read the saved config directly
        
        return True, "Configuration applied successfully to runtime"
    
    except Exception as e:
        return False, f"Error applying configuration: {str(e)}"

def get_config_summary(config: Dict[str, Any]) -> str:
    """
    Generate a summary of the current configuration.
    
    Args:
        config (Dict): Configuration dictionary
        
    Returns:
        str: Configuration summary
    """
    try:
        summary_lines = [
            "📋 **Configuration Summary**",
            "",
            f"🤖 **Model**: {config['model_config']['default_model']}",
            f"🏭 **Industry**: {config['agent3_settings']['industry'].title()}",
            f"💬 **Chat Mode**: {config['agent3_settings']['chat_mode']}",
            f"✅ **Agent 3 Enabled**: {config['agent3_settings']['enabled']}",
            "",
            "📝 **Agent Prompts**:",
            f"- Agent 1: {len(config['agent_prompts']['agent1'])} characters",
            f"- Agent 2: {len(config['agent_prompts']['agent2'])} characters", 
            f"- Agent 3: {len(config['agent_prompts']['agent3'])} characters",
            "",
            "⚙️ **Generation Config**:",
            f"- Response Format: {config['model_config']['generation_config'].get('response_mime_type', 'N/A')}",
            f"- Temperature: {config['model_config'].get('agent3_generation_config', {}).get('temperature', 'N/A')}"
        ]
        
        return "\n".join(summary_lines)
    
    except Exception as e:
        return f"Error generating config summary: {str(e)}"

def reset_config_to_defaults() -> Tuple[bool, str]:
    """
    Reset configuration to default values.
    
    Returns:
        Tuple[bool, str]: Reset status and message
    """
    try:
        default_config = get_default_config()
        success, msg = save_config(default_config)
        
        if success:
            return True, "Configuration reset to defaults successfully"
        else:
            return False, f"Error resetting configuration: {msg}"
    
    except Exception as e:
        return False, f"Error resetting configuration: {str(e)}"