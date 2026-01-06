from fastapi import APIRouter, HTTPException
from services.module_service import ModuleService

module_router = APIRouter(prefix="/modules", tags=["Modules"])

@module_router.get("/get", summary="Get all modules")
async def get_all_modules():
    try:
        modules = ModuleService.get_all_modules()
        return {
            "success": True,
            "data": modules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
