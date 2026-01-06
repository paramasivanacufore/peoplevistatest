from fastapi import APIRouter, HTTPException
from models.leaves_request import LeaveRequestCreate, LeaveRequestResponse
# from services.leaves_request_service import LeaveRequestService

from services.attendance.leaves_request_service import LeaveRequestService, get_leave_types  


router = APIRouter(prefix="/api/leave", tags=["Leave Requests"])

@router.post("/apply", response_model=LeaveRequestResponse)
async def apply_leave(leave: LeaveRequestCreate):
    try:
        # Create a new leave request and get its ID
        leave_id = LeaveRequestService.create_leave_request(leave)
        
        # Fetch the newly created leave request
        leave_request = LeaveRequestService.get_leave_request(leave_id)
        
        if not leave_request:
            raise HTTPException(status_code=404, detail="Leave request not found")
        
        return leave_request

    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        # Catch any other exceptions and return 500
        raise HTTPException(status_code=500, detail=f"Failed to apply leave: {str(e)}")


@router.get("/types")
async def leave_types():
    """
    Fetch all active leave types.
    """
    try:
        leave_types = get_leave_types()  # should return list of dicts
        return {
            "success": True,
            "message": "Leave types fetched successfully",
            "data": leave_types
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load leave types: {str(e)}"
        )
