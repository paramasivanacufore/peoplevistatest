from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional
from datetime import date as date_type
from pydantic import BaseModel
from models import SuccessResponse
from services.attendance.att_dashboard_services import AttendanceDashboardService

router = APIRouter(prefix="/api/attendance/dashboard", tags=["Attendance Dashboard"])


@router.get("/overview", response_model=SuccessResponse)
async def get_dashboard_overview():
    """Get dashboard overview statistics"""
    try:
        overview_data = AttendanceDashboardService.get_dashboard_overview()
        return SuccessResponse(data=overview_data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard overview: {str(e)}")


@router.get("/holidays", response_model=SuccessResponse)
async def get_holidays(year: Optional[int] = None):
    """Get holidays for a specific year or all years"""
    try:
        holidays = AttendanceDashboardService.get_holidays(year)
        return SuccessResponse(data=holidays)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching holidays: {str(e)}")


@router.get("/weekly", response_model=SuccessResponse)
async def get_weekly_attendance():
    """Get weekly attendance data for the line graph"""
    try:
        weekly_data = AttendanceDashboardService.get_weekly_attendance()
        return SuccessResponse(data=weekly_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weekly attendance: {str(e)}")


@router.get("/heatmap", response_model=SuccessResponse)
async def get_monthly_heatmap(year: int, month: int):
    """Get monthly heatmap data for attendance"""
    try:
        heatmap_data = AttendanceDashboardService.get_monthly_heatmap(year, month)
        return SuccessResponse(data=heatmap_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching heatmap data: {str(e)}")


@router.get("/employees", response_model=SuccessResponse)
async def get_employees_with_attendance(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    date: Optional[date_type] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    shift_id: Optional[int] = Query(None, description="Filter by shift ID (single)"),
    shift_ids: Optional[str] = Query(None, description="Filter by shift IDs (comma-separated)"),
    sort_by: Optional[str] = Query(None, description="Field to sort by (employee_name, department, shift, status, etc.). Defaults to employee_id if not provided."),
    sort_order: Optional[str] = Query('asc', description="Sort order: 'asc' or 'desc'")
):
    """Get employees with their daily attendance data (paginated)"""
    try:
        # Parse comma-separated IDs
        department_ids_list = None
        if department_ids:
            try:
                department_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        elif department_id:
            department_ids_list = [department_id]
        
        shift_ids_list = None
        if shift_ids:
            try:
                shift_ids_list = [int(id.strip()) for id in shift_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid shift_ids format. Must be comma-separated integers.")
        elif shift_id:
            shift_ids_list = [shift_id]
        
        employees_data = AttendanceDashboardService.get_employees_with_attendance(
            page=page,
            limit=limit,
            search=search,
            date_filter=date,
            department_ids=department_ids_list,
            shift_ids=shift_ids_list,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return SuccessResponse(data=employees_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employees with attendance: {str(e)}")


@router.get("/departments", response_model=SuccessResponse)
async def get_departments():
    """Get all departments"""
    try:
        departments = AttendanceDashboardService.get_departments()
        return SuccessResponse(data=departments)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching departments: {str(e)}")


@router.get("/employees/export", response_model=SuccessResponse)
async def export_employees_with_attendance(
    search: Optional[str] = Query(None),
    date: Optional[date_type] = Query(None),
    department_id: Optional[int] = Query(None)
):
    """Export all employees with their daily attendance data (no pagination limit)"""
    try:
        employees_data = AttendanceDashboardService.get_employees_with_attendance(
            page=1,
            limit=100000,  # Very large limit for export
            search=search,
            date_filter=date,
            department_id=department_id
        )
        return SuccessResponse(data=employees_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting employees with attendance: {str(e)}")


@router.get("/employees/present-today", response_model=SuccessResponse)
async def get_present_employees_today(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    shift_id: Optional[int] = Query(None, description="Filter by shift ID (single)"),
    shift_ids: Optional[str] = Query(None, description="Filter by shift IDs (comma-separated)"),
    sort_by: Optional[str] = Query(None, description="Field to sort by (employee_name, department, shift, etc.). Defaults to employee_id if not provided."),
    sort_order: Optional[str] = Query('asc', description="Sort order: 'asc' or 'desc'")
):
    """Get employees who are present today (paginated)"""
    try:
        # Parse comma-separated IDs
        department_ids_list = None
        if department_ids:
            try:
                department_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        elif department_id:
            department_ids_list = [department_id]
        
        shift_ids_list = None
        if shift_ids:
            try:
                shift_ids_list = [int(id.strip()) for id in shift_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid shift_ids format. Must be comma-separated integers.")
        elif shift_id:
            shift_ids_list = [shift_id]
        
        employees_data = AttendanceDashboardService.get_present_employees_today(
            page=page,
            limit=limit,
            search=search,
            department_ids=department_ids_list,
            shift_ids=shift_ids_list,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return SuccessResponse(data=employees_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching present employees: {str(e)}")


@router.get("/employees/present-today/export", response_model=SuccessResponse)
async def export_present_employees_today(
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    shift_id: Optional[int] = Query(None, description="Filter by shift ID (single)"),
    shift_ids: Optional[str] = Query(None, description="Filter by shift IDs (comma-separated)")
):
    """Export all present employees today (no pagination limit)"""
    try:
        # Parse comma-separated IDs
        department_ids_list = None
        if department_ids:
            try:
                department_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        elif department_id:
            department_ids_list = [department_id]
        
        shift_ids_list = None
        if shift_ids:
            try:
                shift_ids_list = [int(id.strip()) for id in shift_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid shift_ids format. Must be comma-separated integers.")
        elif shift_id:
            shift_ids_list = [shift_id]
        
        employees_data = AttendanceDashboardService.get_present_employees_today(
            page=1,
            limit=100000,  # Very large limit for export
            search=search,
            department_ids=department_ids_list,
            shift_ids=shift_ids_list
        )
        return SuccessResponse(data=employees_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting present employees: {str(e)}")


@router.get("/employees/on-leave-today", response_model=SuccessResponse)
async def get_on_leave_employees_today(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    shift_id: Optional[int] = Query(None, description="Filter by shift ID (single)"),
    shift_ids: Optional[str] = Query(None, description="Filter by shift IDs (comma-separated)"),
    sort_by: Optional[str] = Query(None, description="Field to sort by (employee_name, department, shift, etc.). Defaults to employee_id if not provided."),
    sort_order: Optional[str] = Query('asc', description="Sort order: 'asc' or 'desc'")
):
    """Get employees who are on leave today (paginated)"""
    try:
        # Parse comma-separated IDs
        department_ids_list = None
        if department_ids:
            try:
                department_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        elif department_id:
            department_ids_list = [department_id]
        
        shift_ids_list = None
        if shift_ids:
            try:
                shift_ids_list = [int(id.strip()) for id in shift_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid shift_ids format. Must be comma-separated integers.")
        elif shift_id:
            shift_ids_list = [shift_id]
        
        employees_data = AttendanceDashboardService.get_on_leave_employees_today(
            page=page,
            limit=limit,
            search=search,
            department_ids=department_ids_list,
            shift_ids=shift_ids_list,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return SuccessResponse(data=employees_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employees on leave: {str(e)}")


@router.get("/employees/on-leave-today/export", response_model=SuccessResponse)
async def export_on_leave_employees_today(
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    shift_id: Optional[int] = Query(None, description="Filter by shift ID (single)"),
    shift_ids: Optional[str] = Query(None, description="Filter by shift IDs (comma-separated)")
):
    """Export all employees on leave today (no pagination limit)"""
    try:
        # Parse comma-separated IDs
        department_ids_list = None
        if department_ids:
            try:
                department_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        elif department_id:
            department_ids_list = [department_id]
        
        shift_ids_list = None
        if shift_ids:
            try:
                shift_ids_list = [int(id.strip()) for id in shift_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid shift_ids format. Must be comma-separated integers.")
        elif shift_id:
            shift_ids_list = [shift_id]
        
        employees_data = AttendanceDashboardService.get_on_leave_employees_today(
            page=1,
            limit=100000,  # Very large limit for export
            search=search,
            department_ids=department_ids_list,
            shift_ids=shift_ids_list
        )
        return SuccessResponse(data=employees_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting employees on leave: {str(e)}")


@router.get("/employees/absent-today", response_model=SuccessResponse)
async def get_absent_employees_today(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    shift_id: Optional[int] = Query(None, description="Filter by shift ID (single)"),
    shift_ids: Optional[str] = Query(None, description="Filter by shift IDs (comma-separated)"),
    sort_by: Optional[str] = Query(None, description="Field to sort by (employee_name, department, shift, etc.). Defaults to employee_id if not provided."),
    sort_order: Optional[str] = Query('asc', description="Sort order: 'asc' or 'desc'")
):
    """Get employees who are absent today (paginated)"""
    try:
        # Parse comma-separated IDs
        department_ids_list = None
        if department_ids:
            try:
                department_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        elif department_id:
            department_ids_list = [department_id]
        
        shift_ids_list = None
        if shift_ids:
            try:
                shift_ids_list = [int(id.strip()) for id in shift_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid shift_ids format. Must be comma-separated integers.")
        elif shift_id:
            shift_ids_list = [shift_id]
        
        employees_data = AttendanceDashboardService.get_absent_employees_today(
            page=page,
            limit=limit,
            search=search,
            department_ids=department_ids_list,
            shift_ids=shift_ids_list,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return SuccessResponse(data=employees_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching absent employees: {str(e)}")


@router.get("/employees/absent-today/export", response_model=SuccessResponse)
async def export_absent_employees_today(
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    shift_id: Optional[int] = Query(None, description="Filter by shift ID (single)"),
    shift_ids: Optional[str] = Query(None, description="Filter by shift IDs (comma-separated)")
):
    """Export all absent employees today (no pagination limit)"""
    try:
        # Parse comma-separated IDs
        department_ids_list = None
        if department_ids:
            try:
                department_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        elif department_id:
            department_ids_list = [department_id]
        
        shift_ids_list = None
        if shift_ids:
            try:
                shift_ids_list = [int(id.strip()) for id in shift_ids.split(',') if id.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid shift_ids format. Must be comma-separated integers.")
        elif shift_id:
            shift_ids_list = [shift_id]
        
        employees_data = AttendanceDashboardService.get_absent_employees_today(
            page=1,
            limit=100000,  # Very large limit for export
            search=search,
            department_ids=department_ids_list,
            shift_ids=shift_ids_list
        )
        return SuccessResponse(data=employees_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting absent employees: {str(e)}")


@router.get("/leave-requests", response_model=SuccessResponse)
async def get_leave_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    manager_id: Optional[int] = Query(None),
    sort_by: Optional[str] = Query(None, description="Field to sort by (employee_name, etc.). Defaults to request_date if not provided."),
    sort_order: Optional[str] = Query('asc', description="Sort order: 'asc' or 'desc'")
):
    """Get leave requests (paginated). If manager_id is provided, only shows requests from employees who report to that manager."""
    try:
        leave_requests_data = AttendanceDashboardService.get_leave_requests(
            page=page,
            limit=limit,
            search=search,
            status=status,
            department_id=department_id,
            manager_id=manager_id,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return SuccessResponse(data=leave_requests_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leave requests: {str(e)}")


@router.get("/leave-requests/export", response_model=SuccessResponse)
async def export_leave_requests(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    manager_id: Optional[int] = Query(None)
):
    """Export all leave requests (no pagination limit)"""
    try:
        # Use first department_id if department_ids provided (service layer only supports single department_id)
        final_department_id = department_id
        if department_ids and not department_id:
            try:
                dept_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
                if dept_ids_list:
                    final_department_id = dept_ids_list[0]  # Use first department for export
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        
        leave_requests_data = AttendanceDashboardService.get_leave_requests(
            page=1,
            limit=100000,  # Very large limit for export
            search=search,
            status=status,
            department_id=final_department_id,
            manager_id=manager_id
        )
        return SuccessResponse(data=leave_requests_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting leave requests: {str(e)}")


class ApproveRejectRequest(BaseModel):
    approved_by: int
    comments: Optional[str] = None


@router.post("/leave-requests/{leave_id}/approve", response_model=SuccessResponse)
async def approve_leave_request(leave_id: int, request: ApproveRejectRequest):
    """Approve a leave request"""
    try:
        result = AttendanceDashboardService.approve_leave_request(
            leave_id=leave_id,
            approved_by=request.approved_by,
            comments=request.comments
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to approve leave request"))
        return SuccessResponse(data=result, message=result.get("message"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving leave request: {str(e)}")


@router.post("/leave-requests/{leave_id}/reject", response_model=SuccessResponse)
async def reject_leave_request(leave_id: int, request: ApproveRejectRequest):
    """Reject a leave request"""
    try:
        result = AttendanceDashboardService.reject_leave_request(
            leave_id=leave_id,
            rejected_by=request.approved_by,
            comments=request.comments
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to reject leave request"))
        return SuccessResponse(data=result, message=result.get("message"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting leave request: {str(e)}")


@router.get("/regularization-requests", response_model=SuccessResponse)
async def get_regularization_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    manager_id: Optional[int] = Query(None),
    sort_by: Optional[str] = Query(None, description="Field to sort by (employee_name, etc.). Defaults to created_at if not provided."),
    sort_order: Optional[str] = Query('asc', description="Sort order: 'asc' or 'desc'")
):
    """Get regularization requests (paginated, only pending). If manager_id is provided, only shows requests from employees who report to that manager."""
    try:
        regularization_data = AttendanceDashboardService.get_regularization_requests(
            page=page,
            limit=limit,
            search=search,
            department_id=department_id,
            manager_id=manager_id,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return SuccessResponse(data=regularization_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching regularization requests: {str(e)}")


@router.get("/regularization-requests/export", response_model=SuccessResponse)
async def export_regularization_requests(
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)"),
    manager_id: Optional[int] = Query(None)
):
    """Export all regularization requests (no pagination limit)"""
    try:
        # Use first department_id if department_ids provided (service layer only supports single department_id)
        final_department_id = department_id
        if department_ids and not department_id:
            try:
                dept_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
                if dept_ids_list:
                    final_department_id = dept_ids_list[0]  # Use first department for export
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        
        regularization_data = AttendanceDashboardService.get_regularization_requests(
            page=1,
            limit=100000,  # Very large limit for export
            search=search,
            department_id=final_department_id,
            manager_id=manager_id
        )
        return SuccessResponse(data=regularization_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting regularization requests: {str(e)}")


@router.post("/regularization-requests/{request_id}/approve", response_model=SuccessResponse)
async def approve_regularization_request(request_id: int, request: ApproveRejectRequest):
    """Approve a regularization request"""
    try:
        result = AttendanceDashboardService.approve_regularization_request(
            request_id=request_id,
            approved_by=request.approved_by,
            comments=request.comments
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to approve regularization request"))
        return SuccessResponse(data=result, message=result.get("message"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving regularization request: {str(e)}")


@router.post("/regularization-requests/{request_id}/reject", response_model=SuccessResponse)
async def reject_regularization_request(request_id: int, request: ApproveRejectRequest):
    """Reject a regularization request"""
    try:
        result = AttendanceDashboardService.reject_regularization_request(
            request_id=request_id,
            rejected_by=request.approved_by,
            comments=request.comments
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to reject regularization request"))
        return SuccessResponse(data=result, message=result.get("message"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting regularization request: {str(e)}")


@router.get("/compensatory-requests", response_model=SuccessResponse)
async def get_compensatory_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    sort_by: Optional[str] = Query(None, description="Field to sort by (employee_name, etc.). Defaults to request_date if not provided."),
    sort_order: Optional[str] = Query('asc', description="Sort order: 'asc' or 'desc'")
):
    """Get compensatory leave requests (paginated, only pending)"""
    try:
        compensatory_data = AttendanceDashboardService.get_compensatory_requests(
            page=page,
            limit=limit,
            search=search,
            department_id=department_id,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return SuccessResponse(data=compensatory_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching compensatory requests: {str(e)}")


@router.get("/compensatory-requests/export", response_model=SuccessResponse)
async def export_compensatory_requests(
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None, description="Filter by department ID (single)"),
    department_ids: Optional[str] = Query(None, description="Filter by department IDs (comma-separated)")
):
    """Export all compensatory leave requests (no pagination limit)"""
    try:
        # Use first department_id if department_ids provided (service layer only supports single department_id)
        final_department_id = department_id
        if department_ids and not department_id:
            try:
                dept_ids_list = [int(id.strip()) for id in department_ids.split(',') if id.strip()]
                if dept_ids_list:
                    final_department_id = dept_ids_list[0]  # Use first department for export
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid department_ids format. Must be comma-separated integers.")
        
        compensatory_data = AttendanceDashboardService.get_compensatory_requests(
            page=1,
            limit=100000,  # Very large limit for export
            search=search,
            department_id=final_department_id
        )
        return SuccessResponse(data=compensatory_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting compensatory requests: {str(e)}")


@router.post("/compensatory-requests/{leave_id}/approve", response_model=SuccessResponse)
async def approve_compensatory_request(leave_id: int, request: ApproveRejectRequest):
    """Approve a compensatory leave request"""
    try:
        result = AttendanceDashboardService.approve_leave_request(
            leave_id=leave_id,
            approved_by=request.approved_by,
            comments=request.comments
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to approve compensatory request"))
        return SuccessResponse(data=result, message=result.get("message"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving compensatory request: {str(e)}")


@router.post("/compensatory-requests/{leave_id}/reject", response_model=SuccessResponse)
async def reject_compensatory_request(leave_id: int, request: ApproveRejectRequest):
    """Reject a compensatory leave request"""
    try:
        result = AttendanceDashboardService.reject_leave_request(
            leave_id=leave_id,
            rejected_by=request.approved_by,
            comments=request.comments
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to reject compensatory request"))
        return SuccessResponse(data=result, message=result.get("message"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting compensatory request: {str(e)}")

