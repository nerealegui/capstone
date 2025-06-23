import os
import gradio as gr
import json
import os
import pandas as pd
import numpy as np
from google import genai
from google.genai import types
from config.agent_config import AGENT1_PROMPT, AGENT2_PROMPT, AGENT3_PROMPT, DEFAULT_MODEL, GENERATION_CONFIG, AGENT3_GENERATION_CONFIG, INDUSTRY_CONFIGS
from typing import Dict, List, Any
from utils.json_response_handler import JsonResponseHandler

from utils.rag_utils import read_documents_from_paths, embed_texts, retrieve, rag_generate, initialize_gemini_client
from utils.kb_utils import core_build_knowledge_base
from utils.rule_utils import json_to_drl_gdst, verify_drools_execution
from utils.rule_extractor import extract_rules_from_csv, save_extracted_rules
from utils.agent3_utils import (
    analyze_rule_conflicts, 
    assess_rule_impact, 
    generate_conversational_response,
    orchestrate_rule_generation,
    _extract_existing_rules_from_kb
)
from utils.config_manager import (
    get_default_config,
    reload_prompts_from_defaults,
    save_config,
    load_config,
    apply_config_to_runtime,
    get_config_summary
)

# New function to build_knowledge_base_process, which calls functions in rag_utils.
def build_knowledge_base_process(
    uploaded_files: list, 
    rag_state_df: pd.DataFrame
):
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
    yield f"Reading documents and extracting text content...", rag_state_df
    yield f"Generating embeddings for enhanced search capabilities...", rag_state_df
    
    # Use default chunk size and overlap
    chunk_size = 500
    chunk_overlap = 50
    
    # Pass the existing KB DataFrame for merging
    status_message, result_df = core_build_knowledge_base(file_paths, chunk_size, chunk_overlap, existing_kb_df=rag_state_df)
    
    # Enhanced status message with timestamp
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    if "successfully" in status_message.lower():
        final_status = f"✓  {status_message}\nLast updated: {timestamp}\nTotal chunks in knowledge base: {len(result_df)}"
    else:
        final_status = f"✗ {status_message}\nAttempted at: {timestamp}"
    
    yield final_status, result_df


def chat_with_rag(user_input: str, history: list, rag_state_df: pd.DataFrame):
    global rule_response
    
    # Defensive: ensure rag_state_df is always a DataFrame
    if rag_state_df is None:
        rag_state_df = pd.DataFrame()
    
    # Check for empty input
    if not user_input or not user_input.strip():
        empty_response = "Please enter a message."
        return empty_response, history, "Name will appear here after input.", "Summary will appear here after input.", {"message": "RAG index is empty."}
    
    # Validate API key without storing unused client variable
    try:
        initialize_gemini_client()
    except ValueError as e:
         error_message = f"API Key Error: {e}"
         print(error_message)
         return error_message, history, "Name will appear here after input.", "Summary will appear here after input.", {"message": "RAG index is empty."}
    
    # Determine if RAG should be used (if rag_state_df is not empty)
    use_rag = not rag_state_df.empty

    if use_rag:
        try:
            llm_response_text = rag_generate(
                query=user_input,
                df=rag_state_df,
                agent_prompt=AGENT1_PROMPT,
                model_name=DEFAULT_MODEL,
                generation_config=GENERATION_CONFIG,
                history=history,
                top_k=3
            )
            try:
                # Use the JsonResponseHandler to parse the response
                rule_response = JsonResponseHandler.parse_json_response(llm_response_text)
                print("Parsed rule_response:", rule_response)
                if not isinstance(rule_response, dict):
                     raise ValueError("Response is not a JSON object.")
            except (json.JSONDecodeError, ValueError, Exception) as e:
                print(f"Warning: Could not parse LLM response as JSON. Error: {e}")
                print(f"Raw LLM Response received:\n{llm_response_text[:300]}...")
                rule_response = {
                    "name": "LLM Response Parse Error",
                    "summary": f"The AI returned a response, but it wasn't valid JSON. Raw response start: {llm_response_text[:150]}...",
                    "logic": {"message": "Response was not in expected JSON format."}
                }
        except Exception as e:
            rule_response = {
                "name": "RAG Generation Error",
                "summary": f"An error occurred during RAG response generation: {str(e)}",
                "logic": {"message": "RAG failed."}
            }
    else:
        print("Knowledge base is empty. RAG is not active.")
        rule_response = {
            "name": "Knowledge Base Empty",
            "summary": "Knowledge base not built. Please upload documents and click 'Build Knowledge Base' first.",
            "logic": {"message": "RAG index is empty."}
        }

    # Extract values for the response
    response_summary = rule_response.get('summary', 'No summary available.')
    
    return response_summary


def chat_with_agent3(user_input: str, history: list, rag_state_df: pd.DataFrame, industry: str = "generic"):
    """
    Enhanced chat function using Agent 3 for conversational interaction with conflict detection and impact analysis.
    Uses saved configuration when available.
    """
    global rule_response
    
    # Load saved configuration to get current Agent 3 settings
    try:
        config, _ = load_config()
        saved_industry = config["agent3_settings"]["industry"]
        agent3_enabled = config["agent3_settings"]["enabled"]
        
        # Use saved industry if provided industry is default
        if industry == "generic" and saved_industry != "generic":
            industry = saved_industry
            
        # Check if Agent 3 is enabled
        if not agent3_enabled:
            return "Agent 3 is currently disabled. Please enable it in the Configuration tab."
            
    except Exception as e:
        print(f"Warning: Could not load saved configuration: {e}")
        # Continue with provided parameters
    
    # Defensive: ensure rag_state_df is always a DataFrame
    if rag_state_df is None:
        rag_state_df = pd.DataFrame()
    
    # Check for empty input
    if not user_input or not user_input.strip():
        return "Please enter a message."
    
    # Validate API key
    try:
        initialize_gemini_client()
    except ValueError as e:
        return f"API Key Error: {e}"
    
    # Check if user is asking for rule creation, analysis, or general conversation
    user_lower = user_input.lower()
    is_rule_creation = any(keyword in user_lower for keyword in [
        'create rule', 'add rule', 'new rule', 'make rule', 'rule for', 'generate rule'
    ])
    is_conflict_check = any(keyword in user_lower for keyword in [
        'conflict', 'conflicts', 'check conflicts', 'validate', 'verify'
    ])
    is_impact_analysis = any(keyword in user_lower for keyword in [
        'impact', 'effect', 'consequence', 'analyze impact', 'what happens if'
    ])
    
    # Build context for Agent 3
    context = {
        "intent": "general",
        "industry": industry,
        "has_knowledge_base": not rag_state_df.empty,
        "user_input": user_input,
        "history_length": len(history)
    }
    
    try:
        if is_rule_creation:
            # Use Agent 1 to extract rule structure first
            llm_response_text = rag_generate(
                query=user_input,
                df=rag_state_df,
                agent_prompt=AGENT1_PROMPT,
                model_name=DEFAULT_MODEL,
                generation_config=GENERATION_CONFIG,
                history=history,
                top_k=3
            )
            
            try:
                # Use the JsonResponseHandler to parse the response
                proposed_rule = JsonResponseHandler.parse_json_response(llm_response_text)
                rule_response = proposed_rule
                
                # Get existing rules from knowledge base for conflict analysis
                existing_rules = _extract_existing_rules_from_kb(rag_state_df)
                
                # Analyze conflicts and impacts with Agent 3
                conflicts, conflict_analysis = analyze_rule_conflicts(
                    proposed_rule, existing_rules, industry
                )
                
                impact_analysis = assess_rule_impact(
                    proposed_rule, existing_rules, industry
                )
                
                # Build comprehensive response
                context.update({
                    "intent": "rule_creation",
                    "proposed_rule": proposed_rule,
                    "conflicts": conflicts,
                    "impact_analysis": impact_analysis
                })
                
                response = generate_conversational_response(
                    f"I've created a rule based on your request. Here's my analysis:\n\n"
                    f"Proposed Rule: {proposed_rule.get('name', 'Unnamed Rule')}\n"
                    f"Conflicts Found: {len(conflicts)}\n"
                    f"Impact Level: {impact_analysis.get('risk_level', 'Unknown')}\n\n"
                    f"Conflict Analysis: {conflict_analysis}\n\n"
                    f"Would you like me to proceed with generating the DRL files, or would you like to modify the rule first?",
                    context, rag_state_df, industry
                )
                
            except (json.JSONDecodeError, ValueError, Exception) as e:
                print(f"Error parsing rule creation response: {e}")
                response = generate_conversational_response(
                    f"I had trouble creating a structured rule from your request: '{user_input}'. "
                    f"Could you provide more specific details about the conditions and actions for this rule?",
                    context, rag_state_df, industry
                )
                rule_response = {
                    "name": "Rule Creation Error",
                    "summary": response,
                    "logic": {"message": "Failed to parse rule structure"}
                }
                
        elif is_conflict_check or is_impact_analysis:
            # Handle conflict checking or impact analysis requests
            context["intent"] = "analysis"
            response = generate_conversational_response(
                user_input, context, rag_state_df, industry
            )
            
        else:
            # General conversation with Agent 3
            context["intent"] = "general"
            response = generate_conversational_response(
                user_input, context, rag_state_df, industry, history
            )
            
        return response
        
    except Exception as e:
        print(f"Error in Agent 3 chat: {e}")
        return f"I apologize, but I encountered an error processing your request: {str(e)}"


def update_rule_summary():
    """Extract rule information from the global rule_response and return for UI update."""
    global rule_response
    
    try:
        if 'rule_response' in globals() and rule_response:
            name_val = rule_response.get('name', 'Name will appear here after input.')
            summary_val = rule_response.get('summary', 'Summary will appear here after input.')
            return name_val, summary_val
        else:
            return "Name will appear here after input.", "Summary will appear here after input."
    except Exception as e:
        print(f"Error in update_rule_summary: {e}")
        return "Error loading rule data", "Error loading rule data"

def extract_rules_from_uploaded_csv(csv_file, rag_state_df=None):
    """
    Enhanced process for extracting business rules from CSV and automatically adding them to the knowledge base.
    
    Args:
        csv_file: Gradio file upload object
        rag_state_df: Current RAG state DataFrame
        
    Returns:
        Tuple[str, str, pd.DataFrame]: Status message, extracted rules JSON as string, and updated RAG DataFrame
    """
    if not csv_file:
        return "Please upload a CSV file first to begin rule extraction.", "", rag_state_df
    
    try:
        # Extract rules from CSV
        rules = extract_rules_from_csv(csv_file.name)
        
        if not rules:
            return "No business rules found in the CSV file. Please check the file format and content.", "", rag_state_df
        
        # Save extracted rules
        output_path = "extracted_rules.json"
        success = save_extracted_rules(rules, output_path)
        
        if not success:
            return "✗ Error saving extracted rules to file. Please check file permissions.", "", rag_state_df
        
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
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            full_status = f"✓  Successfully extracted {len(rules)} business rule(s) from CSV file and added to knowledge base.\n"\
                          f"Last updated: {timestamp}\n"\
                          f"Rules saved to: {output_path}\n"\
                          f"Knowledge base now contains {len(updated_df)} chunks."
            return full_status, rules_json, updated_df
        else:
            return f"✓  Rules extracted but couldn't be added to knowledge base: {status_message}", rules_json, rag_state_df
            
    except Exception as e:
        return f"✗ Error processing CSV file: {str(e)}\nPlease ensure the CSV file contains valid business rule data.", "", rag_state_df


# Configuration management functions
def get_current_config_summary():
    """Get a summary of the current configuration."""
    try:
        config, _ = load_config()
        return get_config_summary(config)
    except Exception as e:
        return f"Error loading configuration: {str(e)}"

def save_and_apply_config(agent1_prompt, agent2_prompt, agent3_prompt, model, generation_config_str, industry):
    """Save and apply the current configuration values."""
    try:
        # Parse generation config
        try:
            generation_config = json.loads(generation_config_str)
        except json.JSONDecodeError:
            return "Invalid JSON in generation config.", False

        config = {
            "agent_prompts": {
                "agent1": agent1_prompt,
                "agent2": agent2_prompt,
                "agent3": agent3_prompt
            },
            "model_config": {
                "default_model": model,
                "generation_config": generation_config,
                "agent3_generation_config": AGENT3_GENERATION_CONFIG
            },
            "agent3_settings": {
                "industry": industry,
                "enabled": True
            },
            "ui_settings": {
                "default_tab": "Chat & Rule Summary"
            }
        }

        success = save_config(config)
        if success:
            apply_config_to_runtime(config)
            return f"✓ Configuration saved and applied successfully!", True
        else:
            return f"❌ Failed to save configuration.", False
    except Exception as e:
        return f"❌ Error saving and applying configuration: {str(e)}", False


def analyze_impact_only(industry: str = "generic"):
    """
    Analyze impact without generating drools files - for Enhanced Agent 3 mode.
    Returns:
        Tuple[str, None, None]: Status message with analysis, no files
    """
    global rule_response
    try:
        if 'rule_response' not in globals() or not rule_response:
            return "No rule to analyze. Please interact with the chat first.", None, None

        # Get existing rules for validation
        existing_rules = []
        try:
            with open("extracted_rules.json", 'r') as f:
                existing_rules = json.load(f)
        except FileNotFoundError:
            pass

        # Use Agent 3 for enhanced conflict detection and impact analysis
        conflicts, conflict_analysis = analyze_rule_conflicts(
            rule_response, existing_rules, industry
        )
        
        impact_analysis = assess_rule_impact(
            rule_response, existing_rules, industry
        )

        if conflicts:
            conflict_messages = []
            for conflict in conflicts:
                impact_info = conflict.get('industry_impact', 'No impact analysis available')
                conflict_messages.append(
                    f"⚠️ {conflict['type']}: {conflict['message']}\n"
                    f"   Industry Impact: {impact_info}"
                )
            
            detailed_message = (
                "⚠️ Conflicts Detected by Agent 3:\n\n" + 
                "\n\n".join(conflict_messages) + 
                f"\n\n📊 Detailed Analysis:\n{conflict_analysis}\n\n" +
                f"📈 Impact Assessment:\n{json.dumps(impact_analysis, indent=2)}\n\n" +
                "Please use the Decision Support section below to proceed, modify, or cancel."
            )
            return (detailed_message, None, None)

        # If no conflicts, show positive impact analysis
        success_message = (
            ##f"📊 Impact Analysis Summary:\n{json.dumps(impact_analysis, indent=2)}\n\n" +
            f"📈 Detailed Analysis:\n{conflict_analysis}\n\n" +
            "Rule is ready for implementation. Use the Decision Support section below to proceed."
        )
        
        return (success_message, None, None)
            
    except Exception as e:
        return (f"Agent 3 Analysis Error: {str(e)}", None, None)

# New function to initialize_gemini_client, moved from rag_utils
def initialize_gemini_client():
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("Google API key not found in environment variables. Please check your .env file.")

    client = genai.Client(
        api_key=api_key
    )
    return client

def create_gradio_interface():
    """Create and return the Gradio interface for the Gemini Chat Application with two tabs: Configuration and Chat/Rule Summary."""

    # Reload prompts from defaults on startup
    try:
        success, reload_msg = reload_prompts_from_defaults()
        if success:
            print(f"Prompts reloaded successfully: {reload_msg}")
        else:
            print(f"Warning: Failed to reload prompts: {reload_msg}")
    except Exception as e:
        print(f"Error reloading prompts on startup: {e}")
    
    # Load saved configuration on startup
    try:
        startup_config, startup_msg = load_config()
        print(f"Startup configuration: {startup_msg}")
    except Exception as e:
        print(f"Warning: Could not load startup configuration: {e}")
        startup_config = get_default_config()

    # Extract startup values
    startup_agent1_prompt = startup_config["agent_prompts"]["agent1"]
    startup_agent2_prompt = startup_config["agent_prompts"]["agent2"]
    startup_agent3_prompt = startup_config["agent_prompts"]["agent3"]
    startup_model = startup_config["model_config"]["default_model"]
    startup_generation_config = json.dumps(startup_config["model_config"]["generation_config"], indent=2)
    startup_industry = startup_config["agent3_settings"]["industry"]

    # Shared components
    name_display = gr.Textbox(value="Name will appear here after input.", label="Name")
    summary_display = gr.Textbox(value="Summary will appear here after input.", label="Summary")
    drl_file = gr.File(label="Download DRL", visible=False)  # Hidden in Enhanced Agent 3 mode
    gdst_file = gr.File(label="Download GDST", visible=False)  # Hidden in Enhanced Agent 3 mode
    status_box = gr.Textbox(label="Status")

    # --- State for RAG DataFrame (must be defined before use) ---
    state_rag_df = gr.State(pd.DataFrame())

    with gr.Blocks(theme=gr.themes.Soft(), css="""
        /* Enhanced UI Styling */
        footer {visibility: hidden}
        
        /* Main container improvements */
        .gradio-container {
            max-width: 1400px !important;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* Section styling with cards */
        .config-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .kb-section {
            background: linear-gradient(135deg, #fefbff 0%, #f8f4ff 100%);
            border: 1px solid #e9d5ff;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
        }
        
        .rules-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        /* Section headers */
        .section-header {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* Octicon styling */
        .octicon {
            width: 20px;
            height: 20px;
        }

        /* Blue Color Palette */
        .blue-4 .octicon {
            fill: #218bff !important;
        }
        .blue-5 .octicon {
            fill: #0969da !important;
        }
        
        /* File generation status styling */
        .file-status {
            background-color: #f0f9ff;
            border-left: 4px solid #0284c7;
            padding: 12px 16px;
            margin: 16px 0;
            border-radius: 4px;
            font-size: 0.95rem;
        }
        
        .file-status p {
            margin: 0;
            line-height: 1.5;
        }
    """) as demo:
        # --- UI Definition ---
        with gr.Tabs():
            # Tab 1: Configuration
            with gr.Tab("Configuration"):
                gr.Markdown("""
                # Business Rules Engine Configuration
                Configure your knowledge base, upload business rules, and customize agent behavior for optimal rule extraction and analysis.
                """)
                
                with gr.Row():
                    # Knowledge Base Setup Column
                    with gr.Column(elem_classes=["kb-section"], scale=1, min_width=300):
                        gr.HTML('<div class="section-header blue-4"><svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm0 15A7 7 0 1 1 15 8a7 7 0 0 1-7 7z"></path><path d="M8 4a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm1 3H7v4h2z"></path></svg> Knowledge Base Setup</div>')
                        
                        with gr.Accordion("Upload Documents & Configure RAG", open=True):
                            document_upload = gr.File(
                                label="Upload Documents (.docx, .pdf)",
                                file_count="multiple",
                                file_types=['.docx', '.pdf'],
                                height=120,
                                elem_classes=["file-upload"]
                            )
                            
                            build_kb_button = gr.Button("Build Knowledge Base", variant="primary", elem_classes=["btn-primary"])
                            
                            rag_status_display = gr.Textbox(
                                label="Knowledge Base Status",
                                value="Knowledge base not built yet. Upload documents and click 'Build Knowledge Base' to get started.",
                                interactive=False,
                                lines=2
                            )
                        
                        gr.HTML('<div class="section-divider"></div>')
                        
                        gr.HTML('<div class="section-header blue-5"><svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm0 15A7 7 0 1 1 15 8a7 7 0 0 1-7 7z"></path><path d="M8 4a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm1 3H7v4h2z"></path></svg> Business Rule Upload & Extraction</div>')
                        with gr.Accordion("Upload Business Rules CSV", open=True):
                            csv_upload = gr.File(
                                label="Upload Business Rules CSV",
                                file_types=['.csv'],
                                height=100,
                                elem_classes=["file-upload"]
                            )
                            extract_button = gr.Button("Extract Rules", variant="primary", elem_classes=["btn-primary"])
                            extraction_status = gr.Textbox(
                                label="Extraction Status",
                                value="Upload a CSV file and click 'Extract Rules' to extract rules and add them to the knowledge base.",
                                interactive=False,
                                lines=2
                            )
                    
                    # Agent Config Variables Column
                    with gr.Column(elem_classes=["config-section"], scale=1):
                        gr.HTML('<div class="section-header">Agent Configuration</div>')
                        
                        # Configuration Summary
                        with gr.Accordion("Configuration Summary", open=True):
                            # Render the configuration summary at app load
                            config_summary = gr.Markdown(get_current_config_summary())
                            
                        
                        
                        gr.HTML('<div class="section-divider"></div>')
                        
                        # Agent Prompts with collapsible sections
                        with gr.Accordion("Agent 1 Prompt (Rule Extraction)", open=False):
                            gr.Markdown("Configure the prompt for the rule extraction agent.")
                            agent1_prompt_box = gr.Textbox(
                                value=startup_agent1_prompt, 
                                label="Agent 1 Prompt", 
                                lines=8,
                                elem_classes=["code-textbox"],
                                info="This agent extracts business rules from documents"
                            )
                        
                        with gr.Accordion("Agent 2 Prompt (Rule Validation)", open=False):
                            gr.Markdown("Configure the prompt for the rule validation agent.")
                            agent2_prompt_box = gr.Textbox(
                                value=startup_agent2_prompt, 
                                label="Agent 2 Prompt", 
                                lines=4,
                                elem_classes=["code-textbox"],
                                info="This agent validates and checks rule consistency"
                            )
                        
                        with gr.Accordion("Agent 3 Prompt (Business Rules Management)", open=False):
                            gr.Markdown("Configure the prompt for the business rules management agent.")
                            agent3_prompt_box = gr.Textbox(
                                value=startup_agent3_prompt, 
                                label="Agent 3 Prompt", 
                                lines=6,
                                elem_classes=["code-textbox"],
                                info="This agent manages business rules and generates Drools files"
                            )
                            
                            # Industry Selection for Agent 3
                            industry_selector = gr.Dropdown(
                                choices=list(INDUSTRY_CONFIGS.keys()),
                                value=startup_industry,
                                label="Industry Context",
                                info="Select industry for specialized rule analysis"
                            )
                        
                        with gr.Accordion("Model Configuration", open=False):
                            gr.Markdown("Configure the AI model and generation settings.")
                            default_model_box = gr.Textbox(
                                value=startup_model, 
                                label="Default Model",
                                info="Specify the AI model to use for processing"
                            )
                            generation_config_box = gr.Textbox(
                                value=startup_generation_config, 
                                label="Generation Config (JSON)", 
                                lines=6,
                                elem_classes=["code-textbox"],
                                info="JSON configuration for AI model generation parameters"
                            )


                        with gr.Row():
                            save_apply_button = gr.Button("Save", variant="primary", elem_classes=["btn-primary"], scale=1)

                        with gr.Row():
                            config_status = gr.Textbox(
                                label="Configuration Status",
                                value="Ready to save or apply configuration changes.",
                                interactive=False,
                                lines=3
                            )

            # Tab 2: Business Rules Management
            with gr.Tab("Business Rules"):
                gr.Markdown("""
                # Business Rules Management
                View extracted rules, integrate them into your knowledge base, and validate new business rules.
                """)
                
                with gr.Row():
                    # Left panel: Extracted Rules & RAG Integration
                    with gr.Column(elem_classes=["rules-section"], scale=1): 
                        # Add search functionality
                        search_input = gr.Textbox(
                            label="Search Rules",
                            placeholder="Search by rule ID, name, or description...",
                            show_label=True
                        )
                        
                        # Show extracted rules as a list (rule_id, name, description)
                        extracted_rules_list = gr.Dataframe(
                            headers=["ID", "Name", "Description"],
                            datatype=["str", "str", "str"],
                            label="Extracted Rules List",
                            interactive=False,
                            visible=True,
                            row_count=5,
                            col_count=3,
                            column_widths=["150px", "300px", "auto"]
                        )
                        
                        # Hidden textbox to store the JSON for KB integration
                        extracted_rules_display = gr.Textbox(
                            label="Extracted Rules (JSON)",
                            value="Extracted rules will appear here...",
                            lines=15,
                            interactive=False,
                            visible=False
                        )
                        
                    
            # Tab 3: Chat & Rule Summary
            with gr.Tab("Chat & Rule Summary"):
                gr.Markdown("""
                # Interactive Business Rules Assistant
                Chat with your AI assistant to create, analyze, and manage business rules with intelligent conflict detection and impact analysis.
                """)
                
                with gr.Row():
                    # Left panel: Chat
                    with gr.Column(elem_classes=["config-section"], scale=1):
                        gr.HTML('<div class="section-header">Business Rules Management Assistant</div>')
                        gr.Markdown("*Enhanced with conversational interaction, conflict detection, and impact analysis*")
                        
                        def chat_and_update_agent3(user_input, history, rag_state_df, industry):
                            global rule_response
                            
                            # Always use Enhanced Agent 3 mode
                            response = chat_with_agent3(user_input, history, rag_state_df, industry)

                            # Extract rule information for summary display
                            if 'rule_response' in globals() and rule_response:
                                name = rule_response.get('name', 'Name will appear here after input.')
                                summary = rule_response.get('summary', 'Summary will appear here after input.')
                            else:
                                name = 'Name will appear here after input.'
                                summary = 'Summary will appear here after input.'
                            
                            return response, name, summary, rag_state_df
                        
                        chat_interface = gr.ChatInterface(
                            fn=chat_and_update_agent3,
                            chatbot=gr.Chatbot(height=400),
                            textbox=gr.Textbox(
                                placeholder="Ask me about business rules, create new rules, or check for conflicts...", 
                                scale=7
                            ),
                            additional_outputs=[name_display, summary_display, state_rag_df],
                            additional_inputs=[state_rag_df, industry_selector],
                        )
                    
                    # Right panel: Rule Summary with Agent 3 enhancements
                    with gr.Column(elem_classes=["rules-section"], scale=1):
                        gr.HTML('<div class="section-header">Rule Summary & Generation</div>')
                        name_display.render()
                        summary_display.render()
                        
                        # Fixed button for Enhanced Agent 3 mode only
                        action_button = gr.Button("Analyze Impact", variant="primary", elem_classes=["btn-primary"])
                        
                        status_box.render()
                        drl_file.render()
                        gdst_file.render()
                        
                        decision_support_accordion = gr.Accordion("File Generation", open=False, visible=True)
                        with decision_support_accordion:
                            
                            decision_button = gr.Button("Generate Files", variant="secondary", elem_classes=["btn-secondary"])
                            file_generation_status = gr.Markdown(
                                "File generation status will appear here after you click 'Generate Files'.",
                                label="Status",
                                elem_classes=["file-status"]
                            )
                            decision_drl_file = gr.File(label="Download Generated DRL")
                            decision_gdst_file = gr.File(label="Download Generated GDST")
                            
                            def handle_generation(industry):
                                """
                                Args:
                                    industry (str): Selected industry context
                                
                                Returns:
                                    Tuple: (status_message, drl_file, gdst_file)
                                """
                                # Get existing rules for validation
                                existing_rules = []
                                try:
                                    with open("extracted_rules.json", 'r') as f:
                                        existing_rules = json.load(f)
                                except FileNotFoundError:
                                    pass
                                # Check for conflicts first
                                conflicts, conflict_analysis = analyze_rule_conflicts(
                                    rule_response, existing_rules, industry
                                )
                                should_proceed, status_msg, orchestration_result_json = orchestrate_rule_generation(rule_response, conflicts)
                                
                                # Parse the orchestration result
                                try:
                                    if orchestration_result_json:
                                        orchestration_result = json.loads(orchestration_result_json)
                                    else:
                                        orchestration_result = None
                                    
                                    if orchestration_result.get("agent2_trigger", False):
                                        # Get the rule data from the orchestration result
                                        rule_data = orchestration_result.get("rule_data", {})
                                        
                                        # Call Agent 2 to generate DRL and GDST
                                        drl, gdst = json_to_drl_gdst(rule_data)
                                        verified = verify_drools_execution(drl, gdst)
                                        
                                        if verified:
                                            # Save files for download
                                            drl_path = "generated_rule.drl"
                                            gdst_path = "generated_table.gdst"
                                            with open(drl_path, "w") as f:
                                                f.write(drl)
                                            with open(gdst_path, "w") as f:
                                                f.write(gdst)
                                            
                                            message = (
                                                f"### ✓ Rule Generation Successful\n\n"
                                                f"**Rule:** {rule_data.get('name', 'Unnamed Rule')}\n\n"
                                                f"**Files have been created:**\n"
                                                f"- **DRL**: {drl_path}\n"
                                                f"- **GDST**: {gdst_path}\n\n"
                                                f"You can download the files below."
                                            )
                                            return message, drl_path, gdst_path
                                        else:
                                            return "### ⚠️ Generation Issue\n\nRule syntax verified, but execution verification failed.", None, None
                                    
                                    return f"### ℹ️ Status Update\n\n{status_msg} {orchestration_result.get('action', '')}", None, None
                                    
                                except json.JSONDecodeError:
                                    return f"### ⚠️ Processing Error\n\nError processing orchestration result.\n\n{status_msg}", None, None
                                except Exception as e:
                                    return f"### ❌ Generation Error\n\nAn error occurred during rule generation:\n\n```\n{str(e)}\n```", None, None
                            
                            decision_button.click(
                                handle_generation,
                                inputs=[industry_selector],
                                outputs=[file_generation_status, decision_drl_file, decision_gdst_file]
                            )

        # --- Event Actions (must be inside Blocks context) ---
        build_kb_button.click(
            build_knowledge_base_process,
            inputs=[document_upload, state_rag_df],
            outputs=[rag_status_display, state_rag_df]
        )

        # Business Rules tab event handlers
        def extract_rules_and_list(csv_file, rag_state_df):
            status_msg, rules_json, updated_df = extract_rules_from_uploaded_csv(csv_file, rag_state_df)
            
            # Convert rules to DataFrame for display
            try:
                rules = json.loads(rules_json) if rules_json else []
                rules_df = pd.DataFrame([(r.get('rule_id', ''), r.get('name', ''), r.get('description', '')) 
                                       for r in rules], columns=['ID', 'Name', 'Description'])
            except:
                rules_df = pd.DataFrame(columns=['ID', 'Name', 'Description'])
            
            return status_msg, rules_json, rules_df, updated_df
        # The extracted rules table will always be refreshed after extraction (success or fail)
        extract_button.click(
            extract_rules_and_list,
            inputs=[csv_upload, state_rag_df],
            outputs=[extraction_status, extracted_rules_display, extracted_rules_list, state_rag_df]
        )
        # Rules are now automatically added to knowledge base during extraction

        # Ensure chat_interface uses state_rag_df as input and output, so it always gets the latest KB
        def chat_and_update(user_input, history, rag_state_df, mode=None, industry=None):
            global rule_response
            response = chat_with_rag(user_input, history, rag_state_df)
            name = rule_response.get('name', 'Name will appear here after input.')
            summary = rule_response.get('summary', 'Summary will appear here after input.')
            return response, name, summary, rag_state_df
        chat_interface.fn = chat_and_update
        chat_interface.additional_inputs = [state_rag_df, industry_selector] 
        chat_interface.additional_outputs = [name_display, summary_display, state_rag_df]

        # Fixed button behavior for Enhanced Agent 3 mode only
        def handle_action_button(industry):
            return analyze_impact_only(industry)
        
        action_button.click(
            handle_action_button,
            inputs=[industry_selector],
            outputs=[status_box, drl_file, gdst_file]
        )
        
        chat_interface.chatbot.change(
            update_rule_summary,
            outputs=[name_display, summary_display]
        )
        
        # Configuration save/apply event handlers
        def save_config_and_refresh_summary(agent1_prompt, agent2_prompt, agent3_prompt, model, generation_config, industry):
            status_message, success = save_and_apply_config(agent1_prompt, agent2_prompt, agent3_prompt, model, generation_config, industry)
            
            # Only refresh the summary if save was successful
            if success:
                updated_summary = get_current_config_summary()
                return status_message, updated_summary
            else:
                # Return the status message but don't update summary
                return status_message, gr.update()
                
        save_apply_button.click(
            save_config_and_refresh_summary,
            inputs=[
                agent1_prompt_box, agent2_prompt_box, agent3_prompt_box, 
                default_model_box, generation_config_box, industry_selector
            ],
            outputs=[config_status, config_summary]
        )
        
        # Add search event handler
        def filter_rules(query: str, rules_df):
            if not query or not isinstance(rules_df, pd.DataFrame) or rules_df.empty:
                return rules_df
            
            query = query.lower()
            mask = rules_df.apply(lambda x: x.astype(str).str.lower().str.contains(query, na=False)).any(axis=1)
            return rules_df[mask]
            
        search_input.change(
            filter_rules,
            inputs=[search_input, extracted_rules_list],
            outputs=[extracted_rules_list]
        )
  
    return demo

