"""
MeeSeva Mitra AI — Database Connection Helper
Provides database connectivity with transparent support for both MySQL (production/local)
and SQLite (local development fallback with automated seeding).
"""

from __future__ import annotations
import os
import re
import sqlite3
import pymysql
import pymysql.cursors
from dotenv import load_dotenv

load_dotenv()

SQLITE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "database", "meeseva_mitra.db")
)


def get_db_config() -> dict:
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", 3306)),
        "db": os.getenv("DB_NAME", "meeseva_mitra"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "charset": "utf8mb4",
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": True,
        "connect_timeout": 2,
    }


import socket

_cached_db_type: str | None = None


def _ping_mysql() -> bool:
    """Check if MySQL is reachable via fast socket probe."""
    try:
        host = os.getenv("DB_HOST", "localhost")
        port = int(os.getenv("DB_PORT", 3306))
        with socket.create_connection((host, port), timeout=0.2):
            return True
    except Exception:
        return False


def get_db_type() -> str:
    """Return 'mysql' or 'sqlite'."""
    global _cached_db_type
    if _cached_db_type is not None:
        return _cached_db_type

    force_engine = os.getenv("DB_ENGINE", "").lower()
    if force_engine == "mysql":
        _cached_db_type = "mysql"
    elif force_engine == "sqlite":
        _cached_db_type = "sqlite"
    else:
        _cached_db_type = "mysql" if _ping_mysql() else "sqlite"

    return _cached_db_type


class SQLiteCursorWrapper:
    """Adapts an sqlite3 cursor to behave similarly to PyMySQL DictCursor with %s param substitution."""

    def __init__(self, cursor: sqlite3.Cursor):
        self._cur = cursor

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._cur.close()

    def execute(self, sql: str, params: tuple | list | None = None):
        # Convert %s placeholders to ?
        clean_sql = sql
        if params is not None:
            clean_sql = clean_sql.replace("%s", "?")
            return self._cur.execute(clean_sql, params)
        return self._cur.execute(clean_sql)

    def fetchone(self) -> dict | None:
        row = self._cur.fetchone()
        return dict(row) if row else None

    def fetchall(self) -> list[dict]:
        return [dict(r) for r in self._cur.fetchall()]

    @property
    def rowcount(self) -> int:
        return self._cur.rowcount


class SQLiteConnectionWrapper:
    """Wraps an sqlite3.Connection with pymysql-compatible methods."""

    def __init__(self, conn: sqlite3.Connection):
        self._conn = conn

    def cursor(self):
        return SQLiteCursorWrapper(self._conn.cursor())

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()

    def ping(self, reconnect: bool = True):
        # Always healthy if file connection works
        pass


def _get_sqlite_connection():
    from init_sqlite import init_sqlite_db

    if not os.path.exists(SQLITE_PATH):
        init_sqlite_db(SQLITE_PATH)

    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row

    # Register custom REGEXP function for SQLite
    conn.create_function(
        "REGEXP", 2, lambda expr, item: bool(re.search(expr, item or "", re.IGNORECASE))
    )

    return SQLiteConnectionWrapper(conn)


def get_connection():
    """
    Open and return a database connection (MySQL or SQLite fallback).
    Caller is responsible for closing.
    """
    if get_db_type() == "mysql":
        try:
            cfg = get_db_config()
            return pymysql.connect(**cfg)
        except Exception as e:
            # Fall back to SQLite if MySQL fails unexpectedly
            print(f"[db] MySQL connection failed ({e}), falling back to SQLite.")
            return _get_sqlite_connection()
    return _get_sqlite_connection()


def ping_db() -> bool:
    """Return True if either MySQL or SQLite database is reachable."""
    try:
        conn = get_connection()
        conn.ping()
        conn.close()
        return True
    except Exception:
        return False
