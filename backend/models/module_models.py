from pydantic import BaseModel
from typing import Optional

class Module(BaseModel):
    module_id: int
    module_name: str
    parent_id: Optional[int] = None
    icon: Optional[str] = None
    order_no: Optional[int] = None
    is_active: bool
