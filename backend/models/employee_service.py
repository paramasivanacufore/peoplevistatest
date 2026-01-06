from database import db
from typing import List, Optional, Dict, Any
from datetime import datetime
from services.auth_service import AuthService

class EmployeeService:
    @staticmethod
    def create_employee(employee_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new employee across all related tables"""
        try:
            # Check if employee_code already exists
            if employee_data.get('emp_code'):
                existing = EmployeeService.get_employee_by_code(employee_data['emp_code'])
                if existing:
                    raise ValueError(f"Employee code '{employee_data['emp_code']}' already exists")
            
            # Check if work_email already exists
            if employee_data.get('work_email'):
                existing = EmployeeService.get_employee_by_work_email(employee_data['work_email'])
                if existing:
                    raise ValueError(f"Work email '{employee_data['work_email']}' already exists")
            
            current_time = datetime.utcnow()
            
            # 1. Insert into emp_personal_info
            personal_query = """
                INSERT INTO emp_personal_info 
                (first_name, last_name, gender, dob, nationality, marital_status, 
                 blood_group, personal_email, personal_phone, emergency_contact_name, 
                 emergency_contact_number, profile_photo, created_at, updated_at)
                VALUES (%(first_name)s, %(last_name)s, %(gender)s, %(dob)s, 
                        %(nationality)s, %(marital_status)s, %(blood_group)s, 
                        %(personal_email)s, %(personal_phone)s, %(emergency_contact_name)s, 
                        %(emergency_contact_number)s, %(profile_photo)s, %(created_at)s, %(updated_at)s)
            """
            personal_data = {
                'first_name': employee_data.get('first_name'),
                'last_name': employee_data.get('last_name'),
                'gender': employee_data.get('gender'),
                'dob': employee_data.get('dob'),
                'nationality': employee_data.get('nationality'),
                'marital_status': employee_data.get('marital_status'),
                'blood_group': employee_data.get('blood_group'),
                'personal_email': employee_data.get('personal_email'),
                'personal_phone': employee_data.get('personal_phone'),
                'emergency_contact_name': employee_data.get('emergency_contact_name'),
                'emergency_contact_number': employee_data.get('emergency_contact_number'),
                'profile_photo': employee_data.get('profile_photo'),
                'created_at': current_time,
                'updated_at': current_time
            }
            emp_id = db.execute_insert(personal_query, personal_data)
            
            # 2. Insert into emp_employment_details
            employment_query = """
                INSERT INTO emp_employment_details 
                (emp_id, emp_code, company_id, branch_id, department_id, position_id, role_id, 
                 reports_to, employment_type, work_mode, job_title_id, hire_date , 
                 confirmation_date, contract_end_date, probation_period, status_id, work_email, 
                 official_phone, created_at, updated_at)
                VALUES (%(emp_id)s, %(emp_code)s, %(company_id)s, %(branch_id)s, 
                        %(department_id)s, %(position_id)s, %(role_id)s, %(reports_to)s, 
                        %(employment_type)s, %(work_mode)s, %(job_title_id)s, %(hire_date )s, 
                        %(confirmation_date)s, %(contract_end_date)s, %(probation_period)s, 
                        %(status_id)s, %(work_email)s, %(official_phone)s, %(created_at)s, %(updated_at)s)
            """
            employment_data = {
                'emp_id': emp_id,
                'emp_code': employee_data.get('emp_code'),
                'company_id': employee_data.get('company_id'),
                'branch_id': employee_data.get('branch_id'),
                'department_id': employee_data.get('department_id'),
                'position_id': employee_data.get('position_id'),
                'role_id': employee_data.get('role_id'),
                'reports_to': employee_data.get('reports_to'),
                'employment_type': employee_data.get('employment_type'),
                'work_mode': employee_data.get('work_mode'),
                'job_title_id': employee_data.get('job_title_id'),
                'hire_date ': employee_data.get('hire_date '),
                'confirmation_date': employee_data.get('confirmation_date'),
                'contract_end_date': employee_data.get('contract_end_date'),
                'probation_period': employee_data.get('probation_period'),
                'status_id': employee_data.get('status_id', 7),  # Default to Pending (7)
                'work_email': employee_data.get('work_email'),
                'official_phone': employee_data.get('official_phone'),
                'created_at': current_time,
                'updated_at': current_time
            }
            db.execute_insert(employment_query, employment_data)
            
            # 3. Handle addresses
            current_address_same_as_permanent = employee_data.get('current_address_same_as_permanent', False)
            
            # Permanent address
            if employee_data.get('permanent_address_line1'):
                EmployeeService._create_employee_address(emp_id, {
                    'address_line1': employee_data.get('permanent_address_line1'),
                    'address_line2': employee_data.get('permanent_address_line2'),
                    'city': employee_data.get('permanent_city'),
                    'state': employee_data.get('permanent_state'),
                    'country': employee_data.get('permanent_country'),
                    'postal_code': employee_data.get('permanent_postal_code'),
                    'address_type': 'Permanent'
                })
            
            # Current address
            if current_address_same_as_permanent:
                # Copy permanent address to current
                if employee_data.get('permanent_address_line1'):
                    EmployeeService._create_employee_address(emp_id, {
                        'address_line1': employee_data.get('permanent_address_line1'),
                        'address_line2': employee_data.get('permanent_address_line2'),
                        'city': employee_data.get('permanent_city'),
                        'state': employee_data.get('permanent_state'),
                        'country': employee_data.get('permanent_country'),
                        'postal_code': employee_data.get('permanent_postal_code'),
                        'address_type': 'Current'
                    })
            elif employee_data.get('current_address_line1'):
                EmployeeService._create_employee_address(emp_id, {
                    'address_line1': employee_data.get('current_address_line1'),
                    'address_line2': employee_data.get('current_address_line2'),
                    'city': employee_data.get('current_city'),
                    'state': employee_data.get('current_state'),
                    'country': employee_data.get('current_country'),
                    'postal_code': employee_data.get('current_postal_code'),
                    'address_type': 'Current'
                })
            
            # 4. Insert into emp_payroll_details (if provided)
            if any(key in employee_data for key in ['salary_type', 'basic_salary', 'bank_name']):
                payroll_query = """
                    INSERT INTO emp_payroll_details 
                    (emp_id, salary_type, basic_salary, allowances, bonuses, deductions, 
                     bank_name, account_holder_name, account_number, ifsc_swift_code, 
                     pan_tax_id, uan_pf_number, esic_number, payment_mode, created_at, updated_at)
                    VALUES (%(emp_id)s, %(salary_type)s, %(basic_salary)s, %(allowances)s, 
                            %(bonuses)s, %(deductions)s, %(bank_name)s, %(account_holder_name)s, 
                            %(account_number)s, %(ifsc_swift_code)s, %(pan_tax_id)s, 
                            %(uan_pf_number)s, %(esic_number)s, %(payment_mode)s, 
                            %(created_at)s, %(updated_at)s)
                """
                payroll_data = {
                    'emp_id': emp_id,
                    'salary_type': employee_data.get('salary_type'),
                    'basic_salary': employee_data.get('basic_salary'),
                    'allowances': employee_data.get('allowances'),
                    'bonuses': employee_data.get('bonuses'),
                    'deductions': employee_data.get('deductions'),
                    'bank_name': employee_data.get('bank_name'),
                    'account_holder_name': employee_data.get('account_holder_name'),
                    'account_number': employee_data.get('account_number'),
                    'ifsc_swift_code': employee_data.get('ifsc_swift_code'),
                    'pan_tax_id': employee_data.get('pan_tax_id'),
                    'uan_pf_number': employee_data.get('uan_pf_number'),
                    'esic_number': employee_data.get('esic_number'),
                    'payment_mode': employee_data.get('payment_mode'),
                    'created_at': current_time,
                    'updated_at': current_time
                }
                db.execute_insert(payroll_query, payroll_data)
            
            # 5. Insert into emp_system_access (if provided)
            if any(key in employee_data for key in ['system_access_role_id', 'access_level', 'system_email']):
                system_query = """
                    INSERT INTO emp_system_access 
                    (emp_id, role_id, access_level, assigned_modules, system_email, 
                     account_status, two_factor_auth, created_at, updated_at)
                    VALUES (%(emp_id)s, %(role_id)s, %(access_level)s, %(assigned_modules)s, 
                            %(system_email)s, %(account_status)s, %(two_factor_auth)s, 
                            %(created_at)s, %(updated_at)s)
                """
                system_data = {
                    'emp_id': emp_id,
                    'role_id': employee_data.get('system_access_role_id') or employee_data.get('role_id'),
                    'access_level': employee_data.get('access_level'),
                    'assigned_modules': employee_data.get('assigned_modules'),
                    'system_email': employee_data.get('system_email'),
                    'account_status': employee_data.get('account_status', 'Active'),
                    'two_factor_auth': employee_data.get('two_factor_auth', False),
                    'created_at': current_time,
                    'updated_at': current_time
                }
                db.execute_insert(system_query, system_data)
            
            # 6. Insert into emp_documents (if provided)
            if any(key in employee_data for key in ['resume_cv', 'offer_letter', 'id_proof', 'insurance_policy_no']):
                documents_query = """
                    INSERT INTO emp_documents 
                    (emp_id, resume_cv, offer_letter, joining_letter, nda_agreement, 
                     id_proof, address_proof, experience_certificate, qualification_certificate, 
                     work_visa_permit, insurance_policy_no, created_at, updated_at)
                    VALUES (%(emp_id)s, %(resume_cv)s, %(offer_letter)s, %(joining_letter)s, 
                            %(nda_agreement)s, %(id_proof)s, %(address_proof)s, 
                            %(experience_certificate)s, %(qualification_certificate)s, 
                            %(work_visa_permit)s, %(insurance_policy_no)s, %(created_at)s, %(updated_at)s)
                """
                documents_data = {
                    'emp_id': emp_id,
                    'resume_cv': employee_data.get('resume_cv'),
                    'offer_letter': employee_data.get('offer_letter'),
                    'joining_letter': employee_data.get('joining_letter'),
                    'nda_agreement': employee_data.get('nda_agreement'),
                    'id_proof': employee_data.get('id_proof'),
                    'address_proof': employee_data.get('address_proof'),
                    'experience_certificate': employee_data.get('experience_certificate'),
                    'qualification_certificate': employee_data.get('qualification_certificate'),
                    'work_visa_permit': employee_data.get('work_visa_permit'),
                    'insurance_policy_no': employee_data.get('insurance_policy_no'),
                    'created_at': current_time,
                    'updated_at': current_time
                }
                db.execute_insert(documents_query, documents_data)
            
            # 7. Insert into emp_additional_info (if provided)
            if any(key in employee_data for key in ['skills', 'certifications', 'linkedin_profile', 'created_by']):
                additional_query = """
                    INSERT INTO emp_additional_info 
                    (emp_id, skills, certifications, linkedin_profile, github_portfolio, 
                     languages_known, notes_remarks, created_by, created_at, updated_at)
                    VALUES (%(emp_id)s, %(skills)s, %(certifications)s, %(linkedin_profile)s, 
                            %(github_portfolio)s, %(languages_known)s, %(notes_remarks)s, 
                            %(created_by)s, %(created_at)s, %(updated_at)s)
                """
                additional_data = {
                    'emp_id': emp_id,
                    'skills': employee_data.get('skills'),
                    'certifications': employee_data.get('certifications'),
                    'linkedin_profile': employee_data.get('linkedin_profile'),
                    'github_portfolio': employee_data.get('github_portfolio'),
                    'languages_known': employee_data.get('languages_known'),
                    'notes_remarks': employee_data.get('notes_remarks'),
                    'created_by': employee_data.get('created_by'),
                    'created_at': current_time,
                    'updated_at': current_time
                }
                db.execute_insert(additional_query, additional_data)
            
            # 8. Create user account in ac_users table if username and password provided
            if employee_data.get('username') and employee_data.get('password'):
                # Check if username already exists
                existing_user = db.execute_query_one(
                    "SELECT user_id FROM ac_users WHERE username = %s",
                    (employee_data['username'],)
                )
                if existing_user:
                    raise ValueError(f"Username '{employee_data['username']}' already exists")
                
                # Hash password
                hashed_password = AuthService.get_password_hash(employee_data['password'])
                
                # Use system_email if provided, otherwise use work_email, otherwise use personal_email
                user_email = employee_data.get('system_email') or employee_data.get('work_email') or employee_data.get('personal_email')
                
                # Create user account
                user_query = """
                    INSERT INTO ac_users (emp_id, username, password_hash, email, status_id)
                    VALUES (%s, %s, %s, %s, %s)
                """
                user_data = (
                    emp_id,
                    employee_data['username'],
                    hashed_password,
                    user_email,
                    1  # Default status_id to 1 (Active)
                )
                db.execute_insert(user_query, user_data)
            
            return EmployeeService.get_employee_by_id(emp_id)
            
        except Exception as e:
            print(f"Error creating employee: {e}")
            raise e
    
    @staticmethod
    def get_employee_by_id(emp_id: int) -> Optional[Dict[str, Any]]:
        """Get employee by ID with all related data"""
        try:
            query = """
                SELECT 
                    -- emp_personal_info
                    epi.emp_id,
                    epi.first_name,
                    epi.last_name,
                    epi.gender,
                    epi.dob,
                    epi.nationality,
                    epi.marital_status,
                    epi.blood_group,
                    epi.personal_email,
                    epi.personal_phone,
                    epi.emergency_contact_name,
                    epi.emergency_contact_number,
                    epi.profile_photo,
                    
                    -- emp_employment_details
                    eed.emp_code,
                    eed.company_id,
                    eed.branch_id,
                    eed.department_id,
                    eed.position_id,
                    eed.role_id,
                    eed.reports_to,
                    eed.employment_type,
                    eed.work_mode,
                    eed.job_title_id,
                    eed.hire_date ,
                    eed.confirmation_date,
                    eed.contract_end_date,
                    eed.probation_period,
                    eed.status_id,
                    eed.work_email,
                    eed.official_phone,
                    
                    -- emp_addresses - Permanent
                    ea_perm.address_line1 as permanent_address_line1,
                    ea_perm.address_line2 as permanent_address_line2,
                    ea_perm.city as permanent_city,
                    ea_perm.state as permanent_state,
                    ea_perm.country as permanent_country,
                    ea_perm.postal_code as permanent_postal_code,
                    
                    -- emp_addresses - Current
                    ea_curr.address_line1 as current_address_line1,
                    ea_curr.address_line2 as current_address_line2,
                    ea_curr.city as current_city,
                    ea_curr.state as current_state,
                    ea_curr.country as current_country,
                    ea_curr.postal_code as current_postal_code,
                    
                    -- emp_payroll_details
                    epd.salary_type,
                    epd.basic_salary,
                    epd.allowances,
                    epd.bonuses,
                    epd.deductions,
                    epd.bank_name,
                    epd.account_holder_name,
                    epd.account_number,
                    epd.ifsc_swift_code,
                    epd.pan_tax_id,
                    epd.uan_pf_number,
                    epd.esic_number,
                    epd.payment_mode,
                    
                    -- emp_system_access
                    esa.role_id as system_access_role_id,
                    esa.access_level,
                    esa.assigned_modules,
                    esa.system_email,
                    esa.account_status,
                    esa.two_factor_auth,
                    
                    -- emp_documents
                    ed.resume_cv,
                    ed.offer_letter,
                    ed.joining_letter,
                    ed.nda_agreement,
                    ed.id_proof,
                    ed.address_proof,
                    ed.experience_certificate,
                    ed.qualification_certificate,
                    ed.work_visa_permit,
                    ed.insurance_policy_no,
                    
                    -- emp_additional_info
                    eai.skills,
                    eai.certifications,
                    eai.linkedin_profile,
                    eai.github_portfolio,
                    eai.languages_known,
                    eai.notes_remarks,
                    eai.created_by,
                    
                    -- Status name
                    s.status_name
                FROM emp_personal_info epi
                LEFT JOIN emp_employment_details eed ON eed.emp_id = epi.emp_id
                LEFT JOIN emp_addresses ea_perm ON ea_perm.emp_id = epi.emp_id 
                    AND ea_perm.address_type = 'Permanent'
                LEFT JOIN emp_addresses ea_curr ON ea_curr.emp_id = epi.emp_id 
                    AND ea_curr.address_type = 'Current'
                LEFT JOIN emp_payroll_details epd ON epd.emp_id = epi.emp_id
                LEFT JOIN emp_system_access esa ON esa.emp_id = epi.emp_id
                LEFT JOIN emp_documents ed ON ed.emp_id = epi.emp_id
                LEFT JOIN emp_additional_info eai ON eai.emp_id = epi.emp_id
                LEFT JOIN status s ON s.status_id = eed.status_id
                WHERE epi.emp_id = %s
            """
            result = db.execute_query_one(query, (emp_id,))
            
            if not result:
                return None
            
            # Format dates
            employee_data = dict(result)
            
            # Check if current address same as permanent
            current_same_as_permanent = False
            if (employee_data.get('permanent_address_line1') and 
                employee_data.get('current_address_line1') and
                employee_data.get('permanent_address_line1') == employee_data.get('current_address_line1') and
                employee_data.get('permanent_city') == employee_data.get('current_city')):
                current_same_as_permanent = True
            
            employee_data['current_address_same_as_permanent'] = current_same_as_permanent
            
            return employee_data
            
        except Exception as e:
            print(f"Error getting employee by ID: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def get_employee_by_code(emp_code: str) -> Optional[Dict[str, Any]]:
        """Get employee by code"""
        try:
            query = """
                SELECT epi.* FROM emp_personal_info epi
                JOIN emp_employment_details eed ON eed.emp_id = epi.emp_id
                WHERE eed.emp_code = %s
            """
            result = db.execute_query_one(query, (emp_code,))
            if result:
                return EmployeeService.get_employee_by_id(result['emp_id'])
            return None
        except Exception as e:
            print(f"Error getting employee by code: {e}")
            return None
    
    @staticmethod
    def get_employee_by_work_email(work_email: str) -> Optional[Dict[str, Any]]:
        """Get employee by work email"""
        try:
            query = """
                SELECT emp_id FROM emp_employment_details WHERE work_email = %s
            """
            result = db.execute_query_one(query, (work_email,))
            if result:
                return EmployeeService.get_employee_by_id(result['emp_id'])
            return None
        except Exception as e:
            print(f"Error getting employee by work email: {e}")
            return None
    
    @staticmethod
    def get_all_employees(status_filter: Optional[str] = None, 
                         company_id: Optional[int] = None,
                         branch_id: Optional[int] = None,
                         department_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all employees with optional filters"""
        try:
            params = []
            where_clause = "WHERE 1=1"
            
            if status_filter and status_filter != 'All':
                # Map status string to status_id
                status_map = {
                    'Active': 1, 'Inactive': 2, 'Archived': 3,
                    'Terminated': 4, 'Resigned': 5, 'On Hold': 6, 'Pending': 7
                }
                if status_filter in status_map:
                    where_clause += " AND eed.status_id = %s"
                    params.append(status_map[status_filter])
            
            if company_id:
                where_clause += " AND eed.company_id = %s"
                params.append(company_id)
            if branch_id:
                where_clause += " AND eed.branch_id = %s"
                params.append(branch_id)
            if department_id:
                where_clause += " AND eed.department_id = %s"
                params.append(department_id)
            
            query = f"""
                SELECT 
                    epi.emp_id,
                    epi.first_name,
                    epi.last_name,
                    epi.personal_email,
                    epi.personal_phone,
                    epi.profile_photo,
                    eed.emp_code,
                    eed.work_email,
                    eed.official_phone,
                    eed.hire_date ,
                    eed.status_id,
                    s.status_name as status,
                    c.company_name,
                    b.branch_name,
                    d.department_name,
                    p.position_name,
                    r.role_name,
                    ea_curr.city as current_city,
                    ea_curr.state as current_state,
                    ea_curr.country as current_country
                FROM emp_personal_info epi
                JOIN emp_employment_details eed ON eed.emp_id = epi.emp_id
                LEFT JOIN companies c ON c.company_id = eed.company_id
                LEFT JOIN branches b ON b.branch_id = eed.branch_id
                LEFT JOIN departments d ON d.department_id = eed.department_id
                LEFT JOIN positions p ON p.position_id = eed.position_id
                LEFT JOIN roles r ON r.role_id = eed.role_id
                LEFT JOIN status s ON s.status_id = eed.status_id
                LEFT JOIN emp_addresses ea_curr ON ea_curr.emp_id = epi.emp_id 
                    AND ea_curr.address_type = 'Current'
                {where_clause}
                ORDER BY epi.created_at DESC
            """
            
            results = db.execute_query_all(query, tuple(params) if params else None)
            
            # Format employees
            employees = []
            for row in results:
                employee = {
                    'emp_id': row['emp_id'],
                    'employee_id': row['emp_id'],  # Add employee_id for frontend compatibility
                    'employee_code': row.get('emp_code'),
                    'first_name': row.get('first_name'),
                    'last_name': row.get('last_name'),
                    'personal_email': row.get('personal_email'),
                    'personal_phone': row.get('personal_phone'),
                    'profile_photo': row.get('profile_photo'),
                    'work_email': row.get('work_email'),
                    'official_phone': row.get('official_phone'),
                    'hire_date ': row.get('hire_date '),
                    'status_id': row.get('status_id'),
                    'status': row.get('status'),
                    'company_name': row.get('company_name'),  # Also add company_name for consistency
                    'company': row.get('company_name'),
                    'branch': row.get('branch_name'),
                    'department_name': row.get('department_name'),  # Also add department_name for consistency
                    'department': row.get('department_name'),
                    'designation': row.get('position_name'),
                    'role': row.get('role_name'),
                    'location': f"{row.get('current_city', '')}, {row.get('current_state', '')}, {row.get('current_country', '')}".strip(', ')
                }
                employees.append(employee)
            
            return employees
            
        except Exception as e:
            print(f"Error getting all employees: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    @staticmethod
    def update_employee(emp_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update employee across all tables"""
        try:
            # Check if employee exists
            if not EmployeeService.check_employee_exists(emp_id):
                raise ValueError(f"Employee with ID {emp_id} not found")
            
            current_time = datetime.utcnow()
            
            # 1. Update emp_personal_info
            personal_fields = ['first_name', 'last_name', 'gender', 'dob', 'nationality',
                             'marital_status', 'blood_group', 'personal_email', 'personal_phone',
                             'emergency_contact_name', 'emergency_contact_number', 'profile_photo']
            personal_updates = {k: v for k, v in update_data.items() if k in personal_fields and v is not None}
            
            if personal_updates:
                personal_updates['updated_at'] = current_time
                set_clauses = [f"{k} = %({k})s" for k in personal_updates.keys()]
                query = f"UPDATE emp_personal_info SET {', '.join(set_clauses)} WHERE emp_id = %(emp_id)s"
                personal_updates['emp_id'] = emp_id
                db.execute_update(query, personal_updates)
            
            # 2. Update emp_employment_details
            employment_fields = ['emp_code', 'company_id', 'branch_id', 'department_id', 'position_id',
                                'role_id', 'reports_to', 'employment_type', 'work_mode', 'job_title_id',
                                'hire_date ', 'confirmation_date', 'contract_end_date', 'probation_period',
                                'status_id', 'work_email', 'official_phone']
            employment_updates = {k: v for k, v in update_data.items() if k in employment_fields and v is not None}
            
            if employment_updates:
                employment_updates['updated_at'] = current_time
                set_clauses = [f"{k} = %({k})s" for k in employment_updates.keys()]
                query = f"UPDATE emp_employment_details SET {', '.join(set_clauses)} WHERE emp_id = %(emp_id)s"
                employment_updates['emp_id'] = emp_id
                db.execute_update(query, employment_updates)
            
            # 3. Handle addresses
            current_address_same_as_permanent = update_data.get('current_address_same_as_permanent', False)
            
            # Permanent address
            if any(k in update_data for k in ['permanent_address_line1', 'permanent_city', 'permanent_postal_code']):
                EmployeeService._update_employee_address(emp_id, 'Permanent', {
                    'address_line1': update_data.get('permanent_address_line1'),
                    'address_line2': update_data.get('permanent_address_line2'),
                    'city': update_data.get('permanent_city'),
                    'state': update_data.get('permanent_state'),
                    'country': update_data.get('permanent_country'),
                    'postal_code': update_data.get('permanent_postal_code')
                })
            
            # Current address
            if current_address_same_as_permanent:
                # Copy permanent to current
                permanent = EmployeeService._get_employee_address(emp_id, 'Permanent')
                if permanent:
                    EmployeeService._update_employee_address(emp_id, 'Current', {
                        'address_line1': permanent.get('address_line1'),
                        'address_line2': permanent.get('address_line2'),
                        'city': permanent.get('city'),
                        'state': permanent.get('state'),
                        'country': permanent.get('country'),
                        'postal_code': permanent.get('postal_code')
                    })
            elif any(k in update_data for k in ['current_address_line1', 'current_city', 'current_postal_code']):
                EmployeeService._update_employee_address(emp_id, 'Current', {
                    'address_line1': update_data.get('current_address_line1'),
                    'address_line2': update_data.get('current_address_line2'),
                    'city': update_data.get('current_city'),
                    'state': update_data.get('current_state'),
                    'country': update_data.get('current_country'),
                    'postal_code': update_data.get('current_postal_code')
                })
            
            # 4. Update emp_payroll_details
            payroll_fields = ['salary_type', 'basic_salary', 'allowances', 'bonuses', 'deductions',
                             'bank_name', 'account_holder_name', 'account_number', 'ifsc_swift_code',
                             'pan_tax_id', 'uan_pf_number', 'esic_number', 'payment_mode']
            payroll_updates = {k: v for k, v in update_data.items() if k in payroll_fields and v is not None}
            
            if payroll_updates:
                # Check if payroll record exists
                existing = db.execute_query_one(
                    "SELECT emp_payroll_id FROM emp_payroll_details WHERE emp_id = %s",
                    (emp_id,)
                )
                if existing:
                    payroll_updates['updated_at'] = current_time
                    set_clauses = [f"{k} = %({k})s" for k in payroll_updates.keys()]
                    query = f"UPDATE emp_payroll_details SET {', '.join(set_clauses)} WHERE emp_id = %(emp_id)s"
                    payroll_updates['emp_id'] = emp_id
                    db.execute_update(query, payroll_updates)
                else:
                    # Create new payroll record
                    payroll_updates['emp_id'] = emp_id
                    payroll_updates['created_at'] = current_time
                    payroll_updates['updated_at'] = current_time
                    query = """
                        INSERT INTO emp_payroll_details 
                        (emp_id, salary_type, basic_salary, allowances, bonuses, deductions,
                         bank_name, account_holder_name, account_number, ifsc_swift_code,
                         pan_tax_id, uan_pf_number, esic_number, payment_mode, created_at, updated_at)
                        VALUES (%(emp_id)s, %(salary_type)s, %(basic_salary)s, %(allowances)s,
                                %(bonuses)s, %(deductions)s, %(bank_name)s, %(account_holder_name)s,
                                %(account_number)s, %(ifsc_swift_code)s, %(pan_tax_id)s,
                                %(uan_pf_number)s, %(esic_number)s, %(payment_mode)s,
                                %(created_at)s, %(updated_at)s)
                    """
                    db.execute_insert(query, payroll_updates)
            
            # 5. Update emp_system_access
            system_fields = ['system_access_role_id', 'access_level', 'assigned_modules',
                           'system_email', 'account_status', 'two_factor_auth']
            system_updates = {k: v for k, v in update_data.items() if k in system_fields and v is not None}
            
            if system_updates:
                # Map system_access_role_id to role_id
                if 'system_access_role_id' in system_updates:
                    system_updates['role_id'] = system_updates.pop('system_access_role_id')
                
                existing = db.execute_query_one(
                    "SELECT emp_access_id FROM emp_system_access WHERE emp_id = %s",
                    (emp_id,)
                )
                if existing:
                    system_updates['updated_at'] = current_time
                    set_clauses = [f"{k} = %({k})s" for k in system_updates.keys()]
                    query = f"UPDATE emp_system_access SET {', '.join(set_clauses)} WHERE emp_id = %(emp_id)s"
                    system_updates['emp_id'] = emp_id
                    db.execute_update(query, system_updates)
                else:
                    system_updates['emp_id'] = emp_id
                    system_updates['created_at'] = current_time
                    system_updates['updated_at'] = current_time
                    query = """
                        INSERT INTO emp_system_access 
                        (emp_id, role_id, access_level, assigned_modules, system_email,
                         account_status, two_factor_auth, created_at, updated_at)
                        VALUES (%(emp_id)s, %(role_id)s, %(access_level)s, %(assigned_modules)s,
                                %(system_email)s, %(account_status)s, %(two_factor_auth)s,
                                %(created_at)s, %(updated_at)s)
                    """
                    db.execute_insert(query, system_updates)
            
            # 6. Update emp_documents
            document_fields = ['resume_cv', 'offer_letter', 'joining_letter', 'nda_agreement',
                             'id_proof', 'address_proof', 'experience_certificate',
                             'qualification_certificate', 'work_visa_permit', 'insurance_policy_no']
            document_updates = {k: v for k, v in update_data.items() if k in document_fields and v is not None}
            
            if document_updates:
                existing = db.execute_query_one(
                    "SELECT emp_doc_id FROM emp_documents WHERE emp_id = %s",
                    (emp_id,)
                )
                if existing:
                    document_updates['updated_at'] = current_time
                    set_clauses = [f"{k} = %({k})s" for k in document_updates.keys()]
                    query = f"UPDATE emp_documents SET {', '.join(set_clauses)} WHERE emp_id = %(emp_id)s"
                    document_updates['emp_id'] = emp_id
                    db.execute_update(query, document_updates)
                else:
                    document_updates['emp_id'] = emp_id
                    document_updates['created_at'] = current_time
                    document_updates['updated_at'] = current_time
                    query = """
                        INSERT INTO emp_documents 
                        (emp_id, resume_cv, offer_letter, joining_letter, nda_agreement,
                         id_proof, address_proof, experience_certificate, qualification_certificate,
                         work_visa_permit, insurance_policy_no, created_at, updated_at)
                        VALUES (%(emp_id)s, %(resume_cv)s, %(offer_letter)s, %(joining_letter)s,
                                %(nda_agreement)s, %(id_proof)s, %(address_proof)s,
                                %(experience_certificate)s, %(qualification_certificate)s,
                                %(work_visa_permit)s, %(insurance_policy_no)s,
                                %(created_at)s, %(updated_at)s)
                    """
                    db.execute_insert(query, document_updates)
            
            # 7. Update emp_additional_info
            additional_fields = ['skills', 'certifications', 'linkedin_profile', 'github_portfolio',
                               'languages_known', 'notes_remarks', 'created_by']
            additional_updates = {k: v for k, v in update_data.items() if k in additional_fields and v is not None}
            
            if additional_updates:
                existing = db.execute_query_one(
                    "SELECT emp_additional_id FROM emp_additional_info WHERE emp_id = %s",
                    (emp_id,)
                )
                if existing:
                    additional_updates['updated_at'] = current_time
                    set_clauses = [f"{k} = %({k})s" for k in additional_updates.keys()]
                    query = f"UPDATE emp_additional_info SET {', '.join(set_clauses)} WHERE emp_id = %(emp_id)s"
                    additional_updates['emp_id'] = emp_id
                    db.execute_update(query, additional_updates)
                else:
                    additional_updates['emp_id'] = emp_id
                    additional_updates['created_at'] = current_time
                    additional_updates['updated_at'] = current_time
                    query = """
                        INSERT INTO emp_additional_info 
                        (emp_id, skills, certifications, linkedin_profile, github_portfolio,
                         languages_known, notes_remarks, created_by, created_at, updated_at)
                        VALUES (%(emp_id)s, %(skills)s, %(certifications)s, %(linkedin_profile)s,
                                %(github_portfolio)s, %(languages_known)s, %(notes_remarks)s,
                                %(created_by)s, %(created_at)s, %(updated_at)s)
                    """
                    db.execute_insert(query, additional_updates)
            
            return EmployeeService.get_employee_by_id(emp_id)
            
        except Exception as e:
            print(f"Error updating employee: {e}")
            import traceback
            traceback.print_exc()
            raise e
    
    @staticmethod
    def delete_employee(emp_id: int) -> bool:
        """Soft delete an employee (set status_id to Terminated or Archived)"""
        try:
            if not EmployeeService.check_employee_exists(emp_id):
                raise ValueError(f"Employee with ID {emp_id} not found")
            
            # Set status_id to 4 (Terminated)
            query = "UPDATE emp_employment_details SET status_id = %s, updated_at = %s WHERE emp_id = %s"
            db.execute_update(query, (4, datetime.utcnow(), emp_id))
            return True
            
        except Exception as e:
            print(f"Error deleting employee: {e}")
            raise e
    
    @staticmethod
    def reinstate_employee(emp_id: int) -> bool:
        """Reinstate an employee (set status_id to Active)"""
        try:
            if not EmployeeService.check_employee_exists(emp_id):
                raise ValueError(f"Employee with ID {emp_id} not found")
            
            query = "UPDATE emp_employment_details SET status_id = %s, updated_at = %s WHERE emp_id = %s"
            db.execute_update(query, (1, datetime.utcnow(), emp_id))
            return True
            
        except Exception as e:
            print(f"Error reinstating employee: {e}")
            raise e
    
    @staticmethod
    def check_employee_exists(emp_id: int) -> bool:
        """Check if employee exists"""
        try:
            query = "SELECT 1 FROM emp_personal_info WHERE emp_id = %s"
            result = db.execute_query_one(query, (emp_id,))
            return result is not None
        except Exception as e:
            print(f"Error checking employee existence: {e}")
            return False
    
    @staticmethod
    def save_tab_data(tab_id: str, tab_data: Dict[str, Any], emp_id: Optional[int] = None) -> Dict[str, Any]:
        """Save data for a specific tab progressively"""
        try:
            current_time = datetime.utcnow()
            
            if tab_id == 'personal':
                # Create or update personal info
                if emp_id:
                    # Update existing
                    update_query = """
                        UPDATE emp_personal_info 
                        SET first_name = %s, last_name = %s, gender = %s, dob = %s,
                            nationality = %s, marital_status = %s, blood_group = %s,
                            personal_email = %s, personal_phone = %s, emergency_contact_name = %s,
                            emergency_contact_number = %s, profile_photo = %s, updated_at = %s
                        WHERE emp_id = %s
                    """
                    db.execute_update(update_query, (
                        tab_data.get('first_name'), tab_data.get('last_name'), tab_data.get('gender'),
                        tab_data.get('dob'), tab_data.get('nationality'), tab_data.get('marital_status'),
                        tab_data.get('blood_group'), tab_data.get('personal_email'), tab_data.get('personal_phone'),
                        tab_data.get('emergency_contact_name'), tab_data.get('emergency_contact_number'),
                        tab_data.get('profile_photo'), current_time, emp_id
                    ))
                    return {"emp_id": emp_id, "message": "Personal info updated"}
                else:
                    # Create new
                    insert_query = """
                        INSERT INTO emp_personal_info 
                        (first_name, last_name, gender, dob, nationality, marital_status,
                         blood_group, personal_email, personal_phone, emergency_contact_name,
                         emergency_contact_number, profile_photo, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    new_emp_id = db.execute_insert(insert_query, (
                        tab_data.get('first_name'), tab_data.get('last_name'), tab_data.get('gender'),
                        tab_data.get('dob'), tab_data.get('nationality'), tab_data.get('marital_status'),
                        tab_data.get('blood_group'), tab_data.get('personal_email'), tab_data.get('personal_phone'),
                        tab_data.get('emergency_contact_name'), tab_data.get('emergency_contact_number'),
                        tab_data.get('profile_photo'), current_time, current_time
                    ))
                    return {"emp_id": new_emp_id, "message": "Personal info created"}
            
            elif tab_id == 'address':
                if not emp_id:
                    raise ValueError("Employee ID is required for address tab")
                
                # Handle permanent address
                EmployeeService._create_or_update_address(emp_id, {
                    'address_line1': tab_data.get('permanent_address_line1'),
                    'address_line2': tab_data.get('permanent_address_line2'),
                    'city': tab_data.get('permanent_city'),
                    'state': tab_data.get('permanent_state'),
                    'country': tab_data.get('permanent_country'),
                    'postal_code': tab_data.get('permanent_zip_code') or tab_data.get('permanent_postal_code'),
                    'address_type': 'Permanent'
                })
                
                # Handle current address
                if tab_data.get('current_address_same_as_permanent') == 'true' or tab_data.get('current_address_same_as_permanent') == True:
                    # Copy permanent to current
                    EmployeeService._create_or_update_address(emp_id, {
                        'address_line1': tab_data.get('permanent_address_line1'),
                        'address_line2': tab_data.get('permanent_address_line2'),
                        'city': tab_data.get('permanent_city'),
                        'state': tab_data.get('permanent_state'),
                        'country': tab_data.get('permanent_country'),
                        'postal_code': tab_data.get('permanent_zip_code') or tab_data.get('permanent_postal_code'),
                        'address_type': 'Current'
                    })
                else:
                    EmployeeService._create_or_update_address(emp_id, {
                        'address_line1': tab_data.get('current_address_line1'),
                        'address_line2': tab_data.get('current_address_line2'),
                        'city': tab_data.get('current_city'),
                        'state': tab_data.get('current_state'),
                        'country': tab_data.get('current_country'),
                        'postal_code': tab_data.get('current_zip_code') or tab_data.get('current_postal_code'),
                        'address_type': 'Current'
                    })
                
                return {"emp_id": emp_id, "message": "Address saved"}
            
            elif tab_id == 'employment':
                if not emp_id:
                    raise ValueError("Employee ID is required for employment tab")
                
                # Check if employment details exist
                existing = db.execute_query_one(
                    "SELECT emp_id FROM emp_employment_details WHERE emp_id = %s", (emp_id,)
                )
                
                if existing:
                    # Update
                    update_query = """
                        UPDATE emp_employment_details 
                        SET emp_code = %s, company_id = %s, branch_id = %s, department_id = %s,
                            position_id = %s, role_id = %s, reports_to = %s, employment_type = %s,
                            work_mode = %s, job_title_id = %s, hire_date  = %s, confirmation_date = %s,
                            contract_end_date = %s, probation_period = %s, status_id = %s,
                            work_email = %s, official_phone = %s, updated_at = %s
                        WHERE emp_id = %s
                    """
                    db.execute_update(update_query, (
                        tab_data.get('emp_code'), tab_data.get('company_id'), tab_data.get('branch_id'),
                        tab_data.get('department_id'), tab_data.get('position_id'), tab_data.get('role_id'),
                        tab_data.get('reports_to'), tab_data.get('employment_type'), tab_data.get('work_mode'),
                        tab_data.get('job_title_id'), tab_data.get('hire_date '), tab_data.get('confirmation_date'),
                        tab_data.get('contract_end_date'), tab_data.get('probation_period'), tab_data.get('status_id', 7),
                        tab_data.get('work_email'), tab_data.get('official_phone'), current_time, emp_id
                    ))
                else:
                    # Create
                    insert_query = """
                        INSERT INTO emp_employment_details 
                        (emp_id, emp_code, company_id, branch_id, department_id, position_id, role_id,
                         reports_to, employment_type, work_mode, job_title_id, hire_date , confirmation_date,
                         contract_end_date, probation_period, status_id, work_email, official_phone, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    db.execute_insert(insert_query, (
                        emp_id, tab_data.get('emp_code'), tab_data.get('company_id'), tab_data.get('branch_id'),
                        tab_data.get('department_id'), tab_data.get('position_id'), tab_data.get('role_id'),
                        tab_data.get('reports_to'), tab_data.get('employment_type'), tab_data.get('work_mode'),
                        tab_data.get('job_title_id'), tab_data.get('hire_date '), tab_data.get('confirmation_date'),
                        tab_data.get('contract_end_date'), tab_data.get('probation_period'), tab_data.get('status_id', 7),
                        tab_data.get('work_email'), tab_data.get('official_phone'), current_time, current_time
                    ))
                
                return {"emp_id": emp_id, "message": "Employment details saved"}
            
            elif tab_id == 'payroll':
                if not emp_id:
                    raise ValueError("Employee ID is required for payroll tab")
                
                existing = db.execute_query_one(
                    "SELECT emp_id FROM emp_payroll_details WHERE emp_id = %s", (emp_id,)
                )
                
                if existing:
                    update_query = """
                        UPDATE emp_payroll_details 
                        SET salary_type = %s, basic_salary = %s, allowances = %s, bonuses = %s,
                            deductions = %s, bank_name = %s, account_holder_name = %s, account_number = %s,
                            ifsc_swift_code = %s, pan_tax_id = %s, uan_pf_number = %s, esic_number = %s,
                            payment_mode = %s, updated_at = %s
                        WHERE emp_id = %s
                    """
                    db.execute_update(update_query, (
                        tab_data.get('salary_type'), tab_data.get('basic_salary'), tab_data.get('allowances'),
                        tab_data.get('bonuses'), tab_data.get('deductions'), tab_data.get('bank_name'),
                        tab_data.get('account_holder_name'), tab_data.get('account_number'),
                        tab_data.get('ifsc_swift_code'), tab_data.get('pan_tax_id'), tab_data.get('uan_pf_number'),
                        tab_data.get('esic_number'), tab_data.get('payment_mode'), current_time, emp_id
                    ))
                else:
                    insert_query = """
                        INSERT INTO emp_payroll_details 
                        (emp_id, salary_type, basic_salary, allowances, bonuses, deductions,
                         bank_name, account_holder_name, account_number, ifsc_swift_code,
                         pan_tax_id, uan_pf_number, esic_number, payment_mode, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    db.execute_insert(insert_query, (
                        emp_id, tab_data.get('salary_type'), tab_data.get('basic_salary'),
                        tab_data.get('allowances'), tab_data.get('bonuses'), tab_data.get('deductions'),
                        tab_data.get('bank_name'), tab_data.get('account_holder_name'), tab_data.get('account_number'),
                        tab_data.get('ifsc_swift_code'), tab_data.get('pan_tax_id'), tab_data.get('uan_pf_number'),
                        tab_data.get('esic_number'), tab_data.get('payment_mode'), current_time, current_time
                    ))
                
                return {"emp_id": emp_id, "message": "Payroll details saved"}
            
            elif tab_id == 'system':
                if not emp_id:
                    raise ValueError("Employee ID is required for system access tab")
                
                # Save system access
                existing = db.execute_query_one(
                    "SELECT emp_id FROM emp_system_access WHERE emp_id = %s", (emp_id,)
                )
                
                if existing:
                    update_query = """
                        UPDATE emp_system_access 
                        SET role_id = %s, access_level = %s, assigned_modules = %s,
                            system_email = %s, account_status = %s, two_factor_auth = %s, updated_at = %s
                        WHERE emp_id = %s
                    """
                    db.execute_update(update_query, (
                        tab_data.get('system_access_role_id'), tab_data.get('access_level'),
                        tab_data.get('assigned_modules'), tab_data.get('system_email'),
                        tab_data.get('account_status'), tab_data.get('two_factor_auth', False),
                        current_time, emp_id
                    ))
                else:
                    insert_query = """
                        INSERT INTO emp_system_access 
                        (emp_id, role_id, access_level, assigned_modules, system_email,
                         account_status, two_factor_auth, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    db.execute_insert(insert_query, (
                        emp_id, tab_data.get('system_access_role_id'), tab_data.get('access_level'),
                        tab_data.get('assigned_modules'), tab_data.get('system_email'),
                        tab_data.get('account_status'), tab_data.get('two_factor_auth', False),
                        current_time, current_time
                    ))
                
                # Create user account if username and password provided
                if tab_data.get('username') and tab_data.get('password'):
                    # Check if user already exists
                    existing_user = db.execute_query_one(
                        "SELECT user_id FROM ac_users WHERE username = %s",
                        (tab_data.get('username'),)
                    )
                    if existing_user:
                        raise ValueError(f"Username '{tab_data.get('username')}' already exists")
                    
                    # Hash password
                    hashed_password = AuthService.get_password_hash(tab_data.get('password'))
                    
                    # Use system_email if provided, otherwise use work_email
                    user_email = tab_data.get('system_email') or tab_data.get('work_email')
                    
                    # Create user account
                    user_query = """
                        INSERT INTO ac_users (emp_id, username, password_hash, email, status_id)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    db.execute_insert(user_query, (
                        emp_id, tab_data.get('username'), hashed_password, user_email, 1
                    ))
                
                return {"emp_id": emp_id, "message": "System access saved"}
            
            elif tab_id == 'documents':
                if not emp_id:
                    raise ValueError("Employee ID is required for documents tab")
                
                existing = db.execute_query_one(
                    "SELECT emp_id FROM emp_documents WHERE emp_id = %s", (emp_id,)
                )
                
                if existing:
                    update_query = """
                        UPDATE emp_documents 
                        SET resume_cv = %s, offer_letter = %s, joining_letter = %s,
                            nda_agreement = %s, id_proof = %s, address_proof = %s,
                            experience_certificate = %s, qualification_certificate = %s,
                            work_visa_permit = %s, insurance_policy_no = %s, updated_at = %s
                        WHERE emp_id = %s
                    """
                    db.execute_update(update_query, (
                        tab_data.get('resume_cv'), tab_data.get('offer_letter'), tab_data.get('joining_letter'),
                        tab_data.get('nda_agreement'), tab_data.get('id_proof'), tab_data.get('address_proof'),
                        tab_data.get('experience_certificate'), tab_data.get('qualification_certificate'),
                        tab_data.get('work_visa_permit'), tab_data.get('insurance_policy_no'), current_time, emp_id
                    ))
                else:
                    insert_query = """
                        INSERT INTO emp_documents 
                        (emp_id, resume_cv, offer_letter, joining_letter, nda_agreement,
                         id_proof, address_proof, experience_certificate, qualification_certificate,
                         work_visa_permit, insurance_policy_no, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    db.execute_insert(insert_query, (
                        emp_id, tab_data.get('resume_cv'), tab_data.get('offer_letter'),
                        tab_data.get('joining_letter'), tab_data.get('nda_agreement'),
                        tab_data.get('id_proof'), tab_data.get('address_proof'),
                        tab_data.get('experience_certificate'), tab_data.get('qualification_certificate'),
                        tab_data.get('work_visa_permit'), tab_data.get('insurance_policy_no'),
                        current_time, current_time
                    ))
                
                return {"emp_id": emp_id, "message": "Documents saved"}
            
            elif tab_id == 'additional':
                if not emp_id:
                    raise ValueError("Employee ID is required for additional info tab")
                
                existing = db.execute_query_one(
                    "SELECT emp_id FROM emp_additional_info WHERE emp_id = %s", (emp_id,)
                )
                
                if existing:
                    update_query = """
                        UPDATE emp_additional_info 
                        SET skills = %s, certifications = %s, linkedin_profile = %s,
                            github_portfolio = %s, languages_known = %s, notes_remarks = %s,
                            created_by = %s, updated_at = %s
                        WHERE emp_id = %s
                    """
                    db.execute_update(update_query, (
                        tab_data.get('skills'), tab_data.get('certifications'), tab_data.get('linkedin_profile'),
                        tab_data.get('github_portfolio'), tab_data.get('languages_known'), tab_data.get('notes_remarks'),
                        tab_data.get('created_by'), current_time, emp_id
                    ))
                else:
                    insert_query = """
                        INSERT INTO emp_additional_info 
                        (emp_id, skills, certifications, linkedin_profile, github_portfolio,
                         languages_known, notes_remarks, created_by, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    db.execute_insert(insert_query, (
                        emp_id, tab_data.get('skills'), tab_data.get('certifications'),
                        tab_data.get('linkedin_profile'), tab_data.get('github_portfolio'),
                        tab_data.get('languages_known'), tab_data.get('notes_remarks'),
                        tab_data.get('created_by'), current_time, current_time
                    ))
                
                return {"emp_id": emp_id, "message": "Additional info saved"}
            
            else:
                raise ValueError(f"Unknown tab_id: {tab_id}")
                
        except Exception as e:
            print(f"Error saving tab {tab_id}: {e}")
            raise e
    
    @staticmethod
    def _create_or_update_address(emp_id: int, address_data: Dict[str, Any]):
        """Helper method to create or update employee address"""
        try:
            address_type = address_data.get('address_type')
            current_time = datetime.utcnow()
            
            # Check if address exists
            existing = db.execute_query_one(
                "SELECT address_id FROM emp_addresses WHERE emp_id = %s AND address_type = %s",
                (emp_id, address_type)
            )
            
            if existing:
                # Update existing address
                update_query = """
                    UPDATE emp_addresses 
                    SET address_line1 = %s, address_line2 = %s, city = %s, state = %s,
                        country = %s, postal_code = %s, updated_at = %s
                    WHERE emp_id = %s AND address_type = %s
                """
                db.execute_update(update_query, (
                    address_data.get('address_line1'),
                    address_data.get('address_line2'),
                    address_data.get('city'),
                    address_data.get('state'),
                    address_data.get('country'),
                    address_data.get('postal_code'),
                    current_time,
                    emp_id,
                    address_type
                ))
            else:
                # Create new address
                insert_query = """
                    INSERT INTO emp_addresses 
                    (emp_id, address_line1, address_line2, city, state, country, 
                     postal_code, address_type, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                db.execute_insert(insert_query, (
                    emp_id,
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
            print(f"Error creating/updating employee address: {e}")
            raise e

    @staticmethod
    def _create_employee_address(emp_id: int, address_data: Dict[str, Any]):
        """Helper method to create employee address"""
        try:
            query = """
                INSERT INTO emp_addresses 
                (emp_id, address_line1, address_line2, city, state, country, 
                 postal_code, address_type, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            current_time = datetime.utcnow()
            db.execute_insert(query, (
                emp_id,
                address_data.get('address_line1'),
                address_data.get('address_line2'),
                address_data.get('city'),
                address_data.get('state'),
                address_data.get('country'),
                address_data.get('postal_code'),
                address_data.get('address_type'),
                current_time,
                current_time
            ))
        except Exception as e:
            print(f"Error creating employee address: {e}")
            raise e
    
    @staticmethod
    def _update_employee_address(emp_id: int, address_type: str, address_data: Dict[str, Any]):
        """Helper method to update employee address"""
        try:
            # Check if address exists
            existing = EmployeeService._get_employee_address(emp_id, address_type)
            
            if existing:
                # Update existing address
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
                    params.append(emp_id)
                    params.append(address_type)
                    
                    query = f"""
                        UPDATE emp_addresses 
                        SET {', '.join(set_clauses)} 
                        WHERE emp_id = %s AND address_type = %s
                    """
                    db.execute_update(query, tuple(params))
            else:
                # Create new address
                address_data['address_type'] = address_type
                EmployeeService._create_employee_address(emp_id, address_data)
                
        except Exception as e:
            print(f"Error updating employee address: {e}")
            raise e
    
    @staticmethod
    def _get_employee_address(emp_id: int, address_type: str) -> Optional[Dict[str, Any]]:
        """Get employee address by type"""
        try:
            query = """
                SELECT address_line1, address_line2, city, state, country, postal_code
                FROM emp_addresses
                WHERE emp_id = %s AND address_type = %s
                LIMIT 1
            """
            return db.execute_query_one(query, (emp_id, address_type))
        except Exception as e:
            print(f"Error getting employee address: {e}")
            return None

