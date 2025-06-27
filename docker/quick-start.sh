#!/bin/bash

# Quick Docker Build Script for Capstone Gradio App
# Simple one-liner script to build and run the Docker container

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Building and running Capstone Gradio App...${NC}"

# Check if .env exists
if [[ ! -f ".env" ]]; then
    echo "⚠️  .env file not found. Please create one with your GOOGLE_API_KEY"
    exit 1
fi

# Build and run using docker-compose
docker-compose up --build -d

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Application started successfully!${NC}"
    echo -e "${GREEN}🌐 Access your app at: http://localhost:7860${NC}"
    echo -e "${BLUE}📋 To view logs: docker-compose logs -f${NC}"
    echo -e "${BLUE}🛑 To stop: docker-compose down${NC}"
else
    echo "❌ Failed to start the application"
    exit 1
fi
