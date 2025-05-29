# Architecture Documentation

## System Overview

The Capstone project is an intelligent business rule management platform that empowers non-technical users to create, manage, and deploy business rules using a modern agent-based architecture and LLMs (Google Gemini). The system features a Gradio-based web interface, RAG (Retrieval-Augmented Generation) for context-aware responses, and automated rule file generation (Drools DRL, GDST) with verification and download capabilities.

## Architecture Diagram

```mermaid
architecture-beta
    group frontend(cloud)[Frontend]
    group backend(server)[Backend]
    group ai(cloud)[AIAgents]
    group validation(server)[Validation Layer]
    group storage(database)[Storage]

    service gradio(server)[Gradio UI] in frontend
    service ruletab(server)[Business Rules Tab] in frontend
    service api(server)[FastAPI planned] in backend
    service agent1(cloud)[Agent1 NL2JSON] in ai
    service agent2(cloud)[Agent2 JSON2DRLGDST] in ai
    service extractor(cloud)[Rule Extractor] in ai
    service gemini(cloud)[GoogleGeminiAPI] in ai
    service validator(server)[Rule Validator] in validation
    service conflict(server)[Conflict Detection] in validation
    service kb(database)[KnowledgeBase] in storage
    service rules(database)[RuleFiles] in storage
    service csvdata(database)[CSV Data] in storage

    gradio:R -- L:api
    gradio:R -- L:ruletab
    ruletab:B -- T:extractor
    api:R -- L:agent1
    agent1:B -- T:agent2
    agent2:R -- L:gemini
    extractor:R -- L:validator
    extractor:R -- L:gemini
    validator:R -- L:conflict
    agent1:R -- L:kb
    agent2:R -- L:rules
    extractor:R -- L:csvdata
    validator:R -- L:kb
    gradio:B -- T:kb
    gradio:B -- T:rules
```

## Development Status (May 2025)

### Current Implementation
- **Agent 1**: Converts natural language business rules to structured JSON using Google Gemini (via `google.genai`).
- **Agent 2**: Converts JSON rule output to Drools DRL and GDST files using Google Gen AI (`google.genai`).
- **Business Rule Validation**: CSV upload, extraction, conflict detection, and RAG integration system.
- **Rule Extractor**: LLM-powered intelligent conversion from CSV to structured JSON with fallback mechanisms.
- **Conflict Detection**: Validates rules for duplicates and conflicts before integration.
- **RAG Integration**: Extracted rules are automatically added to the knowledge base for searchable queries.
- **Enhanced UI**: New "Business Rules" tab for complete rule management workflow.
- **Verification Step**: Placeholder for Drools execution verification after file generation.
- **Gradio UI**: 'Preview & Apply' button triggers Agent 2, generates files, verifies, and provides download links.
- **File Download**: Users can download generated `.drl` and `.gdst` files directly from the interface.
- **Unit Tests**: Agent 2 logic and rule extraction functionality covered by comprehensive unit tests.
- **UI Updates**: Cleaner interface, removed JSON display block, improved status and download components.

### Planned Architecture
- **Backend API**: FastAPI server for orchestration (planned).
- **Enhanced Agent Framework**: Multi-agent orchestration (LangChain, CrewAI, or similar).
- **Advanced Rule Storage**: Versioned rule management and conflict detection.
- **Frontend Enhancements**: More advanced rule management and visualization.

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

### Integrated RAG-Enhanced Workflow
1. User queries about business rules through chat interface.
2. RAG system searches through integrated rule knowledge base.
3. Context-aware responses include relevant business rules.
4. Users can refine or create new rules based on retrieved information.

---
