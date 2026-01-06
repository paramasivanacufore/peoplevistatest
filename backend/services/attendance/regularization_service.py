
from typing import List
from fastapi import HTTPException
from models.regularization import RegularizationRequest
from database import db

class RegularizationService:

    @staticmethod
    def create_regularization(req: RegularizationRequest) -> int:
        query = """
            INSERT INTO att_regularization_requests
            (employee_id, date, regularization_type, corrected_check_in, corrected_check_out, reason)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (
            req.employee_id,
            req.date,
            req.regularization_type,
            req.corrected_check_in,
            req.corrected_check_out,
            req.reason
        )
        try:
            return db.execute_insert(query, params)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

    @staticmethod
    def create_multiple(requests: List[RegularizationRequest]) -> List[int]:
        inserted_ids = []
        try:
            for req in requests:
                inserted_id = RegularizationService.create_regularization(req)
                inserted_ids.append(inserted_id)
            return inserted_ids
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

    @staticmethod
    def get_all_regularizations() -> List[dict]:
        query = "SELECT * FROM att_regularization_requests ORDER BY created_at DESC"
        try:
            return db.execute_query_all(query)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")
