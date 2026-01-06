from fastapi import APIRouter, HTTPException, status, Query

from models.leave_type_models import (
    LeaveTypeCreate, LeaveTypeUpdate, LeaveTypeResponse
)
from services.leave_type_service import LeaveTypeService

# Create router
leave_type_router = APIRouter(prefix="/leave-types", tags=["Leave Type Management"])

@leave_type_router.post("/", response_model=LeaveTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_type(leave_type_data: LeaveTypeCreate):
    """Create a new leave type"""
    try:
        # Convert Pydantic model to dict
        leave_type_dict = leave_type_data.model_dump()
        
        # Convert is_active (boolean) to status_id (int) for database
        # Frontend sends is_active (boolean), but database uses status_id (int)
        # Default to False (inactive) if not provided - user must explicitly check the checkbox
        is_active = leave_type_dict.get('is_active', False)
        leave_type_dict['status_id'] = 1 if is_active else 2
        leave_type_dict.pop('is_active', None)  # Remove is_active as DB doesn't have this column
        
        # Create leave type
        created_leave_type = LeaveTypeService.create_leave_type(leave_type_dict)
        if not created_leave_type:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create leave type"
            )
        
        # Convert status_id back to is_active for response
        if 'status_id' in created_leave_type:
            created_leave_type['is_active'] = created_leave_type.get('status_id', 1) == 1
        
        return LeaveTypeResponse(**created_leave_type)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error creating leave type: {e}")
        print(f"Traceback: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create leave type: {str(e)}"
        )

@leave_type_router.get("/")
async def get_all_leave_types(
    active_only: bool = Query(False, description="Get only active leave types")
):
    """Get all leave types with optional filters"""
    try:
        leave_types = LeaveTypeService.get_all_leave_types(
            active_only=active_only
        )
        
        # Convert status_id to is_active for each leave type in response
        formatted_leave_types = []
        for leave_type in leave_types:
            if 'status_id' in leave_type:
                leave_type['is_active'] = leave_type.get('status_id', 1) == 1
            formatted_leave_types.append(LeaveTypeResponse(**leave_type))
        
        return {
            "total": len(leave_types),
            "leave_types": formatted_leave_types
        }
        
    except Exception as e:
        print(f"Error getting leave types: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leave types"
        )

@leave_type_router.get("/{leave_type_id}", response_model=LeaveTypeResponse)
async def get_leave_type(leave_type_id: int):
    """Get a specific leave type by ID"""
    try:
        leave_type = LeaveTypeService.get_leave_type_by_id(leave_type_id)
        
        if not leave_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave type with ID '{leave_type_id}' not found"
            )
        
        # Convert status_id to is_active for response
        if 'status_id' in leave_type:
            leave_type['is_active'] = leave_type.get('status_id', 1) == 1
        
        return LeaveTypeResponse(**leave_type)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting leave type: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve leave type"
        )

@leave_type_router.put("/{leave_type_id}", response_model=LeaveTypeResponse)
async def update_leave_type(leave_type_id: int, leave_type_data: LeaveTypeUpdate):
    """Update a leave type"""
    try:
        # Convert Pydantic model to dict, excluding None values
        update_dict = leave_type_data.model_dump(exclude_unset=True)
        
        # Convert is_active (if present) to status_id for database
        if 'is_active' in update_dict:
            is_active = update_dict.pop('is_active')
            update_dict['status_id'] = 1 if is_active else 2
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update leave type
        updated_leave_type = LeaveTypeService.update_leave_type(leave_type_id, update_dict)
        if not updated_leave_type:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update leave type"
            )
        
        # Convert status_id back to is_active for response
        if 'status_id' in updated_leave_type:
            updated_leave_type['is_active'] = updated_leave_type.get('status_id', 1) == 1
        
        return LeaveTypeResponse(**updated_leave_type)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating leave type: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update leave type"
        )

@leave_type_router.delete("/{leave_type_id}")
async def delete_leave_type(
    leave_type_id: int,
    permanent: bool = Query(False, description="Permanently delete leave type")
):
    """Delete a leave type (soft delete by default)"""
    try:
        if not LeaveTypeService.check_leave_type_exists(leave_type_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Leave type with ID '{leave_type_id}' not found"
            )
        
        if permanent:
            LeaveTypeService.hard_delete_leave_type(leave_type_id)
            return {"message": f"Leave type '{leave_type_id}' permanently deleted"}
        else:
            LeaveTypeService.delete_leave_type(leave_type_id)
            return {"message": f"Leave type '{leave_type_id}' deactivated"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting leave type: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete leave type"
        )

