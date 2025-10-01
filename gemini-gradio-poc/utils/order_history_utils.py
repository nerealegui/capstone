"""Order history utilities for tracking rule operations and transactions."""

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path

# Order history file path
ORDER_HISTORY_FILE = "order_history.json"


def get_order_history_path() -> str:
    """Get the full path for the order history file."""
    from utils.persistence_manager import get_session_file_path
    return get_session_file_path(ORDER_HISTORY_FILE)


def create_order(
    rule_name: str,
    operation_type: str,
    rule_data: Dict[str, Any] = None,
    status: str = "completed"
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Create a new order entry for a rule operation.
    
    Args:
        rule_name: Name of the rule
        operation_type: Type of operation (created, modified, deleted, analyzed)
        rule_data: Optional rule data/details
        status: Order status (completed, pending, failed)
        
    Returns:
        Tuple[bool, str, Dict]: Success status, message, and order data
    """
    try:
        # Generate order ID with microseconds for uniqueness
        timestamp = datetime.now()
        order_id = f"ORD-{timestamp.strftime('%Y%m%d%H%M%S%f')}"
        
        # Create order entry
        order = {
            "order_id": order_id,
            "order_date": timestamp.isoformat(),
            "rule_name": rule_name,
            "operation_type": operation_type,
            "status": status,
            "rule_data": rule_data or {},
            "total_operations": 1
        }
        
        # Retry logic to handle concurrent writes
        max_retries = 3
        for attempt in range(max_retries):
            # Load existing history (fresh each time to avoid stale data)
            history = load_order_history(per_page=10000)[0] or []
            
            # Check if this order_id already exists (avoid duplicates)
            if any(o["order_id"] == order_id for o in history):
                # Regenerate order_id if duplicate found
                from time import sleep
                sleep(0.001)  # Small delay
                timestamp = datetime.now()
                order_id = f"ORD-{timestamp.strftime('%Y%m%d%H%M%S%f')}"
                order["order_id"] = order_id
                order["order_date"] = timestamp.isoformat()
                continue
            
            # Add new order
            history.append(order)
            
            # Save updated history
            success = _save_order_history(history)
            
            if success:
                break
        else:
            success = False
        
        if success:
            return True, f"Order {order_id} created successfully", order
        else:
            return False, "Failed to save order", order
            
    except Exception as e:
        return False, f"Error creating order: {str(e)}", {}


def load_order_history(
    page: int = 1,
    per_page: int = 10,
    filter_status: Optional[str] = None,
    filter_operation: Optional[str] = None
) -> Tuple[Optional[List[Dict[str, Any]]], Dict[str, Any]]:
    """
    Load order history with pagination and filtering.
    
    Args:
        page: Page number (1-indexed)
        per_page: Number of orders per page
        filter_status: Optional status filter
        filter_operation: Optional operation type filter
        
    Returns:
        Tuple[Optional[List[Dict]], Dict]: List of orders and pagination info
    """
    try:
        history_path = get_order_history_path()
        
        if not os.path.exists(history_path):
            return [], {
                "total": 0,
                "page": page,
                "per_page": per_page,
                "total_pages": 0
            }
        
        with open(history_path, 'r') as f:
            all_orders = json.load(f)
        
        # Apply filters
        filtered_orders = all_orders
        
        if filter_status:
            filtered_orders = [o for o in filtered_orders if o.get("status") == filter_status]
        
        if filter_operation:
            filtered_orders = [o for o in filtered_orders if o.get("operation_type") == filter_operation]
        
        # Sort by date (newest first)
        filtered_orders.sort(key=lambda x: x.get("order_date", ""), reverse=True)
        
        # Calculate pagination
        total = len(filtered_orders)
        total_pages = (total + per_page - 1) // per_page if total > 0 else 0
        
        # Get page slice
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_orders = filtered_orders[start_idx:end_idx]
        
        pagination_info = {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
        
        return page_orders, pagination_info
        
    except Exception as e:
        print(f"Error loading order history: {e}")
        return None, {}


def get_order_by_id(order_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific order by ID.
    
    Args:
        order_id: Order ID to retrieve
        
    Returns:
        Optional[Dict]: Order data or None if not found
    """
    try:
        all_orders, _ = load_order_history(per_page=1000)  # Load all
        
        for order in all_orders:
            if order.get("order_id") == order_id:
                return order
        
        return None
        
    except Exception as e:
        print(f"Error getting order by ID: {e}")
        return None


def get_order_statistics() -> Dict[str, Any]:
    """
    Get statistics about order history.
    
    Returns:
        Dict: Statistics including total orders, by status, by operation type
    """
    try:
        all_orders, _ = load_order_history(per_page=10000)  # Load all
        
        if not all_orders:
            return {
                "total_orders": 0,
                "by_status": {},
                "by_operation": {}
            }
        
        stats = {
            "total_orders": len(all_orders),
            "by_status": {},
            "by_operation": {}
        }
        
        # Count by status
        for order in all_orders:
            status = order.get("status", "unknown")
            stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
            
            operation = order.get("operation_type", "unknown")
            stats["by_operation"][operation] = stats["by_operation"].get(operation, 0) + 1
        
        return stats
        
    except Exception as e:
        print(f"Error getting order statistics: {e}")
        return {"total_orders": 0, "by_status": {}, "by_operation": {}}


def clear_order_history() -> Tuple[bool, str]:
    """
    Clear all order history.
    
    Returns:
        Tuple[bool, str]: Success status and message
    """
    try:
        history_path = get_order_history_path()
        
        if os.path.exists(history_path):
            os.remove(history_path)
        
        return True, "Order history cleared successfully"
        
    except Exception as e:
        return False, f"Error clearing order history: {str(e)}"


def _save_order_history(history: List[Dict[str, Any]]) -> bool:
    """
    Internal function to save order history to file.
    
    Args:
        history: List of order entries
        
    Returns:
        bool: Success status
    """
    try:
        from utils.persistence_manager import ensure_persistence_directory
        ensure_persistence_directory()
        
        history_path = get_order_history_path()
        
        # Write atomically by writing to temp file first
        temp_path = history_path + '.tmp'
        with open(temp_path, 'w') as f:
            json.dump(history, f, indent=2)
        
        # Rename temp file to actual file (atomic on POSIX systems)
        os.replace(temp_path, history_path)
        
        return True
        
    except Exception as e:
        print(f"Error saving order history: {e}")
        return False
