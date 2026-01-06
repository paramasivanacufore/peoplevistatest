from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from models.shift_models import ShiftCreate, ShiftUpdate, ShiftResponse, ShiftListResponse
from services.shift_service import ShiftService

shift_router = APIRouter(prefix="/shifts", tags=["shifts"])

@shift_router.post("/", response_model=ShiftResponse)
async def create_shift(shift_data: ShiftCreate):
    """Create a new shift"""
    try:
        # Convert Pydantic model to dict
        shift_dict = shift_data.model_dump()
        
        # Create shift
        created_shift = ShiftService.create_shift(shift_dict)
        if not created_shift:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create shift"
            )
        
        return ShiftResponse(**created_shift)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error creating shift: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create shift"
        )

@shift_router.get("/", response_model=List[ShiftResponse])
async def get_all_shifts(active_only: bool = Query(False, description="Filter active shifts only")):
    """Get all shifts"""
    try:
        shifts = ShiftService.get_all_shifts(active_only=active_only)
        return [ShiftResponse(**shift) for shift in shifts]
        
    except Exception as e:
        print(f"Error getting shifts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve shifts"
        )

@shift_router.get("/{shift_id}", response_model=ShiftResponse)
async def get_shift(shift_id: int):
    """Get a specific shift by ID"""
    try:
        shift = ShiftService.get_shift_by_id(shift_id)
        if not shift:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shift not found"
            )
        
        return ShiftResponse(**shift)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting shift: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve shift"
        )

@shift_router.put("/{shift_id}", response_model=ShiftResponse)
async def update_shift(shift_id: int, shift_data: ShiftUpdate):
    """Update a shift"""
    try:
        # Convert Pydantic model to dict, excluding None values
        update_dict = shift_data.model_dump(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update shift
        updated_shift = ShiftService.update_shift(shift_id, update_dict)
        if not updated_shift:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update shift"
            )
        
        return ShiftResponse(**updated_shift)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating shift: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update shift"
        )

@shift_router.delete("/{shift_id}")
async def delete_shift(shift_id: int):
    """Soft delete a shift"""
    try:
        success = ShiftService.delete_shift(shift_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete shift"
            )
        
        return {"message": "Shift deleted successfully"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting shift: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete shift"
        )

@shift_router.delete("/{shift_id}/hard")
async def hard_delete_shift(shift_id: int):
    """Hard delete a shift from database"""
    try:
        success = ShiftService.hard_delete_shift(shift_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete shift"
            )
        
        return {"message": "Shift permanently deleted"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error hard deleting shift: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete shift"
        )
