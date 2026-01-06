from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LeaveTypeBase(BaseModel):
    leave_type_name: str = Field(..., min_length=1, max_length=50, description="Name of the leave type")
    description: Optional[str] = Field(None, description="Description of the leave type")
    is_active: bool = Field(False, description="Whether the leave type is active")  # Default to False (inactive)
class LeaveTypeCreate(LeaveTypeBase):
    """Model for creating a new leave type"""
    pass

class LeaveTypeUpdate(BaseModel):
    """Model for updating a leave type"""
    leave_type_name: Optional[str] = Field(None, min_length=1, max_length=50, description="Name of the leave type")
    description: Optional[str] = Field(None, description="Description of the leave type")
    is_active: Optional[bool] = Field(None, description="Whether the leave type is active")

class LeaveTypeResponse(LeaveTypeBase):
    """Model for leave type response"""
    leave_type_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

