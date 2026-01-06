from fastapi import APIRouter, HTTPException
from services.attendance.leave_service import get_leave_types  # your service function

router = APIRouter(prefix="/api/leave", tags=["Leave"])

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
