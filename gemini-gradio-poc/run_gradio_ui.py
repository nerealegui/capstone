#!/usr/bin/env python

# Simple script to run the Gradio UI for Gemini Chat Application

import os
import sys
import subprocess
import platform
from pathlib import Path

def get_os():
    """Detect the operating system."""
    if sys.platform.startswith('win'):
        return 'Windows'
    elif sys.platform == 'darwin':
        return 'macOS'
    else: # Covers linux, bsd, etc.
        return 'Linux'

def ensure_virtualenv():
    """
    Ensure the script is running inside a virtual environment.
    If not, create one (if it doesn't exist) and instruct the user to activate it.
    """
    current_os = get_os()
    venv_path = Path(__file__).parent / 'venv'

    if sys.prefix == sys.base_prefix:
        # Not in a virtual environment, check if one exists or create it
        print("Script is not running inside a virtual environment.")
        if not venv_path.exists():
            try:
                # Use inherit=True to show subprocess output during creation
                # Set cwd to the script's directory parent to ensure venv is created there
                subprocess.check_call([sys.executable, "-m", "venv", str(venv_path)],
                                       stdout=sys.stdout, stderr=sys.stderr,
                                       cwd=Path(__file__).parent)
                print(f"✅ Virtual environment created at {venv_path}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to create virtual environment. Error: {e}")
                print("Please try creating it manually: python -m venv venv")
                sys.exit(1)
            except Exception as e:
                 print(f"❌ An unexpected error occurred during venv creation: {e}")
                 sys.exit(1)
        else:
            print("Virtual environment found, but not active.")
        print(f"\n⚠️  Please activate the virtual environment before running this script again.")
        print(f"The command depends on your operating system and shell:\n")

        if current_os == 'Windows':
            # Provide instructions for common Windows shells
            print(f"  If using Command Prompt (cmd.exe):")
            print(f"    cd {Path(__file__).parent}") # Go to script directory first
            print(f"    .\\venv\\Scripts\\activate.bat")
            print(f"\n  If using PowerShell:")
            print(f"    cd {Path(__file__).parent}") # Go to script directory first
            print(f"    .\\venv\\Scripts\\Activate.ps1")
            print(f"\n  If using Git Bash or WSL Bash:")
            print(f"    cd {Path(__file__).parent}") # Go to script directory first
            print(f"    source ./venv/Scripts/activate")
        else: # macOS and Linux
            print(f"  If using Bash, Zsh, or other standard Unix shells:")
            print(f"    cd {Path(__file__).parent}") # Go to script directory first
            print(f"    source ./venv/bin/activate") # Note: bin/activate for Unix-like

        print(f"\nAfter activating the environment, run the script again from that same directory:\n")
        print(f"    python {Path(__file__).name}\n")

        sys.exit(1) # Exit as the user needs to activate manually

    print(f"✅ Running inside virtual environment: {sys.prefix}")

def check_dependencies():
    """Check if required dependencies are installed, install if missing."""
    dependencies = [
        "gradio==5.29.0",
        "google-genai",
        "python-dotenv",
        "pandas",
        "numpy",
        "scikit-learn", 
        "python-docx",  
        "PyPDF2"        
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
    from interface.chat_app import create_gradio_interface
    
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