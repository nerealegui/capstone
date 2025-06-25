"""
Langraph Workflow Orchestrator for Business Rule Management Platform

This module provides Langraph-based workflow orchestration for the multi-agent
business rule management system, enabling visual workflow design and better
orchestration of LLM tasks.
"""

import json
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple, TypedDict
from langgraph.graph import Graph, StateGraph
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage

# Import existing agent utilities
from utils.rag_utils import rag_generate, initialize_gemini_client
from utils.rule_utils import json_to_drl_gdst, verify_drools_execution
from utils.agent3_utils import (
    analyze_rule_conflicts, 
    assess_rule_impact, 
    generate_conversational_response,
    orchestrate_rule_generation
)
from utils.json_response_handler import JsonResponseHandler
from config.agent_config import AGENT1_PROMPT, AGENT2_PROMPT


class WorkflowState(TypedDict):
    """State object for the Langraph workflow"""
    messages: List[BaseMessage]
    user_input: str
    structured_rule: Optional[Dict[str, Any]]
    conflicts: List[Dict[str, Any]]
    impact_analysis: Optional[Dict[str, Any]]
    drl_content: Optional[str]
    gdst_content: Optional[str]
    verification_result: Optional[str]
    rag_df: Optional[pd.DataFrame]
    industry: str
    error_message: Optional[str]
    final_response: str


def get_workflow_visualization() -> str:
    """
    Generate a text-based visualization of the Langraph workflow
    
    Returns:
        String representation of the workflow graph
    """
    return """
🔄 **Business Rule Management Workflow (Langraph)**

**🎯 Agent Execution Flow:**

```
┌─────────────────┐
│   User Input    │ ← Natural language request
│  (Natural Lang) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 1     │ ← Parse natural language to JSON
│  Parse & Extract│
│   JSON Rule     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← Analyze conflicts with existing rules
│ Conflict Analysis│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← Assess business impact & risk
│ Impact Analysis │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  🤖 AGENT 3     │ ← Decision: Generate files or respond?
│  Orchestration  │
│   (Decision)    │
└─────────┬───────┘
          │
     ┌────┴────┐
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
│ Verify  │ ← Validate generated files
│ Files   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Final Response  │ ← User-facing response with status
│  (User-facing)  │
└─────────────────┘
```

**📊 Workflow Features:**
• **3 AI Agents**: Agent 1 (parsing) + Agent 3 (analysis & orchestration) + Agent 2 (file generation)
• **Visual workflow** design & debugging transparency
• **Modular, reusable** agent components for each task
• **Conditional branching** based on conflict analysis results
• **Error handling** with graceful error management
• **Real-time status** updates visible in chat responses
• **Compatible** with existing RAG knowledge base system

**🔍 Agent Roles:**
- **Agent 1**: Natural language → structured JSON rule conversion
- **Agent 3**: Business rule conflict detection, impact analysis, and workflow orchestration  
- **Agent 2**: DRL (Drools Rule Language) and GDST file generation when needed
"""


class BusinessRuleWorkflow:
    """
    Langraph-based workflow orchestrator for business rule management.
    
    This class defines a workflow graph that orchestrates the interaction
    between different agents in the business rule management platform.
    """
    
    def __init__(self):
        """Initialize the workflow with Langraph StateGraph"""
        self.graph = StateGraph(WorkflowState)
        self._build_workflow()
        
    def _build_workflow(self):
        """Build the Langraph workflow by defining nodes and edges"""
        
        # Add nodes for each agent/task
        self.graph.add_node("agent1_parse_rule", self._agent1_parse_rule)
        self.graph.add_node("agent3_conflict_analysis", self._agent3_conflict_analysis)
        self.graph.add_node("agent3_impact_analysis", self._agent3_impact_analysis)
        self.graph.add_node("agent3_orchestration", self._agent3_orchestration)
        self.graph.add_node("agent2_generate_files", self._agent2_generate_files)
        self.graph.add_node("verify_files", self._verify_files)
        self.graph.add_node("generate_response", self._generate_response)
        self.graph.add_node("handle_error", self._handle_error)
        
        # Set entry point
        self.graph.set_entry_point("agent1_parse_rule")
        
        # Define workflow edges
        self.graph.add_conditional_edges(
            "agent1_parse_rule",
            self._should_proceed_to_conflict_analysis,
            {
                "conflict_analysis": "agent3_conflict_analysis",
                "error": "handle_error"
            }
        )
        
        self.graph.add_edge("agent3_conflict_analysis", "agent3_impact_analysis")
        self.graph.add_edge("agent3_impact_analysis", "agent3_orchestration")
        
        self.graph.add_conditional_edges(
            "agent3_orchestration",
            self._should_generate_files,
            {
                "generate_files": "agent2_generate_files",
                "response_only": "generate_response",
                "error": "handle_error"
            }
        )
        
        self.graph.add_edge("agent2_generate_files", "verify_files")
        self.graph.add_edge("verify_files", "generate_response")
        self.graph.add_edge("handle_error", "generate_response")
        
        # Set finish point
        self.graph.set_finish_point("generate_response")
        
    def _agent1_parse_rule(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 1: Parse natural language input into structured JSON rule
        """
        try:
            print(f"[Workflow] 🤖 Agent 1: Parsing user input: {state['user_input'][:100]}...")
            
            # Use RAG if available
            if state.get('rag_df') is not None and not state['rag_df'].empty:
                response = rag_generate(
                    user_query=state['user_input'],
                    context={},
                    rag_df=state['rag_df'],
                    industry=state.get('industry', 'generic'),
                    history=[]
                )
            else:
                # Fallback to direct LLM call without RAG
                client = initialize_gemini_client()
                prompt = f"{AGENT1_PROMPT}\n\nUser Input: {state['user_input']}"
                
                response_obj = client.models.generate_content(
                    model="gemini-2.0-flash-exp",
                    contents=[{"role": "user", "parts": [{"text": prompt}]}]
                )
                response = response_obj.text
            
            # Parse JSON response
            handler = JsonResponseHandler()
            structured_rule = handler.parse_json_response(response)
            
            state["structured_rule"] = structured_rule
            state["messages"].append(AIMessage(content=f"🤖 Agent 1: Parsed rule structure: {structured_rule.get('name', 'Unnamed Rule')}"))
            
            print(f"[Workflow] ✅ Agent 1: Successfully parsed rule: {structured_rule.get('name', 'Unnamed Rule')}")
            return state
            
        except Exception as e:
            print(f"[Workflow] ❌ Agent 1 Error: {e}")
            state["error_message"] = f"Agent 1 failed to parse rule: {str(e)}"
            return state
    
    def _agent3_conflict_analysis(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 3: Analyze potential conflicts with existing rules
        """
        try:
            print("[Workflow] 🤖 Agent 3: Analyzing rule conflicts...")
            
            if not state.get("structured_rule"):
                state["error_message"] = "No structured rule available for conflict analysis"
                return state
            
            # Extract existing rules from knowledge base
            existing_rules = []
            if state.get('rag_df') is not None and not state['rag_df'].empty:
                # Extract rules from RAG DataFrame
                for _, row in state['rag_df'].iterrows():
                    if 'rule' in str(row.get('text', '')).lower():
                        existing_rules.append({
                            "rule_id": f"existing_{len(existing_rules)}",
                            "name": f"Existing Rule {len(existing_rules)}",
                            "description": row.get('text', '')[:200]
                        })
            
            # Analyze conflicts
            conflicts, _ = analyze_rule_conflicts(
                state["structured_rule"],
                existing_rules,
                state.get('industry', 'generic')
            )
            
            state["conflicts"] = conflicts
            state["messages"].append(AIMessage(content=f"🤖 Agent 3: Found {len(conflicts)} potential conflicts"))
            
            print(f"[Workflow] ✅ Agent 3: Found {len(conflicts)} conflicts")
            return state
            
        except Exception as e:
            print(f"[Workflow] ❌ Agent 3 Conflict Analysis Error: {e}")
            state["error_message"] = f"Agent 3 conflict analysis failed: {str(e)}"
            return state
    
    def _agent3_impact_analysis(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 3: Assess the impact of the proposed rule
        """
        try:
            print("[Workflow] 🤖 Agent 3: Analyzing rule impact...")
            
            if not state.get("structured_rule"):
                state["error_message"] = "No structured rule available for impact analysis"
                return state
            
            # Assess impact
            impact_analysis = assess_rule_impact(
                state["structured_rule"],
                [],  # existing_rules - simplified for now
                state.get('industry', 'generic')
            )
            
            state["impact_analysis"] = impact_analysis
            state["messages"].append(AIMessage(content=f"🤖 Agent 3: Impact analysis completed - Risk level: {impact_analysis.get('risk_level', 'Unknown')}"))
            
            print("[Workflow] ✅ Agent 3: Impact analysis completed")
            return state
            
        except Exception as e:
            print(f"[Workflow] ❌ Agent 3 Impact Analysis Error: {e}")
            state["error_message"] = f"Agent 3 impact analysis failed: {str(e)}"
            return state
    
    def _agent3_orchestration(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 3: Orchestrate the next steps based on conflicts and impact
        """
        try:
            print("[Workflow] 🤖 Agent 3: Orchestrating next steps...")
            
            should_proceed, message, orchestration_result = orchestrate_rule_generation(
                state["structured_rule"],
                state.get("conflicts", [])
            )
            
            state["messages"].append(AIMessage(content=f"🤖 Agent 3: {message}"))
            
            # Set flag for conditional routing
            state["should_proceed_to_generation"] = should_proceed
            
            print(f"[Workflow] ✅ Agent 3: Orchestration decision: {'Generate files' if should_proceed else 'Response only'}")
            return state
            
        except Exception as e:
            print(f"[Workflow] ❌ Agent 3 Orchestration Error: {e}")
            state["error_message"] = f"Agent 3 orchestration failed: {str(e)}"
            return state
    
    def _agent2_generate_files(self, state: WorkflowState) -> WorkflowState:
        """
        Agent 2: Generate DRL and GDST files from structured rule
        """
        try:
            print("[Workflow] 🤖 Agent 2: Generating DRL and GDST files...")
            
            if not state.get("structured_rule"):
                state["error_message"] = "No structured rule available for file generation"
                return state
            
            # Generate files using existing function
            drl_content, gdst_content = json_to_drl_gdst(state["structured_rule"])
            
            state["drl_content"] = drl_content
            state["gdst_content"] = gdst_content
            state["messages"].append(AIMessage(content="🤖 Agent 2: Generated DRL and GDST files"))
            
            print("[Workflow] ✅ Agent 2: File generation completed")
            return state
            
        except Exception as e:
            print(f"[Workflow] ❌ Agent 2 Error: {e}")
            state["error_message"] = f"Agent 2 file generation failed: {str(e)}"
            return state
    
    def _verify_files(self, state: WorkflowState) -> WorkflowState:
        """
        Verify the generated DRL and GDST files
        """
        try:
            print("[Workflow] Verifying generated files...")
            
            if not state.get("drl_content") or not state.get("gdst_content"):
                state["error_message"] = "No files available for verification"
                return state
            
            # Verify files using existing function
            verification_result = verify_drools_execution(
                state["drl_content"], 
                state["gdst_content"]
            )
            
            state["verification_result"] = verification_result
            state["messages"].append(AIMessage(content=f"Verification: {verification_result}"))
            
            print("[Workflow] File verification completed")
            return state
            
        except Exception as e:
            print(f"[Workflow] Verification Error: {e}")
            state["error_message"] = f"Failed verification: {str(e)}"
            return state
    
    def _generate_response(self, state: WorkflowState) -> WorkflowState:
        """
        Generate final response for the user
        """
        try:
            print("[Workflow] Generating final response...")
            
            if state.get("error_message"):
                response = f"I encountered an error: {state['error_message']}"
            else:
                # Generate conversational response using Agent 3
                response = generate_conversational_response(
                    state["user_input"],
                    {"structured_rule": state.get("structured_rule")},
                    state.get("rag_df", pd.DataFrame()),
                    state.get("industry", "generic"),
                    []
                )
            
            state["final_response"] = response
            state["messages"].append(AIMessage(content=response))
            
            print("[Workflow] Final response generated")
            return state
            
        except Exception as e:
            print(f"[Workflow] Response Generation Error: {e}")
            state["final_response"] = f"Error generating response: {str(e)}"
            return state
    
    def _handle_error(self, state: WorkflowState) -> WorkflowState:
        """
        Handle errors that occur during the workflow
        """
        print(f"[Workflow] Handling error: {state.get('error_message', 'Unknown error')}")
        
        # Ensure we have an error message
        if not state.get("error_message"):
            state["error_message"] = "An unexpected error occurred in the workflow"
        
        return state
    
    def _should_proceed_to_conflict_analysis(self, state: WorkflowState) -> str:
        """Conditional edge: Check if we should proceed to conflict analysis"""
        if state.get("error_message"):
            return "error"
        if state.get("structured_rule"):
            return "conflict_analysis"
        return "error"
    
    def _should_generate_files(self, state: WorkflowState) -> str:
        """Conditional edge: Check if we should generate files"""
        if state.get("error_message"):
            return "error"
        if state.get("should_proceed_to_generation", False):
            return "generate_files"
        return "response_only"
    
    def get_workflow_metrics(self) -> Dict[str, Any]:
        """
        Get metrics and information about the workflow structure
        
        Returns:
            Dictionary containing workflow metrics
        """
        try:
            compiled_graph = self.graph.compile()
            
            # Get node information
            nodes = []
            if hasattr(compiled_graph, 'nodes'):
                nodes = list(compiled_graph.nodes.keys()) if compiled_graph.nodes else []
            
            # Get edge information  
            edges = []
            if hasattr(compiled_graph, 'edges'):
                edges = list(compiled_graph.edges.keys()) if compiled_graph.edges else []
            
            return {
                "total_nodes": len(nodes),
                "node_names": nodes,
                "total_edges": len(edges),
                "edge_connections": edges,
                "workflow_type": "StateGraph",
                "entry_point": "agent1_parse_rule",
                "finish_point": "generate_response",
                "supports_conditional_routing": True,
                "error_handling": True,
                "langraph_enabled": True
            }
        except Exception as e:
            return {
                "error": f"Failed to get workflow metrics: {str(e)}",
                "total_nodes": 8,  # Known from our implementation
                "workflow_type": "StateGraph"
            }
    
    def run_workflow(
        self, 
        user_input: str, 
        rag_df: Optional[pd.DataFrame] = None,
        industry: str = "generic",
        history: Optional[List] = None
    ) -> Dict[str, Any]:
        """
        Run the complete workflow for business rule processing
        
        Args:
            user_input: Natural language input from user
            rag_df: RAG knowledge base DataFrame (optional)
            industry: Industry context for rule processing
            history: Conversation history for context (optional)
            
        Returns:
            Dictionary containing workflow results
        """
        print(f"[Workflow] Starting workflow for input: {user_input[:100]}...")
        
        # Build context from history for better understanding
        context_input = user_input
        if history and len(history) > 0:
            print(f"[Workflow] Processing conversation history with {len(history)} previous messages...")
            # Build context from recent conversation history
            recent_context = []
            for item in history[-3:]:  # Use last 3 exchanges for context
                if isinstance(item, (list, tuple)) and len(item) >= 2:
                    user_msg, bot_msg = item[0], item[1]
                    # Only include complete exchanges (skip if bot_msg is None)
                    if bot_msg is not None and str(bot_msg).strip():
                        recent_context.append(f"User: {user_msg}")
                        recent_context.append(f"Assistant: {bot_msg}")
                    elif bot_msg is None:
                        # This is the current message being processed, don't include in context
                        print(f"[Workflow] Skipping incomplete exchange in history (current message)")
                elif isinstance(item, dict):
                    if 'user' in item and 'assistant' in item:
                        assistant_msg = item['assistant']
                        # Only include complete exchanges (skip if assistant is None or empty)
                        if assistant_msg is not None and str(assistant_msg).strip():
                            recent_context.append(f"User: {item['user']}")
                            recent_context.append(f"Assistant: {assistant_msg}")
            
            if recent_context:
                context_input = f"Previous conversation:\n{chr(10).join(recent_context)}\n\nCurrent request: {user_input}"
                print(f"[Workflow] Enhanced input with conversation context ({len(recent_context)} context items)")
                print(f"[Workflow] Context preview: {context_input[:200]}...")
            else:
                print(f"[Workflow] No valid conversation context found, using original input")
        
        # Initialize state
        initial_state = WorkflowState(
            messages=[HumanMessage(content=context_input)],
            user_input=context_input,
            structured_rule=None,
            conflicts=[],
            impact_analysis=None,
            drl_content=None,
            gdst_content=None,
            verification_result=None,
            rag_df=rag_df,
            industry=industry,
            error_message=None,
            final_response=""
        )
        
        # Compile and run the graph
        try:
            compiled_graph = self.graph.compile()
            final_state = compiled_graph.invoke(initial_state)
            
            print("[Workflow] Workflow completed successfully")
            
            # Return results
            return {
                "response": final_state.get("final_response", ""),
                "structured_rule": final_state.get("structured_rule"),
                "conflicts": final_state.get("conflicts", []),
                "impact_analysis": final_state.get("impact_analysis"),
                "drl_content": final_state.get("drl_content"),
                "gdst_content": final_state.get("gdst_content"),
                "verification_result": final_state.get("verification_result"),
                "messages": [msg.content for msg in final_state.get("messages", [])],
                "error": final_state.get("error_message")
            }
            
        except Exception as e:
            print(f"[Workflow] Workflow execution failed: {e}")
            return {
                "response": f"Workflow execution failed: {str(e)}",
                "error": str(e)
            }


def create_workflow() -> BusinessRuleWorkflow:
    """Factory function to create a new workflow instance"""
    return BusinessRuleWorkflow()


def run_business_rule_workflow(
    user_input: str,
    rag_df: Optional[pd.DataFrame] = None,
    industry: str = "generic",
    history: Optional[List] = None
) -> Dict[str, Any]:
    """
    Convenience function to run the business rule workflow
    
    Args:
        user_input: Natural language input from user
        rag_df: RAG knowledge base DataFrame (optional) 
        industry: Industry context for rule processing
        history: Conversation history for context (optional)
        
    Returns:
        Dictionary containing workflow results
    """
    workflow = create_workflow()
    return workflow.run_workflow(user_input, rag_df, industry, history)