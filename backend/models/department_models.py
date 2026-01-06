from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ---------------- Base Department Model ---------------- #
class DepartmentBase(BaseModel):
    company_id: int = Field(..., description="ID of the company this department belongs to")
    branch_ids: Optional[List[int]] = Field(None, description="List of branch IDs linked to this department")
    department_name: str = Field(..., min_length=1, max_length=100, description="Name of the department")
    is_global: Optional[bool] = Field(None, description="Whether the department is global")
    parent_department_id: Optional[int] = Field(None, description="ID of the parent department")
    short_code: Optional[str] = Field(None, max_length=10, description="Short code for the department")
    description: Optional[str] = Field(None, description="Description of the department")
    status_id: int = Field(1, description="Status ID (default 1 for Active)")

# ---------------- Create Department Model ---------------- #
class DepartmentCreate(DepartmentBase):
    """Model for creating a new department"""
    pass

# ---------------- Update Department Model ---------------- #
class DepartmentUpdate(BaseModel):
    """Model for updating a department"""
    company_id: Optional[int] = None
    department_name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_global: Optional[bool] = None
    parent_department_id: Optional[int] = None
    short_code: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = None
    status_id: Optional[int] = None
    branch_ids: Optional[List[int]] = None  # Multi-branch update

# ---------------- Department Response Model ---------------- #
class DepartmentResponse(DepartmentBase):
    department_id: int
    name: str = Field(..., alias="department_name", description="Alias for department_name")
    status: Optional[str] = Field(None, description="Status name (Active, Inactive, Archived)")
    branch_names: Optional[List[str]] = Field(None, description="List of branch names linked to this department")
    parent_department_name: Optional[str] = Field(None, description="Parent department name if sub-department")
    created_at: datetime
    updated_at: datetime

    class Config:
        extra = "allow"
        populate_by_name = True
        from_attributes = True

# ---------------- Main Department Dropdown Model ---------------- #
class MainDepartmentResponse(BaseModel):
    department_id: int
    department_name: str
    company_id: int
    is_global: Optional[bool] = None
    branch_ids: Optional[List[int]] = None  # Multi-branch info for dropdown

    class Config:
        from_attributes = True




# from pydantic import BaseModel, Field
# from typing import Optional,List
# from datetime import datetime

# class DepartmentBase(BaseModel):
#     company_id: int = Field(..., description="ID of the company this department belongs to")
#     branch_id: Optional[int] = None
#     branch_ids: Optional[List[int]]
#     department_name: str = Field(..., min_length=1, max_length=100, description="Name of the department")
#     is_global: Optional[bool] = Field(None, description="Whether the department is global")
#     parent_department_id: Optional[int] = Field(None, description="ID of the parent department (for hierarchical structure)")
#     short_code: Optional[str] = Field(None, max_length=10, description="Short code for the department")
#     description: Optional[str] = Field(None, description="Description of the department")
#     status_id: int = Field(1, description="Status ID (default: 1 for Active)")

# class DepartmentCreate(DepartmentBase):
#     """Model for creating a new department"""
#     pass

# class DepartmentUpdate(BaseModel):
#     """Model for updating a department"""
#     company_id: Optional[int] = Field(None, description="ID of the company this department belongs to")
#     department_name: Optional[str] = Field(None, min_length=1, max_length=100)
#     is_global: Optional[bool] = None
#     parent_department_id: Optional[int] = None
#     short_code: Optional[str] = Field(None, max_length=10)
#     branch_ids: Optional[List[int]]
#     description: Optional[str] = None
#     status_id: Optional[int] = None

# class DepartmentResponse(DepartmentBase):
#     """Model for department response"""

#     department_id: int

#     # name is an alias that reads data from department_name
#     name: str = Field(..., alias="department_name", description="Alias for department_name")

#     status: Optional[str] = Field(None, description="Status name (Active, Inactive, Archived)")
#         # Add these:
#     branch_name: Optional[str] = Field(None, description="Branch name for the department")
#     parent_department_name: Optional[str] = Field(None, description="Parent department name, if sub-department")

#     created_at: datetime
#     updated_at: datetime

#     class Config:
#         extra = "allow"
#         populate_by_name = True  # Allows alias to work correctly
#         from_attributes = True

# class MainDepartmentResponse(BaseModel):
#     department_id: int
#     department_name: str
#     company_id: int
#     is_global: Optional[bool] = None

#     class Config:
#         from_attributes = True


