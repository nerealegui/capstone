"""UI utility functions for order history display and interaction."""

import pandas as pd
from typing import List, Dict, Any, Tuple
from datetime import datetime
from utils.order_history_utils import (
    load_order_history,
    get_order_by_id,
    get_order_statistics
)


def format_order_history_for_display(
    page: int = 1,
    per_page: int = 10,
    filter_status: str = None,
    filter_operation: str = None
) -> Tuple[pd.DataFrame, str]:
    """
    Format order history for display in Gradio DataTable.
    
    Args:
        page: Page number
        per_page: Items per page
        filter_status: Status filter
        filter_operation: Operation type filter
        
    Returns:
        Tuple[pd.DataFrame, str]: DataFrame for display and status message
    """
    try:
        orders, pagination = load_order_history(
            page=page,
            per_page=per_page,
            filter_status=filter_status if filter_status and filter_status != "all" else None,
            filter_operation=filter_operation if filter_operation and filter_operation != "all" else None
        )
        
        if not orders:
            # Return empty dataframe with proper structure
            empty_df = pd.DataFrame(columns=[
                "Order ID",
                "Date",
                "Rule Name",
                "Operation",
                "Status"
            ])
            return empty_df, "No orders found"
        
        # Format orders for display
        display_data = []
        for order in orders:
            # Parse and format date
            try:
                dt = datetime.fromisoformat(order["order_date"].replace('Z', '+00:00'))
                formatted_date = dt.strftime('%Y-%m-%d %H:%M')
            except:
                formatted_date = order["order_date"]
            
            display_data.append({
                "Order ID": order["order_id"],
                "Date": formatted_date,
                "Rule Name": order["rule_name"],
                "Operation": order["operation_type"].title(),
                "Status": order["status"].title()
            })
        
        df = pd.DataFrame(display_data)
        
        # Create status message
        status_msg = f"Showing page {pagination['page']} of {pagination['total_pages']} "
        status_msg += f"({pagination['total']} total orders)"
        
        return df, status_msg
        
    except Exception as e:
        print(f"Error formatting order history: {e}")
        empty_df = pd.DataFrame(columns=[
            "Order ID",
            "Date",
            "Rule Name",
            "Operation",
            "Status"
        ])
        return empty_df, f"Error loading orders: {str(e)}"


def format_order_details(order_id: str) -> str:
    """
    Format detailed information about a specific order.
    
    Args:
        order_id: Order ID to display
        
    Returns:
        str: Formatted markdown string with order details
    """
    try:
        order = get_order_by_id(order_id)
        
        if not order:
            return f"❌ Order {order_id} not found"
        
        # Parse date
        try:
            dt = datetime.fromisoformat(order["order_date"].replace('Z', '+00:00'))
            formatted_date = dt.strftime('%Y-%m-%d %H:%M:%S')
        except:
            formatted_date = order["order_date"]
        
        # Build detailed view
        details = f"# Order Details: {order['order_id']}\n\n"
        details += f"**Order Date:** {formatted_date}\n\n"
        details += f"**Rule Name:** {order['rule_name']}\n\n"
        details += f"**Operation Type:** {order['operation_type'].title()}\n\n"
        details += f"**Status:** {order['status'].title()}\n\n"
        
        # Show rule data if available
        if order.get("rule_data") and order["rule_data"]:
            details += "## Rule Information\n\n"
            rule_data = order["rule_data"]
            
            if rule_data.get("description"):
                details += f"**Description:** {rule_data['description']}\n\n"
            
            if rule_data.get("logic"):
                details += f"**Logic:** ```json\n{str(rule_data['logic'])}\n```\n\n"
            
            if rule_data.get("conflicts_found"):
                details += f"**Conflicts Found:** {rule_data['conflicts_found']}\n\n"
            
            if rule_data.get("workflow_type"):
                details += f"**Workflow Type:** {rule_data['workflow_type']}\n\n"
        
        return details
        
    except Exception as e:
        return f"❌ Error loading order details: {str(e)}"


def format_order_statistics() -> str:
    """
    Format order statistics for display.
    
    Returns:
        str: Formatted markdown string with statistics
    """
    try:
        stats = get_order_statistics()
        
        if stats["total_orders"] == 0:
            return "📊 **Order Statistics**\n\nNo orders yet"
        
        output = "📊 **Order Statistics**\n\n"
        output += f"**Total Orders:** {stats['total_orders']}\n\n"
        
        if stats["by_status"]:
            output += "**By Status:**\n"
            for status, count in stats["by_status"].items():
                output += f"- {status.title()}: {count}\n"
            output += "\n"
        
        if stats["by_operation"]:
            output += "**By Operation:**\n"
            for operation, count in stats["by_operation"].items():
                output += f"- {operation.title()}: {count}\n"
        
        return output
        
    except Exception as e:
        return f"❌ Error loading statistics: {str(e)}"


def get_empty_state_message() -> str:
    """Get message for empty order history state."""
    return """
# 📦 Order History

No orders found yet. Orders are automatically created when you:
- Create new business rules
- Generate DRL/GDST files
- Modify existing rules

Start by using the **Chat & Rule Summary** tab to create your first rule!
"""
