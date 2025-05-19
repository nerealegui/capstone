#!/usr/bin/env python

# Simple script to run the Gradio UI for Gemini Chat Application

import os
import sys
import subprocess
from pathlib import Path

def ensure_virtualenv():
    """Ensure the script is running inside a virtual environment."""
    # Check for VIRTUAL_ENV environment variable (set by venv activation)
    if os.environ.get('VIRTUAL_ENV'):
        return
    # Fallback to sys.prefix check for older venvs
    if sys.prefix == sys.base_prefix:
        venv_path = Path(__file__).parent / 'venv'
        if not venv_path.exists():
            print("Creating virtual environment...")
            subprocess.check_call([sys.executable, "-m", "venv", str(venv_path)])
            print(f"✅ Virtual environment created at {venv_path}")
        activation_command = f"source {venv_path}/bin/activate"
        print("\n⚠️  Please activate the virtual environment before running this script again:")
        print(f"\n\t{activation_command}\n")
        sys.exit(1)

def check_dependencies():
    """Check if required dependencies are installed, install if missing."""
    dependencies = [
        "gradio==5.29.0",
        "google-genai",
        "python-dotenv"
    ]
    pip_args = [sys.executable, "-m", "pip", "install"]
    # If not in venv, add --break-system-packages for Homebrew Python/PEP 668
    if not os.environ.get('VIRTUAL_ENV'):
        pip_args.append("--break-system-packages")
        print("\n⚠️  Warning: Not running inside a virtual environment. Using --break-system-packages for pip.\n")
    for dep in dependencies:
        try:
            subprocess.check_call(pip_args + [dep])
            print(f"Successfully installed or upgraded {dep}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install {dep}. Error: {e}")
            sys.exit(1)

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
        print("Google API key found in environment variables")
        return
        
    api_key = input("Please enter your Google API key: ")
    with open(env_path, 'w') as f:
        f.write(f"GOOGLE_API_KEY={api_key}")
    print(f"Created .env file with API key at {env_path}")
    os.environ['GOOGLE_API_KEY'] = api_key

def run_gradio_app():
    """Create and run the Gradio chat app."""
    from chat_app import create_gradio_interface
    
    demo = create_gradio_interface()

    print("Starting Gradio UI...")
    demo.launch()

def print_python_env_info():
    """Print information about the Python environment."""
    print("\nPython executable:", sys.executable)
    print("Python version:", sys.version)
    print("VIRTUAL_ENV:", os.environ.get('VIRTUAL_ENV'))
    print("sys.prefix:", sys.prefix)
    print("sys.base_prefix:", sys.base_prefix)

if __name__ == "__main__":
    print("Setting up Gradio UI for Gemini Chat Application...")
    print_python_env_info()
    ensure_virtualenv()
    check_dependencies()
    check_api_key()
    run_gradio_app()