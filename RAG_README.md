# RAG-Enabled Agents

This module implements Retrieval-Augmented Generation (RAG) capabilities for the business rules generation system, enabling both agents to leverage knowledge bases of documents to enhance their responses.

## Features

- **Unified Utility Module**: Core RAG functionality is available in `rag_utils.py` for reuse throughout the project
- **Local Document Support**: Process documents (PDF, DOCX) from local directories
- **Remote Document Support**: Retrieve and process documents from remote URLs
- **Agent 1 RAG Integration**: Business rules extractor uses RAG to better understand domain context
- **Agent 2 RAG Integration**: DRL generator uses RAG to improve rule generation
- **Flexible Configuration**: Control RAG usage, chunk sizes, and similarity thresholds
- **Simple API**: Easy-to-use functions for end-to-end rule processing

## Installation

The code requires the following dependencies:

```bash
pip install google-cloud-aiplatform google-generativeai pandas scikit-learn numpy python-dotenv IPython python-docx PyPDF2 requests
```

You'll also need a Google API key for Gemini access. Create a `.env` file in the project root with:

```
GOOGLE_API_KEY=your_api_key_here
```

## Usage

### Basic Usage

The simplest way to use the system is with the `process_rule_to_drl` function:

```python
from rag_agents import process_rule_to_drl

# Process a natural language rule into a DRL file
drl_content = process_rule_to_drl(
    "Modification to the restaurant size rule. The required base number of employees for large restaurants increases from 10 to 12.",
    agent1_kb_path="./agent1_kb",
    agent2_kb_path="./agent2_kb",
    output_path="./output/drl_files",
    use_rag=True
)
```

### Using Remote Documents

You can use documents from remote URLs:

```python
from rag_agents import process_rule_to_drl

# Process with both local and remote knowledge bases
drl_content = process_rule_to_drl(
    "Modification to the restaurant size rule...",
    agent1_kb_path="./agent1_kb",
    agent2_kb_path="./agent2_kb",
    output_path="./output/drl_files",
    use_rag=True,
    agent1_remote_urls=[
        "https://example.com/restaurant_rules.pdf",
        "https://example.com/policies.docx"
    ],
    agent2_remote_urls=[
        "https://example.com/drl_examples.pdf"
    ]
)
```

### Using the Agents Individually

You can also use the agents separately:

```python
from rag_agents import Agent1, Agent2

# Initialize agents
agent1 = Agent1(knowledge_base_path="./agent1_kb")
agent2 = Agent2(knowledge_base_path="./agent2_kb", output_path="./output")

# Process through Agent 1
structured_rule = agent1.process_rule("Modification to restaurant size rule...")

# Process through Agent 2
drl_content = agent2.generate_drl(structured_rule)

# Save the DRL file
filepath = agent2.save_drl_to_file(drl_content)
```

### Running the Example

The repository includes an example script that demonstrates various ways to use the agents:

```bash
python example_rag.py
```

## How It Works

1. **Document Processing**:
   - Documents (PDF, DOCX) are loaded from local directories or remote URLs
   - Text is extracted and split into chunks with configurable size and overlap

2. **Embedding Generation**:
   - Text chunks are converted to vector embeddings using Gemini's embedding model
   - Embeddings represent the semantic meaning of each text chunk

3. **Query Processing**:
   - When a user query comes in, it's also converted to an embedding
   - The system finds the most similar chunks to the query using cosine similarity

4. **Context Integration**:
   - The most relevant text chunks are incorporated into the LLM prompt
   - This provides domain-specific context to improve the LLM's response

5. **Rule Generation**:
   - Agent 1 processes natural language into structured JSON
   - Agent 2 converts the JSON into formal Drools (DRL) syntax
   - Both agents can use RAG to enhance their outputs

## Extending the System

### Adding New Document Types

To add support for new document types, extend the `rag_utils.py` file with new parsing functions.

### Customizing RAG Parameters

You can customize chunk sizes, overlap, and similarity thresholds in the function calls to adapt to different document types and needs.

### Integrating with Other LLMs

The system is designed to work with Google's Gemini models, but can be adapted to other LLMs by modifying the API calls in the agent classes.