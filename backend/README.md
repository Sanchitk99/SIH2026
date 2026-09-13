# Backend

This directory contains the Kabadiwala Connect FastAPI service.

## Windows setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

If PowerShell blocks activation, use Command Prompt:

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
copy .env.example .env
```

Run the API:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## macOS/Linux setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Firebase setup

1. Create or select a Firebase project.
2. Enable Email/Password and Google sign-in under Authentication.
3. Create a web app and copy its configuration into `frontend/.env`.
4. Create a Firebase service account and download its JSON file.
5. Save the JSON file locally as `backend/sih2026.json`.
6. Never commit that JSON file.

Firebase Authentication provides API tokens, while Firestore stores users, lots, quotes, and transactions.

## Supabase Storage setup

1. Create a Supabase project.
2. Create a public Storage bucket named `ewaste-images`.
3. Run [supabase_storage.sql](supabase_storage.sql) in the SQL Editor, or create the bucket in the dashboard.
4. Add the project URL and backend-only secret key to `backend/.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=your-supabase-secret-key
SUPABASE_STORAGE_BUCKET=ewaste-images
```

Lot images are stored under `lots/`; recycler documents are stored under `documents/`. Never expose `SUPABASE_SECRET_KEY` in the frontend.

## Roboflow item identification

The photo classification endpoint uses the official `inference-sdk` client and the configured workflow `e-waste-ve-waste-oeexv-iyzv5-1-rfdetr-small-t1-logic` in workspace `siddharth-singh-np6gv`. Configure the backend only:

```env
ROBOFLOW_API_KEY=your-roboflow-api-key
ROBOFLOW_TIMEOUT_SECONDS=30
ROBOFLOW_RETRIES=2
FIREBASE_CREDENTIALS_PATH=./sih2026.json
```

The key is sent in the `Authorization: Bearer` header and is only required for the AI classification endpoint. The UI uses the returned suggestion when it matches a category; otherwise the collector can select the item manually.

## Other variables

See `.env.example` for the remaining Firebase and Supabase variables.

## Verification

After starting the API, open `http://127.0.0.1:8000/health`.

Expected response:

```json
{"status":"healthy"}
```

Interactive API documentation: `http://127.0.0.1:8000/docs`.
