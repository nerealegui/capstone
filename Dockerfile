# Dockerfile for Gemini Gradio POC
#chmod +x ../docker-build.sh

# Use an official Python runtime as a base image
FROM python:3.13-slim

# Set work directory in the container
WORKDIR /app

# Install system dependencies for audio processing and other requirements
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker cache
COPY gemini-gradio-poc/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the gemini-gradio-poc directory to the container
COPY gemini-gradio-poc/ ./

# Create necessary directories for data persistence
RUN mkdir -p data/sessions conversations/chats logs

# Expose the port Gradio runs on (default: 7860)
EXPOSE 7860

# Set environment variables for Gradio
ENV GRADIO_SERVER_NAME="0.0.0.0"
ENV GRADIO_SERVER_PORT="7860"
ENV PYTHONPATH="/app"

# Health check to ensure the app is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:7860/ || exit 1

# Command to run your app (using Docker-specific script)
CMD ["python3", "docker_run.py"]
