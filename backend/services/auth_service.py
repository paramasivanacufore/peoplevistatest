import os
import secrets
import hashlib
import threading
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from passlib.context import CryptContext
from passlib.hash import bcrypt
import requests
from dotenv import load_dotenv
from database import db

# Load environment variables
load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Session Configuration
SESSION_EXPIRE_HOURS = int(os.getenv("SESSION_EXPIRE_HOURS", "24"))
REMEMBER_ME_EXPIRE_DAYS = int(os.getenv("REMEMBER_ME_EXPIRE_DAYS", "30"))
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", secrets.token_urlsafe(32))

# In-memory session storage
session_storage: Dict[str, Dict[str, Any]] = {}
session_lock = threading.Lock()

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY", "6LcxlowrAAAAAMKpclHOOdIQfSzjoiqLMNBc5ZWx")
RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"

# Rate limiting storage (in production, use Redis)
rate_limit_storage: Dict[str, Dict[str, Any]] = {}
MAX_LOGIN_ATTEMPTS = 5
RATE_LIMIT_WINDOW = 900  # 15 minutes

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            # Try bcrypt first (new format)
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            # If bcrypt fails, try SHA-256 (legacy format)
            import hashlib
            sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest()
            return sha256_hash == hashed_password
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_recaptcha(token: str) -> bool:
        """Verify reCAPTCHA token with Google"""
        try:
            response = requests.post(
                RECAPTCHA_VERIFY_URL,
                data={
                    'secret': RECAPTCHA_SECRET_KEY,
                    'response': token
                },
                timeout=10
            )
            result = response.json()
            return result.get('success', False)
        except Exception as e:
            print(f"reCAPTCHA verification error: {e}")
            return False
    
    @staticmethod
    def check_rate_limit(ip_address: str) -> Tuple[bool, Optional[int]]:
        """Check if IP is rate limited"""
        current_time = datetime.now(timezone.utc)
        
        if ip_address not in rate_limit_storage:
            rate_limit_storage[ip_address] = {
                'attempts': 0,
                'first_attempt': current_time,
                'blocked_until': None
            }
            return True, None
        
        ip_data = rate_limit_storage[ip_address]
        
        # Check if still blocked
        if ip_data['blocked_until'] and current_time < ip_data['blocked_until']:
            remaining_time = int((ip_data['blocked_until'] - current_time).total_seconds())
            return False, remaining_time
        
        # Reset if window has passed
        if current_time - ip_data['first_attempt'] > timedelta(seconds=RATE_LIMIT_WINDOW):
            ip_data['attempts'] = 0
            ip_data['first_attempt'] = current_time
            ip_data['blocked_until'] = None
            return True, None
        
        return True, None
    
    @staticmethod
    def increment_rate_limit(ip_address: str):
        """Increment rate limit counter"""
        current_time = datetime.now(timezone.utc)
        
        if ip_address not in rate_limit_storage:
            rate_limit_storage[ip_address] = {
                'attempts': 0,
                'first_attempt': current_time,
                'blocked_until': None
            }
        
        ip_data = rate_limit_storage[ip_address]
        ip_data['attempts'] += 1
        
        # Block if too many attempts
        if ip_data['attempts'] >= MAX_LOGIN_ATTEMPTS:
            ip_data['blocked_until'] = current_time + timedelta(seconds=RATE_LIMIT_WINDOW)
    
    @staticmethod
    def reset_rate_limit(ip_address: str):
        """Reset rate limit for IP"""
        if ip_address in rate_limit_storage:
            rate_limit_storage[ip_address] = {
                'attempts': 0,
                'first_attempt': datetime.now(timezone.utc),
                'blocked_until': None
            }
    
    @staticmethod
    def create_session(user_data: Dict[str, Any], remember_me: bool = False, permissions: Dict[str, Any] = None, role_levels: list = None) -> str:
        """Create a new session with user data (only user_id and username stored, permissions fetched on-demand)"""
        try:
            with session_lock:
                session_id = secrets.token_urlsafe(32)
                
                # Set expiry based on remember_me
                if remember_me:
                    expires_at = datetime.now(timezone.utc) + timedelta(days=REMEMBER_ME_EXPIRE_DAYS)
                else:
                    expires_at = datetime.now(timezone.utc) + timedelta(hours=SESSION_EXPIRE_HOURS)
                
                # Store the provided user_data in session so callers can access employee_id and other fields
                # Keep the shape flexible: callers may pass additional keys (employee_id, role_id, etc.)
                session_data = user_data.copy() if isinstance(user_data, dict) else {"user_id": user_data}
                
                session_storage[session_id] = {
                    'user_data': session_data,
                    'created_at': datetime.now(timezone.utc),
                    'expires_at': expires_at,
                    'last_activity': datetime.now(timezone.utc),
                    'remember_me': remember_me
                }
                
                print(f"AuthService - Session created for user {user_data.get('username', 'unknown')}: {session_id[:8]}... (Remember me: {remember_me})")
                print(f"AuthService - Total sessions after creation: {len(session_storage)}")
                print(f"AuthService - Session ID stored: {session_id}")
                print(f"AuthService - Session storage keys: {list(session_storage.keys())[:3] if len(session_storage) > 0 else 'EMPTY'}")
                
                # Verify session was actually stored
                if session_id not in session_storage:
                    print(f"ERROR: Session {session_id[:8]}... was NOT stored in session_storage!")
                    return None
                
                return session_id
        except Exception as e:
            print(f"Error creating session: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def verify_session(session_id: str, renew_session: bool = True) -> Optional[Dict[str, Any]]:
        """Verify session and return user data, optionally renew session"""
        try:
            with session_lock:
                print(f"AuthService - Verifying session: {session_id[:8]}...")
                print(f"AuthService - Total sessions in storage: {len(session_storage)}")
                print(f"AuthService - Session keys: {list(session_storage.keys())[:3] if len(session_storage) > 0 else 'EMPTY'}...")
                
                if session_id not in session_storage:
                    print(f"AuthService - Session not found in storage")
                    print(f"AuthService - This usually happens when:")
                    print(f"   1. The server restarted (auto-reload on code changes)")
                    print(f"   2. The session expired")
                    print(f"   3. The session was never created")
                    print(f"AuthService - Looking for session ID: {session_id}")
                    print(f"AuthService - Available session IDs: {[k[:8] + '...' for k in list(session_storage.keys())[:5]]}")
                    return None
                
                session_data = session_storage[session_id]
                current_time = datetime.now(timezone.utc)
                
                # Check if session expired
                if current_time > session_data['expires_at']:
                    del session_storage[session_id]
                    print(f"Session expired: {session_id[:8]}...")
                    return None
                
                # Update last activity
                session_data['last_activity'] = current_time
                
                # Renew session if requested and not expired
                if renew_session:
                    if session_data.get('remember_me', False):
                        # For remember me sessions, extend by 30 days
                        session_data['expires_at'] = current_time + timedelta(days=REMEMBER_ME_EXPIRE_DAYS)
                    else:
                        # For regular sessions, extend by 24 hours
                        session_data['expires_at'] = current_time + timedelta(hours=SESSION_EXPIRE_HOURS)
                    
                    print(f"Session renewed for {session_id[:8]}... (Remember me: {session_data.get('remember_me', False)})")
                
                return session_data['user_data']
        except Exception as e:
            print(f"Error verifying session: {e}")
            return None
    
    @staticmethod
    def destroy_session(session_id: str) -> bool:
        """Destroy a session"""
        try:
            with session_lock:
                if session_id in session_storage:
                    del session_storage[session_id]
                    print(f"Session destroyed: {session_id[:8]}...")
                    return True
                return False
        except Exception as e:
            print(f"Error destroying session: {e}")
            return False
    
    @staticmethod
    def cleanup_expired_sessions():
        """Clean up expired sessions"""
        try:
            with session_lock:
                current_time = datetime.now(timezone.utc)
                expired_sessions = []
                
                for session_id, session_data in session_storage.items():
                    if current_time > session_data['expires_at']:
                        expired_sessions.append(session_id)
                
                for session_id in expired_sessions:
                    del session_storage[session_id]
                
                if expired_sessions:
                    print(f"Cleaned up {len(expired_sessions)} expired sessions")
        except Exception as e:
            print(f"Error cleaning up sessions: {e}")
    
    @staticmethod
    def get_session_expiry(session_id: str) -> Optional[datetime]:
        """Get session expiry time"""
        try:
            with session_lock:
                if session_id not in session_storage:
                    return None
                return session_storage[session_id]['expires_at']
        except Exception as e:
            print(f"Error getting session expiry: {e}")
            return None
    
    @staticmethod
    def get_session_stats() -> Dict[str, Any]:
        """Get session storage statistics"""
        with session_lock:
            current_time = datetime.now(timezone.utc)
            total_sessions = len(session_storage)
            active_sessions = 0
            expired_sessions = 0
            remember_me_sessions = 0
            
            for session_data in session_storage.values():
                if current_time > session_data['expires_at']:
                    expired_sessions += 1
                else:
                    active_sessions += 1
                    if session_data.get('remember_me', False):
                        remember_me_sessions += 1
            
            return {
                'total_sessions': total_sessions,
                'active_sessions': active_sessions,
                'expired_sessions': expired_sessions,
                'remember_me_sessions': remember_me_sessions
            }
    
    @staticmethod
    def get_user_by_login(login: str) -> Optional[Dict[str, Any]]:
        """Get user by username or email"""
        try:
            print(f"Database query: Looking for user with login: {login}")
            result = db.execute_query_one(
                """
                SELECT 
                    u.user_id,
                    u.employee_id,
                    u.username,
                    u.email,
                    u.password_hash,
                    e.first_name,
                    e.last_name,
                    u.created_at,

                    dr.role_level,
                    r.role_id,
                    r.role_name,
                    p.position_name

                FROM ac_users u
                JOIN emp_employee e 
                    ON u.employee_id = e.employee_id

                LEFT JOIN department_roles dr
                    ON dr.employee_id = u.employee_id

                LEFT JOIN roles r
                    ON r.role_level = dr.role_level

                LEFT JOIN positions p
                    ON p.position_id = e.position_id

                WHERE (u.username = %s OR u.email = %s);

                """,
                (login, login)
            )
            print(f"Database query result: {result}")
            return result
        except Exception as e:
            print(f"Database error in get_user_by_login: {e}")
            raise
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by user_id (clean new schema version)"""
        return db.execute_query_one(
            """
            SELECT 
                u.user_id,
                u.employee_id,
                u.username,
                u.email,
                u.created_at,
                e.first_name,
                e.last_name,

                dr.role_level,
                r.role_id,
                r.role_name,
                p.position_name

            FROM ac_users u
            JOIN emp_employee e 
                ON u.employee_id = e.employee_id

            LEFT JOIN department_roles dr
                ON dr.employee_id = u.employee_id

            LEFT JOIN roles r
                ON r.role_level = dr.role_level

            LEFT JOIN positions p
                ON p.position_id = e.position_id

            WHERE u.user_id = %s
            LIMIT 1;
            """,
            (user_id,)
        )

    
    @staticmethod
    def get_user_permissions(employee_id: int) -> Tuple[Dict[str, Any], list]:
        """Get user permissions including scoped permissions."""

        try:
            # ----------------------------------------------------------
            # 1️⃣ Get department roles for employee
            # ----------------------------------------------------------
            dept_roles = db.execute_query_all(
                """
                SELECT 
                    dr.role_level,
                    dr.department_id,
                    d.department_name
                FROM department_roles dr
                JOIN departments d 
                    ON dr.department_id = d.department_id
                WHERE dr.employee_id = %s
                """,
                (employee_id,)
            )

            if not dept_roles:
                return {}, []

            role_levels = [r["role_level"] for r in dept_roles]
            department_ids = [r["department_id"] for r in dept_roles]

            # ----------------------------------------------------------
            # 🔹 Get employee branch
            # ----------------------------------------------------------
            branch_row = db.execute_query_one(
                "SELECT branch_id FROM emp_employee WHERE employee_id = %s",
                (employee_id,)
            )
            branch_id = branch_row["branch_id"] if branch_row else None

            # ----------------------------------------------------------
            # 2️⃣ Convert role_levels → role_ids
            # ----------------------------------------------------------
            placeholders = ",".join(["%s"] * len(role_levels))
            roles_data = db.execute_query_all(
                f"""
                SELECT role_id, role_level
                FROM roles
                WHERE role_level IN ({placeholders})
                """,
                role_levels
            )

            role_ids = [r["role_id"] for r in roles_data]

            if not role_ids:
                return {}, role_levels

            # ----------------------------------------------------------
            # 3️⃣ Base permissions for each role (role_permissions)
            # ----------------------------------------------------------
            rp_placeholders = ",".join(["%s"] * len(role_ids))
            base_permissions = db.execute_query_all(
                f"""
                SELECT
                    rp.id AS role_permission_id,
                    rp.role_id,

                    p.id AS permission_id,
                    p.permission_key,
                    p.description AS permission_description,
                    p.permission_type,
                    p.parent_permission_id,
                    p.show_in_menu,

                    m.id AS module_id,
                    m.module_key,
                    m.name AS module_name,
                    m.description AS module_description,

                    rp.allowed,
                    'GLOBAL' AS scope_type
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.id
                JOIN modules m ON p.module_id = m.id
                WHERE rp.role_id IN ({rp_placeholders})
                """,
                role_ids
            )

            # ----------------------------------------------------------
            # 4️⃣ Scoped permissions from role_permission_scope
            # ----------------------------------------------------------
            scoped_permissions = []

            # ---- A: Department scoped permissions ----
            if department_ids:
                dept_placeholders = ",".join(["%s"] * len(department_ids))
                dept_scoped = db.execute_query_all(
                    f"""
                    SELECT 
                        rps.role_permission_id,
                        rps.department_id,
                        rps.scope_type,

                        p.id AS permission_id,
                        p.permission_key,
                        p.description AS permission_description,
                        p.permission_type,
                        p.parent_permission_id,
                        p.show_in_menu,

                        m.id AS module_id,
                        m.module_key,
                        m.name AS module_name,
                        m.description AS module_description,

                        rp.allowed
                    FROM role_permission_scope rps
                    JOIN role_permissions rp ON rps.role_permission_id = rp.id
                    JOIN permissions p ON rp.permission_id = p.id
                    JOIN modules m ON p.module_id = m.id
                    WHERE rps.department_id IN ({dept_placeholders})
                    """,
                    department_ids
                )

                scoped_permissions += dept_scoped

            # ---- 🔹 B: Branch scoped permissions (ADDED) ----
            if branch_id:
                branch_scoped = db.execute_query_all(
                    """
                    SELECT 
                        rps.role_permission_id,
                        rps.branch_id,
                        rps.scope_type,

                        p.id AS permission_id,
                        p.permission_key,
                        p.description AS permission_description,
                        p.permission_type,
                        p.parent_permission_id,
                        p.show_in_menu,

                        m.id AS module_id,
                        m.module_key,
                        m.name AS module_name,
                        m.description AS module_description,

                        rp.allowed
                    FROM role_permission_scope rps
                    JOIN role_permissions rp ON rps.role_permission_id = rp.id
                    JOIN permissions p ON rp.permission_id = p.id
                    JOIN modules m ON p.module_id = m.id
                    WHERE rps.branch_id = %s
                    """,
                    (branch_id,)
                )

                scoped_permissions += branch_scoped

            # ---- C: Employee scoped permissions ----
            emp_scoped = db.execute_query_all(
                """
                SELECT 
                    rps.role_permission_id,
                    rps.employee_id,
                    rps.scope_type,

                    p.id AS permission_id,
                    p.permission_key,
                    p.description AS permission_description,
                    p.permission_type,  
                    p.parent_permission_id,
                    p.show_in_menu, 

                    m.id AS module_id,
                    m.module_key,
                    m.name AS module_name,
                    m.description AS module_description,

                    rp.allowed
                FROM role_permission_scope rps
                JOIN role_permissions rp ON rps.role_permission_id = rp.id
                JOIN permissions p ON rp.permission_id = p.id
                JOIN modules m ON p.module_id = m.id
                WHERE rps.employee_id = %s
                """,
                (employee_id,)
            )

            scoped_permissions += emp_scoped

            # ----------------------------------------------------------
            # 5️⃣ Merge & remove duplicates (scope priority safe)
            # ----------------------------------------------------------
            all_permissions = base_permissions + scoped_permissions

            deduped = {}
            scope_priority = {
                "EMPLOYEE": 5,
                "BRANCH": 4,
                "DEPARTMENT": 3,
                "ROLE": 2,
                "GLOBAL": 1
            }

            for perm in all_permissions:

                module_id = perm.get("module_id")
                permission_id = perm.get("permission_id")
                if module_id is None or permission_id is None:
                    continue

                key = (module_id, permission_id)
                current_scope = (perm.get("scope_type") or "GLOBAL").upper()
                current_allowed = int(perm.get("allowed", 0))

                if key not in deduped:
                    deduped[key] = {
                        "perm": perm,
                        "scope": current_scope,
                        "allowed": current_allowed
                    }
                else:
                    existing = deduped[key]
                    existing_scope = (existing["scope"] or "GLOBAL").upper()
                    existing_allowed = int(existing["allowed"])

                    curr_prio = scope_priority.get(current_scope, 0)
                    exist_prio = scope_priority.get(existing_scope, 0)

                    replace = False

                    if curr_prio > exist_prio:
                        replace = True
                    elif curr_prio == exist_prio:
                        if current_allowed > existing_allowed:
                            replace = True
                        elif current_allowed == existing_allowed:
                            if existing_scope == "GLOBAL" and current_scope != "GLOBAL":
                                replace = True

                    if replace:
                        deduped[key] = {
                            "perm": perm,
                            "scope": current_scope,
                            "allowed": current_allowed
                        }

            all_permissions = [v["perm"] for v in deduped.values()]

            # ----------------------------------------------------------
            # 6️⃣ Group by module — NO PARENT ID
            # ----------------------------------------------------------
            permissions_by_module = {}

            for perm in all_permissions:
                module_id = perm["module_id"]

                if module_id not in permissions_by_module:
                    permissions_by_module[module_id] = {
                        "module_key": perm.get("module_key"),
                        "module_name": perm.get("module_name"),
                        "module_description": perm.get("module_description"),
                        "permissions": []
                    }

                permissions_by_module[module_id]["permissions"].append({
                    "permission_id": perm["permission_id"],
                    "permission_key": perm["permission_key"],
                    "permission_description": perm.get("permission_description"),
                    "permission_type": perm.get("permission_type"),
                    "parent_permission_id": perm.get("parent_permission_id"),
                    "show_in_menu": perm.get("show_in_menu"),
                    "allowed": perm.get("allowed", 0),
                    "scope_type": (perm.get("scope_type") or "GLOBAL")
                })

            return permissions_by_module, role_levels

        except Exception as e:
            print(f"Error getting user permissions: {e}")
            return {}, []




    