from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime

class BranchService:
    @staticmethod
    def create_branch(branch_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new branch with address"""
        try:
            # Check if company exists
            company = db.execute_query_one(
                "SELECT company_id FROM companies WHERE company_id = %s",
                (branch_data['company_id'],)
            )
            if not company:
                raise ValueError(f"Company with ID {branch_data['company_id']} not found")
            
            # Check if branch already exists for this company
            existing = BranchService.get_branch_by_name_and_company(
                branch_data['branch_name'],
                branch_data['company_id']
            )
            if existing:
                raise ValueError(f"Branch '{branch_data['branch_name']}' already exists for this company")
            
            # Extract address data if provided
            address_data = {}
            if 'address_line1' in branch_data or 'postal_code' in branch_data:
                address_data = {
                    'address_line1': branch_data.get('address_line1'),
                    'address_line2': branch_data.get('address_line2'),
                    'city': branch_data.get('city'),
                    'state': branch_data.get('state'),
                    'country': branch_data.get('country'),
                    'postal_code': branch_data.get('postal_code'),
                    'address_type': 'Branch'
                }
            
            # Insert branch
            query = """
                INSERT INTO branches 
                (company_id, branch_name, phone_number, email, status_id, created_at, updated_at)
                VALUES (%(company_id)s, %(branch_name)s, %(phone_number)s, %(email)s, 
                        %(status_id)s, %(created_at)s, %(updated_at)s)
            """
            current_time = datetime.utcnow()
            branch_insert = {
                'company_id': branch_data['company_id'],
                'branch_name': branch_data['branch_name'],
                'phone_number': branch_data.get('phone_number'),
                'email': branch_data.get('email'),
                'status_id': branch_data.get('status_id', 1),
                'created_at': current_time,
                'updated_at': current_time
            }
            
            branch_id = db.execute_insert(query, branch_insert)
            
            # Create address if provided
            if address_data.get('address_line1') and address_data.get('city'):
                BranchService._create_address(branch_data['company_id'], branch_id, address_data, 'Branch')
            
            return BranchService.get_branch_by_id(branch_id)
            
        except Exception as e:
            print(f"Error creating branch: {e}")
            raise e
    
    @staticmethod
    def get_branch_by_id(branch_id: int) -> Optional[Dict[str, Any]]:
        """Get branch by ID with address and company info"""
        try:
            query = """
                SELECT b.*, c.company_name 
                FROM branches b
                LEFT JOIN companies c ON b.company_id = c.company_id
                WHERE b.branch_id = %s
            """
            row = db.execute_query_one(query, (branch_id,))
            
            if not row:
                return None
            
            # Get address
            address = BranchService._get_address_by_branch_id(branch_id)
            
            # Format response
            return BranchService._format_branch_response(row, address)
            
        except Exception as e:
            print(f"Error getting branch by ID: {e}")
            return None
    
    @staticmethod
    def get_branch_by_name_and_company(branch_name: str, company_id: int) -> Optional[Dict[str, Any]]:
        """Get branch by name and company"""
        try:
            query = """
                SELECT * FROM branches 
                WHERE branch_name = %s AND company_id = %s
            """
            return db.execute_query_one(query, (branch_name, company_id))
        except Exception as e:
            print(f"Error getting branch by name and company: {e}")
            return None
    
    @staticmethod
    def get_all_branches(active_only: bool = False, status_id: Optional[int] = None, 
                        company_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all branches with optional filters"""
        try:
            params = []
            where_clause = "WHERE 1=1"
            
            if status_id is not None:
                where_clause += " AND b.status_id = %s"
                params.append(status_id)
            elif active_only:
                where_clause += " AND b.status_id = 1"
            
            if company_id is not None:
                where_clause += " AND b.company_id = %s"
                params.append(company_id)
            
            query = f"""
                SELECT b.*, c.company_name 
                FROM branches b
                LEFT JOIN companies c ON b.company_id = c.company_id
                {where_clause}
                ORDER BY b.created_at DESC
            """
            
            rows = db.execute_query_all(query, tuple(params) if params else None)
            
            # Format all branches
            branches = []
            for row in rows:
                address = BranchService._get_address_by_branch_id(row['branch_id'])
                branches.append(BranchService._format_branch_response(row, address))
            
            return branches
            
        except Exception as e:
            print(f"Error getting all branches: {e}")
            return []
    
    @staticmethod
    def get_branches_by_company(company_id: int) -> List[Dict[str, Any]]:
        """Get all branches for a specific company"""
        return BranchService.get_all_branches(company_id=company_id)
    
    @staticmethod
    def update_branch(branch_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a branch and its address"""
        try:
            # Check if branch exists
            if not BranchService.check_branch_exists(branch_id):
                raise ValueError(f"Branch with ID {branch_id} not found")
            
            # Check if company exists if updating company_id
            if 'company_id' in update_data and update_data['company_id']:
                company = db.execute_query_one(
                    "SELECT company_id FROM companies WHERE company_id = %s",
                    (update_data['company_id'],)
                )
                if not company:
                    raise ValueError(f"Company with ID {update_data['company_id']} not found")
            
            # Check for duplicate name if updating
            if 'branch_name' in update_data and update_data['branch_name']:
                existing = BranchService.get_branch_by_id(branch_id)
                if existing:
                    company_id_to_check = update_data.get('company_id') or existing['company_id']
                    duplicate = BranchService.get_branch_by_name_and_company(
                        update_data['branch_name'],
                        company_id_to_check
                    )
                    if duplicate and duplicate['branch_id'] != branch_id:
                        raise ValueError(f"Branch '{update_data['branch_name']}' already exists for this company")
            
            # Build update query for branch
            set_clauses = []
            params = []
            
            branch_fields = ['company_id', 'branch_name', 'email', 'phone_number', 'status_id']
            for field in branch_fields:
                if field in update_data and update_data[field] is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(update_data[field])
            
            if set_clauses:
                set_clauses.append("updated_at = %s")
                params.append(datetime.utcnow())
                params.append(branch_id)
                
                query = f"UPDATE branches SET {', '.join(set_clauses)} WHERE branch_id = %s"
                db.execute_update(query, tuple(params))
            
            # Handle address update/create
            address_fields = ['address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code']
            has_address_data = any(field in update_data for field in address_fields)
            
            if has_address_data:
                # Get company_id for address
                branch = BranchService.get_branch_by_id(branch_id)
                company_id = branch['company_id'] if branch else update_data.get('company_id')
                
                # Check if address exists
                existing_address = db.execute_query_one(
                    "SELECT address_id FROM addresses WHERE branch_id = %s ORDER BY address_id DESC LIMIT 1",
                    (branch_id,)
                )
                
                address_data = {
                    'address_line1': update_data.get('address_line1'),
                    'address_line2': update_data.get('address_line2'),
                    'city': update_data.get('city'),
                    'state': update_data.get('state'),
                    'country': update_data.get('country'),
                    'postal_code': update_data.get('postal_code'),
                    'address_type': 'Branch'
                }
                
                if existing_address:
                    # Update existing address
                    BranchService._update_address(existing_address['address_id'], address_data)
                elif address_data.get('address_line1') and address_data.get('city') and company_id:
                    # Create new address
                    BranchService._create_address(company_id, branch_id, address_data, 'Branch')
            
            return BranchService.get_branch_by_id(branch_id)
            
        except Exception as e:
            print(f"Error updating branch: {e}")
            raise e
    
    @staticmethod
    def delete_branch(branch_id: int) -> bool:
        """Soft delete a branch (set status_id to inactive)"""
        try:
            if not BranchService.check_branch_exists(branch_id):
                raise ValueError(f"Branch with ID {branch_id} not found")
            
            # Set status_id to 2 (Inactive) or 3 (Archived)
            query = "UPDATE branches SET status_id = %s, updated_at = %s WHERE branch_id = %s"
            db.execute_update(query, (2, datetime.utcnow(), branch_id))
            return True
            
        except Exception as e:
            print(f"Error deleting branch: {e}")
            raise e
    
    @staticmethod
    def reinstate_branch(branch_id: int) -> bool:
        """Reinstate a branch (set status_id to active)"""
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
    def check_branch_exists(branch_id: int) -> bool:
        """Check if branch exists"""
        try:
            query = "SELECT 1 FROM branches WHERE branch_id = %s"
            result = db.execute_query_one(query, (branch_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking branch existence: {e}")
            return False
    
    @staticmethod
    def _create_address(company_id: int, branch_id: int, address_data: Dict[str, Any], address_type: str):
        """Helper method to create address"""
        try:
            query = """
                INSERT INTO addresses 
                (company_id, branch_id, address_line1, address_line2, city, state, country, 
                 postal_code, address_type, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            current_time = datetime.utcnow()
            db.execute_insert(query, (
                company_id,
                branch_id,
                address_data.get('address_line1'),
                address_data.get('address_line2'),
                address_data.get('city'),
                address_data.get('state'),
                address_data.get('country'),
                address_data.get('postal_code'),
                address_type,
                current_time,
                current_time
            ))
        except Exception as e:
            print(f"Error creating address: {e}")
            raise e
    
    @staticmethod
    def _update_address(address_id: int, address_data: Dict[str, Any]):
        """Helper method to update address"""
        try:
            set_clauses = []
            params = []
            
            address_fields = ['address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code']
            for field in address_fields:
                if field in address_data and address_data[field] is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(address_data[field])
            
            if set_clauses:
                set_clauses.append("updated_at = %s")
                params.append(datetime.utcnow())
                params.append(address_id)
                
                query = f"UPDATE addresses SET {', '.join(set_clauses)} WHERE address_id = %s"
                db.execute_update(query, tuple(params))
        except Exception as e:
            print(f"Error updating address: {e}")
            raise e
    
    @staticmethod
    def _get_address_by_branch_id(branch_id: int) -> Optional[Dict[str, Any]]:
        """Get address for a branch"""
        try:
            query = """
                SELECT address_line1, address_line2, city, state, country, 
                       postal_code, address_type 
                FROM addresses 
                WHERE branch_id = %s 
                ORDER BY address_id DESC 
                LIMIT 1
            """
            return db.execute_query_one(query, (branch_id,))
        except Exception as e:
            print(f"Error getting address: {e}")
            return None
    
    @staticmethod
    def _format_branch_response(row: Dict[str, Any], address: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Format branch response with status string"""
        status_id_value = row.get('status_id', 1)
        status_map = {1: 'Active', 2: 'Inactive', 3: 'Archived'}
        status = status_map.get(status_id_value, 'Active')
        
        branch_data = {
            'branch_id': row['branch_id'],
            'company_id': row['company_id'],
            'name': row['branch_name'],  # For frontend compatibility
            'branch_name': row['branch_name'],
            'email': row.get('email'),
            'phone_number': row.get('phone_number'),
            'status_id': status_id_value,
            'status': status,
            'company_name': row.get('company_name'),  # Top-level for model compatibility
            'company': {
                'company_id': row['company_id'],
                'company_name': row.get('company_name', 'N/A')
            } if row.get('company_name') else None,
            'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
            'updated_at': row['updated_at'].isoformat() if row.get('updated_at') else None,
            'address': address
        }
        
        return branch_data

