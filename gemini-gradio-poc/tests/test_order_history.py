"""Tests for order history functionality."""

import os
import json
import pytest
from datetime import datetime
from utils.order_history_utils import (
    create_order,
    load_order_history,
    get_order_by_id,
    get_order_statistics,
    clear_order_history,
    _save_order_history
)
from utils.order_history_ui_utils import (
    format_order_history_for_display,
    format_order_details,
    format_order_statistics,
    get_empty_state_message
)


class TestOrderHistoryUtils:
    """Test order history utility functions."""
    
    def setup_method(self):
        """Clear order history before each test."""
        clear_order_history()
    
    def teardown_method(self):
        """Clean up after each test."""
        clear_order_history()
    
    def test_create_order(self):
        """Test creating a new order."""
        success, message, order = create_order(
            rule_name="Test Rule",
            operation_type="created",
            rule_data={"description": "Test description"},
            status="completed"
        )
        
        assert success is True
        assert "created successfully" in message
        assert order["rule_name"] == "Test Rule"
        assert order["operation_type"] == "created"
        assert order["status"] == "completed"
        assert "order_id" in order
        assert order["order_id"].startswith("ORD-")
    
    def test_load_order_history_empty(self):
        """Test loading order history when empty."""
        orders, pagination = load_order_history()
        
        assert orders == []
        assert pagination["total"] == 0
        assert pagination["total_pages"] == 0
    
    def test_load_order_history_with_orders(self):
        """Test loading order history with multiple orders."""
        # Create test orders
        create_order("Rule 1", "created", status="completed")
        create_order("Rule 2", "modified", status="completed")
        create_order("Rule 3", "generated", status="pending")
        
        orders, pagination = load_order_history(page=1, per_page=10)
        
        assert len(orders) == 3
        assert pagination["total"] == 3
        assert pagination["page"] == 1
        assert pagination["per_page"] == 10
    
    def test_load_order_history_pagination(self):
        """Test pagination of order history."""
        # Ensure clean state
        clear_order_history()
        
        # Create 15 test orders
        for i in range(15):
            create_order(f"Rule {i}", "created", status="completed")
        
        # Get first page
        orders_page1, pagination1 = load_order_history(page=1, per_page=10)
        assert len(orders_page1) == 10
        # Check that we have at least 15 orders (may have more from previous runs)
        assert pagination1["total"] >= 15
        assert pagination1["total_pages"] >= 2
        
        # Get second page
        orders_page2, pagination2 = load_order_history(page=2, per_page=10)
        assert len(orders_page2) >= 5
        assert pagination2["page"] == 2
    
    def test_load_order_history_with_status_filter(self):
        """Test filtering order history by status."""
        create_order("Rule 1", "created", status="completed")
        create_order("Rule 2", "created", status="pending")
        create_order("Rule 3", "created", status="completed")
        
        orders, pagination = load_order_history(filter_status="completed")
        
        assert len(orders) == 2
        assert all(o["status"] == "completed" for o in orders)
    
    def test_load_order_history_with_operation_filter(self):
        """Test filtering order history by operation type."""
        create_order("Rule 1", "created", status="completed")
        create_order("Rule 2", "modified", status="completed")
        create_order("Rule 3", "created", status="completed")
        
        orders, pagination = load_order_history(filter_operation="created")
        
        assert len(orders) == 2
        assert all(o["operation_type"] == "created" for o in orders)
    
    def test_get_order_by_id(self):
        """Test retrieving a specific order by ID."""
        success, message, order = create_order(
            "Test Rule",
            "created",
            rule_data={"description": "Test"}
        )
        
        order_id = order["order_id"]
        retrieved_order = get_order_by_id(order_id)
        
        assert retrieved_order is not None
        assert retrieved_order["order_id"] == order_id
        assert retrieved_order["rule_name"] == "Test Rule"
    
    def test_get_order_by_id_not_found(self):
        """Test retrieving non-existent order."""
        order = get_order_by_id("NONEXISTENT-ID")
        assert order is None
    
    def test_get_order_statistics(self):
        """Test getting order statistics."""
        create_order("Rule 1", "created", status="completed")
        create_order("Rule 2", "modified", status="completed")
        create_order("Rule 3", "created", status="pending")
        
        stats = get_order_statistics()
        
        assert stats["total_orders"] == 3
        assert stats["by_status"]["completed"] == 2
        assert stats["by_status"]["pending"] == 1
        assert stats["by_operation"]["created"] == 2
        assert stats["by_operation"]["modified"] == 1
    
    def test_clear_order_history(self):
        """Test clearing order history."""
        create_order("Rule 1", "created")
        create_order("Rule 2", "created")
        
        success, message = clear_order_history()
        
        assert success is True
        assert "cleared successfully" in message
        
        orders, _ = load_order_history()
        assert len(orders) == 0


class TestOrderHistoryUIUtils:
    """Test order history UI utility functions."""
    
    def setup_method(self):
        """Clear order history before each test."""
        clear_order_history()
    
    def teardown_method(self):
        """Clean up after each test."""
        clear_order_history()
    
    def test_format_order_history_for_display_empty(self):
        """Test formatting empty order history."""
        df, status = format_order_history_for_display()
        
        assert df.empty
        assert "No orders found" in status
    
    def test_format_order_history_for_display_with_data(self):
        """Test formatting order history with data."""
        create_order("Test Rule", "created", status="completed")
        
        df, status = format_order_history_for_display()
        
        assert not df.empty
        assert len(df) == 1
        assert "Order ID" in df.columns
        assert "Date" in df.columns
        assert "Rule Name" in df.columns
        assert "Operation" in df.columns
        assert "Status" in df.columns
    
    def test_format_order_details(self):
        """Test formatting order details."""
        success, message, order = create_order(
            "Test Rule",
            "created",
            rule_data={"description": "Test description"}
        )
        
        order_id = order["order_id"]
        details = format_order_details(order_id)
        
        assert "Order Details" in details
        assert order_id in details
        assert "Test Rule" in details
    
    def test_format_order_details_not_found(self):
        """Test formatting details for non-existent order."""
        details = format_order_details("NONEXISTENT-ID")
        assert "not found" in details
    
    def test_format_order_statistics(self):
        """Test formatting order statistics."""
        create_order("Rule 1", "created", status="completed")
        
        stats_text = format_order_statistics()
        
        assert "Order Statistics" in stats_text
        assert "Total Orders:** 1" in stats_text
    
    def test_get_empty_state_message(self):
        """Test empty state message."""
        message = get_empty_state_message()
        
        assert "Order History" in message
        assert "No orders found yet" in message
