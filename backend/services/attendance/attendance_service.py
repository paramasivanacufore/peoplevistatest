from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time, timedelta
import re
# Removed Pydantic model imports - using plain dicts instead

class AttendanceService:
    @staticmethod
    def get_team_attendance(
        date_filter: Optional[str] = None,
        department_id: Optional[int] = None,
        department_ids: Optional[List[int]] = None,
        status_filter: Optional[str] = None,
        shift_id: Optional[int] = None,
        shift_ids: Optional[List[int]] = None,
        search_query: Optional[str] = None,
        page: Optional[int] = 1,
        page_size: Optional[int] = 10
    ) -> Dict[str, Any]:  # Return dict instead of Pydantic model for now
        """Get team attendance data with employee details"""
        try:
            # Default to latest available date if not provided
            if not date_filter:
                # Try to get the latest date from attendance records
                print(f"DEBUG: No date filter provided, fetching latest date from database...")
                try:
                    latest_date_result = db.execute_query_one(
                        "SELECT MAX(date) as latest_date FROM att_daily_attendance"
                    )
                    print(f"DEBUG: Latest date query result: {latest_date_result}")
                    if latest_date_result and latest_date_result.get('latest_date'):
                        date_filter = latest_date_result['latest_date']
                        print(f"DEBUG: Latest date from DB (raw): {date_filter}, type: {type(date_filter)}")
                        if isinstance(date_filter, date):
                            date_filter = date_filter.isoformat()
                        elif isinstance(date_filter, datetime):
                            date_filter = date_filter.date().isoformat()
                        elif isinstance(date_filter, str):
                            # Already a string, use as is
                            pass
                        print(f"DEBUG: Using latest date from DB: {date_filter}")
                    else:
                        # Fallback to today if no records exist
                        date_filter = date.today().isoformat()
                        print(f"WARNING: No attendance records found, falling back to today's date: {date_filter}")
                except Exception as date_error:
                    print(f"ERROR: Failed to get latest date: {date_error}")
                    date_filter = date.today().isoformat()
                    print(f"Using fallback date: {date_filter}")
            
            # Build WHERE clause starting from emp_employee (not att_daily_attendance)
            params = []
            where_clause = "WHERE 1=1"  # Start with always-true condition
            
            print(f"DEBUG: Using date filter: {date_filter}")
            
            # Add department filter (support both single and multiple)
            if department_ids and len(department_ids) > 0:
                placeholders = ','.join(['%s'] * len(department_ids))
                where_clause += f" AND e.department_id IN ({placeholders})"
                params.extend(department_ids)
                print(f"DEBUG: Filtering by department_ids: {department_ids}")
            elif department_id:
                where_clause += " AND e.department_id = %s"
                params.append(department_id)
                print(f"DEBUG: Filtering by department_id: {department_id}")
            
            # Add status filter - need to handle NULL attendance records
            if status_filter and status_filter != 'All Status':
                if status_filter == 'Absent':
                    # Show employees with no attendance record OR status = 'Absent'
                    where_clause += " AND (ada.status = %s OR ada.status IS NULL)"
                    params.append(status_filter)
                else:
                    where_clause += " AND ada.status = %s"
                    params.append(status_filter)
            
            # Add shift filter (support both single and multiple)
            if shift_ids and len(shift_ids) > 0:
                placeholders = ','.join(['%s'] * len(shift_ids))
                where_clause += f" AND esa.shift_id IN ({placeholders})"
                params.extend(shift_ids)
            elif shift_id:
                where_clause += " AND esa.shift_id = %s"
                params.append(shift_id)
            
            # Add search filter
            if search_query:
                # Extract numeric part from search query (e.g., "E1" -> "1")
                numeric_match = re.search(r'\d+', search_query)
                numeric_value = numeric_match.group(0) if numeric_match else None
                
                search_pattern = f"%{search_query}%"
                where_clause += " AND (e.first_name LIKE %s OR e.last_name LIKE %s OR d.department_name LIKE %s"
                params.extend([search_pattern, search_pattern, search_pattern])
                
                # If search query contains a number, also search by employee_id
                if numeric_value:
                    try:
                        employee_id_int = int(numeric_value)
                        where_clause += " OR e.employee_id = %s"
                        params.append(employee_id_int)
                    except ValueError:
                        pass
                
                where_clause += ")"
            
            query = f"""
                SELECT 
                    ada.attendance_id,
                    e.employee_id,
                    COALESCE(ada.date, %s) as date,
                    ada.first_in_time,
                    ada.last_out_time,
                    ada.total_working_hours,
                    ada.total_punches,
                    COALESCE(ada.status, 'Absent') as status,
                    e.first_name,
                    e.last_name,
                    e.department_id,
                    d.department_name,
                    p.position_name,
                    e.reports_to,
                    rm.first_name as reporting_manager_first_name,
                    rm.last_name as reporting_manager_last_name,
                    s.shift_id,
                    s.shift_name
                FROM emp_employee e
                LEFT JOIN att_daily_attendance ada ON ada.employee_id = e.employee_id 
                    AND ada.date = %s
                LEFT JOIN departments d ON d.department_id = e.department_id
                LEFT JOIN positions p ON p.position_id = e.position_id
                LEFT JOIN emp_employee rm ON rm.employee_id = e.reports_to
                LEFT JOIN att_emp_shift_assignments esa ON esa.employee_id = e.employee_id 
                    AND esa.effective_from <= %s
                    AND (esa.effective_to IS NULL OR esa.effective_to >= %s)
                LEFT JOIN att_shifts s ON s.shift_id = esa.shift_id
                {where_clause}
                ORDER BY e.employee_id ASC
            """
            
            # Add date_filter parameters: one for COALESCE, one for LEFT JOIN condition, two for shift assignment
            query_params = [date_filter, date_filter, date_filter, date_filter] + params
            
            # Get total count for pagination - count all employees matching filters
            count_query = f"""
                SELECT COUNT(DISTINCT e.employee_id) as total
                FROM emp_employee e
                LEFT JOIN att_daily_attendance ada ON ada.employee_id = e.employee_id 
                    AND ada.date = %s
                LEFT JOIN departments d ON d.department_id = e.department_id
                LEFT JOIN positions p ON p.position_id = e.position_id
                LEFT JOIN emp_employee rm ON rm.employee_id = e.reports_to
                LEFT JOIN att_emp_shift_assignments esa ON esa.employee_id = e.employee_id 
                    AND esa.effective_from <= %s
                    AND (esa.effective_to IS NULL OR esa.effective_to >= %s)
                LEFT JOIN att_shifts s ON s.shift_id = esa.shift_id
                {where_clause}
            """
            
            count_params = [date_filter, date_filter, date_filter] + params
            total_result = db.execute_query_one(count_query, tuple(count_params))
            total_count = total_result.get('total', 0) if total_result else 0
            
            # Add pagination to main query
            page = page or 1
            page_size = page_size or 10
            offset = (page - 1) * page_size
            query += f" LIMIT %s OFFSET %s"
            query_params.append(page_size)
            query_params.append(offset)
            
            print(f"DEBUG: Final query: {query}")
            print(f"DEBUG: Query params: {query_params}")
            print(f"DEBUG: Query params types: {[type(p).__name__ for p in query_params]}")
            
            # First, check if there are any attendance records for this date
            print(f"DEBUG: Checking attendance records for date: {date_filter} (type: {type(date_filter)})")
            check_attendance_query = "SELECT COUNT(*) as count FROM att_daily_attendance WHERE date = %s"
            attendance_check = db.execute_query_one(check_attendance_query, (date_filter,))
            attendance_count = attendance_check.get('count', 0) if attendance_check else 0
            print(f"DEBUG: Attendance records for date {date_filter}: {attendance_count}")
            
            # Also check what dates actually exist in the database
            if attendance_count == 0:
                all_dates_query = "SELECT DISTINCT date FROM att_daily_attendance ORDER BY date DESC LIMIT 5"
                all_dates = db.execute_query_all(all_dates_query)
                print(f"DEBUG: Top 5 dates in database: {[str(d.get('date')) for d in all_dates]}")
            
            # Check if employees exist for these attendance records
            if attendance_count > 0:
                check_employees_query = """
                    SELECT COUNT(DISTINCT ada.employee_id) as emp_count
                    FROM att_daily_attendance ada
                    INNER JOIN emp_employee e ON e.employee_id = ada.employee_id
                    WHERE ada.date = %s
                """
                employee_check = db.execute_query_one(check_employees_query, (date_filter,))
                emp_count = employee_check.get('emp_count', 0) if employee_check else 0
                print(f"DEBUG: Employees found in emp_employee table for this date: {emp_count}")
                if emp_count == 0:
                    print(f"WARNING: Attendance records exist but no matching employees in emp_employee table!")
                    print(f"DEBUG: This means employees need to be created in emp_employee table first")
            
            try:
                results = db.execute_query_all(query, tuple(query_params))
                print(f"DEBUG: Found {len(results)} results from database")
                if results:
                    print(f"DEBUG: First result keys: {list(results[0].keys())}")
                    print(f"DEBUG: First result sample: {str(results[0])[:300]}")
                    print(f"DEBUG: First result department_id: {results[0].get('department_id')}, department_name: {results[0].get('department_name')}")
                else:
                    print(f"WARNING: Query returned 0 results!")
                    print(f"DEBUG: This might be because:")
                    print(f"  - No attendance records for date: {date_filter}")
                    print(f"  - Employees don't exist in emp_employee table (INNER JOIN fails)")
                    print(f"  - Filters are too restrictive")
                    print(f"  - Database connection issue")
            except Exception as query_error:
                print(f"ERROR: Database query failed: {query_error}")
                import traceback
                traceback.print_exc()
                raise
            
            # Format the results
            attendance_list = []
            for row in results:
                # Generate initials
                first_name = row.get('first_name', '')
                last_name = row.get('last_name', '')
                initials = f"{first_name[0] if first_name else ''}{last_name[0] if last_name else ''}".upper()
                
                # Format check-in time
                first_in_time = row.get('first_in_time')
                check_in_time = None
                if first_in_time:
                    if isinstance(first_in_time, datetime):
                        check_in_time = first_in_time.strftime('%I:%M %p')
                    elif isinstance(first_in_time, str):
                        try:
                            dt = datetime.strptime(first_in_time, '%Y-%m-%d %H:%M:%S')
                            check_in_time = dt.strftime('%I:%M %p')
                        except:
                            check_in_time = first_in_time
                
                # Format status
                status = row.get('status', 'Absent')
                
                # Reporting manager name
                reporting_manager = None
                if row.get('reporting_manager_first_name'):
                    reporting_manager = f"{row.get('reporting_manager_first_name', '')} {row.get('reporting_manager_last_name', '')}".strip()
                
                # Parse date properly - convert to ISO string format
                attendance_date = row.get('date')
                if attendance_date:
                    if isinstance(attendance_date, date):
                        attendance_date = attendance_date.isoformat()
                    elif isinstance(attendance_date, datetime):
                        attendance_date = attendance_date.date().isoformat()
                    elif isinstance(attendance_date, str):
                        # Already a string, validate format
                        try:
                            datetime.strptime(attendance_date, '%Y-%m-%d')
                        except:
                            attendance_date = date.today().isoformat()
                    else:
                        attendance_date = date.today().isoformat()
                else:
                    attendance_date = date.today().isoformat()
                
                # Parse datetime fields - convert to ISO string format
                first_in = row.get('first_in_time')
                if first_in:
                    if isinstance(first_in, datetime):
                        first_in = first_in.isoformat()
                    elif isinstance(first_in, str):
                        # Already a string, keep as is
                        pass
                    else:
                        first_in = None
                else:
                    first_in = None
                
                last_out = row.get('last_out_time')
                if last_out:
                    if isinstance(last_out, datetime):
                        last_out = last_out.isoformat()
                    elif isinstance(last_out, str):
                        # Already a string, keep as is
                        pass
                    else:
                        last_out = None
                else:
                    last_out = None
                
                # Parse time field - convert to string format
                total_hours = row.get('total_working_hours')
                if total_hours:
                    if isinstance(total_hours, time):
                        total_hours = total_hours.isoformat()
                    elif isinstance(total_hours, str):
                        # Already a string, keep as is
                        pass
                    else:
                        total_hours = str(total_hours)
                else:
                    total_hours = None
                
                # Create simple dict - no Pydantic models
                attendance_data = {
                    'attendance_id': row.get('attendance_id'),
                    'employee_id': row.get('employee_id'),
                    'empId': f"E{row.get('employee_id')}",
                    'name': f"{first_name} {last_name}".strip(),
                    'initials': initials,
                    'department': row.get('department_name') or 'N/A',
                    'role': row.get('position_name') or 'N/A',
                    'shift': row.get('shift_name') or 'N/A',
                    'status': status,
                    'checkInTime': check_in_time,
                    'date': attendance_date,
                    'first_in_time': first_in,
                    'last_out_time': last_out,
                    'total_working_hours': total_hours,
                    'total_punches': row.get('total_punches') or 0,
                    'reporting_to': reporting_manager or 'N/A'
                }
                attendance_list.append(attendance_data)
            
            # Calculate pagination metadata
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
            
            print(f"DEBUG: Total count from query: {total_count}")
            print(f"DEBUG: Attendance list length: {len(attendance_list)}")
            if len(attendance_list) > 0:
                print(f"DEBUG: First record sample: {attendance_list[0]}")
            
            # Return simple dict - no Pydantic models
            response = {
                'data': attendance_list,  # Already a list of dicts
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_items': total_count,
                    'total_pages': total_pages,
                    'has_next': page < total_pages,
                    'has_previous': page > 1
                }
            }
            
            print(f"DEBUG: Final response data count: {len(response['data'])}")
            print(f"DEBUG: Final response pagination: {response['pagination']}")
            
            return response
            
        except Exception as e:
            print(f"Error getting team attendance: {e}")
            import traceback
            traceback.print_exc()
            return {
                'data': [],
                'pagination': {
                    'current_page': 1,
                    'page_size': page_size or 10,
                    'total_items': 0,
                    'total_pages': 0,
                    'has_next': False,
                    'has_previous': False
                }
            }
    
    @staticmethod
    def get_departments() -> List[Dict[str, Any]]:
        """Get all departments for filter dropdown"""
        try:
            query = """
                SELECT department_id, department_name
                FROM departments
                ORDER BY department_name
            """
            results = db.execute_query_all(query)
            return [{'id': r['department_id'], 'name': r['department_name']} for r in results]
        except Exception as e:
            print(f"Error getting departments: {e}")
            return []
    
    @staticmethod
    def get_shifts() -> List[Dict[str, Any]]:
        """Get all shifts for filter dropdown"""
        try:
            query = """
                SELECT shift_id, shift_name
                FROM att_shifts
                ORDER BY shift_name
            """
            results = db.execute_query_all(query)
            return [{'id': r['shift_id'], 'name': r['shift_name']} for r in results]
        except Exception as e:
            print(f"Error getting shifts: {e}")
            return []
    
    @staticmethod
    def get_employee_attendance(
        employee_id: int,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: Optional[int] = 1,
        page_size: Optional[int] = 10
    ) -> Dict[str, Any]:
        """Get attendance data for a specific employee"""
        try:
            # Get employee basic info
            employee_query = """
                SELECT 
                    e.employee_id,
                    e.first_name,
                    e.last_name,
                    d.department_name,
                    p.position_name
                FROM emp_employee e
                LEFT JOIN departments d ON d.department_id = e.department_id
                LEFT JOIN positions p ON p.position_id = e.position_id
                WHERE e.employee_id = %s
            """
            employee_info = db.execute_query_one(employee_query, (employee_id,))
            
            if not employee_info:
                return {
                    'employee': None,
                    'data': [],
                    'pagination': {
                        'current_page': 1,
                        'page_size': page_size or 10,
                        'total_items': 0,
                        'total_pages': 0,
                        'has_next': False,
                        'has_previous': False
                    },
                    'summary': {
                        'total_payable_days': 0,
                        'total_present_days': 0,
                        'paid_leaves': 0,
                        'unpaid_leave_absent': 0,
                        'total_holidays': 0,
                        'total_weekends': 0,
                        'total_overtime_earned': '0h 0m',
                        'comp_off_credited': 0,
                        'comp_off_used': 0
                    }
                }
            
            # Build date filter
            date_filter = ""
            params = [employee_id]
            
            if start_date and end_date:
                date_filter = "AND ada.date BETWEEN %s AND %s"
                params.extend([start_date, end_date])
            elif start_date:
                date_filter = "AND ada.date >= %s"
                params.append(start_date)
            elif end_date:
                date_filter = "AND ada.date <= %s"
                params.append(end_date)
            
            # Get attendance records
            query = f"""
                SELECT 
                    ada.attendance_id,
                    ada.employee_id,
                    ada.date,
                    ada.first_in_time,
                    ada.last_out_time,
                    ada.total_working_hours,
                    ada.total_punches,
                    ada.status,
                    s.shift_name,
                    esa.shift_id
                FROM att_daily_attendance ada
                LEFT JOIN att_emp_shift_assignments esa ON esa.employee_id = ada.employee_id 
                    AND ada.date >= esa.effective_from
                    AND (esa.effective_to IS NULL OR ada.date <= esa.effective_to)
                LEFT JOIN att_shifts s ON s.shift_id = esa.shift_id
                WHERE ada.employee_id = %s
                {date_filter}
                ORDER BY ada.date DESC
            """
            
            # Get total count
            count_query = f"""
                SELECT COUNT(*) as total
                FROM att_daily_attendance ada
                WHERE ada.employee_id = %s
                {date_filter}
            """
            total_result = db.execute_query_one(count_query, tuple(params))
            total_count = total_result.get('total', 0) if total_result else 0
            
            # Add pagination
            page = page or 1
            page_size = page_size or 10
            offset = (page - 1) * page_size
            query += f" LIMIT %s OFFSET %s"
            params.append(page_size)
            params.append(offset)
            
            results = db.execute_query_all(query, tuple(params))
            
            # Get shift duration for OT calculation
            # Use date range to find shift that was active during the attendance period
            shift_date_filter = ""
            shift_params = [employee_id]
            if start_date and end_date:
                shift_date_filter = """
                    AND (esa.effective_to IS NULL OR esa.effective_to >= %s)
                    AND esa.effective_from <= %s
                """
                shift_params.extend([start_date, end_date])
            else:
                # Fallback to current date if no date range provided
                shift_date_filter = """
                    AND (esa.effective_to IS NULL OR esa.effective_to >= CURDATE())
                    AND esa.effective_from <= CURDATE()
                """
            
            shift_query = f"""
                SELECT s.shift_id, s.start_time, s.end_time, s.break_duration
                FROM att_emp_shift_assignments esa
                JOIN att_shifts s ON s.shift_id = esa.shift_id
                WHERE esa.employee_id = %s
                {shift_date_filter}
                ORDER BY esa.effective_from DESC
                LIMIT 1
            """
            shift_info = db.execute_query_one(shift_query, tuple(shift_params))
            
            # Default shift duration (8 hours = 480 minutes)
            default_shift_minutes = 480
            if shift_info:
                start_time = shift_info.get('start_time')
                end_time = shift_info.get('end_time')
                break_duration = shift_info.get('break_duration', 0) or 0
                
                if start_time and end_time:
                    # Calculate shift duration in minutes
                    if isinstance(start_time, str):
                        start_parts = start_time.split(':')
                        end_parts = end_time.split(':')
                    else:
                        start_parts = str(start_time).split(':')
                        end_parts = str(end_time).split(':')
                    
                    if len(start_parts) >= 2 and len(end_parts) >= 2:
                        start_minutes = int(start_parts[0]) * 60 + int(start_parts[1])
                        end_minutes = int(end_parts[0]) * 60 + int(end_parts[1])
                        
                        # Handle overnight shifts
                        if end_minutes < start_minutes:
                            end_minutes += 24 * 60
                        
                        default_shift_minutes = (end_minutes - start_minutes) - break_duration
            
            # Format attendance records
            attendance_list = []
            work_day_counter = 0
            
            for row in results:
                # Calculate work day (skip weekends and holidays)
                status = row.get('status', 'Absent')
                if status in ['Present', 'Absent', 'Leave', 'Regularized']:
                    work_day_counter += 1
                    work_day = str(work_day_counter)
                else:
                    work_day = '—'
                
                # Format date
                attendance_date = row.get('date')
                if isinstance(attendance_date, date):
                    date_str = attendance_date.strftime('%d-%b-%Y')
                elif isinstance(attendance_date, str):
                    try:
                        dt = datetime.strptime(attendance_date, '%Y-%m-%d')
                        date_str = dt.strftime('%d-%b-%Y')
                    except:
                        date_str = attendance_date
                else:
                    date_str = str(attendance_date)
                
                # Format times
                first_in_time = row.get('first_in_time')
                first_punch = '—'
                if first_in_time:
                    if isinstance(first_in_time, datetime):
                        first_punch = first_in_time.strftime('%I:%M %p')
                    elif isinstance(first_in_time, str):
                        try:
                            dt = datetime.strptime(first_in_time, '%Y-%m-%d %H:%M:%S')
                            first_punch = dt.strftime('%I:%M %p')
                        except:
                            first_punch = first_in_time
                
                last_out_time = row.get('last_out_time')
                last_punch = '—'
                if last_out_time:
                    if isinstance(last_out_time, datetime):
                        last_punch = last_out_time.strftime('%I:%M %p')
                    elif isinstance(last_out_time, str):
                        try:
                            dt = datetime.strptime(last_out_time, '%Y-%m-%d %H:%M:%S')
                            last_punch = dt.strftime('%I:%M %p')
                        except:
                            last_punch = last_out_time
                
                # Format total hours
                total_hours = row.get('total_working_hours')
                total_hours_str = '—'
                total_minutes = 0
                if total_hours:
                    try:
                        if isinstance(total_hours, str):
                            # Parse TIME format (HH:MM:SS)
                            parts = total_hours.split(':')
                            if len(parts) >= 2:
                                hours = int(parts[0])
                                minutes = int(parts[1])
                                total_minutes = hours * 60 + minutes
                                total_hours_str = f"{hours}h {minutes}m"
                            else:
                                total_hours_str = total_hours
                        elif isinstance(total_hours, time):
                            # Handle time object
                            total_minutes = total_hours.hour * 60 + total_hours.minute
                            total_hours_str = f"{total_hours.hour}h {total_hours.minute}m"
                        elif isinstance(total_hours, timedelta):
                            # Handle timedelta object
                            total_seconds = int(total_hours.total_seconds())
                            total_minutes = total_seconds // 60
                            hours = total_minutes // 60
                            minutes = total_minutes % 60
                            total_hours_str = f"{hours}h {minutes}m"
                        else:
                            # Try to convert to string and parse
                            total_hours_str = str(total_hours)
                            # Try to extract hours and minutes from string representation
                            import re
                            match = re.search(r'(\d+):(\d+):?(\d+)?', total_hours_str)
                            if match:
                                hours = int(match.group(1))
                                minutes = int(match.group(2))
                                total_minutes = hours * 60 + minutes
                                total_hours_str = f"{hours}h {minutes}m"
                    except Exception as e:
                        # If parsing fails, just use string representation
                        total_hours_str = str(total_hours) if total_hours else '—'
                
                # Calculate OT duration (only for Present status)
                ot_str = '—'
                if status == 'Present' and total_minutes > 0:
                    try:
                        # Calculate overtime (total - shift duration)
                        overtime_minutes = total_minutes - default_shift_minutes
                        if overtime_minutes > 0:
                            ot_hours = overtime_minutes // 60
                            ot_mins = overtime_minutes % 60
                            ot_str = f"{ot_hours}h {ot_mins}m"
                    except:
                        pass
                
                # Check for regularization requests
                reg_status = '—'
                reg_query = """
                    SELECT status 
                    FROM att_regularization_requests 
                    WHERE employee_id = %s AND date = %s AND status = 'Pending'
                """
                reg_result = db.execute_query_one(reg_query, (employee_id, row.get('date')))
                if reg_result:
                    reg_status = 'Pending'
                
                attendance_data = {
                    'sno': len(attendance_list) + 1,
                    'workDay': work_day,
                    'date': date_str,
                    'firstPunch': first_punch,
                    'lastPunch': last_punch,
                    'totalHours': total_hours_str,
                    'status': status,
                    'shift': row.get('shift_name') or 'General',
                    'ot': ot_str,
                    'reg': reg_status,
                    'compOff': '—',  # TODO: Add comp-off logic
                    'rowClass': status.lower().replace(' ', '-')
                }
                attendance_list.append(attendance_data)
            
            # Format employee info
            first_name = employee_info.get('first_name', '')
            last_name = employee_info.get('last_name', '')
            initials = f"{first_name[0] if first_name else ''}{last_name[0] if last_name else ''}".upper()
            
            employee_data = {
                'employee_id': employee_info.get('employee_id'),
                'name': f"{first_name} {last_name}".strip(),
                'initials': initials,
                'department': employee_info.get('department_name') or 'N/A',
                'role': employee_info.get('position_name') or 'N/A',
                'emp_code': f"EMP-{employee_id}"
            }
            
            # Calculate pagination
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
            
            # Calculate summary statistics
            summary_dict = AttendanceService._calculate_attendance_summary(
                employee_id, start_date, end_date
            )
            
            return {
                'employee': employee_data,
                'data': attendance_list,  # Already a list of dicts
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_items': total_count,
                    'total_pages': total_pages,
                    'has_next': page < total_pages,
                    'has_previous': page > 1
                },
                'summary': summary_dict
            }
            
        except Exception as e:
            print(f"Error getting employee attendance: {e}")
            import traceback
            traceback.print_exc()
            return {
                'employee': None,
                'data': [],
                'pagination': {
                    'current_page': 1,
                    'page_size': page_size or 10,
                    'total_items': 0,
                    'total_pages': 0,
                    'has_next': False,
                    'has_previous': False
                },
                'summary': {
                    'total_payable_days': 0,
                    'total_present_days': 0,
                    'paid_leaves': 0,
                    'unpaid_leave_absent': 0,
                    'total_holidays': 0,
                    'total_weekends': 0,
                    'total_overtime_earned': '0h 0m',
                    'comp_off_credited': 0,
                    'comp_off_used': 0
                }
            }
    
    @staticmethod
    def _calculate_attendance_summary(
        employee_id: int,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calculate summary statistics for employee attendance"""
        try:
            # Build date filter
            date_filter = ""
            params = [employee_id]
            
            if start_date and end_date:
                date_filter = "AND ada.date BETWEEN %s AND %s"
                params.extend([start_date, end_date])
            elif start_date:
                date_filter = "AND ada.date >= %s"
                params.append(start_date)
            elif end_date:
                date_filter = "AND ada.date <= %s"
                params.append(end_date)
            
            # Debug logging
            print(f"Summary calculation - employee_id: {employee_id}, start_date: {start_date}, end_date: {end_date}")
            print(f"Date filter: {date_filter}, Params: {params}")
            
            # Get all attendance records for summary calculation
            summary_query = f"""
                SELECT 
                    ada.date,
                    ada.status,
                    ada.total_working_hours,
                    DAYOFWEEK(ada.date) as day_of_week,
                    h.holiday_id
                FROM att_daily_attendance ada
                LEFT JOIN att_holiday_calendar h ON h.holiday_date = ada.date 
                    AND h.holiday_type = 'Public' 
                    AND h.status_id = 1
                WHERE ada.employee_id = %s
                {date_filter}
            """
            
            records = db.execute_query_all(summary_query, tuple(params))
            
            # Debug logging
            print(f"Summary query returned {len(records)} records")
            if len(records) > 0:
                print(f"First record: {records[0]}")
            
            # Initialize counters
            total_payable_days = 0
            total_present_days = 0
            paid_leaves = 0
            unpaid_leave_absent = 0
            total_holidays = 0
            total_weekends = 0
            total_overtime_minutes = 0
            
            # Get shift duration for overtime calculation
            shift_query = """
                SELECT s.shift_id, s.start_time, s.end_time, s.break_duration
                FROM att_emp_shift_assignments esa
                JOIN att_shifts s ON s.shift_id = esa.shift_id
                WHERE esa.employee_id = %s
                    AND (esa.effective_to IS NULL OR esa.effective_to >= CURDATE())
                    AND esa.effective_from <= CURDATE()
                ORDER BY esa.effective_from DESC
                LIMIT 1
            """
            shift_info = db.execute_query_one(shift_query, (employee_id,))
            
            # Default shift duration (9 hours = 540 minutes)
            default_shift_minutes = 540
            if shift_info:
                start_time = shift_info.get('start_time')
                end_time = shift_info.get('end_time')
                break_duration = shift_info.get('break_duration', 0) or 0
                
                if start_time and end_time:
                    # Calculate shift duration in minutes
                    if isinstance(start_time, str):
                        start_parts = start_time.split(':')
                        end_parts = end_time.split(':')
                    else:
                        start_parts = str(start_time).split(':')
                        end_parts = str(end_time).split(':')
                    
                    start_minutes = int(start_parts[0]) * 60 + int(start_parts[1])
                    end_minutes = int(end_parts[0]) * 60 + int(end_parts[1])
                    
                    # Handle overnight shifts
                    if end_minutes < start_minutes:
                        end_minutes += 24 * 60
                    
                    default_shift_minutes = (end_minutes - start_minutes) - break_duration
            
            for record in records:
                date_val = record.get('date')
                status = record.get('status', 'Absent')
                day_of_week = record.get('day_of_week', 1)
                is_holiday = record.get('holiday_id') is not None
                total_hours = record.get('total_working_hours')
                
                # Check if it's a weekend (1=Sunday, 7=Saturday)
                is_weekend = day_of_week in [1, 7]
                
                # Count weekends
                if is_weekend:
                    total_weekends += 1
                
                # Count holidays
                if is_holiday:
                    total_holidays += 1
                
                # Count payable days (working days excluding weekends and holidays)
                if not is_weekend and not is_holiday:
                    total_payable_days += 1
                
                # Count present days
                if status == 'Present':
                    total_present_days += 1
                    
                    # Calculate overtime
                    if total_hours:
                        # Parse TIME format (HH:MM:SS)
                        try:
                            if isinstance(total_hours, str):
                                parts = total_hours.split(':')
                                if len(parts) >= 2:
                                    hours = int(parts[0])
                                    minutes = int(parts[1])
                                    total_minutes = hours * 60 + minutes
                                    
                                    # Calculate overtime (total - shift duration)
                                    overtime = total_minutes - default_shift_minutes
                                    if overtime > 0:
                                        total_overtime_minutes += overtime
                        except:
                            pass
                
                # Count paid leaves (status = 'Leave' and approved leave request exists)
                elif status == 'Leave':
                    # Check if there's an approved leave request
                    # Format date_val properly for SQL
                    if isinstance(date_val, date):
                        date_str = date_val.isoformat()
                    elif isinstance(date_val, str):
                        date_str = date_val
                    else:
                        date_str = str(date_val)
                    
                    leave_check_query = """
                        SELECT COUNT(*) as count
                        FROM att_leaves_request
                        WHERE employee_id = %s
                            AND %s >= start_date
                            AND %s <= end_date
                            AND status = 'Approved'
                    """
                    leave_result = db.execute_query_one(leave_check_query, (employee_id, date_str, date_str))
                    if leave_result and leave_result.get('count', 0) > 0:
                        paid_leaves += 1
                    else:
                        unpaid_leave_absent += 1
                
                # Count unpaid leave/absent
                elif status in ['Absent', 'Regularized']:
                    unpaid_leave_absent += 1
            
            # Format overtime
            overtime_hours = total_overtime_minutes // 60
            overtime_mins = total_overtime_minutes % 60
            overtime_str = f"{overtime_hours}h {overtime_mins}m" if total_overtime_minutes > 0 else "0h 0m"
            
            # Get comp-off credits and used (optional - table may not exist)
            comp_off_credited = 0
            comp_off_used = 0
            try:
                comp_off_date_filter = ""
                comp_off_params = [employee_id]
                
                if start_date and end_date:
                    comp_off_date_filter = "AND date BETWEEN %s AND %s"
                    comp_off_params.extend([start_date, end_date])
                elif start_date:
                    comp_off_date_filter = "AND date >= %s"
                    comp_off_params.append(start_date)
                elif end_date:
                    comp_off_date_filter = "AND date <= %s"
                    comp_off_params.append(end_date)
                
                comp_off_query = f"""
                    SELECT 
                        COALESCE(SUM(CASE WHEN type = 'Credit' THEN hours ELSE 0 END), 0) as credited,
                        COALESCE(SUM(CASE WHEN type = 'Used' THEN hours ELSE 0 END), 0) as used
                    FROM att_compensatory_off
                    WHERE employee_id = %s
                    {comp_off_date_filter}
                """
                comp_off_result = db.execute_query_one(comp_off_query, tuple(comp_off_params))
                comp_off_credited = float(comp_off_result.get('credited', 0) or 0) if comp_off_result else 0
                comp_off_used = float(comp_off_result.get('used', 0) or 0) if comp_off_result else 0
            except Exception as comp_off_error:
                # Table doesn't exist or error - set to 0
                print(f"Comp-off table not available (ignoring): {comp_off_error}")
                comp_off_credited = 0
                comp_off_used = 0
            
            summary_result = {
                'total_payable_days': total_payable_days,
                'total_present_days': total_present_days,
                'paid_leaves': paid_leaves,
                'unpaid_leave_absent': unpaid_leave_absent,
                'total_holidays': total_holidays,
                'total_weekends': total_weekends,
                'total_overtime_earned': overtime_str,
                'comp_off_credited': int(comp_off_credited),
                'comp_off_used': int(comp_off_used)
            }
            
            print(f"Summary result: {summary_result}")
            return summary_result
            
        except Exception as e:
            print(f"Error calculating attendance summary: {e}")
            import traceback
            traceback.print_exc()
            return {
                'total_payable_days': 0,
                'total_present_days': 0,
                'paid_leaves': 0,
                'unpaid_leave_absent': 0,
                'total_holidays': 0,
                'total_weekends': 0,
                'total_overtime_earned': '0h 0m',
                'comp_off_credited': 0,
                'comp_off_used': 0
            }
    
    @staticmethod
    def get_regularization_requests(
        employee_id: int,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: Optional[int] = 1,
        page_size: Optional[int] = 10
    ) -> Dict[str, Any]:
        """Get regularization requests for a specific employee"""
        try:
            from datetime import datetime, date
            
            # Get employee basic info
            employee_query = """
                SELECT 
                    e.employee_id,
                    e.first_name,
                    e.last_name,
                    d.department_name,
                    p.position_name
                FROM emp_employee e
                LEFT JOIN departments d ON d.department_id = e.department_id
                LEFT JOIN positions p ON p.position_id = e.position_id
                WHERE e.employee_id = %s
            """
            employee_info = db.execute_query_one(employee_query, (employee_id,))
            
            print(f"DEBUG: Regularization requests - employee_id: {employee_id}")
            print(f"DEBUG: Employee info fetched: {employee_info}")
            print(f"DEBUG: Date filter - start_date: {start_date}, end_date: {end_date}")
            
            if not employee_info:
                print(f"DEBUG: No employee found for ID: {employee_id}")
                return {
                    'employee': None,
                    'data': [],
                    'pagination': {
                        'current_page': 1,
                        'page_size': page_size or 10,
                        'total_items': 0,
                        'total_pages': 0,
                        'has_next': False,
                        'has_previous': False
                    }
                }
            
            # Format employee data early so it's always available
            first_name = employee_info.get('first_name', '')
            last_name = employee_info.get('last_name', '')
            initials = f"{first_name[0] if first_name else ''}{last_name[0] if last_name else ''}".upper()
            
            employee_data = {
                'employee_id': employee_info.get('employee_id'),
                'name': f"{first_name} {last_name}".strip(),
                'initials': initials,
                'department': employee_info.get('department_name') or 'N/A',
                'role': employee_info.get('position_name') or 'N/A',
                'emp_code': f"EMP-{employee_id}"
            }
            
            print(f"DEBUG: Formatted employee data: {employee_data}")
            
            # Build date filter
            date_filter = ""
            params = [employee_id]
            
            if start_date and end_date:
                date_filter = "AND arr.date BETWEEN %s AND %s"
                params.extend([start_date, end_date])
            elif start_date:
                date_filter = "AND arr.date >= %s"
                params.append(start_date)
            elif end_date:
                date_filter = "AND arr.date <= %s"
                params.append(end_date)
            
            # Get total count
            count_query = f"""
                SELECT COUNT(*) as total
                FROM att_regularization_requests arr
                WHERE arr.employee_id = %s
                {date_filter}
            """
            print(f"DEBUG: Count query: {count_query}")
            print(f"DEBUG: Count params: {params}")
            total_result = db.execute_query_one(count_query, tuple(params))
            total_count = total_result.get('total', 0) if total_result else 0
            print(f"DEBUG: Total count: {total_count}")
            
            # Get regularization requests with pagination
            # Calculate old_hours and new_hours using SQL TIMEDIFF
            query = f"""
                SELECT 
                    arr.request_id,
                    arr.employee_id,
                    arr.date,
                    arr.old_check_in,
                    arr.old_check_out,
                    arr.corrected_check_in,
                    arr.corrected_check_out,
                    arr.regularization_type,
                    arr.reason,
                    arr.status as request_status,
                    arr.approved_by,
                    arr.created_at,
                    arr.updated_at,
                    CASE 
                        WHEN arr.old_check_in IS NULL OR arr.old_check_out IS NULL 
                        THEN '00:00'
                        ELSE TIME_FORMAT(
                            CASE 
                                WHEN TIMEDIFF(arr.old_check_out, arr.old_check_in) < 0
                                THEN ADDTIME(TIMEDIFF(arr.old_check_out, arr.old_check_in), '24:00:00')
                                ELSE TIMEDIFF(arr.old_check_out, arr.old_check_in)
                            END, 
                            '%%H:%%i'
                        )
                    END AS old_hours,
                    CASE 
                        WHEN arr.corrected_check_in IS NULL OR arr.corrected_check_out IS NULL
                        THEN '00:00'
                        ELSE TIME_FORMAT(
                            CASE 
                                WHEN TIMEDIFF(arr.corrected_check_out, arr.corrected_check_in) < 0
                                THEN ADDTIME(TIMEDIFF(arr.corrected_check_out, arr.corrected_check_in), '24:00:00')
                                ELSE TIMEDIFF(arr.corrected_check_out, arr.corrected_check_in)
                            END, 
                            '%%H:%%i'
                        )
                    END AS new_hours
                FROM att_regularization_requests arr
                WHERE arr.employee_id = %s
                {date_filter}
                ORDER BY arr.date DESC, arr.created_at DESC
            """
            
            # Add pagination
            page = page or 1
            page_size = page_size or 10
            offset = (page - 1) * page_size
            query += f" LIMIT %s OFFSET %s"
            params.append(page_size)
            params.append(offset)
            
            print(f"DEBUG: Regularization query: {query}")
            print(f"DEBUG: Regularization query params: {params}")
            print(f"DEBUG: Regularization date filter: start_date={start_date}, end_date={end_date}")
            results = db.execute_query_all(query, tuple(params))
            print(f"DEBUG: Regularization query returned {len(results)} records")
            if len(results) > 0:
                print(f"DEBUG: First regularization record: {results[0]}")
                print(f"DEBUG: First record old_hours: {results[0].get('old_hours')}")
                print(f"DEBUG: First record new_hours: {results[0].get('new_hours')}")
            else:
                print(f"DEBUG: WARNING - No regularization records found for employee_id={employee_id}, date_range={start_date} to {end_date}")
                # Check if employee has any records at all
                check_query = "SELECT COUNT(*) as total FROM att_regularization_requests WHERE employee_id = %s"
                check_result = db.execute_query_one(check_query, (employee_id,))
                total_for_employee = check_result.get('total', 0) if check_result else 0
                print(f"DEBUG: Total regularization records for employee {employee_id}: {total_for_employee}")
                if total_for_employee > 0:
                    # Check date range of existing records
                    date_range_query = "SELECT MIN(date) as min_date, MAX(date) as max_date FROM att_regularization_requests WHERE employee_id = %s"
                    date_range_result = db.execute_query_one(date_range_query, (employee_id,))
                    if date_range_result:
                        print(f"DEBUG: Employee {employee_id} has records from {date_range_result.get('min_date')} to {date_range_result.get('max_date')}")
            
            # Format regularization requests
            requests_list = []
            for row in results:
                # Format date
                request_date = row.get('date')
                if isinstance(request_date, date):
                    date_str = request_date.strftime('%d-%b-%Y')
                elif isinstance(request_date, str):
                    try:
                        dt = datetime.strptime(request_date, '%Y-%m-%d')
                        date_str = dt.strftime('%d-%b-%Y')
                    except:
                        date_str = request_date
                else:
                    date_str = str(request_date)
                
                # Get old_hours and new_hours from SQL calculation
                old_hours_str = row.get('old_hours') or '00:00'
                new_hours_str = row.get('new_hours') or '00:00'
                
                # Convert '00:00' to '—' for display if both check-in/out are NULL
                old_check_in = row.get('old_check_in')
                old_check_out = row.get('old_check_out')
                if old_hours_str == '00:00' and (old_check_in is None or old_check_out is None):
                    # Only show '—' if at least one is NULL (meaning no valid time data)
                    if old_check_in is None and old_check_out is None:
                        old_hours_str = '—'
                    # If only one is NULL, keep '00:00' to indicate incomplete data
                
                corrected_check_in = row.get('corrected_check_in')
                corrected_check_out = row.get('corrected_check_out')
                if new_hours_str == '00:00' and (corrected_check_in is None or corrected_check_out is None):
                    # Only show '—' if at least one is NULL (meaning no valid time data)
                    if corrected_check_in is None and corrected_check_out is None:
                        new_hours_str = '—'
                    # If only one is NULL, keep '00:00' to indicate incomplete data
                
                # Determine old status based on old hours
                # If old hours is '—' or '00:00', status is Absent
                old_status = 'Absent'
                if old_hours_str != '—' and old_hours_str != '00:00':
                    try:
                        parts = old_hours_str.split(':')
                        if len(parts) >= 2:
                            hours = int(parts[0])
                            minutes = int(parts[1])
                            total_minutes = hours * 60 + minutes
                            if total_minutes >= 480:  # 8 hours
                                old_status = 'Present'
                            elif total_minutes > 0:
                                old_status = 'Present'  # Partial day
                    except:
                        pass
                
                # New status is always 'Present' if corrected times are provided
                corrected_check_in = row.get('corrected_check_in')
                corrected_check_out = row.get('corrected_check_out')
                new_status = 'Present' if corrected_check_in and corrected_check_out else 'Absent'
                
                request_status = row.get('request_status') or 'Pending'
                regularization_type = row.get('regularization_type') or 'Missed Punch'
                
                # Parse date properly - convert to ISO string for API
                request_date_val = row.get('date')
                if isinstance(request_date_val, str):
                    request_date_str = request_date_val
                elif isinstance(request_date_val, date):
                    request_date_str = request_date_val.isoformat()
                elif isinstance(request_date_val, datetime):
                    request_date_str = request_date_val.date().isoformat()
                else:
                    request_date_str = date.today().isoformat()
                
                # Parse datetime fields - convert to ISO strings
                created_at_val = row.get('created_at')
                if isinstance(created_at_val, str):
                    created_at_str = created_at_val
                elif isinstance(created_at_val, datetime):
                    created_at_str = created_at_val.isoformat()
                else:
                    created_at_str = datetime.now().isoformat()
                
                updated_at_val = row.get('updated_at')
                if isinstance(updated_at_val, str):
                    updated_at_str = updated_at_val
                elif isinstance(updated_at_val, datetime):
                    updated_at_str = updated_at_val.isoformat()
                else:
                    updated_at_str = datetime.now().isoformat()
                
                # Format time fields for CSV export
                def format_time_for_csv(time_val):
                    """Format time value for CSV export"""
                    from datetime import timedelta
                    if time_val is None:
                        return ''
                    if isinstance(time_val, str):
                        # Try to parse and format
                        try:
                            # Handle time string format (HH:MM:SS or HH:MM)
                            if ':' in time_val:
                                parts = time_val.split(':')
                                hours = int(parts[0])
                                minutes = int(parts[1]) if len(parts) > 1 else 0
                                # Format as 12-hour time
                                if hours == 0:
                                    return f'12:{str(minutes).zfill(2)} AM'
                                elif hours < 12:
                                    return f'{hours}:{str(minutes).zfill(2)} AM'
                                elif hours == 12:
                                    return f'12:{str(minutes).zfill(2)} PM'
                                else:
                                    return f'{hours - 12}:{str(minutes).zfill(2)} PM'
                            return time_val
                        except:
                            return time_val
                    elif isinstance(time_val, timedelta):
                        # Convert timedelta to time string
                        total_seconds = int(time_val.total_seconds())
                        hours = (total_seconds // 3600) % 24
                        minutes = (total_seconds % 3600) // 60
                        if hours == 0:
                            return f'12:{str(minutes).zfill(2)} AM'
                        elif hours < 12:
                            return f'{hours}:{str(minutes).zfill(2)} AM'
                        elif hours == 12:
                            return f'12:{str(minutes).zfill(2)} PM'
                        else:
                            return f'{hours - 12}:{str(minutes).zfill(2)} PM'
                    elif hasattr(time_val, 'strftime'):
                        # datetime.time object
                        return time_val.strftime('%I:%M %p')
                    return str(time_val)
                
                old_check_in_formatted = format_time_for_csv(row.get('old_check_in'))
                old_check_out_formatted = format_time_for_csv(row.get('old_check_out'))
                corrected_check_in_formatted = format_time_for_csv(row.get('corrected_check_in'))
                corrected_check_out_formatted = format_time_for_csv(row.get('corrected_check_out'))
                
                request_data = {
                    'request_id': row.get('request_id'),
                    'employee_id': employee_id,
                    'date': date_str,
                    'reason': row.get('reason') or '',
                    'regularization_type': regularization_type,
                    'new_status': new_status,
                    'status': request_status,
                    'approved_by': row.get('approved_by'),
                    'created_at': created_at_str,
                    'updated_at': updated_at_str,
                    'old_status': old_status,
                    'old_hours': old_hours_str,
                    'new_hours': new_hours_str,
                    'old_check_in': old_check_in_formatted,
                    'old_check_out': old_check_out_formatted,
                    'corrected_check_in': corrected_check_in_formatted,
                    'corrected_check_out': corrected_check_out_formatted
                }
                requests_list.append(request_data)
            
            # Employee data already formatted above
            print(f"DEBUG: Requests list length: {len(requests_list)}")
            
            # Calculate pagination
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
            
            result = {
                'employee': employee_data,
                'data': requests_list,
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_items': total_count,
                    'total_pages': total_pages,
                    'has_next': page < total_pages,
                    'has_previous': page > 1
                }
            }
            
            print(f"DEBUG: Final result: employee={result['employee'] is not None}, employee_name={result['employee']['name'] if result['employee'] else 'None'}, data_count={len(result['data'])}")
            if len(result['data']) == 0:
                print(f"DEBUG: WARNING - No requests found. Check if dates match: start_date={start_date}, end_date={end_date}")
            return result
            
        except Exception as e:
            print(f"Error getting regularization requests: {e}")
            import traceback
            traceback.print_exc()
            return {
                'employee': None,
                'data': [],
                'pagination': {
                    'current_page': 1,
                    'page_size': page_size or 10,
                    'total_items': 0,
                    'total_pages': 0,
                    'has_next': False,
                    'has_previous': False
                }
            }
    
    @staticmethod
    def get_leave_requests(
        employee_id: int,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: Optional[int] = 1,
        page_size: Optional[int] = 10
    ) -> Dict[str, Any]:
        """Get leave requests for a specific employee"""
        try:
            from datetime import datetime, date
            
            # Get employee basic info
            employee_query = """
                SELECT 
                    e.employee_id,
                    e.first_name,
                    e.last_name,
                    d.department_name,
                    p.position_name
                FROM emp_employee e
                LEFT JOIN departments d ON d.department_id = e.department_id
                LEFT JOIN positions p ON p.position_id = e.position_id
                WHERE e.employee_id = %s
            """
            employee_info = db.execute_query_one(employee_query, (employee_id,))
            
            print(f"DEBUG: Leave requests - employee_id: {employee_id}")
            print(f"DEBUG: Employee info fetched: {employee_info}")
            print(f"DEBUG: Date filter - start_date: {start_date}, end_date: {end_date}")
            
            if not employee_info:
                print(f"DEBUG: No employee found for ID: {employee_id}")
                return {
                    'employee': None,
                    'data': [],
                    'pagination': {
                        'current_page': 1,
                        'page_size': page_size or 10,
                        'total_items': 0,
                        'total_pages': 0,
                        'has_next': False,
                        'has_previous': False
                    }
                }
            
            # Format employee data
            first_name = employee_info.get('first_name', '')
            last_name = employee_info.get('last_name', '')
            initials = f"{first_name[0] if first_name else ''}{last_name[0] if last_name else ''}".upper()
            
            employee_data = {
                'employee_id': employee_info.get('employee_id'),
                'name': f"{first_name} {last_name}".strip(),
                'initials': initials,
                'department': employee_info.get('department_name') or 'N/A',
                'role': employee_info.get('position_name') or 'N/A',
                'emp_code': f"EMP-{employee_id}"
            }
            
            print(f"DEBUG: Formatted employee data: {employee_data}")
            
            # Build date filter - filter by start_date or end_date range
            date_filter = ""
            params = [employee_id]
            
            if start_date and end_date:
                date_filter = "AND (lr.start_date BETWEEN %s AND %s OR lr.end_date BETWEEN %s AND %s OR (lr.start_date <= %s AND lr.end_date >= %s))"
                params.extend([start_date, end_date, start_date, end_date, start_date, end_date])
            elif start_date:
                date_filter = "AND lr.end_date >= %s"
                params.append(start_date)
            elif end_date:
                date_filter = "AND lr.start_date <= %s"
                params.append(end_date)
            
            # Get total count
            count_query = f"""
                SELECT COUNT(*) as total
                FROM att_leaves_request lr
                WHERE lr.employee_id = %s
                {date_filter}
            """
            print(f"DEBUG: Count query: {count_query}")
            print(f"DEBUG: Count params: {params}")
            total_result = db.execute_query_one(count_query, tuple(params))
            total_count = total_result.get('total', 0) if total_result else 0
            print(f"DEBUG: Total count: {total_count}")
            
            # Get leave requests with pagination
            query = f"""
                SELECT 
                    lr.leave_id,
                    lr.employee_id,
                    lr.leave_type_id,
                    lr.requested_to,
                    lr.start_date,
                    lr.end_date,
                    lr.request_date,
                    lr.status,
                    lr.comments,
                    lr.approved_by,
                    lr.approved_date,
                    lr.created_at,
                    lr.updated_at,
                    lt.leave_type_name
                FROM att_leaves_request lr
                LEFT JOIN att_leave_type lt ON lt.leave_type_id = lr.leave_type_id
                WHERE lr.employee_id = %s
                {date_filter}
                ORDER BY lr.start_date DESC, lr.request_date DESC
            """
            
            # Add pagination
            page = page or 1
            page_size = page_size or 10
            offset = (page - 1) * page_size
            query += f" LIMIT %s OFFSET %s"
            params.append(page_size)
            params.append(offset)
            
            print(f"DEBUG: Main query: {query}")
            print(f"DEBUG: Query params: {params}")
            results = db.execute_query_all(query, tuple(params))
            print(f"DEBUG: Query returned {len(results)} records")
            if len(results) > 0:
                print(f"DEBUG: First record: {results[0]}")
            
            # Format leave requests
            requests_list = []
            for row in results:
                # Format dates
                start_date_val = row.get('start_date')
                end_date_val = row.get('end_date')
                request_date_val = row.get('request_date')
                approved_date_val = row.get('approved_date')
                
                def format_date(date_val):
                    if isinstance(date_val, date):
                        return date_val.strftime('%d-%b-%Y')
                    elif isinstance(date_val, str):
                        try:
                            dt = datetime.strptime(date_val, '%Y-%m-%d')
                            return dt.strftime('%d-%b-%Y')
                        except:
                            return date_val
                    elif isinstance(date_val, datetime):
                        return date_val.date().strftime('%d-%b-%Y')
                    else:
                        return str(date_val) if date_val else '—'
                
                start_date_str = format_date(start_date_val)
                end_date_str = format_date(end_date_val)
                request_date_str = format_date(request_date_val)
                approved_date_str = format_date(approved_date_val) if approved_date_val else '—'
                
                # Calculate duration
                if start_date_val and end_date_val:
                    if isinstance(start_date_val, str):
                        start = datetime.strptime(start_date_val, '%Y-%m-%d').date()
                    elif isinstance(start_date_val, datetime):
                        start = start_date_val.date()
                    else:
                        start = start_date_val
                    
                    if isinstance(end_date_val, str):
                        end = datetime.strptime(end_date_val, '%Y-%m-%d').date()
                    elif isinstance(end_date_val, datetime):
                        end = end_date_val.date()
                    else:
                        end = end_date_val
                    
                    days = (end - start).days + 1
                    duration_str = f"{days} day{'s' if days > 1 else ''}"
                else:
                    duration_str = '—'
                
                # Format status
                status = row.get('status') or 'Pending'
                
                # Parse datetime fields
                created_at_val = row.get('created_at')
                if isinstance(created_at_val, str):
                    created_at_str = created_at_val
                elif isinstance(created_at_val, datetime):
                    created_at_str = created_at_val.isoformat()
                else:
                    created_at_str = datetime.now().isoformat()
                
                updated_at_val = row.get('updated_at')
                if isinstance(updated_at_val, str):
                    updated_at_str = updated_at_val
                elif isinstance(updated_at_val, datetime):
                    updated_at_str = updated_at_val.isoformat()
                else:
                    updated_at_str = datetime.now().isoformat()
                
                request_data = {
                    'leave_id': row.get('leave_id'),
                    'employee_id': employee_id,
                    'leave_type': row.get('leave_type_name') or 'N/A',
                    'start_date': start_date_str,
                    'end_date': end_date_str,
                    'request_date': request_date_str,
                    'duration': duration_str,
                    'status': status,
                    'comments': row.get('comments') or '',
                    'approved_by': row.get('approved_by'),
                    'approved_date': approved_date_str,
                    'created_at': created_at_str,
                    'updated_at': updated_at_str
                }
                requests_list.append(request_data)
            
            # Calculate pagination
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
            
            result = {
                'employee': employee_data,
                'data': requests_list,
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_items': total_count,
                    'total_pages': total_pages,
                    'has_next': page < total_pages,
                    'has_previous': page > 1
                }
            }
            
            print(f"DEBUG: Final result: employee={result['employee'] is not None}, employee_name={result['employee']['name'] if result['employee'] else 'None'}, data_count={len(result['data'])}")
            return result
            
        except Exception as e:
            print(f"Error getting leave requests: {e}")
            import traceback
            traceback.print_exc()
            return {
                'employee': None,
                'data': [],
                'pagination': {
                    'current_page': 1,
                    'page_size': page_size or 10,
                    'total_items': 0,
                    'total_pages': 0,
                    'has_next': False,
                    'has_previous': False
                }
            }
    
    @staticmethod
    def get_leave_summary(
        employee_id: int,
        year: Optional[int] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get leave summary for an employee including absent days, upcoming/past leaves, and holidays"""
        try:
            from datetime import datetime, date, timedelta
            
            # Get employee basic info
            employee_query = """
                SELECT 
                    e.employee_id,
                    e.first_name,
                    e.last_name,
                    d.department_name,
                    p.position_name
                FROM emp_employee e
                LEFT JOIN departments d ON d.department_id = e.department_id
                LEFT JOIN positions p ON p.position_id = e.position_id
                WHERE e.employee_id = %s
            """
            employee_info = db.execute_query_one(employee_query, (employee_id,))
            
            if not employee_info:
                return {
                    'employee': None,
                    'absent_days': [],
                    'upcoming_leaves': [],
                    'past_leaves': [],
                    'upcoming_holidays': [],
                    'past_holidays': [],
                    'summary': {
                        'total_absent_days': 0,
                        'total_upcoming_leaves': 0,
                        'total_past_leaves': 0,
                        'total_upcoming_holidays': 0,
                        'total_past_holidays': 0
                    }
                }
            
            # Format employee data
            first_name = employee_info.get('first_name', '')
            last_name = employee_info.get('last_name', '')
            initials = f"{first_name[0] if first_name else ''}{last_name[0] if last_name else ''}".upper()
            
            employee_data = {
                'employee_id': employee_info.get('employee_id'),
                'name': f"{first_name} {last_name}".strip(),
                'initials': initials,
                'department': employee_info.get('department_name') or 'N/A',
                'role': employee_info.get('position_name') or 'N/A',
                'emp_code': f"EMP-{employee_id}"
            }
            
            # Determine date range: use year if provided, otherwise use start_date/end_date, otherwise current year
            today = date.today()
            if start_date and end_date:
                # Use provided dates
                pass
            elif year:
                # Use year to set date range
                start_date = date(year, 1, 1).isoformat()
                end_date = date(year, 12, 31).isoformat()
            else:
                # Default to current year
                start_date = date(today.year, 1, 1).isoformat()
                end_date = date(today.year, 12, 31).isoformat()
            
            # Get the year for filtering
            selected_year = year if year else today.year
            
            # 1. Get Absent Days (unpaid - from att_daily_attendance where status = 'Absent')
            absent_query = """
                SELECT 
                    ada.date,
                    ada.status,
                    DAYOFWEEK(ada.date) as day_of_week
                FROM att_daily_attendance ada
                WHERE ada.employee_id = %s
                    AND ada.date BETWEEN %s AND %s
                    AND ada.status = 'Absent'
                ORDER BY ada.date DESC
            """
            absent_results = db.execute_query_all(absent_query, (employee_id, start_date, end_date))
            
            absent_days = []
            for row in absent_results:
                attendance_date = row.get('date')
                if isinstance(attendance_date, date):
                    date_str = attendance_date.strftime('%d-%b-%Y')
                    day_name = attendance_date.strftime('%A')
                elif isinstance(attendance_date, str):
                    try:
                        dt = datetime.strptime(attendance_date, '%Y-%m-%d')
                        date_str = dt.strftime('%d-%b-%Y')
                        day_name = dt.strftime('%A')
                    except:
                        date_str = attendance_date
                        day_name = ''
                else:
                    date_str = str(attendance_date)
                    day_name = ''
                
                absent_days.append({
                    'date': row.get('date').isoformat() if isinstance(row.get('date'), date) else row.get('date'),
                    'date_formatted': f"{date_str}, {day_name}",
                    'duration': '1 day',
                    'status': 'Absent'
                })
            
            # 2. Get Upcoming Leaves (from att_leaves_request where start_date > today and status = 'Approved' and within selected year)
            upcoming_leaves_query = """
                SELECT 
                    lr.leave_id,
                    lr.start_date,
                    lr.end_date,
                    lr.status,
                    lr.comments,
                    lt.leave_type_name,
                    DATEDIFF(lr.end_date, lr.start_date) + 1 as duration_days
                FROM att_leaves_request lr
                LEFT JOIN att_leave_type lt ON lt.leave_type_id = lr.leave_type_id
                WHERE lr.employee_id = %s
                    AND lr.start_date > CURDATE()
                    AND YEAR(lr.start_date) = %s
                    AND lr.status = 'Approved'
                ORDER BY lr.start_date ASC
            """
            upcoming_leaves_results = db.execute_query_all(upcoming_leaves_query, (employee_id, selected_year))
            
            upcoming_leaves = []
            for row in upcoming_leaves_results:
                start_date_val = row.get('start_date')
                end_date_val = row.get('end_date')
                duration_days = row.get('duration_days', 1)
                
                if isinstance(start_date_val, date):
                    date_str = start_date_val.strftime('%d-%b-%Y')
                    day_name = start_date_val.strftime('%A')
                elif isinstance(start_date_val, str):
                    try:
                        dt = datetime.strptime(start_date_val, '%Y-%m-%d')
                        date_str = dt.strftime('%d-%b-%Y')
                        day_name = dt.strftime('%A')
                    except:
                        date_str = start_date_val
                        day_name = ''
                else:
                    date_str = str(start_date_val)
                    day_name = ''
                
                duration_str = f"{duration_days} day{'s' if duration_days > 1 else ''}"
                if duration_days == 0.5:
                    duration_str = "0.5 day"
                
                upcoming_leaves.append({
                    'leave_id': row.get('leave_id'),
                    'date': start_date_val.isoformat() if isinstance(start_date_val, date) else start_date_val,
                    'date_formatted': f"{date_str}, {day_name}",
                    'leave_type': row.get('leave_type_name') or 'Leave',
                    'duration': duration_str,
                    'status': row.get('status') or 'Approved',
                    'comments': row.get('comments') or ''
                })
            
            # 3. Get Past Leaves (from att_leaves_request where end_date <= today and status = 'Approved')
            past_leaves_query = """
                SELECT 
                    lr.leave_id,
                    lr.start_date,
                    lr.end_date,
                    lr.status,
                    lr.comments,
                    lt.leave_type_name,
                    DATEDIFF(lr.end_date, lr.start_date) + 1 as duration_days
                FROM att_leaves_request lr
                LEFT JOIN att_leave_type lt ON lt.leave_type_id = lr.leave_type_id
                WHERE lr.employee_id = %s
                    AND lr.end_date <= CURDATE()
                    AND lr.status = 'Approved'
                    AND lr.start_date BETWEEN %s AND %s
                ORDER BY lr.start_date DESC
            """
            past_leaves_results = db.execute_query_all(past_leaves_query, (employee_id, start_date, end_date))
            
            past_leaves = []
            for row in past_leaves_results:
                start_date_val = row.get('start_date')
                duration_days = row.get('duration_days', 1)
                
                if isinstance(start_date_val, date):
                    date_str = start_date_val.strftime('%d-%b-%Y')
                    day_name = start_date_val.strftime('%A')
                elif isinstance(start_date_val, str):
                    try:
                        dt = datetime.strptime(start_date_val, '%Y-%m-%d')
                        date_str = dt.strftime('%d-%b-%Y')
                        day_name = dt.strftime('%A')
                    except:
                        date_str = start_date_val
                        day_name = ''
                else:
                    date_str = str(start_date_val)
                    day_name = ''
                
                duration_str = f"{duration_days} day{'s' if duration_days > 1 else ''}"
                if duration_days == 0.5:
                    duration_str = "0.5 day"
                
                past_leaves.append({
                    'leave_id': row.get('leave_id'),
                    'date': start_date_val.isoformat() if isinstance(start_date_val, date) else start_date_val,
                    'date_formatted': f"{date_str}, {day_name}",
                    'leave_type': row.get('leave_type_name') or 'Leave',
                    'duration': duration_str,
                    'status': row.get('status') or 'Approved',
                    'comments': row.get('comments') or ''
                })
            
            # 4. Get Upcoming Holidays (from att_holiday_calendar where holiday_date > today and within selected year)
            upcoming_holidays_query = """
                SELECT 
                    holiday_id,
                    holiday_name,
                    holiday_date,
                    holiday_type
                FROM att_holiday_calendar
                WHERE holiday_date > CURDATE()
                    AND YEAR(holiday_date) = %s
                    AND status_id = 1
                ORDER BY holiday_date ASC
            """
            upcoming_holidays_results = db.execute_query_all(upcoming_holidays_query, (selected_year,))
            
            upcoming_holidays = []
            for row in upcoming_holidays_results:
                holiday_date_val = row.get('holiday_date')
                if isinstance(holiday_date_val, date):
                    date_str = holiday_date_val.strftime('%d-%b-%Y')
                    day_name = holiday_date_val.strftime('%A')
                elif isinstance(holiday_date_val, str):
                    try:
                        dt = datetime.strptime(holiday_date_val, '%Y-%m-%d')
                        date_str = dt.strftime('%d-%b-%Y')
                        day_name = dt.strftime('%A')
                    except:
                        date_str = holiday_date_val
                        day_name = ''
                else:
                    date_str = str(holiday_date_val)
                    day_name = ''
                
                upcoming_holidays.append({
                    'holiday_id': row.get('holiday_id'),
                    'date': holiday_date_val.isoformat() if isinstance(holiday_date_val, date) else holiday_date_val,
                    'date_formatted': f"{date_str}, {day_name}",
                    'holiday_name': row.get('holiday_name') or 'Holiday',
                    'holiday_type': row.get('holiday_type') or 'Public'
                })
            
            # 5. Get Past Holidays (from att_holiday_calendar where holiday_date <= today and within date range)
            past_holidays_query = """
                SELECT 
                    holiday_id,
                    holiday_name,
                    holiday_date,
                    holiday_type
                FROM att_holiday_calendar
                WHERE holiday_date <= CURDATE()
                    AND holiday_date BETWEEN %s AND %s
                    AND status_id = 1
                ORDER BY holiday_date DESC
            """
            past_holidays_results = db.execute_query_all(past_holidays_query, (start_date, end_date))
            
            past_holidays = []
            for row in past_holidays_results:
                holiday_date_val = row.get('holiday_date')
                if isinstance(holiday_date_val, date):
                    date_str = holiday_date_val.strftime('%d-%b-%Y')
                    day_name = holiday_date_val.strftime('%A')
                elif isinstance(holiday_date_val, str):
                    try:
                        dt = datetime.strptime(holiday_date_val, '%Y-%m-%d')
                        date_str = dt.strftime('%d-%b-%Y')
                        day_name = dt.strftime('%A')
                    except:
                        date_str = holiday_date_val
                        day_name = ''
                else:
                    date_str = str(holiday_date_val)
                    day_name = ''
                
                past_holidays.append({
                    'holiday_id': row.get('holiday_id'),
                    'date': holiday_date_val.isoformat() if isinstance(holiday_date_val, date) else holiday_date_val,
                    'date_formatted': f"{date_str}, {day_name}",
                    'holiday_name': row.get('holiday_name') or 'Holiday',
                    'holiday_type': row.get('holiday_type') or 'Public'
                })
            
            # Calculate summary
            summary = {
                'total_absent_days': len(absent_days),
                'total_upcoming_leaves': len(upcoming_leaves),
                'total_past_leaves': len(past_leaves),
                'total_upcoming_holidays': len(upcoming_holidays),
                'total_past_holidays': len(past_holidays)
            }
            
            return {
                'employee': employee_data,
                'absent_days': absent_days,
                'upcoming_leaves': upcoming_leaves,
                'past_leaves': past_leaves,
                'upcoming_holidays': upcoming_holidays,
                'past_holidays': past_holidays,
                'summary': summary
            }
            
        except Exception as e:
            print(f"Error getting leave summary: {e}")
            import traceback
            traceback.print_exc()
            return {
                'employee': None,
                'absent_days': [],
                'upcoming_leaves': [],
                'past_leaves': [],
                'upcoming_holidays': [],
                'past_holidays': [],
                'summary': {
                    'total_absent_days': 0,
                    'total_upcoming_leaves': 0,
                    'total_past_leaves': 0,
                    'total_upcoming_holidays': 0,
                    'total_past_holidays': 0
                }
            }
    
    @staticmethod
    def get_leave_balance(
        employee_id: int,
        year: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get leave balance for an employee showing available and booked days for each leave type"""
        try:
            from datetime import datetime, date
            
            # Default to current year if not provided
            if not year:
                year = date.today().year
            
            # Get employee basic info
            employee_query = """
                SELECT 
                    e.employee_id,
                    e.first_name,
                    e.last_name,
                    d.department_name,
                    p.position_name
                FROM emp_employee e
                LEFT JOIN departments d ON d.department_id = e.department_id
                LEFT JOIN positions p ON p.position_id = e.position_id
                WHERE e.employee_id = %s
            """
            employee_info = db.execute_query_one(employee_query, (employee_id,))
            
            if not employee_info:
                return {
                    'employee': None,
                    'leave_balances': [],
                    'year': year
                }
            
            # Format employee data
            first_name = employee_info.get('first_name', '')
            last_name = employee_info.get('last_name', '')
            initials = f"{first_name[0] if first_name else ''}{last_name[0] if last_name else ''}".upper()
            
            employee_data = {
                'employee_id': employee_info.get('employee_id'),
                'name': f"{first_name} {last_name}".strip(),
                'initials': initials,
                'department': employee_info.get('department_name') or 'N/A',
                'role': employee_info.get('position_name') or 'N/A',
                'emp_code': f"EMP-{employee_id}"
            }
            
            # Get leave balances for the employee for the specified year
            # Use GROUP BY to handle any duplicate entries (shouldn't happen, but safety measure)
            balance_query = """
                SELECT 
                    MAX(elb.balance_id) as balance_id,
                    elb.leave_type_id,
                    elb.year,
                    MAX(elb.total_allocated) as total_allocated,
                    MAX(elb.used) as used,
                    MAX(elb.remaining) as remaining,
                    MAX(elb.carried_forward) as carried_forward,
                    MAX(lt.leave_type_name) as leave_type_name,
                    MAX(lt.description) as description
                FROM att_emp_leave_balance elb
                LEFT JOIN att_leave_type lt ON lt.leave_type_id = elb.leave_type_id
                WHERE elb.employee_id = %s
                    AND elb.year = %s
                GROUP BY elb.leave_type_id, elb.year
                ORDER BY leave_type_name ASC
            """
            balance_results = db.execute_query_all(balance_query, (employee_id, year))
            
            # Format days helper function - matches image format (e.g., "0.94 day", "4.5 days")
            def formatDays(days):
                days_float = float(days) if days else 0.0
                if days_float == 0:
                    return "0 day"
                elif days_float == 1:
                    return "1 day"
                elif days_float == int(days_float):
                    return f"{int(days_float)} days"
                else:
                    # For decimals, show 2 decimal places (e.g., 0.94 day, 4.5 days)
                    # Remove trailing zeros for cleaner display
                    formatted = f"{days_float:.2f}".rstrip('0').rstrip('.')
                    return f"{formatted} day{'s' if days_float > 1 else ''}"
            
            leave_balances = []
            for row in balance_results:
                # Format days - handle decimal values (e.g., 0.94 day, 4.5 days)
                total_allocated = float(row.get('total_allocated', 0) or 0)
                used = float(row.get('used', 0) or 0)
                remaining = float(row.get('remaining', 0) or 0)
                carried_forward = float(row.get('carried_forward', 0) or 0)
                
                leave_balances.append({
                    'balance_id': row.get('balance_id'),
                    'leave_type_id': row.get('leave_type_id'),
                    'leave_type_name': row.get('leave_type_name') or 'Unknown',
                    'description': row.get('description') or '',
                    'total_allocated': formatDays(total_allocated),
                    'used': formatDays(used),
                    'available': formatDays(remaining),
                    'booked': formatDays(used),  # Same as used
                    'remaining': remaining,  # Keep numeric for sorting
                    'carried_forward': formatDays(carried_forward),
                    'year': row.get('year')
                })
            
            return {
                'employee': employee_data,
                'leave_balances': leave_balances,
                'year': year
            }
            
        except Exception as e:
            print(f"Error getting leave balance: {e}")
            import traceback
            traceback.print_exc()
            return {
                'employee': None,
                'leave_balances': [],
                'year': year or date.today().year
            }

