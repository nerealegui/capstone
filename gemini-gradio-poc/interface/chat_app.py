import os
import gradio as gr
import json
import pandas as pd
from config.agent_config import INDUSTRY_CONFIGS
from typing import Dict, List, Any

# Import utility functions from their respective modules
from utils.ui_utils import (
    load_css_from_file,
    build_knowledge_base_process,
    extract_rules_from_uploaded_csv,
    get_workflow_status,
    process_rules_to_df,
    filter_rules,
    update_rule_summary
)
from utils.chat_utils import (
    chat_with_rag,
    chat_with_agent3,
    analyze_impact_only,
    get_last_rule_response
)
from utils.config_manager import (
    get_default_config,
    reload_prompts_from_defaults,
    load_config,
    get_current_config_summary,
    save_and_apply_config
)
from utils.file_generation_utils import handle_generation
from utils.persistence_manager import (
    load_knowledge_base,
    load_rules,
    session_exists,
    clear_session,
    get_session_summary,
    get_change_log
)

# Global variables
rule_response = {}  # Used for UI updates



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

    # Load saved session data on startup
    startup_kb_df = pd.DataFrame()
    startup_rules = []
    session_status = "No previous session found"
    
    try:
        # Try to load knowledge base
        kb_df, kb_msg = load_knowledge_base()
        if kb_df is not None:
            startup_kb_df = kb_df
            print(f"Loaded knowledge base: {kb_msg}")
        
        # Try to load rules
        rules, rules_msg = load_rules()
        if rules is not None:
            startup_rules = rules
            print(f"Loaded rules: {rules_msg}")
        
        # Get session summary if data exists
        if session_exists():
            session_status = f"Previous session loaded successfully\n{get_session_summary()}"
        
    except Exception as e:
        print(f"Warning: Could not load session data: {e}")
        session_status = f"Error loading session: {str(e)}"

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

    # --- State for RAG DataFrame (initialized with loaded session data) ---
    state_rag_df = gr.State(startup_kb_df)

    # Load CSS from external file
    custom_css = load_css_from_file("styles.css")
    
    with gr.Blocks(theme=gr.themes.Soft(), css=custom_css) as demo:
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
                                value=f"Knowledge base loaded with {len(startup_kb_df)} chunks" if not startup_kb_df.empty else "Knowledge base not built yet. Upload documents and click 'Build Knowledge Base' to get started.",
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
                        
                        gr.HTML('<div class="section-divider"></div>')
                        
                        gr.HTML('<div class="section-header blue-6"><svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm0 15A7 7 0 1 1 15 8a7 7 0 0 1-7 7z"></path><path d="M8 4a1 1 0 1 0 1 1 1 1 0 0 0-1-1zm1 3H7v4h2z"></path></svg> Session Management</div>')
                        with gr.Accordion("Session & Data Persistence", open=True):
                            session_status_display = gr.Textbox(
                                label="Session Status",
                                value=session_status,
                                interactive=False,
                                lines=4
                            )
                            
                            with gr.Row():
                                new_session_button = gr.Button("New Session", variant="secondary", elem_classes=["btn-secondary"], scale=1)
                                view_changes_button = gr.Button("View Changes", variant="secondary", elem_classes=["btn-secondary"], scale=1)
                    
                    # Agent Config Variables Column
                    with gr.Column(elem_classes=["config-section"], scale=1):
                        gr.HTML('<div class="section-header">Agent Configuration</div>')
                        
                        # Configuration Summary
                        with gr.Accordion("Configuration Summary", open=True):
                            # Render the configuration summary at app load
                            config_summary = gr.Markdown(get_current_config_summary())
                            
                        # Langraph Workflow Configuration
                        with gr.Accordion("🔄 Langraph Workflow Settings", open=True):
                            gr.Markdown("""
                            **Langraph Workflow is the default orchestration engine.**
                            
                            **Active Agents:**
                            - 🤖 **Agent 1**: Natural language → JSON rule parsing
                            - 🤖 **Agent 3**: Conflict analysis, impact assessment & orchestration
                            - 🤖 **Agent 2**: DRL/GDST file generation (conditional)
                            
                            **Features:**
                            - 🔍 Real-time status tracking in chat responses
                            - 📊 Transparent execution with agent visibility  
                            - 🌊 Conditional routing based on conflict analysis
                            - 🔧 Modular, reusable agent components
                            
                            For detailed documentation, see the [Langraph Workflow Guide](README.md#langraph-workflow-orchestration).
                            """)
                            
                            from utils.workflow_orchestrator import create_workflow
                            
                            workflow_status_display = gr.Markdown(
                                value=get_workflow_status(),
                                label="Workflow Status"
                            )
                            
                        
                        
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
                            wrap=True,
                            row_count=20,
                            column_widths=["150px", "300px", "auto"],
                            value=process_rules_to_df(startup_rules)
                        )
                        
                        # Hidden textbox to store the JSON for KB integration
                        extracted_rules_display = gr.Textbox(
                            label="Extracted Rules (JSON)",
                            value=json.dumps(startup_rules, indent=2) if startup_rules else "No rules loaded",
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
                        gr.Markdown("*Enhanced with Langraph workflow orchestration, conflict detection, and impact analysis*")
                        
                        def chat_and_update_agent3(user_input, history, rag_state_df, industry):
                            global rule_response
                            
                            # Always use Enhanced Agent 3 mode
                            response = chat_with_agent3(user_input, history, rag_state_df, industry)

                            # Extract rule information for summary display
                            rule_response = get_last_rule_response()
                            if rule_response:
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
                            
                            decision_button = gr.Button("Generate Files", variant="primary", elem_classes=["btn-primary"])
                            file_generation_status = gr.Markdown(
                                "File generation status will appear here after you click 'Generate Files'.",
                                label="Status",
                                elem_classes=["file-status"]
                            )
                            decision_drl_file = gr.File(label="Download Generated DRL")
                            decision_gdst_file = gr.File(label="Download Generated GDST")
                            
                            def handle_generation_click(industry):
                                """
                                Args:
                                    industry (str): Selected industry context
                                
                                Returns:
                                    Tuple: (status_message, drl_file, gdst_file)
                                """
                                global rule_response
                                return handle_generation(rule_response, industry)
                            
                            decision_button.click(
                                handle_generation_click,
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
            rule_response = get_last_rule_response()
            name = rule_response.get('name', 'Name will appear here after input.')
            summary = rule_response.get('summary', 'Summary will appear here after input.')
            return response, name, summary, rag_state_df
        chat_interface.fn = chat_and_update
        chat_interface.additional_inputs = [state_rag_df, industry_selector] 
        chat_interface.additional_outputs = [name_display, summary_display, state_rag_df]

        # Fixed button behavior for Enhanced Agent 3 mode only
        def handle_action_button(industry):
            global rule_response
            return analyze_impact_only(rule_response, industry)
        
        action_button.click(
            handle_action_button,
            inputs=[industry_selector],
            outputs=[status_box, drl_file, gdst_file]
        )
        
        chat_interface.chatbot.change(
            lambda: update_rule_summary(get_last_rule_response()),
            outputs=[name_display, summary_display]
        )
        
        # Session management functions
        def handle_new_session():
            """Clear the current session and start fresh."""
            try:
                success, message = clear_session()
                if success:
                    # Reset UI components
                    empty_df = pd.DataFrame()
                    status = f"✓ New session started: {message}"
                    return (
                        status,  # session_status_display
                        empty_df,  # state_rag_df
                        "Knowledge base cleared. Upload documents to build a new knowledge base.",  # rag_status_display
                        "",  # extraction_status (reset rules)
                    )
                else:
                    return (
                        f"✗ Error starting new session: {message}",
                        gr.update(),  # Don't update state_rag_df
                        gr.update(),  # Don't update rag_status_display
                        gr.update(),  # Don't update extraction_status
                    )
            except Exception as e:
                return (
                    f"✗ Error starting new session: {str(e)}",
                    gr.update(),
                    gr.update(),
                    gr.update(),
                )
        
        def handle_view_changes():
            """Display the change log for the current session."""
            try:
                changes = get_change_log()
                if not changes:
                    return "📝 **Session Activity Log**\n\nNo changes recorded in current session"
                
                # Format change log for display with better formatting
                formatted_changes = []
                for i, change in enumerate(changes[-10:], 1):  # Show last 10 changes
                    timestamp = change.get('timestamp', 'Unknown')
                    component = change.get('component', 'Unknown')
                    description = change.get('description', 'No description')
                    metadata = change.get('metadata', {})
                    
                    # Format timestamp for better readability
                    try:
                        from datetime import datetime
                        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                        formatted_time = dt.strftime('%Y-%m-%d %H:%M:%S')
                    except:
                        formatted_time = timestamp
                    
                    # Format component name
                    component_display = {
                        'knowledge_base': '📚 Knowledge Base',
                        'rules': '📋 Business Rules'
                    }.get(component, f'🔧 {component.title()}')
                    
                    # Build the change entry
                    change_entry = f"**{i}.** {component_display}\n"
                    change_entry += f"   ⏰ {formatted_time}\n"
                    change_entry += f"   📄 {description}\n"
                    
                    # Add metadata if available
                    if metadata:
                        metadata_parts = []
                        if 'chunks_count' in metadata:
                            metadata_parts.append(f"Chunks: {metadata['chunks_count']}")
                        if 'rules_count' in metadata:
                            metadata_parts.append(f"Rules: {metadata['rules_count']}")
                        if metadata_parts:
                            change_entry += f"   ℹ️  {', '.join(metadata_parts)}\n"
                    
                    formatted_changes.append(change_entry)
                
                header = f"📝 **Session Activity Log** ({len(changes)} total changes)\n\n"
                header += "**Recent Activity (Last 10 changes):**\n\n"
                
                return header + "\n".join(formatted_changes)
            except Exception as e:
                return f"❌ Error retrieving change log: {str(e)}"
        
        # Event handlers for session management
        new_session_button.click(
            handle_new_session,
            inputs=[],
            outputs=[session_status_display, state_rag_df, rag_status_display, extraction_status]
        )
        
        view_changes_button.click(
            handle_view_changes,
            inputs=[],
            outputs=[session_status_display]
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

        # Connect the search functionality
        search_input.change(
            filter_rules,
            inputs=[search_input, extracted_rules_list, extracted_rules_display],
            outputs=[extracted_rules_list]
        )
  
    return demo

