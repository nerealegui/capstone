#!/usr/bin/env python3
"""
CI/CD Pipeline validation script for business rules and artifacts.
This script demonstrates the validation capabilities that would run in the CI pipeline.
"""

import os
import sys
import json
from pathlib import Path

def validate_drools_artifacts():
    """Validate that Drools artifacts are properly formatted."""
    print("🔍 Validating Drools artifacts...")
    
    drl_file = Path("generated_rule.drl")
    gdst_file = Path("generated_table.gdst")
    
    # Check DRL file
    if drl_file.exists():
        content = drl_file.read_text()
        if "rule" in content and "when" in content and "then" in content and "end" in content:
            print(f"✅ DRL file validation passed: {drl_file}")
        else:
            print(f"❌ DRL file validation failed: {drl_file}")
            return False
    else:
        print(f"⚠️  DRL file not found: {drl_file}")
    
    # Check GDST file
    if gdst_file.exists():
        content = gdst_file.read_text()
        if "<decision-table" in content or "tableName" in content:
            print(f"✅ GDST file validation passed: {gdst_file}")
        else:
            print(f"❌ GDST file validation failed: {gdst_file}")
            return False
    else:
        print(f"⚠️  GDST file not found: {gdst_file}")
    
    return True

def validate_configuration():
    """Validate system configuration files."""
    print("🔍 Validating configuration files...")
    
    config_files = [
        "config/agent_config.py",
        "utils/config_manager.py"
    ]
    
    for config_file in config_files:
        if Path(config_file).exists():
            print(f"✅ Configuration file found: {config_file}")
        else:
            print(f"❌ Configuration file missing: {config_file}")
            return False
    
    return True

def validate_tests():
    """Validate test files and their structure."""
    print("🔍 Validating test structure...")
    
    test_dir = Path("tests")
    if not test_dir.exists():
        print("❌ Tests directory not found")
        return False
    
    test_files = list(test_dir.glob("test_*.py"))
    if len(test_files) > 0:
        print(f"✅ Found {len(test_files)} test files")
        for test_file in test_files:
            print(f"  - {test_file.name}")
    else:
        print("❌ No test files found")
        return False
    
    return True

def generate_pipeline_report():
    """Generate a summary report for the CI/CD pipeline."""
    print("\n📊 Generating CI/CD Pipeline Report...")
    
    report = {
        "pipeline_status": "validation_complete",
        "timestamp": "2024-01-01T00:00:00Z",
        "validations": {
            "drools_artifacts": validate_drools_artifacts(),
            "configuration": validate_configuration(),
            "tests": validate_tests()
        },
        "next_steps": [
            "Deploy to staging environment",
            "Run integration tests",
            "Wait for user acceptance",
            "Deploy to production"
        ]
    }
    
    # Save report
    report_file = Path("pipeline_report.json")
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"📝 Pipeline report saved to: {report_file}")
    
    # Print summary
    print("\n🎯 Validation Summary:")
    all_passed = all(report["validations"].values())
    status_icon = "✅" if all_passed else "❌"
    print(f"{status_icon} Overall Status: {'PASSED' if all_passed else 'FAILED'}")
    
    for validation, passed in report["validations"].items():
        icon = "✅" if passed else "❌"
        print(f"  {icon} {validation.replace('_', ' ').title()}")
    
    return all_passed

def main():
    """Main validation entry point."""
    print("🚀 Starting CI/CD Pipeline Validation")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Run validation
    success = generate_pipeline_report()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All validations passed! Ready for deployment.")
        sys.exit(0)
    else:
        print("💥 Some validations failed. Please review and fix issues.")
        sys.exit(1)

if __name__ == "__main__":
    main()