---
layout: default
title: Troubleshooting
---

# Troubleshooting

Having issues with the Intelligent Business Rule Management system? This guide covers common problems and their solutions.

<div class="Subhead">
  <div class="Subhead-heading">Quick Solutions</div>
  <div class="Subhead-description">Most issues can be resolved with these common fixes</div>
</div>

## Common Issues

### 1. Application Won't Start

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">🚫 Docker container fails to start or Python script crashes</h4>
  </div>
  <div class="Box-body">
    <strong>Solutions:</strong>
    <ul>
      <li>Verify your Google API key is correct and active</li>
      <li>Check that port 7860 is available: <code>lsof -i :7860</code></li>
      <li>Ensure Docker is running (for Docker setup)</li>
      <li>Verify Python version is 3.8+ (for manual setup)</li>
      <li>Check system resources (memory, disk space)</li>
    </ul>
  </div>
</div>

### 2. API Key Issues

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">🔑 "Invalid API key" or authentication errors</h4>
  </div>
  <div class="Box-body">
    <strong>Solutions:</strong>
    <ul>
      <li>Verify your API key at <a href="https://makersuite.google.com/app/apikey">Google AI Studio</a></li>
      <li>Check that the key has access to Gemini models</li>
      <li>Ensure the <code>.env</code> file is in the correct location and properly formatted</li>
      <li>Restart the application after updating the API key</li>
      <li>Make sure there are no extra spaces or characters in the API key</li>
    </ul>
  </div>
</div>

### 3. Chat Not Responding

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">💬 Messages sent but no AI response</h4>
  </div>
  <div class="Box-body">
    <strong>Solutions:</strong>
    <ul>
      <li>Check your internet connection</li>
      <li>Verify the Google API key is working</li>
      <li>Look for error messages in the browser console (F12)</li>
      <li>Try refreshing the page</li>
      <li>Check if you've reached API rate limits</li>
      <li>Ensure the application is fully loaded before sending messages</li>
    </ul>
  </div>
</div>

### 4. Files Not Generating

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">📁 Rule files (DRL/GDST) are not created or download fails</h4>
  </div>
  <div class="Box-body">
    <strong>Solutions:</strong>
    <ul>
      <li>Ensure the rule description is clear and complete</li>
      <li>Check that the AI understood your rule correctly</li>
      <li>Verify there are no conflicts with existing rules</li>
      <li>Try rephrasing your rule description with more specific details</li>
      <li>Check the Generation Status panel for error messages</li>
    </ul>
  </div>
</div>

### 5. Knowledge Base Upload Issues

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">📚 Documents won't upload or knowledge base won't build</h4>
  </div>
  <div class="Box-body">
    <strong>Solutions:</strong>
    <ul>
      <li>Check file formats (PDF, DOCX, TXT are supported)</li>
      <li>Verify file size limits (usually under 10MB per file)</li>
      <li>Ensure documents contain readable text</li>
      <li>Try uploading files one at a time</li>
      <li>Check for special characters in file names</li>
    </ul>
  </div>
</div>

---

## Diagnostic Steps

### Checking System Status

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">🔍 System Diagnostics</h4>
  </div>
  <div class="Box-body">
    <p>Run these commands to diagnose system issues:</p>
    
    <h5>Docker Setup:</h5>
    <pre><code># Check if Docker is running
docker --version
docker-compose --version

# Check container status
docker-compose ps

# View container logs
docker-compose logs</code></pre>

    <h5>Manual Setup:</h5>
    <pre><code># Check Python version
python --version

# Check if virtual environment is active
echo $VIRTUAL_ENV

# Check installed packages
pip list | grep gradio</code></pre>
  </div>
</div>

### Network Connectivity

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">🌐 Testing API Connectivity</h4>
  </div>
  <div class="Box-body">
    <p>Test your connection to Google's APIs:</p>
    <pre><code># Test API key (replace with your actual key)
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"</code></pre>
  </div>
</div>

---

## Error Messages

### Common Error Messages and Solutions

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">❌ "ModuleNotFoundError: No module named 'gradio'"</h4>
  </div>
  <div class="Box-body">
    <strong>Cause:</strong> Required Python packages not installed<br>
    <strong>Solution:</strong> Install requirements: <code>pip install -r requirements.txt</code>
  </div>
</div>

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">❌ "GOOGLE_API_KEY environment variable not set"</h4>
  </div>
  <div class="Box-body">
    <strong>Cause:</strong> API key not configured<br>
    <strong>Solution:</strong> Set up your <code>.env</code> file with a valid Google API key
  </div>
</div>

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">❌ "Address already in use" (Port 7860)</h4>
  </div>
  <div class="Box-body">
    <strong>Cause:</strong> Another application is using port 7860<br>
    <strong>Solution:</strong> 
    <ul>
      <li>Stop the other application: <code>lsof -ti:7860 | xargs kill -9</code></li>
      <li>Or change the port in docker-compose.yml or environment variables</li>
    </ul>
  </div>
</div>

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">❌ "403 Forbidden" or "401 Unauthorized"</h4>
  </div>
  <div class="Box-body">
    <strong>Cause:</strong> API key issues or quota exceeded<br>
    <strong>Solution:</strong> 
    <ul>
      <li>Verify API key is correct and has proper permissions</li>
      <li>Check your Google Cloud quotas and billing</li>
      <li>Ensure the API key has access to Gemini models</li>
    </ul>
  </div>
</div>

---

## Performance Issues

### Slow Response Times

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">🐌 Application or AI responses are slow</h4>
  </div>
  <div class="Box-body">
    <strong>Potential Solutions:</strong>
    <ul>
      <li>Check your internet connection speed</li>
      <li>Monitor Google API quota usage</li>
      <li>Reduce the size of uploaded documents</li>
      <li>Clear browser cache and refresh</li>
      <li>Use a more powerful machine for local development</li>
    </ul>
  </div>
</div>

### High Memory Usage

<div class="Box">
  <div class="Box-header">
    <h4 class="Box-title">💾 System running out of memory</h4>
  </div>
  <div class="Box-body">
    <strong>Solutions:</strong>
    <ul>
      <li>Increase Docker memory allocation</li>
      <li>Clear session data regularly</li>
      <li>Process smaller batches of documents</li>
      <li>Monitor system resources: <code>docker stats</code></li>
    </ul>
  </div>
</div>

---

## Getting Additional Help

<div class="Box">
  <div class="Box-header">
    <h3 class="Box-title">📞 Support Resources</h3>
  </div>
  <div class="Box-body">
    <ol>
      <li><strong>Check Logs</strong>: Look for error messages in the terminal/console</li>
      <li><strong>Review Documentation</strong>: Refer to <a href="https://github.com/nerealegui/capstone/blob/main/ARCHITECTURE.md">ARCHITECTURE.md</a> for technical details</li>
      <li><strong>Demo Flow</strong>: Follow the step-by-step guide in <a href="https://github.com/nerealegui/capstone/blob/main/Capstone_Demo_Flow.md">Capstone_Demo_Flow.md</a></li>
      <li><strong>GitHub Issues</strong>: Report bugs or request features on the <a href="https://github.com/nerealegui/capstone">repository</a></li>
    </ol>
  </div>
</div>

### Before Reporting Issues

When reporting a problem, please include:

<div class="Box p-3 mb-3 bg-yellow">
  <ul class="mb-0">
    <li>Your operating system and version</li>
    <li>Python version (if using manual setup)</li>
    <li>Docker version (if using Docker setup)</li>
    <li>Steps to reproduce the issue</li>
    <li>Error messages or logs</li>
    <li>Screenshots (if relevant)</li>
  </ul>
</div>

---

<div class="text-center mt-4">
  <a href="/" class="btn btn-outline">← Back to Main Guide</a>
  <a href="https://github.com/nerealegui/capstone/issues" class="btn btn-primary">Report an Issue</a>
</div>