from fastapi import APIRouter, HTTPException, Form, status, Query
from typing import List, Optional

from database import db
from models.role_models import RoleResponse, RoleCreate, RoleUpdate
from services.role_service import RoleService


# ------------------ Router ------------------ #
role_router = APIRouter(prefix="/roles", tags=["Roles"])


# ------------------ Routes ------------------ #

# GET all roles (with optional filtering)
@role_router.get("", response_model=List[RoleResponse])
async def get_roles(status_id: Optional[int] = Query(None, description="Filter by status ID")):
    """Get all roles with optional status filter"""
    try:
        if status_id is not None:
            roles = RoleService.get_all_roles(status_id=status_id)
        else:
            roles = RoleService.get_all_roles()
        return [RoleResponse(**role) for role in roles]
    except Exception as e:
        print(f"Error fetching roles: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# CHECK if role level exists
@role_router.get("/check-level/{role_level}")
async def check_role_level_exists(role_level: int, exclude_role_id: Optional[int] = Query(None, description="Exclude a specific role ID from the check")):
    """Check if a role level already exists"""
    try:
        role = RoleService.get_role_by_level(role_level)
        
        # If exclude_role_id is provided, check if the found role is different
        if role and exclude_role_id:
            if role.get('role_id') == exclude_role_id:
                # It's the same role, so the level is available
                return {"exists": False, "message": "Role level is available"}
        
        if role:
            return {"exists": True, "message": f"Role level {role_level} already exists"}
        else:
            return {"exists": False, "message": "Role level is available"}
    except Exception as e:
        print(f"Error checking role level: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# GET single role
@role_router.get("/{role_id}", response_model=RoleResponse)
async def get_role(role_id: int):
    """Get a specific role by ID"""
    try:
        role = RoleService.get_role_by_id(role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role with ID '{role_id}' not found"
            )
        return RoleResponse(**role)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching role: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# CREATE role
@role_router.post("/create", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(role_data: RoleCreate):
    try:
        role_dict = role_data.model_dump()
        role = RoleService.create_role(role_dict)
        return RoleResponse(**role)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        print(f"Error creating role: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Internal server error: {str(e)}")

# UPDATE role
@role_router.put("/{role_id}", response_model=RoleResponse)
async def update_role(role_id: int, role_data: RoleUpdate):
    try:
        print(f"[role_router] Received PUT request for role_id: {role_id}")
        update_dict = role_data.model_dump(exclude_unset=True)
        print(f"[role_router] Update data: {update_dict}")
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        role = RoleService.update_role(role_id, update_dict)
        print(f"[role_router] Updated role: {role}")
        return RoleResponse(**role)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating role: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# DELETE role
@role_router.delete("/{role_id}")
async def delete_role(role_id: int):
    """Delete a role"""
    try:
        success = RoleService.delete_role(role_id)
        if success:
            return {"success": True, "message": f"Role '{role_id}' deleted successfully"}
        else:
            raise ValueError(f"Role with ID {role_id} not found")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error deleting role: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
