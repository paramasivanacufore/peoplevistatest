from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BranchBase(BaseModel):
    company_id: int = Field(..., description="ID of the company this branch belongs to")
    branch_name: str = Field(..., min_length=1, max_length=100, description="Name of the branch")
    parent_branch_id: Optional[int]
    children: Optional[list] = []
    is_global: int
    phone_number: Optional[str] = Field(None, max_length=20, description="Branch phone number")
    email: Optional[str] = Field(None, max_length=100, description="Branch email address")
    status_id: int = Field(1, description="Status ID (default: 1 for Active)")

class BranchCreate(BranchBase):
    """Model for creating a new branch"""
    pass

class BranchUpdate(BaseModel):
    """Model for updating a branch"""
    company_id: Optional[int] = Field(None, description="ID of the company this branch belongs to")
    branch_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    status_id: Optional[int] = None
    parent_branch_id: Optional[int] = None
    is_global: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class BranchResponse(BranchBase):
    branch_id: int
    name: Optional[str]
    company_name: Optional[str]
    status: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    parent_branch_id: Optional[int] = None
    parent_branch_name: Optional[str] = Field(None, description="Name of parent branch")
    children: Optional[list] = []
    is_global: int
    

    created_at: datetime
    updated_at: datetime


    class Config:
        orm_mode = True
