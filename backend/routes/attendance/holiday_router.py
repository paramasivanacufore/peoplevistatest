from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional


from models.holiday_models import (
    HolidayCreate, HolidayUpdate, HolidayResponse, HolidayListResponse, BranchResponse
)
from services.attendance.holiday_service import HolidayService

# Create router
holiday_router = APIRouter(prefix="/holidays", tags=["Holiday Management"])

@holiday_router.post("/", response_model=HolidayResponse, status_code=status.HTTP_201_CREATED)
async def create_holiday(holiday_data: HolidayCreate):
    """Create a new holiday"""
    try:
        # Convert Pydantic model to dict
        holiday_dict = holiday_data.model_dump()
        
        # Create holiday
        created_holiday = HolidayService.create_holiday(holiday_dict)
        if not created_holiday:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create holiday"
            )
        
        return HolidayResponse(**created_holiday)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error creating holiday: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create holiday"
        )

@holiday_router.get("/", response_model=HolidayListResponse)
async def get_all_holidays(
    active_only: bool = Query(False, description="Get only active holidays"),
    branch_id: Optional[int] = Query(None, description="Filter by branch ID"),
    year: Optional[int] = Query(None, description="Filter by year")
):
    """Get all holidays with optional filters"""
    try:
        holidays = HolidayService.get_all_holidays(
            active_only=active_only,
            branch_id=branch_id,
            year=year
        )
        print(f"Retrieved {len(holidays)} holidays from service")
        
        holiday_responses = []
        for holiday in holidays:
            try:
                holiday_responses.append(HolidayResponse(**holiday))
            except Exception as e:
                print(f"Error creating HolidayResponse for holiday {holiday.get('holiday_id', 'unknown')}: {e}")
                print(f"Holiday data: {holiday}")
                raise
        
        return HolidayListResponse(
            total=len(holiday_responses),
            holidays=holiday_responses
        )
        
    except Exception as e:
        print(f"Error getting holidays: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve holidays: {str(e)}"
        )

@holiday_router.get("/{holiday_id}", response_model=HolidayResponse)
async def get_holiday(holiday_id: int):
    """Get a specific holiday by ID"""
    try:
        holiday = HolidayService.get_holiday_by_id(holiday_id)
        
        if not holiday:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Holiday with ID '{holiday_id}' not found"
            )
        
        return HolidayResponse(**holiday)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting holiday: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve holiday"
        )

@holiday_router.put("/{holiday_id}", response_model=HolidayResponse)
async def update_holiday(holiday_id: int, holiday_data: HolidayUpdate):
    """Update a holiday"""
    try:
        # Convert Pydantic model to dict, excluding None values
        update_dict = holiday_data.model_dump(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update holiday
        updated_holiday = HolidayService.update_holiday(holiday_id, update_dict)
        if not updated_holiday:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update holiday"
            )
        
        return HolidayResponse(**updated_holiday)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating holiday: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update holiday"
        )

@holiday_router.delete("/{holiday_id}")
async def delete_holiday(
    holiday_id: int,
    permanent: bool = Query(False, description="Permanently delete holiday")
):
    """Delete a holiday (soft delete by default)"""
    try:
        if not HolidayService.check_holiday_exists(holiday_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Holiday with ID '{holiday_id}' not found"
            )
        
        if permanent:
            HolidayService.hard_delete_holiday(holiday_id)
            return {"message": f"Holiday '{holiday_id}' permanently deleted"}
        else:
            HolidayService.delete_holiday(holiday_id)
            return {"message": f"Holiday '{holiday_id}' deactivated"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting holiday: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete holiday"
        )

@holiday_router.get("/branches/list", response_model=list[BranchResponse])
async def get_branches():
    """Get all active branches"""
    try:
        branches = HolidayService.get_branches()
        return [BranchResponse(**branch) for branch in branches]
        
    except Exception as e:
        print(f"Error getting branches: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve branches"
        )

