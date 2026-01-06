from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime
from services.auth_service import AuthService
from passlib.hash import bcrypt
from services.auth_service import AuthService


def convert_iso_to_date(date_str: str) -> Optional[str]:
    """Convert ISO datetime string (from frontend) to MySQL DATE format"""
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00")).strftime("%Y-%m-%d")
    except Exception as e:
        print("Date convert error:", e, date_str)
        return None


class EmployeeService:
    @staticmethod
    def create_employee(employee_data: dict) -> dict:
        try:
            # Convert dates
            dob = convert_iso_to_date(employee_data.get("dob"))
            hire_date = convert_iso_to_date(employee_data.get("hire_date"))

            query = """
                INSERT INTO emp_employee
                (company_id, branch_id, department_id, first_name, last_name, gender,
                dob, email, phone_number, position_id, reports_to,
                employment_type, hire_date, address, status_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """

            params = (
                employee_data["company_id"],
                employee_data.get("branch_id"),
                employee_data.get("department_id"),
                employee_data["first_name"].strip(),
                employee_data["last_name"].strip(),
                employee_data.get("gender"),
                dob,
                employee_data.get("email"),
                employee_data.get("phone_number"),
                employee_data.get("position_id"),
                employee_data.get("reports_to"),
                employee_data.get("employment_type"),
                hire_date,
                employee_data.get("address"),
                1,
            )

            # INSERT employee
            new_id = db.execute_insert(query, params)

            if not new_id:
                raise Exception("Employee insert failed, no ID returned")

            employee_id = new_id

            # Create user account (if username & password exists)
            username = employee_data.get("username")
            password = employee_data.get("password")

            if username and password:
                password_hash = AuthService.get_password_hash(password)

                user_query = """
                    INSERT INTO ac_users (employee_id, username, password_hash, email, status)
                    VALUES (%s, %s, %s, %s, %s)
                """

                db.execute_query_one(
                    user_query,
                    (employee_id, username, password_hash, employee_data.get("email"), "Active")
                )

            # Return newly created record
            return db.execute_query_one(
                "SELECT * FROM emp_employee WHERE employee_id=%s", (employee_id,)
            )

        except Exception as e:
            print("Error creating employee:", e)
            return None
            
    @staticmethod
    def check_employee_exists(employee_id: int) -> bool:
        query = "SELECT 1 FROM emp_employee WHERE employee_id = %s"
        result = db.execute_query_one(query, (employee_id,))
        return result is not None

    @staticmethod
    def update_employee(employee_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        if not EmployeeService.check_employee_exists(employee_id):
            raise ValueError(f"Employee with ID {employee_id} not found")

        # Extract account fields separately
        new_username = update_data.pop("username", None)
        new_password = update_data.pop("password", None)

        # Convert number fields
        numeric_fields = ['company_id', 'branch_id', 'department_id', 'position_id', 'reports_to', 'status_id']
        for field in numeric_fields:
            if field in update_data and update_data[field] is not None:
                update_data[field] = int(update_data[field])

        # ----------------------------
        # UPDATE emp_employee TABLE
        # ----------------------------
        set_clauses = []
        params = []

        for field, value in update_data.items():
            set_clauses.append(f"{field} = %s")
            params.append(value)

        if set_clauses:
            set_clauses.append("updated_at = %s")
            params.append(datetime.utcnow())
            params.append(employee_id)

            query = f"UPDATE emp_employee SET {', '.join(set_clauses)} WHERE employee_id = %s"
            print("DEBUG: EMP UPDATE QUERY:", query)
            db.execute_update(query, tuple(params))

        # ----------------------------
        # UPDATE ac_users TABLE
        # ----------------------------
        if new_username or new_password:

            # Check user exists
            user_row = db.execute_query_one(
                "SELECT user_id FROM ac_users WHERE employee_id=%s",
                (employee_id,)
            )

            if user_row:
                # UPDATE existing ac_user
                update_parts = []
                update_params = []

                if new_username:
                    update_parts.append("username = %s")
                    update_params.append(new_username)

                if new_password:
                    hashed_pwd = AuthService.get_password_hash(new_password)
                    update_parts.append("password_hash = %s")
                    update_params.append(hashed_pwd)

                update_params.append(employee_id)

                user_update_query = f"""
                    UPDATE ac_users SET {', '.join(update_parts)}
                    WHERE employee_id = %s
                """

                print("DEBUG: USER UPDATE QUERY:", user_update_query)
                db.execute_update(user_update_query, tuple(update_params))

            else:
                # CREATE NEW ac_user
                if new_username and new_password:
                    hashed_pwd = AuthService.get_password_hash(new_password)

                    insert_query = """
                        INSERT INTO ac_users (employee_id, username, password_hash, email, status)
                        VALUES (%s, %s, %s, (SELECT email FROM emp_employee WHERE employee_id=%s), 'Active')
                    """

                    db.execute_query_one(
                        insert_query,
                        (employee_id, new_username, hashed_pwd, employee_id)
                    )

        # Return updated employee details
        return EmployeeService.get_employee_by_id(employee_id)





    @staticmethod
    def create_employee_with_roles(employee_data: dict, department_roles: list, create_user_payload: dict | None) -> dict:
        """
        Transactionally:
          - (optional) create ac_users row and capture user_id
          - insert emp_employees row, returning employee_id
          - for each item in department_roles create a row in department_roles:
              { employee_id, department_id, role_id, position_id, reports_to, created_at, ... }
          - return the assembled employee object (including linked department_roles if you like)
        """

    @staticmethod
    def get_all_employees():
        try:
            query = """
                SELECT 
                    e.*, 
                    s.status_name,
                    p.position_name
                FROM emp_employee e
                LEFT JOIN status s ON e.status_id = s.status_id
                LEFT JOIN positions p ON e.position_id = p.position_id
                ORDER BY e.employee_id DESC
            """
            rows = db.execute_query_all(query)
            return rows or []

        except Exception as e:
            print("Error in get_all_employees:", str(e))
            return []


    @staticmethod
    def get_employees_by_company_branch(company_id: int, branch_id: int) -> List[Dict]:
        print(f"➡️ /employees/by-company-branch endpoint hit")
        print(f"company_id: {company_id} branch_id: {branch_id}")

        try:
            query = """
                SELECT * 
                FROM emp_employee
                WHERE company_id = %s AND branch_id = %s
            """
            rows = db.execute_query_all(query, (company_id, branch_id))

            print(f"SERVICE => company: {company_id} branch: {branch_id}")
            print(f"Retrieved {len(rows)} rows")
            for row in rows:
                print(f"ROW: {row}")

            return rows

        except Exception as e:
            print(f"❌ Error fetching employees by company & branch: {e}")
            raise

    @staticmethod
    def archive_employee(employee_id: int):
        """
        Sets status_id = 3 (archived) for the given employee_id.
        """
        employee_id = int(employee_id)
        query = """
            UPDATE emp_employee
            SET status_id = 3
            WHERE employee_id = %s AND status_id != 3
        """
        rows_affected = db.execute_update(query, (employee_id,))

        if rows_affected == 0:
            raise ValueError(f"Employee with ID {employee_id} not found or already archived")

        return {"success": True, "message": f"Employee {employee_id} archived successfully"}

    @staticmethod
    def reinstate_employee(employee_id: int):
        """
        Sets status_id = 1 (Active) for a previously archived employee.
        """
        employee_id = int(employee_id)
        query = """
            UPDATE emp_employee
            SET status_id = 1
            WHERE employee_id = %s AND status_id = 3
        """
        rows_affected = db.execute_update(query, (employee_id,))

        if rows_affected == 0:
            raise ValueError(f"Employee with ID {employee_id} not found or not archived")

        return {"success": True, "message": f"Employee {employee_id} reinstated successfully"}


    @staticmethod
    def get_employee_by_id(employee_id: int) -> dict | None:
        """Fetch a single employee including username + hashed password"""

        try:
            query = """
                SELECT
                    e.employee_id,
                    e.company_id,
                    e.branch_id,
                    e.department_id,
                    e.reports_to,
                    e.position_id,
                    e.first_name,
                    e.last_name,
                    e.gender,
                    e.dob,
                    e.email,
                    e.phone_number,
                    e.address,
                    e.hire_date,
                    e.employment_type,
                    e.status_id,
                    e.created_at,
                    e.updated_at,
                    s.status_name,
                    u.username,
                    u.password_hash
                FROM emp_employee e
                LEFT JOIN status s ON e.status_id = s.status_id
                LEFT JOIN ac_users u ON u.employee_id = e.employee_id
                WHERE e.employee_id = %s
                LIMIT 1
            """

            row = db.execute_query_one(query, (employee_id,))

            if not row:
                return None

            # Return merged dict
            return {
                **row,
                "username": row.get("username"),
                "password": row.get("password_hash"),   # return hashed password
            }

        except Exception as e:
            print(f"❌ Error fetching employee by ID {employee_id}: {e}")
            return None




    @staticmethod
    def update_employee_with_roles(employee_id: int, update_data: dict, department_roles: list | None, update_user_payload: dict | None) -> dict:
        """
        - Update emp_employees fields from update_data
        - If department_roles is provided, replace or upsert department_roles for this employee (your chosen policy)
        - If update_user_payload provided, update linked ac_users as needed
        - Return updated employee dict
        """

    @staticmethod
    def delete_employee(employee_id: int):
        """Soft delete (e.g. set status to Archived), raise ValueError if not found"""



    @staticmethod
    def save_tab_data(tab_id: str, tab_data: dict, emp_id: Optional[int]):
        """Save partial tab data — used by UI progressive save"""


