from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LeaveAllocationRuleBase(BaseModel):
    leave_type_id: int = Field(..., description="ID of the leave type")
    allocation_period: str = Field(..., description="Allocation period", pattern="^(Monthly|Quarterly|Half-Yearly|Yearly)$")
    days_allocated: int = Field(..., ge=0, description="Number of days allocated")
    carry_forward: bool = Field(False, description="Whether leave can be carried forward")
    max_carry_forward_days: int = Field(0, ge=0, description="Maximum days that can be carried forward")
    is_active: bool = Field(True, description="Whether the rule is active")

class LeaveAllocationRuleCreate(LeaveAllocationRuleBase):
    """Model for creating a new leave allocation rule"""
    pass

class LeaveAllocationRuleUpdate(BaseModel):
    """Model for updating a leave allocation rule"""
    leave_type_id: Optional[int] = None
    allocation_period: Optional[str] = Field(None, pattern="^(Monthly|Quarterly|Half-Yearly|Yearly)$")
    days_allocated: Optional[int] = Field(None, ge=0)
    carry_forward: Optional[bool] = None
    max_carry_forward_days: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class LeaveAllocationRuleResponse(LeaveAllocationRuleBase):
    """Model for leave allocation rule response"""
    rule_id: int
    leave_type_name: Optional[str] = Field(None, description="Name of the leave type (from join)")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class LeaveAllocationRuleListResponse(BaseModel):
    """Model for list of leave allocation rules"""
    total: int
    rules: list[LeaveAllocationRuleResponse]

class LeaveTypeResponse(BaseModel):
    """Model for leave type response"""
    leave_type_id: int
    leave_type_name: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

