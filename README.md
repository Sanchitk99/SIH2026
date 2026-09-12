# Kabadiwala Connect

Kabadiwala Connect is a role-based e-waste collection and recycling marketplace. It connects waste collectors with verified recyclers so electronic waste can be listed, photographed, classified, quoted, and handed over through a clearer digital workflow.

## SIH problem context

Electronic waste is often collected and traded through fragmented, informal channels. This makes it difficult to record what was collected, match materials with suitable recyclers, verify recycling facilities, compare offers, and track the final handover. The result can be unsafe handling, poor traceability, low-value recovery, and materials reaching inappropriate disposal routes.

This project addresses that challenge by providing:

- a digital listing flow for collectors;
- image storage and optional AI-assisted material classification;
- a marketplace where recyclers can discover available lots and submit quotes;
- recycler profile and verification workflows for administrators;
- quote acceptance and handover/transaction tracking;
- multilingual UI support for English, Hindi, and Marathi.

> The repository does not contain the official SIH challenge ID or wording. The section above is the project-specific problem summary. Replace it with the official SIH statement when preparing a formal submission.

## Main roles

- **Collector** — creates e-waste lots, uploads photos, views quotes, and tracks transactions.
- **Recycler** — maintains a facility profile, browses available lots, submits quotes, and records handovers.
- **Admin** — reviews and verifies recycler profiles.

## Technology

- Frontend: React, TypeScript, Vite, React Router, TanStack Query
- Backend: Python, FastAPI, Uvicorn, Pydantic
- Authentication and application data: Firebase Authentication and Firestore
- Image/document storage: Supabase Storage
- Optional classification: Roboflow inference

## Repository structure

```text
SIH2026/
├── backend/       FastAPI API, Firebase access, Supabase upload service
├── frontend/      React/Vite web application
├── README.md      Project overview and setup
└── .gitignore     Secret and generated-file exclusions
```

## Quick start

You need Git, Node.js/npm, Python 3.12, a Firebase project, and a Supabase project. Detailed instructions are available in [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

### Windows

```powershell
git clone https://github.com/Sanchitk99/SIH2026.git
cd SIH2026
python -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
cd frontend
npm install
```

Start the backend in one terminal:

```powershell
cd backend
..\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```powershell
cd frontend
npm run dev
```

### macOS/Linux

```bash
git clone https://github.com/Sanchitk99/SIH2026.git
cd SIH2026
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cd frontend
npm install
```

Start the backend in one terminal:

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The API health endpoint is `http://127.0.0.1:8000/health`.
