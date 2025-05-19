# Changelog for Capstone Repository

## 2025-05-19

### Changed
- Removed the JSON display block from the UI for a cleaner interface (see [UI Updates Documentation](./ui_updates.md) for details)

### Added
- Agent 2: Converts JSON rule output to Drools DRL and GDST files using Google Gen AI (`google.genai`).
- Verification step for Drools execution (currently a placeholder).
- Gradio UI: 'Preview & Apply' button triggers Agent 2, generates files, verifies, and provides download links.
- File download and status components in the interface.
- Unit tests for Agent 2 logic.

### How to Use
1. Interact with the chatbot to generate a rule (Agent 1).
2. Click the 'Preview & Apply' button in the UI to generate and verify DRL/GDST files from the latest rule.
3. Download the generated files if verification is successful.

### Dependencies
- `google-genai` (https://googleapis.github.io/python-genai/index.html)
- `gradio`

### Example Usage
- Enter a business rule in the chat (e.g., "If a customer orders more than $100, apply a 10% discount.").
- Click 'Preview & Apply'.
- Download the generated `.drl` and `.gdst` files from the right panel.

---

*This changelog will be updated with all major changes and features in the Capstone repository going forward.*
