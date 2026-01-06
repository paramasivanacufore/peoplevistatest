from pydantic import BaseModel
from typing import Optional, List

class LeaveType(BaseModel):
    leave_type_id: int
    leave_type_name: str
    description: Optional[str]

class LeaveTypeResponse(BaseModel):
    success: bool
    data: List[LeaveType]
    message: Optional[str] = None

class LeaveRequestCreate(BaseModel):
    employee_id: int
    leave_type_id: int
    requested_to: str
    start_date: str
    end_date: str
    request_date: str
    comments: Optional[str] = None
