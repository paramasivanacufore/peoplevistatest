from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import time, datetime, timedelta
from pydantic import field_validator

class ShiftBase(BaseModel):
    """Base model for shift data"""
    shift_name: str = Field(..., min_length=1, max_length=50, description="Name of the shift")
    start_time: time = Field(..., description="Start time of the shift")
    end_time: time = Field(..., description="End time of the shift")
    break_duration: int = Field(0, ge=0, description="Break duration in minutes")
    grace_time_minutes: int = Field(0, ge=0, description="Grace time in minutes")
    status_id: int = Field(1, ge=1, le=3, description="Status ID: 1=Active, 3=Archived")

    @field_validator('start_time', 'end_time', mode='before')
    @classmethod
    def parse_time(cls, v):
        if isinstance(v, str):
            return time.fromisoformat(v)
        elif isinstance(v, timedelta):
            # Convert timedelta to time (timedelta represents seconds since midnight)
            total_seconds = int(v.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            return time(hours, minutes, seconds)
        return v

class ShiftCreate(ShiftBase):
    """Model for creating a new shift"""
    pass

class ShiftUpdate(BaseModel):
    """Model for updating a shift"""
    shift_name: Optional[str] = Field(None, min_length=1, max_length=50)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    break_duration: Optional[int] = Field(None, ge=0)
    grace_time_minutes: Optional[int] = Field(None, ge=0)
    status_id: Optional[int] = Field(None, ge=1, le=3)

    @field_validator('start_time', 'end_time', mode='before')
    @classmethod
    def parse_time(cls, v):
        if isinstance(v, str):
            return time.fromisoformat(v)
        elif isinstance(v, timedelta):
            # Convert timedelta to time (timedelta represents seconds since midnight)
            total_seconds = int(v.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            return time(hours, minutes, seconds)
        return v

class ShiftResponse(ShiftBase):
    """Model for shift response"""
    shift_id: int
    created_at: str

    @field_validator('created_at', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    class Config:
        from_attributes = True

class ShiftListResponse(BaseModel):
    """Model for shift list response"""
    shifts: List[ShiftResponse]
    total: int
    page: int
    limit: int
