# EvacuGuard — AI-Powered Evacuation Intelligence

> Real-time flood risk scoring · Dynamic route planning · Live shelter tracking — built for Jaipur, Rajasthan.

🌐 **Live Demo:** [https://evacu-guard.vercel.app](https://evacu-guard.vercel.app)

---

## What is it?

EvacuGuard is a full-stack disaster response platform that helps citizens evacuate safely during floods and cloudbursts in Jaipur. It combines live weather data, a trained ML model, and graph-based routing to show real-time hazard zones, nearest shelters, and safe evacuation routes — all in one web dashboard.

Admins can simulate disaster scenarios, broadcast emergency alerts, and manage hazard zones from a protected control panel.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Python 3.11, FastAPI, SQLite (aiosqlite), WebSocket |
| **ML & Routing** | scikit-learn (Random Forest), NetworkX (Dijkstra), Shapely |
| **Data** | Open-Meteo API, OSRM, GeoJSON |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Leaflet, Three.js |
| **Auth** | JWT (python-jose), bcrypt/passlib |
| **i18n** | react-i18next — full English + Hindi support |

---

## Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8002
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — the Vite dev server proxies `/api` to the backend automatically.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | ssatyamsharma5678@gmail.com | admin123 |
| Citizen | rahul@example.com | demo123 |

---

## Deployment

- **Frontend** → Vercel — [https://evacu-guard.vercel.app](https://evacu-guard.vercel.app)
- **Backend** → Render (auto-deploys from `backend/` on every push to `main`)
