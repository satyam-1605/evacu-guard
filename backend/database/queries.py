from uuid import uuid4
from .connection import get_db

def _row_to_dict(row):
    return dict(row) if row else None

async def create_user(full_name, email, password_hash, role='citizen', phone=None,
                      address=None, emergency_contact_name=None, emergency_contact_phone=None):
    user_id = uuid4().hex
    async with get_db() as db:
        await db.execute(
            """INSERT INTO users (id, full_name, email, phone, password_hash, role, address,
               emergency_contact_name, emergency_contact_phone)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, full_name, email, phone, password_hash, role, address,
             emergency_contact_name, emergency_contact_phone)
        )
        await db.commit()
        async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cur:
            return _row_to_dict(await cur.fetchone())

async def get_user_by_email(email):
    async with get_db() as db:
        async with db.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", (email,)) as cur:
            return _row_to_dict(await cur.fetchone())

async def get_user_by_id(user_id):
    async with get_db() as db:
        async with db.execute("SELECT * FROM users WHERE id = ? AND is_active = 1", (user_id,)) as cur:
            return _row_to_dict(await cur.fetchone())

async def update_user_profile(user_id, **fields):
    if not fields:
        return await get_user_by_id(user_id)
    sets = ", ".join(f"{k} = ?" for k in fields)
    values = list(fields.values()) + [user_id]
    async with get_db() as db:
        await db.execute(f"UPDATE users SET {sets}, updated_at = datetime('now') WHERE id = ?", values)
        await db.commit()
        async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cur:
            return _row_to_dict(await cur.fetchone())

async def get_user_reports(user_id):
    async with get_db() as db:
        async with db.execute("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC", (user_id,)) as cur:
            return [_row_to_dict(r) for r in await cur.fetchall()]

async def create_report(user_id, lat, lng, type, severity, description):
    report_id = uuid4().hex
    async with get_db() as db:
        await db.execute(
            "INSERT INTO reports (id, user_id, lat, lng, type, severity, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (report_id, user_id, lat, lng, type, severity, description)
        )
        await db.commit()
        async with db.execute("SELECT * FROM reports WHERE id = ?", (report_id,)) as cur:
            return _row_to_dict(await cur.fetchone())

async def create_alert(title, description, severity, location, type, created_by=None):
    alert_id = uuid4().hex
    async with get_db() as db:
        await db.execute(
            "INSERT INTO alerts (id, title, description, severity, location, type, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (alert_id, title, description, severity, location, type, created_by)
        )
        await db.commit()
        async with db.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)) as cur:
            return _row_to_dict(await cur.fetchone())

async def get_recent_alerts(limit=50):
    async with get_db() as db:
        async with db.execute("SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?", (limit,)) as cur:
            return [_row_to_dict(r) for r in await cur.fetchall()]

async def create_evacuation_log(user_id, origin_lat, origin_lng, shelter_id, distance_km, eta_minutes, route_type):
    log_id = uuid4().hex
    async with get_db() as db:
        await db.execute(
            """INSERT INTO evacuation_logs (id, user_id, origin_lat, origin_lng, shelter_id,
               distance_km, eta_minutes, route_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (log_id, user_id, origin_lat, origin_lng, shelter_id, distance_km, eta_minutes, route_type)
        )
        await db.commit()
        async with db.execute("SELECT * FROM evacuation_logs WHERE id = ?", (log_id,)) as cur:
            return _row_to_dict(await cur.fetchone())

async def get_user_evacuation_logs(user_id):
    async with get_db() as db:
        async with db.execute(
            "SELECT * FROM evacuation_logs WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ) as cur:
            return [_row_to_dict(r) for r in await cur.fetchall()]
