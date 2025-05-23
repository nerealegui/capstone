# Project Structure

## Overview

This project is organized for clarity, modularity, and ease of testing.

- **interface/**: Gradio UI and event logic.
- **utils/**: All backend logic and helpers (RAG, KB, rule generation, etc).
- **config/**: Prompt templates and model configs.
- **tests/**: Unit and integration tests.
- **docs/**: Documentation and changelogs.

## Example Usage

- To launch the app:
  ```bash
  python gemini-gradio-poc/run_gradio_ui.py
  ```
- To run tests:
  ```bash
  pytest gemini-gradio-poc/tests/
  ```

## Dependencies

- [Gradio](https://www.gradio.app/docs/)
- [Google GenAI SDK](https://googleapis.github.io/python-genai/index.html)

## Folder Tree

```
gemini-gradio-poc/
    interface/         # Gradio UI and event logic
    utils/             # All backend logic and helpers
    config/            # Prompt templates and model configs
    tests/             # Unit and integration tests
    docs/              # Documentation and changelogs
    run_gradio_ui.py   # Entrypoint for launching the app
    requirements.txt
```
