# Docker Deployment Guide

This guide explains how to build and deploy the Capstone Gradio Application using Docker.

📖 **For the main project overview, features, and architecture**, see **[../README.md](../README.md)**.

## Prerequisites

- Docker installed and running
- Docker Compose (usually included with Docker Desktop)
- `.env` file with your Google API key

## Quick Start

### Option 1: One-Command Deploy (Recommended)

```bash
./docker/quick-start.sh
```

This script will:
- Check for required `.env` file
- Build the Docker image
- Start the container
- Display access information

### Option 2: Using Docker Compose

```bash
# Build and start the application
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Option 3: Manual Docker Commands

```bash
# Build the image
docker build -t capstone-gradio .

# Run the container
docker run -d \
  --name capstone-gradio-app \
  -p 7860:7860 \
  --env-file .env \
  -v $(pwd)/gemini-gradio-poc/data/sessions:/app/data/sessions \
  -v $(pwd)/gemini-gradio-poc/conversations:/app/conversations \
  -v $(pwd)/gemini-gradio-poc/logs:/app/logs \
  capstone-gradio
```

## Environment Setup

Create a `.env` file in the project root:

```bash
# Google API Key for Gemini (Required)
GOOGLE_API_KEY=your_actual_api_key_here

# Optional: Gradio Configuration
GRADIO_SERVER_NAME=0.0.0.0
GRADIO_SERVER_PORT=7860
```

## Advanced Usage

### Using the Full Build Script

The `docker/docker-build.sh` script provides more options:

```bash
# Build image only
./docker/docker-build.sh build

# Build and run with logs
./docker/docker-build.sh run

# Stop the container
./docker/docker-build.sh stop

# Restart the container
./docker/docker-build.sh restart

# View logs
./docker/docker-build.sh logs

# Clean up (remove container and image)
./docker/docker-build.sh clean

# Show help
./docker/docker-build.sh help
```

### Data Persistence

The Docker setup includes volume mounts for:
- `data/sessions/` - Session persistence data
- `conversations/` - Chat history
- `logs/` - Application logs

These directories are automatically created and mounted to preserve data between container restarts.

## Accessing the Application

Once running, the application will be available at:
- **Local URL**: http://localhost:7860
- **Network URL**: http://0.0.0.0:7860 (if running on a server)

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Kill process using port 7860
   lsof -ti:7860 | xargs kill -9
   ```

2. **Permission denied**:
   ```bash
   # Make scripts executable
   chmod +x docker/docker-build.sh docker/quick-start.sh
   ```

3. **API Key not working**:
   - Verify your `.env` file has the correct `GOOGLE_API_KEY`
   - Check that the API key is valid and has the necessary permissions

### Viewing Logs

```bash
# Using Docker Compose
docker-compose logs -f

# Using Docker directly
docker logs -f capstone-gradio-app

# Using the build script
./docker/docker-build.sh logs
```

### Health Check

The container includes a health check that verifies the application is running:

```bash
# Check container health
docker ps

# Manually test health
curl -f http://localhost:7860/
```

## Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (uncomment nginx service in docker-compose.yml)
2. **Setting up SSL certificates**
3. **Using Docker secrets** for sensitive environment variables
4. **Implementing proper logging** and monitoring
5. **Setting up backup** for persistent data

## Stopping the Application

```bash
# Using Docker Compose
docker-compose down

# Using Docker directly
docker stop capstone-gradio-app
docker rm capstone-gradio-app

# Using the build script
./docker/docker-build.sh stop
```

## File Structure

```
capstone/
├── Dockerfile              # Main Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore           # Files to exclude from Docker build
├── .env                    # Environment variables (create this)
├── docker/                 # Docker-related files and scripts
│   ├── README.md           # This file - Docker documentation
│   ├── docker-build.sh     # Advanced build script
│   └── quick-start.sh      # Simple one-command deploy
└── gemini-gradio-poc/      # Application source code
```
