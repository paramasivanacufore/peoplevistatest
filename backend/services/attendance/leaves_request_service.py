# from database import db
# from models.leaves_request import LeaveRequestCreate, LeaveRequestResponse
# from typing import Optional


# class LeaveRequestService:
#     @staticmethod
# def create_leave_request(leave: LeaveRequestCreate) -> int:
#     query = """
#         INSERT INTO att_leaves_request
#         (employee_id, leave_type_id, requested_to, start_date, end_date, request_date, status, comments, created_at, updated_at)
#         VALUES (%s, %s, %s, %s, %s, CURDATE(), 'Pending', %s, NOW(), NOW())
#     """

#     try:
#         requested_to = (
#             int(leave.requested_to)
#             if leave.requested_to not in (None, "", "null")
#             else None
#         )
#     except (ValueError, TypeError):
#         requested_to = None

#     params = (
#         leave.employee_id,
#         leave.leave_type_id,
#         requested_to,
#         leave.start_date,
#         leave.end_date,
#         leave.comments,
#     )

#     return db.execute_insert(query, params)


#     # @staticmethod
#     # def create_leave_request(leave: LeaveRequestCreate) -> int:
#         query = """
#             INSERT INTO att_leaves_request
#             (employee_id, leave_type_id, requested_to, start_date, end_date, request_date, status, comments, created_at, updated_at)
#             VALUES (%s, %s, %s, %s, %s, CURDATE(), 'Pending', %s, NOW(), NOW())
#         """
#         params = (
#             leave.employee_id,
#             leave.leave_type_id,
#             leave.requested_to,  
#             leave.start_date,
#             leave.end_date,
#             leave.comments,
#         )

#         # Executes the insert and returns the new leave_id
#         return db.execute_insert(query, params)

#     @staticmethod
#     def get_leave_request(leave_id: int) -> Optional[LeaveRequestResponse]:
#         query = "SELECT * FROM att_leaves_request WHERE leave_id = %s"
#         row = db.execute_query_one(query, (leave_id,))
        
#         if not row:
#             return None

#         # requested_to will be returned as email string
#         return LeaveRequestResponse(**row)


# # class LeaveRequestService:

# #     @staticmethod
# #     def create_leave_request(leave: LeaveRequestCreate) -> int:
# #         query = """
# #             INSERT INTO leaves_request
# #             (employee_id, leave_type_id, requested_to, start_date, end_date, request_date, status, comments, created_at, updated_at)
# #             VALUES (%s, %s, %s, %s, %s, CURDATE(), 'Pending', %s, NOW(), NOW())
# #         """
# #         params = (
# #             leave.employee_id,
# #             leave.leave_type_id,
# #             leave.requested_to,
# #             leave.start_date,
# #             leave.end_date,
# #             leave.comments,
# #         )

# #         # Use correct database method
# #         return db.execute_insert(query, params)

# #     @staticmethod
# #     def get_leave_request(leave_id: int) -> Optional[LeaveRequestResponse]:
# #         query = "SELECT * FROM leaves_request WHERE leave_id = %s"
        
# #         # Use correct database method
# #         row = db.execute_query_one(query, (leave_id,))
        
# #         if not row:
# #             return None

# #         return LeaveRequestResponse(**row)


# # def get_leave_types():
# #     query = """
# #         SELECT leave_type_id, leave_type_name 
# #         FROM leave_type 
# #         WHERE status_id = 1
# #     """
# #     results = db.execute_query_all(query)
# #     return results
# def get_leave_types():
#     query = """
#         SELECT leave_type_id, leave_type_name 
#         FROM att_leave_type
#         WHERE status_id = 1
#     """
#     results = db.execute_query_all(query)
#     return results
from database import db
from models.leaves_request import LeaveRequestCreate, LeaveRequestResponse
from typing import Optional


class LeaveRequestService:

    @staticmethod
    def create_leave_request(leave: LeaveRequestCreate) -> int:
        query = """
            INSERT INTO att_leaves_request
            (employee_id, leave_type_id, requested_to, start_date, end_date, request_date, status, comments, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, CURDATE(), 'Pending', %s, NOW(), NOW())
        """

        try:
            requested_to = (
                int(leave.requested_to)
                if leave.requested_to not in (None, "", "null")
                else None
            )
        except (ValueError, TypeError):
            requested_to = None

        params = (
            leave.employee_id,
            leave.leave_type_id,
            requested_to,
            leave.start_date,
            leave.end_date,
            leave.comments,
        )

        return db.execute_insert(query, params)

    @staticmethod
    def get_leave_request(leave_id: int) -> Optional[LeaveRequestResponse]:
        query = "SELECT * FROM att_leaves_request WHERE leave_id = %s"
        row = db.execute_query_one(query, (leave_id,))

        if not row:
            return None

        return LeaveRequestResponse(**row)


def get_leave_types():
    query = """
        SELECT leave_type_id, leave_type_name
        FROM att_leave_type
        WHERE status_id = 1
    """
    return db.execute_query_all(query)
