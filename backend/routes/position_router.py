from fastapi import APIRouter, HTTPException, status, Query
 
from models.position_models import (
    PositionCreate, PositionUpdate, PositionResponse
)
from services.position_service import PositionService
 
# Create router
position_router = APIRouter(prefix="/positions", tags=["Position Management"])
 
@position_router.post("/", response_model=PositionResponse, status_code=status.HTTP_201_CREATED)
async def create_position(position_data: PositionCreate):
    """Create a new position"""
    try:
        # Convert Pydantic model to dict
        position_dict = position_data.model_dump()
       
        # Create position
        created_position = PositionService.create_position(position_dict)
        if not created_position:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create position"
            )
       
        return PositionResponse(**created_position)
       
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error creating position: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create position"
        )
 
@position_router.get("/")
async def get_all_positions(
    active_only: bool = Query(False, description="Get only active positions")
):
    """Get all positions with optional filters"""
    try:
        positions = PositionService.get_all_positions(
            active_only=active_only
        )
       
        # Convert to PositionResponse, handling any parsing errors
        position_responses = []
        for position in positions:
            try:
                position_responses.append(PositionResponse(**position))
            except Exception as e:
                print(f"Error parsing position {position.get('position_id', 'unknown')}: {e}")
                print(f"Position data: {position}")
                # Continue with next position instead of failing completely
       
        return {
            "total": len(position_responses),
            "positions": position_responses
        }
       
    except Exception as e:
        print(f"Error getting positions: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve positions"
        )
 
@position_router.get("/{position_id}", response_model=PositionResponse)
async def get_position(position_id: int):
    """Get a specific position by ID"""
    try:
        position = PositionService.get_position_by_id(position_id)
       
        if not position:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Position with ID '{position_id}' not found"
            )
       
        return PositionResponse(**position)
       
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting position: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve position"
        )
 
@position_router.put("/{position_id}", response_model=PositionResponse)
async def update_position(position_id: int, position_data: PositionUpdate):
    """Update a position"""
    try:
        # Convert Pydantic model to dict, excluding None values
        update_dict = position_data.model_dump(exclude_unset=True)
        print(f"[position_router] Received PUT request for position_id: {position_id}")
        print(f"[position_router] Update data: {update_dict}")
       
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
       
        # Update position
        updated_position = PositionService.update_position(position_id, update_dict)
        print(f"[position_router] Updated position: {updated_position}")
        if not updated_position:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update position"
            )
       
        return PositionResponse(**updated_position)
       
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating position: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update position"
        )
 
@position_router.delete("/{position_id}")
async def delete_position(
    position_id: int,
    permanent: bool = Query(False, description="Permanently delete position")
):
    """Delete a position (soft delete by default)"""
    try:
        if not PositionService.check_position_exists(position_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Position with ID '{position_id}' not found"
            )
       
        if permanent:
            PositionService.hard_delete_position(position_id)
            return {"message": f"Position '{position_id}' permanently deleted"}
        else:
            PositionService.delete_position(position_id)
            return {"message": f"Position '{position_id}' deactivated"}
       
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting position: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete position"
        )