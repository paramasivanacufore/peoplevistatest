from fastapi import APIRouter, HTTPException, Form, status, Query
from typing import List, Optional
from datetime import datetime

from database import db
from models.branch_models import BranchResponse
from services.branch_service import BranchService

# ------------------ Router ------------------ #
branch_router = APIRouter(prefix="/branch", tags=["Branches"])

# Note: BranchCreate and BranchUpdate are defined in models/branch_models.py
# But we use Form(...) here for form data support

# GET all branches
@branch_router.get("/getall", response_model=List[BranchResponse])
async def get_branches(status_id: Optional[int] = Query(None, description="Filter by status ID")):
    """Get all branches with optional status filter"""
    try:
        if status_id is not None:
            branches = BranchService.get_all_branches(status_id=status_id)
        else:
            branches = BranchService.get_all_branches()

        return [BranchResponse(**branch) for branch in branches]
    except Exception as e:
        print(f"Error fetching branches: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# GET single branch
@branch_router.get("/{branch_id}", response_model=BranchResponse)
async def get_branch(branch_id: int):
    """Get a specific branch by ID"""
    try:
        branch = BranchService.get_branch_by_id(branch_id)
        if not branch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Branch with ID '{branch_id}' not found"
            )
        return BranchResponse(**branch)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching branch: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# CREATE branch
@branch_router.post("/create", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
async def create_branch(
    company_id: int = Form(...),
    branch_name: str = Form(...),
    email: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    status_id: int = Form(1),

    address: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    country: Optional[str] = Form(None),

    # NEW FIELDS
    is_global: bool = Form(False),
    parent_branch_id: Optional[int] = Form(None)
):
    try:
        # Build single address string
        # parts = [address, city, state, postal_code]
        # full_address = ", ".join([p for p in parts if p])

        branch_data = {
            'company_id': company_id,
            'branch_name': branch_name,
            'email': email,
            'phone_number': phone_number,
            'status_id': status_id,
            'address': address,
            'city': city,
            'state': state,
            'country': country,
            'is_global': is_global,
            'parent_branch_id': parent_branch_id
        }

        branch = BranchService.create_branch(branch_data)
        return BranchResponse(**branch)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error creating branch: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# UPDATE branch
@branch_router.put("/update/{branch_id}", response_model=BranchResponse)
async def update_branch(
    branch_id: int,
    company_id: Optional[int] = Form(None),
    branch_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    status_id: Optional[int] = Form(None),
    address: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    is_global: Optional[int] = Form(None),
    parent_branch_id: Optional[int] = Form(None),
):
    update_data = {
        "company_id": company_id,
        "branch_name": branch_name,
        "email": email,
        "phone_number": phone_number,
        "status_id": status_id,
        "address": address,
        "postal_code": postal_code,
        "city": city,
        "state": state,
        "country": country,
        "is_global": is_global,
        "parent_branch_id": parent_branch_id,
    }

    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}

    updated_branch = BranchService.update_branch(branch_id, update_data)
    return BranchResponse(**updated_branch)



# DELETE/Archive branch
@branch_router.delete("/{branch_id}")
async def delete_branch(branch_id: int):
    """Delete (archive) a branch"""
    try:
        BranchService.delete_branch(branch_id)
        return {"message": f"Branch '{branch_id}' archived successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error deleting branch: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# REINSTATE branch
@branch_router.patch("/{branch_id}/reinstate")
async def reinstate_branch(branch_id: int):
    """Reinstate an archived branch"""
    try:
        BranchService.reinstate_branch(branch_id)
        return {"message": f"Branch '{branch_id}' reinstated successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error reinstating branch: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# GET branches by company
@branch_router.get("/companies/{company_id}/branches", response_model=List[BranchResponse])
async def get_branches_by_company(company_id: int):
    """Get all branches for a specific company"""
    try:
        branches = BranchService.get_branches_by_company(company_id)
        return [BranchResponse(**branch) for branch in branches]
    except Exception as e:
        print(f"Error fetching branches by company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
