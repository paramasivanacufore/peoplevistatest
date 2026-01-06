import os
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email Configuration
SMTP_HOST = os.getenv("MAIL_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("MAIL_PORT", "587"))
SMTP_USERNAME = os.getenv("MAIL_USERNAME", "rakshita.r.somayaji2311@gmail.com")
SMTP_PASSWORD = os.getenv("MAIL_PASSWORD", "gjqlyqnsalanzopk")
FROM_EMAIL = os.getenv("MAIL_USERNAME", "rakshita.r.somayaji2311@gmail.com")
FROM_NAME = os.getenv("FROM_NAME", "PeopleVista HRMS")

class EmailService:
    @staticmethod
    def send_email_async(to_email: str, subject: str, body: str, is_html: bool = False):
        """Send email asynchronously"""
        def send_email():
            try:
                EmailService.send_email(to_email, subject, body, is_html)
            except Exception as e:
                print(f"Error sending email to {to_email}: {e}")
        
        thread = threading.Thread(target=send_email)
        thread.daemon = True
        thread.start()
    
    @staticmethod
    def send_email(to_email: str, subject: str, body: str, is_html: bool = False) -> bool:
        """Send email synchronously"""
        try:
            if not SMTP_USERNAME or not SMTP_PASSWORD:
                print(f"[EMAIL] To: {to_email} | Subject: {subject}")
                print(f"[EMAIL] Body: {body}")
                return True
            
            msg = MIMEMultipart()
            msg['From'] = f"{FROM_NAME} <{FROM_EMAIL}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    @staticmethod
    def send_otp_email(to_email: str, otp: str, user_name: str = "User"):
        """Send OTP email for password reset"""
        subject = "Password Reset OTP - PeopleVista HRMS"
        
        body = f"""
Dear {user_name},

You have requested to reset your password for your PeopleVista HRMS account.

Your OTP (One-Time Password) is: {otp}

This OTP is valid for 10 minutes only.

If you did not request this password reset, please ignore this email.

Best regards,
PeopleVista HRMS Team
        """
        
        EmailService.send_email_async(to_email, subject, body)
    
    @staticmethod
    def send_login_notification(to_email: str, user_name: str, ip_address: str, user_agent: str, location: str = "Unknown"):
        """Send login notification email"""
        subject = "New Login Detected - PeopleVista HRMS"
        
        body = f"""
Dear {user_name},

A new login to your PeopleVista HRMS account was detected.

Login Details:
- Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
- IP Address: {ip_address}
- Location: {location}
- Browser: {user_agent}

If this was not you, please secure your account immediately by changing your password.

Best regards,
PeopleVista HRMS Team
        """
        
        EmailService.send_email_async(to_email, subject, body)
    
    @staticmethod
    def send_welcome_email(to_email: str, user_name: str, username: str):
        """Send welcome email to new user"""
        subject = "Welcome to PeopleVista HRMS"
        
        body = f"""
Dear {user_name},

Welcome to PeopleVista HRMS!

Your account has been successfully created.

Account Details:
- Username: {username}
- Email: {to_email}

You can now log in to the system using your credentials.

Best regards,
PeopleVista HRMS Team
        """
        
        EmailService.send_email_async(to_email, subject, body)
