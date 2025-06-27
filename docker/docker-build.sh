#!/bin/bash

# Docker Build Script for Capstone Gradio App
# This script builds and optionally runs the Docker container

set -e  # Exit on any error

# Configuration
IMAGE_NAME="capstone-gradio"
CONTAINER_NAME="capstone-gradio-app"
TAG="latest"
PORT="7860"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if .env file exists
check_env_file() {
    if [[ ! -f ".env" ]]; then
        print_warning ".env file not found. Creating template..."
        cat > .env << EOF
# Google API Key for Gemini
GOOGLE_API_KEY=your_api_key_here

# Optional: Other environment variables
# GRADIO_SERVER_NAME=0.0.0.0
# GRADIO_SERVER_PORT=7860
EOF
        print_warning "Please edit .env file and add your Google API key"
        exit 1
    fi
    print_success ".env file found"
}

# Function to build Docker image
build_image() {
    print_status "Building Docker image: ${IMAGE_NAME}:${TAG}"
    
    docker build -t "${IMAGE_NAME}:${TAG}" . \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --progress=plain
    
    if [[ $? -eq 0 ]]; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to stop and remove existing container
stop_existing_container() {
    if docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        print_status "Stopping and removing existing container: ${CONTAINER_NAME}"
        docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
        docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true
        print_success "Existing container removed"
    fi
}

# Function to run Docker container
run_container() {
    print_status "Starting container: ${CONTAINER_NAME}"
    
    docker run -d \
        --name "${CONTAINER_NAME}" \
        -p "${PORT}:7860" \
        --env-file .env \
        -v "$(pwd)/gemini-gradio-poc/data/sessions:/app/data/sessions" \
        -v "$(pwd)/gemini-gradio-poc/conversations:/app/conversations" \
        -v "$(pwd)/gemini-gradio-poc/logs:/app/logs" \
        --restart unless-stopped \
        "${IMAGE_NAME}:${TAG}"
    
    if [[ $? -eq 0 ]]; then
        print_success "Container started successfully"
        print_status "Application will be available at: http://localhost:${PORT}"
        print_status "Container logs: docker logs -f ${CONTAINER_NAME}"
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Function to show container logs
show_logs() {
    print_status "Showing container logs (press Ctrl+C to exit):"
    docker logs -f "${CONTAINER_NAME}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  build       Build the Docker image only"
    echo "  run         Build and run the container"
    echo "  stop        Stop the running container"
    echo "  restart     Restart the container"
    echo "  logs        Show container logs"
    echo "  clean       Remove container and image"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build                 # Build image only"
    echo "  $0 run                   # Build and run container"
    echo "  $0 logs                  # Show container logs"
}

# Main script logic
case "${1:-run}" in
    "build")
        print_status "Building Docker image..."
        check_docker
        build_image
        ;;
    "run")
        print_status "Building and running Docker container..."
        check_docker
        check_env_file
        build_image
        stop_existing_container
        run_container
        
        # Ask if user wants to see logs
        echo ""
        read -p "Would you like to see the container logs? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            show_logs
        fi
        ;;
    "stop")
        print_status "Stopping container..."
        docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
        print_success "Container stopped"
        ;;
    "restart")
        print_status "Restarting container..."
        docker restart "${CONTAINER_NAME}" >/dev/null 2>&1
        print_success "Container restarted"
        ;;
    "logs")
        show_logs
        ;;
    "clean")
        print_status "Cleaning up containers and images..."
        docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
        docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true
        docker rmi "${IMAGE_NAME}:${TAG}" >/dev/null 2>&1 || true
        print_success "Cleanup completed"
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        print_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac
