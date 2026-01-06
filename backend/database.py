import pymysql
from queue import Queue, Empty
from typing import Generator, Optional, Dict, Any, List
import os
from contextlib import contextmanager

class Database:
    def __init__(self):
        self._pool = None
        # Store database configuration to ensure consistency
        self.db_name = os.getenv("DB_NAME", "pv_updated")
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = int(os.getenv("DB_PORT", "3306"))
        self.db_user = os.getenv("DB_USER", "root")
        self.db_password = os.getenv("DB_PASSWORD", "Root@3214")
        print(f"Initializing database connection to: {self.db_name}")
        self._initialize_pool()
    
    def _initialize_pool(self):
        """Initialize MySQL connection pool"""
        self._pool = Queue(maxsize=int(os.getenv("DB_POOL_SIZE", "5")))
        
        # Create initial connections
        for _ in range(int(os.getenv("DB_POOL_SIZE", "5"))):
            try:
                conn = self._create_connection()
                self._pool.put(conn)
            except Exception as e:
                print(f"Failed to create database connection: {e}")
                print(f"DB_HOST: {self.db_host}")
                print(f"DB_PORT: {self.db_port}")
                print(f"DB_USER: {self.db_user}")
                print(f"DB_NAME: {self.db_name}")
                raise
    
    def _create_connection(self):
        """Create a new MySQL connection"""
        # Always use the stored database name, not environment variable
        # This ensures consistency even if env vars change
        conn = pymysql.connect(
            host=self.db_host,
            port=self.db_port,
            user=self.db_user,
            password=self.db_password,
            database=self.db_name,
            autocommit=True,
            cursorclass=pymysql.cursors.DictCursor,
            charset="utf8mb4",
            connect_timeout=10,
        )
        # Verify the connection is using the correct database
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT DATABASE() as current_db")
                result = cursor.fetchone()
                actual_db = result.get('current_db') if result else None
                if actual_db != self.db_name:
                    print(f"WARNING: Connection using database '{actual_db}' instead of '{self.db_name}'")
                    conn.close()
                    # Force reconnect with correct database
                    conn = pymysql.connect(
                        host=self.db_host,
                        port=self.db_port,
                        user=self.db_user,
                        password=self.db_password,
                        database=self.db_name,
                        autocommit=True,
                        cursorclass=pymysql.cursors.DictCursor,
                        charset="utf8mb4",
                        connect_timeout=10,
                    )
                # Connection verified successfully
        except Exception as e:
            print(f"Error verifying database connection: {e}")
        return conn
    
    @contextmanager
    def get_connection(self):
        """Get a connection from the pool"""
        conn = None
        try:
            try:
                conn = self._pool.get(block=True, timeout=5)
                # Test connection and verify database
                conn.ping(reconnect=False)
                # Verify the connection is using the correct database
                with conn.cursor() as cursor:
                    cursor.execute("SELECT DATABASE() as current_db")
                    result = cursor.fetchone()
                    actual_db = result.get('current_db') if result else None
                    if actual_db != self.db_name:
                        print(f"WARNING: Pool connection using wrong database '{actual_db}', expected '{self.db_name}'. Recreating connection.")
                        conn.close()
                        conn = self._create_connection()
            except Empty:
                # If pool is empty, create a new connection
                conn = self._create_connection()
            except Exception as e:
                print(f"Error getting connection from pool: {e}")
                if conn:
                    try:
                        conn.close()
                    except:
                        pass
                conn = self._create_connection()
            
            yield conn
            
        except Exception as e:
            print(f"Error in connection context manager: {e}")
            # If we get an error, create a fresh connection
            if conn:
                try:
                    conn.close()
                except:
                    pass
            conn = self._create_connection()
            yield conn
        finally:
            if conn:
                try:
                    # Verify connection is still valid and using correct database
                    conn.ping(reconnect=False)
                    with conn.cursor() as cursor:
                        cursor.execute("SELECT DATABASE() as current_db")
                        result = cursor.fetchone()
                        actual_db = result.get('current_db') if result else None
                        if actual_db == self.db_name:
                            self._pool.put(conn)
                        else:
                            print(f"Connection using wrong database '{actual_db}', closing instead of returning to pool")
                            conn.close()
                except:
                    # If connection is invalid, close it instead of putting back
                    try:
                        conn.close()
                    except:
                        pass
    
    def execute_query_one(self, query: str, params: tuple = None) -> Optional[Dict[str, Any]]:
        """Execute a query and return one result"""
        conn = None
        try:
            # Create a fresh connection for each query to avoid pool issues
            conn = self._create_connection()
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                result = cursor.fetchone()
                return result
        except Exception as e:
            print(f"Database query error: {e}")
            print(f"Query: {query}")
            print(f"Params: {params}")
            print(f"Current database: {self.db_name}")
            raise
        finally:
            if conn:
                try:
                    conn.close()
                except:
                    pass
    
    def execute_query_all(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a query and return all results"""
        conn = None
        try:
            conn = self._create_connection()
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            print(f"Database query error: {e}")
            print(f"Query: {query}")
            print(f"Params: {params}")
            print(f"Current database: {self.db_name}")
            raise
        finally:
            if conn:
                try:
                    conn.close()
                except:
                    pass
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute an update/insert/delete query and return affected rows"""
        conn = None
        try:
            conn = self._create_connection()
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.rowcount
        finally:
            if conn:
                try:
                    conn.close()
                except:
                    pass
    
    def execute_insert(self, query: str, params: tuple = None) -> int:
        """Execute an insert query and return the last row ID"""
        conn = None
        try:
            conn = self._create_connection()
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.lastrowid
        finally:
            if conn:
                try:
                    conn.close()
                except:
                    pass
    
    def close(self):
        """Close all connections in the pool"""
        if self._pool:
            while not self._pool.empty():
                try:
                    conn = self._pool.get_nowait()
                    conn.close()
                except:
                    pass

# Global database instance
db = Database()
