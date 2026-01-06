from database import db
from typing import List, Optional, Dict, Any
from datetime import date, datetime

class HolidayService:
    @staticmethod
    def create_holiday(holiday_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new holiday"""
        try:
            # Check if holiday already exists for the same date and branch
            existing_holiday = HolidayService.get_holiday_by_date_and_branch(
                holiday_data['holiday_date'], 
                holiday_data.get('branch_id')
            )
            
            if existing_holiday:
                raise ValueError(f"Holiday already exists for date {holiday_data['holiday_date']} and branch {holiday_data.get('branch_id', 'All Branches')}")
            
            # Insert new holiday
            # Use status_id directly from holiday_data (default to 1 if not provided)
            if 'status_id' not in holiday_data:
                holiday_data['status_id'] = 1
            query = """
                INSERT INTO att_holiday_calendar 
                (holiday_name, holiday_date, holiday_type, branch_id, description, status_id)
                VALUES (%(holiday_name)s, %(holiday_date)s, %(holiday_type)s, %(branch_id)s, %(description)s, %(status_id)s)
            """
            
            holiday_id = db.execute_insert(query, holiday_data)
            
            # Get the created holiday
            return HolidayService.get_holiday_by_id(holiday_id)
            
        except Exception as e:
            print(f"Error creating holiday: {e}")
            raise e

    @staticmethod
    def get_holiday_by_id(holiday_id: int) -> Optional[Dict[str, Any]]:
        """Get holiday by ID"""
        try:
            query = """
                SELECT 
                    hc.holiday_id,
                    hc.holiday_name,
                    hc.holiday_date,
                    hc.holiday_type,
                    hc.branch_id,
                    hc.description,
                    hc.status_id,
                    hc.created_at,
                    hc.updated_at,
                    b.branch_name,
                    c.company_name
                FROM att_holiday_calendar hc
                LEFT JOIN branches b ON hc.branch_id = b.branch_id
                LEFT JOIN companies c ON b.company_id = c.company_id
                WHERE hc.holiday_id = %s
            """
            return db.execute_query_one(query, (holiday_id,))
        except Exception as e:
            print(f"Error getting holiday by ID: {e}")
            return None

    @staticmethod
    def get_holiday_by_date_and_branch(holiday_date: date, branch_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Get holiday by date and branch"""
        try:
            query = """
                SELECT 
                    hc.holiday_id,
                    hc.holiday_name,
                    hc.holiday_date,
                    hc.holiday_type,
                    hc.branch_id,
                    hc.description,
                    hc.status_id,
                    hc.created_at,
                    hc.updated_at,
                    b.branch_name,
                    c.company_name
                FROM att_holiday_calendar hc
                LEFT JOIN branches b ON hc.branch_id = b.branch_id
                LEFT JOIN companies c ON b.company_id = c.company_id
                WHERE hc.holiday_date = %s AND (hc.branch_id = %s OR (hc.branch_id IS NULL AND %s IS NULL))
            """
            return db.execute_query_one(query, (holiday_date, branch_id, branch_id))
        except Exception as e:
            print(f"Error getting holiday by date and branch: {e}")
            return None

    @staticmethod
    def get_all_holidays(active_only: bool = False, branch_id: Optional[int] = None, year: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all holidays with optional filters"""
        try:
            where_conditions = []
            params = []
            
            if active_only:
                where_conditions.append("hc.status_id = %s")
                params.append(1)
            
            if branch_id is not None:
                where_conditions.append("(hc.branch_id = %s OR hc.branch_id IS NULL)")
                params.append(branch_id)
            
            if year is not None:
                where_conditions.append("YEAR(hc.holiday_date) = %s")
                params.append(year)
            
            where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
            
            query = f"""
                SELECT 
                    hc.holiday_id,
                    hc.holiday_name,
                    hc.holiday_date,
                    hc.holiday_type,
                    hc.branch_id,
                    hc.description,
                    hc.status_id,
                    hc.created_at,
                    hc.updated_at,
                    b.branch_name,
                    c.company_name
                FROM att_holiday_calendar hc
                LEFT JOIN branches b ON hc.branch_id = b.branch_id
                LEFT JOIN companies c ON b.company_id = c.company_id
                WHERE {where_clause}
                ORDER BY hc.holiday_date ASC
            """
            
            return db.execute_query_all(query, params)
        except Exception as e:
            print(f"Error getting all holidays: {e}")
            return []

    @staticmethod
    def update_holiday(holiday_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a holiday"""
        try:
            # Check if holiday exists
            if not HolidayService.check_holiday_exists(holiday_id):
                raise ValueError(f"Holiday with ID {holiday_id} not found")
            
            # Check for conflicts if date or branch is being updated
            if 'holiday_date' in update_data or 'branch_id' in update_data:
                # Get current holiday data
                current_holiday = HolidayService.get_holiday_by_id(holiday_id)
                if not current_holiday:
                    raise ValueError(f"Holiday with ID {holiday_id} not found")
                
                new_date = update_data.get('holiday_date', current_holiday['holiday_date'])
                new_branch_id = update_data.get('branch_id', current_holiday['branch_id'])
                
                # Check for conflicts with other holidays
                existing_holiday = HolidayService.get_holiday_by_date_and_branch(new_date, new_branch_id)
                if existing_holiday and existing_holiday['holiday_id'] != holiday_id:
                    raise ValueError(f"Holiday already exists for date {new_date} and branch {new_branch_id or 'All Branches'}")
            
            # Build update query
            set_clauses = []
            params = []
            
            for field, value in update_data.items():
                if value is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)
            
            if not set_clauses:
                raise ValueError("No fields to update")
            
            params.append(holiday_id)
            query = f"UPDATE att_holiday_calendar SET {', '.join(set_clauses)} WHERE holiday_id = %s"
            
            db.execute_update(query, params)
            
            # Get updated holiday
            return HolidayService.get_holiday_by_id(holiday_id)
            
        except Exception as e:
            print(f"Error updating holiday: {e}")
            raise e

    @staticmethod
    def delete_holiday(holiday_id: int) -> bool:
        """Soft delete a holiday (set status_id to 2 - Inactive)"""
        try:
            if not HolidayService.check_holiday_exists(holiday_id):
                raise ValueError(f"Holiday with ID {holiday_id} not found")
            
            query = "UPDATE att_holiday_calendar SET status_id = %s WHERE holiday_id = %s"
            db.execute_update(query, (2, holiday_id))
            return True
            
        except Exception as e:
            print(f"Error deleting holiday: {e}")
            raise e

    @staticmethod
    def hard_delete_holiday(holiday_id: int) -> bool:
        """Permanently delete a holiday"""
        try:
            if not HolidayService.check_holiday_exists(holiday_id):
                raise ValueError(f"Holiday with ID {holiday_id} not found")
            
            query = "DELETE FROM att_holiday_calendar WHERE holiday_id = %s"
            db.execute_update(query, (holiday_id,))
            return True
            
        except Exception as e:
            print(f"Error hard deleting holiday: {e}")
            raise e

    @staticmethod
    def check_holiday_exists(holiday_id: int) -> bool:
        """Check if holiday exists"""
        try:
            query = "SELECT 1 FROM att_holiday_calendar WHERE holiday_id = %s"
            result = db.execute_query_one(query, (holiday_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking holiday existence: {e}")
            return False

    @staticmethod
    def get_branches() -> List[Dict[str, Any]]:
        """Get all active branches"""
        try:
            query = """
                SELECT b.branch_id, b.branch_name as name, b.company_id, c.company_name
                FROM branches b
                JOIN companies c ON b.company_id = c.company_id
                WHERE b.status_id = 1
                ORDER BY c.company_name, b.branch_name
            """
            return db.execute_query_all(query)
        except Exception as e:
            print(f"Error getting branches: {e}")
            return []

