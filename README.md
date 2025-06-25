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

This system uses **Langraph** as the primary workflow orchestration engine for intelligent business rule management.

### 🚀 Langraph Benefits

🎯 **Visual Design**: Clear workflow representation with transparent agent interactions  
🔧 **Modular Components**: Reusable agent nodes for each business rule task  
🔍 **Transparency**: Execution tracking & debugging capabilities  
🌊 **Flexible Orchestration**: Conditional routing based on conflict analysis results  
🤝 **Enhanced Collaboration**: Clear agent interaction patterns  
📈 **Scalability**: Complex workflow management made simple  

### 📊 Workflow Features

• **3 AI Agents**: Agent 1 (parsing) + Agent 3 (analysis & orchestration) + Agent 2 (file generation)  
• **Visual workflow design** & debugging transparency  
• **Modular, reusable** agent components for each task  
• **Conditional branching** based on conflict analysis results  
• **Error handling** with graceful fallbacks  
• **Real-time status updates** visible in chat responses  
• **Compatible** with existing RAG knowledge base system  

### 📖 How to Use

1. **Submit**: Send business rule creation or analysis requests in the Chat tab
2. **Monitor**: Watch real-time workflow status in chat responses  
3. **Debug**: View transparent agent interactions and decisions
4. **Configure**: Adjust settings in the Configuration tab
5. **Generate**: Use the file generation tools for DRL/GDST output

### 🔧 What Gets Executed

**Rule Creation Flow:**
- **Agent 1** → Natural language parsing to structured JSON
- **Agent 3** → Conflict analysis with existing rules
- **Agent 3** → Impact assessment and risk evaluation  
- **Agent 3** → Orchestration decisions (generate files or respond)
- **Agent 2** → DRL/GDST file generation (if needed)
- **Verification** → File validation and quality checks
- **Response** → User-facing results with status updates

**Analysis Flow:**
- **Agent 1** → Parse user query
- **Agent 3** → Analyze and provide insights
- **Response** → Direct response to user

## Documentation
- [Business Documentation](./BUSINESS.md)
- [Architecture & Technical Documentation](./ARCHITECTURE.md)
- [Demo Flow](./Capstone_Demo_Flow.md)
- [Changelog](./gemini-gradio-poc/docs/CHANGELOG.md)

## Accessibility Resources
- **Audio Guide**: An audio TLDR guide is available at [gemini-gradio-poc/audio/intelligent_business_rules_guide.wav](./gemini-gradio-poc/audio/intelligent_business_rules_guide.wav). This serves as a mini-training on how to use the intelligent business rule management tool effectively. It goes over the content in [Capstone_Demo_Flow.md](https://github.com/nerealegui/capstone/blob/fee758e35c16387e2ca0d3a7cf4c659a1b7761b7/Capstone_Demo_Flow.md)

---

For installation, usage, and troubleshooting, refer to the documentation above. Contributions are welcome!
