from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime

class BranchService:
    @staticmethod
    def get_branch_by_id(branch_id: int) -> Optional[Dict[str, Any]]:
        """Get branch by ID with stored address, company info, status name, is_global, and name"""
        try:
            query = """
                SELECT 
                    b.branch_id,
                    b.company_id,
                    b.branch_name,
                    b.email,
                    b.phone_number,
                    b.status_id,
                    s.status_name,
                    b.created_at,
                    b.updated_at,
                    c.company_name,
                    b.address,
                    b.city,
                    b.state,
                    b.country,
                    b.is_global,
                    b.parent_branch_id
                FROM branches b
                LEFT JOIN companies c ON b.company_id = c.company_id
                LEFT JOIN status s ON b.status_id = s.status_id
                WHERE b.branch_id = %s
            """
            row = db.execute_query_one(query, (branch_id,))
            print("DB row:", row)

            if not row:
                return None

            return {
                "branch_id": row["branch_id"],
                "company_id": row["company_id"],
                "branch_name": row["branch_name"],
                "name": row["branch_name"],         # for Pydantic model
                "email": row.get("email"),
                "phone_number": row.get("phone_number"),
                "status_id": row.get("status_id"),
                "status": row.get("status_name"),
                "company_name": row.get("company_name"),
                "created_at": row.get("created_at").isoformat() if row.get("created_at") else None,
                "updated_at": row.get("updated_at").isoformat() if row.get("updated_at") else None,
                "address": row.get("address"),
                "city": row.get("city"),
                "state": row.get("state"),
                "country": row.get("country"),
                "is_global": row.get("is_global", False),  # default to False if null
                "parent_branch_id": row.get("parent_branch_id")
            }

        except Exception as e:
            print(f"Error getting branch by ID: {e}")
            return None


    @staticmethod
    def get_all_branches(active_only: bool = False, status_id: Optional[int] = None,
                        company_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all branches with optional filters (includes parent + global fields)"""
        try:
            params = []
            where_clause = "WHERE 1=1"

            # Filter by status
            if status_id is not None:
                where_clause += " AND b.status_id = %s"
                params.append(status_id)
            elif active_only:
                where_clause += " AND b.status_id = 1"

            # Filter by company
            if company_id is not None:
                where_clause += " AND b.company_id = %s"
                params.append(company_id)

            # Updated query including parent_branch_id, is_global
            query = f"""
                SELECT 
                    b.branch_id,
                    b.company_id,
                    c.company_name,
                    b.branch_name,
                    pb.branch_name AS parent_branch_name,
                    b.parent_branch_id,
                    b.is_global,
                    b.address,
                    b.city,
                    b.state,
                    b.country,
                    b.phone_number,
                    b.email,
                    b.status_id,
                    s.status_name,
                    b.created_at,
                    b.updated_at
                FROM branches b
                LEFT JOIN companies c ON b.company_id = c.company_id
                LEFT JOIN status s ON b.status_id = s.status_id
                LEFT JOIN branches pb ON b.parent_branch_id = pb.branch_id   -- HERE
                {where_clause}
                ORDER BY b.created_at DESC
            """

            rows = db.execute_query_all(query, tuple(params) if params else None)
            print("DEBUG FIRST ROW:", rows[0] if rows else None)

            branches = []
            for row in rows:
                branches.append({
                    "branch_id": row["branch_id"],
                    "company_id": row["company_id"],
                    "company_name": row.get("company_name"),
                    "branch_name": row["branch_name"],
                    "name": row["branch_name"],  # alias for frontend
                    "parent_branch_id": row.get("parent_branch_id"),
                    "parent_branch_name": row.get("parent_branch_name"),
                    "is_global": row.get("is_global"),
                    "address": row.get("address"),
                    "city": row.get("city"),
                    "state": row.get("state"),
                    "country": row.get("country"),
                    "phone_number": row.get("phone_number"),
                    "email": row.get("email"),
                    "status_id": row.get("status_id"),
                    "status": row.get("status_name"),
                    "created_at": row.get("created_at").isoformat() if row.get("created_at") else None,
                    "updated_at": row.get("updated_at").isoformat() if row.get("updated_at") else None
                })

            return branches

        except Exception as e:
            print(f"Error getting all branches: {e}")
            return []


    @staticmethod
    def get_branch_by_name_and_company(branch_name: str, company_id: int) -> Optional[Dict[str, Any]]:
        try:
            query = "SELECT * FROM branches WHERE branch_name = %s AND company_id = %s"
            return db.execute_query_one(query, (branch_name, company_id))
        except Exception as e:
            print(f"Error getting branch by name and company: {e}")
            return None

    @staticmethod
    def check_branch_exists(branch_id: int) -> bool:
        try:
            query = "SELECT 1 FROM branches WHERE branch_id = %s"
            return db.execute_query_one(query, (branch_id,)) is not None
        except Exception as e:
            print(f"Error checking branch existence: {e}")
            return False

    @staticmethod
    def create_branch(branch_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new branch"""
        try:
            # Check company exists
            company = db.execute_query_one(
                "SELECT company_id FROM companies WHERE company_id = %s",
                (branch_data['company_id'],)
            )
            if not company:
                raise ValueError(f"Company with ID {branch_data['company_id']} not found")

            # Check duplicate branch for same company
            if BranchService.get_branch_by_name_and_company(branch_data['branch_name'], branch_data['company_id']):
                raise ValueError(f"Branch '{branch_data['branch_name']}' already exists for this company")

            current_time = datetime.utcnow()
            branch_insert = {
                'company_id': branch_data['company_id'],
                'branch_name': branch_data['branch_name'],
                'phone_number': branch_data.get('phone_number'),
                'email': branch_data.get('email'),
                'status_id': branch_data.get('status_id', 1),
                'created_at': current_time,
                'updated_at': current_time,
                'address': branch_data.get('address', ''),
                'city': branch_data.get('city', ''),
                'state': branch_data.get('state', ''),
                'country': branch_data.get('country', ''),
                'is_global': branch_data.get('is_global', False),
                'parent_branch_id': branch_data.get('parent_branch_id')  # can be None
            }

            query = """
                INSERT INTO branches 
                (company_id, branch_name, phone_number, email, status_id, created_at, updated_at,
                address, city, state, country, is_global, parent_branch_id)
                VALUES (%(company_id)s, %(branch_name)s, %(phone_number)s, %(email)s, 
                        %(status_id)s, %(created_at)s, %(updated_at)s,
                        %(address)s, %(city)s, %(state)s, %(country)s, %(is_global)s, %(parent_branch_id)s)
            """
            branch_id = db.execute_insert(query, branch_insert)
            return BranchService.get_branch_by_id(branch_id)

        except Exception as e:
            print(f"Error creating branch: {e}")
            raise e


    @staticmethod
    def update_branch(branch_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if not BranchService.check_branch_exists(branch_id):
                raise ValueError(f"Branch with ID {branch_id} not found")

            is_global = update_data.get("is_global")

            set_clauses = []
            params = []

            # Normal updatable fields
            normal_fields = [
                "company_id",
                "branch_name",
                "email",
                "phone_number",
                "status_id",
                "address",
                "city",
                "state",
                "country",
                "is_global",
            ]

            for field in normal_fields:
                if field in update_data:
                    set_clauses.append(f"{field} = %s")
                    params.append(update_data[field])

            # 🔐 BUSINESS RULE (FORCE NULL)
            if is_global == 1:
                set_clauses.append("parent_branch_id = %s")
                params.append(None)
            elif "parent_branch_id" in update_data:
                set_clauses.append("parent_branch_id = %s")
                params.append(update_data["parent_branch_id"])

            set_clauses.append("updated_at = %s")
            params.append(datetime.utcnow())
            params.append(branch_id)

            query = f"""
                UPDATE branches
                SET {', '.join(set_clauses)}
                WHERE branch_id = %s
            """

            db.execute_update(query, tuple(params))

            return BranchService.get_branch_by_id(branch_id)

        except Exception as e:
            print(f"Error updating branch: {e}")
            raise




    @staticmethod
    def delete_branch(branch_id: int) -> bool:
        """Soft delete branch"""
        try:
            if not BranchService.check_branch_exists(branch_id):
                raise ValueError(f"Branch with ID {branch_id} not found")
            query = "UPDATE branches SET status_id = %s, updated_at = %s WHERE branch_id = %s"
            db.execute_update(query, (3, datetime.utcnow(), branch_id))
            return True
        except Exception as e:
            print(f"Error deleting branch: {e}")
            raise e

    @staticmethod
    def reinstate_branch(branch_id: int) -> bool:
        """Reinstate a branch"""
        try:
            if not BranchService.check_branch_exists(branch_id):
                raise ValueError(f"Branch with ID {branch_id} not found")
            query = "UPDATE branches SET status_id = %s, updated_at = %s WHERE branch_id = %s"
            db.execute_update(query, (1, datetime.utcnow(), branch_id))
            return True
        except Exception as e:
            print(f"Error reinstating branch: {e}")
            raise e

    @staticmethod
    def get_branches_by_company(company_id: int):
        """Return ALL branches for a company (global + sub)"""

        query = """
            SELECT 
                b.branch_id,
                b.company_id,
                b.branch_name,
                b.parent_branch_id,
                b.address,
                b.city,
                b.state,
                b.country,
                b.email,
                b.phone_number,
                b.status_id,
                s.status_name AS status,
                c.company_name,
                b.is_global,
                b.created_at,
                b.updated_at
            FROM branches b
            LEFT JOIN companies c ON b.company_id = c.company_id
            LEFT JOIN status s ON b.status_id = s.status_id
            WHERE b.company_id = %s
            ORDER BY b.is_global DESC, b.branch_name
        """

        rows = db.execute_query_all(query, (company_id,))

        for row in rows:
            row["children"] = []
            row["name"] = row["branch_name"]

        return rows
