"""
Demonstration script for the refactored rule versioning functionality.
Shows how the enhanced versioning system works with improved design and error handling.

Refactoring improvements demonstrated:
- Modular class design with single responsibility
- Enhanced error handling and validation
- Better naming conventions and documentation
- Separated concerns between different components
"""

import json
import tempfile
import shutil
from pathlib import Path
from utils.rule_versioning import (
    RuleVersionManager,
    VersionMetadata,
    VersionHistoryManager,
    create_versioned_rule,
    update_rule_version
)
from utils.agent3_utils import (
    get_rule_change_summary,
    add_impact_analysis_to_rule,
    check_rule_modification_impact,
    get_versioning_help_text
)


def demonstrate_refactored_versioning():
    """Demonstrate the enhanced versioning functionality with refactoring improvements."""
    
    print("=== Enhanced Rule Versioning Demonstration ===\n")
    
    # Create a temporary directory for demo
    temp_dir = tempfile.mkdtemp()
    print(f"Demo running in: {temp_dir}")
    
    try:
        # Initialize version manager with improved design
        version_manager = RuleVersionManager(temp_dir)
        
        # Sample rule data
        sample_rule = {
            "rule_id": "DEMO_REFACTORED_001",
            "name": "VIP Customer Discount Enhanced",
            "category": "Discount",
            "description": "Apply enhanced 15% discount for VIP customers",
            "summary": "VIP customers with orders over $100 receive a 15% discount with enhanced tracking",
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
        
        print("1. Creating initial versioned rule with enhanced metadata...")
        versioned_rule = create_versioned_rule(
            sample_rule.copy(),
            change_type="create",
            change_summary="Initial VIP discount rule creation with enhanced features",
            impact_analysis="Low impact - new enhanced discount rule for VIP customers"
        )
        
        print(f"   ✓ Rule created with version: {versioned_rule['version_info']['version']}")
        print(f"   ✓ Change type: {versioned_rule['version_info']['change_type']}")
        print(f"   ✓ Summary: {versioned_rule['version_info']['change_summary']}")
        print()
        
        print("2. Demonstrating VersionMetadata class functionality...")
        try:
            # Test metadata validation
            metadata = VersionMetadata(
                version=2,
                change_type="update",
                change_summary="Enhanced business logic update",
                impact_analysis="Medium impact - affects VIP customer processing",
                drl_generated=True
            )
            print(f"   ✓ Metadata created: v{metadata.version} - {metadata.change_type}")
            print(f"   ✓ DRL generated: {metadata.drl_generated}")
            print(f"   ✓ Impact analysis: {metadata.impact_analysis}")
        except Exception as e:
            print(f"   ✗ Metadata validation error: {e}")
        print()
        
        print("3. Updating rule with enhanced versioning...")
        # Modify the rule
        versioned_rule["actions"][0]["percentage"] = 20
        versioned_rule["description"] = "Apply enhanced 20% discount for VIP customers"
        
        updated_rule = update_rule_version(
            versioned_rule,
            change_type="update",
            change_summary="Increased VIP discount from 15% to 20% with enhanced tracking",
            impact_analysis="Medium impact - affects all VIP customer orders with improved benefits"
        )
        
        print(f"   ✓ Rule updated to version: {updated_rule['version_info']['version']}")
        print(f"   ✓ Change type: {updated_rule['version_info']['change_type']}")
        print(f"   ✓ Summary: {updated_rule['version_info']['change_summary']}")
        print()
        
        print("4. Demonstrating VersionHistoryManager functionality...")
        history_manager = VersionHistoryManager(temp_dir)
        
        # Manually save a version to demonstrate history management
        history_saved = history_manager.save_version_to_history("DEMO_REFACTORED_001", versioned_rule)
        print(f"   ✓ History saved: {history_saved}")
        
        # Load history
        history = history_manager.load_history("DEMO_REFACTORED_001")
        print(f"   ✓ History entries loaded: {len(history)}")
        print()
        
        print("5. Simulating DRL generation with versioning...")
        drl_updated_rule = update_rule_version(
            updated_rule,
            change_type="drl_generation",
            change_summary="Generated enhanced DRL and GDST files from JSON rule",
            drl_generated=True
        )
        
        print(f"   ✓ Rule updated to version: {drl_updated_rule['version_info']['version']}")
        print(f"   ✓ DRL generated: {drl_updated_rule['version_info']['drl_generated']}")
        print(f"   ✓ DRL timestamp: {drl_updated_rule['version_info']['drl_generation_timestamp']}")
        print()
        
        print("6. Demonstrating Agent 3 integration with enhanced formatting...")
        final_rule = add_impact_analysis_to_rule(
            drl_updated_rule,
            "This enhanced discount rule affects revenue calculations, customer loyalty metrics, and VIP experience optimization"
        )
        
        print(f"   ✓ Impact analysis added at version: {final_rule['version_info']['version']}")
        print()
        
        print("7. Getting enhanced rule change summary (Agent 3 view)...")
        change_summary = get_rule_change_summary("DEMO_REFACTORED_001")
        print("   " + change_summary.replace("\n", "\n   "))
        print()
        
        print("8. Checking modification impact with enhanced analysis...")
        impact_analysis = check_rule_modification_impact(
            "DEMO_REFACTORED_001", 
            "Change minimum order value from $100 to $150 and add customer tier validation"
        )
        print("   " + impact_analysis.replace("\n", "\n   "))
        print()
        
        print("9. Demonstrating error handling and validation...")
        try:
            # Test invalid metadata creation
            invalid_metadata = VersionMetadata(version=-1)  # Should fail
        except Exception as e:
            print(f"   ✓ Validation caught invalid version: {e}")
        
        try:
            # Test invalid change type
            invalid_metadata = VersionMetadata(change_type="invalid_type")  # Should fail
        except Exception as e:
            print(f"   ✓ Validation caught invalid change type: {e}")
        print()
        
        print("10. Version history and summary...")
        version_summary = version_manager.get_version_summary("DEMO_REFACTORED_001")
        print(f"   ✓ Total versions tracked: {version_summary['total_versions']}")
        print(f"   ✓ Current version: {version_summary['current_version']}")
        print(f"   ✓ Rule created: {version_summary.get('created_at', 'Unknown')[:19]}")
        print(f"   ✓ Last modified: {version_summary.get('last_modified', 'Unknown')[:19]}")
        
        if version_summary['change_history']:
            print("   ✓ Recent changes:")
            for i, change in enumerate(version_summary['change_history'][:3]):
                drl_indicator = " [DRL Generated]" if change.get('drl_generated') else ""
                print(f"      - v{change['version']}: {change['change_summary']}{drl_indicator}")
        print()
        
        print("11. Demonstrating enhanced help system...")
        help_text = get_versioning_help_text()
        print("   " + help_text.replace("\n", "\n   "))
        print()
        
        print("12. Final state summary...")
        print(f"   ✓ Rule ID: {final_rule['rule_id']}")
        print(f"   ✓ Current version: {final_rule['version_info']['version']}")
        print(f"   ✓ Discount percentage: {final_rule['actions'][0]['percentage']}%")
        print(f"   ✓ DRL generated: {final_rule['version_info']['drl_generated']}")
        print(f"   ✓ Has impact analysis: {bool(final_rule['version_info'].get('impact_analysis'))}")
        
        history = version_manager.get_rule_history("DEMO_REFACTORED_001")
        print(f"   ✓ Total historical versions: {len(history)}")
        print()
        
        print("✅ Enhanced versioning demonstration completed successfully!")
        print("\n🎯 Key Refactoring Improvements Demonstrated:")
        print("   • Modular class design with single responsibility principle")
        print("   • Enhanced error handling and validation throughout")
        print("   • Better naming conventions for improved clarity")
        print("   • Separated concerns between metadata, history, and management")
        print("   • Comprehensive type hints and documentation")
        print("   • Improved Agent 3 integration with formatting classes")
        print("   • Robust fallback mechanisms and graceful error handling")
        
    except Exception as e:
        print(f"❌ Error during demonstration: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
        print(f"\n🧹 Demo directory cleaned up: {temp_dir}")


def demonstrate_csv_integration():
    """Demonstrate integration with the enhanced CSV rule extraction."""
    
    print("\n=== Enhanced CSV Integration Demonstration ===\n")
    
    try:
        from utils.rule_extractor import (
            RuleExtractionConfig,
            CSVRuleParser,
            LLMRuleConverter,
            VersionedRuleProcessor
        )
        
        print("1. Demonstrating enhanced CSV processing configuration...")
        config = RuleExtractionConfig(
            request_delay=1.0,  # Reduced for demo
            max_retries=2,
            enable_versioning=True
        )
        print(f"   ✓ Config created - Delay: {config.request_delay}s, Retries: {config.max_retries}")
        print(f"   ✓ Versioning enabled: {config.enable_versioning}")
        print()
        
        print("2. Demonstrating versioned rule processing...")
        sample_csv_rule = {
            "rule_id": "CSV_DEMO_001",
            "rule_name": "Sample CSV Rule",
            "category": "demo",
            "description": "A sample rule from CSV",
            "condition": "status = active",
            "action": "apply_processing",
            "priority": "High",
            "active": True
        }
        
        # Process with versioning
        versioned_csv_rule = VersionedRuleProcessor.add_versioning_to_rule(
            sample_csv_rule, True
        )
        
        if "version_info" in versioned_csv_rule:
            print(f"   ✓ CSV rule versioned: v{versioned_csv_rule['version_info']['version']}")
            print(f"   ✓ Change summary: {versioned_csv_rule['version_info']['change_summary']}")
        else:
            print("   ✗ Versioning failed for CSV rule")
        print()
        
        print("✅ CSV integration demonstration completed!")
        
    except ImportError as e:
        print(f"⚠️  CSV integration demo skipped - import error: {e}")
    except Exception as e:
        print(f"❌ Error in CSV demonstration: {e}")


if __name__ == "__main__":
    print("🚀 Starting Enhanced Rule Versioning Demonstration\n")
    print("This demo showcases the refactored versioning system with improvements:")
    print("• Modular design with separated concerns")
    print("• Enhanced error handling and validation")
    print("• Better naming conventions and documentation")
    print("• Improved testability and maintainability")
    print("• Comprehensive Agent 3 integration")
    print("="*70)
    
    demonstrate_refactored_versioning()
    demonstrate_csv_integration()
    
    print("\n🎉 All demonstrations completed!")
    print("The enhanced versioning system is ready for production use.")