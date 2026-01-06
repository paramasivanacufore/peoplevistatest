from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class LeaveRequestCreate(BaseModel):
    employee_id: int
    leave_type_id: int
    requested_to: str
    start_date: date
    end_date: date
    comments: Optional[str] = None


class LeaveRequestResponse(BaseModel):
    leave_id: int
    employee_id: int
    leave_type_id: int
    requested_to: str
    start_date: date
    end_date: date
    request_date: date
    status: str
    comments: Optional[str] = None
    approved_by: Optional[int] = None
    approved_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
