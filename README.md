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

## Langraph Workflow Orchestration

This system uses **LangGraph StateGraph** as the primary workflow orchestration engine for intelligent business rule management.

### 🏗️ LangGraph StateGraph Architecture

**Core Implementation:**
- **`utils/workflow_orchestrator.py`** - Main LangGraph StateGraph implementation
- **`BusinessRuleWorkflow`** class with 8-node StateGraph configuration
- **`WorkflowState` TypedDict** for structured data flow between nodes
- **Conditional routing functions** for intelligent decision making
- **State management** with message history and context preservation

**StateGraph Node Structure:**
```python
# LangGraph StateGraph nodes
self.graph.add_node("agent1_parse_rule", self._agent1_parse_rule)
self.graph.add_node("agent3_conflict_analysis", self._agent3_conflict_analysis)  
self.graph.add_node("agent3_impact_analysis", self._agent3_impact_analysis)
self.graph.add_node("agent3_orchestration", self._agent3_orchestration)
self.graph.add_node("agent2_generate_files", self._agent2_generate_files)
self.graph.add_node("verify_files", self._verify_files)
self.graph.add_node("generate_response", self._generate_response)
self.graph.add_node("handle_error", self._handle_error)
```

**Conditional Edge Routing:**
```python
# LangGraph conditional edges for intelligent workflow routing
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
🔧 **Modular Node Components**: Reusable agent nodes for each business rule task with state management  
🔍 **Execution Transparency**: Real-time node tracking & debugging capabilities with workflow metrics  
🌊 **Conditional Routing**: Intelligent decision making based on conflict analysis and orchestration results  
🤝 **Enhanced Agent Collaboration**: Clear interaction patterns between agents through structured state flow  
📈 **Scalability**: Complex multi-agent workflow management through graph-based orchestration  
🛡️ **Error Handling**: Dedicated error management nodes with graceful fallback mechanisms  
📊 **State Management**: TypedDict-based state preservation across workflow execution  

### 📊 LangGraph StateGraph Features

• **8-Node StateGraph Architecture**: agent1_parse_rule + agent3_conflict_analysis + agent3_impact_analysis + agent3_orchestration + agent2_generate_files + verify_files + generate_response + handle_error  
• **Visual workflow design** with StateGraph execution transparency  
• **Modular, reusable** agent nodes with TypedDict state management  
• **Conditional edge routing** based on conflict analysis and orchestration decisions  
• **Error handling nodes** with graceful error management workflows  
• **Real-time state tracking** visible in chat responses with workflow metrics  
• **Compatible** with existing RAG knowledge base system integration  
• **Conversation context** processing with message history preservation  

### 📖 How to Use LangGraph StateGraph

1. **Submit**: Send business rule creation or analysis requests in the Chat tab
2. **Monitor**: Watch real-time LangGraph StateGraph workflow execution and node transitions  
3. **Debug**: View transparent agent node interactions and conditional routing decisions
4. **Configure**: Adjust LangGraph workflow settings in the Configuration tab
5. **Generate**: Use StateGraph-orchestrated file generation for DRL/GDST output
6. **Analyze**: Review workflow metrics and state transitions for debugging and optimization

### � LangGraph Workflow Execution Flow

The **LangGraph StateGraph** orchestrates business rule processing through this visual workflow with **8 interconnected nodes** and **conditional routing**:

```
┌─────────────────┐
│   User Input    │ ← Natural language request  
│  (Natural Lang) │
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

**8 Workflow Nodes:**
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
- **Conversation context** processes history for enhanced understanding
- **Live status updates** track workflow progression through nodes

## Documentation
- [Business Documentation](./BUSINESS.md)
- [Architecture & Technical Documentation](./ARCHITECTURE.md)
- [Demo Flow](./Capstone_Demo_Flow.md)
- [Changelog](./gemini-gradio-poc/docs/CHANGELOG.md)

## Accessibility Resources
- **Audio Guide**: An audio TLDR guide is available at [gemini-gradio-poc/audio/intelligent_business_rules_guide.wav](./gemini-gradio-poc/audio/intelligent_business_rules_guide.wav). This serves as a mini-training on how to use the intelligent business rule management tool effectively. It goes over the content in [Capstone_Demo_Flow.md](https://github.com/nerealegui/capstone/blob/fee758e35c16387e2ca0d3a7cf4c659a1b7761b7/Capstone_Demo_Flow.md)

---

For installation, usage, and troubleshooting, refer to the documentation above. Contributions are welcome!
