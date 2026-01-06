from pydantic import BaseModel, Field, validator
from typing import Optional, List

class PermissionInput(BaseModel):
    permission_key: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    permission_type: List[str] = Field(..., min_items=1, description="List of permission types: view, add, update, or delete")
    description: Optional[str] = Field(None, description="Permission description")
    
    @validator('permission_type')
    def validate_permission_type(cls, v):
        allowed_types = ['view', 'add', 'update', 'delete']
        if not v or len(v) == 0:
            raise ValueError('At least one permission type must be selected')
        for perm_type in v:
            if perm_type not in allowed_types:
                raise ValueError(f'permission_type must be one of: {", ".join(allowed_types)}')
        # Remove duplicates while preserving order
        seen = set()
        unique_list = []
        for item in v:
            if item not in seen:
                seen.add(item)
                unique_list.append(item)
        return unique_list

class RoleAssignmentInput(BaseModel):
    role_id: int = Field(..., description="Role ID to assign permissions to")
    allowed: bool = Field(True, description="Whether the permission is allowed for this role")
    description: Optional[str] = Field(None, description="Description for this role assignment")

class ScopeInput(BaseModel):
    scope_type: str = Field(..., description="Scope type: GLOBAL, BRANCH, DEPARTMENT, or EMPLOYEE")
    branch_id: Optional[int] = Field(None, description="Branch ID (required if scope_type is BRANCH)")
    department_id: Optional[int] = Field(None, description="Department ID (required if scope_type is DEPARTMENT)")
    emp_id: Optional[int] = Field(None, description="Employee ID (required if scope_type is EMPLOYEE)")
    description: Optional[str] = Field(None, description="Scope description")

# class PermissionWithRoleAndScope(BaseModel):
#     permission: PermissionInput = Field(..., description="Permission details")
#     role_assignments: List[RoleAssignmentInput] = Field(default_factory=list, description="Role assignments for this permission")
#     scopes: List[ScopeInput] = Field(default_factory=list, description="Data-level scopes for this permission")

class ModuleRegistrationRequest(BaseModel):
    module_key: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    status_id: int = 1
    permissions: List[PermissionInput] = Field(..., min_items=1)


class ModuleRegistrationResponse(BaseModel):
    success: bool = True
    message: str
    data: dict

class RoleResponse(BaseModel):
    role_id: int
    role_name: str
    role_level: int
    description: Optional[str] = None

class BranchResponse(BaseModel):
    branch_id: int
    branch_name: str
    company_id: int

class DepartmentResponse(BaseModel):
    department_id: int
    department_name: str
    company_id: int
    branch_id: int

class ModuleResponse(BaseModel):
    module_id: int
    module_key: str
    name: str
    description: Optional[str]
    status_id: int
    status: Optional[int]
    status_name: Optional[str] = None
    created_at: Optional[str]
    updated_at: Optional[str]
    permissions_count: Optional[int] = 0

class ModuleUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    status_id: Optional[int] = Field(None, description="Status ID (1 = Active, 0 = Inactive)")

class RoleRequest(BaseModel):
    role_name: str = Field(..., min_length=1, max_length=50, description="Role name (e.g., 'Super Admin', 'Manager')")
    role_level: int = Field(..., ge=1, le=10, description="Role level (1 = highest, 10 = lowest)")
    description: Optional[str] = Field(None, description="Role description")

class RoleCreateResponse(BaseModel):
    success: bool = True
    message: str
    data: RoleResponse

class RoleUpdateRequest(BaseModel):
    role_name: Optional[str] = Field(None, min_length=1, max_length=50, description="Role name (e.g., 'Super Admin', 'Manager')")
    role_level: Optional[int] = Field(None, ge=1, le=10, description="Role level (1 = highest, 10 = lowest)")
    description: Optional[str] = Field(None, description="Role description")

