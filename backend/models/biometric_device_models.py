from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from pydantic import field_validator

class BiometricDeviceBase(BaseModel):
    """Base model for biometric device data"""
    device_id: str = Field(..., min_length=1, max_length=50, description="Device ID")
    device_ip: str = Field(..., description="IP address of the device")
    device_serial_number: str = Field(..., min_length=1, max_length=100, description="Serial number of the device")
    device_name: str = Field(..., min_length=1, max_length=100, description="Name of the device")
    location: str = Field(..., min_length=1, max_length=100, description="Location of the device")
    status_id: int = Field(1, description="Status ID: 1=Active, 2=Inactive")

class BiometricDeviceCreate(BiometricDeviceBase):
    """Model for creating a new biometric device"""
    pass

class BiometricDeviceUpdate(BaseModel):
    """Model for updating a biometric device"""
    device_ip: Optional[str] = None
    device_serial_number: Optional[str] = Field(None, min_length=1, max_length=100)
    device_name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=100)
    status_id: Optional[int] = Field(None, description="Status ID: 1=Active, 2=Inactive")

class BiometricDeviceResponse(BiometricDeviceBase):
    """Model for biometric device response"""
    last_synced: Optional[str] = None
    created_at: str

    @field_validator('created_at', 'last_synced', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    class Config:
        from_attributes = True
        extra = "ignore"  # Ignore extra fields from database queries

class BiometricDeviceListResponse(BaseModel):
    """Model for biometric device list response"""
    devices: List[BiometricDeviceResponse]
    total: int
    page: int
    limit: int