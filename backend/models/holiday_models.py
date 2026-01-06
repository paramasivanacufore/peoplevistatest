from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class HolidayBase(BaseModel):
    holiday_name: str = Field(..., min_length=1, max_length=100, description="Name of the holiday")
    holiday_date: date = Field(..., description="Date of the holiday")
    holiday_type: str = Field(..., description="Type of holiday", pattern="^(Public|Restricted)$")
    branch_id: Optional[int] = Field(None, description="Branch ID (NULL for all branches)")
    description: str = Field(..., min_length=1, description="Description of the holiday")
    status_id: int = Field(1, description="Status ID: 1=Active, 2=Inactive")

class HolidayCreate(HolidayBase):
    """Model for creating a new holiday"""
    pass

class HolidayUpdate(BaseModel):
    """Model for updating a holiday"""
    holiday_name: Optional[str] = Field(None, min_length=1, max_length=100)
    holiday_date: Optional[date] = None
    holiday_type: Optional[str] = Field(None, pattern="^(Public|Restricted)$")
    branch_id: Optional[int] = None
    description: Optional[str] = Field(None, min_length=1)
    status_id: Optional[int] = Field(None, description="Status ID: 1=Active, 2=Inactive")

class HolidayResponse(HolidayBase):
    """Model for holiday response"""
    holiday_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        extra = "ignore"  # Ignore extra fields from database queries

class HolidayListResponse(BaseModel):
    """Model for list of holidays"""
    total: int
    holidays: list[HolidayResponse]

class BranchResponse(BaseModel):
    """Model for branch response"""
    branch_id: int
    name: str
    company_id: int
    
    class Config:
        from_attributes = True
        extra = "ignore"  # Ignore extra fields from database queries
