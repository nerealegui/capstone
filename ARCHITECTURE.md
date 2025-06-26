# Architecture Documentation

## System Overview

The Capstone project is an intelligent business rule management platform that empowers non-technical users to create, manage, and deploy business rules using a modern agent-based architecture and LLMs (Google Gemini). The system features a Gradio-based web interface, RAG (Retrieval-Augmented Generation) for context-aware responses, automated rule file generation (Drools DRL, GDST) with verification and download capabilities, and **comprehensive session persistence** for data continuity and workflow state management.

## Architecture Diagram

```mermaid
architecture-beta
    group frontend(cloud)[Frontend]
    group backend(server)[Backend]
    group ai(cloud)[AIAgents]
    group validation(server)[Validation Layer]
    group storage(database)[Storage]
    group persistence(database)[Session Persistence]

    service gradio(server)[Gradio UI] in frontend
    service ruletab(server)[Business Rules Tab] in frontend
    service api(server)[FastAPI planned] in backend
    service agent1(cloud)[Agent1 NL2JSON] in ai
    service agent2(cloud)[Agent2 JSON2DRLGDST] in ai
    service agent3(cloud)[Agent3 Enhanced] in ai
    service extractor(cloud)[Rule Extractor] in ai
    service gemini(cloud)[GoogleGeminiAPI] in ai
    service langraph(cloud)[LangGraph Orchestrator] in ai
    service validator(server)[Rule Validator] in validation
    service conflict(server)[Conflict Detection] in validation
    service kb(database)[KnowledgeBase] in storage
    service rules(database)[RuleFiles] in storage
    service csvdata(database)[CSV Data] in storage
    service sessions(database)[Session Data] in persistence
    service metadata(database)[Session Metadata] in persistence
    service changelog(database)[Change Log] in persistence

    gradio:R -- L:api
    gradio:R -- L:ruletab
    ruletab:B -- T:extractor
    api:R -- L:agent1
    agent1:B -- T:agent2
    agent2:R -- L:gemini
    agent3:R -- L:langraph
    langraph:R -- L:gemini
    extractor:R -- L:validator
    extractor:R -- L:gemini
    validator:R -- L:conflict
    agent1:R -- L:kb
    agent2:R -- L:rules
    extractor:R -- L:csvdata
    validator:R -- L:kb
    gradio:B -- T:kb
    gradio:B -- T:rules
    gradio:B -- T:sessions
    sessions:R -- L:metadata
    sessions:R -- L:changelog
    kb:B -- T:sessions
    rules:B -- T:sessions
```

## Development Status (June 2025)

### Current Implementation
- **Agent 1**: Converts natural language business rules to structured JSON using Google Gemini (via `google.genai`).
- **Agent 2**: Converts JSON rule output to Drools DRL and GDST files using Google Gen AI (`google.genai`).
- **Agent 3**: Enhanced with conflict detection, impact analysis, and orchestration capabilities.
- **Langraph Workflow Orchestration**: 9-node StateGraph with visual workflow design and transparent execution tracking for LLM tasks.
- **Session Persistence System**: Comprehensive data persistence with automatic session restoration, change logging, and metadata tracking.
- **Business Rule Validation**: CSV upload, extraction, conflict detection, and RAG integration system.
- **Rule Extractor**: LLM-powered intelligent conversion from CSV to structured JSON with fallback mechanisms.
- **Conflict Detection**: Validates rules for duplicates and conflicts before integration.
- **RAG Integration**: Extracted rules are automatically added to the knowledge base for searchable queries.
- **Enhanced UI**: New "Business Rules" tab for complete rule management workflow with Langraph visualization.
- **Verification Step**: Placeholder for Drools execution verification after file generation.
- **Gradio UI**: 'Preview & Apply' button triggers Agent 2, generates files, verifies, and provides download links.
- **File Download**: Users can download generated `.drl` and `.gdst` files directly from the interface.
- **Unit Tests**: Agent 2 logic, rule extraction functionality, Langraph workflows, and persistence manager covered by comprehensive tests.
- **UI Updates**: Cleaner interface, workflow toggle, improved status and download components.
- **Modular Architecture**: Complete code refactoring with separation of concerns and 50% reduction in main application file size.
- **Session Management UI**: Configuration tab integration with session status, new session creation, and change log viewing.

### Session Persistence Architecture
- **`utils/persistence_manager.py`**: Core persistence functionality with save/load operations for knowledge base and rules
- **Session Data Structure**: 
  - `data/sessions/knowledge_base.pkl` - Pickled pandas DataFrame with embeddings
  - `data/sessions/extracted_rules.json` - Business rules in JSON format  
  - `data/sessions/change_log.json` - Complete change history
  - `data/sessions/session_metadata.json` - Session tracking information
- **Automatic Session Loading**: Application startup automatically loads previous session data
- **Change Tracking**: All modifications logged with timestamps, component details, and metadata
- **Session Management**: UI controls for viewing session status, starting fresh, and reviewing change history

### Planned Architecture
- **Backend API**: FastAPI server for orchestration (planned).
- **Enhanced Agent Framework**: ✅ **Completed** - Langraph-based multi-agent orchestration with visual workflow design and 9-node StateGraph.
- **Session Persistence**: ✅ **Completed** - Comprehensive data persistence with automatic session restoration and change tracking.
- **Advanced Rule Storage**: ✅ **Partially Completed** - Versioned rule management and conflict detection with JSON-based storage.
- **Frontend Enhancements**: ✅ **Partially Completed** - Added Langraph workflow visualization tab, orchestration toggle, and session management UI.
- **Modular Architecture**: ✅ **Completed** - Complete code refactoring with separation of concerns and utility module organization.

## Workflow Summary

### Traditional Rule Creation Workflow
1. User enters a business rule in natural language via Gradio chat.
2. Agent 1 (LLM) converts the input to structured JSON.
3. User clicks 'Preview & Apply' to trigger Agent 2.
4. Agent 2 generates Drools DRL and GDST files using Google Gen AI.
5. System verifies the generated files (placeholder step).
6. User downloads the files if verification is successful.

### Business Rule Validation Workflow (New)
1. User uploads CSV file containing business rules via Business Rules tab.
2. Rule Extractor processes CSV using LLM-powered intelligent extraction.
3. System validates extracted rules for format and conflicts.
4. User reviews validation results and resolves any conflicts.
5. Validated rules are integrated into the RAG knowledge base.
6. Rules become searchable and queryable through the chat interface.
7. Users can download processed rules in JSON format.

### Langraph Workflow Orchestration (Enhanced)
1. User enables Langraph workflow in the Chat interface toggle.
2. User submits business rule request through chat.
3. Langraph StateGraph orchestrates the following 9-node workflow:
   - **Config Loading Node**: Dynamic configuration and prompt management from config_manager
   - **Agent 1 Node**: Parses natural language into structured JSON
   - **Agent 3 Conflict Node**: Analyzes conflicts with existing rules
   - **Agent 3 Impact Node**: Assesses rule impact and risks
   - **Agent 3 Orchestration Node**: Makes generation decisions with conditional routing
   - **Agent 2 Node**: Generates DRL and GDST files (conditional)
   - **Verification Node**: Validates generated files
   - **Response Node**: Generates user-facing response
   - **Error Handling Node**: Manages workflow errors and fallbacks
4. Workflow provides transparent execution tracking and error handling with real-time state monitoring.
5. All workflow results are automatically persisted with session continuity and change logging.
6. System falls back to traditional Agent 3 workflow on errors with session preservation.
7. Users can visualize workflow structure in the Langraph Workflow tab and monitor session data in Configuration tab.

### Session Persistence Workflow (New)
1. **Application Startup**: System automatically loads previous session data if available.
2. **Knowledge Base Loading**: Restored from `data/sessions/knowledge_base.pkl` with embeddings intact.
3. **Rules Loading**: Restored from `data/sessions/extracted_rules.json` with full rule structures.
4. **Change Log Recovery**: Complete audit trail loaded from `data/sessions/change_log.json`.
5. **Session Metadata**: Timestamps and session information loaded from `data/sessions/session_metadata.json`.
6. **Continuous Persistence**: All new data automatically saved during workflow execution.
7. **Session Management**: UI controls for viewing status, starting fresh sessions, and reviewing change history.
8. **Data Safety**: All work preserved between application restarts with no data loss.

## Modular Architecture & File Organization

### Code Refactoring Overview (June 2025)
The system has undergone comprehensive modularization with **separation of concerns** architecture and **50% reduction** in main application file size:

#### Core Interface Files
- **`interface/chat_app.py`** (501 lines) - Pure UI logic and component definitions
- **`interface/styles.css`** - Professional GitHub-inspired styling

#### Utility Modules
- **`utils/ui_utils.py`** (288 lines) - UI-specific helper functions and Gradio interface utilities
- **`utils/chat_utils.py`** (252 lines) - Chat logic and conversation state management
- **`utils/file_generation_utils.py`** (82 lines) - Business rule file generation orchestration
- **`utils/persistence_manager.py`** (350+ lines) - Session persistence and data management
- **`utils/workflow_orchestrator.py`** (600+ lines) - LangGraph StateGraph implementation
- **`utils/config_manager.py`** (Enhanced) - Configuration management with save & apply functionality
- **`utils/agent3_utils.py`** - Enhanced conflict detection and impact analysis
- **`utils/rag_utils.py`** - RAG functionality and knowledge base management
- **`utils/rule_utils.py`** - Rule processing and validation utilities

#### Session Persistence File Structure
```
data/sessions/
├── knowledge_base.pkl      # Processed documents with embeddings (pickle format)
├── extracted_rules.json    # Business rules in structured JSON format
├── change_log.json        # Complete change history and audit trail
└── session_metadata.json  # Session tracking and timestamps
```

#### Benefits of Modular Architecture
- **Single Responsibility Principle**: Each module has a clear, focused purpose
- **Enhanced Testability**: Utility functions can be tested in isolation
- **Code Reusability**: Functions can be reused across different interfaces
- **Better Maintainability**: Business logic separated from UI concerns
- **Enterprise-Ready**: Structure suitable for professional development environments
- **State Management**: Proper handling of global state across modules
- **Error Isolation**: Issues in business logic don't affect UI rendering

---

## Session Persistence System

### Overview
The system includes comprehensive session persistence functionality that automatically saves and loads knowledge base data, business rules, and session metadata between application sessions.

### Core Features

#### 1. Automatic Session Management
- **Application Startup**: Automatically loads previously saved knowledge base and rules data
- **Session Detection**: Checks for existing session data and resumes where left off
- **Data Restoration**: Seamless restoration of document chunks, embeddings, and structured rules
- **Status Display**: Session information visible in Configuration tab

#### 2. Persistent Data Storage
- **Knowledge Base**: Stored using pickle format for efficient serialization of embeddings
- **Rules Storage**: JSON format for human-readable structure and easy editing  
- **Change Logging**: Complete audit trail of all modifications with timestamps
- **Session Metadata**: Tracks session creation, IDs, and update times

#### 3. Session Management UI
Located in the Configuration tab under "Session & Data Persistence":
- **Session Status**: Shows current session information including data counts and timestamps
- **New Session Button**: Clears all current session data and starts fresh
- **View Changes Button**: Displays the change log for the current session
- **Session Summary**: Overview of knowledge base size, rules count, and recent activity

#### 4. Data Safety & Continuity
- **Automatic Saving**: All knowledge base and rules changes automatically persisted
- **Error Handling**: Graceful handling of missing or corrupted session files
- **Data Integrity**: Comprehensive validation ensures data consistency
- **Backup Strategy**: Session files excluded from version control for security

### Technical Implementation

#### Persistence Manager API
```python
# Core functions from utils/persistence_manager.py
save_knowledge_base(df, description) -> (success, message)
load_knowledge_base() -> (dataframe, message)
save_rules(rules, description) -> (success, message)
load_rules() -> (rules, message)
session_exists() -> bool
clear_session() -> (success, message)
get_session_summary() -> str
get_change_log() -> List[Dict]
```

#### Integration Points
- **Knowledge Base Building**: Automatic persistence during document processing
- **Rule Extraction**: Persistent storage of extracted and validated rules
- **Workflow Orchestration**: Session data available to all LangGraph workflow nodes
- **UI Components**: Real-time session status updates and management controls

### Benefits
1. **Continuity**: Users can resume work where they left off
2. **Data Safety**: All work is automatically preserved
3. **Traceability**: Complete audit trail of changes
4. **Flexibility**: Easy to start fresh or continue existing work
5. **Performance**: Efficient storage and loading of large datasets
6. **Reliability**: Comprehensive error handling and data validation

---
