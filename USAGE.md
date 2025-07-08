# Usage Guide: Intelligent Business Rule Management

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [What This Application Does](#what-this-application-does)
3. [Prerequisites](#prerequisites)
4. [Setup Instructions](#setup-instructions)
   - [Option 1: Docker Setup (Recommended)](#option-1-docker-setup-recommended)
   - [Option 2: Manual Setup](#option-2-manual-setup)
5. [Getting Started](#getting-started)
6. [Step-by-Step Usage Guide](#step-by-step-usage-guide)
   - [Configuration Tab](#configuration-tab)
   - [Chat Interface](#chat-interface)
   - [Business Rules Tab](#business-rules-tab)
7. [Chat Feature Guide](#chat-feature-guide)
8. [Creating Business Rules](#creating-business-rules)
9. [Troubleshooting](#troubleshooting)
10. [Tips and Best Practices](#tips-and-best-practices)

---

## Introduction

Welcome to the **Intelligent Business Rule Management** system! This application empowers non-technical users to create, manage, and deploy complex business rules through an intuitive, AI-powered chat interface. Built on Google's Gemini AI, this system transforms natural language conversations into executable business rules.

## What This Application Does

The Intelligent Business Rule Management system provides:

- **🤖 AI-Powered Rule Creation**: Convert natural language descriptions into formal business rules
- **📚 Knowledge Base Integration**: Upload business documents to provide context for rule creation
- **🔄 Workflow Orchestration**: Automated rule processing with conflict detection and validation
- **📊 Session Management**: Persistent data storage and change tracking
- **🎯 Industry-Specific Templates**: Pre-configured settings for different business domains
- **📁 File Generation**: Export rules as DRL (Drools Rule Language) and GDST (Guided Decision Table) files

**Example Use Cases:**
- Employee scheduling rules for restaurants
- Discount and promotion rules for retail
- Approval workflows for financial services
- Quality control rules for manufacturing
- Customer service escalation rules

---

## Prerequisites

Before setting up the application, ensure you have:

1. **Google API Key**: Required for Gemini AI integration
   - Get yours at: [Google AI Studio](https://makersuite.google.com/app/apikey)
   - The key should have access to Gemini models

2. **Docker** (for Docker setup): 
   - Docker Desktop installed and running
   - Docker Compose (usually included with Docker Desktop)

3. **Python 3.8+** (for manual setup):
   - Python 3.8 or higher installed
   - pip package manager

---

## Setup Instructions

### Option 1: Docker Setup (Recommended)

Docker provides the fastest and most reliable way to get started with all dependencies pre-configured.

#### Step 1: Clone the Repository

```bash
git clone https://github.com/nerealegui/capstone.git
cd capstone
```

#### Step 2: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Google API key:

```bash
# Required: Google API Key for Gemini AI
GOOGLE_API_KEY=your_actual_api_key_here

# Optional: Gradio server configuration
GRADIO_SERVER_NAME=0.0.0.0
GRADIO_SERVER_PORT=7860
```

#### Step 3: Build and Run with Docker Compose

```bash
docker-compose up --build
```

**Alternative**: Run with inline environment variable:
```bash
GOOGLE_API_KEY=your_actual_api_key_here docker-compose up --build
```

#### Step 4: Access the Application

Once the container is running, access the application at:
- **Local**: http://localhost:7860
- **Network**: http://0.0.0.0:7860 (if running on a server)

---

### Option 2: Manual Setup

If you prefer to run the application directly with Python:

#### Step 1: Clone and Navigate

```bash
git clone https://github.com/nerealegui/capstone.git
cd capstone/gemini-gradio-poc
```

#### Step 2: Create Virtual Environment

```bash
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Set Up Environment Variables

Create a `.env` file in the `gemini-gradio-poc` directory:

```bash
GOOGLE_API_KEY=your_actual_api_key_here
```

#### Step 5: Run the Application

```bash
python run_gradio_ui.py
```

The application will be available at http://localhost:7860

---

## Getting Started

Once the application is running, you'll see the main interface with three tabs:

1. **Configuration**: System settings and agent configuration
2. **Chat Interface**: Natural language rule creation and interaction  
3. **Business Rules**: Bulk rule management and knowledge base setup

### Quick Start Workflow

1. **Configure your system** (Configuration tab):
   - Select your industry (e.g., Restaurant, Retail, Healthcare)
   - Upload relevant business documents
   - Set up your knowledge base

2. **Create rules via chat** (Chat Interface tab):
   - Type your business rule in plain English
   - Review the AI's understanding
   - Refine and clarify as needed
   - Generate rule files

3. **Manage your rules** (Business Rules tab):
   - View all generated rules
   - Download DRL and GDST files
   - Validate rules for conflicts
   - Export for deployment

---

## Step-by-Step Usage Guide

### Configuration Tab

![Configuration Tab](https://github.com/user-attachments/assets/d1b42341-0426-4765-915d-13d2b7c609db)

The Configuration tab allows you to:

1. **Industry Selection**: Choose your business domain (Restaurant, Retail, Healthcare, etc.)
2. **Agent Configuration**: Customize AI behavior and response styles
3. **Session Management**: View session information and manage data persistence
4. **Knowledge Base Setup**: Upload business documents for contextual AI responses

**To configure your system:**

1. Select your industry from the dropdown menu
2. Adjust agent settings if needed (defaults work well for most cases)
3. Upload relevant business documents in the Knowledge Base section
4. Click "Save Configuration" to apply changes

### Chat Interface

![Chat Interface](https://github.com/user-attachments/assets/9ce6282c-5928-4d8e-a2a1-3b885b858cf5)

The Chat Interface is where you'll interact with the AI to create business rules:

**Key Features:**
- Natural language input field
- Real-time conversation history
- Rule generation and preview
- File download options

![Chat Conversation Example](https://github.com/user-attachments/assets/88fa7a80-4938-4927-88d6-5ac829c7f8b9)

The screenshot above shows how the AI responds to your queries with helpful information about creating business rules, including:
- Common rule types you can create
- Example commands to get started
- Available features and capabilities

### Business Rules Tab

![Business Rules Tab](https://github.com/user-attachments/assets/d75602a0-7041-4a73-b7fb-f65d137b9468)

The Business Rules tab provides:

- **Rule Summary**: Overview of generated rules
- **File Downloads**: Access to DRL and GDST files
- **Rule Validation**: Conflict detection and impact analysis
- **Batch Processing**: Handle multiple rules simultaneously

---

## Chat Feature Guide

The chat interface is the core of the application. Here's how to use it effectively:

### Basic Chat Interaction

1. **Start a Conversation**: Type your rule description in natural language
   
   Example: "If a customer orders more than $100, apply a 10% discount"

2. **AI Processing**: The system will:
   - Analyze your input
   - Generate structured rule logic
   - Provide explanations and clarifications

3. **Review Response**: The AI will show you:
   - Understanding of your rule
   - Generated rule structure
   - Any questions or clarifications needed

### Advanced Features

- **Follow-up Questions**: Ask for modifications or clarifications
- **Context Awareness**: Reference previous rules in the conversation
- **Validation**: The system checks for conflicts with existing rules
- **Export Options**: Download generated rules as files

### Sample Conversations

Here are some example interactions to help you get started:

#### Example 1: Employee Scheduling Rule
**You**: "Create a rule where employees cannot work more than 8 hours per day"

**AI Response**: The system will analyze this and create a scheduling rule with appropriate conditions and actions.

#### Example 2: Customer Discount Rule  
**You**: "Set up a discount for customers who have been with us for more than 2 years"

**AI Response**: The system will generate a customer loyalty rule with time-based conditions.

#### Example 3: Service Escalation Rule
**You**: "Escalate support tickets to a manager if unresolved for 24 hours"

**AI Response**: The system will create a service escalation workflow with time triggers.

---

## Creating Business Rules

### Step 1: Describe Your Rule

Use natural language to describe what you want to achieve:

**Good Examples:**
- "Create a scheduling rule where employees can't work more than 8 hours per day"
- "If a customer has been with us for more than 2 years, give them a 15% loyalty discount"
- "Escalate support tickets to a manager if they remain unresolved for more than 24 hours"

### Step 2: Review AI Understanding

The AI will respond with its understanding of your rule. Check that it captured:
- The condition (trigger)
- The action (what happens)
- Any exceptions or special cases

### Step 3: Refine if Needed

If the AI didn't understand correctly, provide clarification:
- "Actually, the discount should be 10%, not 15%"
- "The rule should only apply on weekdays"
- "Add an exception for emergency shifts"

### Step 4: Generate Rule Files

Once satisfied with the rule, click "Generate Files" to create:
- **DRL file**: Drools Rule Language format
- **GDST file**: Guided Decision Table format

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

**Symptoms**: Docker container fails to start or Python script crashes

**Solutions**:
- Verify your Google API key is correct and active
- Check that port 7860 is available: `lsof -i :7860`
- Ensure Docker is running (for Docker setup)
- Verify Python version is 3.8+ (for manual setup)
- Check system resources (memory, disk space)

#### 2. API Key Issues

**Symptoms**: "Invalid API key" or authentication errors

**Solutions**:
- Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check that the key has access to Gemini models
- Ensure the `.env` file is in the correct location and properly formatted
- Restart the application after updating the API key
- Make sure there are no extra spaces or characters in the API key

#### 3. Chat Not Responding

**Symptoms**: Messages sent but no AI response

**Solutions**:
- Check your internet connection
- Verify the Google API key is working
- Look for error messages in the browser console (F12)
- Try refreshing the page
- Check if you've reached API rate limits
- Ensure the application is fully loaded before sending messages

#### 4. Files Not Generating

**Symptoms**: Rule files (DRL/GDST) are not created or download fails

**Solutions**:
- Ensure the rule description is clear and complete
- Check that the AI understood your rule correctly
- Verify there are no conflicts with existing rules
- Try rephrasing your rule description with more specific details
- Check the Generation Status panel for error messages

#### 5. Knowledge Base Upload Issues

**Symptoms**: Documents won't upload or knowledge base won't build

**Solutions**:
- Check file formats (PDF, DOCX, TXT are supported)
- Verify file size limits (usually under 10MB per file)
- Ensure documents contain readable text
- Try uploading files one at a time
- Check for special characters in file names

### Getting Help

1. **Check Logs**: Look for error messages in the terminal/console
2. **Review Documentation**: Refer to [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
3. **Demo Flow**: Follow the step-by-step guide in [Capstone_Demo_Flow.md](./Capstone_Demo_Flow.md)
4. **GitHub Issues**: Report bugs or request features on the repository

---

## Tips and Best Practices

### Writing Effective Rules

1. **Be Specific**: Include exact values, timeframes, and conditions
2. **Use Examples**: Provide concrete scenarios when possible
3. **One Rule at a Time**: Focus on a single business rule per conversation
4. **Test Iteratively**: Start simple and add complexity gradually

### Managing Your Session

1. **Save Regularly**: Use the session management features to save your work
2. **Upload Documents**: Provide business context through document uploads
3. **Review Changes**: Check the change log to track modifications
4. **Export Rules**: Download generated files for backup and deployment

### Performance Optimization

1. **Use Industry Templates**: Select the appropriate industry for better AI responses
2. **Provide Context**: Upload relevant business documents to improve accuracy
3. **Clear Session Data**: Start fresh when switching to different rule domains
4. **Monitor Usage**: Keep track of API usage to stay within limits

### Security Considerations

1. **Protect API Keys**: Never share your Google API key publicly
2. **Review Generated Rules**: Always validate AI-generated rules before deployment
3. **Backup Data**: Regularly export your rules and session data
4. **Use HTTPS**: Ensure secure connections when deploying to production

---

## Next Steps

Once you're comfortable with the basic usage:

1. **Explore Advanced Features**: Try the workflow orchestration and conflict detection
2. **Integrate with BRMS**: Connect generated rules to your business rule management system
3. **Scale Your Usage**: Set up multiple environments for different teams
4. **Customize Configuration**: Adapt the system for your specific industry needs

For more advanced topics, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture and system design
- [BUSINESS.md](./BUSINESS.md) - Business use cases and value propositions
- [Capstone_Demo_Flow.md](./Capstone_Demo_Flow.md) - Detailed demonstration workflow

---

**Happy rule creating! 🚀**

*For technical support or feature requests, please visit the [GitHub repository](https://github.com/nerealegui/capstone).*