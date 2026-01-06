from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RoleBase(BaseModel):
    role_name: str
    role_level: int
    description: Optional[str] = None
    status_id: Optional[int] = 1

class RoleCreate(RoleBase):
    """Model for creating a new role"""
    pass

class RoleUpdate(BaseModel):
    """Model for updating a role"""
    role_name: Optional[str] = Field(None, min_length=1, max_length=50)
    role_level: Optional[int] = None
    description: Optional[str] = Field(None, max_length=500)
    status_id: Optional[int] = None

class RoleResponse(RoleBase):
    """Model for role response"""
    role_id: int
    status: Optional[str] = Field(None, description="Status name (Active, Inactive, Archived)")
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
