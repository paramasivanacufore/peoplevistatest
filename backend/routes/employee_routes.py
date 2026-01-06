# routes/employee_router.py
from fastapi import APIRouter, HTTPException, Form, status, Query, Request, Depends
from typing import Optional, List, Any
import json
import traceback

from models.employee_models import EmployeeResponse, EmployeeCreate, EmployeeUpdate
from services.employee_service import EmployeeService
from routes.auth_router import get_current_user

employee_router = APIRouter(prefix="/employees", tags=["employees"])


# -------------------------
# Helper: parse JSON form field safely
# -------------------------
def _parse_json_field(value: Optional[str]):
    if not value:
        return None
    try:
        return json.loads(value)
    except Exception:
        # If it is already an object (e.g. when FastAPI forms pass objects), return as-is
        return value


# -------------------------
# Create Employee (with department_roles via new flow)
# -------------------------
@employee_router.post("/create", response_model=EmployeeResponse)
async def create_employee(payload: EmployeeCreate):

    employee_data = {
        "company_id": payload.company_id,
        "branch_id": payload.branch_id,
        "department_id": payload.department_id,
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "gender": payload.gender,
        "dob": payload.dob,
        "email": payload.email,
        "phone_number": payload.phone_number,
        "position_id": payload.position_id,
        "reports_to": payload.reports_to,
        "employment_type": payload.employment_type,
        "hire_date": payload.hire_date,
        "address": payload.address,
        "username": payload.username,
        "password": payload.password,
    }

    employee = EmployeeService.create_employee(employee_data)
    if not employee:
        raise HTTPException(status_code=500, detail="Failed to create employee")
    return EmployeeResponse(**employee)

@employee_router.post("/{employee_id}/archive")
async def archive_employee(employee_id: int):
    """
    Archive an employee (set status_id = 3)
    """
    try:
        result = EmployeeService.archive_employee(employee_id)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@employee_router.post("/{employee_id}/reinstate")
def reinstate_employee(employee_id: int):
    """Reinstate archived employee (status_id = 1)"""
    try:
        result = EmployeeService.reinstate_employee(employee_id)  # sync
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        print(f"Error reinstating employee {employee_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")



# -------------------------
# Get employees (list) - with filters
# -------------------------
@employee_router.get("/getemployees", response_model=List[EmployeeResponse])
async def get_employees(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    branch_id: Optional[int] = Query(None, description="Filter by branch ID"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
):
    try:
        employees = EmployeeService.get_all_employees(
        )
        return [EmployeeResponse(**emp) for emp in employees]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@employee_router.get("/by-company-branch", response_model=List[EmployeeResponse])
async def get_employees_by_company_branch(
    company_id: int = Query(...),
    branch_id: int = Query(...)
):
    try:
        return EmployeeService.get_employees_by_company_branch(company_id, branch_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# -------------------------
# Get single employee
# -------------------------
@employee_router.get("/{employee_id}")
def get_employee_by_id(employee_id: int):
    try:
        employee = EmployeeService.get_employee_by_id(employee_id)

        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        return employee

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Route error fetching employee {employee_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")



# -------------------------
# Update employee (and update department_roles mapping)
# -------------------------
@employee_router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    # current_user: dict = Depends(get_current_user)
):
    employee = EmployeeService.get_employee_by_id(employee_id)

    # if payload.username or payload.password:
    #     if not current_user.is_superadmin:
    #         raise HTTPException(status_code=403, detail="Only superadmin can update username or password")
    
    updated_employee = EmployeeService.update_employee(employee_id, payload.dict(exclude_unset=True))
    return updated_employee





# -------------------------
# Delete (soft) employee
# -------------------------
@employee_router.delete("/{employee_id}")
async def delete_employee(employee_id: int):
    try:
        EmployeeService.delete_employee(employee_id)
        return {"message": f"Employee '{employee_id}' archived successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# -------------------------
# Reinstate employee
# -------------------------
@employee_router.post("/{employee_id}/reinstate")
async def reinstate_employee(employee_id: int):
    try:
        EmployeeService.reinstate_employee(employee_id)
        return {"message": f"Employee '{employee_id}' reinstated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# -------------------------
# Save tab (progressively save part of employee data)
# -------------------------
@employee_router.post("/save-tab/{tab_id}")
async def save_tab(tab_id: str, request: Request):
    try:
        form_data = await request.form()
        emp_id = form_data.get("emp_id")
        tab_data = {}
        for key, value in form_data.items():
            if key != "emp_id":
                tab_data[key] = value
        result = EmployeeService.save_tab_data(tab_id, tab_data, emp_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save {tab_id} tab")
