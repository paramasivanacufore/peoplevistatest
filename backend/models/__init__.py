from pydantic import BaseModel
from typing import Any, Optional

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    data: Optional[Any] = None

class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = "Operation successful"
    data: Any

