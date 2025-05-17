#!/usr/bin/env python

# Simple script to run the Gradio UI for Gemini Chat Application

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed, install if missing."""
    dependencies = [
        "gradio==4.44.1",  # Specific newer version with Box component
        "google-generativeai",  # Correct package name with hyphen
        "python-dotenv"
    ]
    
    for dep in dependencies:
        try:
            # For gradio, check if we need to upgrade
            if dep.startswith("gradio"):
                import gradio
                current_version = gradio.__version__
                required_version = dep.split("==")[1]
                if current_version != required_version:
                    print(f"Upgrading gradio from {current_version} to {required_version}...")
                    subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", dep])
                    print(f"Successfully upgraded gradio to {required_version}")
                else:
                    print(f"Gradio {current_version} is already installed")
                continue
                
            __import__(dep.split('.')[0])
        except ImportError:
            print(f"Installing {dep}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(f"Successfully installed {dep}")

def check_api_key():
    """Check if Google API key is set or available in .env file."""
    try:
        from dotenv import load_dotenv
        
        # First try to load from the current directory
        env_path = Path(__file__).parent / '.env'
        parent_env_path = Path(__file__).parent.parent / '.env'
        
        # Check if .env exists in current directory or parent directory
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
            print(f"Loaded API key from {env_path}")
        elif parent_env_path.exists():
            load_dotenv(dotenv_path=parent_env_path)
            print(f"Loaded API key from parent directory: {parent_env_path}")
        
        # After loading from any available .env, check if we have the key
        api_key = os.environ.get('GOOGLE_API_KEY')
        if api_key:
            print("Google API key found in environment variables")
            return
            
        # If we get here, no API key was found in any .env file
        api_key = input("Please enter your Google API key: ")
        
        # Save the API key to .env file in current directory
        with open(env_path, 'w') as f:
            f.write(f"GOOGLE_API_KEY={api_key}")
        print(f"Created .env file with API key at {env_path}")
        
        # Set for current session
        os.environ['GOOGLE_API_KEY'] = api_key
                
    except ImportError:
        # If dotenv is not installed yet
        print("dotenv not installed yet, will check API key after dependencies are installed")
        api_key = os.environ.get('GOOGLE_API_KEY')
        if not api_key:
            api_key = input("Please enter your Google API key: ")
            os.environ['GOOGLE_API_KEY'] = api_key

def run_gradio_app():
    """Create and run a simple Gradio chat app."""
    # Import these modules only after dependencies have been checked and installed
    import gradio as gr
    from .chat_app import create_gradio_interface
    
    demo = create_gradio_interface()

    print("Starting Gradio UI...")
    print("Once the server starts, the UI will be available at http://127.0.0.1:7860")
    print("Press Ctrl+C to stop the server when you're done")
    
    demo.launch()

if __name__ == "__main__":
    print("Setting up Gradio UI for Gemini Chat Application...")
    check_dependencies()
    check_api_key()
    run_gradio_app()