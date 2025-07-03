# Session Persistence Documentation

## Overview

The Gemini Business Rules application now includes comprehensive session persistence functionality that automatically saves and loads knowledge base (KB) data and business rules between application sessions.

## Features

### 1. Automatic Session Loading
- On application startup, the system automatically loads previously saved KB and rules data if available
- KB data is initialized with loaded DataFrames containing document chunks and embeddings
- Rules are loaded and available for querying and management
- Session status is displayed in the Configuration tab

### 2. Session Management UI
Located in the Configuration tab under "Session & Data Persistence":
- **Session Status**: Shows current session information including data counts and last update times
- **New Session Button**: Clears all current session data and starts fresh
- **View Changes Button**: Displays the change log for the current session

### 3. Persistent Storage
- **Knowledge Base**: Stored using pickle format for efficient serialization of embeddings
- **Rules**: Stored as JSON for human-readable structure
- **Change Log**: Complete audit trail of all modifications with timestamps
- **Session Metadata**: Tracks session creation, IDs, and update times

### 4. Change Logging
All modifications to KB and rules are automatically logged with:
- Timestamp of the change
- Component affected (knowledge_base or rules)
- Description of the change
- Additional metadata (file counts, names, etc.)

## File Structure

```
data/sessions/
├── knowledge_base.pkl     # Pickled pandas DataFrame with embeddings
├── extracted_rules.json   # Business rules in JSON format
├── change_log.json       # Complete change history
└── session_metadata.json # Session tracking information
```

## API Reference

### Core Functions (utils/persistence_manager.py)

#### Knowledge Base Operations
```python
save_knowledge_base(df: pd.DataFrame, description: str) -> Tuple[bool, str]
load_knowledge_base() -> Tuple[Optional[pd.DataFrame], str]
```

#### Rules Operations  
```python
save_rules(rules: List[Dict], description: str) -> Tuple[bool, str]
load_rules() -> Tuple[Optional[List[Dict]], str]
```

#### Session Management
```python
session_exists() -> bool
clear_session() -> Tuple[bool, str]
get_session_summary() -> str
```

#### Change Logging
```python
log_change(component: str, description: str, metadata: Dict) -> bool
get_change_log() -> List[Dict]
```

## Usage Examples

### Loading Previous Session
```python
# Application startup automatically loads previous session
kb_df, kb_msg = load_knowledge_base()
rules, rules_msg = load_rules()

if kb_df is not None:
    print(f"Loaded KB with {len(kb_df)} chunks")
if rules is not None:
    print(f"Loaded {len(rules)} rules")
```

### Adding to Existing Session
```python
# When building KB, existing data is automatically merged
existing_kb = load_knowledge_base()[0] or pd.DataFrame()
new_status, updated_df = core_build_knowledge_base(
    file_paths, 
    existing_kb_df=existing_kb
)
```

### Starting Fresh Session
```python
# Clear all session data
success, message = clear_session()
if success:
    print("New session started")
```

## Benefits

1. **Continuity**: Users can resume work where they left off
2. **Data Safety**: All work is automatically preserved
3. **Traceability**: Complete audit trail of changes
4. **Flexibility**: Easy to start fresh or continue existing work
5. **Performance**: Efficient storage and loading of large datasets

## Integration Points

The persistence system is integrated into:
- Knowledge base building (`utils/kb_utils.py`)
- Rules extraction (`utils/ui_utils.py`) 
- Application initialization (`interface/chat_app.py`)
- Session management UI components

## Technical Notes

- Uses pickle for DataFrame serialization to preserve numpy arrays (embeddings)
- JSON for rules provides human-readable storage and easy editing
- Change logging provides complete traceability for compliance
- Session files are excluded from version control (`.gitignore`)
- Comprehensive test coverage ensures reliability

## Error Handling

The system gracefully handles:
- Missing or corrupted session files
- Empty or invalid data
- Disk space or permission issues
- Concurrent access scenarios

Errors are logged and reported to the user with clear messages and recovery options.