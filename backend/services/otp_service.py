import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import threading
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OTP Configuration
OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", "10"))
OTP_LENGTH = 6

# In-memory OTP storage
otp_storage: Dict[str, Dict[str, Any]] = {}
otp_lock = threading.Lock()

class OTPService:
    @staticmethod
    def generate_otp() -> str:
        """Generate a random OTP"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(OTP_LENGTH)])
    
    @staticmethod
    def hash_otp(otp: str) -> str:
        """Hash OTP for secure storage"""
        return hashlib.sha256(otp.encode()).hexdigest()
    
    @staticmethod
    def store_otp(email: str, otp: str, purpose: str = "password_reset") -> bool:
        """Store OTP in memory with expiration"""
        try:
            with otp_lock:
                hashed_otp = OTPService.hash_otp(otp)
                expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
                
                # Create storage key
                storage_key = f"{email}:{purpose}"
                
                # Store OTP data
                otp_storage[storage_key] = {
                    'otp_hash': hashed_otp,
                    'expires_at': expires_at,
                    'created_at': datetime.now(timezone.utc),
                    'used': False
                }
                
                print(f"OTP stored for {email} (purpose: {purpose})")
                return True
        except Exception as e:
            print(f"Error storing OTP: {e}")
            return False
    
    @staticmethod
    def check_otp(email: str, otp: str, purpose: str = "password_reset") -> bool:
        """Check OTP without marking as used"""
        try:
            with otp_lock:
                hashed_otp = OTPService.hash_otp(otp)
                current_time = datetime.now(timezone.utc)
                storage_key = f"{email}:{purpose}"
                
                # Check if OTP exists
                if storage_key not in otp_storage:
                    print(f"No OTP found for {email} (purpose: {purpose})")
                    return False
                
                otp_data = otp_storage[storage_key]
                
                # Check if already used
                if otp_data['used']:
                    print(f"OTP already used for {email} (purpose: {purpose})")
                    return False
                
                # Check if expired
                if current_time > otp_data['expires_at']:
                    print(f"OTP expired for {email} (purpose: {purpose})")
                    return False
                
                # Check if OTP matches
                if otp_data['otp_hash'] != hashed_otp:
                    print(f"OTP mismatch for {email} (purpose: {purpose})")
                    return False
                
                print(f"OTP check successful for {email} (purpose: {purpose})")
                return True
        except Exception as e:
            print(f"Error checking OTP: {e}")
            return False

    @staticmethod
    def verify_otp(email: str, otp: str, purpose: str = "password_reset") -> bool:
        """Verify OTP and mark as used"""
        try:
            with otp_lock:
                # Development mode: Accept test OTP 123456
                is_development = os.getenv("ENVIRONMENT", "development").lower() != "production"
                if is_development and otp == "123456":
                    # Check if there's a stored OTP for this email (to ensure OTP was requested)
                    storage_key = f"{email}:{purpose}"
                    if storage_key in otp_storage:
                        otp_data = otp_storage[storage_key]
                        # Check if already used
                        if otp_data['used']:
                            print(f"Test OTP 123456 already used for {email} (purpose: {purpose})")
                            return False
                        # Check if expired
                        current_time = datetime.now(timezone.utc)
                        if current_time > otp_data['expires_at']:
                            print(f"Test OTP 123456 expired for {email} (purpose: {purpose})")
                            otp_data['used'] = True
                            return False
                        print(f"Development mode: Accepting test OTP 123456 for {email} (purpose: {purpose})")
                        # Mark the stored OTP as used
                        otp_data['used'] = True
                        otp_data['used_at'] = current_time
                        return True
                    else:
                        print(f"Test OTP 123456 rejected: No OTP request found for {email} (purpose: {purpose})")
                        return False
                hashed_otp = OTPService.hash_otp(otp)
                current_time = datetime.now(timezone.utc)
                storage_key = f"{email}:{purpose}"
                
                # Check if OTP exists
                if storage_key not in otp_storage:
                    print(f"No OTP found for {email} (purpose: {purpose})")
                    return False
                
                otp_data = otp_storage[storage_key]
                
                # Check if already used
                if otp_data['used']:
                    print(f"OTP already used for {email} (purpose: {purpose})")
                    return False
                
                # Check if expired
                if current_time > otp_data['expires_at']:
                    print(f"OTP expired for {email} (purpose: {purpose})")
                    # Mark as used to prevent reuse
                    otp_data['used'] = True
                    return False
                
                # Check if OTP matches
                if otp_data['otp_hash'] != hashed_otp:
                    print(f"OTP mismatch for {email} (purpose: {purpose})")
                    return False
                
                # Mark as used
                otp_data['used'] = True
                otp_data['used_at'] = current_time
                
                print(f"OTP verified successfully for {email} (purpose: {purpose})")
                return True
        except Exception as e:
            print(f"Error verifying OTP: {e}")
            return False
    
    @staticmethod
    def cleanup_expired_otps():
        """Clean up expired OTPs from memory"""
        try:
            with otp_lock:
                current_time = datetime.now(timezone.utc)
                expired_keys = []
                
                for key, data in otp_storage.items():
                    if current_time > data['expires_at']:
                        expired_keys.append(key)
                
                for key in expired_keys:
                    del otp_storage[key]
                    print(f"Cleaned up expired OTP for key: {key}")
        except Exception as e:
            print(f"Error cleaning up expired OTPs: {e}")
    
    @staticmethod
    def is_otp_rate_limited(email: str) -> bool:
        """Check if email is rate limited for OTP requests"""
        try:
            with otp_lock:
                current_time = datetime.now(timezone.utc)
                cutoff_time = current_time - timedelta(minutes=5)
                
                # Count recent OTP requests for this email
                recent_count = 0
                for key, data in otp_storage.items():
                    if key.startswith(f"{email}:") and data['created_at'] > cutoff_time:
                        recent_count += 1
                
                is_limited = recent_count >= 3  # Max 3 OTPs per 5 minutes
                if is_limited:
                    print(f"Rate limit exceeded for {email}: {recent_count} requests in last 5 minutes")
                
                return is_limited
        except Exception as e:
            print(f"Error checking OTP rate limit: {e}")
            return False
    
    @staticmethod
    def validate_otp_for_reset(email: str, otp: str, purpose: str = "password_reset") -> bool:
        """Validate OTP for password reset - allows checking even if already used (within expiration)"""
        try:
            with otp_lock:
                # Development mode: Accept test OTP 123456
                is_development = os.getenv("ENVIRONMENT", "development").lower() != "production"
                if is_development and otp == "123456":
                    # Check if there's a stored OTP for this email (to ensure OTP was requested)
                    storage_key = f"{email}:{purpose}"
                    if storage_key in otp_storage:
                        otp_data = otp_storage[storage_key]
                        # Check if expired
                        current_time = datetime.now(timezone.utc)
                        if current_time > otp_data['expires_at']:
                            print(f"Test OTP 123456 expired for {email} (purpose: {purpose})")
                            return False
                        print(f"Development mode: Accepting test OTP 123456 for password reset for {email} (purpose: {purpose})")
                        return True
                    else:
                        print(f"Test OTP 123456 rejected: No OTP request found for {email} (purpose: {purpose})")
                        return False
                hashed_otp = OTPService.hash_otp(otp)
                current_time = datetime.now(timezone.utc)
                storage_key = f"{email}:{purpose}"
                
                # Check if OTP exists
                if storage_key not in otp_storage:
                    print(f"No OTP found for {email} (purpose: {purpose})")
                    return False
                
                otp_data = otp_storage[storage_key]
                
                # Check if expired
                if current_time > otp_data['expires_at']:
                    print(f"OTP expired for {email} (purpose: {purpose})")
                    return False
                
                # Check if OTP matches (allows even if already used, as long as not expired)
                if otp_data['otp_hash'] != hashed_otp:
                    print(f"OTP mismatch for {email} (purpose: {purpose})")
                    return False
                
                print(f"OTP validation successful for {email} (purpose: {purpose})")
                return True
        except Exception as e:
            print(f"Error validating OTP: {e}")
            return False
    
    @staticmethod
    def get_otp_stats() -> Dict[str, Any]:
        """Get OTP storage statistics (for debugging)"""
        with otp_lock:
            current_time = datetime.now(timezone.utc)
            total_otps = len(otp_storage)
            active_otps = 0
            expired_otps = 0
            used_otps = 0
            
            for data in otp_storage.values():
                if data['used']:
                    used_otps += 1
                elif current_time > data['expires_at']:
                    expired_otps += 1
                else:
                    active_otps += 1
            
            return {
                'total_otps': total_otps,
                'active_otps': active_otps,
                'expired_otps': expired_otps,
                'used_otps': used_otps
            }
