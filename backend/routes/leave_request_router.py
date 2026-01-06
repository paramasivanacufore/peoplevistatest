from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional

from models.leave_request_models import (
    LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestResponse, LeaveRequestListResponse
)
from services.leave_request_service import LeaveRequestService

# Create router
leave_request_router = APIRouter(prefix="/leave-requests", tags=["Leave Request Management"])

@leave_request_router.post("/", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_request(leave_request_data: LeaveRequestCreate):
    """Create a new leave request"""
    try:
        # Convert Pydantic model to dict
        leave_request_dict = leave_request_data.model_dump()
        
        # Create leave request
        created_leave_request = LeaveRequestService.create_leave_request(leave_request_dict)
        if not created_leave_request:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create leave request"
            )
        
        return LeaveRequestResponse(**created_leave_request)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error creating leave request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create leave request"
        )

@leave_request_router.get("/", response_model=LeaveRequestListResponse)
async def get_all_leave_requests(
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    requested_to: Optional[int] = Query(None, description="Filter by requested to (manager/HR)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    leave_type_id: Optional[int] = Query(None, description="Filter by leave type ID")
):
    """Get all leave requests with optional filters"""
    try:
        leave_requests = LeaveRequestService.get_all_leave_requests(
            employee_id=employee_id,
            requested_to=requested_to,
            status=status,
            leave_type_id=leave_type_id
        )
        
        return LeaveRequestListResponse(
            total=len(leave_requests),
            leave_requests=[LeaveRequestResponse(**lr) for lr in leave_requests]
        )
        
    except Exception as e:
        print(f"Error getting leave requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leave requests"
        )

@leave_request_router.get("/{leave_id}", response_model=LeaveRequestResponse)
async def get_leave_request(leave_id: int):
    """Get a specific leave request by ID"""
    try:
        leave_request = LeaveRequestService.get_leave_request_by_id(leave_id)
        
        if not leave_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave request with ID '{leave_id}' not found"
            )
        
        return LeaveRequestResponse(**leave_request)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting leave request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leave request"
        )

@leave_request_router.put("/{leave_id}", response_model=LeaveRequestResponse)
async def update_leave_request(leave_id: int, leave_request_data: LeaveRequestUpdate):
    """Update a leave request"""
    try:
        # Convert Pydantic model to dict, excluding None values
        update_dict = leave_request_data.model_dump(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update leave request
        updated_leave_request = LeaveRequestService.update_leave_request(leave_id, update_dict)
        if not updated_leave_request:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update leave request"
            )
        
        return LeaveRequestResponse(**updated_leave_request)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating leave request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update leave request"
        )

@leave_request_router.post("/{leave_id}/approve", response_model=LeaveRequestResponse)
async def approve_leave_request(
    leave_id: int,
    approved_by: int = Query(..., description="Employee ID who is approving"),
    comments: Optional[str] = Query(None, description="Optional comments")
):
    """Approve a leave request"""
    try:
        approved_leave_request = LeaveRequestService.approve_leave_request(
            leave_id, approved_by, comments
        )
        return LeaveRequestResponse(**approved_leave_request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error approving leave request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve leave request"
        )

@leave_request_router.post("/{leave_id}/reject", response_model=LeaveRequestResponse)
async def reject_leave_request(
    leave_id: int,
    approved_by: int = Query(..., description="Employee ID who is rejecting"),
    comments: Optional[str] = Query(None, description="Optional comments")
):
    """Reject a leave request"""
    try:
        rejected_leave_request = LeaveRequestService.reject_leave_request(
            leave_id, approved_by, comments
        )
        return LeaveRequestResponse(**rejected_leave_request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error rejecting leave request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject leave request"
        )

@leave_request_router.post("/{leave_id}/cancel", response_model=LeaveRequestResponse)
async def cancel_leave_request(leave_id: int):
    """Cancel a leave request (only if status is Pending)"""
    try:
        cancelled_leave_request = LeaveRequestService.cancel_leave_request(leave_id)
        return LeaveRequestResponse(**cancelled_leave_request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error cancelling leave request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel leave request"
        )

@leave_request_router.delete("/{leave_id}")
async def delete_leave_request(leave_id: int):
    """Delete a leave request (only if status is Pending or Cancelled)"""
    try:
        if not LeaveRequestService.check_leave_request_exists(leave_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave request with ID '{leave_id}' not found"
            )
        
        LeaveRequestService.delete_leave_request(leave_id)
        return {"message": f"Leave request '{leave_id}' deleted successfully"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting leave request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete leave request"
        )

