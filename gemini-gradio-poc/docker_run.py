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
    if api_key and api_key != "your_actual_api_key_here" and api_key != "your_google_api_key_here":
        print("✅ Google API key found in environment variables")
        return
    else:
        print("\n" + "="*80)
        print("❌ ERROR: Missing or invalid Google API key")
        print("="*80)
        print("\nThis application requires a valid Google API key to function.")
        print("\nPlease provide your API key using one of these methods:")
        print("\n1️⃣  When using docker run:")
        print("   docker run -p 7860:7860 -e GOOGLE_API_KEY=your_actual_api_key_here ghcr.io/nerealegui/capstone:latest")
        print("\n2️⃣  When using docker-compose:")
        print("   GOOGLE_API_KEY=your_actual_api_key_here docker-compose up")
        print("\n3️⃣  Using a .env file in the project root containing:")
        print("   GOOGLE_API_KEY=your_actual_api_key_here")
        print("\nYou can get an API key from: https://makersuite.google.com/app/apikey")
        print("="*80 + "\n")
        sys.exit(1)

def run_gradio_app():
    """Create and run the Gradio chat app."""
    try:
        # Double check API key before starting
        api_key = os.environ.get('GOOGLE_API_KEY')
        if not api_key or api_key in ["your_actual_api_key_here", "your_google_api_key_here"]:
            import gradio as gr
            
            with gr.Blocks(theme=gr.themes.Soft()) as error_demo:
                gr.Markdown("""
                # ⚠️ Google API Key Not Configured
                
                This application requires a valid Google API key to function.
                
                ## How to fix this:
                
                ### Option 1: Pass API key directly to Docker
                
                ```bash
                docker run -p 7860:7860 -e GOOGLE_API_KEY=your_actual_api_key_here ghcr.io/nerealegui/capstone:latest
                ```
                
                ### Option 2: Using docker-compose with environment variable
                
                ```bash
                GOOGLE_API_KEY=your_actual_api_key_here docker-compose up
                ```
                
                ### Option 3: Create a .env file in the project root
                
                ```
                GOOGLE_API_KEY=your_actual_api_key_here
                ```
                
                Then run with:
                ```bash
                docker-compose up
                ```
                
                ### Get a Google API key
                
                You can obtain an API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
                
                See the [README.md](https://github.com/nerealegui/capstone/blob/main/README.md) for more information.
                """)
            
            print("⚠️ Starting with API key error message UI...")
            error_demo.launch(
                server_name="0.0.0.0",
                server_port=7860,
                share=False,
                debug=False
            )
            return
            
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
