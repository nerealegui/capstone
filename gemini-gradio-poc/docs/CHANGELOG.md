# Changelog for Capstone Repository

# Changelog

## [2025-05-23] - Layout Fix

### Fixed
- **Two-Column Layout Issue**: Fixed Gradio interface layout that was appearing as a single column on initial load
  - Moved all component creation inside proper column contexts
  - Removed duplicate component creation and redundant `.render()` calls
  - Updated ChatInterface configuration to properly reference output components
  - Added specific CSS classes for better column control

### Technical Details
- Components are now properly nested within their intended layout hierarchy
- Left column (60% width) contains the chat interface
- Right column (40% width) contains knowledge base setup and rule summary
- Fixed component references in ChatInterface additional_outputs

### Dependencies
- Gradio interface components
- No additional dependencies required

### Usage
The interface now properly displays two distinct columns from initial load, improving user experience and interface organization.

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

## [2025-05-23] - Three-Column Layout and UI Cleanup

### Changed
- Removed the "Additional Inputs" dropdown from the Gradio UI.
- Refactored the interface to use a three-column layout: Chat Interface, Knowledge Base Setup, and Rule Summary.

### How to Use
- Interact with the chatbot in the left column.
- Upload and configure knowledge base documents in the middle column.
- View rule details and download files in the right column.

### Dependencies
- `gradio`
- `google-genai`

### Example Usage
1. Enter a rule description or question in the Chat Interface.
2. Upload documents and build the knowledge base in the Knowledge Base Setup column.
3. View the rule summary and download files from the Rule Summary column.

## [2025-05-23] - Bugfix: Defensive DataFrame Handling

### Fixed
- Added a defensive check in `chat_with_rag` to ensure `rag_state_df` is always a DataFrame, preventing AttributeError when it is None.

## [2025-05-23] - Bugfix: Knowledge Base Build Exception Handling

### Fixed
- Corrected a bug in `build_knowledge_base_process` where an undefined variable `s` was used in the exception handler. Now returns the correct status message on error.

---

*This changelog will be updated with all major changes and features in the Capstone repository going forward.*
