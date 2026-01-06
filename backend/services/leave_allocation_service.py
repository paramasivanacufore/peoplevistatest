from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime

class LeaveAllocationService:
    @staticmethod
    def create_rule(rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new leave allocation rule"""
        try:
            # Check if rule already exists for the same leave type and allocation period
            existing_rule = LeaveAllocationService.get_rule_by_leave_type_and_period(
                rule_data['leave_type_id'], 
                rule_data['allocation_period']
            )
            
            if existing_rule:
                # Get leave type name for better error message
                leave_type_name = existing_rule.get('leave_type_name', f"leave type ID {rule_data['leave_type_id']}")
                raise ValueError(f"A rule already exists for '{leave_type_name}' with allocation period '{rule_data['allocation_period']}'. Please choose a different combination or edit the existing rule.")
            
            # Insert new rule
            query = """
                INSERT INTO leave_allocation_rules 
                (leave_type_id, allocation_period, days_allocated, carry_forward, max_carry_forward_days, is_active)
                VALUES (%(leave_type_id)s, %(allocation_period)s, %(days_allocated)s, %(carry_forward)s, %(max_carry_forward_days)s, %(is_active)s)
            """
            
            rule_id = db.execute_insert(query, rule_data)
            
            # Get the created rule
            return LeaveAllocationService.get_rule_by_id(rule_id)
            
        except Exception as e:
            print(f"Error creating leave allocation rule: {e}")
            raise e

    @staticmethod
    def get_rule_by_id(rule_id: int) -> Optional[Dict[str, Any]]:
        """Get a leave allocation rule by ID"""
        try:
            query = """
                SELECT lar.*, lt.leave_type_name, lt.description as leave_type_description
                FROM leave_allocation_rules lar
                JOIN leave_type lt ON lar.leave_type_id = lt.leave_type_id
                WHERE lar.rule_id = %s
            """
            
            result = db.execute_query_one(query, (rule_id,))
            return result
            
        except Exception as e:
            print(f"Error getting leave allocation rule by ID: {e}")
            return None

    @staticmethod
    def get_rule_by_leave_type_and_period(leave_type_id: int, allocation_period: str) -> Optional[Dict[str, Any]]:
        """Get a rule by leave type and allocation period"""
        try:
            query = """
                SELECT lar.*, lt.leave_type_name, lt.description as leave_type_description
                FROM leave_allocation_rules lar
                JOIN leave_type lt ON lar.leave_type_id = lt.leave_type_id
                WHERE lar.leave_type_id = %s AND lar.allocation_period = %s
            """
            
            result = db.execute_query_one(query, (leave_type_id, allocation_period))
            return result
            
        except Exception as e:
            print(f"Error getting rule by leave type and period: {e}")
            return None

    @staticmethod
    def get_all_rules(active_only: bool = False, leave_type_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all leave allocation rules with optional filters"""
        try:
            where_conditions = []
            params = []
            
            if active_only:
                where_conditions.append("lar.is_active = %s")
                params.append(True)
            
            if leave_type_id is not None:
                where_conditions.append("lar.leave_type_id = %s")
                params.append(leave_type_id)
            
            where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
            
            query = f"""
                SELECT lar.*, lt.leave_type_name, lt.description as leave_type_description
                FROM leave_allocation_rules lar
                JOIN leave_type lt ON lar.leave_type_id = lt.leave_type_id
                WHERE {where_clause}
                ORDER BY lt.leave_type_name ASC, lar.allocation_period ASC
            """
            
            return db.execute_query_all(query, params)
        except Exception as e:
            print(f"Error getting all leave allocation rules: {e}")
            return []

    @staticmethod
    def update_rule(rule_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a leave allocation rule"""
        try:
            # Check if rule exists
            existing_rule = LeaveAllocationService.get_rule_by_id(rule_id)
            if not existing_rule:
                raise ValueError(f"Leave allocation rule with ID {rule_id} not found")
            
            # Check for conflicts if updating leave_type_id or allocation_period
            if 'leave_type_id' in update_data or 'allocation_period' in update_data:
                new_leave_type_id = update_data.get('leave_type_id', existing_rule['leave_type_id'])
                new_allocation_period = update_data.get('allocation_period', existing_rule['allocation_period'])
                
                conflicting_rule = LeaveAllocationService.get_rule_by_leave_type_and_period(
                    new_leave_type_id, new_allocation_period
                )
                
                if conflicting_rule and conflicting_rule['rule_id'] != rule_id:
                    # Get leave type name for better error message
                    leave_type_name = conflicting_rule.get('leave_type_name', f"leave type ID {new_leave_type_id}")
                    raise ValueError(f"A rule already exists for '{leave_type_name}' with allocation period '{new_allocation_period}'. Please choose a different combination or edit the existing rule.")
            
            # Build update query dynamically
            set_clauses = []
            params = []
            
            for field, value in update_data.items():
                if value is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)
            
            if not set_clauses:
                raise ValueError("No fields to update")
            
            params.append(rule_id)
            
            query = f"""
                UPDATE leave_allocation_rules 
                SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP
                WHERE rule_id = %s
            """
            
            db.execute_update(query, params)
            
            # Get the updated rule
            return LeaveAllocationService.get_rule_by_id(rule_id)
            
        except Exception as e:
            print(f"Error updating leave allocation rule: {e}")
            raise e

    @staticmethod
    def delete_rule(rule_id: int) -> bool:
        """Soft delete a leave allocation rule (set is_active to False)"""
        try:
            query = """
                UPDATE leave_allocation_rules 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE rule_id = %s
            """
            
            affected_rows = db.execute_update(query, (rule_id,))
            return affected_rows > 0
            
        except Exception as e:
            print(f"Error deleting leave allocation rule: {e}")
            return False

    @staticmethod
    def hard_delete_rule(rule_id: int) -> bool:
        """Permanently delete a leave allocation rule"""
        try:
            query = "DELETE FROM leave_allocation_rules WHERE rule_id = %s"
            
            affected_rows = db.execute_update(query, (rule_id,))
            return affected_rows > 0
            
        except Exception as e:
            print(f"Error hard deleting leave allocation rule: {e}")
            return False

    @staticmethod
    def check_rule_exists(rule_id: int) -> bool:
        """Check if a leave allocation rule exists"""
        try:
            query = "SELECT 1 FROM leave_allocation_rules WHERE rule_id = %s"
            result = db.execute_query_one(query, (rule_id,))
            return result is not None
            
        except Exception as e:
            print(f"Error checking if rule exists: {e}")
            return False

    @staticmethod
    def get_leave_types() -> List[Dict[str, Any]]:
        """Get all active leave types"""
        try:
            query = """
                SELECT leave_type_id, leave_type_name, description, is_active, created_at, updated_at
                FROM leave_type
                WHERE is_active = TRUE
                ORDER BY leave_type_name ASC
            """
            
            return db.execute_query_all(query)
        except Exception as e:
            print(f"Error getting leave types: {e}")
            return []

