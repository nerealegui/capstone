# GitHub Actions CI/CD Documentation

## Overview

This document describes the GitHub Actions workflow implemented for automated testing and continuous integration of the business rule validation system.

## Workflow Configuration

### File: `.github/workflows/test.yml`

The workflow is triggered on:
- Pull requests to `main` or `master` branches
- Pushes to `main` or `master` branches

### Workflow Steps

1. **Environment Setup**
   - Uses Ubuntu latest runner
   - Sets up Python 3.12
   - Installs dependencies from `requirements.txt`

2. **Test Execution**
   - Runs the new business rule extractor tests
   - Validates import functionality for core components
   - Uses environment variables for API keys

3. **Import Validation**
   - Tests critical imports to ensure no breaking changes
   - Validates `rule_extractor` and `chat_app` modules

## Dependencies

The workflow installs the following dependencies:
- `pytest` - Testing framework
- `pandas` - Data processing
- `gradio` - Web interface
- `google-genai` - LLM integration
- `numpy` - Numerical computations
- `PyPDF2` - PDF processing
- `python-docx` - Word document processing
- `scikit-learn` - Machine learning utilities

## Security Considerations

- **API Keys**: Google API key is managed through GitHub Secrets
- **Environment Isolation**: Each workflow run uses a fresh environment
- **Dependency Management**: Pinned versions ensure consistent builds

## Test Coverage

The workflow currently focuses on:
- ✅ Business rule extraction functionality
- ✅ Rule validation and conflict detection
- ✅ Core component imports
- ✅ New feature integration tests

### Test Files Covered
- `tests/test_rule_extractor.py` - Core business rule validation tests

## Workflow Benefits

1. **Automated Testing**: Runs tests on every PR to catch issues early
2. **Breaking Change Detection**: Validates imports to prevent integration issues
3. **Dependency Validation**: Ensures all required packages are available
4. **Consistent Environment**: Standardized testing environment across all runs

## Future Enhancements

### Planned Improvements
- **Full Test Suite**: Expand to run all tests (currently some have pre-existing issues)
- **Code Coverage**: Add coverage reporting
- **Performance Testing**: Add performance benchmarks
- **Integration Testing**: Test end-to-end workflows
- **Documentation Testing**: Validate documentation builds

### Monitoring and Alerts
- **Status Badges**: Add workflow status badges to README
- **Slack Integration**: Notify team on workflow failures
- **Performance Metrics**: Track test execution times

## Usage

### For Developers
- Tests run automatically on PR creation
- Check the "Actions" tab for test results
- Fix any failing tests before merging

### For Reviewers
- Verify that all checks pass before approving PRs
- Review test results for any new failures
- Ensure new features include appropriate tests

## Troubleshooting

### Common Issues
1. **Import Errors**: Usually due to missing dependencies
   - Solution: Update `requirements.txt` with missing packages

2. **API Key Issues**: Google API key not available in environment
   - Solution: Ensure `GOOGLE_API_KEY` is set in GitHub Secrets

3. **Test Failures**: New code breaking existing functionality
   - Solution: Fix the code or update tests as appropriate

### Local Testing
To run the same tests locally:
```bash
cd gemini-gradio-poc
pip install -r requirements.txt
python -m pytest tests/test_rule_extractor.py -v
```

---

*Last updated: [Current Date]*
*Maintained by: Development Team*