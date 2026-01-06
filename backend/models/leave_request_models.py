# from pydantic import BaseModel, Field, validator
# from typing import Optional
# from datetime import datetime, date

# class LeaveRequestBase(BaseModel):
#     employee_id: int = Field(..., description="Employee ID requesting the leave")
#     leave_type_id: int = Field(..., description="Type of leave")
#     requested_to: Optional[str] = None  # ✅ FIX
#     start_date: date = Field(..., description="Start date of leave")
#     end_date: date = Field(..., description="End date of leave")
#     request_date: date = Field(..., description="Date when the request was made")
#     comments: Optional[str] = Field(None, description="Optional comments")

#     @validator('end_date')
#     def validate_end_date(cls, v, values):
#         if 'start_date' in values and v < values['start_date']:
#             raise ValueError('End date must be after or equal to start date')
#         return v

# class LeaveRequestCreate(LeaveRequestBase):
#     """Model for creating a new leave request"""
#     pass

# class LeaveRequestUpdate(BaseModel):
#     """Model for updating a leave request"""
#     status: Optional[str] = Field(None, description="Status: Pending, Approved, Rejected, Cancelled")
#     comments: Optional[str] = Field(None, description="Optional comments")
#     approved_by: Optional[int] = Field(None, description="Employee ID who approved")
#     approved_date: Optional[date] = Field(None, description="Date of approval")

#     @validator('status')
#     def validate_status(cls, v):
#         if v and v not in ['Pending', 'Approved', 'Rejected', 'Cancelled']:
#             raise ValueError('Status must be one of: Pending, Approved, Rejected, Cancelled')
#         return v

# class LeaveRequestResponse(BaseModel):
#     """Model for leave request response"""
#     leave_id: int
#     employee_id: int
#     leave_type_id: int
#     requested_to: Optional[str] = None  # ✅ FIX
#     start_date: date
#     end_date: date
#     request_date: date
#     status: str
#     comments: Optional[str] = None
#     approved_by: Optional[int] = None
#     approved_date: Optional[date] = None
#     created_at: Optional[datetime] = None
#     updated_at: Optional[datetime] = None
    
#     # Additional fields for display
#     employee_name: Optional[str] = None
#     leave_type_name: Optional[str] = None
#     requested_to_name: Optional[str] = None
#     approved_by_name: Optional[str] = None

#     class Config:
#         from_attributes = True

# class LeaveRequestListResponse(BaseModel):
#     """Model for leave request list response"""
#     total: int
#     leave_requests: list[LeaveRequestResponse]


from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime, date


# =========================================================
# Base Model (Shared Fields)
# =========================================================
class LeaveRequestBase(BaseModel):
    employee_id: int = Field(..., description="Employee ID requesting the leave")
    leave_type_id: int = Field(..., description="Type of leave")
    requested_to: Optional[int] = Field(
        None, description="Approver employee ID"
    )
    start_date: date = Field(..., description="Start date of leave")
    end_date: date = Field(..., description="End date of leave")
    comments: Optional[str] = Field(None, description="Optional comments")

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v, info):
        start_date = info.data.get("start_date")
        if start_date and v < start_date:
            raise ValueError("End date must be after or equal to start date")
        return v


# =========================================================
# Create Leave Request
# =========================================================
class LeaveRequestCreate(LeaveRequestBase):
    """
    Model for creating a new leave request
    NOTE:
    - request_date is set by DB (CURDATE)
    - status is set by DB ('Pending')
    """
    pass


# =========================================================
# Update Leave Request
# =========================================================
class LeaveRequestUpdate(BaseModel):
    status: Optional[str] = Field(
        None, description="Pending, Approved, Rejected, Cancelled"
    )
    comments: Optional[str] = Field(None, description="Optional comments")
    approved_by: Optional[int] = Field(
        None, description="Employee ID who approved"
    )
    approved_date: Optional[date] = Field(
        None, description="Date of approval"
    )

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v and v not in {"Pending", "Approved", "Rejected", "Cancelled"}:
            raise ValueError(
                "Status must be one of: Pending, Approved, Rejected, Cancelled"
            )
        return v


# =========================================================
# Leave Request Response (API Output)
# =========================================================
class LeaveRequestResponse(BaseModel):
    leave_id: int
    employee_id: int
    leave_type_id: int

    # Raw IDs (optional but useful)
    requested_to_id: Optional[int] = None
    approved_by_id: Optional[int] = None

    # Display-friendly fields (from JOINs)
    requested_to: Optional[str] = None      # approver name/email
    approved_by: Optional[str] = None       # approver name/email
    employee_name: Optional[str] = None
    leave_type_name: Optional[str] = None

    start_date: date
    end_date: date
    request_date: date
    status: str
    comments: Optional[str] = None
    approved_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# List Response
# =========================================================
class LeaveRequestListResponse(BaseModel):
    total: int
    leave_requests: List[LeaveRequestResponse]
