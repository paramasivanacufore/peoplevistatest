# # from database import db
# # from typing import Dict, Any, List ,Optional
# # from datetime import datetime
# # import json

# # class DepartmentService:

# #     @staticmethod
# #     def create_main_department(department_data: Dict[str, Any]) -> Dict[str, Any]:
# #         """
# #         Create department
# #         - No branch_id / branch_ids stored in departments table
# #         - All branch relations stored in dpt_linkedto_branch
# #         """
# #         try:
# #             company_id = department_data.get("company_id")
# #             department_name = department_data.get("department_name")
# #             raw_branch_ids = department_data.get("branch_ids")

# #             # ---------- Parse branch_ids ----------
# #             if not raw_branch_ids:
# #                 raise ValueError("At least one branch must be selected")

# #             if isinstance(raw_branch_ids, str):
# #                 try:
# #                     branch_ids = json.loads(raw_branch_ids)  # "[1,2]"
# #                 except json.JSONDecodeError:
# #                     branch_ids = [int(b) for b in raw_branch_ids.split(",") if b.strip()]
# #             elif isinstance(raw_branch_ids, list):
# #                 branch_ids = raw_branch_ids
# #             else:
# #                 raise ValueError("Invalid branch_ids format")

# #             if not branch_ids:
# #                 raise ValueError("At least one branch must be selected")

# #             # ---------- Validate company ----------
# #             company = db.execute_query_one(
# #                 "SELECT company_id FROM companies WHERE company_id=%s",
# #                 (company_id,)
# #             )
# #             if not company:
# #                 raise ValueError("Company not found")

# #             # ---------- Validate branches ----------
# #             for bid in branch_ids:
# #                 branch = db.execute_query_one(
# #                     "SELECT branch_id FROM branches WHERE branch_id=%s AND company_id=%s",
# #                     (bid, company_id)
# #                 )
# #                 if not branch:
# #                     raise ValueError(f"Invalid branch ID {bid} for this company")

# #             # ---------- Duplicate department ----------
# #             exists = db.execute_query_one(
# #                 "SELECT 1 FROM departments WHERE department_name=%s AND company_id=%s",
# #                 (department_name, company_id)
# #             )
# #             if exists:
# #                 raise ValueError("Department already exists")

# #             # ---------- Insert department ----------
# #             now = datetime.utcnow()
# #             dept_id = db.execute_insert(
# #                 """
# #                 INSERT INTO departments
# #                 (company_id, department_name, is_global,
# #                  parent_department_id, short_code, description,
# #                  status_id, created_at, updated_at)
# #                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
# #                 """,
# #                 (
# #                     company_id,
# #                     department_name,
# #                     department_data.get("is_global", False),
# #                     department_data.get("parent_department_id"),
# #                     department_data.get("short_code"),
# #                     department_data.get("description"),
# #                     department_data.get("status_id", 1),
# #                     now,
# #                     now
# #                 )
# #             )

# #             # ---------- Insert branch links ----------
# #             for bid in branch_ids:
# #                 db.execute_insert(
# #                     """
# #                     INSERT INTO dpt_linkedto_branch (department_id, branch_id)
# #                     VALUES (%s, %s)
# #                     """,
# #                     (dept_id, bid)
# #                 )

# #             return DepartmentService.get_department_by_id(dept_id)

# #         except Exception as e:
# #             print("Error creating department:", e)
# #             raise
# #  # @staticmethod
# #     # def create_main_department(department_data: Dict[str, Any], branch_ids: List[int]) -> Dict[str, Any]:
# #     #     """Create main/global department"""
# #     #     try:
# #     #         company_id = department_data['company_id']
# #     #         department_name = department_data['department_name']

# #     #         # Check company
# #     #         company = db.execute_query_one(
# #     #             "SELECT company_id FROM companies WHERE company_id = %s",
# #     #             (company_id,)
# #     #         )
# #     #         if not company:
# #     #             raise ValueError(f"Company with ID {company_id} not found")

# #     #         # Validate branches
# #     #         for bid in branch_ids:
# #     #             branch = db.execute_query_one(
# #     #                 "SELECT branch_id FROM branches WHERE branch_id = %s AND company_id = %s",
# #     #                 (bid, company_id)
# #     #             )
# #     #             if not branch:
# #     #                 raise ValueError(f"Branch ID {bid} not found for this company")

# #     #         # Duplicate department check
# #     #         existing = DepartmentService.get_department_by_name_and_company(department_name, company_id, None)
# #     #         if existing:
# #     #             raise ValueError(f"Department '{department_name}' already exists")

# #     #         current_time = datetime.utcnow()
# #     #         insert_query = """
# #     #             INSERT INTO departments
# #     #             (company_id, branch_id, department_name, short_code, description,
# #     #             status_id, is_global, parent_department_id, branch_ids, created_at, updated_at)
# #     #             VALUES (%(company_id)s, %(branch_id)s, %(department_name)s, %(short_code)s,
# #     #                     %(description)s, %(status_id)s, %(is_global)s, %(parent_department_id)s,
# #     #                     %(branch_ids)s, %(created_at)s, %(updated_at)s)
# #     #         """
# #     #         insert_data = {
# #     #             "company_id": company_id,
# #     #             "branch_id": None,
# #     #             "department_name": department_name,
# #     #             "short_code": department_data.get("short_code"),
# #     #             "description": department_data.get("description"),
# #     #             "status_id": department_data.get("status_id", 1),
# #     #             "is_global": True,
# #     #             "parent_department_id": None,
# #     #             "branch_ids": json.dumps(branch_ids),
# #     #             "created_at": current_time,
# #     #             "updated_at": current_time,
# #     #         }
# #     #         department_id = db.execute_insert(insert_query, insert_data)
# #     #         return DepartmentService.get_department_by_id(department_id)

# #     #     except Exception as e:
# #     #         print(f"Error creating main department: {e}")
# #     #         raise

# #     @staticmethod
# #     def create_sub_department(department_data: Dict[str, Any]) -> Dict[str, Any]:
# #         """Create a sub-department"""
# #         try:
# #             company_id = department_data['company_id']
# #             parent_department_id = department_data.get('parent_department_id')
# #             branch_ids = department_data.get('branch_ids')

# #             if not parent_department_id:
# #                 raise ValueError("Parent department is required for sub-departments")

# #             # Check parent department
# #             parent_dept = db.execute_query_one(
# #                 "SELECT department_id FROM departments WHERE department_id = %s AND company_id = %s",
# #                 (parent_department_id, company_id)
# #             )
# #             if not parent_dept:
# #                 raise ValueError("Parent department not found")

# #             # Validate branches
# #             if branch_ids:
# #                 for bid in branch_ids:
# #                     branch = db.execute_query_one(
# #                         "SELECT branch_id FROM branches WHERE branch_id = %s AND company_id = %s",
# #                         (bid, company_id)
# #                     )
# #                     if not branch:
# #                         raise ValueError(f"Branch ID {bid} is invalid for this company")

# #             current_time = datetime.utcnow()
# #             insert_query = """
# #                 INSERT INTO departments 
# #                 (company_id, branch_id, branch_ids, department_name, short_code, description, 
# #                 status_id, is_global, parent_department_id, created_at, updated_at)
# #                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
# #             """
# #             department_id = db.execute_insert(insert_query, (
# #                 company_id,
# #                 None,
# #                 json.dumps(branch_ids) if branch_ids else None,
# #                 department_data['department_name'],
# #                 department_data.get('short_code'),
# #                 department_data.get('description'),
# #                 department_data.get('status_id', 1),
# #                 False,
# #                 parent_department_id,
# #                 current_time,
# #                 current_time
# #             ))
# #             return DepartmentService.get_department_by_id(department_id)

# #         except Exception as e:
# #             print(f"Error creating sub-department: {e}")
# #             raise



# #   # ---------------- FETCH DEPARTMENTS ----------------
# #     @staticmethod
# #     def get_department_by_id(department_id: int) -> Optional[Dict[str, Any]]:
# #         """Get department by ID including branch names from dpt_linkedto_branch"""
# #         try:
# #             # 1️⃣ Get department row
# #             query = """
# #                 SELECT d.*, 
# #                        pd.department_name AS parent_department_name
# #                 FROM departments d
# #                 LEFT JOIN departments pd ON d.parent_department_id = pd.department_id
# #                 WHERE d.department_id = %s
# #             """
# #             row = db.execute_query_one(query, (department_id,))
# #             if not row:
# #                 return None

# #             dept = DepartmentService._format_department_response(row)

# #             # 2️⃣ Get linked branch_ids from dpt_linkedto_branch
# #             linked_rows = db.execute_query_all(
# #                 "SELECT branch_id FROM dpt_linkedto_branch WHERE department_id = %s",
# #                 (department_id,)
# #             )
# #             branch_ids = [r['branch_id'] for r in linked_rows] if linked_rows else []

# #             # 3️⃣ Fetch branch names
# #             branch_names = []
# #             if branch_ids:
# #                 placeholders = ", ".join(["%s"] * len(branch_ids))
# #                 branch_rows = db.execute_query_all(
# #                     f"SELECT branch_id, branch_name FROM branches WHERE branch_id IN ({placeholders})",
# #                     tuple(branch_ids)
# #                 )
# #                 branch_map = {b["branch_id"]: b["branch_name"] for b in branch_rows}
# #                 branch_names = [branch_map.get(bid, "N/A") for bid in branch_ids]

# #             dept["branch_ids"] = branch_ids
# #             dept["branch_names"] = branch_names

# #             return dept

# #         except Exception as e:
# #             print(f"Error getting department by ID: {e}")
# #             return None


# #     # ---------------- FETCH DEPARTMENTS ----------------
# #     # @staticmethod
# #     # def get_department_by_id(department_id: int) -> Optional[Dict[str, Any]]:
# #     #     """Get department by ID including branch names"""
# #     #     try:
# #     #         query = """
# #     #             SELECT d.*, 
# #     #                    pd.department_name AS parent_department_name
# #     #             FROM departments d
# #     #             LEFT JOIN departments pd ON d.parent_department_id = pd.department_id
# #     #             WHERE d.department_id = %s
# #     #         """
# #     #         row = db.execute_query_one(query, (department_id,))
# #     #         if not row:
# #     #             return None

# #     #         dept = DepartmentService._format_department_response(row)

# #     #         # Fetch branch names
# #     #         branch_ids = dept.get("branch_ids") or ([dept["branch_id"]] if dept.get("branch_id") else [])
# #     #         branch_names = []
# #     #         if branch_ids:
# #     #             placeholders = ", ".join(["%s"] * len(branch_ids))
# #     #             branch_rows = db.execute_query_all(
# #     #                 f"SELECT branch_id, branch_name FROM branches WHERE branch_id IN ({placeholders})",
# #     #                 tuple(branch_ids)
# #     #             )
# #     #             branch_map = {b["branch_id"]: b["branch_name"] for b in branch_rows}
# #     #             branch_names = [branch_map.get(bid, "N/A") for bid in branch_ids]

# #     #         dept["branch_ids"] = branch_ids
# #     #         dept["branch_names"] = branch_names

# #     #         return dept
# #     #     except Exception as e:
# #     #         print(f"Error getting department by ID: {e}")
# #     #         return None



# #     @staticmethod
# #     def get_department_by_name_and_company(department_name: str, company_id: int, 
# #                                            branch_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
# #         try:
# #             query = "SELECT * FROM departments WHERE department_name = %s AND company_id = %s"
# #             params = [department_name, company_id]
# #             if branch_id:
# #                 query += " AND branch_id = %s"
# #                 params.append(branch_id)
# #             return db.execute_query_one(query, tuple(params))
# #         except Exception as e:
# #             print(f"Error getting department by name and company: {e}")
# #             return None

# #     @staticmethod
# #     def get_all_departments(company_id: Optional[int] = None,
# #                             branch_id: Optional[int] = None,
# #                             is_main: Optional[bool] = None,
# #                             active_only: Optional[bool] = None) -> List[Dict[str, Any]]:

# #         params = []
# #         where_clause = "WHERE 1=1"
# #         if company_id:
# #             where_clause += " AND d.company_id = %s"
# #             params.append(company_id)
# #         if branch_id:
# #             where_clause += " AND d.branch_id = %s"
# #             params.append(branch_id)
# #         if is_main is not None:
# #             where_clause += " AND d.is_global = %s"
# #             params.append(is_main)
# #         if active_only:
# #             where_clause += " AND d.status_id = 1"

# #         query = f"""
# #             SELECT d.*, c.company_name, s.status_name AS status
# #             FROM departments d
# #             LEFT JOIN companies c ON d.company_id = c.company_id
# #             LEFT JOIN status s ON d.status_id = s.status_id
# #             {where_clause}
# #             ORDER BY d.created_at DESC
# #         """
# #         rows = db.execute_query_all(query, tuple(params) if params else None)

# #         # Collect branch_ids
# #         all_branch_ids = set()
# #         for r in rows:
# #             if r.get("branch_ids"):
# #                 try:
# #                     ids = json.loads(r["branch_ids"])
# #                     all_branch_ids.update(ids)
# #                 except: pass
# #             elif r.get("branch_id"):
# #                 all_branch_ids.add(r["branch_id"])

# #         branch_map = {}
# #         if all_branch_ids:
# #             placeholders = ", ".join(["%s"] * len(all_branch_ids))
# #             branch_rows = db.execute_query_all(
# #                 f"SELECT branch_id, branch_name FROM branches WHERE branch_id IN ({placeholders})",
# #                 tuple(all_branch_ids)
# #             )
# #             branch_map = {b["branch_id"]: b["branch_name"] for b in branch_rows}

# #         formatted = []
# #         for r in rows:
# #             dept = DepartmentService._format_department_response(r)
# #             branch_ids = dept.get("branch_ids") or ([dept["branch_id"]] if dept.get("branch_id") else [])
# #             dept["branch_ids"] = branch_ids
# #             dept["branch_names"] = [branch_map.get(bid, "N/A") for bid in branch_ids]
# #             formatted.append(dept)

# #         return formatted

# #     # ---------------- UPDATE / DELETE ----------------
# #     @staticmethod
# #     def update_department(department_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
# #         if not DepartmentService.check_department_exists(department_id):
# #             raise ValueError(f"Department with ID {department_id} not found")

# #         branch_ids = update_data.pop("branch_ids", None)
# #         allowed_fields = [
# #             "department_name", "company_id", "short_code",
# #             "description", "status_id", "is_global",
# #             "parent_department_id"
# #         ]
# #         set_clauses = []
# #         params = []
# #         for field in allowed_fields:
# #             if field in update_data and update_data[field] is not None:
# #                 set_clauses.append(f"{field} = %s")
# #                 params.append(update_data[field])
# #         if branch_ids is not None:
# #             set_clauses.append("branch_ids = %s")
# #             params.append(json.dumps(branch_ids))
# #         set_clauses.append("updated_at = %s")
# #         params.append(datetime.utcnow())
# #         params.append(department_id)

# #         update_query = f"UPDATE departments SET {', '.join(set_clauses)} WHERE department_id = %s"
# #         db.execute_update(update_query, tuple(params))
# #         return DepartmentService.get_department_by_id(department_id)

# #     @staticmethod
# #     def delete_department(department_id: int) -> bool:
# #         if not DepartmentService.check_department_exists(department_id):
# #             raise ValueError(f"Department with ID {department_id} not found")
# #         db.execute_update("UPDATE departments SET status_id = %s, updated_at = %s WHERE department_id = %s",
# #                           (3, datetime.utcnow(), department_id))
# #         return True

# #     @staticmethod
# #     def check_department_exists(department_id: int) -> bool:
# #         result = db.execute_query_one("SELECT 1 FROM departments WHERE department_id = %s", (department_id,))
# #         return result is not None

# #     # ---------------- HELPERS ----------------
# #     @staticmethod
# #     def _format_department_response(row: Dict[str, Any]) -> Dict[str, Any]:
# #         status_id_value = row.get('status_id', 1)
# #         status = row.get('status') or {1: 'Active', 2: 'Inactive', 3: 'Archived'}.get(status_id_value, 'Active')
# #         return {
# #             'department_id': row['department_id'],
# #             'department_name': row.get('department_name'),
# #             'name': row.get('department_name'),
# #             'company_id': row['company_id'],
# #             'company_name': row.get('company_name') or "N/A",
# #             'branch_id': row.get('branch_id'),
# #             'branch_ids': json.loads(row.get("branch_ids")) if row.get("branch_ids") else [],
# #             'branch_name': row.get("branch_name") or "N/A",
# #             'is_global': row.get('is_global'),
# #             'parent_department_id': row.get('parent_department_id'),
# #             'parent_department_name': row.get("parent_department_name"),
# #             'short_code': row.get('short_code'),
# #             'description': row.get('description'),
# #             'status_id': status_id_value,
# #             'status': status,
# #             'created_at': row['created_at'],
# #             'updated_at': row['updated_at']
# #         }
# from database import db
# from typing import Dict, Any, List, Optional
# from datetime import datetime


# class DepartmentService:

#     # ---------- CREATE (MAIN / SUB) ----------
#     @staticmethod
#     def create_department(data: Dict[str, Any]) -> Dict[str, Any]:
#         company_id = data["company_id"]
#         department_name = data["department_name"]
#         branch_ids = data["branch_ids"]

#         if not branch_ids:
#             raise ValueError("At least one branch is required")

#         # Duplicate check
#         exists = db.execute_query_one(
#             "SELECT 1 FROM departments WHERE department_name=%s AND company_id=%s",
#             (department_name, company_id)
#         )
#         if exists:
#             raise ValueError("Department already exists")

#         now = datetime.utcnow()

#         dept_id = db.execute_insert("""
#             INSERT INTO departments
#             (company_id, department_name, is_global, parent_department_id,
#              short_code, description, status_id, created_at, updated_at)
#             VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
#         """, (
#             company_id,
#             department_name,
#             data.get("is_global", False),
#             data.get("parent_department_id"),
#             data.get("short_code"),
#             data.get("description"),
#             data.get("status_id", 1),
#             now,
#             now
#         ))

#         # Link branches
#         for bid in branch_ids:
#             db.execute_insert(
#                 "INSERT INTO dpt_linkedto_branch (department_id, branch_id) VALUES (%s,%s)",
#                 (dept_id, bid)
#             )

#         return DepartmentService.get_department_by_id(dept_id)

#     # ---------- GET BY ID ----------
#     @staticmethod
#     def get_department_by_id(department_id: int) -> Optional[Dict[str, Any]]:
#         dept = db.execute_query_one("""
#             SELECT d.*, p.department_name AS parent_department_name
#             FROM departments d
#             LEFT JOIN departments p ON d.parent_department_id=p.department_id
#             WHERE d.department_id=%s
#         """, (department_id,))
#         if not dept:
#             return None

#         branches = db.execute_query_all("""
#             SELECT b.branch_id, b.branch_name
#             FROM dpt_linkedto_branch dl
#             JOIN branches b ON b.branch_id = dl.branch_id
#             WHERE dl.department_id=%s
#         """, (department_id,))

#         return {
#             **dept,
#             "branch_ids": [b["branch_id"] for b in branches],
#             "branch_names": [b["branch_name"] for b in branches]
#         }

#     # ---------- GET ALL ----------
#     @staticmethod
#     def get_all_departments(company_id=None, branch_id=None) -> List[Dict[str, Any]]:
#         where = "WHERE 1=1"
#         params = []

#         if company_id:
#             where += " AND d.company_id=%s"
#             params.append(company_id)

#         if branch_id:
#             where += " AND d.department_id IN (SELECT department_id FROM dpt_linkedto_branch WHERE branch_id=%s)"
#             params.append(branch_id)

#         rows = db.execute_query_all(f"""
#             SELECT d.* FROM departments d
#             {where}
#             ORDER BY d.created_at DESC
#         """, tuple(params))

#         return [DepartmentService.get_department_by_id(r["department_id"]) for r in rows]

#     # ---------- UPDATE ----------
#     @staticmethod
#     def update_department(department_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
#         fields = []
#         params = []

#         for key in ["department_name", "short_code", "description", "status_id"]:
#             if key in data:
#                 fields.append(f"{key}=%s")
#                 params.append(data[key])

#         if fields:
#             params.append(datetime.utcnow())
#             params.append(department_id)
#             db.execute_update(
#                 f"UPDATE departments SET {','.join(fields)}, updated_at=%s WHERE department_id=%s",
#                 tuple(params)
#             )

#         # Update branches
#         if "branch_ids" in data:
#             db.execute_update(
#                 "DELETE FROM dpt_linkedto_branch WHERE department_id=%s",
#                 (department_id,)
#             )
#             for bid in data["branch_ids"]:
#                 db.execute_insert(
#                     "INSERT INTO dpt_linkedto_branch (department_id, branch_id) VALUES (%s,%s)",
#                     (department_id, bid)
#                 )

#         return DepartmentService.get_department_by_id(department_id)

#     # ---------- ARCHIVE ----------
#     @staticmethod
#     def archive_department(department_id: int):
#         db.execute_update(
#             "UPDATE departments SET status_id=3, updated_at=%s WHERE department_id=%s",
#             (datetime.utcnow(), department_id)
#         )
# @staticmethod
# def get_main_departments(company_id: int) -> List[Dict[str, Any]]:
#     # 1️⃣ Fetch main departments
#     departments = db.execute_query_all("""
#         SELECT d.*
#         FROM departments d
#         WHERE d.company_id = %s
#           AND d.is_global = 1
#           AND d.parent_department_id IS NULL
#           AND d.status_id != 3
#         ORDER BY d.department_name
#     """, (company_id,))

#     if not departments:
#         return []

#     dept_ids = [d["department_id"] for d in departments]

#     # 2️⃣ Fetch branch mappings
#     placeholders = ",".join(["%s"] * len(dept_ids))
#     branch_rows = db.execute_query_all(f"""
#         SELECT dl.department_id, b.branch_id, b.branch_name
#         FROM dpt_linkedto_branch dl
#         JOIN branches b ON b.branch_id = dl.branch_id
#         WHERE dl.department_id IN ({placeholders})
#     """, tuple(dept_ids))

#     # 3️⃣ Map branches to departments
#     branch_map = {}
#     for row in branch_rows:
#         dept_id = row["department_id"]
#         branch_map.setdefault(dept_id, {
#             "branch_ids": [],
#             "branch_names": []
#         })
#         branch_map[dept_id]["branch_ids"].append(row["branch_id"])
#         branch_map[dept_id]["branch_names"].append(row["branch_name"])

#     # 4️⃣ Final response
#     result = []
#     for d in departments:
#         branches = branch_map.get(d["department_id"], {
#             "branch_ids": [],
#             "branch_names": []
#         })

#         result.append({
#             "department_id": d["department_id"],
#             "department_name": d["department_name"],
#             "name": d["department_name"],
#             "company_id": d["company_id"],
#             "branch_ids": branches["branch_ids"],
#             "branch_names": branches["branch_names"],
#             "is_global": d["is_global"],
#             "parent_department_id": d["parent_department_id"],
#             "short_code": d["short_code"],
#             "description": d["description"],
#             "status_id": d["status_id"],
#             "created_at": d["created_at"],
#             "updated_at": d["updated_at"]
#         })

#     return result
# @staticmethod
# def get_departments_by_company_branch(
#     company_id: int,
#     branch_id: int
# ) -> List[Dict[str, Any]]:

#     rows = db.execute_query_all("""
#         SELECT DISTINCT d.*
#         FROM departments d
#         JOIN dpt_linkedto_branch dl
#           ON dl.department_id = d.department_id
#         WHERE d.company_id = %s
#           AND dl.branch_id = %s
#           AND d.status_id != 3
#         ORDER BY d.department_name
#     """, (company_id, branch_id))

#     if not rows:
#         return []

#     dept_ids = [r["department_id"] for r in rows]

#     placeholders = ",".join(["%s"] * len(dept_ids))
#     branch_rows = db.execute_query_all(f"""
#         SELECT dl.department_id, b.branch_id, b.branch_name
#         FROM dpt_linkedto_branch dl
#         JOIN branches b ON b.branch_id = dl.branch_id
#         WHERE dl.department_id IN ({placeholders})
#     """, tuple(dept_ids))

#     branch_map = {}
#     for r in branch_rows:
#         branch_map.setdefault(r["department_id"], {
#             "branch_ids": [],
#             "branch_names": []
#         })
#         branch_map[r["department_id"]]["branch_ids"].append(r["branch_id"])
#         branch_map[r["department_id"]]["branch_names"].append(r["branch_name"])

#     result = []
#     for d in rows:
#         branches = branch_map.get(d["department_id"], {
#             "branch_ids": [],
#             "branch_names": []
#         })

#         result.append({
#             "department_id": d["department_id"],
#             "department_name": d["department_name"],
#             "name": d["department_name"],
#             "company_id": d["company_id"],
#             "branch_ids": branches["branch_ids"],
#             "branch_names": branches["branch_names"],
#             "is_global": d["is_global"],
#             "parent_department_id": d["parent_department_id"],
#             "short_code": d["short_code"],
#             "description": d["description"],
#             "status_id": d["status_id"],
#             "created_at": d["created_at"],
#             "updated_at": d["updated_at"]
#         })

#     return result
from database import db
from datetime import datetime
from typing import List, Dict, Optional


class DepartmentService:

    # ---------- CREATE MAIN ----------
    @staticmethod
    def create_main_department(company_id, department_name, short_code, description, status_id, branch_ids):
        DepartmentService._validate_company_and_branches(company_id, branch_ids)

        dept_id = db.execute_insert("""
            INSERT INTO departments
            (company_id, department_name, short_code, description, status_id, is_global, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,1,%s,%s)
        """, (
            company_id, department_name, short_code, description, status_id,
            datetime.utcnow(), datetime.utcnow()
        ))

        DepartmentService._insert_branch_links(dept_id, branch_ids)
        return DepartmentService.get_department_by_id(dept_id)

    # ---------- CREATE SUB ----------
    @staticmethod
    def create_sub_department(company_id, department_name, parent_id, branch_ids, short_code, description, status_id):
        DepartmentService._validate_company_and_branches(company_id, branch_ids)

        dept_id = db.execute_insert("""
            INSERT INTO departments
            (company_id, department_name, parent_department_id, short_code, description,
             status_id, is_global, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,0,%s,%s)
        """, (
            company_id, department_name, parent_id, short_code,
            description, status_id, datetime.utcnow(), datetime.utcnow()
        ))

        DepartmentService._insert_branch_links(dept_id, branch_ids)
        return DepartmentService.get_department_by_id(dept_id)

    # ---------- GET BY ID ----------
    @staticmethod
    def get_department_by_id(department_id: int) -> Optional[Dict]:
        dept = db.execute_query_one("""
            SELECT d.*, pd.department_name AS parent_department_name
            FROM departments d
            LEFT JOIN departments pd ON d.parent_department_id = pd.department_id
            WHERE d.department_id=%s
        """, (department_id,))

        if not dept:
            return None

        branches = DepartmentService._get_branches_for_department(department_id)
        dept["branch_ids"] = [b["branch_id"] for b in branches]
        # dept["branch_names"] = [b["branch_name"] for b in branches]
        return dept

    # ---------- GET ALL ----------
    @staticmethod
    def get_all_departments(company_id=None, branch_id=None, is_main=None):
        query = """
            SELECT DISTINCT d.*
            FROM departments d
            LEFT JOIN dpt_linkedto_branch dl ON d.department_id = dl.department_id
            WHERE 1=1
        """
        params = []

        if company_id:
            query += " AND d.company_id=%s"
            params.append(company_id)
        if branch_id:
            query += " AND dl.branch_id=%s"
            params.append(branch_id)
        if is_main is not None:
            query += " AND d.is_global=%s"
            params.append(is_main)

        rows = db.execute_query_all(query, tuple(params))
        return [DepartmentService.get_department_by_id(r["department_id"]) for r in rows]

    # ---------- MAIN DROPDOWN ----------
    @staticmethod
    def get_main_departments(company_id):
        rows = db.execute_query_all("""
            SELECT department_id FROM departments
            WHERE company_id=%s AND is_global=1 AND parent_department_id IS NULL AND status_id=1
        """, (company_id,))
        return [DepartmentService.get_department_by_id(r["department_id"]) for r in rows]

    # ---------- UPDATE ----------
    @staticmethod
    def update_department(dept_id, name, short_code, description, status_id, branch_ids):
        if name:
            db.execute_update("UPDATE departments SET department_name=%s WHERE department_id=%s", (name, dept_id))
        if short_code:
            db.execute_update("UPDATE departments SET short_code=%s WHERE department_id=%s", (short_code, dept_id))
        if description:
            db.execute_update("UPDATE departments SET description=%s WHERE department_id=%s", (description, dept_id))
        if status_id:
            db.execute_update("UPDATE departments SET status_id=%s WHERE department_id=%s", (status_id, dept_id))

        if branch_ids is not None:
            db.execute_update("DELETE FROM dpt_linkedto_branch WHERE department_id=%s", (dept_id,))
            DepartmentService._insert_branch_links(dept_id, branch_ids)

        return DepartmentService.get_department_by_id(dept_id)

    # ---------- DELETE ----------
    @staticmethod
    def delete_department(department_id):
        db.execute_update(
            "UPDATE departments SET status_id=3, updated_at=%s WHERE department_id=%s",
            (datetime.utcnow(), department_id)
        )

    # ---------- COMPANY + BRANCH ----------
    @staticmethod
    def get_departments_by_company_branch(company_id, branch_id):
        rows = db.execute_query_all("""
            SELECT d.department_id
            FROM departments d
            JOIN dpt_linkedto_branch dl ON d.department_id=dl.department_id
            WHERE d.company_id=%s AND dl.branch_id=%s
        """, (company_id, branch_id))

        return [DepartmentService.get_department_by_id(r["department_id"]) for r in rows]

    # ---------- HELPERS ----------
    @staticmethod
    def _insert_branch_links(dept_id, branch_ids):
        for bid in branch_ids:
            db.execute_insert(
                "INSERT INTO dpt_linkedto_branch (department_id, branch_id) VALUES (%s,%s)",
                (dept_id, bid)
            )

    @staticmethod
    def _get_branches_for_department(dept_id):
        return db.execute_query_all("""
            SELECT b.branch_id, b.branch_name
            FROM dpt_linkedto_branch dl
            JOIN branches b ON dl.branch_id=b.branch_id
            WHERE dl.department_id=%s
        """, (dept_id,))

    @staticmethod
    def _validate_company_and_branches(company_id, branch_ids):
        for bid in branch_ids:
            if not db.execute_query_one(
                "SELECT 1 FROM branches WHERE branch_id=%s AND company_id=%s",
                (bid, company_id)
            ):
                raise ValueError(f"Invalid branch {bid}")
