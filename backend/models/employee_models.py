from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date, datetime

# ============================
# Base Model
# ============================
class EmployeeBase(BaseModel):
    company_id: int = Field(..., description="ID of the company the employee belongs to")
    branch_id: int = Field(..., description="ID of the branch the employee belongs to")
    department_id: int = Field(..., description="ID of the department the employee belongs to")
    reports_to: Optional[int] = Field(None, description="Employee ID of the manager/supervisor")
    position_id: int = Field(..., description="Position/role ID")
    
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)

    gender: Optional[str] = Field(
        None,
        description="Gender of employee: Male, Female, Other"
    )

    dob: Optional[date] = None

    email: Optional[EmailStr] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None

    hire_date: Optional[date] = None

    employment_type: Optional[str] = Field(
        None,
        description="Full-time, Part-time, Contract, Intern"
    )

    status_id: int = Field(1, description="Status ID of the employee (default=1)")
    status_name: Optional[str] = None

# class EmployeeUpdate(BaseModel):
#     first_name: Optional[str]
#     last_name: Optional[str]
#     gender: Optional[str]
#     dob: Optional[str]
#     email: Optional[str]
#     phone_number: Optional[str]
#     company_id: Optional[int]
#     branch_id: Optional[int]
#     department_id: Optional[int]
#     position_id: Optional[int]
#     reports_to: Optional[int]
#     employment_type: Optional[str]
#     hire_date: Optional[str]
#     address: Optional[str]
#     username: str
#     password: str


# ============================
# Create Model
# ============================
class EmployeeCreate(BaseModel):
    company_id: int
    branch_id: int
    department_id: int
    reports_to: Optional[int] = None
    position_id: int

    first_name: str
    last_name: str
    gender: Optional[str] = None
    dob: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    hire_date: Optional[str] = None

    employment_type: Optional[str] = "Full-time"
    status_id: int = 1
    username: str
    password: str

    class Config:
        from_attributes = True
        populate_by_name = True



# ============================
# Update Model
# ============================
class EmployeeUpdate(BaseModel):
    """Model used for updating employee data"""
    company_id: Optional[int] = None
    branch_id: Optional[int] = None
    department_id: Optional[int] = None
    reports_to: Optional[int] = None
    position_id: Optional[int] = None

    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)

    gender: Optional[str] = None
    dob: Optional[date] = None

    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

    hire_date: Optional[date] = None
    employment_type: Optional[str] = None
    status_id: Optional[int] = Field(None, description="Status ID of the employee")
    username: str
    password: str


# ============================
# Response Model
# ============================
class EmployeeResponse(EmployeeBase):
    employee_id: int = Field(..., description="Primary key ID of the employee")

    company_name: Optional[str] = None
    branch_name: Optional[str] = None
    department_name: Optional[str] = None
    position_name: Optional[str] = None
    manager_name: Optional[str] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

