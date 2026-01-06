from database import db
from typing import List, Optional, Dict, Any
from datetime import date, datetime

class LeaveRequestService:
    @staticmethod
    def create_leave_request(leave_request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new leave request"""
        try:
            # Validate dates
            if leave_request_data['end_date'] < leave_request_data['start_date']:
                raise ValueError("End date must be after or equal to start date")
            
            # Insert new leave request
            query = """
                INSERT INTO att_leaves_request 
                (employee_id, leave_type_id, requested_to, start_date, end_date, request_date, status, comments)
                VALUES (%(employee_id)s, %(leave_type_id)s, %(requested_to)s, %(start_date)s, %(end_date)s, %(request_date)s, %(status)s, %(comments)s)
            """
            
            # Set default status if not provided
            if 'status' not in leave_request_data:
                leave_request_data['status'] = 'Pending'
            
            leave_id = db.execute_insert(query, leave_request_data)
            
            # Get the created leave request with related data
            return LeaveRequestService.get_leave_request_by_id(leave_id)
            
        except Exception as e:
            print(f"Error creating leave request: {e}")
            raise e

    @staticmethod
    def get_leave_request_by_id(leave_id: int) -> Optional[Dict[str, Any]]:
        """Get leave request by ID with related employee and leave type information"""
        try:
            query = """
                SELECT 
                    lr.*,
                    e1.first_name as employee_first_name,
                    e1.last_name as employee_last_name,
                    CONCAT(e1.first_name, ' ', e1.last_name) as employee_name,
                    lt.leave_type_name,
                    e2.first_name as requested_to_first_name,
                    e2.last_name as requested_to_last_name,
                    CONCAT(e2.first_name, ' ', e2.last_name) as requested_to_name,
                    e3.first_name as approved_by_first_name,
                    e3.last_name as approved_by_last_name,
                    CONCAT(e3.first_name, ' ', e3.last_name) as approved_by_name
                FROM att_leaves_request lr
                LEFT JOIN employees e1 ON lr.employee_id = e1.employee_id
                LEFT JOIN leave_type lt ON lr.leave_type_id = lt.leave_type_id
                LEFT JOIN employees e2 ON lr.requested_to = e2.employee_id
                LEFT JOIN employees e3 ON lr.approved_by = e3.employee_id
                WHERE lr.leave_id = %s
            """
            return db.execute_query_one(query, (leave_id,))
        except Exception as e:
            print(f"Error getting leave request by ID: {e}")
            return None

    @staticmethod
    def get_all_leave_requests(
        employee_id: Optional[int] = None,
        requested_to: Optional[int] = None,
        status: Optional[str] = None,
        leave_type_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get all leave requests with optional filters"""
        try:
            where_clauses = []
            params = []
            
            if employee_id is not None:
                where_clauses.append("lr.employee_id = %s")
                params.append(employee_id)
            
            if requested_to is not None:
                where_clauses.append("lr.requested_to = %s")
                params.append(requested_to)
            
            if status:
                where_clauses.append("lr.status = %s")
                params.append(status)
            
            if leave_type_id is not None:
                where_clauses.append("lr.leave_type_id = %s")
                params.append(leave_type_id)
            
            where_clause = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
            
            query = f"""
                SELECT 
                    lr.*,
                    e1.first_name as employee_first_name,
                    e1.last_name as employee_last_name,
                    CONCAT(e1.first_name, ' ', e1.last_name) as employee_name,
                    lt.leave_type_name,
                    e2.first_name as requested_to_first_name,
                    e2.last_name as requested_to_last_name,
                    CONCAT(e2.first_name, ' ', e2.last_name) as requested_to_name,
                    e3.first_name as approved_by_first_name,
                    e3.last_name as approved_by_last_name,
                    CONCAT(e3.first_name, ' ', e3.last_name) as approved_by_name
                FROM att_leaves_request lr
                LEFT JOIN employees e1 ON lr.employee_id = e1.employee_id
                LEFT JOIN leave_type lt ON lr.leave_type_id = lt.leave_type_id
                LEFT JOIN employees e2 ON lr.requested_to = e2.employee_id
                LEFT JOIN employees e3 ON lr.approved_by = e3.employee_id
                {where_clause}
                ORDER BY lr.request_date DESC, lr.created_at DESC
            """
            
            return db.execute_query_all(query, params)
        except Exception as e:
            print(f"Error getting all leave requests: {e}")
            return []

    @staticmethod
    def update_leave_request(leave_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a leave request"""
        try:
            # Check if leave request exists
            if not LeaveRequestService.check_leave_request_exists(leave_id):
                raise ValueError(f"Leave request with ID {leave_id} not found")
            
            # If status is being updated to Approved or Rejected, set approved_by and approved_date
            if 'status' in update_data:
                status = update_data['status']
                if status in ['Approved', 'Rejected']:
                    # approved_by should be provided in update_data
                    if 'approved_by' in update_data and update_data['approved_by']:
                        update_data['approved_date'] = date.today()
                    else:
                        raise ValueError("approved_by is required when approving or rejecting a leave request")
                elif status == 'Cancelled':
                    # When cancelling, clear approval info
                    update_data['approved_by'] = None
                    update_data['approved_date'] = None
            
            # Build update query
            set_clauses = []
            params = []
            
            for field, value in update_data.items():
                if value is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)
            
            if not set_clauses:
                raise ValueError("No fields to update")
            
            params.append(leave_id)
            query = f"UPDATE att_leaves_request SET {', '.join(set_clauses)} WHERE leave_id = %s"
            
            db.execute_update(query, params)
            
            # Get updated leave request
            return LeaveRequestService.get_leave_request_by_id(leave_id)
            
        except Exception as e:
            print(f"Error updating leave request: {e}")
            raise e

    @staticmethod
    def delete_leave_request(leave_id: int) -> bool:
        """Delete a leave request"""
        try:
            if not LeaveRequestService.check_leave_request_exists(leave_id):
                raise ValueError(f"Leave request with ID {leave_id} not found")
            
            # Only allow deletion if status is Pending or Cancelled
            leave_request = LeaveRequestService.get_leave_request_by_id(leave_id)
            if leave_request and leave_request['status'] not in ['Pending', 'Cancelled']:
                raise ValueError("Cannot delete leave request that has been approved or rejected")
            
            query = "DELETE FROM att_leaves_request WHERE leave_id = %s"
            db.execute_update(query, (leave_id,))
            return True
            
        except Exception as e:
            print(f"Error deleting leave request: {e}")
            raise e

    @staticmethod
    def check_leave_request_exists(leave_id: int) -> bool:
        """Check if leave request exists"""
        try:
            query = "SELECT 1 FROM att_leaves_request WHERE leave_id = %s"
            result = db.execute_query_one(query, (leave_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking leave request existence: {e}")
            return False

    @staticmethod
    def approve_leave_request(leave_id: int, approved_by: int, comments: Optional[str] = None) -> Dict[str, Any]:
        """Approve a leave request"""
        try:
            update_data = {
                'status': 'Approved',
                'approved_by': approved_by,
                'approved_date': date.today()
            }
            if comments:
                update_data['comments'] = comments
            
            return LeaveRequestService.update_leave_request(leave_id, update_data)
        except Exception as e:
            print(f"Error approving leave request: {e}")
            raise e

    @staticmethod
    def reject_leave_request(leave_id: int, approved_by: int, comments: Optional[str] = None) -> Dict[str, Any]:
        """Reject a leave request"""
        try:
            update_data = {
                'status': 'Rejected',
                'approved_by': approved_by,
                'approved_date': date.today()
            }
            if comments:
                update_data['comments'] = comments
            
            return LeaveRequestService.update_leave_request(leave_id, update_data)
        except Exception as e:
            print(f"Error rejecting leave request: {e}")
            raise e

    @staticmethod
    def cancel_leave_request(leave_id: int) -> Dict[str, Any]:
        """Cancel a leave request (only if status is Pending)"""
        try:
            leave_request = LeaveRequestService.get_leave_request_by_id(leave_id)
            if not leave_request:
                raise ValueError(f"Leave request with ID {leave_id} not found")
            
            if leave_request['status'] != 'Pending':
                raise ValueError("Can only cancel leave requests with Pending status")
            
            update_data = {
                'status': 'Cancelled'
            }
            
            return LeaveRequestService.update_leave_request(leave_id, update_data)
        except Exception as e:
            print(f"Error cancelling leave request: {e}")
            raise e


