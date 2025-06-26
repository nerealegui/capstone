#!/usr/bin/env python
"""
Demonstration script for the session persistence functionality.
This script simulates the typical workflow of the application with persistence.
"""

import sys
import os
import pandas as pd

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from utils.persistence_manager import (
    save_knowledge_base,
    load_knowledge_base,
    save_rules,
    load_rules,
    session_exists,
    clear_session,
    get_session_summary,
    get_change_log
)


def main():
    print("🚀 Session Persistence Demonstration")
    print("=" * 50)
    
    # 1. Check initial state
    print("\n1. Checking initial session state...")
    if session_exists():
        print("   ✓ Previous session found")
        summary = get_session_summary()
        print(f"   Session Summary:\n{summary}")
    else:
        print("   ℹ No previous session found")
    
    # 2. Create sample knowledge base data
    print("\n2. Creating sample knowledge base data...")
    sample_kb = pd.DataFrame({
        'filename': ['business_rules.pdf', 'business_rules.pdf', 'policies.docx'],
        'chunk': [
            'Our restaurant operates from 9 AM to 11 PM daily',
            'Minimum staffing during peak hours is 4 employees',
            'All staff must complete safety training before starting'
        ],
        'embedding': [
            [0.1, 0.2, 0.3, 0.4],
            [0.5, 0.6, 0.7, 0.8],
            [0.9, 1.0, 1.1, 1.2]
        ]
    })
    
    success, msg = save_knowledge_base(sample_kb, "Demo: Initial KB setup with business documents")
    print(f"   KB Save: {'✓' if success else '✗'} {msg}")
    
    # 3. Create sample rules data
    print("\n3. Creating sample business rules...")
    sample_rules = [
        {
            "id": "BR001",
            "name": "Peak Hour Staffing",
            "description": "Ensure adequate staffing during peak hours",
            "category": "operations",
            "priority": "high",
            "active": True,
            "conditions": ["hour >= 11", "hour <= 14", "day_type == 'weekday'"],
            "actions": ["minimum_staff = 4", "notify_manager_if_understaffed"]
        },
        {
            "id": "BR002",
            "name": "Safety Training Requirement",
            "description": "All new employees must complete safety training",
            "category": "compliance",
            "priority": "high", 
            "active": True,
            "conditions": ["employee.status == 'new'"],
            "actions": ["require_safety_training", "block_schedule_until_complete"]
        }
    ]
    
    success, msg = save_rules(sample_rules, "Demo: Initial rules setup from policy documents")
    print(f"   Rules Save: {'✓' if success else '✗'} {msg}")
    
    # 4. Simulate app restart by loading data
    print("\n4. Simulating application restart...")
    loaded_kb, kb_msg = load_knowledge_base()
    loaded_rules, rules_msg = load_rules()
    
    print(f"   KB Load: {'✓' if loaded_kb is not None else '✗'} {kb_msg}")
    print(f"   Rules Load: {'✓' if loaded_rules is not None else '✗'} {rules_msg}")
    
    # 5. Add more data to existing session
    print("\n5. Adding more data to existing session...")
    if loaded_kb is not None:
        additional_kb = pd.DataFrame({
            'filename': ['employee_handbook.pdf'],
            'chunk': ['Break times are scheduled every 4 hours for staff wellness'],
            'embedding': [[1.3, 1.4, 1.5, 1.6]]
        })
        
        # Merge with existing data
        merged_kb = pd.concat([loaded_kb, additional_kb], ignore_index=True)
        success, msg = save_knowledge_base(merged_kb, "Demo: Added employee handbook")
        print(f"   Additional KB: {'✓' if success else '✗'} {msg}")
    
    # 6. Show session summary
    print("\n6. Current session summary...")
    summary = get_session_summary()
    print(f"   {summary}")
    
    # 7. Show change log
    print("\n7. Change log (recent changes)...")
    changes = get_change_log()
    print(f"   Total changes recorded: {len(changes)}")
    for i, change in enumerate(changes[-3:], 1):  # Show last 3 changes
        timestamp = change.get('timestamp', 'Unknown')[:19]  # Trim to datetime
        component = change.get('component', 'Unknown')
        description = change.get('description', 'No description')
        print(f"   {i}. [{timestamp}] {component}: {description}")
    
    # 8. Option to clear session
    print("\n8. Session management options...")
    print("   Would you like to:")
    print("   a) Keep current session")
    print("   b) Clear session and start fresh")
    
    try:
        choice = input("   Enter choice (a/b): ").lower().strip()
        if choice == 'b':
            success, clear_msg = clear_session()
            print(f"   Clear Session: {'✓' if success else '✗'} {clear_msg}")
            
            # Verify it's cleared
            if not session_exists():
                print("   ✓ Session successfully cleared")
            else:
                print("   ⚠ Session may not be completely cleared")
        else:
            print("   ✓ Keeping current session")
    except (KeyboardInterrupt, EOFError):
        print("\n   ℹ Keeping current session")
    
    print("\n🎉 Demonstration complete!")
    print("=" * 50)
    
    # Final state
    final_exists = session_exists()
    print(f"Final session state: {'Active' if final_exists else 'Cleared'}")
    
    if final_exists:
        print("\nTo view your session data when using the app:")
        print("1. Start the Gradio application")
        print("2. Check the Configuration tab")
        print("3. Look at the 'Session & Data Persistence' section")


if __name__ == "__main__":
    main()