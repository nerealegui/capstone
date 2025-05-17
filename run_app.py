#!/usr/bin/env python

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the project root directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Load environment variables from .env file
env_path = Path(".") / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"Loaded API key from {env_path}")

# Check for API key
api_key = os.environ.get('GOOGLE_API_KEY')
if not api_key:
    api_key = input("Please enter your Google API key: ")
    os.environ['GOOGLE_API_KEY'] = api_key
    
    # Save to .env file for future use
    with open(env_path, 'w') as f:
        f.write(f"GOOGLE_API_KEY={api_key}")
    print(f"Saved API key to {env_path}")

# Import dependencies after ensuring API key is set
import gradio as gr
from gemini_gradio_poc.chat_app import create_gradio_interface

if __name__ == "__main__":
    print("Starting Rule Management Bot with Agent 2...")
    demo = create_gradio_interface()
    demo.launch(share=True)  # Set share=False in production
    print("Application launched!")