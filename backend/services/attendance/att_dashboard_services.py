from typing import Optional, List, Dict
from datetime import date, timedelta
from fastapi import HTTPException
from database import db
from models.attendance_models import (
    DashboardOverview,
    Holiday,
    WeeklyAttendanceData,
    HeatmapDay
)


class AttendanceDashboardService:
    """Service layer for attendance dashboard operations"""
    
    @staticmethod
    def _validate_pagination(page: int, limit: int):
        if page < 1:
            raise HTTPException(status_code=422, detail="page must be >= 1")
        if limit < 1:
            raise HTTPException(status_code=422, detail="limit must be >= 1")
    
    @staticmethod
    def get_dashboard_overview() -> DashboardOverview:
        """Get dashboard overview statistics"""
        today = date.today()
        first_day_of_month = today.replace(day=1)
        
        # Total active employees
        total_employees_query = """
            SELECT COUNT(*) as count 
            FROM emp_employee 
            WHERE status_id = 1
        """
        total_employees_result = db.execute_query_one(total_employees_query)
        total_employees = total_employees_result['count'] if total_employees_result else 0
        
        # Present today (employees with attendance status = 'Present')
        present_today_query = """
            SELECT COUNT(DISTINCT employee_id) as count 
            FROM att_daily_attendance 
            WHERE date = %s AND status = 'Present'
        """
        present_today_result = db.execute_query_one(present_today_query, (today,))
        present_today = present_today_result['count'] if present_today_result else 0
        
        # On leave today - check att_daily_attendance table for status = 'Leave' (same as employees list)
        on_leave_query = """
            SELECT COUNT(DISTINCT employee_id) as count 
            FROM att_daily_attendance 
            WHERE date = %s AND status = 'Leave'
        """
        on_leave_result = db.execute_query_one(on_leave_query, (today,))
        on_leave_today = on_leave_result['count'] if on_leave_result else 0
        
        # Absent today - check att_daily_attendance table for status = 'Absent'
        absent_query = """
            SELECT COUNT(DISTINCT employee_id) as count 
            FROM att_daily_attendance 
            WHERE date = %s AND status = 'Absent'
        """
        absent_result = db.execute_query_one(absent_query, (today,))
        absent_today = absent_result['count'] if absent_result else 0
        
        # Pending leave approvals
        try:
            pending_leave_query = """
                SELECT COUNT(*) as count 
                FROM att_leaves_request 
                WHERE status = 'Pending'
            """
            pending_leave_result = db.execute_query_one(pending_leave_query)
            pending_leave_approvals = pending_leave_result['count'] if pending_leave_result else 0
        except Exception as e:
            print(f"Error fetching pending leave approvals: {e}")
            pending_leave_approvals = 0
        
        # Pending regularization approvals
        try:
            pending_regularization_query = """
                SELECT COUNT(*) as count 
                FROM att_regularization_requests 
                WHERE status = 'Pending'
            """
            pending_regularization_result = db.execute_query_one(pending_regularization_query)
            pending_regularization_approvals = pending_regularization_result['count'] if pending_regularization_result else 0
        except Exception as e:
            print(f"Error fetching pending regularization approvals: {e}")
            pending_regularization_approvals = 0
        
        # Pending compensatory approvals - Check if there's a compensatory leave type or separate table
        # For now, checking for compensatory leave type in leave requests
        try:
            pending_compensatory_query = """
                SELECT COUNT(*) as count 
                FROM att_leaves_request lr
                INNER JOIN att_leave_type lt ON lr.leave_type_id = lt.leave_type_id
                WHERE lr.status = 'Pending' 
                AND (lt.leave_type_name LIKE '%compensatory%' OR lt.leave_type_name LIKE '%comp-off%' OR lt.leave_type_name LIKE '%comp%')
            """
            pending_compensatory_result = db.execute_query_one(pending_compensatory_query)
            pending_compensatory_approvals = pending_compensatory_result['count'] if pending_compensatory_result else 0
        except Exception as e:
            print(f"Error fetching pending compensatory approvals: {e}")
        pending_compensatory_approvals = 0
        
        # Employees added this month
        employees_added_query = """
            SELECT COUNT(*) as count 
            FROM emp_employee 
            WHERE DATE(created_at) >= %s AND status_id = 1
        """
        employees_added_result = db.execute_query_one(employees_added_query, (first_day_of_month,))
        employees_added_this_month = employees_added_result['count'] if employees_added_result else 0
        
        return DashboardOverview(
            totalEmployees=total_employees,
            presentToday=present_today,
            onLeaveToday=on_leave_today,
            absentToday=absent_today,
            pendingLeaveApprovals=pending_leave_approvals,
            pendingRegularizationApprovals=pending_regularization_approvals,
            pendingCompensatoryApprovals=pending_compensatory_approvals,
            employeesAddedThisMonth=employees_added_this_month
        )
    
    @staticmethod
    def get_holidays(year: Optional[int] = None) -> List[Dict]:
        """Get holidays for a specific year or all years"""
        if year:
            query = """
                SELECT holiday_id, holiday_name, holiday_date, holiday_type, description
                FROM att_holiday_calendar
                WHERE YEAR(holiday_date) = %s AND status_id = 1
                ORDER BY holiday_date
            """
            holidays_data = db.execute_query_all(query, (year,))
        else:
            query = """
                SELECT holiday_id, holiday_name, holiday_date, holiday_type, description
                FROM att_holiday_calendar
                WHERE status_id = 1
                ORDER BY holiday_date
            """
            holidays_data = db.execute_query_all(query)
        
        holidays = []
        for holiday in holidays_data:
            holiday_date = holiday.get('holiday_date')
            holidays.append({
                "holiday_id": holiday.get('holiday_id'),
                "name": holiday.get('holiday_name'),
                "date": holiday_date.isoformat() if holiday_date else None,
                "year": holiday_date.year if holiday_date else None,
                "holiday_type": holiday.get('holiday_type'),
                "description": holiday.get('description')
            })
        
        return holidays
    
    @staticmethod
    def get_weekly_attendance() -> List[Dict]:
        """Get weekly attendance data for the line graph"""
        today = date.today()
        # Get Monday of current week
        days_since_monday = today.weekday()
        monday = today - timedelta(days=days_since_monday)
        
        weekly_data = []
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        for i in range(7):
            current_date = monday + timedelta(days=i)
            day_name = days[i]
            
            # Count present employees for this day
            query = """
                SELECT COUNT(DISTINCT employee_id) as count 
                FROM att_daily_attendance 
                WHERE date = %s AND status = 'Present'
            """
            result = db.execute_query_one(query, (current_date,))
            count = result['count'] if result else 0
            
            weekly_data.append({
                "day": day_name,
                "value": count
            })
        
        return weekly_data
    
    @staticmethod
    def get_monthly_heatmap(year: int, month: int) -> List[Dict]:
        """Get monthly heatmap data for attendance"""
        # Get first and last day of the month
        first_day = date(year, month, 1)
        if month == 12:
            last_day = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day = date(year, month + 1, 1) - timedelta(days=1)
        
        # Get attendance data for the month
        query = """
            SELECT date, COUNT(DISTINCT employee_id) as attendance_count
            FROM att_daily_attendance
            WHERE date >= %s AND date <= %s AND status = 'Present'
            GROUP BY date
        """
        attendance_data = db.execute_query_all(query, (first_day, last_day))
        
        # Create a dictionary for quick lookup
        attendance_dict = {}
        for row in attendance_data:
            attendance_dict[row['date']] = row['attendance_count']
        
        # Generate heatmap data
        heatmap_data = []
        days_in_month = last_day.day
        
        # Get total employees for percentage calculation
        total_employees_query = """
            SELECT COUNT(*) as count 
            FROM emp_employee 
            WHERE status_id = 1
        """
        total_employees_result = db.execute_query_one(total_employees_query)
        total_employees = total_employees_result['count'] if total_employees_result else 1
        
        for day in range(1, days_in_month + 1):
            current_date = date(year, month, day)
            day_of_week = current_date.weekday()
            is_weekend = day_of_week >= 5  # Saturday = 5, Sunday = 6
            
            attendance_count = attendance_dict.get(current_date, 0)
            
            # Determine color based on attendance percentage
            if is_weekend:
                color = 'bg-gray-200'
            else:
                attendance_percentage = (attendance_count / total_employees) if total_employees > 0 else 0
                if attendance_percentage > 0.7:
                    color = 'bg-green-500'
                elif attendance_percentage > 0.4:
                    color = 'bg-[#011748]/60'
                else:
                    color = 'bg-orange-400'
            
            heatmap_data.append({
                "day": day,
                "color": color,
                "isWeekend": is_weekend,
                "attendance_count": attendance_count
            })
        
        return heatmap_data
    
    @staticmethod
    def get_departments() -> List[Dict]:
        """Get all departments"""
        query = """
            SELECT department_id, department_name, short_code
            FROM departments
            ORDER BY department_name
        """
        departments_data = db.execute_query_all(query)
        
        departments = []
        for dept in departments_data:
            departments.append({
                "department_id": dept.get('department_id'),
                "department_name": dept.get('department_name'),
                "short_code": dept.get('short_code')
            })
        
        return departments
    
    @staticmethod
    def get_employees_with_attendance(page: int = 1, limit: int = 10, search: Optional[str] = None, date_filter: Optional[date] = None, department_id: Optional[int] = None, department_ids: Optional[List[int]] = None, shift_id: Optional[int] = None, shift_ids: Optional[List[int]] = None, status_filter: Optional[str] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = 'asc') -> Dict:
        """Get employees with their daily attendance data (paginated)"""
        AttendanceDashboardService._validate_pagination(page, limit)
        if date_filter is None:
            date_filter = date.today()
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build search condition
        search_condition = ""
        search_params = []
        if search:
            # Search in full name (concatenated), email, department, and shift
            # This prevents partial matches like "amy" matching "Thomas"
            search_condition = """
                AND (CONCAT(e.first_name, ' ', e.last_name) LIKE %s 
                OR e.email LIKE %s
                OR d.department_name LIKE %s
                OR s.shift_name LIKE %s)
            """
            search_pattern = f"%{search}%"
            search_params = [search_pattern, search_pattern, search_pattern, search_pattern]
        
        # Build department filter condition (support both single and multiple)
        department_condition = ""
        department_params = []
        if department_ids and len(department_ids) > 0:
            placeholders = ','.join(['%s'] * len(department_ids))
            department_condition = f" AND e.department_id IN ({placeholders})"
            department_params = department_ids
        elif department_id:
            department_condition = " AND e.department_id = %s"
            department_params = [department_id]
        
        # Build shift filter condition (support both single and multiple)
        shift_condition = ""
        shift_params = []
        if shift_ids and len(shift_ids) > 0:
            placeholders = ','.join(['%s'] * len(shift_ids))
            shift_condition = f" AND esa.shift_id IN ({placeholders})"
            shift_params = shift_ids
        elif shift_id:
            shift_condition = " AND esa.shift_id = %s"
            shift_params = [shift_id]
        
        # Build status filter condition
        status_condition = ""
        status_params = []
        if status_filter:
            status_condition = " AND da.status = %s"
            status_params = [status_filter]
        
        # Build order by clause
        valid_sort_fields = {
            'employee_name': 'CONCAT(e.first_name, \' \', e.last_name)',
            'department': 'd.department_name',
            'shift': 's.shift_name',
            'status': 'da.status',
            'first_in_time': 'da.first_in_time',
            'last_out_time': 'da.last_out_time',
            'total_working_hours': 'da.total_working_hours',
            'employee_id': 'e.employee_id'
        }
        
        order_by_clause = "ORDER BY e.employee_id"  # Default
        if sort_by and sort_by in valid_sort_fields:
            sort_field = valid_sort_fields[sort_by]
            sort_direction = 'DESC' if sort_order and sort_order.lower() == 'desc' else 'ASC'
            order_by_clause = f"ORDER BY {sort_field} {sort_direction}"
        
        # Get total count
        count_query = f"""
            SELECT COUNT(DISTINCT e.employee_id) as total
            FROM emp_employee e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN att_emp_shift_assignments esa ON e.employee_id = esa.employee_id 
                AND (esa.effective_from <= %s AND (esa.effective_to IS NULL OR esa.effective_to >= %s))
            LEFT JOIN att_shifts s ON esa.shift_id = s.shift_id
            LEFT JOIN att_daily_attendance da ON e.employee_id = da.employee_id AND da.date = %s
            WHERE e.status_id = 1
            {search_condition}
            {department_condition}
            {shift_condition}
            {status_condition}
        """
        count_params = [date_filter, date_filter, date_filter] + (search_params if search else []) + department_params + shift_params + status_params
        total_result = db.execute_query_one(count_query, tuple(count_params) if count_params else None)
        total = total_result['total'] if total_result else 0
        
        # Get employees with attendance data
        query = f"""
            SELECT 
                e.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.employee_id as employee_code,
                d.department_name as department,
                s.shift_name as shift,
                da.date,
                da.status,
                da.first_in_time,
                da.last_out_time,
                da.total_working_hours
            FROM emp_employee e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN att_emp_shift_assignments esa ON e.employee_id = esa.employee_id 
                AND (esa.effective_from <= %s AND (esa.effective_to IS NULL OR esa.effective_to >= %s))
            LEFT JOIN att_shifts s ON esa.shift_id = s.shift_id
            LEFT JOIN att_daily_attendance da ON e.employee_id = da.employee_id AND da.date = %s
            WHERE e.status_id = 1
            {search_condition}
            {department_condition}
            {shift_condition}
            {status_condition}
            {order_by_clause}
            LIMIT %s OFFSET %s
        """
        
        query_params = [date_filter, date_filter, date_filter] + (search_params if search else []) + department_params + shift_params + status_params + [limit, offset]
        employees_data = db.execute_query_all(query, tuple(query_params))
        
        # Format the response
        employees = []
        for emp in employees_data:
            # Use the date from attendance record if available, otherwise use filter date
            attendance_date = emp.get('date')
            if attendance_date:
                # Handle date object or string
                if isinstance(attendance_date, date):
                    formatted_date = attendance_date.isoformat()
                elif isinstance(attendance_date, str):
                    formatted_date = attendance_date
                else:
                    # Try to convert to date and then to string
                    try:
                        formatted_date = attendance_date.isoformat() if hasattr(attendance_date, 'isoformat') else str(attendance_date)
                    except:
                        formatted_date = date_filter.isoformat()
            else:
                # If no attendance record, use the filter date
                formatted_date = date_filter.isoformat()
            
            employees.append({
                "employee_id": emp.get('employee_id'),
                "employee_name": emp.get('employee_name') or 'N/A',
                "employee_code": str(emp.get('employee_code', '')),
                "department": emp.get('department') or 'N/A',
                "shift": emp.get('shift') or 'N/A',
                "date": formatted_date,
                "status": emp.get('status') or 'Absent',
                "first_in_time": emp.get('first_in_time').isoformat() if emp.get('first_in_time') else None,
                "last_out_time": emp.get('last_out_time').isoformat() if emp.get('last_out_time') else None,
                "total_working_hours": str(emp.get('total_working_hours')) if emp.get('total_working_hours') else None
            })
        
        total_pages = (total + limit - 1) // limit if total > 0 else 0
        
        return {
            "employees": employees,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
    @staticmethod
    def get_present_employees_today(page: int = 1, limit: int = 10, search: Optional[str] = None, department_id: Optional[int] = None, department_ids: Optional[List[int]] = None, shift_id: Optional[int] = None, shift_ids: Optional[List[int]] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = 'asc') -> Dict:
        """Get employees who are present today (paginated)"""
        today = date.today()
        return AttendanceDashboardService.get_employees_with_attendance(
            page=page,
            limit=limit,
            search=search,
            date_filter=today,
            department_id=department_id,
            department_ids=department_ids,
            shift_id=shift_id,
            shift_ids=shift_ids,
            status_filter='Present',
            sort_by=sort_by,
            sort_order=sort_order
        )
    
    @staticmethod
    def get_on_leave_employees_today(page: int = 1, limit: int = 10, search: Optional[str] = None, department_id: Optional[int] = None, department_ids: Optional[List[int]] = None, shift_id: Optional[int] = None, shift_ids: Optional[List[int]] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = 'asc') -> Dict:
        """Get employees who are on leave today (paginated)"""
        today = date.today()
        return AttendanceDashboardService.get_employees_with_attendance(
            page=page,
            limit=limit,
            search=search,
            date_filter=today,
            department_id=department_id,
            department_ids=department_ids,
            shift_id=shift_id,
            shift_ids=shift_ids,
            status_filter='Leave',
            sort_by=sort_by,
            sort_order=sort_order
        )
    
    @staticmethod
    def get_absent_employees_today(page: int = 1, limit: int = 10, search: Optional[str] = None, department_id: Optional[int] = None, department_ids: Optional[List[int]] = None, shift_id: Optional[int] = None, shift_ids: Optional[List[int]] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = 'asc') -> Dict:
        """Get employees who are absent today (paginated)"""
        today = date.today()
        return AttendanceDashboardService.get_employees_with_attendance(
            page=page,
            limit=limit,
            search=search,
            date_filter=today,
            department_id=department_id,
            department_ids=department_ids,
            shift_id=shift_id,
            shift_ids=shift_ids,
            status_filter='Absent',
            sort_by=sort_by,
            sort_order=sort_order
        )
    
    @staticmethod
    def get_leave_requests(page: int = 1, limit: int = 10, search: Optional[str] = None, status: Optional[str] = None, department_id: Optional[int] = None, manager_id: Optional[int] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = 'asc') -> Dict:
        """Get leave requests (paginated). If manager_id is provided, only shows requests from employees who report to that manager."""
        AttendanceDashboardService._validate_pagination(page, limit)
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build search condition - only search in employee name and email to avoid false matches
        # (e.g., searching "jessica" shouldn't match records where Jessica is the approver/manager)
        search_condition = ""
        search_params = []
        if search:
            search_condition = """
                AND (CONCAT(e.first_name, ' ', e.last_name) LIKE %s 
                OR e.email LIKE %s)
            """
            search_pattern = f"%{search}%"
            search_params = [search_pattern, search_pattern]
        
        # Build status filter condition
        status_condition = ""
        status_params = []
        if status:
            status_condition = " AND lr.status = %s"
            status_params = [status]
        
        # Build department filter condition
        department_condition = ""
        department_params = []
        if department_id:
            department_condition = " AND e.department_id = %s"
            department_params = [department_id]
        
        # Build manager filter condition (filter by reports_to)
        manager_condition = ""
        manager_params = []
        if manager_id:
            manager_condition = " AND e.reports_to = %s"
            manager_params = [manager_id]
        
        # Build order by clause
        valid_sort_fields = {
            'employee_name': 'CONCAT(e.first_name, \' \', e.last_name)',
            'request_date': 'lr.request_date',
            'leave_id': 'lr.leave_id'
        }
        
        order_by_clause = "ORDER BY lr.request_date DESC, lr.leave_id DESC"  # Default
        if sort_by and sort_by in valid_sort_fields:
            sort_field = valid_sort_fields[sort_by]
            sort_direction = 'DESC' if sort_order and sort_order.lower() == 'desc' else 'ASC'
            order_by_clause = f"ORDER BY {sort_field} {sort_direction}"
        
        # Get total count
        count_query = f"""
            SELECT COUNT(DISTINCT lr.leave_id) as total
            FROM att_leaves_request lr
            INNER JOIN emp_employee e ON lr.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN att_leave_type lt ON lr.leave_type_id = lt.leave_type_id
            LEFT JOIN emp_employee requested_to_emp ON lr.requested_to = requested_to_emp.employee_id
            LEFT JOIN emp_employee approved_by_emp ON lr.approved_by = approved_by_emp.employee_id
            WHERE e.status_id = 1
            {search_condition}
            {status_condition}
            {department_condition}
            {manager_condition}
        """
        count_params = search_params + status_params + department_params + manager_params
        total_result = db.execute_query_one(count_query, tuple(count_params) if count_params else None)
        total = total_result['total'] if total_result else 0
        
        # Get leave requests
        query = f"""
            SELECT 
                lr.leave_id,
                lr.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.employee_id as employee_code,
                d.department_name as department,
                lt.leave_type_name as leave_type,
                lr.start_date,
                lr.end_date,
                lr.request_date,
                lr.status,
                lr.comments,
                CONCAT(requested_to_emp.first_name, ' ', requested_to_emp.last_name) as requested_to_name,
                CONCAT(approved_by_emp.first_name, ' ', approved_by_emp.last_name) as approved_by_name,
                lr.approved_date
            FROM att_leaves_request lr
            INNER JOIN emp_employee e ON lr.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN att_leave_type lt ON lr.leave_type_id = lt.leave_type_id
            LEFT JOIN emp_employee requested_to_emp ON lr.requested_to = requested_to_emp.employee_id
            LEFT JOIN emp_employee approved_by_emp ON lr.approved_by = approved_by_emp.employee_id
            WHERE e.status_id = 1
            {search_condition}
            {status_condition}
            {department_condition}
            {manager_condition}
            {order_by_clause}
            LIMIT %s OFFSET %s
        """
        
        query_params = search_params + status_params + department_params + manager_params + [limit, offset]
        
        leave_requests_data = db.execute_query_all(query, tuple(query_params) if query_params else None)
        
        # Format the response
        leave_requests = []
        for lr in leave_requests_data:
            leave_requests.append({
                "leave_id": lr.get('leave_id'),
                "employee_id": lr.get('employee_id'),
                "employee_name": lr.get('employee_name') or 'N/A',
                "employee_code": str(lr.get('employee_code', '')),
                "department": lr.get('department') or 'N/A',
                "leave_type": lr.get('leave_type') or 'N/A',
                "start_date": lr.get('start_date').isoformat() if lr.get('start_date') else '',
                "end_date": lr.get('end_date').isoformat() if lr.get('end_date') else '',
                "request_date": lr.get('request_date').isoformat() if lr.get('request_date') else '',
                "status": lr.get('status') or 'Pending',
                "comments": lr.get('comments') or '',
                "requested_to_name": lr.get('requested_to_name') or 'N/A',
                "approved_by_name": lr.get('approved_by_name') or None,
                "approved_date": lr.get('approved_date').isoformat() if lr.get('approved_date') else None
            })
        
        total_pages = (total + limit - 1) // limit if total > 0 else 0
        
        return {
            "leave_requests": leave_requests,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
    @staticmethod
    def approve_leave_request(leave_id: int, approved_by: int, comments: Optional[str] = None) -> Dict:
        """Approve a leave request"""
        try:
            # Validate approved_by is a valid active employee
            employee_check_query = """
                SELECT employee_id 
                FROM emp_employee 
                WHERE employee_id = %s AND status_id = 1
            """
            approver = db.execute_query_one(employee_check_query, (approved_by,))
            if not approver:
                return {"success": False, "message": f"Invalid approver: Employee ID {approved_by} does not exist or is not active"}
            
            # Check if leave request exists and is pending
            check_query = """
                SELECT status, employee_id, start_date, end_date, leave_type_id
                FROM att_leaves_request
                WHERE leave_id = %s
            """
            leave_request = db.execute_query_one(check_query, (leave_id,))
            
            if not leave_request:
                return {"success": False, "message": "Leave request not found"}
            
            if leave_request['status'] != 'Pending':
                return {"success": False, "message": f"Leave request is already {leave_request['status']}"}
            
            # Update leave request status
            update_query = """
                UPDATE att_leaves_request
                SET status = 'Approved',
                    approved_by = %s,
                    approved_date = %s,
                    comments = CASE WHEN %s IS NOT NULL THEN %s ELSE comments END,
                    updated_at = NOW()
                WHERE leave_id = %s
            """
            db.execute_update(update_query, (approved_by, date.today(), comments, comments, leave_id))
            
            return {"success": True, "message": "Leave request approved successfully"}
        except Exception as e:
            return {"success": False, "message": f"Error approving leave request: {str(e)}"}
    
    @staticmethod
    def reject_leave_request(leave_id: int, rejected_by: int, comments: Optional[str] = None) -> Dict:
        """Reject a leave request"""
        try:
            # Validate rejected_by is a valid active employee
            employee_check_query = """
                SELECT employee_id 
                FROM emp_employee 
                WHERE employee_id = %s AND status_id = 1
            """
            rejector = db.execute_query_one(employee_check_query, (rejected_by,))
            if not rejector:
                return {"success": False, "message": f"Invalid rejector: Employee ID {rejected_by} does not exist or is not active"}
            
            # Check if leave request exists and is pending
            check_query = """
                SELECT status
                FROM att_leaves_request
                WHERE leave_id = %s
            """
            leave_request = db.execute_query_one(check_query, (leave_id,))
            
            if not leave_request:
                return {"success": False, "message": "Leave request not found"}
            
            if leave_request['status'] != 'Pending':
                return {"success": False, "message": f"Leave request is already {leave_request['status']}"}
            
            # Update leave request status
            update_query = """
                UPDATE att_leaves_request
                SET status = 'Rejected',
                    approved_by = %s,
                    approved_date = %s,
                    comments = CASE WHEN %s IS NOT NULL THEN %s ELSE comments END,
                    updated_at = NOW()
                WHERE leave_id = %s
            """
            db.execute_update(update_query, (rejected_by, date.today(), comments, comments, leave_id))
            
            return {"success": True, "message": "Leave request rejected successfully"}
        except Exception as e:
            return {"success": False, "message": f"Error rejecting leave request: {str(e)}"}
    
    @staticmethod
    def get_regularization_requests(page: int = 1, limit: int = 10, search: Optional[str] = None, department_id: Optional[int] = None, manager_id: Optional[int] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = 'asc') -> Dict:
        """Get regularization requests (paginated, only pending). If manager_id is provided, only shows requests from employees who report to that manager."""
        AttendanceDashboardService._validate_pagination(page, limit)
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build search condition - only search in employee name and email to avoid false matches
        search_condition = ""
        search_params = []
        if search:
            search_condition = """
                AND (CONCAT(e.first_name, ' ', e.last_name) LIKE %s 
                OR e.email LIKE %s)
            """
            search_pattern = f"%{search}%"
            search_params = [search_pattern, search_pattern]
        
        # Build department filter condition
        department_condition = ""
        department_params = []
        if department_id:
            department_condition = " AND e.department_id = %s"
            department_params = [department_id]
        
        # Build manager filter condition (filter by reports_to)
        manager_condition = ""
        manager_params = []
        if manager_id:
            manager_condition = " AND e.reports_to = %s"
            manager_params = [manager_id]
        
        # Build order by clause
        valid_sort_fields = {
            'employee_name': 'CONCAT(e.first_name, \' \', e.last_name)',
            'created_at': 'rr.created_at',
            'request_id': 'rr.request_id'
        }
        
        order_by_clause = "ORDER BY rr.created_at DESC, rr.request_id DESC"  # Default
        if sort_by and sort_by in valid_sort_fields:
            sort_field = valid_sort_fields[sort_by]
            sort_direction = 'DESC' if sort_order and sort_order.lower() == 'desc' else 'ASC'
            order_by_clause = f"ORDER BY {sort_field} {sort_direction}"
        
        # Get total count
        count_query = f"""
            SELECT COUNT(DISTINCT rr.request_id) as total
            FROM att_regularization_requests rr
            INNER JOIN emp_employee e ON rr.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE e.status_id = 1 AND rr.status = 'Pending'
            {search_condition}
            {department_condition}
            {manager_condition}
        """
        count_params = search_params + department_params + manager_params
        total_result = db.execute_query_one(count_query, tuple(count_params) if count_params else None)
        total = total_result['total'] if total_result else 0
        
        # Get regularization requests
        query = f"""
            SELECT 
                rr.request_id,
                rr.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.employee_id as employee_code,
                d.department_name as department,
                rr.date,
                rr.reason,
                rr.regularization_type,
                rr.old_check_in,
                rr.old_check_out,
                rr.corrected_check_in,
                rr.corrected_check_out,
                rr.status,
                rr.approved_by,
                CONCAT(approved_by_emp.first_name, ' ', approved_by_emp.last_name) as approved_by_name,
                rr.created_at
            FROM att_regularization_requests rr
            INNER JOIN emp_employee e ON rr.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN emp_employee approved_by_emp ON rr.approved_by = approved_by_emp.employee_id
            WHERE e.status_id = 1 AND rr.status = 'Pending'
            {search_condition}
            {department_condition}
            {manager_condition}
            {order_by_clause}
            LIMIT %s OFFSET %s
        """
        
        query_params = search_params + department_params + manager_params + [limit, offset]
        
        regularization_data = db.execute_query_all(query, tuple(query_params) if query_params else None)
        
        # Format the response
        regularization_requests = []
        for rr in regularization_data:
            regularization_requests.append({
                "request_id": rr.get('request_id'),
                "employee_id": rr.get('employee_id'),
                "employee_name": rr.get('employee_name') or 'N/A',
                "employee_code": str(rr.get('employee_code', '')),
                "department": rr.get('department') or 'N/A',
                "date": rr.get('date').isoformat() if rr.get('date') else '',
                "reason": rr.get('reason') or '',
                "regularization_type": rr.get('regularization_type') or 'N/A',
                "old_check_in": str(rr.get('old_check_in')) if rr.get('old_check_in') else None,
                "old_check_out": str(rr.get('old_check_out')) if rr.get('old_check_out') else None,
                "corrected_check_in": str(rr.get('corrected_check_in')) if rr.get('corrected_check_in') else None,
                "corrected_check_out": str(rr.get('corrected_check_out')) if rr.get('corrected_check_out') else None,
                "status": rr.get('status') or 'Pending',
                "approved_by": rr.get('approved_by'),
                "approved_by_name": rr.get('approved_by_name') or None,
                "created_at": rr.get('created_at').isoformat() if rr.get('created_at') else None
            })
        
        total_pages = (total + limit - 1) // limit if total > 0 else 0
        
        return {
            "regularization_requests": regularization_requests,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
    @staticmethod
    def get_compensatory_requests(page: int = 1, limit: int = 10, search: Optional[str] = None, department_id: Optional[int] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = 'asc') -> Dict:
        """Get compensatory leave requests (paginated, only pending)"""
        AttendanceDashboardService._validate_pagination(page, limit)
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build search condition - only search in employee name and email to avoid false matches
        search_condition = ""
        search_params = []
        if search:
            search_condition = """
                AND (CONCAT(e.first_name, ' ', e.last_name) LIKE %s 
                OR e.email LIKE %s)
            """
            search_pattern = f"%{search}%"
            search_params = [search_pattern, search_pattern]
        
        # Build department filter condition
        department_condition = ""
        department_params = []
        if department_id:
            department_condition = " AND e.department_id = %s"
            department_params = [department_id]
        
        # Build order by clause
        valid_sort_fields = {
            'employee_name': 'CONCAT(e.first_name, \' \', e.last_name)',
            'request_date': 'lr.request_date',
            'leave_id': 'lr.leave_id'
        }
        
        order_by_clause = "ORDER BY lr.request_date DESC, lr.leave_id DESC"  # Default
        if sort_by and sort_by in valid_sort_fields:
            sort_field = valid_sort_fields[sort_by]
            sort_direction = 'DESC' if sort_order and sort_order.lower() == 'desc' else 'ASC'
            order_by_clause = f"ORDER BY {sort_field} {sort_direction}"
        
        # Get total count
        count_query = f"""
            SELECT COUNT(DISTINCT lr.leave_id) as total
            FROM att_leaves_request lr
            INNER JOIN emp_employee e ON lr.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN att_leave_type lt ON lr.leave_type_id = lt.leave_type_id
            LEFT JOIN emp_employee requested_to_emp ON lr.requested_to = requested_to_emp.employee_id
            WHERE e.status_id = 1 
            AND lr.status = 'Pending'
            AND (lt.leave_type_name LIKE '%compensatory%' OR lt.leave_type_name LIKE '%comp-off%' OR lt.leave_type_name LIKE '%comp%')
            {search_condition}
            {department_condition}
        """
        count_params = search_params + department_params
        total_result = db.execute_query_one(count_query, tuple(count_params) if count_params else None)
        total = total_result['total'] if total_result else 0
        
        # Get compensatory requests
        query = f"""
            SELECT 
                lr.leave_id,
                lr.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.employee_id as employee_code,
                d.department_name as department,
                lt.leave_type_name as leave_type,
                lr.start_date,
                lr.end_date,
                lr.request_date,
                lr.status,
                lr.comments,
                CONCAT(requested_to_emp.first_name, ' ', requested_to_emp.last_name) as requested_to_name
            FROM att_leaves_request lr
            INNER JOIN emp_employee e ON lr.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN att_leave_type lt ON lr.leave_type_id = lt.leave_type_id
            LEFT JOIN emp_employee requested_to_emp ON lr.requested_to = requested_to_emp.employee_id
            WHERE e.status_id = 1 
            AND lr.status = 'Pending'
            AND (lt.leave_type_name LIKE '%compensatory%' OR lt.leave_type_name LIKE '%comp-off%' OR lt.leave_type_name LIKE '%comp%')
            {search_condition}
            {department_condition}
            {order_by_clause}
            LIMIT %s OFFSET %s
        """
        
        query_params = search_params + department_params + [limit, offset]
        
        compensatory_data = db.execute_query_all(query, tuple(query_params) if query_params else None)
        
        # Format the response
        compensatory_requests = []
        for lr in compensatory_data:
            compensatory_requests.append({
                "leave_id": lr.get('leave_id'),
                "employee_id": lr.get('employee_id'),
                "employee_name": lr.get('employee_name') or 'N/A',
                "employee_code": str(lr.get('employee_code', '')),
                "department": lr.get('department') or 'N/A',
                "leave_type": lr.get('leave_type') or 'N/A',
                "start_date": lr.get('start_date').isoformat() if lr.get('start_date') else '',
                "end_date": lr.get('end_date').isoformat() if lr.get('end_date') else '',
                "request_date": lr.get('request_date').isoformat() if lr.get('request_date') else '',
                "status": lr.get('status') or 'Pending',
                "comments": lr.get('comments') or '',
                "requested_to_name": lr.get('requested_to_name') or 'N/A'
            })
        
        total_pages = (total + limit - 1) // limit if total > 0 else 0
        
        return {
            "compensatory_requests": compensatory_requests,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
    @staticmethod
    def approve_regularization_request(request_id: int, approved_by: int, comments: Optional[str] = None) -> Dict:
        """Approve a regularization request"""
        try:
            # Validate approved_by is a valid active employee
            employee_check_query = """
                SELECT employee_id 
                FROM emp_employee 
                WHERE employee_id = %s AND status_id = 1
            """
            approver = db.execute_query_one(employee_check_query, (approved_by,))
            if not approver:
                return {"success": False, "message": f"Invalid approver: Employee ID {approved_by} does not exist or is not active"}
            
            # Check if request exists and is pending
            check_query = """
                SELECT status
                FROM att_regularization_requests
                WHERE request_id = %s
            """
            reg_request = db.execute_query_one(check_query, (request_id,))
            
            if not reg_request:
                return {"success": False, "message": "Regularization request not found"}
            
            if reg_request['status'] != 'Pending':
                return {"success": False, "message": f"Regularization request is already {reg_request['status']}"}
            
            # Update request status
            update_query = """
                UPDATE att_regularization_requests
                SET status = 'Approved',
                    approved_by = %s,
                    updated_at = NOW()
                WHERE request_id = %s
            """
            db.execute_update(update_query, (approved_by, request_id))
            
            return {"success": True, "message": "Regularization request approved successfully"}
        except Exception as e:
            return {"success": False, "message": f"Error approving regularization request: {str(e)}"}
    
    @staticmethod
    def reject_regularization_request(request_id: int, rejected_by: int, comments: Optional[str] = None) -> Dict:
        """Reject a regularization request"""
        try:
            # Validate rejected_by is a valid active employee
            employee_check_query = """
                SELECT employee_id 
                FROM emp_employee 
                WHERE employee_id = %s AND status_id = 1
            """
            rejector = db.execute_query_one(employee_check_query, (rejected_by,))
            if not rejector:
                return {"success": False, "message": f"Invalid rejector: Employee ID {rejected_by} does not exist or is not active"}
            
            # Check if request exists and is pending
            check_query = """
                SELECT status
                FROM att_regularization_requests
                WHERE request_id = %s
            """
            reg_request = db.execute_query_one(check_query, (request_id,))
            
            if not reg_request:
                return {"success": False, "message": "Regularization request not found"}
            
            if reg_request['status'] != 'Pending':
                return {"success": False, "message": f"Regularization request is already {reg_request['status']}"}
            
            # Update request status
            update_query = """
                UPDATE att_regularization_requests
                SET status = 'Rejected',
                    approved_by = %s,
                    updated_at = NOW()
                WHERE request_id = %s
            """
            db.execute_update(update_query, (rejected_by, request_id))
            
            return {"success": True, "message": "Regularization request rejected successfully"}
        except Exception as e:
            return {"success": False, "message": f"Error rejecting regularization request: {str(e)}"}

