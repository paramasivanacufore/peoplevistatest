from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from models.module_registration_models import (
    ModuleRegistrationRequest,
    ModuleRegistrationResponse,
    RoleResponse,
    BranchResponse,
    DepartmentResponse,
    ModuleResponse,
    ModuleUpdateRequest,
    RoleRequest,
    RoleCreateResponse,
    RoleUpdateRequest
)
from services.module_registration_service import ModuleRegistrationService

module_registration_router = APIRouter(
    prefix="/module-registration",
    tags=["Module Registration"]
)

@module_registration_router.post("/register", response_model=ModuleRegistrationResponse)
async def register_module(module_data: ModuleRegistrationRequest):
    """Register a new module with its permissions, role assignments, and data-level scopes"""
    try:
        result = ModuleRegistrationService.register_module(module_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error in register_module endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register module: {str(e)}"
        )

@module_registration_router.get("/roles", response_model=List[RoleResponse])
async def get_all_roles():
    """Get all roles for role assignment dropdown"""
    try:
        roles = ModuleRegistrationService.get_all_roles()
        print(f"Fetched {len(roles)} roles from database")
        if len(roles) == 0:
            print("WARNING: No roles found in the roles table. Please insert roles first.")
        result = [RoleResponse(**role) for role in roles]
        print(f"Returning {len(result)} roles")
        return result
    except Exception as e:
        print(f"Error getting roles: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve roles: {str(e)}"
        )

@module_registration_router.post("/roles", response_model=RoleCreateResponse)
async def create_role(role_data: RoleRequest):
    """Create a new role"""
    try:
        role_dict = role_data.model_dump()
        created_role = ModuleRegistrationService.create_role(role_dict)
        return RoleCreateResponse(
            success=True,
            message=f"Role '{created_role['role_name']}' created successfully",
            data=RoleResponse(**created_role)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error in create_role endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create role: {str(e)}"
        )

@module_registration_router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(role_id: int):
    """Get a role by ID"""
    try:
        role = ModuleRegistrationService.get_role_by_id(role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role with ID {role_id} not found"
            )
        return RoleResponse(**role)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve role: {str(e)}"
        )

@module_registration_router.put("/roles/{role_id}", response_model=RoleCreateResponse)
async def update_role(role_id: int, role_data: RoleUpdateRequest):
    """Update an existing role"""
    try:
        role_dict = role_data.model_dump(exclude_unset=True)
        updated_role = ModuleRegistrationService.update_role(role_id, role_dict)
        return RoleCreateResponse(
            success=True,
            message=f"Role '{updated_role['role_name']}' updated successfully",
            data=RoleResponse(**updated_role)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error in update_role endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update role: {str(e)}"
        )

@module_registration_router.delete("/roles/{role_id}")
async def delete_role(role_id: int):
    """Delete a role"""
    try:
        ModuleRegistrationService.delete_role(role_id)
        return {
            "success": True,
            "message": f"Role deleted successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error in delete_role endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete role: {str(e)}"
        )

@module_registration_router.get("/branches", response_model=List[BranchResponse])
async def get_all_branches():
    """Get all branches for scope selection"""
    try:
        branches = ModuleRegistrationService.get_all_branches()
        # Transform to match BranchResponse model
        return [
            BranchResponse(
                branch_id=branch['branch_id'],
                branch_name=branch['branch_name'],
                company_id=branch['company_id']
            )
            for branch in branches
        ]
    except Exception as e:
        print(f"Error getting branches: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve branches"
        )

@module_registration_router.get("/departments", response_model=List[DepartmentResponse])
async def get_all_departments():
    """Get all departments for scope selection"""
    try:
        departments = ModuleRegistrationService.get_all_departments()
        return [
            DepartmentResponse(
                department_id=dept['department_id'],
                department_name=dept['department_name'],
                company_id=dept['company_id'],
                branch_id=dept['branch_id']
            )
            for dept in departments
        ]
    except Exception as e:
        print(f"Error getting departments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve departments"
        )

@module_registration_router.get("/statuses")
async def get_all_statuses():
    """Get all status options for dropdown"""
    try:
        statuses = ModuleRegistrationService.get_all_statuses()
        return {
            "success": True,
            "data": statuses
        }
    except Exception as e:
        print(f"Error getting statuses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statuses"
        )

@module_registration_router.get("/modules", response_model=List[ModuleResponse])
async def get_all_modules():
    """Get all modules"""
    try:
        modules = ModuleRegistrationService.get_all_modules()
        return [
            ModuleResponse(
                module_id=m['module_id'],
                module_key=m['module_key'],
                name=m['name'],
                description=m['description'],
                status_id=m['status_id'],
                status=m.get('status'),
                status_name=m.get('status_name'),
                created_at=m['created_at'].isoformat() if m.get('created_at') else None,
                updated_at=m['updated_at'].isoformat() if m.get('updated_at') else None,
                permissions_count=m.get('permissions_count', 0)
            )
            for m in modules
        ]
    except Exception as e:
        print(f"Error getting all modules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve modules"
        )

@module_registration_router.get("/modules/{module_id}", response_model=Dict[str, Any])
async def get_module(module_id: int):
    """Get module by ID with all details"""
    try:
        module = ModuleRegistrationService.get_module_by_id(module_id)
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Module with ID {module_id} not found"
            )
        return module
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting module: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve module"
        )

@module_registration_router.put("/modules/{module_id}", response_model=Dict[str, Any])
async def update_module(module_id: int, update_data: ModuleUpdateRequest):
    """Update module information"""
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        updated_module = ModuleRegistrationService.update_module(module_id, update_dict)
        if not updated_module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Module with ID {module_id} not found"
            )
        return {
            "success": True,
            "message": "Module updated successfully",
            "data": updated_module
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating module: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update module: {str(e)}"
        )

@module_registration_router.delete("/modules/{module_id}")
async def delete_module(module_id: int):
    """Delete a module and all related data"""
    try:
        ModuleRegistrationService.delete_module(module_id)
        return {
            "success": True,
            "message": "Module deleted successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error deleting module: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete module: {str(e)}"
        )

