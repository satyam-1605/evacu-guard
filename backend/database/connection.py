import aiosqlite
from pathlib import Path
from contextlib import asynccontextmanager

DB_PATH = Path(__file__).parent.parent / "data" / "evacu_guard.db"

@asynccontextmanager
async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("PRAGMA foreign_keys=ON")
        yield db
