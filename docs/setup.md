---
layout: default
title: Setup Instructions
---

---
layout: default
title: Getting Started
---

# Getting Started

Get your business rule system up and running in just a few minutes. We've made the setup process as simple as possible.

<div class="Subhead">
  <div class="Subhead-heading">Ready in Minutes</div>
  <div class="Subhead-description">Choose the installation method that works best for you</div>
</div>

## Option 1: Quick Setup (Recommended)

<div class="Box">
  <div class="Box-header">
    <h3 class="Box-title">One-Click Installation</h3>
  </div>
  <div class="Box-body">
    <p>The fastest way to get started. Everything is pre-configured and ready to use.</p>
  </div>
</div>

### Step 1: Get the System
Download and extract the application files to your computer.

### Step 2: Get Your AI Key
You'll need an API key from Google to power the AI features:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a free account if you don't have one
3. Generate your API key
4. Keep it handy for the next step

### Step 3: Configure and Launch
Run the setup script and enter your API key when prompted. The system will handle everything else automatically.

### Step 4: Start Using
Open your web browser and go to the application. You're ready to create your first business rule!

---

## Option 2: Advanced Setup

<div class="Box">
  <div class="Box-header">
    <h3 class="Box-title">Custom Installation</h3>
  </div>
  <div class="Box-body">
    <p>For IT teams who need more control or want to integrate with existing systems.</p>
  </div>
</div>

### For IT Teams

If your organization requires custom installation or integration with existing infrastructure, follow these technical steps:

1. **Download the Source Code**
   ```bash
   git clone https://github.com/nerealegui/capstone.git
   cd capstone
   ```

2. **Quick Docker Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your Google API key
   docker-compose up --build
   ```

3. **Manual Python Setup** (alternative)
   ```bash
   cd gemini-gradio-poc
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   echo "GOOGLE_API_KEY=your_key_here" > .env
   python run_gradio_ui.py
   ```

---

## First Steps After Installation

<div class="flash flash-success">
  <strong>Success!</strong> Once running, you'll see a simple interface with three main sections.
</div>

### Your Business Workflow

<div class="Box">
  <div class="Box-body">
    <ol>
      <li><strong>Set Up Your Business Context</strong>:
        <ul>
          <li>Choose your industry (Restaurant, Retail, Healthcare, etc.)</li>
          <li>Upload your business policies and procedures</li>
          <li>Let the system learn your specific requirements</li>
        </ul>
      </li>
      <li><strong>Create Rules Through Conversation</strong>:
        <ul>
          <li>Describe your business needs in plain English</li>
          <li>Get AI-powered suggestions and refinements</li>
          <li>Review and approve the proposed rules</li>
        </ul>
      </li>
      <li><strong>Deploy and Manage</strong>:
        <ul>
          <li>Download your custom rule files</li>
          <li>Implement in your business systems</li>
          <li>Monitor and update as your business evolves</li>
        </ul>
      </li>
    </ol>
  </div>
</div>

### Real Business Examples

**Restaurant Manager:** "I need rules for staff scheduling during busy periods"
- System creates automated scheduling based on historical data
- Ensures proper staff coverage during peak hours
- Manages overtime costs and labor compliance

**Retail Store Owner:** "Set up automatic discounts for bulk purchases"
- Creates tiered pricing rules based on quantity
- Manages inventory turnover effectively
- Increases average order value

**Healthcare Administrator:** "Streamline patient appointment scheduling"
- Optimizes appointment slots based on provider availability
- Manages patient preferences and special requirements
- Reduces no-shows through intelligent scheduling

<div class="text-center mt-4">
  <a href="/usage" class="btn btn-primary">See How It Works →</a>
</div>