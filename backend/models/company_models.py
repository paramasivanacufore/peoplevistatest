from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CompanyBase(BaseModel):
    company_name: str
    registration_no: Optional[str] = None
    industry_type: Optional[str] = None
    website_url: Optional[str] = None
    email: Optional[str] = None
    phone_prefix: Optional[str] = None
    phone_number: Optional[str] = None
    phone_extension: Optional[str] = None
    logo_path: Optional[str] = None 
    address: Optional[str] = None
    country: Optional[str] = None
    status_id: Optional[int] = 1

class CompanyCreate(CompanyBase):
    """Model for creating a new company"""
    pass

class CompanyUpdate(BaseModel):
    """Model for updating a company"""
    company_name: Optional[str] = Field(None, min_length=1, max_length=100)
    registration_no: Optional[str] = Field(None, max_length=50)
    industry_type: Optional[str] = Field(None, max_length=100)
    website_url: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=100)
    phone_prefix: Optional[str] = Field(None, max_length=10)
    phone_number: Optional[str] = Field(None, max_length=15)
    phone_extension: Optional[str] = Field(None, max_length=10)
    logo_path: Optional[str] = Field(None, max_length=255)
    status_id: Optional[int] = None

class CompanyResponse(CompanyBase):
    """Model for company response"""
    company_id: int
    status: Optional[str] = Field(None, description="Status name (Active, Inactive, Archived)")
    created_at: datetime
    # updated_at: datetime
    
    class Config:
        from_attributes = True

