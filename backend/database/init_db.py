from uuid import uuid4
from .connection import get_db
from auth.password import hash_password

async def init_database():
    async with get_db() as db:
        # Create tables
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'citizen' CHECK(role IN ('citizen', 'admin')),
                location_lat REAL,
                location_lng REAL,
                address TEXT,
                emergency_contact_name TEXT,
                emergency_contact_phone TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id),
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('waterlogging', 'road_blockage', 'structural_damage', 'fire', 'power_outage', 'other')),
                severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high')),
                description TEXT,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'resolved', 'dismissed')),
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'danger', 'critical')),
                location TEXT,
                type TEXT NOT NULL,
                created_by TEXT REFERENCES users(id),
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS evacuation_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id),
                origin_lat REAL NOT NULL,
                origin_lng REAL NOT NULL,
                shelter_id TEXT NOT NULL,
                distance_km REAL,
                eta_minutes REAL,
                route_type TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)
        await db.commit()

        # Seed admin user
        async with db.execute("SELECT id FROM users WHERE email = ?", ("ssatyamsharma5678@gmail.com",)) as cur:
            if not await cur.fetchone():
                await db.execute(
                    "INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
                    (uuid4().hex, "Satyam Sharma", "ssatyamsharma5678@gmail.com", hash_password("admin123"), "admin")
                )

        # Seed demo citizen
        async with db.execute("SELECT id FROM users WHERE email = ?", ("rahul@example.com",)) as cur:
            if not await cur.fetchone():
                await db.execute(
                    """INSERT INTO users (id, full_name, email, phone, password_hash, role, address,
                       emergency_contact_name, emergency_contact_phone)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (uuid4().hex, "Rahul Sharma", "rahul@example.com", "+91-9876543210",
                     hash_password("demo123"), "citizen", "Mansarovar, Jaipur",
                     "Priya Sharma", "+91-9876543211")
                )

        await db.commit()
        print("[DB] Database initialized and seeded")
