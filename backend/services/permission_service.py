from database import db
from typing import Dict, Any

class PermissionService:

    @staticmethod
    def get_user_permissions(employee_id: int):
        try:
            # 1️⃣ Get role_level for employee
            dept_roles = db.execute_query_all(
                """
                SELECT role_level 
                FROM department_roles
                WHERE employee_id = %s
                """,
                (employee_id,)
            )

            if not dept_roles:
                return {}, []

            role_levels = [row["role_level"] for row in dept_roles]

            # 2️⃣ Get role_id from roles using role_level
            role_rows = db.execute_query_all(
                """
                SELECT role_id
                FROM roles
                WHERE role_level IN ({})
                """.format(",".join(["%s"] * len(role_levels))),
                role_levels
            )

            if not role_rows:
                return {}, []

            role_ids = [r["role_id"] for r in role_rows]

            # 3️⃣ Get permissions for these role_ids
            permissions = db.execute_query_all(
                """
                SELECT 
                    rp.role_id,
                    p.id AS permission_id,
                    p.permission_key,
                    p.description AS permission_description,
                    m.id AS module_id,
                    m.module_key,
                    m.name AS module_name,
                    m.description AS module_description,
                    rp.allowed
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.id
                JOIN modules m ON p.module_id = m.id
                WHERE rp.role_id IN ({})
                """.format(",".join(["%s"] * len(role_ids))),
                role_ids
            )

            # 4️⃣ Group by modules
            grouped = {}
            for perm in permissions:
                key = perm["module_key"]
                if key not in grouped:
                    grouped[key] = {
                        "module_name": perm["module_name"],
                        "permissions": {}
                    }

                grouped[key]["permissions"][perm["permission_key"]] = {
                    "allowed": perm["allowed"],
                    "description": perm["permission_description"]
                }

            return grouped, role_levels

        except Exception as e:
            print("Error in get_user_permissions:", e)
            return {}, []


        # ----------------------------------------------------------------------
        @staticmethod
        def has_permission_key(employee_id: int, module_key: str, permission_key: str, access_type: str = "view") -> bool:
            """Check if a specific permission key exists."""
            try:
                permissions = PermissionService.get_user_permissions(employee_id)

                if permissions["role_level"] <= 2:
                    return True

                mod = permissions["modules"].get(module_key)
                if not mod:
                    return False

                perm = mod["permissions"].get(permission_key)
                if not perm:
                    return False

                if access_type == "view" and perm["can_view"]:
                    return True
                if access_type == "edit" and perm["can_edit"]:
                    return True
                if access_type == "delete" and perm["can_delete"]:
                    return True

                return False

            except:
                return False

    # ----------------------------------------------------------------------
    @staticmethod
    def get_user_role_info(employee_id: int) -> Dict[str, Any]:
        """Return basic info for profile header."""
        try:
            row = db.execute_query_one(
                """
                SELECT 
                    e.first_name,
                    e.last_name,
                    e.email,
                    MIN(dr.role_level) AS role_level,
                    d.department_name
                FROM emp_employee e
                JOIN department_roles dr ON dr.employee_id = e.employee_id
                JOIN departments d ON d.department_id = dr.department_id
                WHERE e.employee_id = %s
                GROUP BY e.employee_id, d.department_name
                ORDER BY role_level ASC
                LIMIT 1
                """,
                (employee_id,)
            )

            if not row:
                return {
                    "role_level": 5,
                    "department": "Unknown",
                    "name": "Unknown User",
                    "email": ""
                }

            return {
                "role_level": row["role_level"],
                "department": row["department_name"],
                "name": f"{row['first_name']} {row['last_name']}",
                "email": row["email"]
            }

        except Exception:
            return {
                "role_level": 5,
                "department": "Unknown",
                "name": "Unknown User",
                "email": ""
            }
