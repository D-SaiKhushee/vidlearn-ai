# VidLearn AI — Azure Deployment Guide

## Architecture
```
Azure App Service (Backend)   ←→   Azure App Service (Frontend)
  FastAPI + Whisper + Gemini         React + Vite → nginx
  Docker container                   Docker container
```

---

## Prerequisites
- Azure account (free tier works for demo)
- Azure CLI installed: `brew install azure-cli`
- Docker installed
- GitHub repo with this project

---

## Step 1 — Login to Azure

```bash
az login
az account set --subscription "<your-subscription-id>"
```

---

## Step 2 — Create Resource Group

```bash
az group create \
  --name vidlearn-rg \
  --location eastus
```

---

## Step 3 — Create App Service Plans

```bash
# Backend plan (B2 = 2 cores, 3.5GB RAM — needed for Whisper)
az appservice plan create \
  --name vidlearn-backend-plan \
  --resource-group vidlearn-rg \
  --sku B2 \
  --is-linux

# Frontend plan (B1 is fine for static serving)
az appservice plan create \
  --name vidlearn-frontend-plan \
  --resource-group vidlearn-rg \
  --sku B1 \
  --is-linux
```

---

## Step 4 — Create Web Apps

```bash
# Backend
az webapp create \
  --name vidlearn-backend \
  --resource-group vidlearn-rg \
  --plan vidlearn-backend-plan \
  --deployment-container-image-name ghcr.io/<your-github-username>/vidlearn-backend:latest

# Frontend
az webapp create \
  --name vidlearn-frontend \
  --resource-group vidlearn-rg \
  --plan vidlearn-frontend-plan \
  --deployment-container-image-name ghcr.io/<your-github-username>/vidlearn-frontend:latest
```

---

## Step 5 — Set Environment Variables on Backend

```bash
az webapp config appsettings set \
  --name vidlearn-backend \
  --resource-group vidlearn-rg \
  --settings \
    GEMINI_API_KEY="your_gemini_api_key_here" \
    WEBSITES_PORT=8000
```

---

## Step 6 — Set GitHub Secrets

In your GitHub repo → Settings → Secrets → Actions, add:

| Secret | Value |
|--------|-------|
| `AZURE_BACKEND_APP_NAME` | `vidlearn-backend` |
| `AZURE_FRONTEND_APP_NAME` | `vidlearn-frontend` |
| `AZURE_BACKEND_PUBLISH_PROFILE` | Download from Azure Portal → Backend App → Get publish profile |
| `AZURE_FRONTEND_PUBLISH_PROFILE` | Download from Azure Portal → Frontend App → Get publish profile |

---

## Step 7 — Enable CORS on Backend

```bash
az webapp cors add \
  --name vidlearn-backend \
  --resource-group vidlearn-rg \
  --allowed-origins "https://vidlearn-frontend.azurewebsites.net"
```

---

## Step 8 — Push to main branch

```bash
git add .
git commit -m "Deploy VidLearn AI to Azure"
git push origin main
```

The GitHub Actions pipeline will:
1. Build both Docker images
2. Push to GitHub Container Registry
3. Deploy to Azure App Service automatically

---

## Step 9 — Access your app

- **Frontend**: `https://vidlearn-frontend.azurewebsites.net`
- **Backend API**: `https://vidlearn-backend.azurewebsites.net`
- **Health check**: `https://vidlearn-backend.azurewebsites.net/health`

---

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend `.env`
```
GEMINI_API_KEY=your_key_here
```

### Frontend `.env` (for local dev)
```
VITE_API_URL=http://localhost:8000/api
```
