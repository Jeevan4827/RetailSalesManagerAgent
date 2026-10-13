import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager
from typing import List, Dict, Any, Tuple, Optional
from app.config import settings

class DatabaseConnectionError(Exception):
    pass

class DatabaseExecutionError(Exception):
    pass

def get_connection_string() -> str:
    return (
        f"host={settings.SUPABASE_DB_HOST} "
        f"port={settings.SUPABASE_DB_PORT} "
        f"dbname={settings.SUPABASE_DB_NAME} "
        f"user={settings.SUPABASE_DB_USER} "
        f"password={settings.SUPABASE_DB_PASSWORD} "
        f"sslmode={settings.SUPABASE_DB_SSLMODE} "
        f"connect_timeout=10"
    )

@contextmanager
def get_db_connection():
    """
    Context manager that yields a psycopg connection configured to read-only transaction mode.
    """
    conn = None
    try:
        conn = psycopg.connect(get_connection_string(), row_factory=dict_row)
        # Set session-level read-only and statement timeout
        conn.read_only = True
        with conn.cursor() as cur:
            cur.execute(f"SET statement_timeout = '{settings.QUERY_TIMEOUT_SECONDS * 1000}';")
        yield conn
    except psycopg.OperationalError as e:
        raise DatabaseConnectionError(f"Database connection failed: {str(e)}")
    finally:
        if conn and not conn.closed:
            conn.close()

def check_db_health() -> Tuple[bool, str]:
    """
    Checks database connectivity and table accessibility.
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT count(*) AS total FROM public.retail_inventory;")
                res = cur.fetchone()
                total = res["total"] if res else 0
                return True, f"Connected to Supabase PostgreSQL table public.retail_inventory. Total records: {total}"
    except Exception as e:
        return False, str(e)

def execute_readonly_query(sql_query: str) -> List[Dict[str, Any]]:
    """
    Executes a sanitized read-only query and returns rows as serializable dictionaries.
    """
    try:
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(sql_query)
                    rows = cur.fetchall()
                    clean_rows = []
                    for row in rows:
                        clean_row = {}
                        for k, v in row.items():
                            if hasattr(v, "isoformat"):
                                clean_row[k] = v.isoformat()
                            elif hasattr(v, "to_eng_string"):
                                clean_row[k] = float(v)
                            else:
                                clean_row[k] = v
                        clean_rows.append(clean_row)
                    return clean_rows
    except psycopg.Error as e:
        raise DatabaseExecutionError(f"Database error executing query: {str(e)}")
    except Exception as e:
        raise DatabaseExecutionError(f"Unexpected error executing query: {str(e)}")

def get_table_schema_info() -> Dict[str, Any]:
    """
    Retrieves column names, data types, and row count from Supabase.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'retail_inventory'
                ORDER BY ordinal_position;
            """)
            cols = cur.fetchall()

            cur.execute("SELECT count(*) AS count FROM public.retail_inventory;")
            count_res = cur.fetchone()
            count = count_res["count"] if count_res else 0

            return {
                "table_name": "public.retail_inventory",
                "count": count,
                "columns": cols
            }

@contextmanager
def get_write_db_connection():
    """
    Context manager yielding a read-write database connection specifically for chat session storage.
    """
    conn = None
    try:
        conn = psycopg.connect(get_connection_string(), row_factory=dict_row)
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute("SET statement_timeout = '10000';")
        yield conn
    except psycopg.OperationalError as e:
        raise DatabaseConnectionError(f"Database connection failed: {str(e)}")
    finally:
        if conn and not conn.closed:
            conn.close()

def save_chat_session(title: str, messages: List[Dict[str, Any]], session_id: Optional[str] = None) -> str:
    """
    Saves or updates a chat session and synchronizes all messages to public.chat_sessions & public.chat_messages.
    """
    import json
    with get_write_db_connection() as conn:
        with conn.cursor() as cur:
            if session_id:
                # Check if session exists
                cur.execute("SELECT id FROM public.chat_sessions WHERE id = %s;", (session_id,))
                exists = cur.fetchone()
                if exists:
                    cur.execute(
                        "UPDATE public.chat_sessions SET title = %s, updated_at = NOW() WHERE id = %s;",
                        (title, session_id)
                    )
                    # Clear previous messages to replace with current full conversation trajectory
                    cur.execute("DELETE FROM public.chat_messages WHERE session_id = %s;", (session_id,))
                else:
                    cur.execute(
                        "INSERT INTO public.chat_sessions (id, title) VALUES (%s, %s) RETURNING id;",
                        (session_id, title)
                    )
            else:
                # Insert brand new session
                cur.execute(
                    "INSERT INTO public.chat_sessions (title) VALUES (%s) RETURNING id;",
                    (title,)
                )
                session_id = str(cur.fetchone()["id"])

            # Insert all messages in the trajectory
            for msg in messages:
                data_json = json.dumps(msg.get("data")) if msg.get("data") is not None else None
                cur.execute("""
                    INSERT INTO public.chat_messages (session_id, role, content, sql, data)
                    VALUES (%s, %s, %s, %s, %s);
                """, (
                    session_id,
                    msg["role"],
                    msg["content"],
                    msg.get("sql"),
                    data_json
                ))

            return session_id

def list_chat_sessions() -> List[Dict[str, Any]]:
    """
    Lists saved chat sessions ordered by last updated.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.id, s.title, s.created_at, s.updated_at,
                       COUNT(m.id) AS message_count
                FROM public.chat_sessions s
                LEFT JOIN public.chat_messages m ON s.id = m.session_id
                GROUP BY s.id, s.title, s.created_at, s.updated_at
                ORDER BY s.updated_at DESC
                LIMIT 50;
            """)
            rows = cur.fetchall()
            clean_rows = []
            for r in rows:
                clean_rows.append({
                    "id": str(r["id"]),
                    "title": r["title"],
                    "created_at": r["created_at"].isoformat() if hasattr(r["created_at"], "isoformat") else str(r["created_at"]),
                    "updated_at": r["updated_at"].isoformat() if hasattr(r["updated_at"], "isoformat") else str(r["updated_at"]),
                    "message_count": int(r["message_count"])
                })
            return clean_rows

def get_chat_session_detail(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Loads a single chat session and its full message trajectory.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, title, created_at, updated_at FROM public.chat_sessions WHERE id = %s;", (session_id,))
            session = cur.fetchone()
            if not session:
                return None

            cur.execute("""
                SELECT id, role, content, sql, data, created_at
                FROM public.chat_messages
                WHERE session_id = %s
                ORDER BY created_at ASC;
            """, (session_id,))
            messages = cur.fetchall()

            clean_messages = []
            for m in messages:
                clean_messages.append({
                    "id": str(m["id"]),
                    "role": m["role"],
                    "content": m["content"],
                    "sql": m["sql"],
                    "data": m["data"],
                    "timestamp": m["created_at"].strftime("%I:%M %p") if hasattr(m["created_at"], "strftime") else str(m["created_at"])
                })

            return {
                "id": str(session["id"]),
                "title": session["title"],
                "created_at": session["created_at"].isoformat() if hasattr(session["created_at"], "isoformat") else str(session["created_at"]),
                "updated_at": session["updated_at"].isoformat() if hasattr(session["updated_at"], "isoformat") else str(session["updated_at"]),
                "messages": clean_messages
            }

def delete_chat_session(session_id: str) -> bool:
    """
    Deletes a chat session (cascades to messages).
    """
    with get_write_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM public.chat_sessions WHERE id = %s RETURNING id;", (session_id,))
            deleted = cur.fetchone()
            return deleted is not None
