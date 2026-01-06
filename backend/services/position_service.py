from database import db
from typing import List, Optional, Dict, Any
 
class PositionService:
    @staticmethod
    def create_position(position_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new position"""
        try:
            # Check if position already exists
            existing_position = PositionService.get_position_by_name(position_data['position_name'])
           
            if existing_position:
                raise ValueError(f"Position '{position_data['position_name']}' already exists")
           
            # Insert new position
            query = """
                INSERT INTO positions
                (position_name, status_id)
                VALUES (%(position_name)s, %(status_id)s)
            """
           
            position_id = db.execute_insert(query, position_data)
           
            # Get the created position
            return PositionService.get_position_by_id(position_id)
           
        except Exception as e:
            print(f"Error creating position: {e}")
            raise e
 
    @staticmethod
    def get_position_by_id(position_id: int) -> Optional[Dict[str, Any]]:
        """Get position by ID"""
        try:
            query = """
                SELECT
                    position_id,
                    position_name,
                    status_id,
                    created_at,
                    updated_at
                FROM positions
                WHERE position_id = %s
            """
            row = db.execute_query_one(query, (position_id,))
            if not row:
                return None

            status_map = {1: 'Active', 2: 'Inactive', 3: 'Archived'}

            return {
                'position_id': row.get('position_id'),
                'position_name': row.get('position_name'),
                'status_id': row.get('status_id', 1),
                'status': status_map.get(row.get('status_id', 1)),
                'created_at': row.get('created_at').isoformat() if row.get('created_at') else None,
                'updated_at': row.get('updated_at').isoformat() if row.get('updated_at') else None,
            }
        except Exception as e:
            print(f"Error getting position by ID: {e}")
            return None
 
    @staticmethod
    def get_position_by_name(position_name: str) -> Optional[Dict[str, Any]]:
        """Get position by name"""
        try:
            query = """
                SELECT *
                FROM positions
                WHERE position_name = %s
            """
            return db.execute_query_one(query, (position_name,))
        except Exception as e:
            print(f"Error getting position by name: {e}")
            return None
 
    @staticmethod
    def get_all_positions(active_only: bool = False) -> List[Dict[str, Any]]:
        """Get all positions with optional filters"""
        try:
            where_clause = "WHERE status_id = %s" if active_only else ""
            params = (1,) if active_only else None  # Assuming status_id = 1 is active

            query = f"""
                SELECT
                    position_id,
                    position_name,
                    status_id,
                    created_at,
                    updated_at
                FROM positions
                {where_clause}
                ORDER BY position_name ASC
            """

            results = db.execute_query_all(query, params) if params is not None else db.execute_query_all(query)
            print(f"[PositionService] Retrieved {len(results) if results else 0} positions from database")

            if not results:
                return []

            status_map = {1: 'Active', 2: 'Inactive', 3: 'Archived'}
            positions = []
            for row in results:
                positions.append({
                    'position_id': row.get('position_id'),
                    'position_name': row.get('position_name'),
                    'status_id': row.get('status_id', 1),
                    'status': status_map.get(row.get('status_id', 1)),
                    'created_at': row.get('created_at').isoformat() if row.get('created_at') else None,
                    'updated_at': row.get('updated_at').isoformat() if row.get('updated_at') else None,
                })

            return positions
        except Exception as e:
            print(f"Error getting all positions: {e}")
            import traceback
            traceback.print_exc()
            return []
 
    @staticmethod
    def update_position(position_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a position"""
        try:
            # Check if position exists
            if not PositionService.check_position_exists(position_id):
                raise ValueError(f"Position with ID {position_id} not found")
           
            # Check for duplicate name if updating name
            if 'position_name' in update_data:
                existing_position = PositionService.get_position_by_name(update_data['position_name'])
                if existing_position and existing_position['position_id'] != position_id:
                    raise ValueError(f"Position '{update_data['position_name']}' already exists")
           
            # Build update query
            set_clauses = []
            params = []
           
            for field, value in update_data.items():
                if value is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)
           
            if not set_clauses:
                raise ValueError("No fields to update")
           
            params.append(position_id)
            query = f"UPDATE positions SET {', '.join(set_clauses)} WHERE position_id = %s"
           
            db.execute_update(query, params)
           
            # Get updated position
            return PositionService.get_position_by_id(position_id)
           
        except Exception as e:
            print(f"Error updating position: {e}")
            raise e
 
    @staticmethod
    def delete_position(position_id: int) -> bool:
        """Soft delete a position (archive: set status_id to 3)"""
        try:
            if not PositionService.check_position_exists(position_id):
                raise ValueError(f"Position with ID {position_id} not found")
           
            # Archive position: status_id = 3
            query = "UPDATE positions SET status_id = %s WHERE position_id = %s"
            db.execute_update(query, (3, position_id))
            return True
           
        except Exception as e:
            print(f"Error deleting position: {e}")
            raise e
 
    @staticmethod
    def hard_delete_position(position_id: int) -> bool:
        """Permanently delete a position"""
        try:
            if not PositionService.check_position_exists(position_id):
                raise ValueError(f"Position with ID {position_id} not found")
           
            query = "DELETE FROM positions WHERE position_id = %s"
            db.execute_update(query, (position_id,))
            return True
           
        except Exception as e:
            print(f"Error hard deleting position: {e}")
            raise e
 
    @staticmethod
    def check_position_exists(position_id: int) -> bool:
        """Check if position exists"""
        try:
            query = "SELECT 1 FROM positions WHERE position_id = %s"
            result = db.execute_query_one(query, (position_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking position existence: {e}")
            return False