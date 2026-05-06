# AI-First CRM HCP Module – Log Interaction Screen

A full-stack CRM system for life science field representatives to log and manage Healthcare Professional (HCP) interactions using an AI-powered LangGraph agent.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Redux Toolkit |
| Backend | Python + FastAPI |
| AI Agent | LangGraph + Groq (gemma2-9b-it) |
| Database | PostgreSQL |
| Font | Google Inter |

## Project Structure

```
crm-hcp/
├── frontend/          # React + Redux UI
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── store/        # Redux slices
│   │   ├── pages/        # Page components
│   │   └── api/          # API clients
│   └── package.json
├── backend/           # FastAPI + LangGraph
│   ├── app/
│   │   ├── agents/       # LangGraph agent definition
│   │   ├── tools/        # 5 LangGraph tools
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routes/       # FastAPI routes
│   │   └── db/           # DB connection
│   ├── main.py
│   └── requirements.txt
└── docker-compose.yml
```

## LangGraph Agent & Tools

The LangGraph agent orchestrates all HCP interaction workflows. It routes between tools based on user intent (form submit or chat message).

### 5 Tools

1. **`log_interaction`** – Captures HCP interaction data. Uses the LLM (gemma2-9b-it via Groq) to extract entities (HCP name, products discussed, sentiment, follow-up actions) from free-form text or structured form data, then persists to PostgreSQL.

2. **`edit_interaction`** – Modifies an existing logged interaction. Accepts partial updates; the LLM re-summarizes updated fields to keep the AI summary coherent.

3. **`get_hcp_profile`** – Retrieves a full HCP profile including interaction history, preferred products, visit frequency, and engagement score.

4. **`schedule_followup`** – Creates a follow-up task/reminder linked to an HCP and interaction. Uses LLM to suggest optimal follow-up timing based on interaction context.

5. **`analyze_engagement`** – Runs an AI analysis of an HCP's engagement trends across all logged interactions, returning insights like sentiment trajectory, topics of interest, and recommended next actions.

## Setup & Run

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Groq API key (https://console.groq.com)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env: GROQ_API_KEY, DATABASE_URL

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:8000

npm start
```

### Docker (Full Stack)

```bash
docker-compose up --build
```

App runs at http://localhost:3000  
API docs at http://localhost:8000/docs

## Environment Variables

### Backend `.env`
```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/crm_hcp
SECRET_KEY=your_secret_key
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:8000
```
