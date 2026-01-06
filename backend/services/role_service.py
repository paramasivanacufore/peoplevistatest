from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime

class RoleService:
    @staticmethod
    def create_role(role_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new role"""
        try:
            # Check if role already exists by name
            existing = RoleService.get_role_by_name(role_data['role_name'])
            if existing:
                raise ValueError(
                    f"Role '{role_data['role_name']}' already exists"
                )

            # Check if role_level already exists (UNIQUE constraint)
            existing = RoleService.get_role_by_level(role_data['role_level'])
            if existing:
                raise ValueError(
                    f"Role level '{role_data['role_level']}' already exists"
                )

            role_insert = {
                'role_name': role_data['role_name'],
                'role_level': role_data['role_level'],
                'description': role_data.get('description'),
                'status_id': role_data.get('status_id', 1),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }

            query = """
                INSERT INTO roles 
                (role_name, role_level, description, status_id, created_at, updated_at)
                VALUES (%(role_name)s, %(role_level)s, %(description)s, %(status_id)s, %(created_at)s, %(updated_at)s)
            """

            role_id = db.execute_insert(query, role_insert)

            return RoleService.get_role_by_id(role_id)

        except Exception as e:
            print(f"Error creating role: {e}")
            raise

    @staticmethod
    def get_role_by_id(role_id: int) -> Optional[Dict[str, Any]]:
        """Get role by ID"""
        try:
            query = """
                SELECT 
                    role_id,
                    role_name,
                    role_level,
                    description,
                    status_id,
                    created_at,
                    updated_at
                FROM roles
                WHERE role_id = %s
            """
            row = db.execute_query_one(query, (role_id,))
            if not row:
                return None

            status_map = {1: 'Active', 2: 'Inactive', 3: 'Archived'}

            return {
                'role_id': row['role_id'],
                'role_name': row['role_name'],
                'role_level': row['role_level'],
                'description': row.get('description'),
                'status_id': row.get('status_id', 1),
                'status': status_map.get(row.get('status_id', 1)),
                'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
                'updated_at': row['updated_at'].isoformat() if row.get('updated_at') else None
            }
        except Exception as e:
            print(f"Error getting role by ID: {e}")
            return None

    @staticmethod
    def get_role_by_name(role_name: str) -> Optional[Dict[str, Any]]:
        """Get role by name"""
        try:
            query = """
                SELECT * FROM roles 
                WHERE role_name = %s
            """
            return db.execute_query_one(query, (role_name,))
        except Exception as e:
            print(f"Error getting role by name: {e}")
            return None

    @staticmethod
    def get_role_by_level(role_level: int) -> Optional[Dict[str, Any]]:
        """Get role by level"""
        try:
            query = """
                SELECT * FROM roles 
                WHERE role_level = %s
            """
            return db.execute_query_one(query, (role_level,))
        except Exception as e:
            print(f"Error getting role by level: {e}")
            return None

    @staticmethod
    def get_all_roles(status_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all roles with optional status filter"""
        try:
            if status_id is not None:
                query = """
                    SELECT 
                        role_id,
                        role_name,
                        role_level,
                        description,
                        status_id,
                        created_at,
                        updated_at
                    FROM roles
                    WHERE status_id = %s
                    ORDER BY role_level ASC
                """
                print(f"Executing query with status_id={status_id}")
                results = db.execute_query_all(query, (status_id,))
            else:
                query = """
                    SELECT 
                        role_id,
                        role_name,
                        role_level,
                        description,
                        status_id,
                        created_at,
                        updated_at
                    FROM roles
                    ORDER BY role_level ASC
                """
                print(f"Executing query without filter")
                results = db.execute_query_all(query)

            print(f"Query results: {results}")
            print(f"Results type: {type(results)}")
            
            if results is None:
                print("Results is None, returning empty list")
                return []

            status_map = {1: 'Active', 2: 'Inactive', 3: 'Archived'}
            roles = []

            for row in results:
                print(f"Processing row: {row}")
                roles.append({
                    "role_id": row["role_id"],
                    "role_name": row["role_name"],
                    "role_level": row["role_level"],
                    "description": row.get("description"),
                    "status_id": row.get("status_id", 1),
                    "status": status_map.get(row.get("status_id", 1)),
                    "created_at": row.get("created_at"),
                    "updated_at": row.get("updated_at"),
                })

            print(f"Final roles list: {roles}")
            return roles

        except Exception as e:
            print(f"Error getting all roles: {e}")
            import traceback
            traceback.print_exc()
            return []

    @staticmethod
    def update_role(role_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update role"""
        try:
            if not RoleService.check_role_exists(role_id):
                raise ValueError(f"Role with ID {role_id} not found")

            # Duplicate name check
            if update_data.get('role_name'):
                existing = RoleService.get_role_by_name(update_data['role_name'])
                if existing and existing['role_id'] != role_id:
                    raise ValueError(
                        f"Role '{update_data['role_name']}' already exists"
                    )

            # Duplicate role_level check
            if update_data.get('role_level'):
                existing = RoleService.get_role_by_level(update_data['role_level'])
                if existing and existing['role_id'] != role_id:
                    raise ValueError(
                        f"Role level '{update_data['role_level']}' already exists"
                    )

            set_clauses = []
            params = []

            # Normal scalar fields
            scalar_fields = [
                'role_name', 'role_level', 'description', 'status_id'
            ]

            for field in scalar_fields:
                if field in update_data and update_data[field] is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(update_data[field])

            if not set_clauses:
                return RoleService.get_role_by_id(role_id)

            params.append(role_id)

            query = f"""
                UPDATE roles
                SET {', '.join(set_clauses)}
                WHERE role_id = %s
            """
            db.execute_update(query, tuple(params))

            return RoleService.get_role_by_id(role_id)

        except Exception as e:
            print(f"Error updating role: {e}")
            raise

    @staticmethod
    def delete_role(role_id: int) -> bool:
        """Soft delete a role (archive: set status_id to 3)"""
        try:
            if not RoleService.check_role_exists(role_id):
                raise ValueError(f"Role with ID {role_id} not found")
            
            # Archive role: status_id = 3
            query = "UPDATE roles SET status_id = %s WHERE role_id = %s"
            db.execute_update(query, (3, role_id))
            return True
            
        except Exception as e:
            print(f"Error deleting role: {e}")
            raise e

    @staticmethod
    def check_role_exists(role_id: int) -> bool:
        """Check if role exists"""
        try:
            query = "SELECT 1 FROM roles WHERE role_id = %s"
            result = db.execute_query_one(query, (role_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking role existence: {e}")
            return False
