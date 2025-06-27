# Capstone Project: Intelligent Business Rule Management

Welcome to the Capstone project! This repository provides an intelligent, agent-based business rule management system that empowers non-technical users to create, manage, and deploy business rules with ease.

- For business context, goals, use cases, and feature descriptions, see [BUSINESS.md](./BUSINESS.md).
- For technical architecture, diagrams, and workflow, see [ARCHITECTURE.md](./ARCHITECTURE.md).
- For a detailed demo walkthrough with examples, see [Capstone_Demo_Flow.md](./Capstone_Demo_Flow.md).

## Quick Start

1. Clone the repository:
    ```bash
    git clone https://github.com/nerealegui/capstone.git
    ```
2. See [ARCHITECTURE.md](./ARCHITECTURE.md) for setup and technical details.
3. See [BUSINESS.md](./BUSINESS.md) for business use cases and workflow.

## 🐳 Docker Deployment

The fastest way to get started is using Docker. This approach provides a containerized environment with all dependencies pre-configured.

### Option 1: Build and Run Locally

```bash
# Build and run using docker-compose
docker-compose up --build
```

### Option 2: Pull from GitHub Container Registry

You can also pull the pre-built Docker image from GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/nerealegui/capstone:latest

# Run the container
docker run -p 7860:7860 \
  -e GOOGLE_API_KEY=your_api_key \
  -e GRADIO_SERVER_NAME=0.0.0.0 \
  -e GRADIO_SERVER_PORT=7860 \
  -e PYTHONPATH=/app \
  ghcr.io/nerealegui/capstone:latest
```

For more detailed information about building and pushing Docker images to GitHub Container Registry, see [GHCR_PUBLISH.md](./GHCR_PUBLISH.md).

### Access Your Application

Once deployed, access your application at:
- **🌐 Local**: http://localhost:7860
- **📱 Network**: http://0.0.0.0:7860 (if running on a server)

### Docker Benefits

- ✅ **No local dependencies** - Everything runs in container
- 🚀 **One-command deployment** - Quick start script handles everything  
- 💾 **Data persistence** - Session data preserved between restarts
- 🔧 **Production-ready** - Includes health checks and proper logging
- 🛡️ **Isolated environment** - No conflicts with local Python installations

## Langraph Workflow Orchestration

This system uses **LangGraph StateGraph** as the primary workflow orchestration engine for intelligent business rule management.

### 🏗️ LangGraph StateGraph Architecture

**Core Implementation:**
- **`utils/workflow_orchestrator.py`** - Main LangGraph StateGraph implementation
- **`BusinessRuleWorkflow`** class with 9-node StateGraph configuration
- **`WorkflowState` TypedDict** for structured data flow between nodes with dynamic config loading
- **Conditional routing functions** for intelligent decision making
- **State management** with enhanced conversation history and context preservation
- **Modularized utilities** integration with config_manager and file_generation_utils

**StateGraph Node Structure:**
```python
# LangGraph StateGraph nodes (9 total)
self.graph.add_node("load_config", self._load_config)
self.graph.add_node("agent1_parse_rule", self._agent1_parse_rule)
self.graph.add_node("agent3_conflict_analysis", self._agent3_conflict_analysis)  
self.graph.add_node("agent3_impact_analysis", self._agent3_impact_analysis)
self.graph.add_node("agent3_orchestration", self._agent3_orchestration)
self.graph.add_node("agent2_generate_files", self._agent2_generate_files)
self.graph.add_node("verify_files", self._verify_files)
self.graph.add_node("generate_response", self._generate_response)
self.graph.add_node("handle_error", self._handle_error)

# Entry point: load_config (dynamic configuration loading)
self.graph.set_entry_point("load_config")
```

**Conditional Edge Routing:**
```python
# LangGraph conditional edges for intelligent workflow routing
self.graph.add_conditional_edges(
    "load_config",
    lambda state: "agent1_parse_rule",  # Direct flow to rule parsing
    {"agent1_parse_rule": "agent1_parse_rule"}
)

self.graph.add_conditional_edges(
    "agent1_parse_rule", 
    self._should_proceed_to_conflict_analysis,
    {"conflict_analysis": "agent3_conflict_analysis", "error": "handle_error"}
)

self.graph.add_conditional_edges(
    "agent3_orchestration",
    self._should_generate_files, 
    {"generate_files": "agent2_generate_files", "response_only": "generate_response", "error": "handle_error"}
)
```

### 🚀 LangGraph StateGraph Benefits

🎯 **Visual Workflow Design**: Clear StateGraph representation with transparent agent node interactions  
🔧 **Modular Node Components**: Reusable agent nodes with state management and modularized utility integration  
🔍 **Execution Transparency**: Real-time node tracking & debugging capabilities with workflow metrics  
🌊 **Conditional Routing**: Intelligent decision making based on conflict analysis and orchestration results  
🤝 **Enhanced Agent Collaboration**: Clear interaction patterns between agents through structured state flow  
📈 **Scalability**: Complex multi-agent workflow management through graph-based orchestration  
🛡️ **Error Handling**: Dedicated error management nodes with graceful fallback mechanisms  
📊 **State Management**: TypedDict-based state preservation with enhanced conversation history processing  
⚙️ **Dynamic Configuration**: Runtime config loading with modularized utility integration  

### 📊 LangGraph StateGraph Features

• **9-Node StateGraph Architecture**: load_config + agent1_parse_rule + agent3_conflict_analysis + agent3_impact_analysis + agent3_orchestration + agent2_generate_files + verify_files + generate_response + handle_error  
• **Visual workflow design** with StateGraph execution transparency  
• **Modular, reusable** agent nodes with TypedDict state management and utility integration  
• **Dynamic configuration loading** at workflow entry point with config_manager integration  
• **Enhanced conversation history** processing with improved context window and message handling  
• **Conditional edge routing** based on conflict analysis and orchestration decisions  
• **Error handling nodes** with graceful error management workflows  
• **Real-time state tracking** visible in chat responses with workflow metrics  
• **Compatible** with existing RAG knowledge base system integration  
• **Modularized utilities** integration with config_manager and file_generation_utils  

### 📖 How to Use LangGraph StateGraph

1. **Submit**: Send business rule creation or analysis requests in the Chat tab
2. **Monitor**: Watch real-time LangGraph StateGraph workflow execution and node transitions  
3. **Debug**: View transparent agent node interactions and conditional routing decisions
4. **Configure**: Adjust LangGraph workflow settings in the Configuration tab
5. **Generate**: Use StateGraph-orchestrated file generation for DRL/GDST output
6. **Analyze**: Review workflow metrics and state transitions for debugging and optimization

### � LangGraph Workflow Execution Flow

The **LangGraph StateGraph** orchestrates business rule processing through this visual workflow with **9 interconnected nodes** and **conditional routing**:

```
┌─────────────────┐
│   User Input    │ ← Natural language request  
│  (Natural Lang) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  ⚙️ CONFIG      │ ← LangGraph Node: Dynamic configuration loading
│   Load Config   │   (Entry Point - NEW)
│                 │  
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 1     │ ← LangGraph Node: Parse natural language to JSON
│  Parse & Extract│
│   JSON Rule     │  
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← LangGraph Node: Analyze conflicts with existing rules
│ Conflict Analysis│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← LangGraph Node: Assess business impact & risk
│ Impact Analysis │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← LangGraph Node: Decision routing with conditional edges
│  Orchestration  │
│   (Decision)    │
└─────────┬───────┘
          │
     ┌────┴────┐ ← LangGraph Conditional Edges
     │         │
     ▼         ▼
┌─────────┐ ┌─────────┐
│🤖AGENT 2│ │Response │ ← Direct response (no files)
│Generate │ │  Only   │
│  Files  │ │         │
│(DRL/GDST│ └─────────┘
└────┬────┘
     │
     ▼
┌─────────┐
│ Verify  │ ← LangGraph Node: Validate generated files
│ Files   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Final Response  │ ← LangGraph Node: User-facing response generation
│  (User-facing)  │
└─────────────────┘
```

### 🎛️ LangGraph StateGraph Features

**9 Workflow Nodes:**
- `load_config` → Dynamic configuration loading (Entry Point)
- `agent1_parse_rule` → Natural language parsing to structured JSON
- `agent3_conflict_analysis` → Conflict analysis with existing rules
- `agent3_impact_analysis` → Impact assessment and risk evaluation  
- `agent3_orchestration` → Orchestration decisions with conditional routing
- `agent2_generate_files` → DRL/GDST file generation (conditional)
- `verify_files` → File validation and quality checks
- `generate_response` → User-facing results with status updates
- `handle_error` → Graceful error management and fallbacks

**Conditional Routing:**
- **Smart decision making** based on conflict analysis results
- **Dynamic branching** between file generation vs. direct response
- **Error handling** with automatic fallback mechanisms
- **State management** using TypedDict for data flow between nodes

**Real-time Execution:**
- **Visual workflow monitoring** shows active nodes and transitions
- **State transparency** reveals decision points and data flow
- **Enhanced conversation context** processing with improved history handling
- **Live status updates** track workflow progression through nodes
- **Dynamic configuration** loading with modularized utility integration
- **Persistent data flow** with automatic session state preservation
- **Change tracking** for complete audit trail and version control
- **Error recovery** with session continuity and rollback capabilities

## Session Persistence & Data Management

**🔄 Automatic Session Continuity**: The system now includes comprehensive session persistence that automatically saves and restores your work between application sessions.

### Key Persistence Features
- **📚 Knowledge Base Persistence**: Automatically saves uploaded documents, embeddings, and RAG data
- **📋 Rules Management**: Persistent storage of extracted business rules with version tracking
- **📊 Change Logging**: Complete audit trail of all modifications with timestamps and metadata
- **🔄 Session Recovery**: Automatic restoration of previous session data on application startup
- **💾 Data Safety**: All work is automatically preserved with no data loss between sessions

### Persistence File Structure
```
data/sessions/
├── knowledge_base.pkl      # Processed documents with embeddings (pickle format)
├── extracted_rules.json    # Business rules in structured JSON format
├── change_log.json        # Complete change history and audit trail
└── session_metadata.json  # Session tracking and timestamps
```

### Session Management UI
Located in the **Configuration tab** under "Session & Data Persistence":
- **Session Status**: View current session information and data statistics
- **New Session**: Clear all current data and start fresh 
- **View Changes**: Display complete change log for current session
- **Session Summary**: Overview of knowledge base size, rules count, and recent activity

## Langraph Workflow Orchestration

This system uses **LangGraph StateGraph** as the primary workflow orchestration engine for intelligent business rule management with **comprehensive session persistence**.

### 🏗️ LangGraph StateGraph Architecture

**Core Implementation:**
- **`utils/workflow_orchestrator.py`** - Main LangGraph StateGraph implementation with 9-node architecture
- **`utils/persistence_manager.py`** - Comprehensive session persistence and data management
- **`BusinessRuleWorkflow`** class with 9-node StateGraph configuration and persistent state
- **`WorkflowState` TypedDict** for structured data flow between nodes with dynamic config loading
- **Conditional routing functions** for intelligent decision making and persistent storage integration
- **State management** with enhanced conversation history, context preservation, and automatic persistence
- **Modularized utilities** integration with config_manager, file_generation_utils, and persistence_manager

**StateGraph Node Structure:**
```python
# LangGraph StateGraph nodes (9 total)
self.graph.add_node("load_config", self._load_config)
self.graph.add_node("agent1_parse_rule", self._agent1_parse_rule)
self.graph.add_node("agent3_conflict_analysis", self._agent3_conflict_analysis)  
self.graph.add_node("agent3_impact_analysis", self._agent3_impact_analysis)
self.graph.add_node("agent3_orchestration", self._agent3_orchestration)
self.graph.add_node("agent2_generate_files", self._agent2_generate_files)
self.graph.add_node("verify_files", self._verify_files)
self.graph.add_node("generate_response", self._generate_response)
self.graph.add_node("handle_error", self._handle_error)

# Entry point: load_config (dynamic configuration loading)
self.graph.set_entry_point("load_config")
```

**Conditional Edge Routing:**
```python
# LangGraph conditional edges for intelligent workflow routing
self.graph.add_conditional_edges(
    "load_config",
    lambda state: "agent1_parse_rule",  # Direct flow to rule parsing
    {"agent1_parse_rule": "agent1_parse_rule"}
)

self.graph.add_conditional_edges(
    "agent1_parse_rule", 
    self._should_proceed_to_conflict_analysis,
    {"conflict_analysis": "agent3_conflict_analysis", "error": "handle_error"}
)

self.graph.add_conditional_edges(
    "agent3_orchestration",
    self._should_generate_files, 
    {"generate_files": "agent2_generate_files", "response_only": "generate_response", "error": "handle_error"}
)
```

### 🚀 LangGraph StateGraph Benefits

🎯 **Visual Workflow Design**: Clear StateGraph representation with transparent agent node interactions  
🔧 **Modular Node Components**: Reusable agent nodes with state management and modularized utility integration  
🔍 **Execution Transparency**: Real-time node tracking & debugging capabilities with workflow metrics  
🌊 **Conditional Routing**: Intelligent decision making based on conflict analysis and orchestration results  
🤝 **Enhanced Agent Collaboration**: Clear interaction patterns between agents through structured state flow  
📈 **Scalability**: Complex multi-agent workflow management through graph-based orchestration  
🛡️ **Error Handling**: Dedicated error management nodes with graceful fallback mechanisms  
📊 **State Management**: TypedDict-based state preservation with enhanced conversation history processing  
⚙️ **Dynamic Configuration**: Runtime config loading with modularized utility integration  
💾 **Session Persistence**: Automatic data preservation with comprehensive persistence management  
🔄 **Data Continuity**: Seamless restoration of knowledge base and rules between sessions  
📋 **Change Tracking**: Complete audit trail of all modifications and system changes  

### 📊 LangGraph StateGraph Features

• **9-Node StateGraph Architecture**: load_config + agent1_parse_rule + agent3_conflict_analysis + agent3_impact_analysis + agent3_orchestration + agent2_generate_files + verify_files + generate_response + handle_error  
• **Visual workflow design** with StateGraph execution transparency  
• **Modular, reusable** agent nodes with TypedDict state management and utility integration  
• **Dynamic configuration loading** at workflow entry point with config_manager integration  
• **Enhanced conversation history** processing with improved context window and message handling  
• **Conditional edge routing** based on conflict analysis and orchestration decisions  
• **Error handling nodes** with graceful error management workflows  
• **Real-time state tracking** visible in chat responses with workflow metrics  
• **Compatible** with existing RAG knowledge base system integration  
• **Modularized utilities** integration with config_manager and file_generation_utils  
• **Session persistence integration** with automatic knowledge base and rules storage  
• **Persistent state management** with change logging and metadata tracking  
• **Data continuity** across application restarts with session recovery capabilities  

### 📖 How to Use LangGraph StateGraph

1. **Submit**: Send business rule creation or analysis requests in the Chat tab
2. **Monitor**: Watch real-time LangGraph StateGraph workflow execution and node transitions  
3. **Debug**: View transparent agent node interactions and conditional routing decisions
4. **Configure**: Adjust LangGraph workflow settings in the Configuration tab
5. **Generate**: Use StateGraph-orchestrated file generation for DRL/GDST output
6. **Analyze**: Review workflow metrics and state transitions for debugging and optimization
7. **Persist**: All workflow results are automatically saved with session persistence
8. **Resume**: Continue previous work seamlessly with automatic session restoration
9. **Track**: Monitor complete change history and audit trail through session management

### � LangGraph Workflow Execution Flow

The **LangGraph StateGraph** orchestrates business rule processing through this visual workflow with **9 interconnected nodes** and **conditional routing**:

```
┌─────────────────┐
│   User Input    │ ← Natural language request  
│  (Natural Lang) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  ⚙️ CONFIG      │ ← LangGraph Node: Dynamic configuration loading
│   Load Config   │   (Entry Point - NEW)
│                 │  
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 1     │ ← LangGraph Node: Parse natural language to JSON
│  Parse & Extract│
│   JSON Rule     │  
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← LangGraph Node: Analyze conflicts with existing rules
│ Conflict Analysis│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← LangGraph Node: Assess business impact & risk
│ Impact Analysis │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← LangGraph Node: Decision routing with conditional edges
│  Orchestration  │
│   (Decision)    │
└─────────┬───────┘
          │
     ┌────┴────┐ ← LangGraph Conditional Edges
     │         │
     ▼         ▼
┌─────────┐ ┌─────────┐
│🤖AGENT 2│ │Response │ ← Direct response (no files)
│Generate │ │  Only   │
│  Files  │ │         │
│(DRL/GDST│ └─────────┘
└────┬────┘
     │
     ▼
┌─────────┐
│ Verify  │ ← LangGraph Node: Validate generated files
│ Files   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Final Response  │ ← LangGraph Node: User-facing response generation
│  (User-facing)  │
└─────────────────┘
```

### 🎛️ LangGraph StateGraph Features

**9 Workflow Nodes:**
- `load_config` → Dynamic configuration loading (Entry Point)
- `agent1_parse_rule` → Natural language parsing to structured JSON
- `agent3_conflict_analysis` → Conflict analysis with existing rules
- `agent3_impact_analysis` → Impact assessment and risk evaluation  
- `agent3_orchestration` → Orchestration decisions with conditional routing
- `agent2_generate_files` → DRL/GDST file generation (conditional)
- `verify_files` → File validation and quality checks
- `generate_response` → User-facing results with status updates
- `handle_error` → Graceful error management and fallbacks

**Conditional Routing:**
- **Smart decision making** based on conflict analysis results
- **Dynamic branching** between file generation vs. direct response
- **Error handling** with automatic fallback mechanisms
- **State management** using TypedDict for data flow between nodes

**Real-time Execution:**
- **Visual workflow monitoring** shows active nodes and transitions
- **State transparency** reveals decision points and data flow
- **Enhanced conversation context** processing with improved history handling
- **Live status updates** track workflow progression through nodes
- **Dynamic configuration** loading with modularized utility integration
- **Persistent data flow** with automatic session state preservation
- **Change tracking** for complete audit trail and version control
- **Error recovery** with session continuity and rollback capabilities

## Modular Architecture & Code Organization

### 🏗️ Complete Architecture Refactoring (June 2025)
The system has undergone comprehensive modularization with **50% reduction** in main application file size and **separation of concerns** architecture:

#### 📋 New Utility Modules
- **`utils/ui_utils.py`** (288 lines) - UI-specific helper functions and Gradio interface utilities
- **`utils/chat_utils.py`** (252 lines) - Chat logic and conversation state management  
- **`utils/file_generation_utils.py`** (82 lines) - Business rule file generation orchestration
- **`utils/persistence_manager.py`** (350+ lines) - Comprehensive session persistence and data management
- **`utils/config_manager.py`** (Enhanced) - Configuration management with save & apply functionality

#### 🎯 Modular Benefits
- **Single Responsibility**: Each module has a clear, focused purpose
- **Enhanced Testability**: Utility functions can be tested in isolation
- **Code Reusability**: Functions can be reused across different interfaces
- **Better Maintainability**: Business logic separated from UI concerns
- **Enterprise-Ready**: Structure suitable for professional development environments

## Documentation
- [Business Documentation](./BUSINESS.md)
- [Architecture & Technical Documentation](./ARCHITECTURE.md)
- [Demo Flow](./Capstone_Demo_Flow.md)
- [Changelog](./gemini-gradio-poc/docs/CHANGELOG.md)
- [Session Persistence Documentation](./gemini-gradio-poc/docs/SESSION_PERSISTENCE.md)

## Accessibility Resources
- **Audio Guide**: An audio TLDR guide is available at [gemini-gradio-poc/audio/intelligent_business_rules_guide.wav](./gemini-gradio-poc/audio/intelligent_business_rules_guide.wav). This serves as a mini-training on how to use the intelligent business rule management tool effectively. It goes over the content in [Capstone_Demo_Flow.md](https://github.com/nerealegui/capstone/blob/fee758e35c16387e2ca0d3a7cf4c659a1b7761b7/Capstone_Demo_Flow.md)

## System Requirements & Setup
- **Python 3.8+** with required dependencies in requirements.txt
- **Google Gemini API Key** for LLM functionality
- **Gradio Interface** for web-based interaction
- **Session Storage**: Automatic creation of data/sessions/ directory for persistence
- **Memory Requirements**: Sufficient space for knowledge base embeddings and session data

---

For installation, usage, and troubleshooting, refer to the documentation above. Contributions are welcome!
