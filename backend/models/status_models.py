from pydantic import BaseModel, Field
from datetime import datetime

class StatusBase(BaseModel):
    status: int = Field(1, description="Status value (1 = Active, 0 = Inactive)")

class StatusCreate(StatusBase):
    """Model for creating a new status"""
    pass

class StatusUpdate(BaseModel):
    """Model for updating a status"""
    status: Optional[int] = Field(None, description="Status value (1 = Active, 0 = Inactive)")

class StatusResponse(StatusBase):
    """Model for status response"""
    status_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

