# Agentic Customer Support Orchestrator

A full-stack, AI-powered customer support orchestration platform.

## Architecture
- **Backend:** FastAPI, SQLAlchemy, SQLite (Python)
- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **AI Integration:** OpenAI (Configurable with Demo Mode fallback)

## Features
- **Customer Portal:** Submit support tickets easily.
- **Orchestrator Agent:** Routes tickets to specialized agents based on category and priority.
- **Triage Agent:** Classifies intent and sentiment.
- **Specialized Agents:** Billing, Technical, Account, Escalation.
- **Dashboard:** Operational metrics and charts.
- **AI Operations:** Monitor agent activities in real-time.

## Project Structure
```
/
├── backend/       # FastAPI Backend Application
├── frontend/      # React + Vite Frontend
└── docker-compose.yml # Optional Docker configuration
```

## Setup & Running Locally

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. `pip install -r requirements.txt`
5. `python seed.py` (Seeds initial DB)
6. `uvicorn app.main:app --reload`
Backend runs at http://localhost:8000

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
Frontend runs at http://localhost:5173

## Environment Variables (Backend)
Copy `backend/.env.example` to `backend/.env`.
- To run with real AI, set `OPENAI_API_KEY=your_key`.
- Otherwise, leave it blank to run in Demo Mode.
