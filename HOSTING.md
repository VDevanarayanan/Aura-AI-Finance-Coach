# 🚀 Hosting & Deployment Guide

This guide details how to deploy the **Aura Finance** web application to the cloud for free or at very low cost, creating a fully working live URL you can share with friends and feature on your resume.

---

## 🗄️ Step 1: Set Up a Cloud PostgreSQL Database (Neon)

Since the app runs PostgreSQL, we need a managed cloud database. **Neon** is serverless, fast, and has a generous free tier.

1. Go to [Neon.tech](https://neon.tech/) and sign up.
2. Create a new project (e.g. `aura-finance`).
3. Under the **Dashboard**, copy your **Connection String** (choose the `Prisma` pooling connection string format if available, or the standard `PostgreSQL` string).
   * It will look like: `postgresql://neondb_owner:xyz...-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. Keep this string safe; we will use it as the `DATABASE_URL` in our deployment configurations.

---

## 🛠️ Step 2: Choose Your Deployment Architecture

There are two ways to deploy this full-stack app:

### Option A: Single-Server Deployment (Recommended ⭐️)
*You serve the compiled React frontend statically directly from the Express backend.*
* **Pros**: Only **one** server to host, **zero** CORS issues, single URL for the whole app.
* **Platforms**: Render (Free Web Service) or Railway (Starter plan).

### Option B: Split Deployment (Modern Standard)
*Host the React client on a CDN (Vercel) and the Express backend on a server (Render).*
* **Pros**: Faster frontend load times; standard architecture for large-scale projects.
* **Platforms**: **Vercel** (Frontend) + **Render/Railway** (Backend).

---

## 📦 Option A: Single-Server Deployment (Render)

### 1. Add Static Assets Middleware to Backend
To make the Express server serve the built React files in production, open `backend/src/app.ts` and add this block **just before** the catch-all middleware:

```typescript
import path from 'path';

// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.resolve(__dirname, '../../../frontend/dist');
  app.use(express.static(frontendPath));
  
  // Wildcard redirect to index.html for React router
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}
```

### 2. Push Code to GitHub
Initialize git and push your repository to a public or private GitHub repository:
```bash
git init
git add .
git commit -m "feat: initial commit for deployment"
# Link to your GitHub repository and push
```

### 3. Deploy to Render
1. Sign up on [Render.com](https://render.com/).
2. Create a **New Web Service** and connect your GitHub repository.
3. Use the following configuration settings:
   * **Runtime**: `Node`
   * **Build Command**: `npm run install:all && npm run build --prefix backend && npm run build --prefix frontend`
   * **Start Command**: `npm run start --prefix backend` *(Make sure to add a `start` script in `backend/package.json` that runs `node dist/backend/src/app.js`)*
4. Go to **Environment** and add the following variables:
   * `NODE_ENV` = `production`
   * `DATABASE_URL` = *(Your Neon Connection String)*
   * `JWT_SECRET` = *(Any secure random string)*
   * `GEMINI_API_KEY` = *(Your Gemini API Key)*
   * `GEMINI_MODEL` = `gemini-2.5-flash`
5. Click **Deploy**. Render will build the React app, compile the TypeScript backend, connect to Neon, and host the app!

---

## ⚡ Option B: Split Deployment (Vercel + Render)

If you prefer to host the React client separately on Vercel:

### 1. Deploy the Backend to Render
1. Follow the Render setup above, but use the following commands:
   * **Build Command**: `npm run install:all && npm run build --prefix backend`
   * **Start Command**: `npm run start --prefix backend`
2. Add your environment variables (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.).
3. Copy your live Render URL (e.g. `https://aura-finance-backend.onrender.com`).

### 2. Deploy the Frontend to Vercel
1. Sign up on [Vercel.com](https://vercel.com/).
2. Create a **New Project** and select your GitHub repository.
3. Configure the root directory to point to the `frontend/` folder.
4. Add the following **Environment Variable**:
   * `VITE_API_URL` = `https://aura-finance-backend.onrender.com/api` *(Your Render backend URL + /api)*
5. Click **Deploy**. Vercel will build the frontend and provide a clean `https://aura-finance.vercel.app` link.

---

## 🔄 Running DB Migrations in Production

When deploying to a new database (like Neon) for the first time, you must push the Prisma schema and run the seed script:
1. Locally in your `.env` file, temporarily swap the `DATABASE_URL` with your **Neon Cloud Connection String**.
2. Run the migration and seeding scripts from your machine:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
3. Once completed, change the local `DATABASE_URL` in your `.env` back to your local PostgreSQL connection string so you can continue local development.
