
from fastapi import APIRouter
from models.regularization import RegularizationRequest, RegularizationBatchRequest
from services.attendance.regularization_service import RegularizationService

router = APIRouter(prefix="/api/regularization", tags=["Regularization"])

# Single request
@router.post("/apply")
def apply_regularization(req: RegularizationRequest):
    request_id = RegularizationService.create_regularization(req)
    return {"message": "Regularization request submitted", "request_id": request_id}

# Multiple requests
@router.post("/apply/multiple")
def apply_multiple_regularizations(batch: RegularizationBatchRequest):
    inserted_ids = RegularizationService.create_multiple(batch.requests)
    return {
        "message": "Multiple regularization requests submitted",
        "ids": inserted_ids
    }

@router.get("/")
def list_regularizations():
    rows = RegularizationService.get_all_regularizations()
    return {"data": rows}
