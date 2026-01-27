# DevHub - FastAPI Demo Site

A lightweight FastAPI application serving a fictional enterprise platform "DevHub" for GitHub Copilot demonstrations.

## Overview

DevHub is a demo site that showcases:
- **Platform play**: Unified development platform reducing context switching
- **Inner loop**: AI-powered coding with GitHub Copilot
- **Outer loop**: Automated workflows with PRs and GitHub Actions
- **Security guardrails**: Built-in security scanning and monitoring
- **Agent at scale**: Intelligent AI agents for enterprise automation

## Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nerealegui/capstone.git
   cd capstone
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

Start the FastAPI server with uvicorn:
```bash
uvicorn app.main:app --reload
```

The application will start on `http://127.0.0.1:8000`

### Accessing the Application

Once running, you can access the following routes:

| Route | Description |
|-------|-------------|
| [http://127.0.0.1:8000/](http://127.0.0.1:8000/) | Home page - Platform overview |
| [http://127.0.0.1:8000/platform](http://127.0.0.1:8000/platform) | Platform play - Unified SDLC |
| [http://127.0.0.1:8000/integrations](http://127.0.0.1:8000/integrations) | Integrations - Reduce context switching |
| [http://127.0.0.1:8000/productivity](http://127.0.0.1:8000/productivity) | Productivity - Inner loop with Copilot |
| [http://127.0.0.1:8000/security](http://127.0.0.1:8000/security) | Security - Guardrails and compliance |
| [http://127.0.0.1:8000/agent](http://127.0.0.1:8000/agent) | Agent at Scale - AI automation |
| [http://127.0.0.1:8000/script](http://127.0.0.1:8000/script) | Workflows - Outer loop automation |
| [http://127.0.0.1:8000/healthz](http://127.0.0.1:8000/healthz) | Health check endpoint (JSON) |

### API Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Project Structure

```
capstone/
├── app/
│   ├── main.py              # FastAPI application with routes
│   └── static/
│       ├── styles.css       # Primer-inspired styling
│       ├── index.html       # Home page
│       ├── platform.html    # Platform play page
│       ├── integrations.html # Integrations page
│       ├── productivity.html # Inner loop/Copilot page
│       ├── security.html    # Security guardrails page
│       ├── agent.html       # Agent at scale page
│       └── script.html      # Workflows/outer loop page
├── requirements.txt         # Python dependencies
└── FASTAPI_README.md       # This file
```

## Development

### Running with custom host and port

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### Running in production mode

For production, remove the `--reload` flag:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Technologies Used

- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: Lightning-fast ASGI server
- **HTML/CSS**: Static pages with Primer CSS-inspired styling

## Demo Messaging

The site emphasizes:
- **Platform Advantage**: Single unified platform across SDLC
- **Context Switching**: Reducing developer overhead with integrations
- **Inner Loop**: GitHub Copilot for AI-powered coding
- **Outer Loop**: GitHub Actions for CI/CD automation
- **Security**: Built-in scanning and guardrails
- **Agents**: Scalable AI automation for enterprises

## Notes

- This is a fictional platform for demonstration purposes
- No backend database or authentication required
- All pages are static HTML served via FastAPI
- Styling inspired by GitHub's Primer CSS design system

## License

This project is for demonstration purposes.
