"""
UI utility functions for the Gradio interface.
This module contains helper functions for UI-related operations.
"""

import os
import json
import pandas as pd
from typing import Tuple, Dict, Any
from datetime import datetime
from utils.kb_utils import core_build_knowledge_base
from utils.rule_extractor import extract_rules_from_csv
from utils.persistence_manager import save_rules


def load_css_from_file(css_file_path: str) -> str:
    """
    Load CSS content from an external file.
    
    Args:
        css_file_path (str): Path to the CSS file
        
    Returns:
        str: CSS content as string, or empty string if file not found
    """
    try:
        # Get the directory of the current file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up one level from utils to interface directory
        interface_dir = os.path.dirname(current_dir)
        full_path = os.path.join(interface_dir, "interface", css_file_path)
        
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Warning: CSS file not found at {css_file_path}. Using default styling.")
        return ""
    except Exception as e:
        print(f"Warning: Error reading CSS file {css_file_path}: {e}. Using default styling.")
        return ""


def build_knowledge_base_process(uploaded_files: list, rag_state_df: pd.DataFrame):
    """
    Enhanced Gradio generator for building the knowledge base with progress indicators.
    Handles UI status updates and delegates core logic to kb_utils.core_build_knowledge_base.
    
    Args:
        uploaded_files (list): List of uploaded file-like objects (must have .name attribute).
        rag_state_df (pd.DataFrame): Existing RAG state DataFrame.
        
    Yields:
        Tuple[str, pd.DataFrame]: Status message and updated RAG DataFrame.
    """
    # --- Enhanced Gradio generator logic with progress indicators ---
    yield "Starting knowledge base build process...", rag_state_df
    
    if not uploaded_files:
        yield "Please upload documents first to build the knowledge base.", rag_state_df if rag_state_df is not None else pd.DataFrame()
        return
        
    file_paths = [f.name for f in uploaded_files if f and hasattr(f, 'name') and f.name]
    if not file_paths:
        yield "No valid file paths found from upload.", rag_state_df if rag_state_df is not None else pd.DataFrame()
        return
    
    yield f"Processing {len(file_paths)} document(s)...", rag_state_df
    yield "Reading documents and extracting text content...", rag_state_df
    yield "Generating embeddings for enhanced search capabilities...", rag_state_df
    
    # Use default chunk size and overlap
    chunk_size = 500
    chunk_overlap = 50
    
    # Pass the existing KB DataFrame for merging
    status_message, result_df = core_build_knowledge_base(file_paths, chunk_size, chunk_overlap, existing_kb_df=rag_state_df)
    
    # Enhanced status message with timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    if "successfully" in status_message.lower():
        final_status = f"✓  {status_message}\nLast updated: {timestamp}\nTotal chunks in knowledge base: {len(result_df)}"
    else:
        final_status = f"✗ {status_message}\nAttempted at: {timestamp}"
    
    yield final_status, result_df


def extract_rules_from_uploaded_csv(csv_file, rag_state_df=None) -> Tuple[str, str, pd.DataFrame]:
    """
    Enhanced process for extracting business rules from CSV and automatically adding them to the knowledge base.
    
    Args:
        csv_file: Gradio file upload object
        rag_state_df: Current RAG state DataFrame
        
    Returns:
        Tuple[str, str, pd.DataFrame]: Status message, extracted rules JSON as string, and updated RAG DataFrame
    """
    if not csv_file:
        return "Please upload a CSV file first to begin rule extraction.", "", pd.DataFrame(columns=['ID', 'Name', 'Description'])
    
    try:
        # Extract rules from CSV
        rules = extract_rules_from_csv(csv_file.name)
        
        if not rules:
            return "No business rules found in the CSV file. Please check the file format and content.", "", pd.DataFrame(columns=['ID', 'Name', 'Description'])
        
        # Save extracted rules to persistent storage
        save_success, save_msg = save_rules(rules, f"Rules extracted from CSV file: {csv_file.name}")
        
        if not save_success:
            return f"✗ Error saving extracted rules: {save_msg}", "", rag_state_df
        
        rules_json = json.dumps(rules, indent=2)
        
        # Convert rules to text for RAG indexing
        rule_texts = []
        for rule in rules:
            rule_text = f"""
Rule: {rule.get('name', 'Unknown')}
Category: {rule.get('category', 'Unknown')}
Description: {rule.get('description', 'No description')}
Summary: {rule.get('summary', 'No summary')}
Priority: {rule.get('priority', 'Medium')}
Active: {rule.get('active', True)}
"""
            rule_texts.append(rule_text)
        
        # Prepare a temporary file for the RAG system
        temp_file = "temp_rules.txt"
        with open(temp_file, 'w') as f:
            f.write("\n".join(rule_texts))
        
        # Add rules to knowledge base using the core_build_knowledge_base function
        status_message, updated_df = core_build_knowledge_base([temp_file], existing_kb_df=rag_state_df)
        
        # Clean up temporary file
        try:
            os.remove(temp_file)
        except:
            pass
        
        if "successfully" in status_message.lower():
            # Include a timestamp for the successful operation
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            full_status = f"✓  Successfully extracted {len(rules)} business rule(s) from CSV file and added to knowledge base.\n"\
                          f"Last updated: {timestamp}\n"\
                          f"Rules saved to persistent storage\n"\
                          f"Knowledge base now contains {len(updated_df)} chunks."
            return full_status, rules_json, updated_df
        else:
            return f"✓  Rules extracted but couldn't be added to knowledge base: {status_message}", rules_json, rag_state_df
            
    except Exception as e:
        return f"✗ Error processing CSV file: {str(e)}\nPlease ensure the CSV file contains valid business rule data.", "", rag_state_df


def get_workflow_status() -> str:
    """
    Get the current workflow status for display in the UI.
    
    Returns:
        str: Formatted workflow status string
    """
    try:
        from utils.workflow_orchestrator import create_workflow
        workflow = create_workflow()
        metrics = workflow.get_workflow_metrics()
        
        status = f"""
**📊 Current Workflow Status:**
- **Nodes:** {metrics.get('total_nodes', 'Unknown')} workflow nodes
- **Type:** {metrics.get('workflow_type', 'Unknown')}
- **Entry Point:** {metrics.get('entry_point', 'Unknown')}
- **Status:** 🟢 **Active** (Langraph orchestration enabled)

**🔗 Agent Execution Order:**
1. **Agent 1** → Parse natural language to structured rule
2. **Agent 3** → Analyze conflicts with existing rules  
3. **Agent 3** → Assess business impact and risk
4. **Agent 3** → Orchestrate next steps (files or response)
5. **Agent 2** → Generate DRL/GDST files (if needed)
6. **Verification** → Validate generated files
7. **Response** → Provide user-facing results
        """
        return status
    except Exception as e:
        return f"**Error getting workflow status:** {str(e)}"


def process_rules_to_df(rules_data) -> pd.DataFrame:
    """
    Convert rules to DataFrame and ensure proper formatting.
    
    Args:
        rules_data: Rules data (string or dict)
        
    Returns:
        pd.DataFrame: Formatted DataFrame with ID, Name, Description columns
    """
    try:
        if isinstance(rules_data, str):
            rules = json.loads(rules_data)
        else:
            rules = rules_data

        if not rules:
            return pd.DataFrame(columns=['ID', 'Name', 'Description'])

        # Create list of valid rules
        valid_rules = []
        for rule in rules:
            if rule and isinstance(rule, dict):
                rule_id = rule.get('rule_id', '')
                name = rule.get('name', '')
                desc = rule.get('description', '')
                if rule_id and name and desc:  # Only add if all fields have values
                    valid_rules.append((rule_id, name, desc))

        # Create DataFrame with proper column names
        df = pd.DataFrame(valid_rules, columns=['ID', 'Name', 'Description'])
        return df.reset_index(drop=True)  # Reset index to remove gaps
    except Exception as e:
        print(f"Error processing rules: {e}")
        return pd.DataFrame(columns=['ID', 'Name', 'Description'])


def filter_rules(query: str, current_rules_df: pd.DataFrame, rules_json: str) -> pd.DataFrame:
    """
    Filter rules based on search query.
    
    Args:
        query (str): Search query
        current_rules_df (pd.DataFrame): Current rules DataFrame
        rules_json (str): Rules JSON string
        
    Returns:
        pd.DataFrame: Filtered DataFrame
    """
    try:
        # If query is empty or current_rules_df is empty, show all rules
        if not query or query.strip() == "":
            return process_rules_to_df(rules_json)

        # Ensure we're working with the correct column names
        if not isinstance(current_rules_df, pd.DataFrame):
            return process_rules_to_df(rules_json)

        # Make sure DataFrame has the correct columns
        current_rules_df.columns = ['ID', 'Name', 'Description']
        
        # Filter based on query
        query = query.lower().strip()
        mask = (
            current_rules_df['ID'].astype(str).str.lower().str.contains(query, na=False) |
            current_rules_df['Name'].astype(str).str.lower().str.contains(query, na=False) |
            current_rules_df['Description'].astype(str).str.lower().str.contains(query, na=False)
        )
        filtered_df = current_rules_df[mask].reset_index(drop=True)
        return filtered_df

    except Exception as e:
        print(f"Error in filter_rules: {e}")
        return process_rules_to_df(rules_json)


def update_rule_summary(rule_response: Dict[str, Any]) -> Tuple[str, str]:
    """
    Extract rule information from the rule_response and return for UI update.
    
    Args:
        rule_response (Dict[str, Any]): Rule response dictionary
        
    Returns:
        Tuple[str, str]: Name and summary values
    """
    try:
        if rule_response:
            name_val = rule_response.get('name', 'Name will appear here after input.')
            summary_val = rule_response.get('summary', 'Summary will appear here after input.')
            return name_val, summary_val
        else:
            return "Name will appear here after input.", "Summary will appear here after input."
    except Exception as e:
        print(f"Error in update_rule_summary: {e}")
        return "Error loading rule data", "Error loading rule data"
