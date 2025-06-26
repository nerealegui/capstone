#!/usr/bin/env python3

# Docker-specific script to run the Gradio UI for Gemini Chat Application
# This bypasses virtual environment checks since Docker provides isolation

import os
import sys
from pathlib import Path

def print_python_env_info():
    """Print information about the Python environment."""
    print("Setting up Gradio UI for Gemini Chat Application...")
    print("\nPython executable:", sys.executable)
    print("Python version:", sys.version)
    print("VIRTUAL_ENV:", os.environ.get('VIRTUAL_ENV'))
    print("sys.prefix:", sys.prefix)
    print("sys.base_prefix:", sys.base_prefix)
    print("Running in Docker container - no virtual environment needed\n")

def check_api_key():
    """Check if Google API key is set or available in .env file."""
    from dotenv import load_dotenv
    
    env_path = Path(__file__).parent / '.env'
    parent_env_path = Path(__file__).parent.parent / '.env'
    
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        print(f"Loaded API key from {env_path}")
    elif parent_env_path.exists():
        load_dotenv(dotenv_path=parent_env_path)
        print(f"Loaded API key from parent directory: {parent_env_path}")

    api_key = os.environ.get('GOOGLE_API_KEY')
    if api_key:
        print("✅ Google API key found in environment variables")
        return
    else:
        print("❌ Google API key not found. Please check your .env file or environment variables.")
        sys.exit(1)

def run_gradio_app():
    """Create and run the Gradio chat app."""
    try:
        from interface.chat_app import create_gradio_interface
        
        demo = create_gradio_interface()

        print("🚀 Starting Gradio UI...")
        print("🌐 Application will be available at http://localhost:7860")
        
        # Configure for Docker deployment
        demo.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False,
            debug=False
        )
    except Exception as e:
        print(f"❌ Failed to start Gradio application: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    print_python_env_info()
    check_api_key()
    run_gradio_app()
