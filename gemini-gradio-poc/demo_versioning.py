"""
Demonstration script for rule versioning functionality.
Shows how the versioning system works with sample rules.
"""

import json
import tempfile
import shutil
from pathlib import Path
from utils.rule_versioning import (
    RuleVersionManager,
    create_versioned_rule,
    update_rule_version
)
from utils.agent3_utils import (
    get_rule_change_summary,
    add_impact_analysis_to_rule,
    check_rule_modification_impact
)

def demonstrate_versioning():
    """Demonstrate the versioning functionality."""
    
    print("=== Rule Versioning Demonstration ===\n")
    
    # Create a temporary directory for demo
    temp_dir = tempfile.mkdtemp()
    print(f"Demo running in: {temp_dir}")
    
    try:
        # Initialize version manager
        version_manager = RuleVersionManager(temp_dir)
        
        # Sample rule data
        sample_rule = {
            "rule_id": "DEMO001",
            "name": "VIP Customer Discount",
            "category": "Discount",
            "description": "Apply 15% discount for VIP customers",
            "summary": "VIP customers with orders over $100 receive a 15% discount",
            "conditions": [
                {
                    "field": "customer.status",
                    "operator": "equals",
                    "value": "VIP"
                },
                {
                    "field": "order.value",
                    "operator": "greater_than",
                    "value": 100
                }
            ],
            "actions": [
                {
                    "type": "apply_discount",
                    "percentage": 15
                }
            ],
            "priority": "High",
            "active": True
        }
        
        print("1. Creating initial versioned rule...")
        versioned_rule = create_versioned_rule(
            sample_rule.copy(),
            change_type="create",
            change_summary="Initial VIP discount rule creation",
            impact_analysis="Low impact - new discount rule for VIP customers"
        )
        
        print(f"   Rule created with version: {versioned_rule['version_info']['version']}")
        print(f"   Change type: {versioned_rule['version_info']['change_type']}")
        print(f"   Summary: {versioned_rule['version_info']['change_summary']}")
        print()
        
        print("2. Updating rule to change discount percentage...")
        # Modify the rule
        versioned_rule["actions"][0]["percentage"] = 20
        versioned_rule["description"] = "Apply 20% discount for VIP customers"
        
        updated_rule = update_rule_version(
            versioned_rule,
            change_type="update",
            change_summary="Increased VIP discount from 15% to 20%",
            impact_analysis="Medium impact - affects all VIP customer orders"
        )
        
        print(f"   Rule updated to version: {updated_rule['version_info']['version']}")
        print(f"   Change type: {updated_rule['version_info']['change_type']}")
        print(f"   Summary: {updated_rule['version_info']['change_summary']}")
        print()
        
        print("3. Simulating DRL generation...")
        drl_updated_rule = update_rule_version(
            updated_rule,
            change_type="drl_generation",
            change_summary="Generated DRL and GDST files from JSON rule",
            drl_generated=True
        )
        
        print(f"   Rule updated to version: {drl_updated_rule['version_info']['version']}")
        print(f"   DRL generated: {drl_updated_rule['version_info']['drl_generated']}")
        print(f"   DRL timestamp: {drl_updated_rule['version_info']['drl_generation_timestamp']}")
        print()
        
        print("4. Adding impact analysis...")
        final_rule = add_impact_analysis_to_rule(
            drl_updated_rule,
            "This discount rule affects revenue calculations and customer loyalty metrics"
        )
        
        print(f"   Impact analysis added at version: {final_rule['version_info']['version']}")
        print()
        
        print("5. Getting rule change summary (Agent 3 view)...")
        change_summary = get_rule_change_summary("DEMO001")
        print(change_summary)
        print()
        
        print("6. Checking modification impact...")
        impact_analysis = check_rule_modification_impact(
            "DEMO001", 
            "Change minimum order value from $100 to $150"
        )
        print(impact_analysis)
        print()
        
        print("7. Version history...")
        history = version_manager.get_rule_history("DEMO001")
        print(f"   Total versions in history: {len(history)}")
        for i, version in enumerate(history):
            v_info = version.get("version_info", {})
            print(f"   History entry {i+1}: v{v_info.get('version')} - {v_info.get('change_summary')}")
        print()
        
        print("8. Final rule state...")
        print(f"   Current version: {final_rule['version_info']['version']}")
        print(f"   Discount percentage: {final_rule['actions'][0]['percentage']}%")
        print(f"   DRL generated: {final_rule['version_info']['drl_generated']}")
        print(f"   Total changes tracked: {len(history)}")
        print()
        
        print("✅ Versioning demonstration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during demonstration: {e}")
        
    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
        print(f"\nDemo directory cleaned up: {temp_dir}")

if __name__ == "__main__":
    demonstrate_versioning()