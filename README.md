# Capstone Project: Intelligent Business Rule Management

## Project Overview

This capstone project aims to create a **business tool** that introduces a **layer of abstraction** for rule management through an **agent-based recommendation system**, empowering non-technical users to manage complex business logic without needing direct technical intervention.

We are exploring two potential technical architectures:

1. **Traditional BRMS** using **Drools** for rule management.
2. **Modern Agent/LLM-based system** where:
    - **An orchestrator/agent layer** filters inputs.
    - **An LLM wrapper** (such as Gemini or GPT) processes context and intent.
    - **Agent-to-agent communication** allows advanced rule recommendation and execution.
    - **Extensions** can enhance capabilities dynamically (e.g., plugins for different industries).

### Main Business Goal

Enable a new generation of intelligent, user-friendly decision systems that allow non-technical business users to design, execute, and adapt complex decision rules autonomously, increasing operational agility and reducing technical dependency.

*Empower business users to create, manage, and evolve decision-making rules independently through an intelligent, agent-driven system — blending traditional rule management with the adaptability and power of modern AI.*

### Use Case: Fast Food Restaurant - Employee Scheduling

|  | Before (Drools) | After (our solution) |
| --- | --- | --- |
| How to change a rule | Email IT + wait days | Chat with AI and done in minutes |
| Who is needed | Manager + IT Developer | Just Manager |
| Speed | Slow | Fast |
| Risk of mistakes | High | Low |

| Problem Solved | Solution |
| --- | --- |
| Making rule changes **easy** for non-tech people | An **AI/Agent helper** that talks to users and updates the business logic automatically |

## Features

- **Core Functionality**: Implements key features to address the project's primary objectives.
- **Scalability**: Designed with scalability in mind to accommodate future growth.
- **User-Friendly Interface**: Ensures an intuitive and seamless user experience.
- **Robust Architecture**: Built using modern development practices for maintainability and performance.
- **Rule Management**: Enables non-technical users to create and modify business rules through natural language
- **Agent-Based Architecture**: Uses AI agents to interpret user requests and translate them into rule changes
- **Validation System**: Detects conflicts between rules and validates changes before implementation
- **Business Logic Abstraction**: Provides an abstraction layer over complex rule systems
- **Future Capabilities**:
  - Recommend new rules based on business patterns
  - Detect rule conflicts automatically
  - Suggest optimizations based on business results

## Technologies Used

- **Programming Languages**: Python 3.8+
- **Web Interface**: 
  - Gradio 5.29.0 (Interactive web application framework)
- **AI/ML Technologies**:
  - Google Gemini API 2.0 Flash (LLM access via `google-genai`)
  - Embedding models (Text embedding for RAG)
  - Retrieval-Augmented Generation (RAG)
  - Vector similarity search (Cosine similarity)
- **Data Processing Libraries**: 
  - Pandas (Data manipulation and analysis)
  - NumPy (Numerical computing)
  - Scikit-learn (Machine learning utilities, cosine similarity)
- **Document Processing**:
  - python-docx (Word document processing)
  - PyPDF2 (PDF document processing)
- **Configuration Management**:
  - python-dotenv (Environment variable management)
- **Development Environment**:
  - Jupyter Notebooks (Research and development)
  - Virtual environments (Dependency isolation)
- **Data Formats**:
  - PDF, DOCX (Document input)
  - JSON (Rule output format)
  - DRL (Drools Rule Language)
  - GDST (Decision table format)
  - CSV (Data exchange)

## Project Components

### Current Implementation (Gradio RAG Application)

The project currently features a fully functional Gradio-based RAG application located in `gemini-gradio-poc/`:

| Component | Technology | Description | Status |
| --- | --- | --- | --- |
| **Web Interface** | Gradio 5.29.0 | Interactive chat interface with document upload capabilities | ✅ Implemented |
| **RAG System** | Google Gemini API | Retrieval-Augmented Generation for context-aware responses | ✅ Implemented |
| **Document Processing** | python-docx, PyPDF2 | Handles PDF and DOCX file processing and text extraction | ✅ Implemented |
| **Knowledge Base** | Pandas, NumPy | Vector embeddings with cosine similarity search | ✅ Implemented |
| **Rule Generation** | Google Gemini 2.0 Flash | Converts natural language to structured business rules | ✅ Implemented |
| **File Export** | Custom utilities | Generates DRL (Drools) and GDST (decision table) files | ✅ Implemented |
| **API Management** | python-dotenv | Secure API key management and configuration | ✅ Implemented |

### Planned Architecture (Future Development)

| Component | Suggested Tool | Description | Purpose |
| --- | --- | --- | --- |
| **LLM (Large Language Model)** | Google Gemini API | The brain that understands what the user requests and translates it into actions | Interprets human language and translates it into structured rule modifications |
| **Agent Framework** | LangChain, CrewAI, AutoGen | The orchestrator that controls how different tasks are executed | Enables the system to behave like a smart assistant, following multiple steps |
| **Rule Storage** | JSON files / Database | Where the business rules are stored and managed | Provides a way to store and update rules with versioning and conflict detection |
| **Backend Server** | Python (FastAPI) | The engine that receives user requests, communicates with AI, and updates rules | Creates a safe middleware between users and the AI system |
| **Frontend** | Enhanced Gradio / React | Advanced user interface for business users | Provides comprehensive rule management and visualization capabilities |


## Installation

### Prerequisites
- Python 3.8 or higher
- Internet connection (for dependency installation and API calls)
- Valid Google API key with Generative AI access

### Quick Start (Recommended)

1. Clone the repository:
    ```bash
    git clone https://github.com/nerealegui/capstone.git
    ```

2. Navigate to the Gradio POC directory:
    ```bash
    cd capstone/gemini-gradio-poc
    ```

3. Run the application (automatic setup):
    ```bash
    python run_gradio_ui.py
    ```

The script will automatically:
- ✅ Create a virtual environment if needed
- ✅ Install all required dependencies
- ✅ Configure your Google API key
- ✅ Launch the Gradio web interface

### Manual Setup (Alternative)

If you prefer manual control over the setup process:

1. **Create and activate virtual environment:**
    ```bash
    cd capstone/gemini-gradio-poc
    python3 -m venv venv
    source venv/bin/activate  # macOS/Linux
    ```

2. **Install dependencies:**
    ```bash
    pip install gradio==5.29.0 google-genai python-dotenv pandas numpy scikit-learn python-docx PyPDF2
    ```

3. **Set up API key:**
    ```bash
    echo "GOOGLE_API_KEY=your_api_key_here" > .env
    ```

4. **Run the application:**
    ```bash
    python run_gradio_ui.py
    ```

## Usage

### Accessing the Application

Once running, the Gradio RAG application will be available at:
- **Local URL**: http://127.0.0.1:7860
- The interface opens automatically in your default web browser

### Application Features

The intelligent business rule management system provides:

#### 1. **Document Upload & Knowledge Base**
- Upload business documents (PDF, DOCX formats supported)
- Configure text chunking parameters (chunk size: 500, overlap: 50)
- Build searchable knowledge base from your documents
- View knowledge base status and document count

#### 2. **AI-Powered Chat Interface**
- Natural language interaction with your business rules
- RAG (Retrieval-Augmented Generation) enhanced responses
- Context-aware answers based on uploaded documents
- Chat history for conversation continuity

#### 3. **Rule Generation & Management**
- Convert natural language requests into structured business rules
- Generate Drools DRL files for rule execution
- Create decision tables (GDST format)
- Preview and validate rules before implementation

#### 4. **File Downloads**
- Download generated rule files (.drl, .gdst)
- Export processed documents and summaries
- Save chat conversations and rule definitions

### Example Workflow

1. **Upload Documents**: Add your business policy documents, procedures, or rule specifications
2. **Build Knowledge Base**: Click "Build Knowledge Base" to process and index your documents
3. **Ask Questions**: Use natural language to query your business rules:
   - *"What is the discount policy for customers over $100?"*
   - *"How should we handle employee scheduling conflicts?"*
   - *"What are the approval requirements for large orders?"*
4. **Generate Rules**: Request rule generation:
   - *"Create a rule for 10% discount on orders over $100"*
   - *"Generate a scheduling rule for weekend shifts"*
5. **Download Files**: Get the generated DRL and GDST files for implementation

### Configuration Options

- **Chunk Size**: Adjust how documents are split (default: 500 characters)
- **Chunk Overlap**: Set overlap between chunks (default: 50 characters)
- **Model Selection**: Uses Google Gemini 2.0 Flash for optimal performance
- **Response Format**: JSON-structured rule outputs for consistency

### Stopping the Application

To stop the application:
- Press `Ctrl+C` in the terminal where it's running
- Or close the terminal window

### Troubleshooting

#### Virtual Environment Issues
```bash
# Remove and recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
python run_gradio_ui.py
```

#### Dependency Issues
```bash
# Upgrade pip and retry
pip install --upgrade pip
python run_gradio_ui.py
```

#### API Key Issues
- Ensure your Google API key has Generative AI permissions
- Verify the key is correctly set in the `.env` file
- Check that the `.env` file is in the `gemini-gradio-poc` directory

#### Port Issues
If port 7860 is in use, Gradio will automatically find an available port and display the new URL.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Make your changes in the appropriate directory:
   - `gemini-gradio-poc/` for RAG application improvements
   - `notebooks/` for research and experimentation
   - `docs/` for documentation updates
4. Test your changes:
    ```bash
    cd gemini-gradio-poc
    python run_gradio_ui.py
    ```
5. Commit your changes:
    ```bash
    git commit -m "Add feature-name"
    ```
6. Push to the branch:
    ```bash
    git push origin feature-name
    ```
7. Open a pull request.

### Development Guidelines

- Follow the existing code structure and naming conventions
- Add documentation for new features
- Test changes thoroughly with the Gradio interface
- Update the CHANGELOG.md for significant changes
- Ensure API keys are never committed to version control

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Google Gemini API** for providing advanced LLM capabilities
- **Gradio Team** for the excellent web interface framework
- **Open Source Community** for the foundational libraries used in this project
- **Academic Supervisors** for guidance on the capstone project structure
- **Business Domain Experts** for insights into rule management requirements

## Quick Start Summary

```bash
# Clone the repository
git clone https://github.com/nerealegui/capstone.git

# Navigate to the RAG application
cd capstone/gemini-gradio-poc

# Run the application (handles everything automatically)
python run_gradio_ui.py

# Access the application at: http://127.0.0.1:7860
```

For detailed instructions, see the [Installation](#installation) and [Usage](#usage) sections above.