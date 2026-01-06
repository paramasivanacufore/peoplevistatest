# # # from fastapi import APIRouter, HTTPException, status, Form, Query
# # # from typing import List, Optional
# # # from datetime import datetime
# # # import json

# # # from database import db
# # # from models.department_models import DepartmentResponse
# # # from services.department_service import DepartmentService

# # # department_router = APIRouter(prefix="/departments", tags=["Departments"])


# # # # ---------------- Create Main Department ---------------- #
# # # @department_router.post("/main", status_code=status.HTTP_201_CREATED)
# # # async def create_main_department(
# # #     company_id: int = Form(...),
# # #     department_name: str = Form(...),
# # #     short_code: Optional[str] = Form(None),
# # #     description: Optional[str] = Form(None),
# # #     status_id: int = Form(1),
# # #     branch_ids: str = Form(...)  # JSON string of branch IDs
# # # ):
# # #     try:
# # #         branch_ids_list = json.loads(branch_ids)
# # #         if not branch_ids_list or not isinstance(branch_ids_list, list):
# # #             raise HTTPException(
# # #                 status_code=status.HTTP_400_BAD_REQUEST,
# # #                 detail="At least one branch must be selected"
# # #             )

# # #         department_data = {
# # #             'company_id': company_id,
# # #             'department_name': department_name,
# # #             'short_code': short_code,
# # #             'description': description,
# # #             'status_id': status_id
# # #         }

# # #         created_departments = DepartmentService.create_main_department(department_data, branch_ids_list)

# # #         return {
# # #             "message": "Main department created across selected branches",
# # #             "departments": created_departments
# # #         }
# # #     except Exception as e:
# # #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # #                             detail=f"Internal server error: {str(e)}")


# # # # ---------------- Create Sub Department ---------------- #
# # # @department_router.post("/sub", status_code=status.HTTP_201_CREATED)
# # # async def create_sub_department(
# # #     company_id: int = Form(...),
# # #     department_name: str = Form(...),
# # #     short_code: Optional[str] = Form(None),
# # #     description: Optional[str] = Form(None),
# # #     status_id: int = Form(1),
# # #     branch_ids: Optional[str] = Form(None),  # JSON string from frontend
# # #     parent_department_id: Optional[int] = Form(None)
# # # ):
# # #     try:
# # #         branch_ids_list: Optional[List[int]] = None
# # #         if branch_ids:
# # #             branch_ids_list = json.loads(branch_ids)

# # #         department_data = {
# # #             'company_id': company_id,
# # #             'department_name': department_name,
# # #             'short_code': short_code,
# # #             'description': description,
# # #             'status_id': status_id,
# # #             'branch_ids': branch_ids_list,
# # #             'parent_department_id': parent_department_id
# # #         }

# # #         department = DepartmentService.create_sub_department(department_data)

# # #         return {
# # #             "message": "Sub-department created successfully",
# # #             "department": department
# # #         }
# # #     except Exception as e:
# # #         raise HTTPException(
# # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # #             detail=f"Internal server error: {str(e)}"
# # #         )


# # # # ---------------- Get All Departments ---------------- #
# # # @department_router.get("", response_model=List[DepartmentResponse])
# # # async def get_departments(
# # #     company_id: Optional[int] = Query(None),
# # #     branch_id: Optional[int] = Query(None),
# # #     is_main: Optional[bool] = Query(None),
# # #     status_id: Optional[int] = Query(None)
# # # ):
# # #     try:
# # #         departments = DepartmentService.get_all_departments(
# # #             company_id=company_id,
# # #             branch_id=branch_id,
# # #             is_main=is_main,
# # #             active_only=None
# # #         )

# # #         if status_id is not None:
# # #             departments = [d for d in departments if d['status_id'] == status_id]

# # #         return [DepartmentResponse(**dept) for dept in departments]
# # #     except Exception as e:
# # #         raise HTTPException(
# # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # #             detail=f"Internal server error: {str(e)}"
# # #         )


# # # # ---------------- Get Main Departments (Dropdown) ---------------- #
# # # @department_router.get("/main_departments", response_model=List[DepartmentResponse])
# # # async def get_main_departments(company_id: int = Query(...)):
# # #     try:
# # #         query = """
# # #             SELECT d.*, GROUP_CONCAT(l.branch_id) AS branch_ids
# # #             FROM departments d
# # #             LEFT JOIN dpt_linkedto_branch l ON d.department_id = l.department_id
# # #             WHERE d.is_global = %s AND d.company_id = %s AND d.parent_department_id IS NULL
# # #             GROUP BY d.department_id
# # #         """
# # #         main_departments = db.execute_query_all(query, (True, company_id))

# # #         results = []
# # #         for dept in main_departments:
# # #             branch_ids = []
# # #             if dept.get('branch_ids'):
# # #                 branch_ids = [int(bid) for bid in dept['branch_ids'].split(',')]
            
# # #             results.append(DepartmentResponse(
# # #                 **{
# # #                     **dept,
# # #                     'branch_ids': branch_ids,
# # #                     'name': dept['department_name']
# # #                 }
# # #             ))

# # #         return results
# # #     except Exception as e:
# # #         raise HTTPException(
# # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # #             detail=f"Internal server error: {str(e)}"
# # #         )


# # # # ---------------- Get Departments by Company & Branch ---------------- #
# # # @department_router.get("/by-company-branch", response_model=List[DepartmentResponse])
# # # async def get_departments_by_company_branch(company_id: int, branch_id: int):
# # #     try:
# # #         departments = DepartmentService.get_departments_by_company_branch(company_id, branch_id)
# # #         return [DepartmentResponse(**dept) for dept in departments]
# # #     except Exception as e:
# # #         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# # # # ---------------- Get Department by ID ---------------- #
# # # @department_router.get("/{department_id}", response_model=DepartmentResponse)
# # # async def get_department(department_id: int):
# # #     try:
# # #         department = DepartmentService.get_department_by_id(department_id)
# # #         if not department:
# # #             raise HTTPException(status_code=404, detail=f"Department with ID '{department_id}' not found")
# # #         return DepartmentResponse(**department)
# # #     except Exception as e:
# # #         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# # # # ---------------- Update Department ---------------- #
# # # @department_router.put("/{department_id}", response_model=DepartmentResponse)
# # # async def update_department(
# # #     department_id: int,
# # #     company_id: Optional[int] = Form(None),
# # #     department_name: Optional[str] = Form(None),
# # #     branch_id: Optional[int] = Form(None),
# # #     branch_ids: Optional[str] = Form(None),
# # #     is_global: Optional[str] = Form(None),
# # #     parent_department_id: Optional[int] = Form(None),
# # #     short_code: Optional[str] = Form(None),
# # #     description: Optional[str] = Form(None),
# # #     status_id: Optional[int] = Form(None)
# # # ):
# # #     try:
# # #         update_data = {}
# # #         if company_id is not None:
# # #             update_data['company_id'] = company_id
# # #         if department_name is not None:
# # #             update_data['department_name'] = department_name
# # #         if branch_id is not None:
# # #             update_data['branch_id'] = branch_id
# # #         if branch_ids:
# # #             try:
# # #                 update_data['branch_ids'] = json.loads(branch_ids)
# # #             except Exception:
# # #                 raise HTTPException(status_code=422, detail="Invalid branch_ids format. Must be JSON array.")
# # #         if is_global is not None:
# # #             update_data['is_global'] = is_global.lower() == 'true'
# # #         if parent_department_id is not None:
# # #             update_data['parent_department_id'] = parent_department_id
# # #         if short_code is not None:
# # #             update_data['short_code'] = short_code
# # #         if description is not None:
# # #             update_data['description'] = description
# # #         if status_id is not None:
# # #             update_data['status_id'] = status_id

# # #         department = DepartmentService.update_department(department_id, update_data)
# # #         return DepartmentResponse(**department)
# # #     except Exception as e:
# # #         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# # # # ---------------- Archive Department ---------------- #
# # # @department_router.delete("/{department_id}")
# # # async def delete_department(department_id: int):
# # #     try:
# # #         DepartmentService.delete_department(department_id)
# # #         return {"message": f"Department '{department_id}' archived successfully"}
# # #     except Exception as e:
# # #         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")








# # # # from fastapi import APIRouter, HTTPException, status, Form, Query
# # # # from typing import List, Optional
# # # # from datetime import datetime
# # # # import json

# # # # from database import db
# # # # from models.department_models import DepartmentResponse
# # # # from services.department_service import DepartmentService

# # # # department_router = APIRouter(prefix="/departments", tags=["Departments"])

# # # # # ---------------- Create Main Department ---------------- #
# # # # @department_router.post("/main", status_code=status.HTTP_201_CREATED)
# # # # async def create_main_department(
# # # #     company_id: int = Form(...),
# # # #     department_name: str = Form(...),
# # # #     short_code: Optional[str] = Form(None),
# # # #     description: Optional[str] = Form(None),
# # # #     status_id: int = Form(1),
# # # #     branch_ids: str = Form(...)  # JSON string of branch IDs
# # # # ):
# # # #     try:
# # # #         branch_ids_list = json.loads(branch_ids)
# # # #         if not branch_ids_list or not isinstance(branch_ids_list, list):
# # # #             raise HTTPException(
# # # #                 status_code=status.HTTP_400_BAD_REQUEST,
# # # #                 detail="At least one branch must be selected"
# # # #             )

# # # #         department_data = {
# # # #             'company_id': company_id,
# # # #             'department_name': department_name,
# # # #             'short_code': short_code,
# # # #             'description': description,
# # # #             'status_id': status_id
# # # #         }

# # # #         created_departments = DepartmentService.create_main_department(department_data, branch_ids_list)

# # # #         return {
# # # #             "message": "Main department created across selected branches",
# # # #             "departments": created_departments
# # # #         }
# # # #     except ValueError as e:
# # # #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
# # # #     except Exception as e:
# # # #         print(f"Error in create_main_department: {str(e)}")
# # # #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # # #                             detail=f"Internal server error: {str(e)}")


# # # # # ---------------- Create Sub Department ---------------- #
# # # # @department_router.post("/sub", status_code=status.HTTP_201_CREATED)
# # # # async def create_sub_department(
# # # #     company_id: int = Form(...),
# # # #     department_name: str = Form(...),
# # # #     short_code: Optional[str] = Form(None),
# # # #     description: Optional[str] = Form(None),
# # # #     status_id: int = Form(1),
# # # #     branch_ids: Optional[str] = Form(None),  # JSON string from frontend
# # # #     parent_department_id: Optional[int] = Form(None)
# # # # ):
# # # #     try:
# # # #         # Parse branch_ids from JSON string to list
# # # #         branch_ids_list: Optional[List[int]] = None
# # # #         if branch_ids:
# # # #             branch_ids_list = json.loads(branch_ids)

# # # #         department_data = {
# # # #             'company_id': company_id,
# # # #             'department_name': department_name,
# # # #             'short_code': short_code,
# # # #             'description': description,
# # # #             'status_id': status_id,
# # # #             'branch_ids': branch_ids_list,  # use branch_ids instead of branch_id
# # # #             'parent_department_id': parent_department_id
# # # #         }

# # # #         # Call service to create sub-department with branch_ids
# # # #         department = DepartmentService.create_sub_department(department_data)

# # # #         return {
# # # #             "message": "Sub-department created successfully",
# # # #             "department": department
# # # #         }
# # # #     except ValueError as e:
# # # #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
# # # #     except Exception as e:
# # # #         print(f"Error creating sub-department: {str(e)}")
# # # #         raise HTTPException(
# # # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # # #             detail=f"Internal server error: {str(e)}"
# # # #         )


# # # # # ---------------- Get All Departments ---------------- #
# # # # @department_router.get("", response_model=List[DepartmentResponse])
# # # # async def get_departments(
# # # #     company_id: Optional[int] = Query(None, description="Filter by company ID"),
# # # #     branch_id: Optional[int] = Query(None, description="Filter by branch ID"),
# # # #     is_main: Optional[bool] = Query(None, description="Filter by main department status"),
# # # #     status_id: Optional[int] = Query(None, description="Filter by status ID")
# # # # ):
# # # #     try:
# # # #         departments = DepartmentService.get_all_departments(
# # # #             company_id=company_id,
# # # #             branch_id=branch_id,
# # # #             is_main=is_main,
# # # #             active_only=None
# # # #         )

# # # #         if status_id is not None:
# # # #             departments = [d for d in departments if d['status_id'] == status_id]

# # # #         return [DepartmentResponse(**dept) for dept in departments]
# # # #     except Exception as e:
# # # #         print(f"Error in get_departments: {str(e)}")
# # # #         raise HTTPException(
# # # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # # #             detail=f"Internal server error: {str(e)}"
# # # #         )


# # # # # ---------------- Get Main Departments (Dropdown) ---------------- #
# # # # @department_router.get("/main_departments", response_model=List[DepartmentResponse])
# # # # async def get_main_departments(company_id: int = Query(..., description="Company ID")):
# # # #     try:
# # # #         query = """
# # # #             SELECT * 
# # # #             FROM departments 
# # # #             WHERE is_global = %s 
# # # #               AND company_id = %s 
# # # #               AND parent_department_id IS NULL
# # # #         """
# # # #         main_departments = db.execute_query_all(query, (True, company_id))

# # # #         unique_departments = {}
# # # #         for dept in main_departments:
# # # #             dept_name = dept.get('department_name')
# # # #             if dept_name and dept_name not in unique_departments:
# # # #                 # Parse branch_ids JSON if it exists, else fallback to branch_id
# # # #                 branch_ids = []
# # # #                 if dept.get('branch_ids'):
# # # #                     try:
# # # #                         branch_ids = json.loads(dept['branch_ids'])
# # # #                     except Exception:
# # # #                         branch_ids = []
# # # #                 elif dept.get('branch_id'):
# # # #                     branch_ids = [dept['branch_id']]

# # # #                 unique_departments[dept_name] = {
# # # #                     'department_id': dept['department_id'],
# # # #                     'department_name': dept_name,
# # # #                     'name': dept_name,
# # # #                     'company_id': dept['company_id'],
# # # #                     'branch_id': dept.get('branch_id'),  # keep for backward compatibility, can be None
# # # #                     'branch_ids': branch_ids,            # NEW: provide branch_ids list
# # # #                     'is_global': dept.get('is_global'),
# # # #                     'parent_department_id': dept.get('parent_department_id'),
# # # #                     'short_code': dept.get('short_code'),
# # # #                     'description': dept.get('description'),
# # # #                     'status_id': dept.get('status_id', 1),
# # # #                     'created_at': dept.get('created_at'),
# # # #                     'updated_at': dept.get('updated_at')
# # # #                 }

# # # #         return [DepartmentResponse(**dept) for dept in unique_departments.values()]

# # # #     except Exception as e:
# # # #         print(f"Error getting main departments: {str(e)}")
# # # #         raise HTTPException(
# # # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # # #             detail=f"Internal server error: {str(e)}"
# # # #         )


# # # # @department_router.get("/by-company-branch", response_model=List[DepartmentResponse])
# # # # async def get_departments_by_company_branch(
# # # #     company_id: int,
# # # #     branch_id: int
# # # # ):
# # # #     try:
# # # #         return DepartmentService.get_departments_by_company_branch(company_id, branch_id)

# # # #     except Exception as e:
# # # #         raise HTTPException(
# # # #             status_code=500,
# # # #             detail=f"Internal server error: {str(e)}"
# # # #         )



# # # # # ---------------- Get Department by ID ---------------- #
# # # # @department_router.get("/{department_id}", response_model=DepartmentResponse)
# # # # async def get_department(department_id: int):
# # # #     try:
# # # #         department = DepartmentService.get_department_by_id(department_id)
# # # #         if not department:
# # # #             raise HTTPException(
# # # #                 status_code=status.HTTP_404_NOT_FOUND,
# # # #                 detail=f"Department with ID '{department_id}' not found"
# # # #             )
# # # #         return DepartmentResponse(**department)
# # # #     except HTTPException:
# # # #         raise
# # # #     except Exception as e:
# # # #         print(f"Error getting department: {str(e)}")
# # # #         raise HTTPException(
# # # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # # #             detail=f"Internal server error: {str(e)}"
# # # #         )


# # # # # ---------------- Update Department ---------------- #
# # # # @department_router.put("/{department_id}", response_model=DepartmentResponse)
# # # # async def update_department(
# # # #     department_id: int,
# # # #     company_id: Optional[int] = Form(None),
# # # #     department_name: Optional[str] = Form(None),
# # # #     branch_id: Optional[int] = Form(None),
# # # #     branch_ids: Optional[str] = Form(None),  # <-- IMPORTANT
# # # #     is_global: Optional[str] = Form(None),
# # # #     parent_department_id: Optional[int] = Form(None),
# # # #     short_code: Optional[str] = Form(None),
# # # #     description: Optional[str] = Form(None),
# # # #     status_id: Optional[int] = Form(None)
# # # # ):
# # # #     try:
# # # #         update_data = {}

# # # #         if department_name is not None:
# # # #             update_data["department_name"] = department_name

# # # #         if company_id is not None:
# # # #             update_data["company_id"] = company_id
        
# # # #         if branch_ids is not None:
# # # #             try:
# # # #                 update_data["branch_ids"] = json.loads(branch_ids)
# # # #             except:
# # # #                 update_data["branch_ids"] = []


# # # #         # For sub-department (single branch)
# # # #         if branch_id is not None:
# # # #             update_data["branch_id"] = branch_id

# # # #         # For multi-branch assignment (main OR sub)
# # # #         if branch_ids:
# # # #             try:
# # # #                 update_data["branch_ids"] = json.loads(branch_ids)
# # # #             except Exception:
# # # #                 raise HTTPException(
# # # #                     status_code=422,
# # # #                     detail="Invalid branch_ids format. Must be JSON array."
# # # #                 )

# # # #         if is_global is not None:
# # # #             update_data["is_global"] = is_global.lower() == "true"

# # # #         if parent_department_id is not None:
# # # #             update_data["parent_department_id"] = parent_department_id

# # # #         if short_code is not None:
# # # #             update_data["short_code"] = short_code

# # # #         if description is not None:
# # # #             update_data["description"] = description

# # # #         if status_id is not None:
# # # #             update_data["status_id"] = status_id

# # # #         # Service call
# # # #         department = DepartmentService.update_department(department_id, update_data)

# # # #         return DepartmentResponse(**department)

# # # #     except ValueError as e:
# # # #         raise HTTPException(status_code=404, detail=str(e))

# # # #     except Exception as e:
# # # #         print(f"Error updating department: {str(e)}")
# # # #         raise HTTPException(
# # # #             status_code=500,
# # # #             detail=f"Internal server error: {str(e)}"
# # # #         )





# # # # # ---------------- Archive Department ---------------- #
# # # # @department_router.delete("/{department_id}")
# # # # async def delete_department(department_id: int):
# # # #     try:
# # # #         DepartmentService.delete_department(department_id)
# # # #         return {"message": f"Department '{department_id}' archived successfully"}
# # # #     except ValueError as e:
# # # #         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
# # # #     except Exception as e:
# # # #         print(f"Error deleting department: {str(e)}")
# # # #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # # #                             detail=f"Internal server error: {str(e)}")

# # from fastapi import APIRouter, HTTPException, status, Form, Query
# # from typing import List, Optional
# # from datetime import datetime
# # import json

# # from database import db
# # from models.department_models import DepartmentCreate, DepartmentUpdate, DepartmentResponse, MainDepartmentResponse
# # from services.department_service import DepartmentService

# # department_router = APIRouter(prefix="/departments", tags=["Departments"])

# # # ---------------- Create Main Department ---------------- #
# # @department_router.post("/main", response_model=List[DepartmentResponse], status_code=status.HTTP_201_CREATED)
# # async def create_main_department(
# #     company_id: int = Form(...),
# #     department_name: str = Form(...),
# #     short_code: Optional[str] = Form(None),
# #     description: Optional[str] = Form(None),
# #     status_id: int = Form(1),
# #     branch_ids: str = Form(...)  # JSON string of branch IDs
# # ):
# #     try:
# #         branch_ids_list = json.loads(branch_ids)
# #         if not branch_ids_list or not isinstance(branch_ids_list, list):
# #             raise HTTPException(
# #                 status_code=status.HTTP_400_BAD_REQUEST,
# #                 detail="At least one branch must be selected"
# #             )

# #         department_data = {
# #             "company_id": company_id,
# #             "department_name": department_name,
# #             "short_code": short_code,
# #             "description": description,
# #             "status_id": status_id,
# #             "branch_ids": branch_ids_list
# #         }

# #         created_departments = DepartmentService.create_main_department(department_data)
# #         return created_departments

# #     except ValueError as e:
# #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
# #     except Exception as e:
# #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# # # ---------------- Create Sub Department ---------------- #
# # @department_router.post("/sub", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
# # async def create_sub_department(
# #     company_id: int = Form(...),
# #     department_name: str = Form(...),
# #     short_code: Optional[str] = Form(None),
# #     description: Optional[str] = Form(None),
# #     status_id: int = Form(1),
# #     branch_ids: Optional[str] = Form(None),  # JSON string
# #     parent_department_id: Optional[int] = Form(None)
# # ):
# #     try:
# #         branch_ids_list: Optional[List[int]] = json.loads(branch_ids) if branch_ids else None

# #         department_data = {
# #             "company_id": company_id,
# #             "department_name": department_name,
# #             "short_code": short_code,
# #             "description": description,
# #             "status_id": status_id,
# #             "branch_ids": branch_ids_list,
# #             "parent_department_id": parent_department_id
# #         }

# #         department = DepartmentService.create_sub_department(department_data)
# #         return department

# #     except ValueError as e:
# #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
# #     except Exception as e:
# #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# # # ---------------- Get All Departments ---------------- #
# # @department_router.get("", response_model=List[DepartmentResponse])
# # async def get_departments(
# #     company_id: Optional[int] = Query(None),
# #     branch_id: Optional[int] = Query(None),
# #     is_main: Optional[bool] = Query(None),
# #     status_id: Optional[int] = Query(None)
# # ):
# #     try:
# #         departments = DepartmentService.get_all_departments(company_id=company_id, branch_id=branch_id, is_main=is_main)

# #         if status_id is not None:
# #             departments = [d for d in departments if d["status_id"] == status_id]

# #         return departments

# #     except Exception as e:
# #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# # # ---------------- Get Main Departments (Dropdown) ---------------- #
# # @department_router.get("/main_departments", response_model=List[MainDepartmentResponse])
# # async def get_main_departments(company_id: int = Query(...)):
# #     try:
# #         main_departments = DepartmentService.get_main_departments(company_id)
# #         return main_departments

# #     except Exception as e:
# #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# # # ---------------- Get Departments by Company & Branch ---------------- #
# # @department_router.get("/by-company-branch", response_model=List[DepartmentResponse])
# # async def get_departments_by_company_branch(company_id: int, branch_id: int):
# #     try:
# #         return DepartmentService.get_departments_by_company_branch(company_id, branch_id)
# #     except Exception as e:
# #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# # # ---------------- Get Department by ID ---------------- #
# # @department_router.get("/{department_id}", response_model=DepartmentResponse)
# # async def get_department(department_id: int):
# #     try:
# #         department = DepartmentService.get_department_by_id(department_id)
# #         if not department:
# #             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Department with ID {department_id} not found")
# #         return department
# #     except Exception as e:
# #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# # # ---------------- Update Department ---------------- #
# # @department_router.put("/{department_id}", response_model=DepartmentResponse)
# # async def update_department(
# #     department_id: int,
# #     company_id: Optional[int] = Form(None),
# #     department_name: Optional[str] = Form(None),
# #     branch_ids: Optional[str] = Form(None),
# #     is_global: Optional[str] = Form(None),
# #     parent_department_id: Optional[int] = Form(None),
# #     short_code: Optional[str] = Form(None),
# #     description: Optional[str] = Form(None),
# #     status_id: Optional[int] = Form(None)
# # ):
# #     try:
# #         update_data = {}

# #         if company_id is not None:
# #             update_data["company_id"] = company_id
# #         if department_name is not None:
# #             update_data["department_name"] = department_name
# #         if branch_ids is not None:
# #             try:
# #                 update_data["branch_ids"] = json.loads(branch_ids)
# #             except Exception:
# #                 raise HTTPException(status_code=422, detail="Invalid branch_ids format")
# #         if is_global is not None:
# #             update_data["is_global"] = is_global.lower() == "true"
# #         if parent_department_id is not None:
# #             update_data["parent_department_id"] = parent_department_id
# #         if short_code is not None:
# #             update_data["short_code"] = short_code
# #         if description is not None:
# #             update_data["description"] = description
# #         if status_id is not None:
# #             update_data["status_id"] = status_id

# #         department = DepartmentService.update_department(department_id, update_data)
# #         return department

# #     except ValueError as e:
# #         raise HTTPException(status_code=404, detail=str(e))
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))


# # # ---------------- Archive Department ---------------- #
# # @department_router.delete("/{department_id}")
# # async def delete_department(department_id: int):
# #     try:
# #         DepartmentService.delete_department(department_id)
# #         return {"message": f"Department {department_id} archived successfully"}
# #     except ValueError as e:
# #         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
# #     except Exception as e:
# #         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
# from fastapi import APIRouter, HTTPException, status, Form, Query
# from typing import List, Optional
# import json

# from services.department_service import DepartmentService
# from models.department_models import DepartmentResponse, MainDepartmentResponse

# department_router = APIRouter(prefix="/departments", tags=["Departments"])


# # ---------------- CREATE MAIN DEPARTMENT ---------------- #
# @department_router.post("/main", response_model=DepartmentResponse, status_code=201)
# async def create_main_department(
#     company_id: int = Form(...),
#     department_name: str = Form(...),
#     branch_ids: str = Form(...),  # JSON ARRAY
#     short_code: Optional[str] = Form(None),
#     description: Optional[str] = Form(None),
#     status_id: int = Form(1),
# ):
#     try:
#         return DepartmentService.create_department({
#             "company_id": company_id,
#             "department_name": department_name,
#             "branch_ids": json.loads(branch_ids),
#             "short_code": short_code,
#             "description": description,
#             "status_id": status_id,
#             "is_global": True
#         })
#     except Exception as e:
#         raise HTTPException(400, str(e))


# # ---------------- CREATE SUB DEPARTMENT ---------------- #
# @department_router.post("/sub", response_model=DepartmentResponse, status_code=201)
# async def create_sub_department(
#     company_id: int = Form(...),
#     department_name: str = Form(...),
#     parent_department_id: int = Form(...),
#     branch_ids: str = Form(...),
#     short_code: Optional[str] = Form(None),
#     description: Optional[str] = Form(None),
#     status_id: int = Form(1),
# ):
#     try:
#         return DepartmentService.create_department({
#             "company_id": company_id,
#             "department_name": department_name,
#             "parent_department_id": parent_department_id,
#             "branch_ids": json.loads(branch_ids),
#             "short_code": short_code,
#             "description": description,
#             "status_id": status_id,
#             "is_global": False
#         })
#     except Exception as e:
#         raise HTTPException(400, str(e))


# # ---------------- GET ALL DEPARTMENTS ---------------- #
# @department_router.get("", response_model=List[DepartmentResponse])
# async def get_departments(
#     company_id: Optional[int] = Query(None),
#     branch_id: Optional[int] = Query(None),
# ):
#     return DepartmentService.get_all_departments(company_id, branch_id)


# # ---------------- GET DEPARTMENT BY ID ---------------- #
# @department_router.get("/{department_id}", response_model=DepartmentResponse)
# async def get_department(department_id: int):
#     dept = DepartmentService.get_department_by_id(department_id)
#     if not dept:
#         raise HTTPException(404, "Department not found")
#     return dept



# @department_router.get(
#     "/main_departments",
#     response_model=List[DepartmentResponse]
# )
# async def get_main_departments(
#     company_id: int = Query(..., description="Company ID")
# ):
#     try:
#         return DepartmentService.get_main_departments(company_id)
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Internal server error: {str(e)}"
#         )

# # ---------------- UPDATE DEPARTMENT ---------------- #
# @department_router.put("/{department_id}", response_model=DepartmentResponse)
# async def update_department(
#     department_id: int,
#     department_name: Optional[str] = Form(None),
#     branch_ids: Optional[str] = Form(None),
#     short_code: Optional[str] = Form(None),
#     description: Optional[str] = Form(None),
#     status_id: Optional[int] = Form(None),
# ):
#     data = {}
#     if department_name:
#         data["department_name"] = department_name
#     if short_code:
#         data["short_code"] = short_code
#     if description:
#         data["description"] = description
#     if status_id is not None:
#         data["status_id"] = status_id
#     if branch_ids:
#         data["branch_ids"] = json.loads(branch_ids)

#     return DepartmentService.update_department(department_id, data)


# # ---------------- ARCHIVE DEPARTMENT ---------------- #
# @department_router.delete("/{department_id}")
# async def delete_department(department_id: int):
#     DepartmentService.archive_department(department_id)
#     return {"message": "Department archived successfully"}
# @department_router.get(
#     "/by-company-branch",
#     response_model=List[DepartmentResponse]
# )
# async def get_departments_by_company_branch(
#     company_id: int,
#     branch_id: int
# ):
#     try:
#         return DepartmentService.get_departments_by_company_branch(
#             company_id, branch_id
#         )
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Internal server error: {str(e)}"
#         )
from fastapi import APIRouter, HTTPException, status, Form, Query
from typing import List, Optional
import json

from models.department_models import DepartmentResponse
from services.department_service import DepartmentService

department_router = APIRouter(prefix="/departments", tags=["Departments"])


# ---------------- CREATE MAIN DEPARTMENT ---------------- #
@department_router.post("/main", status_code=status.HTTP_201_CREATED)
async def create_main_department(
    company_id: int = Form(...),
    department_name: str = Form(...),
    short_code: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    status_id: int = Form(1),
    branch_ids: str = Form(...)
):
    try:
        branch_ids_list = json.loads(branch_ids)

        if not branch_ids_list:
            raise HTTPException(400, "At least one branch required")

        dept = DepartmentService.create_main_department(
            company_id=company_id,
            department_name=department_name,
            short_code=short_code,
            description=description,
            status_id=status_id,
            branch_ids=branch_ids_list
        )

        return {"message": "Main department created", "department": dept}

    except ValueError as e:
        raise HTTPException(400, str(e))


# ---------------- CREATE SUB DEPARTMENT ---------------- #
@department_router.post("/sub", status_code=status.HTTP_201_CREATED)
async def create_sub_department(
    company_id: int = Form(...),
    department_name: str = Form(...),
    parent_department_id: int = Form(...),
    branch_ids: str = Form(...),
    short_code: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    status_id: int = Form(1)
):
    try:
        dept = DepartmentService.create_sub_department(
            company_id,
            department_name,
            parent_department_id,
            json.loads(branch_ids),
            short_code,
            description,
            status_id
        )
        return {"message": "Sub department created", "department": dept}

    except ValueError as e:
        raise HTTPException(400, str(e))


# ---------------- GET ALL DEPARTMENTS ---------------- #
@department_router.get("", response_model=List[DepartmentResponse])
async def get_departments(
    company_id: Optional[int] = Query(None),
    branch_id: Optional[int] = Query(None),
    is_main: Optional[bool] = Query(None),
):
    return DepartmentService.get_all_departments(company_id, branch_id, is_main)


# ---------------- GET MAIN DEPARTMENTS (DROPDOWN) ---------------- #
@department_router.get("/main_departments", response_model=List[DepartmentResponse])
async def get_main_departments(company_id: int):
    return DepartmentService.get_main_departments(company_id)


# ---------------- GET BY COMPANY & BRANCH ---------------- #
@department_router.get("/by-company-branch", response_model=List[DepartmentResponse])
async def get_by_company_branch(company_id: int, branch_id: int):
    return DepartmentService.get_departments_by_company_branch(company_id, branch_id)


# ---------------- GET BY ID ---------------- #
@department_router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(department_id: int):
    dept = DepartmentService.get_department_by_id(department_id)
    if not dept:
        raise HTTPException(404, "Department not found")
    return dept


# ---------------- UPDATE ---------------- #
@department_router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: int,
    department_name: Optional[str] = Form(None),
    short_code: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    status_id: Optional[int] = Form(None),
    branch_ids: Optional[str] = Form(None),
):
    return DepartmentService.update_department(
        department_id,
        department_name,
        short_code,
        description,
        status_id,
        json.loads(branch_ids) if branch_ids else None
    )


# ---------------- ARCHIVE ---------------- #
@department_router.delete("/{department_id}")
async def delete_department(department_id: int):
    DepartmentService.delete_department(department_id)
    return {"message": "Department archived"}
