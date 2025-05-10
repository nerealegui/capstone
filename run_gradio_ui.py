#!/usr/bin/env python

# Simple script to run the Gradio UI for Gemini Chat Application

import os
import sys
import subprocess
import webbrowser
from pathlib import Path
import gradio as gr

def check_dependencies():
    """Check if required dependencies are installed, install if missing."""
    # First, check if requirements.txt exists
    req_path = Path(__file__).parent / 'gemini-gradio-poc' / 'requirements.txt'
    
    if req_path.exists():
        print(f"Installing dependencies from {req_path}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(req_path)])
    else:
        # Fallback to basic dependencies
        dependencies = [
            "gradio",
            "google-generativeai",
            "pandas",
            "numpy",
            "scikit-learn",
            "python-docx",
            "PyPDF2",
            "python-dotenv"
        ]
        
        for dep in dependencies:
            try:
                __import__(dep.split('.')[0])
            except ImportError:
                print(f"Installing {dep}...")
                subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
                print(f"Successfully installed {dep}")
    
    # Now that we've ensured python-dotenv is installed, import it
    from dotenv import load_dotenv
    return load_dotenv

def check_api_key():
    """Check if Google API key is set."""
    # First, try to load from .env file
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / '.env'
    load_dotenv(dotenv_path=env_path)
    
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        api_key = input("Please enter your Google API key: ")
        os.environ['GOOGLE_API_KEY'] = api_key
        print("API key set for this session")
        print("For permanent setup, add this to your .env file:")
        print(f"GOOGLE_API_KEY={api_key}")
        
        # Ask if user wants to save to .env file
        save_to_env = input("Do you want to save this API key to the .env file? (y/n): ")
        if save_to_env.lower() == 'y':
            with open(env_path, 'a+') as env_file:
                env_file.write(f"\nGOOGLE_API_KEY={api_key}")
            print(f"API key saved to {env_path}")

def run_gradio_app():
    """Create and run a simple Gradio chat app."""
    # Import after dependencies are installed
    sys.path.insert(0, str(Path(__file__).parent))
    
    # Try to import the module
    try:
        sys.path.insert(0, str(Path(__file__).parent / 'gemini-gradio-poc'))
        from chat_app import create_gradio_interface
    except ImportError as e:
        print(f"Error importing chat_app module: {e}")
        return
    
    demo = create_gradio_interface()
    demo.launch()

if __name__ == "__main__":
    print("Setting up Gradio UI for Gemini Chat Application...")
    load_dotenv = check_dependencies()
    
    # Load environment variables from .env file if it exists
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        print(f"Loaded environment variables from {env_path}")
    else:
        print(f"No .env file found at {env_path}")
    
    check_api_key()
    run_gradio_app()