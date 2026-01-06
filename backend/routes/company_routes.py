from fastapi import APIRouter, HTTPException, UploadFile, Form, status, Query
from typing import List, Optional
import os
import shutil
from datetime import datetime

from database import db
from models.company_models import CompanyResponse
from services.company_service import CompanyService
from services.branch_service import BranchService


# ------------------ Router ------------------ #
company_router = APIRouter(prefix="/companies", tags=["Companies"])


# ------------------ Database Dependency ------------------ #
# No longer needed - using direct database class

# ------------------ File Upload ------------------ #
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'company_logos')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename: str):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Note: CompanyCreate and CompanyUpdate are defined in models/company_models.py
# But we use Form(...) here because of file upload support

# ------------------ Routes ------------------ #

# GET all companies (with optional filtering)
@company_router.get("", response_model=List[CompanyResponse])
async def get_companies(status_id: Optional[int] = Query(None, description="Filter by status ID")):
    """Get all companies with optional status filter"""
    try:
        if status_id is not None:
            companies = CompanyService.get_all_companies(status_id=status_id)
        else:
            companies = CompanyService.get_all_companies()
        return [CompanyResponse(**company) for company in companies]
    except Exception as e:
        print(f"Error fetching companies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# GET single company
@company_router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: int):
    """Get a specific company by ID"""
    try:
        company = CompanyService.get_company_by_id(company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with ID '{company_id}' not found"
            )
        return CompanyResponse(**company)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# CREATE company
@company_router.post("/create", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_name: str = Form(...),
    registration_no: Optional[str] = Form(None),
    industry_type: Optional[str] = Form(None),
    website_url: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone_prefix: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    phone_extension: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    state: Optional[str] = Form(None),          
    city: Optional[str] = Form(None),           
    postal_code: Optional[str] = Form(None), 
    country: Optional[str] = Form(None),
    status_id: Optional[int] = Form(1),
    logo: Optional[UploadFile] = None
):
    try:
        logo_path = None  # Initialize first
        if logo:
            if not allowed_file(logo.filename):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid logo format")
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            filename = f"{registration_no or 'company'}_{logo.filename}"
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(logo.file, buffer)
            logo_path = os.path.join('uploads', 'company_logos', filename).replace("\\", "/")

        company_data = {
            "company_name": company_name,
            "registration_no": registration_no,
            "industry_type": industry_type,
            "website_url": website_url,
            "email": email,
            "phone_prefix": phone_prefix,
            "phone_number": phone_number,
            "phone_extension": phone_extension,
            "address": address,
            "state": state,             
            "city": city,                
            "postal_code": postal_code, 
            "country": country,
            "status_id": status_id or 1,
            "logo_path": logo_path  # Use after initialization
        }

        company = CompanyService.create_company(company_data)
        return CompanyResponse(**company)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        print(f"Error creating company: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Internal server error: {str(e)}")

@company_router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,

    company_name: Optional[str] = Form(None),
    registration_no: Optional[str] = Form(None),
    industry_type: Optional[str] = Form(None),
    website_url: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone_prefix: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    phone_extension: Optional[str] = Form(None),
    status_id: Optional[int] = Form(None),

    # 🔥 ADDRESS FIELDS (MISSING EARLIER)
    address: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    country: Optional[str] = Form(None),

    logo: Optional[UploadFile] = None,
):
    try:
        logo_path = None
        if logo:
            if not allowed_file(logo.filename):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid logo format"
                )

            company_data = db.execute_query_one(
                "SELECT registration_no FROM companies WHERE company_id = %s",
                (company_id,)
            )
            reg_no = company_data.get('registration_no') if company_data else 'company'

            filename = f"{reg_no}_{logo.filename}"
            file_path = os.path.join(UPLOAD_FOLDER, filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(logo.file, buffer)

            logo_path = os.path.join(
                'uploads', 'company_logos', filename
            ).replace("\\", "/")

        update_data = {}

        # scalar fields
        for field, value in {
            "company_name": company_name,
            "registration_no": registration_no,
            "industry_type": industry_type,
            "website_url": website_url,
            "email": email,
            "phone_prefix": phone_prefix,
            "phone_number": phone_number,
            "phone_extension": phone_extension,
            "status_id": status_id,
            "country": country,
        }.items():
            if value is not None:
                update_data[field] = value

        # address fields
        for field, value in {
            "address": address,
            "state": state,
            "city": city,
            "postal_code": postal_code,
            "country": country,
        }.items():
            if value is not None:
                update_data[field] = value

        if logo_path:
            update_data["logo_path"] = logo_path

        company = CompanyService.update_company(company_id, update_data)
        return CompanyResponse(**company)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# DELETE (archive) company
@company_router.delete("/delete/{company_id}")
async def delete_company(company_id: int):
    """Archive (soft delete) a company by setting status_id to Inactive"""
    try:
        success = CompanyService.delete_company(company_id)
        if success:
            return {"success": True, "message": f"Company '{company_id}' archived successfully"}
        else:
            raise ValueError(f"Company with ID {company_id} not found")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error archiving company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

#handling unique errors

@company_router.get("/check-unique")
async def check_company_unique(
    company_name: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    phone_number: Optional[str] = Query(None),
    exclude_company_id: Optional[int] = Query(
        None, description="Exclude company ID (used while editing)"
    )
):
    """
    Check if company_name, email, or phone_number already exists
    """
    try:
        if company_name:
            company = CompanyService.get_by_company_name(company_name)
            if company and company["company_id"] != exclude_company_id:
                return {"field": "company_name", "exists": True}

        if email:
            company = CompanyService.get_by_email(email)
            if company and company["company_id"] != exclude_company_id:
                return {"field": "email", "exists": True}

        if phone_number:
            company = CompanyService.get_by_phone_number(phone_number)
            if company and company["company_id"] != exclude_company_id:
                return {"field": "phone_number", "exists": True}

        return {"exists": False}

    except Exception as e:
        print(f"Error checking uniqueness: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )



# GET branches by company
@company_router.get("/{company_id}/branches", response_model=List[dict])
async def get_branches_by_company(company_id: int):
    """Get all branches for a specific company"""
    # Check if company exists
    check_company_query = "SELECT company_id FROM companies WHERE company_id = %s"
    existing_company = db.execute_query_one(check_company_query, (company_id,))
    if not existing_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID '{company_id}' not found"
        )
    
    # Get branches by company
    query = """
        SELECT b.*, a.address_line1, a.address_line2, a.city, a.state, a.country, a.zip_code, a.timezone as address_timezone
        FROM branches b
        LEFT JOIN addresses a ON b.address_id = a.address_id
        WHERE b.company_id = %s
        ORDER BY b.created_at DESC
    """
    result = db.execute_query_all(query, (company_id,))
    
    branches = []
    for row in result:
        branch_dict = {
            'branch_id': row['branch_id'],
            'company_id': row['company_id'],
            'name': row['name'],
            'email': row['email'],
            'phone_prefix': row['phone_prefix'],
            'phone_number': row['phone_number'],
            'address_id': row['address_id'],
            'status': row['status'],
            'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            'updated_at': row['updated_at'].isoformat() if row['updated_at'] else None,
            'address': {
                'address_line1': row['address_line1'],
                'address_line2': row['address_line2'],
                'city': row['city'],
                'state': row['state'],
                'country': row['country'],
                'zip_code': row['zip_code'],
                'timezone': row['address_timezone']
            } if row['address_id'] else None
        }
        branches.append(branch_dict)
    
    return branches
