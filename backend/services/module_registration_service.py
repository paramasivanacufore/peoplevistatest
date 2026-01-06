from database import db
from typing import Dict, Any, List, Optional
import json
from models.module_registration_models import (
    ModuleRegistrationRequest,
    RoleAssignmentInput,
    ScopeInput
)

class ModuleRegistrationService:
    @staticmethod
    def register_module(module_data: ModuleRegistrationRequest) -> Dict[str, Any]:
        """
        Register a new module and its permissions.
        NO role_permission insertion.
        NO scope insertion.
        Only modules + permissions.
        """
        try:
            # Check duplicate module_key
            existing = db.execute_query_one(
                "SELECT id FROM modules WHERE module_key = %s",
                (module_data.module_key,)
            )
            if existing:
                raise ValueError(f"Module key '{module_data.module_key}' already exists")

            with db.get_connection() as conn:
                original_autocommit = conn.autocommit
                conn.autocommit = False

                try:
                    with conn.cursor() as cursor:
                        # Insert module
                        cursor.execute("""
                            INSERT INTO modules (module_key, name, description, is_active)
                            VALUES (%s, %s, %s, 1)
                        """, (
                            module_data.module_key,
                            module_data.name,
                            module_data.description
                        ))
                        module_id = cursor.lastrowid

                        # Insert permissions
                        permission_ids = []
                        for perm in module_data.permissions:
                            cursor.execute("""
                                INSERT INTO permissions (module_id, permission_key, description)
                                VALUES (%s, %s, %s)
                            """, (
                                module_id,
                                perm.permission_key,
                                perm.description
                            ))
                            permission_ids.append(cursor.lastrowid)

                        conn.commit()

                    return {
                        "success": True,
                        "message": "Module and permissions registered successfully",
                        "data": {
                            "module_id": module_id,
                            "permissions_count": len(permission_ids)
                        }
                    }

                except Exception as e:
                    conn.rollback()
                    print("Transaction error:", e)
                    raise e

                finally:
                    conn.autocommit = original_autocommit

        except Exception as e:
            print("Error registering module:", e)
            raise Exception(f"Failed to register module: {str(e)}")



    def register_moduleold(module_data: ModuleRegistrationRequest) -> Dict[str, Any]:
        # """Register a new module with permissions, role assignments, and scopes"""
        try:
            # Check if module_key already exists
            existing_module = db.execute_query_one(
                "SELECT module_id FROM modules WHERE module_key = %s",
                (module_data.module_key,)
            )
            if existing_module:
                raise ValueError(f"Module with key '{module_data.module_key}' already exists")
            
            # Validate status_id exists in status table
            status_exists = db.execute_query_one(
                "SELECT status_id FROM status WHERE status_id = %s",
                (module_data.status_id,)
            )
            if not status_exists:
                raise ValueError(f"Invalid status_id: {module_data.status_id}. Status does not exist.")
            
            # Use connection context manager for transaction
            with db.get_connection() as conn:
                original_autocommit = None
                try:
                    # Disable autocommit for transaction
                    original_autocommit = conn.autocommit
                    conn.autocommit = False
                    
                    with conn.cursor() as cursor:
                        # 1. Insert module
                        cursor.execute(
                            """
                            INSERT INTO modules (module_key, name, description, status_id)
                            VALUES (%s, %s, %s, %s)
                            """,
                            (
                                module_data.module_key,
                                module_data.name,
                                module_data.description,
                                module_data.status_id
                            )
                        )
                        module_id = cursor.lastrowid
                        
                        # 2. Insert permissions and their role assignments and scopes
                        permission_ids = []
                        role_permission_ids = []
                        scope_ids = []
                        
                        for perm_data in module_data.permissions:
                            # Insert permission
                            # Convert permission_type list to JSON string for MySQL
                            permission_type_json = json.dumps(perm_data.permission.permission_type)
                            cursor.execute(
                                """
                                INSERT INTO permissions (module_id, permission_key, permission_type, description)
                                VALUES (%s, %s, %s, %s)
                                """,
                                (
                                    module_id,
                                    perm_data.permission.permission_key,
                                    permission_type_json,
                                    perm_data.permission.description
                                )
                            )
                            permission_id = cursor.lastrowid
                            permission_ids.append(permission_id)
                            
                            # Insert role assignments for this permission
                            for role_assignment in perm_data.role_assignments:
                                cursor.execute(
                                    """
                                    INSERT INTO role_permissions (role_id, permission_id, allowed, description)
                                    VALUES (%s, %s, %s, %s)
                                    """,
                                    (
                                        role_assignment.role_id,
                                        permission_id,
                                        1 if role_assignment.allowed else 0,
                                        role_assignment.description
                                    )
                                )
                                role_permission_id = cursor.lastrowid
                                role_permission_ids.append(role_permission_id)
                                
                                # Insert scopes for this role_permission
                                for scope in perm_data.scopes:
                                    cursor.execute(
                                        """
                                        INSERT INTO role_permission_scope 
                                        (role_permission_id, branch_id, department_id, emp_id, scope_type, description)
                                        VALUES (%s, %s, %s, %s, %s, %s)
                                        """,
                                        (
                                            role_permission_id,
                                            scope.branch_id,
                                            scope.department_id,
                                            scope.emp_id,
                                            scope.scope_type,
                                            scope.description
                                        )
                                    )
                                    scope_ids.append(cursor.lastrowid)
                        
                        # Commit transaction
                        conn.commit()
                    
                    # Get the created module with all details
                    created_module = ModuleRegistrationService.get_module_by_id(module_id)
                    
                    return {
                        "success": True,
                        "message": "Module registered successfully",
                        "data": {
                            "module": created_module,
                            "permissions_count": len(permission_ids),
                            "role_assignments_count": len(role_permission_ids),
                            "scopes_count": len(scope_ids)
                        }
                    }
                    
                except Exception as e:
                    # Rollback transaction on error
                    conn.rollback()
                    print(f"Error in module registration transaction: {e}")
                    raise e
                finally:
                    # Re-enable autocommit to original value
                    if original_autocommit is not None:
                        conn.autocommit = original_autocommit
                    else:
                        conn.autocommit = True
                    
        except ValueError as e:
            raise e
        except Exception as e:
            print(f"Error registering module: {e}")
            raise Exception(f"Failed to register module: {str(e)}")
    
    @staticmethod
    def get_module_by_id(module_id: int) -> Optional[Dict[str, Any]]:
        """Get module by ID with all related data"""
        try:
            module = db.execute_query_one(
                """
                SELECT m.*, s.status, s.status_name
                FROM modules m
                LEFT JOIN status s ON m.status_id = s.status_id
                WHERE m.module_id = %s
                """,
                (module_id,)
            )
            
            if not module:
                return None
            
            # Get permissions for this module
            permissions_raw = db.execute_query_all(
                """
                SELECT p.permission_id, p.permission_key, p.permission_type, p.description
                FROM permissions p
                WHERE p.module_id = %s
                """,
                (module_id,)
            )
            
            # Parse JSON permission_type from database
            permissions = []
            for perm in permissions_raw:
                perm_dict = dict(perm)
                # Parse JSON string to list if it's a string, otherwise keep as is
                if isinstance(perm_dict['permission_type'], str):
                    try:
                        perm_dict['permission_type'] = json.loads(perm_dict['permission_type'])
                    except (json.JSONDecodeError, TypeError):
                        # Fallback: if it's a single value, convert to list
                        perm_dict['permission_type'] = [perm_dict['permission_type']]
                elif isinstance(perm_dict['permission_type'], list):
                    # Already a list (some MySQL drivers return JSON as list)
                    pass
                else:
                    # Single value, convert to list
                    perm_dict['permission_type'] = [perm_dict['permission_type']] if perm_dict['permission_type'] else []
                permissions.append(perm_dict)
            
            # For each permission, get role assignments and scopes
            for perm in permissions:
                # Get role assignments
                role_assignments = db.execute_query_all(
                    """
                    SELECT rp.role_permission_id, rp.role_id, r.role_name, rp.allowed, rp.description
                    FROM role_permissions rp
                    JOIN roles r ON rp.role_id = r.role_id
                    WHERE rp.permission_id = %s
                    """,
                    (perm['permission_id'],)
                )
                perm['role_assignments'] = role_assignments
                
                # For each role assignment, get scopes
                for rp in role_assignments:
                    scopes = db.execute_query_all(
                        """
                        SELECT scope_id, branch_id, department_id, emp_id, scope_type, description
                        FROM role_permission_scope
                        WHERE role_permission_id = %s
                        """,
                        (rp['role_permission_id'],)
                    )
                    rp['scopes'] = scopes
            
            module['permissions'] = permissions
            return module
            
        except Exception as e:
            print(f"Error getting module by ID: {e}")
            return None
    
    @staticmethod
    def get_all_roles() -> List[Dict[str, Any]]:
        """Fetch all roles for the dropdown list."""
        try:
            print(f"[INFO] Fetching roles from database '{db.db_name}'...")

            query = """
                SELECT 
                    role_id,
                    role_name,
                    role_level,
                    description
                FROM roles
                ORDER BY 
                    role_level ASC,
                    role_name ASC
            """

            roles = db.execute_query_all(query)

            print(f"[INFO] Total roles fetched: {len(roles)}")

            if roles:
                print(f"[DEBUG] First role record: {roles[0]}")

            return roles

        except Exception as e:
            print(f"[ERROR] Failed to fetch roles: {e}")
            print(f"[ERROR] Active database: {db.db_name}")
            import traceback
            traceback.print_exc()
            return []

    
    @staticmethod
    def create_role(role_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new role"""
        try:
            # Check if role_name already exists
            existing_role = db.execute_query_one(
                "SELECT role_id FROM roles WHERE role_name = %s",
                (role_data['role_name'],)
            )
            if existing_role:
                raise ValueError(f"Role with name '{role_data['role_name']}' already exists")
            
            # Check if role_level already exists (optional validation - you might want unique levels)
            # For now, we allow multiple roles with same level
            
            # Insert new role
            role_id = db.execute_insert(
                """
                INSERT INTO roles (role_name, role_level, description)
                VALUES (%s, %s, %s)
                """,
                (
                    role_data['role_name'],
                    role_data['role_level'],
                    role_data.get('description')
                )
            )
            
            # Fetch the created role
            role = db.execute_query_one(
                """
                SELECT role_id, role_name, role_level, description
                FROM roles
                WHERE role_id = %s
                """,
                (role_id,)
            )
            
            return role
        except ValueError:
            raise
        except Exception as e:
            print(f"Error creating role: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to create role: {str(e)}")
    
    @staticmethod
    def update_role(role_id: int, role_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing role"""
        try:
            # Check if role exists
            existing_role = db.execute_query_one(
                "SELECT role_id FROM roles WHERE role_id = %s",
                (role_id,)
            )
            if not existing_role:
                raise ValueError(f"Role with ID {role_id} not found")
            
            # Check if role_name already exists (excluding current role)
            if 'role_name' in role_data:
                duplicate_role = db.execute_query_one(
                    "SELECT role_id FROM roles WHERE role_name = %s AND role_id != %s",
                    (role_data['role_name'], role_id)
                )
                if duplicate_role:
                    raise ValueError(f"Role with name '{role_data['role_name']}' already exists")
            
            # Build update query dynamically
            update_fields = []
            update_values = []
            
            if 'role_name' in role_data:
                update_fields.append("role_name = %s")
                update_values.append(role_data['role_name'])
            
            if 'role_level' in role_data:
                update_fields.append("role_level = %s")
                update_values.append(role_data['role_level'])
            
            if 'description' in role_data:
                update_fields.append("description = %s")
                update_values.append(role_data.get('description'))
            
            if not update_fields:
                raise ValueError("No fields to update")
            
            update_values.append(role_id)
            
            # Update role
            db.execute_update(
                f"""
                UPDATE roles
                SET {', '.join(update_fields)}
                WHERE role_id = %s
                """,
                tuple(update_values)
            )
            
            # Fetch the updated role
            role = db.execute_query_one(
                """
                SELECT role_id, role_name, role_level, description
                FROM roles
                WHERE role_id = %s
                """,
                (role_id,)
            )
            
            return role
        except ValueError:
            raise
        except Exception as e:
            print(f"Error updating role: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to update role: {str(e)}")
    
    @staticmethod
    def delete_role(role_id: int) -> bool:
        """Delete a role"""
        try:
            # Check if role exists
            existing_role = db.execute_query_one(
                "SELECT role_id FROM roles WHERE role_id = %s",
                (role_id,)
            )
            if not existing_role:
                raise ValueError(f"Role with ID {role_id} not found")
            
            # Check if role is being used in role_permissions
            role_permissions = db.execute_query_one(
                "SELECT COUNT(*) as count FROM role_permissions WHERE role_id = %s",
                (role_id,)
            )
            if role_permissions and role_permissions.get('count', 0) > 0:
                raise ValueError(f"Cannot delete role. It is assigned to {role_permissions['count']} permission(s). Please remove all role assignments first.")
            
            # Check if role is being used in department_roles
            department_roles = db.execute_query_one(
                "SELECT COUNT(*) as count FROM department_roles WHERE role_id = %s",
                (role_id,)
            )
            if department_roles and department_roles.get('count', 0) > 0:
                raise ValueError(f"Cannot delete role. It is assigned to {department_roles['count']} employee(s). Please remove all role assignments first.")
            
            # Delete role
            db.execute_update(
                "DELETE FROM roles WHERE role_id = %s",
                (role_id,)
            )
            
            return True
        except ValueError:
            raise
        except Exception as e:
            print(f"Error deleting role: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to delete role: {str(e)}")
    
    @staticmethod
    def get_role_by_id(role_id: int) -> Optional[Dict[str, Any]]:
        """Get a role by ID"""
        try:
            role = db.execute_query_one(
                """
                SELECT role_id, role_name, role_level, description
                FROM roles
                WHERE role_id = %s
                """,
                (role_id,)
            )
            return role
        except Exception as e:
            print(f"Error getting role by ID: {e}")
            return None
    
    @staticmethod
    def get_all_branches() -> List[Dict[str, Any]]:
        """Get all branches for scope selection"""
        try:
            branches = db.execute_query_all(
                """
                SELECT branch_id, branch_name, company_id
                FROM branches
                WHERE status_id = 1
                ORDER BY branch_name
                """
            )
            return branches
        except Exception as e:
            print(f"Error getting all branches: {e}")
            return []
    
    @staticmethod
    def get_all_departments() -> List[Dict[str, Any]]:
        """Get all departments for scope selection"""
        try:
            departments = db.execute_query_all(
                """
                SELECT department_id, department_name, company_id, branch_id
                FROM departments
                WHERE status_id = 1
                ORDER BY department_name
                """
            )
            return departments
        except Exception as e:
            print(f"Error getting all departments: {e}")
            return []
    
    @staticmethod
    def get_all_statuses() -> List[Dict[str, Any]]:
        """Get all status options for dropdown"""
        try:
            statuses = db.execute_query_all(
                """
                SELECT status_id, status_name
                FROM status
                ORDER BY status_id ASC
                """
            )
            return statuses
        except Exception as e:
            print(f"Error getting all statuses: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    @staticmethod
    def get_all_modules() -> List[Dict[str, Any]]:
        """Get all modules with permission counts"""
        try:
            modules = db.execute_query_all(
                """
                SELECT m.module_id, m.module_key, m.name, m.description, m.status_id, 
                       s.status, s.status_name, m.created_at, m.updated_at,
                       COUNT(DISTINCT p.permission_id) as permissions_count
                FROM modules m
                LEFT JOIN status s ON m.status_id = s.status_id
                LEFT JOIN permissions p ON m.module_id = p.module_id
                GROUP BY m.module_id, m.module_key, m.name, m.description, m.status_id, s.status, s.status_name, m.created_at, m.updated_at
                ORDER BY m.created_at DESC
                """
            )
            return modules
        except Exception as e:
            print(f"Error getting all modules: {e}")
            return []
    
    @staticmethod
    def update_module(module_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update module information"""
        try:
            # Check if module exists
            module = db.execute_query_one(
                "SELECT module_id FROM modules WHERE module_id = %s",
                (module_id,)
            )
            if not module:
                raise ValueError(f"Module with ID {module_id} not found")
            
            # Validate status_id if provided
            if 'status_id' in update_data and update_data['status_id'] is not None:
                status_exists = db.execute_query_one(
                    "SELECT status_id FROM status WHERE status_id = %s",
                    (update_data['status_id'],)
                )
                if not status_exists:
                    raise ValueError(f"Invalid status_id: {update_data['status_id']}. Status does not exist.")
            
            # Build update query
            set_clauses = []
            params = []
            
            if 'name' in update_data and update_data['name'] is not None:
                set_clauses.append("name = %s")
                params.append(update_data['name'])
            
            if 'description' in update_data:
                set_clauses.append("description = %s")
                params.append(update_data['description'])
            
            if 'status_id' in update_data and update_data['status_id'] is not None:
                set_clauses.append("status_id = %s")
                params.append(update_data['status_id'])
            
            if not set_clauses:
                raise ValueError("No fields to update")
            
            params.append(module_id)
            query = f"UPDATE modules SET {', '.join(set_clauses)} WHERE module_id = %s"
            
            db.execute_update(query, tuple(params))
            
            # Get updated module
            return ModuleRegistrationService.get_module_by_id(module_id)
            
        except ValueError as e:
            raise e
        except Exception as e:
            print(f"Error updating module: {e}")
            raise Exception(f"Failed to update module: {str(e)}")
    
    @staticmethod
    def delete_module(module_id: int) -> bool:
        """Delete a module and all related data"""
        try:
            # Check if module exists
            module = db.execute_query_one(
                "SELECT module_id FROM modules WHERE module_id = %s",
                (module_id,)
            )
            if not module:
                raise ValueError(f"Module with ID {module_id} not found")
            
            # Use transaction to delete all related data
            with db.get_connection() as conn:
                original_autocommit = None
                try:
                    original_autocommit = conn.autocommit
                    conn.autocommit = False
                    
                    with conn.cursor() as cursor:
                        # Get all permissions for this module
                        cursor.execute(
                            "SELECT permission_id FROM permissions WHERE module_id = %s",
                            (module_id,)
                        )
                        permission_ids = [row['permission_id'] for row in cursor.fetchall()]
                        
                        if permission_ids:
                            # Get all role_permission_ids for these permissions
                            placeholders = ','.join(['%s'] * len(permission_ids))
                            cursor.execute(
                                f"SELECT role_permission_id FROM role_permissions WHERE permission_id IN ({placeholders})",
                                permission_ids
                            )
                            role_permission_ids = [row['role_permission_id'] for row in cursor.fetchall()]
                            
                            if role_permission_ids:
                                # Delete scopes
                                scope_placeholders = ','.join(['%s'] * len(role_permission_ids))
                                cursor.execute(
                                    f"DELETE FROM role_permission_scope WHERE role_permission_id IN ({scope_placeholders})",
                                    role_permission_ids
                                )
                                
                                # Delete role permissions
                                cursor.execute(
                                    f"DELETE FROM role_permissions WHERE role_permission_id IN ({scope_placeholders})",
                                    role_permission_ids
                                )
                            
                            # Delete permissions
                            cursor.execute(
                                f"DELETE FROM permissions WHERE permission_id IN ({placeholders})",
                                permission_ids
                            )
                        
                        # Delete module
                        cursor.execute("DELETE FROM modules WHERE module_id = %s", (module_id,))
                        
                        conn.commit()
                        return True
                    
                except Exception as e:
                    conn.rollback()
                    print(f"Error in delete module transaction: {e}")
                    raise e
                finally:
                    if original_autocommit is not None:
                        conn.autocommit = original_autocommit
                    else:
                        conn.autocommit = True
                        
        except ValueError as e:
            raise e
        except Exception as e:
            print(f"Error deleting module: {e}")
            raise Exception(f"Failed to delete module: {str(e)}")

