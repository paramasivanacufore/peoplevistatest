# routes/permission_router.py
from fastapi import APIRouter
from services.auth_service import AuthService

permission_router = APIRouter()

@permission_router.get("/permissions")
async def get_permissions_test(employee_id: int | None = None):
    """
    Temporary endpoint to test permission response without auth.
    Provide `employee_id` as a query param, e.g. /permissions?employee_id=4
    """
    if employee_id is None:
        return {"error": "Please provide employee_id as query parameter, e.g. ?employee_id=4"}

    permissions, role_levels = AuthService.get_user_permissions(employee_id)

    return {
        "employee_id": employee_id,
        "permissions": permissions,
        "role_levels": role_levels
    }
