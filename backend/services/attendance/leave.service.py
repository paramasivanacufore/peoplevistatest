from database import db

def get_leave_types():
    query = """
        SELECT leave_type_id, leave_type_name 
        FROM att_leave_type 
        WHERE status_id = 1
    """
    results = db.execute_query_all(query)
    return results
