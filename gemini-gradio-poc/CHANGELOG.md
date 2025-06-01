# Changelog

## [Unreleased]

### Added
- Knowledge base (KB) update logic now merges new rules/documents with the existing KB DataFrame instead of replacing it.
- Deduplication is performed on the merged KB based on both `filename` and `chunk` content.

### Changed
- `core_build_knowledge_base` in `utils/kb_utils.py` now accepts an optional `existing_kb_df` parameter and merges new chunks/rules with the existing KB.
- `build_knowledge_base_process` in `interface/chat_app.py` always passes the current KB DataFrame to `core_build_knowledge_base` for merging.

### How to Use
- When adding new business rules or uploading new documents, the KB will retain all previous entries and add new ones, deduplicating as needed.
- No changes are required to the UI; merging is handled automatically in the backend.

### Dependencies
- No new dependencies introduced. Uses `pandas` for DataFrame operations.

### Example
- Upload a document or extract rules, then add more rules or documents: the KB will grow and deduplicate, not overwrite.
