"""
Example script demonstrating the usage of RAG-enabled agents.
This script shows how to set up the knowledge base and process rules.
"""

import os
import sys
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Import our agent implementation
from rag_agents import Agent1, Agent2, process_rule_to_drl

# Load environment variables from .env file
env_path = Path('.env')
load_dotenv(dotenv_path=env_path)

# Check if the API key is set
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    print("Error: GOOGLE_API_KEY environment variable is not set.")
    print("Please set it in a .env file or as an environment variable.")
    sys.exit(1)

# Create directories for knowledge bases and output
AGENT1_KB_PATH = "./agent1_kb"
AGENT2_KB_PATH = "./agent2_kb"
OUTPUT_PATH = "./output/drl_files"

os.makedirs(AGENT1_KB_PATH, exist_ok=True)
os.makedirs(AGENT2_KB_PATH, exist_ok=True)
os.makedirs(OUTPUT_PATH, exist_ok=True)

# Copy sample document to Agent 1's knowledge base
if os.path.exists("restaurant_content.docx"):
    shutil.copy("restaurant_content.docx", os.path.join(AGENT1_KB_PATH, "restaurant_content.docx"))
    print(f"Copied restaurant_content.docx to {AGENT1_KB_PATH}")

# Example rule to process
example_rule = "Modification to the restaurant size rule. The required base number of employees for large restaurants increases from 10 to 12."

print("\n=== Processing Rule with RAG Enabled ===")
drl_content = process_rule_to_drl(
    example_rule,
    agent1_kb_path=AGENT1_KB_PATH,
    agent2_kb_path=AGENT2_KB_PATH,
    output_path=OUTPUT_PATH,
    use_rag=True
)

print("\n=== Generated DRL Content ===")
print(drl_content)

# Example of using Agent 1 and Agent 2 separately
print("\n=== Using Agents Separately ===")

# Initialize agents
agent1 = Agent1(knowledge_base_path=AGENT1_KB_PATH)
agent2 = Agent2(knowledge_base_path=AGENT2_KB_PATH, output_path=OUTPUT_PATH)

# Process through Agent 1
print("\n🔍 Agent 1: Processing natural language rule...")
structured_rule = agent1.process_rule(example_rule)
print(f"✅ Agent 1 output: {structured_rule}")

# Process through Agent 2 
print("\n🔍 Agent 2: Generating DRL rule...")
drl_content = agent2.generate_drl(structured_rule)
print(f"✅ Agent 2 output: \n{drl_content}")

print("\n=== Script Completed Successfully ===")