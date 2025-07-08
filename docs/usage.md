---
layout: default
title: Step-by-Step Usage Guide
---

# Step-by-Step Usage Guide

Learn how to effectively use the Intelligent Business Rule Management system to create, manage, and deploy business rules through our AI-powered interface.

<div class="Subhead">
  <div class="Subhead-heading">Application Overview</div>
  <div class="Subhead-description">Three main tabs for complete rule management workflow</div>
</div>

## Application Interface

The main interface consists of three tabs, each serving a specific purpose in the rule management workflow:

1. **Configuration**: System settings and agent configuration
2. **Chat Interface**: Natural language rule creation and interaction  
3. **Business Rules**: Bulk rule management and knowledge base setup

---

## Configuration Tab

<div class="Box">
  <div class="Box-header">
    <h3 class="Box-title">🛠️ System Configuration</h3>
  </div>
  <div class="Box-body">
    <div class="flash flash-warn">
      <strong>Screenshots Updated:</strong> New screenshots reflecting the current UI design will be added here.
    </div>
    <p>The Configuration tab provides system setup and industry-specific configuration options.</p>
  </div>
</div>

The Configuration tab allows you to:

1. **Industry Selection**: Choose your business domain (Restaurant, Retail, Healthcare, etc.)
2. **Agent Configuration**: Customize AI behavior and response styles
3. **Session Management**: View session information and manage data persistence
4. **Knowledge Base Setup**: Upload business documents for contextual AI responses

**To configure your system:**

<div class="Box">
  <div class="Box-body">
    <ol>
      <li>Select your industry from the dropdown menu</li>
      <li>Adjust agent settings if needed (defaults work well for most cases)</li>
      <li>Upload relevant business documents in the Knowledge Base section</li>
      <li>Click "Save Configuration" to apply changes</li>
    </ol>
  </div>
</div>

---

## Chat Interface

<div class="Box">
  <div class="Box-header">
    <h3 class="Box-title">💬 AI-Powered Rule Creation</h3>
  </div>
  <div class="Box-body">
    <div class="flash flash-warn">
      <strong>Screenshots Updated:</strong> New screenshots reflecting the current UI design will be added here.
    </div>
    <p>The Chat Interface is where you'll interact with the AI to create business rules using natural language.</p>
  </div>
</div>

**Key Features:**
- Natural language input field
- Real-time conversation history
- Rule generation and preview
- File download options

### Sample Conversations

Here are some example interactions to help you get started:

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">Example 1: Employee Scheduling Rule</h4>
  </div>
  <div class="Box-body">
    <p><strong>You:</strong> "Create a rule where employees cannot work more than 8 hours per day"</p>
    <p><strong>AI Response:</strong> The system will analyze this and create a scheduling rule with appropriate conditions and actions.</p>
  </div>
</div>

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">Example 2: Customer Discount Rule</h4>
  </div>
  <div class="Box-body">
    <p><strong>You:</strong> "Set up a discount for customers who have been with us for more than 2 years"</p>
    <p><strong>AI Response:</strong> The system will generate a customer loyalty rule with time-based conditions.</p>
  </div>
</div>

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">Example 3: Service Escalation Rule</h4>
  </div>
  <div class="Box-body">
    <p><strong>You:</strong> "Escalate support tickets to a manager if unresolved for 24 hours"</p>
    <p><strong>AI Response:</strong> The system will create a service escalation workflow with time triggers.</p>
  </div>
</div>

---

## Business Rules Tab

<div class="Box">
  <div class="Box-header">
    <h3 class="Box-title">📊 Rule Management & Knowledge Base</h3>
  </div>
  <div class="Box-body">
    <div class="flash flash-warn">
      <strong>Screenshots Updated:</strong> New screenshots reflecting the current UI design will be added here.
    </div>
    <p>The Business Rules tab provides comprehensive rule management and export capabilities.</p>
  </div>
</div>

The Business Rules tab provides:

- **Rule Summary**: Overview of generated rules
- **File Downloads**: Access to DRL and GDST files
- **Rule Validation**: Conflict detection and impact analysis
- **Batch Processing**: Handle multiple rules simultaneously

---

## Chat Feature Guide

### Basic Chat Interaction

<div class="Box">
  <div class="Box-body">
    <ol>
      <li><strong>Start a Conversation</strong>: Type your rule description in natural language
        <br><em>Example: "If a customer orders more than $100, apply a 10% discount"</em>
      </li>
      <li><strong>AI Processing</strong>: The system will:
        <ul>
          <li>Analyze your input</li>
          <li>Generate structured rule logic</li>
          <li>Provide explanations and clarifications</li>
        </ul>
      </li>
      <li><strong>Review Response</strong>: The AI will show you:
        <ul>
          <li>Understanding of your rule</li>
          <li>Generated rule structure</li>
          <li>Any questions or clarifications needed</li>
        </ul>
      </li>
    </ol>
  </div>
</div>

### Advanced Features

- **Follow-up Questions**: Ask for modifications or clarifications
- **Context Awareness**: Reference previous rules in the conversation
- **Validation**: The system checks for conflicts with existing rules
- **Export Options**: Download generated rules as files

---

## Creating Business Rules

### Step 1: Describe Your Rule

Use natural language to describe what you want to achieve:

<div class="Box p-3 mb-3 bg-green">
  <strong>Good Examples:</strong>
  <ul class="mb-0">
    <li>"Create a scheduling rule where employees can't work more than 8 hours per day"</li>
    <li>"If a customer has been with us for more than 2 years, give them a 15% loyalty discount"</li>
    <li>"Escalate support tickets to a manager if they remain unresolved for more than 24 hours"</li>
  </ul>
</div>

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

## Tips and Best Practices

### Writing Effective Rules

<div class="Box">
  <div class="Box-body">
    <ol>
      <li><strong>Be Specific</strong>: Include exact values, timeframes, and conditions</li>
      <li><strong>Use Examples</strong>: Provide concrete scenarios when possible</li>
      <li><strong>One Rule at a Time</strong>: Focus on a single business rule per conversation</li>
      <li><strong>Test Iteratively</strong>: Start simple and add complexity gradually</li>
    </ol>
  </div>
</div>

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

<div class="flash flash-warn">
  <strong>Important Security Notes:</strong>
  <ul class="mb-0">
    <li>Protect API Keys: Never share your Google API key publicly</li>
    <li>Review Generated Rules: Always validate AI-generated rules before deployment</li>
    <li>Backup Data: Regularly export your rules and session data</li>
    <li>Use HTTPS: Ensure secure connections when deploying to production</li>
  </ul>
</div>

---

## Next Steps

Once you're comfortable with the basic usage:

1. **Explore Advanced Features**: Try the workflow orchestration and conflict detection
2. **Integrate with BRMS**: Connect generated rules to your business rule management system
3. **Scale Your Usage**: Set up multiple environments for different teams
4. **Customize Configuration**: Adapt the system for your specific industry needs

<div class="text-center mt-4">
  <a href="/troubleshooting" class="btn btn-primary">Need Help? Check Troubleshooting →</a>
</div>