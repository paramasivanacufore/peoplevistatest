from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
 
class PositionBase(BaseModel):
    position_name: str = Field(..., min_length=1, max_length=100, description="Name of the position")
    status_id: int = Field(1, description="Status ID (1 = Active, default)")
 
class PositionCreate(PositionBase):
    """Model for creating a new position"""
    pass
 
class PositionUpdate(BaseModel):
    """Model for updating a position"""
    position_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Name of the position")
    status_id: Optional[int] = Field(None, description="Status ID")
 
class PositionResponse(PositionBase):
    """Model for position response"""
    position_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
 
    class Config:
        from_attributes = True