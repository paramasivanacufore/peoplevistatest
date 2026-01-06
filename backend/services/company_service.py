from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import shutil
import json

class CompanyService:
    @staticmethod
    def create_company(company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new company with JSON address format"""
        try:
            # Check if company already exists by registration_no
            if company_data.get('registration_no'):
                existing = CompanyService.get_company_by_registration_no(
                    company_data['registration_no']
                )
                if existing:
                    raise ValueError(
                        f"Company with registration number '{company_data['registration_no']}' already exists"
                    )

            # Check if company name already exists
            existing = CompanyService.get_company_by_name(company_data['company_name'])
            if existing:
                raise ValueError(
                    f"Company '{company_data['company_name']}' already exists"
                )

            # ✅ FIX: map frontend `address` correctly
            address_json = {
                "address_line1": company_data.get("address"),
                "postal_code": company_data.get("postal_code"),
                "state": company_data.get("state"),
                "city": company_data.get("city"),
                "country": company_data.get("country")
            }

            company_insert = {
                'company_name': company_data['company_name'],
                'registration_no': company_data.get('registration_no'),
                'industry_type': company_data.get('industry_type'),
                'website_url': company_data.get('website_url'),
                'email': company_data.get('email'),
                'phone_prefix': company_data.get('phone_prefix'),
                'phone_number': company_data.get('phone_number'),
                'phone_extension': company_data.get('phone_extension'),
                'logo_path': company_data.get('logo_path'),
                'status_id': company_data.get('status_id', 1),

                # store JSON
                'address': json.dumps(address_json),

                'country': company_data.get('country'),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }

            query = """
                INSERT INTO companies 
                (company_name, registration_no, industry_type, website_url, email,
                phone_prefix, phone_number, phone_extension, logo_path, status_id,
                address, country, created_at, updated_at)
                VALUES (%(company_name)s, %(registration_no)s, %(industry_type)s,
                        %(website_url)s, %(email)s, %(phone_prefix)s, %(phone_number)s,
                        %(phone_extension)s, %(logo_path)s, %(status_id)s,
                        %(address)s, %(country)s, %(created_at)s, %(updated_at)s)
            """

            company_id = db.execute_insert(query, company_insert)

            return CompanyService.get_company_by_id(company_id)

        except Exception as e:
            print(f"Error creating company: {e}")
            raise




    
    @staticmethod
    def get_company_by_id(company_id: int) -> Optional[Dict[str, Any]]:
        """Get company by ID"""
        try:
            query = """
                SELECT 
                    company_id,
                    company_name,
                    registration_no,
                    industry_type,
                    website_url,
                    email,
                    phone_prefix,
                    phone_number,
                    phone_extension,
                    address,
                    country,
                    logo_path,
                    status_id,
                    created_at,
                    updated_at
                FROM companies
                WHERE company_id = %s
            """
            row = db.execute_query_one(query, (company_id,))
            if not row:
                return None

            status_map = {1: 'Active', 2: 'Inactive', 3: 'Archived'}
            
            # Return address as string
            address_str = row.get('address', '')

            return {
                'company_id': row['company_id'],
                'company_name': row['company_name'],
                'registration_no': row.get('registration_no'),
                'industry_type': row.get('industry_type'),
                'website_url': row.get('website_url'),
                'email': row.get('email'),
                'phone_prefix': row.get('phone_prefix'),
                'phone_number': row.get('phone_number'),
                'phone_extension': row.get('phone_extension'),
                'logo_path': row.get('logo_path'),
                'status_id': row.get('status_id', 1),
                'status': status_map.get(row.get('status_id', 1)),
                'address': address_str,  # ✅ string, not dict
                'country': row.get('country'),
                'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
                'updated_at': row['updated_at'].isoformat() if row.get('updated_at') else None
            }
        except Exception as e:
            print(f"Error getting company by ID: {e}")
            return None



    @staticmethod
    def get_company_by_name(company_name: str) -> Optional[Dict[str, Any]]:
        """Get company by name"""
        try:
            query = """
                SELECT * FROM companies 
                WHERE company_name = %s
            """
            return db.execute_query_one(query, (company_name,))
        except Exception as e:
            print(f"Error getting company by name: {e}")
            return None
    
    @staticmethod
    def get_company_by_registration_no(registration_no: str) -> Optional[Dict[str, Any]]:
        """Get company by registration number"""
        try:
            query = """
                SELECT * FROM companies 
                WHERE registration_no = %s
            """
            return db.execute_query_one(query, (registration_no,))
        except Exception as e:
            print(f"Error getting company by registration_no: {e}")
            return None
    
    @staticmethod
    def get_all_companies() -> List[Dict[str, Any]]:
        """Get all companies with status_id only"""
        try:
            query = """
                SELECT 
                    company_id,
                    company_name,
                    registration_no,
                    industry_type,
                    website_url,
                    email,
                    phone_prefix,
                    phone_number,
                    phone_extension,
                    address,
                    country,
                    logo_path,
                    status_id,
                    created_at,
                    updated_at
                FROM companies
                ORDER BY created_at DESC
            """

            results = db.execute_query_all(query)

            companies = []

            for row in results:
                companies.append({
                    "company_id": row["company_id"],
                    "company_name": row["company_name"],
                    "registration_no": row.get("registration_no"),
                    "industry_type": row.get("industry_type"),
                    "website_url": row.get("website_url"),
                    "email": row.get("email"),
                    "phone_prefix": row.get("phone_prefix"),
                    "phone_number": row.get("phone_number"),
                    "phone_extension": row.get("phone_extension"),
                    "address": row.get("address") or "",
                    "country": row.get("country"),
                    "logo_path": row.get("logo_path"),
                    "status_id": row.get("status_id"),
                    "created_at": row.get("created_at"),
                    "updated_at": row.get("updated_at"),
                })

            return companies

        except Exception as e:
            print(f"Error getting all companies: {e}")
            return []

    
    @staticmethod
    def update_company(company_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update company (single JSON address column)"""
        try:
            if not CompanyService.check_company_exists(company_id):
                raise ValueError(f"Company with ID {company_id} not found")

            # Duplicate registration check
            if update_data.get('registration_no'):
                existing = CompanyService.get_company_by_registration_no(
                    update_data['registration_no']
                )
                if existing and existing['company_id'] != company_id:
                    raise ValueError(
                        f"Company with registration number '{update_data['registration_no']}' already exists"
                    )

            # Duplicate name check
            if update_data.get('company_name'):
                existing = CompanyService.get_company_by_name(update_data['company_name'])
                if existing and existing['company_id'] != company_id:
                    raise ValueError(
                        f"Company '{update_data['company_name']}' already exists"
                    )

            set_clauses = []
            params = []

            # Normal scalar fields
            scalar_fields = [
                'company_name', 'registration_no', 'industry_type', 'website_url',
                'email', 'phone_prefix', 'phone_number', 'phone_extension',
                'logo_path', 'status_id', 'country'
            ]

            for field in scalar_fields:
                if field in update_data and update_data[field] is not None:
                    set_clauses.append(f"{field} = %s")
                    params.append(update_data[field])

            # ✅ REBUILD ADDRESS JSON (THIS WAS MISSING)
            address_fields = ['address', 'state', 'city', 'postal_code', 'country']
            if any(update_data.get(f) is not None for f in address_fields):
                address_json = {
                    "address_line1": update_data.get("address"),
                    "state": update_data.get("state"),
                    "city": update_data.get("city"),
                    "postal_code": update_data.get("postal_code"),
                    "country": update_data.get("country"),
                }
                set_clauses.append("address = %s")
                params.append(json.dumps(address_json))

            if not set_clauses:
                return CompanyService.get_company_by_id(company_id)

            set_clauses.append("updated_at = %s")
            params.append(datetime.utcnow())
            params.append(company_id)

            query = f"""
                UPDATE companies
                SET {', '.join(set_clauses)}
                WHERE company_id = %s
            """
            db.execute_update(query, tuple(params))

            return CompanyService.get_company_by_id(company_id)

        except Exception as e:
            print(f"Error updating company: {e}")
            raise

    
    @staticmethod
    def delete_company(company_id: int) -> bool:
        """Soft delete a company (set status_id to Inactive)"""
        try:
            if not CompanyService.check_company_exists(company_id):
                raise ValueError(f"Company with ID {company_id} not found")
            
            query = "UPDATE companies SET status_id = %s, updated_at = %s WHERE company_id = %s"
            db.execute_update(query, (2, datetime.utcnow(), company_id))
            return True
            
        except Exception as e:
            print(f"Error deleting company: {e}")
            raise e
    
    @staticmethod
    def hard_delete_company(company_id: int) -> bool:
        """Permanently delete a company"""
        try:
            if not CompanyService.check_company_exists(company_id):
                raise ValueError(f"Company with ID {company_id} not found")
            
            # Delete address first (due to foreign key)
            db.execute_update(
                "DELETE FROM addresses WHERE company_id = %s",
                (company_id,)
            )
            
            # Delete company
            query = "DELETE FROM companies WHERE company_id = %s"
            db.execute_update(query, (company_id,))
            return True
            
        except Exception as e:
            print(f"Error hard deleting company: {e}")
            raise e
    
    @staticmethod
    def check_company_exists(company_id: int) -> bool:
        """Check if company exists"""
        try:
            query = "SELECT 1 FROM companies WHERE company_id = %s"
            result = db.execute_query_one(query, (company_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking company existence: {e}")
            return False
    
    @staticmethod
    def _create_address(company_id: int, address_data: Dict[str, Any], address_type: str):
        """Helper method to create address"""
        try:
            query = """
                INSERT INTO addresses 
                (company_id, address_line1, address_line2, city, state, country, 
                 postal_code, address_type, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            current_time = datetime.utcnow()
            db.execute_insert(query, (
                company_id,
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
    def get_by_company_name(company_name: str):
        query = """
            SELECT company_id FROM companies
            WHERE LOWER(company_name) = LOWER(%s)
            LIMIT 1
        """
        return db.execute_query_one(query, (company_name,))

    @staticmethod
    def get_by_email(email: str):
        query = """
            SELECT company_id FROM companies
            WHERE LOWER(email) = LOWER(%s)
            LIMIT 1
        """
        return db.execute_query_one(query, (email,))

    @staticmethod
    def get_by_phone_number(phone_number: str):
        query = """
            SELECT company_id FROM companies
            WHERE phone_number = %s
            LIMIT 1
        """
        return db.execute_query_one(query, (phone_number,))




    @staticmethod
    def _format_company_response(row: Dict[str, Any]) -> Dict[str, Any]:
        """Format company response with status string"""
        status_id_value = row.get('status_id', 1)
        status_map = {1: 'Active', 2: 'Inactive', 3: 'Archived'}
        status = status_map.get(status_id_value, 'Active')
        
        company_data = {
            'company_id': row['company_id'],
            'company_name': row['company_name'],
            'registration_no': row.get('registration_no'),
            'industry_type': row.get('industry_type'),
            'website_url': row.get('website_url'),
            'email': row.get('email'),
            'phone_prefix': row.get('phone_prefix'),
            'phone_number': row.get('phone_number'),
            'phone_extension': row.get('phone_extension'),
            'logo_path': row.get('logo_path'),
            'status_id': status_id_value,
            'status': status,
            'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
            'updated_at': row['updated_at'].isoformat() if row.get('updated_at') else None,
        }
        
        # Add address data if it exists
        if row.get('address_id'):
            company_data['address'] = {
                'address_id': row.get('address_id'),
                'address_line1': row.get('address_line1'),
                'address_line2': row.get('address_line2'),
                'city': row.get('city'),
                'state': row.get('state'),
                'country': row.get('country'),
                'postal_code': row.get('postal_code'),
                'zip_code': row.get('postal_code'),  # For backward compatibility
                'address_type': row.get('address_type')
            }
            # Also add address fields directly
            company_data['city'] = row.get('city')
            company_data['state'] = row.get('state')
            company_data['country'] = row.get('country')
            company_data['postal_code'] = row.get('postal_code')
            company_data['zip_code'] = row.get('postal_code')
        
        return company_data

