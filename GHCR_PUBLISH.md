# GitHub Container Registry for Capstone Project

This document explains how to build and push the Docker image for the Capstone project to GitHub Container Registry (GHCR).

## Prerequisites

1. [Docker](https://docs.docker.com/get-docker/) installed locally
2. [GitHub CLI](https://cli.github.com/) or GitHub Personal Access Token with `write:packages` scope
3. GitHub account with access to the repository

## Automatic Publishing via GitHub Actions

We've set up a GitHub Actions workflow that automatically builds and pushes the Docker image to GitHub Container Registry when:

- You push to the `main` branch
- You create a new tag (v*.*.*)
- You manually trigger the workflow from the Actions tab

The workflow is defined in `.github/workflows/docker-publish.yml`.

## Manual Publishing

If you need to push the Docker image manually, follow these steps:

### 1. Authenticate with GitHub Container Registry

Using Personal Access Token:

```bash
# Login to GitHub Container Registry
echo $GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Using GitHub CLI:

```bash
# Login via GitHub CLI (if you have it installed)
gh auth login
gh auth setup-git
# The above will configure Docker to use your GitHub credentials
```

### 2. Build the Docker Image

```bash
# Navigate to the project root
cd /path/to/capstone

# Build the image with proper tagging
docker build -t ghcr.io/nerealegui/capstone:latest .
```

### 3. Push the Image to GitHub Container Registry

```bash
# Push the image
docker push ghcr.io/nerealegui/capstone:latest
```

### 4. Tag and Push a Versioned Release (Optional)

```bash
# Tag with a version
docker tag ghcr.io/nerealegui/capstone:latest ghcr.io/nerealegui/capstone:v1.0.0

# Push the versioned tag
docker push ghcr.io/nerealegui/capstone:v1.0.0
```

## Environment Variables

For the image to work properly, ensure the following secrets are set in your GitHub repository:

- `GOOGLE_API_KEY`: Your Google API key for Gemini

## Accessing the Container

Once published, the container will be available at:

```
ghcr.io/nerealegui/capstone:latest
```

You can pull it using:

```bash
docker pull ghcr.io/nerealegui/capstone:latest
```

## Running the Container

```bash
docker run -p 7860:7860 \
  -e GOOGLE_API_KEY=your_api_key \
  -e GRADIO_SERVER_NAME=0.0.0.0 \
  -e GRADIO_SERVER_PORT=7860 \
  -e PYTHONPATH=/app \
  ghcr.io/nerealegui/capstone:latest
```

## Making the Package Public (Optional)

By default, packages pushed to GHCR are private to your account. To make it public:

1. Go to the package on GitHub
2. Go to Package Settings
3. Scroll down to the "Danger Zone"
4. Change the visibility to "Public"
