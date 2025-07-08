---
layout: default
title: Setup Instructions
---

# Setup Instructions

Choose the setup method that works best for your environment. Docker is recommended for the easiest installation.

<div class="Subhead">
  <div class="Subhead-heading">Two Setup Options Available</div>
  <div class="Subhead-description">Docker setup is recommended for beginners, manual setup offers more control</div>
</div>

## Option 1: Docker Setup (Recommended)

<div class="Box">
  <div class="Box-header">
    <h3 class="Box-title">Docker Setup - Fast & Easy</h3>
  </div>
  <div class="Box-body">
    <p>Docker provides the fastest and most reliable way to get started with all dependencies pre-configured.</p>
  </div>
</div>

### Step 1: Clone the Repository

```bash
git clone https://github.com/nerealegui/capstone.git
cd capstone
```

### Step 2: Set Up Environment Variables

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

### Step 3: Build and Run with Docker Compose

```bash
docker-compose up --build
```

**Alternative**: Run with inline environment variable:
```bash
GOOGLE_API_KEY=your_actual_api_key_here docker-compose up --build
```

### Step 4: Access the Application

Once the container is running, access the application at:
- **Local**: [http://localhost:7860](http://localhost:7860)
- **Network**: http://0.0.0.0:7860 (if running on a server)

---

## Option 2: Manual Setup

<div class="Box">
  <div class="Box-header">
    <h3 class="Box-title">Manual Python Setup</h3>
  </div>
  <div class="Box-body">
    <p>If you prefer to run the application directly with Python or need more control over the environment.</p>
  </div>
</div>

### Step 1: Clone and Navigate

```bash
git clone https://github.com/nerealegui/capstone.git
cd capstone/gemini-gradio-poc
```

### Step 2: Create Virtual Environment

```bash
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables

Create a `.env` file in the `gemini-gradio-poc` directory:

```bash
GOOGLE_API_KEY=your_actual_api_key_here
```

### Step 5: Run the Application

```bash
python run_gradio_ui.py
```

The application will be available at [http://localhost:7860](http://localhost:7860)

---

## Getting Started

<div class="flash flash-success">
  <strong>Success!</strong> Once the application is running, you'll see the main interface with three tabs.
</div>

You'll see the main interface with three tabs:

1. **Configuration**: System settings and agent configuration
2. **Chat Interface**: Natural language rule creation and interaction  
3. **Business Rules**: Bulk rule management and knowledge base setup

### Quick Start Workflow

<div class="Box">
  <div class="Box-body">
    <ol>
      <li><strong>Configure your system</strong> (Configuration tab):
        <ul>
          <li>Select your industry (e.g., Restaurant, Retail, Healthcare)</li>
          <li>Upload relevant business documents</li>
          <li>Set up your knowledge base</li>
        </ul>
      </li>
      <li><strong>Create rules via chat</strong> (Chat Interface tab):
        <ul>
          <li>Type your business rule in plain English</li>
          <li>Review the AI's understanding</li>
          <li>Refine and clarify as needed</li>
          <li>Generate rule files</li>
        </ul>
      </li>
      <li><strong>Manage your rules</strong> (Business Rules tab):
        <ul>
          <li>View all generated rules</li>
          <li>Download DRL and GDST files</li>
          <li>Validate rules for conflicts</li>
          <li>Export for deployment</li>
        </ul>
      </li>
    </ol>
  </div>
</div>

<div class="text-center mt-4">
  <a href="/usage" class="btn btn-primary">Continue to Usage Guide →</a>
</div>