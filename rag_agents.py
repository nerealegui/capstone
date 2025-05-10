"""
Agent implementation with Retrieval-Augmented Generation (RAG) capabilities.

This module implements two agents:
1. Agent 1: Converts natural language rules into structured JSON
2. Agent 2: Generates Drools (DRL) rules from the JSON output of Agent 1

Both agents use RAG to enhance their responses with relevant context from a knowledge base.
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import pandas as pd
import re

from google import genai
from google.genai import types
from dotenv import load_dotenv

import rag_utils

# Load environment variables from .env file
env_path = Path('.env')
load_dotenv(dotenv_path=env_path)

# Get API key from environment variable
API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize the Gemini client with API key
client = genai.Client(api_key=API_KEY)

# Default paths for knowledge bases
DEFAULT_AGENT1_KB_PATH = "./agent1_kb"
DEFAULT_AGENT2_KB_PATH = "./agent2_kb"

# Path to save DRL files (can be customized)
DEFAULT_DRL_OUTPUT_PATH = "./output/drl_files/"

class Agent1:
    """
    Agent 1: Business Rules Extractor
    Converts natural language rules into structured JSON format.
    """
    
    def __init__(self, knowledge_base_path: str = DEFAULT_AGENT1_KB_PATH, remote_urls: List[str] = None):
        """
        Initialize Agent 1 with a knowledge base
        
        Args:
            knowledge_base_path: Path to the folder containing the knowledge base documents
            remote_urls: List of URLs to remote documents to include in the knowledge base
        """
        self.knowledge_base_path = knowledge_base_path
        self.remote_urls = remote_urls or []
        self.knowledge_base_df = None
        self._ensure_knowledge_base()
    
    def _ensure_knowledge_base(self) -> None:
        """Ensure the knowledge base is loaded and embeddings are created"""
        # Create the knowledge base directory if it doesn't exist
        os.makedirs(self.knowledge_base_path, exist_ok=True)
        
        # Load and process the knowledge base if it's not already loaded
        if self.knowledge_base_df is None:
            try:
                # Load local documents
                local_df = pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
                if os.listdir(self.knowledge_base_path):
                    local_df = rag_utils.setup_rag_system(self.knowledge_base_path)
                    print(f"Agent 1 local knowledge base loaded with {len(local_df)} chunks")
                
                # Load remote documents if URLs provided
                remote_df = pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
                if self.remote_urls:
                    remote_df = rag_utils.setup_remote_rag_system(self.remote_urls)
                    print(f"Agent 1 remote knowledge base loaded with {len(remote_df)} chunks")
                
                # Combine local and remote knowledge bases if both exist
                if not local_df.empty and not remote_df.empty:
                    self.knowledge_base_df = pd.concat([local_df, remote_df], ignore_index=True)
                elif not local_df.empty:
                    self.knowledge_base_df = local_df
                elif not remote_df.empty:
                    self.knowledge_base_df = remote_df
                else:
                    # Create an empty dataframe with the right columns as a fallback
                    self.knowledge_base_df = pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
                    
            except Exception as e:
                print(f"Warning: Could not load knowledge base: {e}")
                # Create an empty dataframe with the right columns as a fallback
                self.knowledge_base_df = pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
    
    def process_rule(self, user_input: str, use_rag: bool = True, top_k: int = 3) -> Dict[str, Any]:
        """
        Process a natural language rule and convert it to structured JSON
        
        Args:
            user_input: Natural language rule description
            use_rag: Whether to use RAG to enhance the response
            top_k: Number of most similar chunks to use from the knowledge base
            
        Returns:
            Dictionary with the structured rule
        """
        # Retrieve relevant context if RAG is enabled
        context = ""
        if use_rag and len(self.knowledge_base_df) > 0:
            context = rag_utils.rag_query(user_input, self.knowledge_base_df, top_k)
        
        # Build the prompt with or without RAG context
        prompt = self._build_prompt(user_input, context if use_rag else "")
        
        # Call the LLM
        response = self._call_llm(prompt)
        
        # Parse the response
        try:
            result = json.loads(response)
            return result
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract it from the text
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(0))
                except:
                    pass
                    
            # Return a basic structure if parsing fails
            print("Warning: Could not parse LLM response as JSON")
            return {"conditions": [], "actions": []}
    
    def _build_prompt(self, user_input: str, context: str = "") -> str:
        """Build the prompt for the LLM, including RAG context if available"""
        prompt = f"""
You are an expert in translating restaurant business rules into structured logic.
Your task is to extract the key logic (conditions and actions) from the user's sentence.
"""

        # Add the context if it exists
        if context:
            prompt += f"""
Here is some relevant information to help you understand the business domain:
{context}
"""

        # Add the user input and response format
        prompt += f"""
User Input:
"{user_input}"

Respond with structured JSON like this:
{{
  "conditions": [...],
  "actions": [...]
}}
"""
        return prompt
    
    def _call_llm(self, prompt: str) -> str:
        """Call the LLM with the given prompt and return the response text"""
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            )
        ]

        generate_content_config = types.GenerateContentConfig(response_mime_type="application/json")

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=generate_content_config,
        )

        return response.text


class Agent2:
    """
    Agent 2: DRL Generator
    Converts structured JSON from Agent 1 into Drools (DRL) rules.
    """
    
    def __init__(self, knowledge_base_path: str = DEFAULT_AGENT2_KB_PATH, 
                 output_path: str = DEFAULT_DRL_OUTPUT_PATH,
                 remote_urls: List[str] = None):
        """
        Initialize Agent 2 with a knowledge base
        
        Args:
            knowledge_base_path: Path to the folder containing the knowledge base documents
            output_path: Path to save generated DRL files
            remote_urls: List of URLs to remote documents to include in the knowledge base
        """
        self.knowledge_base_path = knowledge_base_path
        self.output_path = output_path
        self.remote_urls = remote_urls or []
        self.knowledge_base_df = None
        self._ensure_knowledge_base()
        
    def _ensure_knowledge_base(self) -> None:
        """Ensure the knowledge base is loaded and embeddings are created"""
        # Create the knowledge base directory if it doesn't exist
        os.makedirs(self.knowledge_base_path, exist_ok=True)
        
        # Load and process the knowledge base if it's not already loaded
        if self.knowledge_base_df is None:
            try:
                # Load local documents
                local_df = pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
                if os.listdir(self.knowledge_base_path):
                    local_df = rag_utils.setup_rag_system(self.knowledge_base_path)
                    print(f"Agent 2 local knowledge base loaded with {len(local_df)} chunks")
                
                # Load remote documents if URLs provided
                remote_df = pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
                if self.remote_urls:
                    remote_df = rag_utils.setup_remote_rag_system(self.remote_urls)
                    print(f"Agent 2 remote knowledge base loaded with {len(remote_df)} chunks")
                
                # Combine local and remote knowledge bases if both exist
                if not local_df.empty and not remote_df.empty:
                    self.knowledge_base_df = pd.concat([local_df, remote_df], ignore_index=True)
                elif not local_df.empty:
                    self.knowledge_base_df = local_df
                elif not remote_df.empty:
                    self.knowledge_base_df = remote_df
                else:
                    # Create an empty dataframe with the right columns as a fallback
                    self.knowledge_base_df = pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
                    
            except Exception as e:
                print(f"Warning: Could not load knowledge base: {e}")
                # Create an empty dataframe with the right columns as a fallback
                self.knowledge_base_df = pd.DataFrame(columns=['filename', 'chunk', 'embedding'])
    
    def generate_drl(self, agent1_output: Dict[str, Any], 
                     use_rag: bool = True, 
                     top_k: int = 3) -> str:
        """
        Generate a DRL rule from Agent 1's output
        
        Args:
            agent1_output: Dictionary with conditions and actions from Agent 1
            use_rag: Whether to use RAG to enhance the response
            top_k: Number of most similar chunks to use from the knowledge base
            
        Returns:
            String containing the DRL rule
        """
        # Convert Agent1 output to string format for the query
        query = json.dumps(agent1_output)
        
        # Retrieve relevant context if RAG is enabled
        context = ""
        if use_rag and len(self.knowledge_base_df) > 0:
            context = rag_utils.rag_query(query, self.knowledge_base_df, top_k)
        
        # Format Agent1 output for the prompt
        conditions = "\n".join(f"- {cond}" for cond in agent1_output.get("conditions", []))
        actions = "\n".join(f"- {act}" for act in agent1_output.get("actions", []))
        
        # Build the prompt
        prompt = self._build_prompt(conditions, actions, context if use_rag else "")
        
        # Call the LLM
        response = self._call_llm(prompt)
        
        return response
    
    def _build_prompt(self, conditions: str, actions: str, context: str = "") -> str:
        """Build the prompt for the LLM, including RAG context if available"""
        prompt = f"""
You are an expert in translating business logic into Drools rules (DRL format).
Your task is to create a valid Drools rule based on the following conditions and actions.
"""

        # Add the context if it exists
        if context:
            prompt += f"""
Here are some examples of similar rules in DRL format to help you:
{context}
"""

        # Add the conditions, actions, and response format
        prompt += f"""
Conditions:
{conditions}

Actions:
{actions}

Please generate a valid Drools rule (DRL) following this format:
```drl
rule "RuleName"
when
    <conditions>
then
    <actions>;
end
```

Ensure your rule:
1. Has a descriptive name based on the conditions
2. Uses proper Drools syntax for conditions and actions
3. Follows standard Drools formatting conventions
"""
        return prompt
    
    def _call_llm(self, prompt: str) -> str:
        """Call the LLM with the given prompt and return the response text"""
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            )
        ]

        config = types.GenerateContentConfig(response_mime_type="text/plain")

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=config
        )

        return response.text
    
    def save_drl_to_file(self, drl_content: str) -> str:
        """
        Save DRL content to a file
        
        Args:
            drl_content: String containing the DRL rule
            
        Returns:
            Path to the saved file
        """
        # Ensure the output directory exists
        os.makedirs(self.output_path, exist_ok=True)

        # Clean the content
        drl_content = self._clean_drools_block(drl_content)

        # Extract the rule name
        match = re.search(r'rule\s+"([^"]+)"', drl_content.strip())
        if match:
            rule_name = match.group(1)  # Extracted rule name
        else:
            rule_name = f"Rule_{hash(drl_content) % 10000}"  # Fallback name

        # Set filename
        filename = f"{rule_name}.drl"
        filepath = os.path.join(self.output_path, filename)

        # Write the DRL content to file
        with open(filepath, "w") as f:
            f.write(drl_content)

        print(f"✅ DRL file saved at: {filepath}")
        return filepath
    
    def _clean_drools_block(self, text: str) -> str:
        """Clean code blocks from the LLM response"""
        # Remove markdown code block syntax if present
        text = text.strip()
        text = text.removeprefix("```drools")
        text = text.removeprefix("```drl")
        text = text.removesuffix("```")
        return text.strip()


# Function to demonstrate end-to-end usage of both agents
def process_rule_to_drl(natural_language_rule: str, 
                       agent1_kb_path: str = DEFAULT_AGENT1_KB_PATH,
                       agent2_kb_path: str = DEFAULT_AGENT2_KB_PATH,
                       output_path: str = DEFAULT_DRL_OUTPUT_PATH,
                       use_rag: bool = True,
                       agent1_remote_urls: List[str] = None,
                       agent2_remote_urls: List[str] = None) -> str:
    """
    Process a natural language rule through both agents to generate a DRL file
    
    Args:
        natural_language_rule: Natural language description of the rule
        agent1_kb_path: Path to Agent 1's knowledge base
        agent2_kb_path: Path to Agent 2's knowledge base
        output_path: Path to save the generated DRL file
        use_rag: Whether to use RAG for both agents
        agent1_remote_urls: List of URLs to remote documents for Agent 1
        agent2_remote_urls: List of URLs to remote documents for Agent 2
        
    Returns:
        The generated DRL content
    """
    # Initialize agents
    agent1 = Agent1(knowledge_base_path=agent1_kb_path, remote_urls=agent1_remote_urls)
    agent2 = Agent2(knowledge_base_path=agent2_kb_path, output_path=output_path, remote_urls=agent2_remote_urls)
    
    # Process through Agent 1
    print("🔍 Agent 1: Processing natural language rule...")
    structured_rule = agent1.process_rule(natural_language_rule, use_rag=use_rag)
    print(f"✅ Agent 1 output: {json.dumps(structured_rule, indent=2)}")
    
    # Process through Agent 2
    print("\n🔍 Agent 2: Generating DRL rule...")
    drl_content = agent2.generate_drl(structured_rule, use_rag=use_rag)
    print(f"✅ Agent 2 output: \n{drl_content}")
    
    # Save the DRL file
    agent2.save_drl_to_file(drl_content)
    
    return drl_content