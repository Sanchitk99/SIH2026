# Frontend

This directory contains the Kabadiwala Connect React web application.

## Windows

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## macOS/Linux

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment variables

Copy `.env.example` to `.env` and fill in the Firebase web configuration. `VITE_API_BASE_URL` should point to the running FastAPI server:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Do not put a Supabase secret key in this file. Image uploads go through the backend.

## Commands

```bash
npm run dev      # development server
npm run build    # type-check and production build
npm run preview  # preview the production build
```
