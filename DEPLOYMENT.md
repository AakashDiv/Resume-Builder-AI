# Deployment Guide

## Overview

This repo now includes:

- [Dockerfile](/e:/Aakash/ResumeBuilder-jobscrapper/JobScraper-main/Dockerfile) for `backend + scraper`
- [render.yaml](/e:/Aakash/ResumeBuilder-jobscrapper/JobScraper-main/render.yaml) for Render Blueprint deploys
- [.dockerignore](/e:/Aakash/ResumeBuilder-jobscrapper/JobScraper-main/.dockerignore) to keep Docker builds smaller

Recommended setup:

- Backend + scraper: Render Docker web service
- Database: MongoDB Atlas free cluster
- Frontend: Netlify, Vercel, or Render static site

## 1) Push the repo to GitHub

If this folder is not already connected to GitHub:

```bash
git init
git add .
git commit -m "Add Render Docker deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If the repo already exists:

```bash
git add .
git commit -m "Add Render Docker deployment"
git push
```

## 2) Create MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free `M0` cluster
3. Create a database user
4. In **Network Access**, allow access from anywhere for Render:

```text
0.0.0.0/0
```

5. Copy your connection string, for example:

```text
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jobscraper?retryWrites=true&w=majority
```

Use this as `MONGO_URI` in Render.

## 3) Deploy backend on Render with Docker

### Option A: Blueprint deploy using `render.yaml`

1. Open https://dashboard.render.com
2. Click **New +** -> **Blueprint**
3. Connect your GitHub repo
4. Render will detect [render.yaml](/e:/Aakash/ResumeBuilder-jobscrapper/JobScraper-main/render.yaml)
5. Fill these required env vars:

```text
MONGO_URI
JWT_SECRET
CLIENT_ORIGIN
CLIENT_BASE_URL
```

Optional env vars:

```text
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
```

6. Click **Apply**
7. Wait for Docker build and deploy to finish

Your backend URL will look like:

```text
https://jobscraper-backend.onrender.com
```

### Option B: Manual Docker web service

1. Open Render dashboard
2. Click **New +** -> **Web Service**
3. Select your GitHub repo
4. Set:

```text
Runtime: Docker
Dockerfile Path: ./Dockerfile
Docker Context: .
Plan: Free
Health Check Path: /api/health
```

5. Add env vars:

```text
NODE_ENV=production
PYTHON_BIN=python3
MONGO_URI=<your atlas uri>
JWT_SECRET=<long random secret>
CLIENT_ORIGIN=<your frontend url>
CLIENT_BASE_URL=<your frontend url>
OPENAI_API_KEY=<optional>
OPENAI_MODEL=gpt-4.1-mini
STRIPE_SECRET_KEY=<optional>
STRIPE_WEBHOOK_SECRET=<optional>
STRIPE_PRO_PRICE_ID=<optional>
```

6. Deploy

## 4) Deploy frontend on Netlify

When importing this repo in Netlify, use:

```text
Branch to deploy: main
Base directory: frontend
Build command: npm run build
Publish directory: dist
Functions directory: leave empty
```

Set this Netlify environment variable:

```text
VITE_API_BASE_URL=https://your-render-backend-url/api
```

This repo also includes [netlify.toml](/e:/Aakash/ResumeBuilder-jobscrapper/JobScraper-main/netlify.toml), so Netlify can read these build settings automatically.

## 5) Connect frontend to backend

If your frontend is deployed separately, set:

```text
VITE_API_BASE_URL=https://your-render-backend-url/api
```

Examples:

```text
CLIENT_ORIGIN=https://your-frontend.netlify.app
CLIENT_BASE_URL=https://your-frontend.netlify.app
VITE_API_BASE_URL=https://jobscraper-backend.onrender.com/api
```

On Render, update `CLIENT_ORIGIN` and `CLIENT_BASE_URL` to your final Netlify URL after Netlify creates it.

## 6) Test after deploy

Open:

```text
https://your-render-backend.onrender.com/api/health
```

You should get:

```json
{ "ok": true, "service": "backend" }
```

Then test these flows:

- signup / login
- profile save
- scraper run
- dashboard match refresh

## Notes

- The Docker image installs `Chromium` and `chromedriver` for Selenium.
- The scraper now supports `CHROME_BIN` and `CHROMEDRIVER_PATH`, which are set inside the Docker image.
- Render free services sleep after inactivity and can be slow on first request.
- The scraper can still fail sometimes because LinkedIn and similar sites block automation.
- OpenAI usage is not free by default. If you want zero AI cost, leave `OPENAI_API_KEY` unset.
