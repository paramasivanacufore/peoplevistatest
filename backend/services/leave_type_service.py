from database import db
from typing import List, Optional, Dict, Any

class LeaveTypeService:
    @staticmethod
    def create_leave_type(leave_type_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new leave type"""
        try:
            # Check if leave type already exists
            existing_leave_type = LeaveTypeService.get_leave_type_by_name(leave_type_data['leave_type_name'])
            
            if existing_leave_type:
                raise ValueError(f"Leave type '{leave_type_data['leave_type_name']}' already exists")
            
            # Insert new leave type (status_id should already be converted in router)
            query = """
                INSERT INTO att_leave_type 
                (leave_type_name, description, status_id)
                VALUES (%s, %s, %s)
            """
            
            params = (
                leave_type_data['leave_type_name'],
                leave_type_data.get('description'),
                leave_type_data.get('status_id', 1)  # Default to 1 (Active) if not provided
            )
            
            leave_type_id = db.execute_insert(query, params)
            
            if not leave_type_id:
                raise Exception("Failed to create leave type: No ID returned from insert")
            
            # Get the created leave type
            created_leave_type = LeaveTypeService.get_leave_type_by_id(leave_type_id)
            if not created_leave_type:
                raise Exception(f"Failed to retrieve created leave type with ID {leave_type_id}")
            
            return created_leave_type
            
        except ValueError:
            # Re-raise ValueError as-is (for duplicate names, etc.)
            raise
        except Exception as e:
            print(f"Error creating leave type: {e}")
            print(f"Query: {query}")
            print(f"Params: {params}")
            import traceback
            traceback.print_exc()
            raise e

    @staticmethod
    def get_leave_type_by_id(leave_type_id: int) -> Optional[Dict[str, Any]]:
        """Get leave type by ID"""
        try:
            query = """
                SELECT *
                FROM att_leave_type
                WHERE leave_type_id = %s
            """
            result = db.execute_query_one(query, (leave_type_id,))
            if result:
                # Convert status_id to is_active for frontend compatibility
                result['is_active'] = result.get('status_id', 1) == 1
            return result
        except Exception as e:
            print(f"Error getting leave type by ID: {e}")
            return None

    @staticmethod
    def get_leave_type_by_name(leave_type_name: str) -> Optional[Dict[str, Any]]:
        """Get leave type by name"""
        try:
            query = """
                SELECT *
                FROM att_leave_type
                WHERE leave_type_name = %s
            """
            result = db.execute_query_one(query, (leave_type_name,))
            if result:
                # Convert status_id to is_active for frontend compatibility
                result['is_active'] = result.get('status_id', 1) == 1
            return result
        except Exception as e:
            print(f"Error getting leave type by name: {e}")
            return None

    @staticmethod
    def get_all_leave_types(active_only: bool = False) -> List[Dict[str, Any]]:
        """Get all leave types with optional filters"""
        try:
            where_clause = "WHERE status_id = %s" if active_only else ""
            params = [1] if active_only else []  # 1 = Active
            
            query = f"""
                SELECT *
                FROM att_leave_type
                {where_clause}
                ORDER BY leave_type_name ASC
            """
            
            results = db.execute_query_all(query, params)
            # Convert status_id to is_active for frontend compatibility
            for result in results:
                result['is_active'] = result.get('status_id', 1) == 1
            return results
        except Exception as e:
            print(f"Error getting all leave types: {e}")
            return []

    @staticmethod
    def update_leave_type(leave_type_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a leave type"""
        try:
            # Check if leave type exists
            if not LeaveTypeService.check_leave_type_exists(leave_type_id):
                raise ValueError(f"Leave type with ID {leave_type_id} not found")
            
            # Check for duplicate name if updating name
            if 'leave_type_name' in update_data:
                existing_leave_type = LeaveTypeService.get_leave_type_by_name(update_data['leave_type_name'])
                if existing_leave_type and existing_leave_type['leave_type_id'] != leave_type_id:
                    raise ValueError(f"Leave type '{update_data['leave_type_name']}' already exists")
            
            # Build update query
            set_clauses = []
            params = []
            
            for field, value in update_data.items():
                if value is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)
            
            if not set_clauses:
                raise ValueError("No fields to update")
            
            params.append(leave_type_id)
            query = f"UPDATE att_leave_type SET {', '.join(set_clauses)} WHERE leave_type_id = %s"
            
            db.execute_update(query, params)
            
            # Get updated leave type
            return LeaveTypeService.get_leave_type_by_id(leave_type_id)
            
        except Exception as e:
            print(f"Error updating leave type: {e}")
            raise e

    @staticmethod
    def delete_leave_type(leave_type_id: int) -> bool:
        """Soft delete a leave type (set is_active to False)"""
        try:
            if not LeaveTypeService.check_leave_type_exists(leave_type_id):
                raise ValueError(f"Leave type with ID {leave_type_id} not found")
            
            query = "UPDATE att_leave_type SET status_id = %s WHERE leave_type_id = %s"
            db.execute_update(query, (2, leave_type_id))  # 2 = Inactive
            return True
            
        except Exception as e:
            print(f"Error deleting leave type: {e}")
            raise e

    @staticmethod
    def hard_delete_leave_type(leave_type_id: int) -> bool:
        """Permanently delete a leave type"""
        try:
            if not LeaveTypeService.check_leave_type_exists(leave_type_id):
                raise ValueError(f"Leave type with ID {leave_type_id} not found")
            
            query = "DELETE FROM att_leave_type WHERE leave_type_id = %s"
            db.execute_update(query, (leave_type_id,))
            return True
            
        except Exception as e:
            print(f"Error hard deleting leave type: {e}")
            raise e

    @staticmethod
    def check_leave_type_exists(leave_type_id: int) -> bool:
        """Check if leave type exists"""
        try:
            query = "SELECT 1 FROM att_leave_type WHERE leave_type_id = %s"
            result = db.execute_query_one(query, (leave_type_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking leave type existence: {e}")
            return False

