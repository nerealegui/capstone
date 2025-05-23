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

## 2025-05-23

### Fixed Gradio ChatInterface Output Bug
- **Issue:** The `chat_with_rag` function returned too many output values, causing a Gradio error: "A function (_submit_fn) returned too many output values (needed: 2, returned: 5). Ignoring extra values."
- **Fix:** Updated `chat_with_rag` to return outputs in the order and number expected by Gradio's `ChatInterface` with `additional_outputs`:
  - (chatbot response string, updated chat history, name, summary, logic)
- **Impact:** The chat interface now works as intended, with all side panel outputs updating correctly and no Gradio warnings.

### How to Use
- Use the Gradio UI as before. The chat, name, summary, and logic fields will update as expected after each chat turn.

### Dependencies
- [Gradio](https://www.gradio.app/docs/gradio/interface)
- [Google GenAI SDK](https://googleapis.github.io/python-genai/index.html)
- pandas, numpy, etc. (see requirements.txt)

### Example
No change to usage. Launch the UI and interact with the chatbot as before.

## 2025-05-23

### Refactored build_knowledge_base_process for Testability
- **Refactor:** Separated the core logic of `build_knowledge_base_process` into a pure function (`_core_build_knowledge_base`) for easier unit testing and clarity.
- **Enhancements:**
  - Added type hints and improved docstrings for maintainability.
  - The generator function now only handles Gradio status updates and delegates all logic to the core function.
  - The core function can be directly tested with file paths, chunk size, and overlap, and returns a status message and DataFrame.
- **How to Test:**
  - You can now write unit tests for `_core_build_knowledge_base` by mocking file reading and embedding dependencies.

## 2025-05-23

### Modularized chat_app.py and Extracted Utility Logic
- **Refactor:** Extracted the core knowledge base building logic to a new file `kb_utils.py` as `core_build_knowledge_base`.
- **chat_app.py:** Now only contains Gradio interface, event wiring, and high-level event handler functions. All core logic is delegated to `kb_utils.py`.
- **Benefits:**
  - Easier to debug and maintain the Gradio interface.
  - Utility logic is now easily unit-testable and reusable.
  - Clearer separation of concerns between UI and backend logic.

## 2025-05-23

### Modularized Rule Summary/Generation Logic
- **Refactor:** Extracted `json_to_drl_gdst` and `verify_drools_execution` to a new file `rule_utils.py`.
- **chat_app.py:** Now imports these functions from `rule_utils.py` and only contains Gradio interface/event logic.
- **Benefits:**
  - Rule summary and Drools generation logic is now easily unit-testable and reusable.
  - Further separation of concerns between UI and backend logic.

## 2025-05-23

### Major Project Restructure for Modularity
- **Folders created:**
  - `interface/` for Gradio UI and event logic
  - `utils/` for all backend logic and helpers (RAG, KB, rule generation, etc)
  - `config/` for prompt templates and model configs
  - `tests/` for unit and integration tests
- **Files moved:**
  - `chat_app.py` → `interface/`
  - `kb_utils.py`, `rag_utils.py`, `rule_utils.py` → `utils/`
  - `agent_config.py` → `config/`
  - `test_agent2.py`, `test_build_kb.py` → `tests/`
- **All imports updated** to use the new folder structure.
- **Documentation:** Added `docs/STRUCTURE.md` describing the new structure and usage.
- **Benefits:**
  - Clear separation of UI, logic, config, and tests
  - Easier debugging, testing, and future development

## [2025-05-23] - Bugfix: Gradio ChatInterface State KeyError

### Fixed
- **KeyError: 0 in Gradio ChatInterface**: Fixed a bug where the Gradio UI would crash with a KeyError due to improper state registration in the ChatInterface.
- **Technical Details**: The `state` parameter is now passed directly to the `gr.ChatInterface` constructor instead of being set after creation. This ensures Gradio correctly registers the state block and prevents KeyError on UI interaction.

### How to Use
- Launch the UI as before. The chat, knowledge base, and rule summary panels will work without backend KeyErrors.

### Dependencies
- `gradio` (see [Gradio documentation](https://www.gradio.app/docs/gradio/interface))
- `google-genai` (see [Google GenAI SDK](https://googleapis.github.io/python-genai/index.html))

### Example
No change to usage. Launch the UI and interact with the chatbot as before.

## [2025-05-23] - Bugfix: Gradio ChatInterface State Argument Error

### Fixed
- **TypeError: ChatInterface.__init__() got an unexpected keyword argument 'state'**: Updated the code to remove the unsupported `state` argument from the `gr.ChatInterface` constructor. State is now set after creation using `chat_interface.state = state_rag_df`, as per Gradio 5.29.0 documentation.

### How to Use
- Launch the UI as before. The chat, knowledge base, and rule summary panels will work without backend errors.

### Dependencies
- `gradio` (see [Gradio documentation](https://www.gradio.app/docs/gradio/interface))
- `google-genai` (see [Google GenAI SDK](https://googleapis.github.io/python-genai/index.html))

### Example
No change to usage. Launch the UI and interact with the chatbot as before.

## [2025-05-23] - Gradio State Management Bugfix

### Fixed
- **KeyError in ChatInterface with State**: Updated the Gradio ChatInterface to use the correct state management pattern. State is now passed as an `additional_input` and `additional_output` to the ChatInterface, and not set via `.state` after creation. This prevents the KeyError and ensures state is properly registered and updated.

### How to Use
- Launch the UI as before. The chat, knowledge base, and rule summary panels will work without backend KeyErrors.

### Dependencies
- `gradio` (see [Gradio documentation](https://www.gradio.app/docs/gradio/interface))
- `google-genai` (see [Google GenAI SDK](https://googleapis.github.io/python-genai/index.html))

### Example
No change to usage. Launch the UI and interact with the chatbot as before.

---

*This changelog will be updated with all major changes and features in the Capstone repository going forward.*
