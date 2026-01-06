from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from starlette.responses import JSONResponse
from queue import Queue, Empty
from typing import Generator, Optional
import pymysql
# Import database and models
from database import db
from models import ErrorResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    from services.otp_service import OTPService
    from services.auth_service import AuthService
    
    try:
        db.execute_query_one("SELECT 1")
        print("Database connection verified on startup")
    except Exception as e:
        print(f"Startup error: {e}")
    
    # Start cleanup tasks
    async def cleanup_otps():
        while True:
            try:
                OTPService.cleanup_expired_otps()
                await asyncio.sleep(300)  # Clean up every 5 minutes
            except Exception as e:
                print(f"OTP cleanup error: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error
    
    async def cleanup_sessions():
        while True:
            try:
                AuthService.cleanup_expired_sessions()
                await asyncio.sleep(600)  # Clean up every 10 minutes
            except Exception as e:
                print(f"Session cleanup error: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error
    
    # Start cleanup tasks
    otp_cleanup_task = asyncio.create_task(cleanup_otps())
    session_cleanup_task = asyncio.create_task(cleanup_sessions())
    
    yield
    
    # Cleanup on shutdown
    otp_cleanup_task.cancel()
    session_cleanup_task.cancel()
    try:
        await otp_cleanup_task
        await session_cleanup_task
    except asyncio.CancelledError:
        pass
    db.close()

app = FastAPI(
    title="PeopleVista HRMS API",
    description="FastAPI backend for PeopleVista HRMS system",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

# Include routers
from routes.auth_router import auth_router
from routes.modules_routes import module_router
from routes.attendance.holiday_router import holiday_router
from routes.shift_router import shift_router
from routes.attendance.biometric_device_router import biometric_device_router
from routes.permission_router import permission_router
from routes.leave_allocation_router import leave_allocation_router
from routes.leave_type_router import leave_type_router
from routes.leave_request_router import leave_request_router
from routes.module_registration_router import module_registration_router
from routes.position_router import position_router
from routes.role_routes import role_router
from routes.company_routes import company_router
from routes.branch_routes import branch_router
from routes.department_routes import department_router
from routes.employee_routes import employee_router
from routes.attendance.att_dashboard_routes import router as attendance_dashboard_router
from routes.attendance.attendance_router import router as attendance_router

from routes.attendance.leaves_request_routes import router as leaves_request_router  # leave request APIs

from routes.attendance.regularization_routes import router as regularization_router

from routes.permission_router import permission_router




app.include_router(module_router)
app.include_router(auth_router)
app.include_router(holiday_router, prefix="/api")
app.include_router(shift_router, prefix="/api")
app.include_router(biometric_device_router, prefix="/api")
app.include_router(permission_router, prefix="/api")
app.include_router(leave_allocation_router, prefix="/api")
app.include_router(leave_type_router, prefix="/api")
app.include_router(leave_request_router, prefix="/api")
app.include_router(module_registration_router, prefix="/api")
app.include_router(position_router, prefix="/api")
app.include_router(role_router, prefix="/api")
app.include_router(company_router, prefix="/api")
app.include_router(branch_router, prefix="/api")
app.include_router(department_router, prefix="/api")
app.include_router(employee_router, prefix="/api")
app.include_router(permission_router, prefix="/auth")

# Include routers
app.include_router(attendance_dashboard_router)  # Dashboard routes
app.include_router(attendance_router)  # Team member view routes

app.include_router(leaves_request_router)  
app.include_router(regularization_router)

@app.get("/")
async def root():
    return {"message": "PeopleVista HRMS API is running"}

@app.get("/api/health")
async def health_check():
    try:
        db.execute_query_one("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            message=exc.detail
        ).model_dump()
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=bool(int(os.getenv("RELOAD", "1"))),
    )