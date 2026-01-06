from database import db
from typing import Dict, Any, List, Optional
from datetime import datetime

class ShiftService:
    @staticmethod
    def create_shift(shift_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new shift"""
        try:
            query = """
                INSERT INTO att_shifts (shift_name, start_time, end_time, break_duration, grace_time_minutes, status_id, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            shift_id = db.execute_insert(query, (
                shift_data['shift_name'],
                shift_data['start_time'],
                shift_data['end_time'],
                shift_data.get('break_duration', 0),
                shift_data.get('grace_time_minutes', 0),
                shift_data.get('status_id', 1),
                datetime.utcnow()
            ))
            
            return ShiftService.get_shift_by_id(shift_id)
            
        except Exception as e:
            print(f"Error creating shift: {e}")
            raise e

    @staticmethod
    def get_shift_by_id(shift_id: int) -> Optional[Dict[str, Any]]:
        """Get shift by ID"""
        try:
            query = "SELECT * FROM att_shifts WHERE shift_id = %s"
            return db.execute_query_one(query, (shift_id,))
        except Exception as e:
            print(f"Error getting shift by ID: {e}")
            return None

    @staticmethod
    def get_all_shifts(active_only: bool = False) -> List[Dict[str, Any]]:
        """Get all shifts with optional filters"""
        try:
            where_conditions = []
            params = []
            
            if active_only:
                where_conditions.append("is_active = %s")
                params.append(True)
            
            where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
            
            query = f"""
                SELECT * FROM att_shifts
                WHERE {where_clause}
                ORDER BY start_time ASC
            """
            
            return db.execute_query_all(query, params)
        except Exception as e:
            print(f"Error getting all shifts: {e}")
            return []

    @staticmethod
    def update_shift(shift_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a shift"""
        try:
            # Check if shift exists
            if not ShiftService.check_shift_exists(shift_id):
                raise ValueError(f"Shift with ID {shift_id} not found")
            
            # Build update query
            set_clauses = []
            params = []
            
            for field, value in update_data.items():
                if value is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)
            
            if not set_clauses:
                raise ValueError("No fields to update")
            
            params.append(shift_id)
            query = f"UPDATE att_shifts SET {', '.join(set_clauses)} WHERE shift_id = %s"
            
            db.execute_update(query, params)
            
            # Get updated shift
            return ShiftService.get_shift_by_id(shift_id)
            
        except Exception as e:
            print(f"Error updating shift: {e}")
            raise e

    @staticmethod
    def delete_shift(shift_id: int) -> bool:
        """Soft delete a shift (set status_id to 3 = Archived)"""
        try:
            if not ShiftService.check_shift_exists(shift_id):
                raise ValueError(f"Shift with ID {shift_id} not found")
            
            query = "UPDATE att_shifts SET status_id = %s WHERE shift_id = %s"
            db.execute_update(query, (3, shift_id))
            return True
            
        except Exception as e:
            print(f"Error deleting shift: {e}")
            raise e

    @staticmethod
    def hard_delete_shift(shift_id: int) -> bool:
        """Hard delete a shift from database"""
        try:
            if not ShiftService.check_shift_exists(shift_id):
                raise ValueError(f"Shift with ID {shift_id} not found")
            
            query = "DELETE FROM att_shifts WHERE shift_id = %s"
            db.execute_update(query, (shift_id,))
            return True
            
        except Exception as e:
            print(f"Error hard deleting shift: {e}")
            raise e

    @staticmethod
    def check_shift_exists(shift_id: int) -> bool:
        """Check if shift exists"""
        try:
            query = "SELECT 1 FROM att_shifts WHERE shift_id = %s"
            result = db.execute_query_one(query, (shift_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking shift existence: {e}")
            return False
