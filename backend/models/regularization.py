# from enum import Enum
# from pydantic import BaseModel
# from typing import Optional
# from datetime import date, time

# class RegularizationType(str, Enum):
#     forgot_to_checkin = "forgot to checkin"
#     forgot_to_checkout = "forgot to checkout"
#     work_from_home = "Work From Home"

# class RegularizationRequest(BaseModel):
#     employee_id: int
#     date: date
#     regularization_type: RegularizationType
#     corrected_check_in: Optional[time] = None
#     corrected_check_out: Optional[time] = None
#     reason: str
from enum import Enum
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time

class RegularizationType(str, Enum):
    forgot_to_checkin = "forgot to checkin"
    forgot_to_checkout = "forgot to checkout"
    work_from_home = "Work From Home"

class RegularizationRequest(BaseModel):
    employee_id: int
    date: date
    regularization_type: RegularizationType
    corrected_check_in: Optional[time] = None
    corrected_check_out: Optional[time] = None
    reason: str

class RegularizationBatchRequest(BaseModel):
    requests: List[RegularizationRequest]
