from __future__ import annotations  # Required for Pydantic v2 to handle type annotations properly

from pydantic import BaseModel, Field, field_validator, model_validator, field_serializer
from typing import Optional, List, Annotated
from datetime import datetime, date, time
from enum import Enum

class DashboardOverview(BaseModel):
    totalEmployees: int
    presentToday: int
    onLeaveToday: int
    absentToday: int
    pendingLeaveApprovals: int
    pendingRegularizationApprovals: int
    pendingCompensatoryApprovals: int
    employeesAddedThisMonth: int

class Holiday(BaseModel):
    holiday_id: Optional[int] = None
    name: str
    date: str  # ISO format date string
    year: int
    holiday_type: Optional[str] = None
    description: Optional[str] = None

class WeeklyAttendanceData(BaseModel):
    day: str
    value: int

class HeatmapDay(BaseModel):
    day: int
    color: str
    isWeekend: bool
    attendance_count: Optional[int] = None

class EmployeeAttendanceItem(BaseModel):
    employee_id: int
    employee_name: str
    employee_code: Optional[str] = None
    department: Optional[str] = None
    shift: Optional[str] = None
    date: str  # ISO format date string
    status: Optional[str] = None  # Present, Absent, Leave, Holiday, Week Off, Regularized
    first_in_time: Optional[str] = None
    last_out_time: Optional[str] = None
    total_working_hours: Optional[str] = None

class EmployeeAttendanceListResponse(BaseModel):
    employees: List[EmployeeAttendanceItem]
    total: int
    page: int
    limit: int
    total_pages: int

class LeaveRequestItem(BaseModel):
    leave_id: int
    employee_id: int
    employee_name: str
    employee_code: Optional[str] = None
    department: Optional[str] = None
    leave_type: Optional[str] = None
    start_date: str  # ISO format date string
    end_date: str  # ISO format date string
    request_date: str  # ISO format date string
    status: str  # Pending, Approved, Rejected, Cancelled
    comments: Optional[str] = None
    requested_to_name: Optional[str] = None
    approved_by_name: Optional[str] = None
    approved_date: Optional[str] = None

class LeaveRequestListResponse(BaseModel):
    leave_requests: List[LeaveRequestItem]
    total: int
    page: int
    limit: int
    total_pages: int

class RegularizationRequestItem(BaseModel):
    request_id: int
    employee_id: int
    employee_name: str
    employee_code: Optional[str] = None
    department: Optional[str] = None
    date: str  # ISO format date string
    reason: Optional[str] = None
    regularization_type: str  # Missed Punch, Incorrect Punch, Work From Home, Outdoor Duty, System Error
    old_check_in: Optional[str] = None
    old_check_out: Optional[str] = None
    corrected_check_in: Optional[str] = None
    corrected_check_out: Optional[str] = None
    status: str  # Pending, Approved, Rejected
    created_at: Optional[str] = None

class RegularizationRequestDashboardListResponse(BaseModel):
    """Model for dashboard regularization requests list response"""
    regularization_requests: List[RegularizationRequestItem]
    total: int
    page: int
    limit: int
    total_pages: int

"""
Attendance Models - Pydantic Models for Attendance-related Tables

This file contains Pydantic model definitions for all attendance-related tables.
These models follow the same format as other model files (holiday_models, shift_models, etc.)

Tables:
1. att_daily_attendance - Daily attendance summaries
2. att_biometric_logs - Raw punch logs
3. att_regularization_requests - Regularization requests
4. att_emp_shift_assignments - Employee shift assignments
"""

# Create type aliases to avoid name clashes
DateType = date
DateTimeType = datetime
TimeType = time

# Enums matching database ENUM types
class AttendanceStatusEnum(str, Enum):
    Present = "Present"
    Absent = "Absent"
    Leave = "Leave"
    Holiday = "Holiday"
    WeekOff = "Week Off"
    Regularized = "Regularized"

class PunchTypeEnum(str, Enum):
    IN = "IN"
    OUT = "OUT"
    AUTO = "AUTO"

class RegularizationStatusEnum(str, Enum):
    Pending = "Pending"
    Approved = "Approved"
    Rejected = "Rejected"

class NewStatusEnum(str, Enum):
    Present = "Present"
    Absent = "Absent"
    Leave = "Leave"

# ============================================================================
# Daily Attendance Models
# ============================================================================

class DailyAttendanceBase(BaseModel):
    """Base model for daily attendance"""
    employee_id: int = Field(..., gt=0, description="Employee ID must be greater than 0")
    date: DateType = Field(..., description="Attendance date")  # Use type alias to avoid clash
    first_in_time: Optional[DateTimeType] = Field(None, description="First check-in time")
    last_out_time: Optional[DateTimeType] = Field(None, description="Last check-out time")
    total_working_hours: Optional[TimeType] = Field(None, description="Total working hours")
    total_punches: int = Field(0, ge=0, description="Total number of punches")
    status: AttendanceStatusEnum = Field(AttendanceStatusEnum.Absent, description="Attendance status")
    
    @model_validator(mode='after')
    def validate_times(self):
        """Validate that last_out_time is after first_in_time if both are provided"""
        if self.first_in_time and self.last_out_time:
            if self.last_out_time < self.first_in_time:
                raise ValueError("last_out_time must be after first_in_time")
        return self
    
    @field_validator('date')
    @classmethod
    def validate_date_not_future(cls, v: date) -> date:
        """Validate that date is not in the future"""
        if v > date.today():
            raise ValueError("Attendance date cannot be in the future")
        return v

class DailyAttendanceCreate(DailyAttendanceBase):
    """Model for creating a new daily attendance record"""
    pass

class DailyAttendanceUpdate(BaseModel):
    """Model for updating daily attendance"""
    first_in_time: Optional[datetime] = None
    last_out_time: Optional[datetime] = None
    total_working_hours: Optional[time] = None
    total_punches: Optional[int] = Field(None, ge=0)
    status: Optional[AttendanceStatusEnum] = None

class DailyAttendanceResponse(DailyAttendanceBase):
    """Model for daily attendance response"""
    attendance_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# Biometric Logs Models
# ============================================================================

class BiometricLogBase(BaseModel):
    """Base model for biometric log"""
    employee_id: int = Field(..., gt=0, description="Employee ID must be greater than 0")
    device_id: Optional[str] = Field(None, max_length=50, description="Device ID")
    punch_time: datetime = Field(..., description="Punch time")
    punch_type: PunchTypeEnum = Field(PunchTypeEnum.AUTO, description="Punch type")
    
    @field_validator('punch_time')
    @classmethod
    def validate_punch_time_not_future(cls, v: datetime) -> datetime:
        """Validate that punch time is not too far in the future (max 1 hour ahead)"""
        from datetime import timedelta
        max_future = datetime.now() + timedelta(hours=1)
        if v > max_future:
            raise ValueError("Punch time cannot be more than 1 hour in the future")
        return v

class BiometricLogCreate(BiometricLogBase):
    """Model for creating a new biometric log"""
    pass

class BiometricLogResponse(BiometricLogBase):
    """Model for biometric log response"""
    log_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# Regularization Request Models
# ============================================================================

class RegularizationRequestBase(BaseModel):
    """Base model for regularization request"""
    employee_id: int = Field(..., gt=0, description="Employee ID must be greater than 0")
    date: DateType = Field(..., description="Date to be regularized")  # Use type alias to avoid clash
    reason: Optional[str] = Field(None, min_length=5, max_length=500, description="Reason for regularization (5-500 characters)")
    new_status: NewStatusEnum = Field(..., description="New status requested")
    
    @field_validator('date')
    @classmethod
    def validate_date_not_future(cls, v: date) -> date:
        """Validate that regularization date is not in the future"""
        if v > date.today():
            raise ValueError("Regularization date cannot be in the future")
        return v
    

class RegularizationRequestCreate(RegularizationRequestBase):
    """Model for creating a new regularization request"""
    
    @model_validator(mode='after')
    def validate_reason_required(self):
        """Validate that reason is provided when creating a request"""
        if not self.reason or len(self.reason.strip()) < 5:
            raise ValueError("Reason is required and must be at least 5 characters long")
        return self

class RegularizationRequestUpdate(BaseModel):
    """Model for updating regularization request"""
    reason: Optional[str] = None
    new_status: Optional[NewStatusEnum] = None
    status: Optional[RegularizationStatusEnum] = None

class RegularizationRequestResponse(RegularizationRequestBase):
    """Model for regularization request response"""
    request_id: int
    status: RegularizationStatusEnum = Field(RegularizationStatusEnum.Pending, description="Request status")
    created_at: datetime
    updated_at: datetime
    old_status: Optional[str] = Field(None, description="Old status from attendance")
    old_hours: Optional[str] = Field(None, description="Old hours from attendance")
    
    class Config:
        from_attributes = True

# ============================================================================
# Employee Shift Assignment Models
# ============================================================================

class EmployeeShiftAssignmentBase(BaseModel):
    """Base model for employee shift assignment"""
    employee_id: int = Field(..., gt=0, description="Employee ID must be greater than 0")
    shift_id: int = Field(..., gt=0, description="Shift ID must be greater than 0")
    effective_from: date = Field(..., description="Effective from date")
    effective_to: Optional[date] = Field(None, description="Effective to date (NULL for active)")
    
    @model_validator(mode='after')
    def validate_date_range(self):
        """Validate that effective_to is after effective_from if both are provided"""
        if self.effective_to and self.effective_from:
            if self.effective_to < self.effective_from:
                raise ValueError("effective_to must be after or equal to effective_from")
        return self

class EmployeeShiftAssignmentCreate(EmployeeShiftAssignmentBase):
    """Model for creating a new shift assignment"""
    pass

class EmployeeShiftAssignmentUpdate(BaseModel):
    """Model for updating shift assignment"""
    shift_id: Optional[int] = None
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None

class EmployeeShiftAssignmentResponse(EmployeeShiftAssignmentBase):
    """Model for shift assignment response"""
    assignment_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# API Response Models (for complex queries)
# ============================================================================

class AttendanceRecordResponse(BaseModel):
    """Model for attendance record in employee attendance view"""
    sno: int
    workDay: str
    date: str
    firstPunch: str
    lastPunch: str
    totalHours: str
    status: str
    shift: str
    ot: str
    reg: str
    compOff: str
    rowClass: Optional[str] = None

class EmployeeInfoResponse(BaseModel):
    """Model for employee basic information"""
    employee_id: int
    name: str
    initials: str
    department: str
    role: str
    emp_code: str

class AttendanceSummaryResponse(BaseModel):
    """Model for attendance summary statistics"""
    total_payable_days: int
    total_present_days: int
    paid_leaves: int
    unpaid_leave_absent: int
    total_holidays: int
    total_weekends: int
    total_overtime_earned: str
    comp_off_credited: int
    comp_off_used: int

class EmployeeAttendanceResponse(BaseModel):
    """Model for employee attendance API response"""
    employee: Optional[EmployeeInfoResponse]
    data: List[AttendanceRecordResponse]
    pagination: dict
    summary: AttendanceSummaryResponse

class TeamAttendanceRecordResponse(BaseModel):
    """Model for team attendance record"""
    attendance_id: int
    employee_id: int
    empId: str
    name: str
    initials: str
    department: str
    role: str
    shift: str
    status: str
    checkInTime: Optional[str]
    date: str  # Changed to str for JSON serialization
    first_in_time: Optional[str] = None  # Changed to str for JSON serialization
    last_out_time: Optional[str] = None  # Changed to str for JSON serialization
    total_working_hours: Optional[str] = None  # Changed to str for JSON serialization
    total_punches: int
    
    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v):
        """Parse date from various formats and convert to ISO string"""
        if v is None:
            return None
        if isinstance(v, str):
            return v  # Already a string
        if isinstance(v, date):
            return v.isoformat()
        if isinstance(v, datetime):
            return v.date().isoformat()
        try:
            return str(v)
        except:
            return date.today().isoformat()
    
    @field_validator('first_in_time', 'last_out_time', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        """Parse datetime from various formats and convert to ISO string"""
        if v is None:
            return None
        if isinstance(v, str):
            return v  # Already a string
        if isinstance(v, datetime):
            return v.isoformat()
        try:
            return str(v)
        except:
            return None
    
    @field_validator('total_working_hours', mode='before')
    @classmethod
    def parse_time(cls, v):
        """Parse time from various formats and convert to string"""
        if v is None:
            return None
        if isinstance(v, str):
            return v  # Already a string
        if isinstance(v, time):
            return v.isoformat()
        try:
            return str(v)
        except:
            return None

class TeamAttendanceResponse(BaseModel):
    """Model for team attendance API response"""
    data: List[TeamAttendanceRecordResponse]
    pagination: dict

class RegularizationRequestTeamListResponse(BaseModel):
    """Model for team member view regularization requests list response"""
    employee: Optional[EmployeeInfoResponse]
    data: List[RegularizationRequestResponse]
    pagination: dict

