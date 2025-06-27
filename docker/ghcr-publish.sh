#!/bin/bash

# Docker Build and Push Script for GitHub Container Registry
# This script builds and pushes the Docker image to GitHub Container Registry

set -e  # Exit on any error

# Configuration
GITHUB_USERNAME="nerealegui"
REPO_NAME="capstone"
IMAGE_NAME="ghcr.io/$GITHUB_USERNAME/$REPO_NAME"
TAG=${1:-"latest"}  # Use the first argument as tag, or "latest" if not provided

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check for Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check GitHub authentication
print_status "Checking GitHub Container Registry authentication..."
if ! docker info | grep -q "ghcr.io"; then
    print_warning "Not authenticated to GitHub Container Registry."
    print_warning "Please authenticate using one of these methods:"
    echo "1. Using GitHub CLI: gh auth login"
    echo "2. Using Docker login: docker login ghcr.io -u $GITHUB_USERNAME"
    
    read -p "Do you want to try logging in now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v gh &> /dev/null; then
            print_status "Using GitHub CLI for authentication..."
            gh auth login
        else
            print_status "Please enter your GitHub Personal Access Token:"
            read -s TOKEN
            echo $TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
        fi
    else
        print_error "Authentication required. Exiting."
        exit 1
    fi
fi

# Build the Docker image
print_status "Building Docker image: $IMAGE_NAME:$TAG"
docker build -t "$IMAGE_NAME:$TAG" .

# Push the image to GitHub Container Registry
print_status "Pushing image to GitHub Container Registry..."
docker push "$IMAGE_NAME:$TAG"

print_success "Successfully built and pushed $IMAGE_NAME:$TAG"
print_status "Your image is now available at: $IMAGE_NAME:$TAG"
