#!/usr/bin/env python3
"""
Test script to verify the chat history bug fix.
This simulates the issue where follow-up questions weren't being handled correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.workflow_orchestrator import BusinessRuleWorkflow
import pandas as pd

def test_chat_history_processing():
    """Test that conversation history is properly processed for follow-up questions."""
    
    print("🧪 Testing chat history processing for follow-up questions...")
    
    # Simulate the exact scenario from the bug report
    conversation_history = [
        [
            "Create a rule that assigns 10 employees to medium-sized restaurants when sales are between 100 and 200",
            "I have created a business rule for employee assignment based on restaurant size and sales volume. The rule assigns 10 employees to medium-sized restaurants when sales are between 100 and 200."
        ],
        [
            "Can you assign 5 employees instead?",
            None  # This is the current message - bot hasn't responded yet
        ]
    ]
    
    current_user_input = "Can you assign 5 employees instead?"
    
    print(f"📝 Conversation history: {len(conversation_history)} exchanges")
    for i, exchange in enumerate(conversation_history):
        user_msg, bot_msg = exchange
        print(f"  {i+1}. User: {user_msg[:50]}...")
        print(f"     Bot: {bot_msg[:50] + '...' if bot_msg else 'None (current message)'}")
    
    print(f"\n🎯 Current user input: {current_user_input}")
    
    # Test the workflow
    workflow = BusinessRuleWorkflow()
    
    # This should now work correctly with the bug fix
    print("\n🔄 Running workflow with history context...")
    try:
        result = workflow.run_workflow(
            user_input=current_user_input,
            rag_df=None,
            industry="generic",
            history=conversation_history
        )
        
        print("✅ Workflow completed successfully!")
        print(f"📊 Response preview: {result.get('response', 'No response')[:100]}...")
        
        # Check if the response indicates understanding of the modification request
        response = result.get('response', '').lower()
        if '5' in response and ('employee' in response or 'assign' in response):
            print("✅ SUCCESS: Bot appears to understand the modification request!")
        else:
            print("⚠️  Warning: Response may not fully address the modification request")
            
    except Exception as e:
        print(f"❌ Workflow failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_chat_history_processing()
