from fastapi import APIRouter, HTTPException, Query, Response
from fastapi import status as http_status
from typing import Optional, List, Dict, Any
from services.attendance.attendance_service import AttendanceService
import csv
import io

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.get("/team")
async def get_team_attendance(
    date: Optional[str] = Query(None, description="Date filter (YYYY-MM-DD). Defaults to today"),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    status: Optional[str] = Query(None, description="Filter by status (Present, Absent, Leave, etc.)"),
    shift_id: Optional[int] = Query(None, description="Filter by shift ID (single)"),
    shift_ids: Optional[str] = Query(None, description="Filter by shift IDs (comma-separated)"),
    search: Optional[str] = Query(None, description="Search by name, ID, or department"),
    page: Optional[int] = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: Optional[int] = Query(10, ge=1, le=100, description="Number of items per page (1-100)")
) -> Dict[str, Any]:
    """Get team attendance data with employee details"""
    try:
        # Validate status if provided
        if status and status != 'All Status':
            valid_statuses = ["Present", "Absent", "Leave", "Holiday", "Week Off", "Regularized"]
            if status not in valid_statuses:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status}. Must be one of: {', '.join(valid_statuses)}"
                )
        # Validate date format if provided
        from datetime import datetime, date as date_class
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                # Check if date is in the future
                if date_obj > date_class.today():
                    raise HTTPException(
                        status_code=http_status.HTTP_400_BAD_REQUEST,
                        detail="Date cannot be in the future"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Must be YYYY-MM-DD"
                )
        
            
        # Parse comma-separated IDs
        department_ids_list = None
        if department_ids:
            try:
                department_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
                print(f"DEBUG: Parsed department_ids: {department_ids_list} from input: {department_ids}")
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid department_ids format. Must be comma-separated integers."
                )
        
        shift_ids_list = None
        if shift_ids:
            try:
                shift_ids_list = [int(id.strip()) for id in shift_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid shift_ids format. Must be comma-separated integers."
                )
        
        try:
            attendance_data = AttendanceService.get_team_attendance(
                date_filter=date,
                department_id=department_id,
                department_ids=department_ids_list,
                status_filter=status,
                shift_id=shift_id,
                shift_ids=shift_ids_list,
                search_query=search,
                page=page,
                page_size=page_size
            )
            
            # Log response for debugging
            print(f"DEBUG: Team attendance response type: {type(attendance_data)}")
            print(f"DEBUG: Response is dict: {isinstance(attendance_data, dict)}")
            if isinstance(attendance_data, dict):
                print(f"DEBUG: Response keys: {list(attendance_data.keys())}")
                data_count = len(attendance_data.get('data', []))
                print(f"DEBUG: Data count: {data_count}")
                if data_count > 0:
                    print(f"DEBUG: First record keys: {list(attendance_data['data'][0].keys())[:5]}")
                    print(f"DEBUG: First record sample: {str(attendance_data['data'][0])[:200]}")
                else:
                    print(f"WARNING: Response has empty data array!")
                    print(f"DEBUG: Pagination info: {attendance_data.get('pagination', {})}")
            else:
                print(f"ERROR: Response is not a dict! Type: {type(attendance_data)}")
            
            # Ensure we always return a valid response structure
            if not isinstance(attendance_data, dict):
                print(f"ERROR: Converting non-dict response to dict")
                attendance_data = {
                    'data': [],
                    'pagination': {
                        'current_page': 1,
                        'page_size': 10,
                        'total_items': 0,
                        'total_pages': 0,
                        'has_next': False,
                        'has_previous': False
                    }
                }
            
            # Service now returns dict directly, so just return it
            return attendance_data
        except Exception as service_error:
            print(f"DEBUG: Error in get_team_attendance service: {service_error}")
            import traceback
            traceback.print_exc()
            raise
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching team attendance: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/departments")
async def get_departments():
    """Get all departments for filter dropdown"""
    try:
        departments = AttendanceService.get_departments()
        return departments
    except Exception as e:
        print(f"Error fetching departments: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/shifts")
async def get_shifts():
    """Get all shifts for filter dropdown"""
    try:
        shifts = AttendanceService.get_shifts()
        return shifts
    except Exception as e:
        print(f"Error fetching shifts: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/employee/{employee_id}")
async def get_employee_attendance(
    employee_id: int,
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    page: Optional[int] = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: Optional[int] = Query(10, ge=1, le=100, description="Number of items per page (1-100)")
) -> Dict[str, Any]:
    """Get attendance data for a specific employee"""
    try:
        # Validate employee_id
        if employee_id <= 0:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Employee ID must be greater than 0"
            )
        # Validate date format if provided
        from datetime import datetime
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Must be YYYY-MM-DD"
                )
        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Must be YYYY-MM-DD"
                )
        
        # Validate date range
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            if start > end:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="start_date must be before or equal to end_date"
                )
        
        attendance_data = AttendanceService.get_employee_attendance(
            employee_id=employee_id,
            start_date=start_date,
            end_date=end_date,
            page=page,
            page_size=page_size
        )
        
        # Check if employee exists
        if attendance_data.get('employee') is None:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        return attendance_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching employee attendance: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/regularization/{employee_id}")
async def get_regularization_requests(
    employee_id: int,
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    page: Optional[int] = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: Optional[int] = Query(10, ge=1, le=100, description="Number of items per page (1-100)")
) -> Dict[str, Any]:
    """Get regularization requests for a specific employee"""
    try:
        # Validate employee_id
        if employee_id <= 0:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Employee ID must be greater than 0"
            )
        # Validate date format if provided
        from datetime import datetime
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Must be YYYY-MM-DD"
                )
        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Must be YYYY-MM-DD"
                )
        
        # Validate date range
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            if start > end:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="start_date must be before or equal to end_date"
                )
        
        requests_data = AttendanceService.get_regularization_requests(
            employee_id=employee_id,
            start_date=start_date,
            end_date=end_date,
            page=page,
            page_size=page_size
        )
        
        # Check if employee exists
        if not requests_data.get('employee'):
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        
        # Check if date range is provided and no requests found in that range
        data = requests_data.get('data', [])
        if not data or len(data) == 0:
            # Return 200 status with message instead of 404
            if start_date and end_date:
                requests_data['message'] = "No request found for this date range"
            else:
                requests_data['message'] = "No regularization requests found for this employee"
            return requests_data
        
        return requests_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching regularization requests: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/leave-summary/{employee_id}")
async def get_leave_summary(
    employee_id: int,
    year: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
) -> Dict[str, Any]:
    try:
        # Validate employee_id
        if employee_id <= 0:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Invalid employee ID"
            )

        leave_summary = AttendanceService.get_leave_summary(
            employee_id=employee_id,
            year=year,
            start_date=start_date,
            end_date=end_date
        )

        # Employee not found
        if not leave_summary or leave_summary.get("employee") is None:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )

        return leave_summary

    except HTTPException:
        # 🔥 VERY IMPORTANT: re-raise HTTP exceptions
        raise

    except Exception as service_error:
        import traceback
        print("Leave summary internal error:", service_error)
        traceback.print_exc()

        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leave summary"
        )
@router.get("/leave-balance/{employee_id}")
async def get_leave_balance(
    employee_id: int,
    year: Optional[int] = Query(None, description="Year filter. Defaults to current year")
) -> Dict[str, Any]:
    """Get leave balance for a specific employee showing available and booked days for each leave type"""
    try:
        leave_balance = AttendanceService.get_leave_balance(
            employee_id=employee_id,
            year=year
        )
        return leave_balance
    except Exception as service_error:
        print(f"DEBUG: Error in get_leave_balance service: {service_error}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve leave balance: {service_error}"
        )

@router.get("/leave-requests/{employee_id}")
async def get_leave_requests(
    employee_id: int,
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    page: Optional[int] = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: Optional[int] = Query(10, ge=1, le=100, description="Number of items per page (1-100)")
) -> Dict[str, Any]:
    """Get leave requests for a specific employee"""
    try:
        # Validate employee_id
        if employee_id <= 0:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Employee ID must be greater than 0"
            )
        # Validate date format if provided
        from datetime import datetime
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Must be YYYY-MM-DD"
                )
        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Must be YYYY-MM-DD"
                )
        
        # Validate date range
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            if start > end:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="start_date must be before or equal to end_date"
                )
        
        requests_data = AttendanceService.get_leave_requests(
            employee_id=employee_id,
            start_date=start_date,
            end_date=end_date,
            page=page,
            page_size=page_size
        )
        
        # Check if employee exists
        if not requests_data.get('employee'):
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        
        # Check if date range is provided and no requests found in that range
        if start_date and end_date:
            data = requests_data.get('data', [])
            if not data or len(data) == 0:
                
                requests_data['message'] = "No request found in this date range"
                return requests_data
        
        return requests_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching leave requests: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# =====================================================
# EXPORT ENDPOINTS (CSV)
# =====================================================

@router.get("/employee/{employee_id}/export")
async def export_employee_attendance(
    employee_id: int,
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)")
) -> Response:
    """Export employee attendance data as CSV"""
    try:
        # Validate employee_id
        if employee_id <= 0:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Employee ID must be greater than 0"
            )
        
        # Validate date format if provided
        from datetime import datetime
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Must be YYYY-MM-DD"
                )
        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Must be YYYY-MM-DD"
                )
        
        # Validate date range
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            if start > end:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="start_date must be before or equal to end_date"
                )
        
        # Fetch all data without pagination
        attendance_data = AttendanceService.get_employee_attendance(
            employee_id=employee_id,
            start_date=start_date,
            end_date=end_date,
            page=1,
            page_size=100000  # Large page size to get all records
        )
        
        # Check if employee exists
        if attendance_data.get('employee') is None:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        
        employee_info = attendance_data.get('employee', {})
        records = attendance_data.get('data', [])
        
        # Create CSV
        output = io.StringIO()
        if records:
            fieldnames = ['Date', 'First Check-In', 'Last Check-Out', 'Total Hours', 
                         'Total Punches', 'Status', 'Shift']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for record in records:
                writer.writerow({
                    'Date': record.get('date', ''),
                    'First Check-In': record.get('firstPunch', ''),
                    'Last Check-Out': record.get('lastPunch', ''),
                    'Total Hours': record.get('totalHours', ''),
                    'Total Punches': record.get('totalPunches', 0),
                    'Status': record.get('status', ''),
                    'Shift': record.get('shift', '')
                })
        
        csv_content = output.getvalue()
        output.close()
        
        # Generate filename
        date_range = f"{start_date}_{end_date}" if start_date and end_date else "all"
        filename = f"employee_{employee_id}_attendance_{date_range}.csv"
        
        # Return CSV response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error exporting employee attendance: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/regularization/{employee_id}/export")
async def export_regularization_requests(
    employee_id: int,
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)")
) -> Response:
    """Export regularization requests as CSV"""
    try:
        # Validate employee_id
        if employee_id <= 0:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Employee ID must be greater than 0"
            )
        
        # Validate date format if provided
        from datetime import datetime
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Must be YYYY-MM-DD"
                )
        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Must be YYYY-MM-DD"
                )
        
        # Validate date range
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            if start > end:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="start_date must be before or equal to end_date"
                )
        
        # Fetch all data without pagination
        requests_data = AttendanceService.get_regularization_requests(
            employee_id=employee_id,
            start_date=start_date,
            end_date=end_date,
            page=1,
            page_size=100000  # Large page size to get all records
        )
        
        records = requests_data.get('data', [])
        
        # Create CSV
        output = io.StringIO()
        if records:
            fieldnames = ['S.No', 'Worked Day', 'Present Hours Old', 'Present Hours New',
                         'Old Status', 'New Status', 'Reason', 'Approval Status']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for idx, record in enumerate(records, 1):
                writer.writerow({
                    'S.No': idx,
                    'Worked Day': record.get('date', ''),
                    'Present Hours Old': record.get('old_hours', ''),
                    'Present Hours New': record.get('new_hours', ''),
                    'Old Status': record.get('old_status', ''),
                    'New Status': record.get('new_status', ''),
                    'Reason': record.get('reason', ''),
                    'Approval Status': record.get('approval_status', '')
                })
        
        csv_content = output.getvalue()
        output.close()
        
        # Generate filename
        date_range = f"{start_date}_{end_date}" if start_date and end_date else "all"
        filename = f"employee_{employee_id}_regularization_{date_range}.csv"
        
        # Return CSV response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error exporting regularization requests: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/leave-requests/{employee_id}/export")
async def export_leave_requests(
    employee_id: int,
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)")
) -> Response:
    """Export leave requests as CSV"""
    try:
        # Validate employee_id
        if employee_id <= 0:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Employee ID must be greater than 0"
            )
        
        # Validate date format if provided
        from datetime import datetime
        if start_date:
            try:
                datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Must be YYYY-MM-DD"
                )
        if end_date:
            try:
                datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Must be YYYY-MM-DD"
                )
        
        # Validate date range
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            if start > end:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="start_date must be before or equal to end_date"
                )
        
        # Fetch all data without pagination
        requests_data = AttendanceService.get_leave_requests(
            employee_id=employee_id,
            start_date=start_date,
            end_date=end_date,
            page=1,
            page_size=100000  # Large page size to get all records
        )
        
        records = requests_data.get('data', [])
        
        # Create CSV
        output = io.StringIO()
        if records:
            fieldnames = ['Employee ID', 'Employee Name', 'Leave Type', 'Leave Period',
                         'Days/hours taken', 'Date of request', 'Status']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            employee_info = requests_data.get('employee', {})
            employee_name = f"{employee_info.get('first_name', '')} {employee_info.get('last_name', '')}".strip()
            
            for record in records:
                # Format leave period
                start_date_str = record.get('start_date', '')
                end_date_str = record.get('end_date', '')
                leave_period = f"{start_date_str} - {end_date_str}" if start_date_str and end_date_str else (start_date_str or end_date_str or '')
                
                writer.writerow({
                    'Employee ID': employee_id,
                    'Employee Name': employee_name,
                    'Leave Type': record.get('leave_type', ''),
                    'Leave Period': leave_period,
                    'Days/hours taken': record.get('duration', ''),
                    'Date of request': record.get('request_date', ''),
                    'Status': record.get('status', '')
                })
        
        csv_content = output.getvalue()
        output.close()
        
        # Generate filename
        date_range = f"{start_date}_{end_date}" if start_date and end_date else "all"
        filename = f"employee_{employee_id}_leave_requests_{date_range}.csv"
        
        # Return CSV response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error exporting leave requests: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

