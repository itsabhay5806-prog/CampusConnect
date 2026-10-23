# 🚀 CampusConnect Deployment Guide (Vercel & Production)

This guide documents the exact steps, environment variables, and architecture options for deploying **CampusConnect** to production on **Vercel**.

---

## 🏗️ Architecture & Deployment Strategies

CampusConnect can be deployed using either of two battle-tested architectures:

| Strategy | Frontend | Backend | Real-Time WebSockets (Socket.IO) | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Option A (Recommended)** | Vercel (Static CDN) | Vercel (Serverless Function via `api/index.ts`) | Handled via REST fallbacks (Serverless does not maintain persistent WebSockets) | Fast 1-click deployment from a single GitHub repo on a single domain |
| **Option B (Decoupled)** | Vercel (Static CDN) | Render / Railway / Fly.io / AWS EC2 | Full persistent WebSockets supported natively | Production scale requiring continuous persistent WebSocket channels |

---

## 📌 Option A: 1-Click Monorepo Deployment on Vercel (Single Project)

Deploy both the Vite frontend and Express serverless API from your single GitHub repository under a unified domain with zero CORS setup.

### Step 1: Import GitHub Repository
1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Import your repository: `itsabhay5806-prog/CampusConnect`.

### Step 2: Configure Project Settings
Vercel automatically detects `vercel.json`. Verify the following settings:
- **Framework Preset**: `Vite` (or `Other`)
- **Root Directory**: `./` (leave blank / root)
- **Build Command**: `npm run build` (or leave default: Vercel executes `npm run vercel-build`)
- **Output Directory**: `client/dist`
- **Install Command**: `npm install` (runs `postinstall` automatically)

### Step 3: Add Production Environment Variables
In Vercel **Project Settings → Environment Variables**, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusconnect?retryWrites=true&w=majority` | Hosted MongoDB Atlas connection string |
| `JWT_SECRET` | `GfvpioYI1QCUSgTdzCd6TBA6nCDGXgZbjHs/+bc9JbU=` | 64+ char cryptographically random secret |
| `JWT_EXPIRES_IN` | `7d` | Access token lifespan |
| `NODE_ENV` | `production` | Production environment flag |
| `DEV_OTP_CONSOLE` | `false` | Disables console OTP logging in production |
| `CLIENT_URL` | `https://CampusConnect.vercel.app` | Your deployed frontend Vercel URL |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | *(Optional)* Cloudinary cloud name for persistent media |
| `CLOUDINARY_API_KEY` | `your_api_key` | *(Optional)* Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | *(Optional)* Cloudinary API secret |
| `SMTP_HOST` | `smtp.gmail.com` | *(Optional)* Institutional SMTP server |
| `SMTP_PORT` | `587` | *(Optional)* SMTP port |
| `SMTP_USER` | `your-email@institution.edu` | *(Optional)* SMTP username |
| `SMTP_PASS` | `your-smtp-app-password` | *(Optional)* SMTP password |
| `EMAIL_FROM` | `noreply@campusconnect.edu` | *(Optional)* From email header |

> [!IMPORTANT]
> **MongoDB Atlas Network Access**: Vercel Serverless Functions execute on dynamic IP addresses. In your MongoDB Atlas Console, go to **Network Access** → **Add IP Address** → Select **Allow Access From Anywhere (`0.0.0.0/0`)**.

### Step 4: Deploy & Verify
1. Click **"Deploy"**.
2. Once the build finishes, open your assigned URL: `https://YOUR-APP.vercel.app`.
3. Verify the API health check:
   ```bash
   curl https://YOUR-APP.vercel.app/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "CampusConnect API",
     "version": "1.0.0",
     "database": "connected"
   }
   ```

---

## 📌 Option B: Decoupled Deployment (Frontend on Vercel, Backend on Render/Railway)

Use this strategy if persistent real-time WebSocket communication is strictly required for 24/7 instant messaging.

### Frontend Deployment on Vercel:
1. In Vercel, create a new project from `itsabhay5806-prog/CampusConnect`.
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Set **Build Command** to `npm run build`.
5. Set **Output Directory** to `dist`.
6. Add the following Environment Variable:
   - `VITE_API_BASE_URL`: `https://YOUR-BACKEND.onrender.com/api/v1`
   - `VITE_SOCKET_URL`: `https://YOUR-BACKEND.onrender.com`
7. Click **"Deploy"**.

### Backend Deployment on Render / Railway:
1. Create a **Web Service** pointing to `server/`.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start` (or `node dist/index.js`)
4. Add backend environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=https://YOUR-FRONTEND.vercel.app`, etc.).
5. Persistent WebSockets with Socket.IO will function natively without serverless timeout limits.

---

## ⚠️ Technical Truth Regarding Socket.IO on Vercel

Vercel's serverless compute environment is fundamentally **stateless request/response** based:
- Vercel functions spin up on incoming HTTP requests and shut down when idle.
- Vercel **does not maintain persistent, continuous TCP WebSocket connections** over serverless functions.
- CampusConnect's frontend (`SocketContext.tsx`) is designed with defensive fault-tolerance: it detects connection errors and transparently switches to REST APIs for messaging and data queries.
- If real-time bidirectional WebSocket push is a mandatory requirement for your deployment, follow **Option B** above.

---

## 🔍 Post-Deployment Smoke Test Checklist

- [ ] **Health Check**: `GET /api/health` returns HTTP 200 with `database: "connected"`.
- [ ] **College List**: `GET /api/v1/auth/colleges` returns the 25 verified institutions across Mathura, Noida, and Greater Noida.
- [ ] **Student Registration**: Register with an institutional email (e.g., `@glbajajgroup.org` or `@student.gla.ac.in`).
- [ ] **OTP Verification**: Enter the 6-digit OTP code received in email (or auto-filled dev code).
- [ ] **SPA Navigation**: Directly refresh `/app/feed`, `/app/projects`, and `/app/resources` to confirm client-side routing rewrites work properly without 404 errors.
