from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

class DepartmentService:
    @staticmethod
    def create_department(department_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new department"""
        try:
            # Check if company exists
            company = db.execute_query_one(
                "SELECT company_id FROM companies WHERE company_id = %s",
                (department_data['company_id'],)
            )
            if not company:
                raise ValueError(f"Company with ID {department_data['company_id']} not found")
            
            # Check if branch exists if branch_id provided
            if department_data.get('branch_id'):
                branch = db.execute_query_one(
                    "SELECT branch_id FROM branches WHERE branch_id = %s AND company_id = %s",
                    (department_data['branch_id'], department_data['company_id'])
                )
                if not branch:
                    raise ValueError(f"Branch not found for this company")
            
            # Check for duplicate department name within company
            existing = DepartmentService.get_department_by_name_and_company(
                department_data['department_name'],
                department_data['company_id'],
                department_data.get('branch_id')
            )
            if existing:
                raise ValueError(f"Department '{department_data['department_name']}' already exists")
            
            # Insert department
            query = """
                INSERT INTO departments 
                (company_id, branch_id, department_name, is_global, parent_department_id, 
                 short_code, description, status_id, created_at, updated_at)
                VALUES (%(company_id)s, %(branch_id)s, %(department_name)s, %(is_global)s, 
                        %(parent_department_id)s, %(short_code)s, %(description)s, 
                        %(status_id)s, %(created_at)s, %(updated_at)s)
            """
            current_time = datetime.utcnow()
            dept_insert = {
                'company_id': department_data['company_id'],
                'branch_id': department_data.get('branch_id'),
                'department_name': department_data['department_name'],
                'is_global': department_data.get('is_global', False),
                'parent_department_id': department_data.get('parent_department_id'),
                'short_code': department_data.get('short_code'),
                'description': department_data.get('description'),
                'status_id': department_data.get('status_id', 1),
                'created_at': current_time,
                'updated_at': current_time
            }
            
            department_id = db.execute_insert(query, dept_insert)
            
            return DepartmentService.get_department_by_id(department_id)
            
        except Exception as e:
            print(f"Error creating department: {e}")
            raise e
    
    @staticmethod
    def create_main_department(department_data: Dict[str, Any], branch_ids: List[int]) -> List[Dict[str, Any]]:
        """Create main department across multiple branches"""
        try:
            company_id = department_data['company_id']
            department_name = department_data['department_name']
            
            # Check if company exists
            company = db.execute_query_one(
                "SELECT company_id FROM companies WHERE company_id = %s",
                (company_id,)
            )
            if not company:
                raise ValueError(f"Company with ID {company_id} not found")
            
            created_departments = []
            current_time = datetime.utcnow()
            
            for branch_id in branch_ids:
                # Check if branch exists and belongs to company
                branch = db.execute_query_one(
                    "SELECT branch_id FROM branches WHERE branch_id = %s AND company_id = %s",
                    (branch_id, company_id)
                )
                if not branch:
                    raise ValueError(f"Branch ID {branch_id} not found for this company")
                
                # Create department for this branch (is_global=True)
                insert_query = """
                    INSERT INTO departments (company_id, branch_id, department_name, short_code, 
                                          description, status_id, is_global, parent_department_id, 
                                          created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                department_id = db.execute_insert(insert_query, (
                    company_id, branch_id, department_name,
                    department_data.get('short_code'),
                    department_data.get('description'),
                    department_data.get('status_id', 1),
                    True,  # is_global = True for main departments
                    None,  # parent_department_id = None for main departments
                    current_time, current_time
                ))
                
                created_departments.append({
                    "department_id": department_id,
                    "department_name": department_name,
                    "company_id": company_id,
                    "branch_id": branch_id,
                    "is_global": True,
                    "status_id": department_data.get('status_id', 1)
                })
            
            return created_departments
            
        except Exception as e:
            print(f"Error creating main department: {e}")
            raise e
    
    @staticmethod
    def create_sub_department(department_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a sub-department"""
        try:
            company_id = department_data['company_id']
            parent_department_id = department_data.get('parent_department_id')
            
            if not parent_department_id:
                raise ValueError("Parent department is required for sub-departments")
            
            # Check if parent department exists
            parent_dept = db.execute_query_one(
                "SELECT department_id, is_global, branch_id FROM departments WHERE department_id = %s AND company_id = %s",
                (parent_department_id, company_id)
            )
            if not parent_dept:
                raise ValueError("Parent department not found")
            
            # If parent has a branch_id, use it if branch_id not specified
            branch_id = department_data.get('branch_id')
            if not branch_id and parent_dept.get('branch_id'):
                branch_id = parent_dept['branch_id']
            elif not branch_id:
                # Get first branch for the company
                first_branch = db.execute_query_one(
                    "SELECT branch_id FROM branches WHERE company_id = %s ORDER BY branch_id LIMIT 1",
                    (company_id,)
                )
                if first_branch:
                    branch_id = first_branch['branch_id']
                else:
                    raise ValueError("No branches found for this company. Please create a branch first.")
            
            # Create sub-department (is_global=False)
            insert_query = """
                INSERT INTO departments (company_id, branch_id, department_name, short_code, 
                                      description, status_id, is_global, parent_department_id, 
                                      created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            current_time = datetime.utcnow()
            
            department_id = db.execute_insert(insert_query, (
                company_id, branch_id, department_data['department_name'],
                department_data.get('short_code'),
                department_data.get('description'),
                department_data.get('status_id', 1),
                False,  # is_global = False for sub-departments
                parent_department_id,
                current_time, current_time
            ))
            
            return DepartmentService.get_department_by_id(department_id)
            
        except Exception as e:
            print(f"Error creating sub-department: {e}")
            raise e
    
    @staticmethod
    def get_department_by_id(department_id: int) -> Optional[Dict[str, Any]]:
        """Get department by ID"""
        try:
            query = """
                SELECT d.*, b.email as branch_email, b.phone_number as branch_phone
                FROM departments d
                LEFT JOIN branches b ON d.branch_id = b.branch_id
                WHERE d.department_id = %s
            """
            result = db.execute_query_one(query, (department_id,))
            
            if not result:
                return None
            
            return DepartmentService._format_department_response(result)
            
        except Exception as e:
            print(f"Error getting department by ID: {e}")
            return None
    
    @staticmethod
    def get_department_by_name_and_company(department_name: str, company_id: int, 
                                           branch_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Get department by name and company (and optionally branch)"""
        try:
            query = "SELECT * FROM departments WHERE department_name = %s AND company_id = %s"
            params = [department_name, company_id]
            
            if branch_id:
                query += " AND branch_id = %s"
                params.append(branch_id)
            
            return db.execute_query_one(query, tuple(params))
        except Exception as e:
            print(f"Error getting department by name and company: {e}")
            return None
    
    @staticmethod
    def get_all_departments(
        company_id: Optional[int] = None,
        branch_id: Optional[int] = None,
        is_main: Optional[bool] = None,
        active_only: bool = False
    ) -> List[Dict[str, Any]]:

        try:
            params = []
            where_clause = "WHERE 1=1"

            if company_id:
                where_clause += " AND d.company_id = %s"
                params.append(company_id)

            if branch_id:
                where_clause += " AND d.branch_id = %s"
                params.append(branch_id)

            if is_main is not None:
                where_clause += " AND d.is_global = %s"
                params.append(True if is_main else False)

            if active_only:
                where_clause += " AND d.status_id = 1"

            query = f"""
                SELECT 
                    d.*,
                    b.email AS branch_email,
                    b.phone_number AS branch_phone,
                    b.city,
                    b.state,
                    b.country
                FROM departments d
                LEFT JOIN branches b ON d.branch_id = b.branch_id
                {where_clause}
                ORDER BY d.created_at DESC
            """

            results = db.execute_query_all(query, tuple(params) if params else None)

            departments = []
            for row in results:
                departments.append(DepartmentService._format_department_response(row))

            return departments

        except Exception as e:
            print(f"Error getting all departments: {e}")
            return []

    
    @staticmethod
    def get_main_departments(company_id: int) -> List[Dict[str, Any]]:
        """Get unique main departments for a company"""
        try:
            query = """
                SELECT * FROM departments 
                WHERE is_global = %s AND company_id = %s
            """
            main_departments = db.execute_query_all(query, (True, company_id))
            
            # Get unique main departments by department_name
            unique_departments = {}
            for dept in main_departments:
                dept_name = dept.get('department_name')
                if dept_name and dept_name not in unique_departments:
                    unique_departments[dept_name] = {
                        'department_id': dept['department_id'],
                        'department_name': dept_name,
                        'company_id': dept['company_id'],
                        'is_global': True
                    }
            
            return list(unique_departments.values())
            
        except Exception as e:
            print(f"Error getting main departments: {e}")
            return []
    
    @staticmethod
    def update_department(department_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a department"""
        try:
            # Check if department exists
            if not DepartmentService.check_department_exists(department_id):
                raise ValueError(f"Department with ID {department_id} not found")
            
            # Check for duplicate name if updating
            if 'department_name' in update_data and update_data['department_name']:
                existing = DepartmentService.get_department_by_id(department_id)
                if existing:
                    company_id_to_check = update_data.get('company_id') or existing['company_id']
                    branch_id_to_check = update_data.get('branch_id') or existing.get('branch_id')
                    duplicate = DepartmentService.get_department_by_name_and_company(
                        update_data['department_name'],
                        company_id_to_check,
                        branch_id_to_check
                    )
                    if duplicate and duplicate['department_id'] != department_id:
                        raise ValueError(f"Department '{update_data['department_name']}' already exists")
            
            # Build update query
            set_clauses = []
            params = []
            
            dept_fields = ['company_id', 'branch_id', 'department_name', 'is_global', 
                          'parent_department_id', 'short_code', 'description', 'status_id']
            for field in dept_fields:
                if field in update_data and update_data[field] is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(update_data[field])
            
            if set_clauses:
                set_clauses.append("updated_at = %s")
                params.append(datetime.utcnow())
                params.append(department_id)
                
                query = f"UPDATE departments SET {', '.join(set_clauses)} WHERE department_id = %s"
                db.execute_update(query, tuple(params))
            
            return DepartmentService.get_department_by_id(department_id)
            
        except Exception as e:
            print(f"Error updating department: {e}")
            raise e
    
    @staticmethod
    def delete_department(department_id: int) -> bool:
        """Soft delete a department (set status_id to inactive)"""
        try:
            if not DepartmentService.check_department_exists(department_id):
                raise ValueError(f"Department with ID {department_id} not found")
            
            # Set status_id to 2 (Inactive) or 3 (Archived)
            query = "UPDATE departments SET status_id = %s, updated_at = %s WHERE department_id = %s"
            db.execute_update(query, (2, datetime.utcnow(), department_id))
            return True
            
        except Exception as e:
            print(f"Error deleting department: {e}")
            raise e
    
    @staticmethod
    def check_department_exists(department_id: int) -> bool:
        """Check if department exists"""
        try:
            query = "SELECT 1 FROM departments WHERE department_id = %s"
            result = db.execute_query_one(query, (department_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking department existence: {e}")
            return False
    
    @staticmethod
    def _format_department_response(row: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "department_id": row.get("department_id"),
            "company_id": row.get("company_id"),
            "branch_id": row.get("branch_id"),
            "department_name": row.get("department_name"),
            "is_global": row.get("is_global"),
            "parent_department_id": row.get("parent_department_id"),
            "short_code": row.get("short_code"),
            "description": row.get("description"),
            "status_id": row.get("status_id"),
            "status": row.get("status"),
            "created_at": row.get("created_at"),
            "updated_at": row.get("updated_at"),

            # ADD THESE FIELDS ↓↓↓
            "branch_email": row.get("branch_email"),
            "branch_phone": row.get("branch_phone"),
        }




