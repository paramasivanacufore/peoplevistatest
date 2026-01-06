from fastapi import APIRouter, Depends, HTTPException, Request, status
from datetime import datetime, timezone
from typing import Optional

from models.auth_models import (
    UserCreate, UserLogin, UserResponse, SessionResponse, ForgotPasswordRequest,
    VerifyOTPRequest, ResetPasswordRequest, AuthUser, MinimalUserResponse
)
from services.auth_service import AuthService
from services.otp_service import OTPService
from services.email_service import EmailService
from database import db

# Create router
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def get_user_agent(request: Request) -> str:
    """Get user agent"""
    return request.headers.get("User-Agent", "Unknown")

def get_session_id_from_header(request: Request) -> Optional[str]:
    """Extract session_id from Authorization header (format: 'Session {session_id}')"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    
    # Check if header starts with "Session "
    if auth_header.startswith("Session "):
        session_id = auth_header.replace("Session ", "").strip()
        return session_id if session_id else None
    
    return None

@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if username already exists
        existing_user = db.execute_query_one(
            "SELECT user_id FROM ac_users WHERE username = %s",
            (user_data.username,)
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Check if email already exists
        existing_email = db.execute_query_one(
            "SELECT user_id FROM ac_users WHERE email = %s",
            (user_data.email,)
        )
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        
        # Hash password
        hashed_password = AuthService.get_password_hash(user_data.password)
        
        # Create user
        user_id = db.execute_insert(
            """
            INSERT INTO ac_users (emp_id, username, password_hash, email, status_id)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_data.employee_id, user_data.username, hashed_password,
                user_data.email, 1, 
            )
        )
        
        # Get created user
        user = db.execute_query_one(
            """
            SELECT u.user_id, u.emp_id as employee_id, u.username, u.email, 
                   s.status_name as status, u.created_at
            FROM ac_users u
            JOIN status s ON u.status_id = s.status_id
            WHERE u.user_id = %s
            """,
            (user_id,)
        )
        
        # Send welcome email
        EmailService.send_welcome_email(
            user_data.email, 
            f"{user_data.first_name} {user_data.last_name}", 
            user_data.username
        )
        
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@auth_router.post("/login", response_model=SessionResponse)
async def login(login_data: UserLogin, request: Request):
    try:
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)

        # Rate Limit
        can_proceed, remaining_time = AuthService.check_rate_limit(ip_address)
        if not can_proceed:
            raise HTTPException(
                status_code=429,
                detail=f"Too many login attempts. Try again in {remaining_time} seconds"
            )

        # reCAPTCHA
        if not AuthService.verify_recaptcha(login_data.recaptcha_token):
            AuthService.increment_rate_limit(ip_address)
            raise HTTPException(status_code=400, detail="Invalid reCAPTCHA")

        # Get user
        user = AuthService.get_user_by_login(login_data.login)
        if not user:
            AuthService.increment_rate_limit(ip_address)
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Check password
        if not AuthService.verify_password(login_data.password, user["password_hash"]):
            AuthService.increment_rate_limit(ip_address)
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Reset rate limit
        AuthService.reset_rate_limit(ip_address)

        # Create session (include employee_id so permissions can be fetched from session later)
        session_id = AuthService.create_session(
            {
                "user_id": user["user_id"],
                "username": user["username"],
                "employee_id": user.get("employee_id"),
            },
            login_data.remember_me,
        )
        if not session_id:
            raise HTTPException(500, "Failed to create session")

        # Session expiry logic (for response)
        if login_data.remember_me:
            expires_in = 30 * 24 * 60 * 60  # 30 days in seconds
        else:
            expires_in = 24 * 60 * 60  # 24 hours in seconds

        # Note: session_id is returned in response body, NOT set as cookie
        # Permissions and role_levels are NOT included in response - fetch on-demand via permissions API

        # Return response with only 4 fields: user_id, first_name, last_name, position_name
        return SessionResponse(
            session_id=session_id,
            expires_in=expires_in,
            message=f"Login successful (Remember me: {login_data.remember_me})",
            user=MinimalUserResponse(
                user_id=user["user_id"],
                first_name=user["first_name"],
                last_name=user["last_name"],
                position_name=user.get("position_name"),
                role_id=user.get("role_id"),
                role_name=user.get("role_name"),
            ),
        )

    except HTTPException:
        raise
    except Exception as e:
        print("Login Error:", e)
        raise HTTPException(500, f"Login failed: {str(e)}")




@auth_router.post("/forgot-password")
async def forgot_password(request_data: ForgotPasswordRequest):
    """Send OTP for password reset"""
    try:
        # Check if user exists
        user = AuthService.get_user_by_login(request_data.email)
        if not user:
            # Don't reveal if email exists or not
            return {"message": "If the email exists, an OTP has been sent"}
        
        # Check rate limiting for OTP requests
        if OTPService.is_otp_rate_limited(request_data.email):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many OTP requests. Please wait before requesting another OTP"
            )
        
        # Generate and store OTP
        otp = OTPService.generate_otp()
        if not OTPService.store_otp(request_data.email, otp):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate OTP"
            )
        
        # Send OTP email
        EmailService.send_otp_email(
            request_data.email,
            otp,
            f"{user['first_name']} {user['last_name']}"
        )
        
        return {"message": "If the email exists, an OTP has been sent"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Forgot password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process password reset request"
        )

@auth_router.post("/verify-otp")
async def verify_otp(request_data: VerifyOTPRequest):
    """Verify OTP for various purposes (password reset, etc.)"""
    try:
        # Verify OTP
        if not OTPService.verify_otp(request_data.email, request_data.otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        return {"message": "OTP verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"OTP verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP verification failed"
        )

@auth_router.post("/verify-reset-otp")
async def verify_reset_otp(request_data: VerifyOTPRequest):
    """Verify OTP for password reset"""
    try:
        # Verify OTP
        if not OTPService.verify_otp(request_data.email, request_data.otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        return {"message": "OTP verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"OTP verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP verification failed"
        )

@auth_router.post("/reset-password", response_model=AuthUser)
async def reset_password(request_data: ResetPasswordRequest, request: Request):
    """Reset password after OTP verification"""
    try:
        # Verify OTP before allowing password reset (defense in depth)
        # This validates the OTP even if it was already used in the verify-otp step
        # It checks that the OTP matches and hasn't expired
        if not OTPService.validate_otp_for_reset(request_data.email, request_data.otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        # Get user
        user = AuthService.get_user_by_login(request_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hash new password
        hashed_password = AuthService.get_password_hash(request_data.new_password)
        
        # Update password
        db.execute_update(
            "UPDATE ac_users SET password_hash = %s WHERE user_id = %s",
            (hashed_password, user['user_id'])
        )
        
        # Create session after successful password reset (include employee_id)
        session_data = {
            "user_id": user['user_id'],
            "username": user['username'],
            "employee_id": user.get('employee_id')
        }
        
        session_id = AuthService.create_session(session_data, False)  # Don't remember me for password reset
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create session"
            )
        
        # Note: session_id should be returned in response body, NOT set as cookie
        # For password reset, user should log in again, so we don't auto-login
        
        # Return user data without permissions (permissions fetched on-demand via permissions API)
        return AuthUser(
            user_id=user['user_id'],
            username=user['username'],
            email=user['email'],
            first_name=user['first_name'],
            last_name=user['last_name'],
            employee_id=user['employee_id'],
            role_id=user.get('role_id'),
            role_name=user.get('role_name'),
            permissions={},
            role_levels=[],
            position_name=user.get('position_name')  # Fetched from positions table
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Password reset error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )

@auth_router.post("/logout")
async def logout(request: Request):
    """Logout user and destroy session"""
    try:
        # Get session ID from Authorization header
        session_id = get_session_id_from_header(request)
        
        if session_id:
            # Destroy session
            AuthService.destroy_session(session_id)
            print(f"Session destroyed for logout: {session_id[:8]}...")
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        print(f"Logout error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@auth_router.get("/check-auth", response_model=MinimalUserResponse)
async def check_auth(request: Request):
    """Check authentication and return user info with session renewal"""
    try:
        # Get session ID from Authorization header
        session_id = get_session_id_from_header(request)
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No session found"
            )
        
        # Verify session with renewal
        session_data = AuthService.verify_session(session_id, renew_session=True)
        if not session_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session"
            )
        
        # Get user from database to ensure it's still active
        user = AuthService.get_user_by_id(session_data['user_id'])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Return only 4 fields: user_id, first_name, last_name, position_name
        return MinimalUserResponse(
            user_id=user['user_id'],
            first_name=user['first_name'],
            last_name=user['last_name'],
            position_name=user.get('position_name'),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Check auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication check failed"
        )

# Dependency for protected routes
async def get_current_user(request: Request) -> MinimalUserResponse:
    """Get current authenticated user with session renewal - returns only essential fields"""
    try:
        # Get session ID from Authorization header
        session_id = get_session_id_from_header(request)
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No session found"
            )
        
        # Verify session with renewal
        session_data = AuthService.verify_session(session_id, renew_session=True)
        if not session_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session"
            )
        
        # Get user from database to ensure it's still active
        user = AuthService.get_user_by_id(session_data['user_id'])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Return only 4 fields: user_id, first_name, last_name, position_name
        return MinimalUserResponse(
            user_id=user['user_id'],
            first_name=user['first_name'],
            last_name=user['last_name'],
            position_name=user.get('position_name'),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@auth_router.get("/otp-stats")
async def get_otp_stats():
    """Get OTP storage statistics (for debugging)"""
    try:
        stats = OTPService.get_otp_stats()
        return {
            "message": "OTP statistics",
            "stats": stats
        }
    except Exception as e:
        print(f"OTP stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get OTP statistics"
        )

@auth_router.get("/session-stats")
async def get_session_stats():
    """Get session storage statistics (for debugging)"""
    try:
        stats = AuthService.get_session_stats()
        return {
            "message": "Session statistics",
            "stats": stats
        }
    except Exception as e:
        print(f"Session stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get session statistics"
        )

@auth_router.get("/session-info")
async def get_session_info(request: Request):
    """Get current session information"""
    try:
        session_id = request.cookies.get("session_id")
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No session found"
            )
        
        # Get session expiry without renewing
        session_expiry = AuthService.get_session_expiry(session_id)
        if not session_expiry:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session not found"
            )
        
        current_time = datetime.now(timezone.utc)
        time_remaining = session_expiry - current_time
        
        return {
            "session_id": session_id[:8] + "...",
            "expires_at": session_expiry.isoformat(),
            "time_remaining_seconds": int(time_remaining.total_seconds()),
            "time_remaining_hours": round(time_remaining.total_seconds() / 3600, 2),
            "is_expired": time_remaining.total_seconds() <= 0
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Session info error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get session information"
        )