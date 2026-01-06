from database import db
from typing import Dict, Any, List, Optional

class BiometricDeviceService:
    @staticmethod
    def create_device(device_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new biometric device"""
        try:
            # Use status_id directly from device_data (default to 1 if not provided)
            status_id = device_data.get('status_id', 1)
            query = """
                INSERT INTO att_devices (device_id, device_ip, device_serial_number, device_name, location, status_id)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            db.execute_update(query, (
                device_data['device_id'],
                device_data['device_ip'],
                device_data['device_serial_number'],
                device_data['device_name'],
                device_data['location'],
                status_id
            ))
            
            return BiometricDeviceService.get_device_by_id(device_data['device_id'])
            
        except Exception as e:
            print(f"Error creating biometric device: {e}")
            raise e

    @staticmethod
    def get_device_by_id(device_id: str) -> Optional[Dict[str, Any]]:
        """Get biometric device by ID"""
        try:
            query = """
                SELECT 
                    device_id,
                    device_ip,
                    device_serial_number,
                    device_name,
                    location,
                    last_synced,
                    created_at,
                    status_id
                FROM att_devices WHERE device_id = %s
            """
            return db.execute_query_one(query, (device_id,))
        except Exception as e:
            print(f"Error getting device by ID: {e}")
            return None

    @staticmethod
    def get_all_devices(active_only: bool = False) -> List[Dict[str, Any]]:
        """Get all biometric devices with optional filters"""
        try:
            where_conditions = []
            params = []
            
            if active_only:
                where_conditions.append("status_id = %s")
                params.append(1)
            
            where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
            
            query = f"""
                SELECT 
                    device_id,
                    device_ip,
                    device_serial_number,
                    device_name,
                    location,
                    last_synced,
                    created_at,
                    status_id
                FROM att_devices
                WHERE {where_clause}
                ORDER BY device_name ASC
            """
            
            return db.execute_query_all(query, params)
        except Exception as e:
            print(f"Error getting all devices: {e}")
            return []

    @staticmethod
    def update_device(device_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a biometric device"""
        try:
            # Check if device exists
            if not BiometricDeviceService.check_device_exists(device_id):
                raise ValueError(f"Device with ID {device_id} not found")
            
            # Build update query
            set_clauses = []
            params = []
            
            for field, value in update_data.items():
                if value is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)
            
            if not set_clauses:
                raise ValueError("No fields to update")
            
            params.append(device_id)
            query = f"UPDATE att_devices SET {', '.join(set_clauses)} WHERE device_id = %s"
            
            db.execute_update(query, params)
            
            # Get updated device
            return BiometricDeviceService.get_device_by_id(device_id)
            
        except Exception as e:
            print(f"Error updating device: {e}")
            raise e

    @staticmethod
    def delete_device(device_id: str) -> bool:
        """Soft delete a biometric device (set status_id to 2 - Inactive)"""
        try:
            if not BiometricDeviceService.check_device_exists(device_id):
                raise ValueError(f"Device with ID {device_id} not found")
            
            query = "UPDATE att_devices SET status_id = %s WHERE device_id = %s"
            db.execute_update(query, (2, device_id))
            return True
            
        except Exception as e:
            print(f"Error deleting device: {e}")
            raise e

    @staticmethod
    def hard_delete_device(device_id: str) -> bool:
        """Hard delete a biometric device from database"""
        try:
            if not BiometricDeviceService.check_device_exists(device_id):
                raise ValueError(f"Device with ID {device_id} not found")
            
            query = "DELETE FROM att_devices WHERE device_id = %s"
            db.execute_update(query, (device_id,))
            return True
            
        except Exception as e:
            print(f"Error hard deleting device: {e}")
            raise e

    @staticmethod
    def check_device_exists(device_id: str) -> bool:
        """Check if device exists"""
        try:
            query = "SELECT 1 FROM att_devices WHERE device_id = %s"
            result = db.execute_query_one(query, (device_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking device existence: {e}")
            return False

