from database import db
from typing import Dict, Any, List, Optional
import json


class ModuleService:
    @staticmethod
    def get_all_modules() -> List[Dict[str, Any]]:
        """Fetch all modules for dropdown/global usage."""
        try:
            print(f"[INFO] Fetching modules from database '{db.db_name}'...")

            query = """
                SELECT 
                    id,
                    name,
                    module_key,
                    is_active
                FROM modules
            """

            modules = db.execute_query_all(query)

            print(f"[INFO] Total modules fetched: {len(modules)}")

            if modules:
                print(f"[DEBUG] First module record: {modules[0]}")

            return modules

        except Exception as e:
            print(f"[ERROR] Failed to fetch modules: {str(e)}")
            return []

