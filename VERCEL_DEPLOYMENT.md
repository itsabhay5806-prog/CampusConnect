# Deploying CampusConnect on Vercel

CampusConnect is configured for 1-click monorepo deployment on **Vercel** with full-stack capabilities:
- **Frontend**: High-performance React SPA built with Vite and TailwindCSS served from Vercel's global Edge CDN.
- **Backend**: Express API deployed as a Vercel Serverless Function (`api/index.ts`) handling all `/api/*` endpoints.
- **Database**: Connects seamlessly to your hosted MongoDB Atlas database with warm connection pooling.

---

## 🚀 Quick Deployment Steps

### 1. Import Repository into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository: `itsabhay5806-prog/CampusConnect`.

---

### 2. Configure Project Settings

Vercel will automatically detect `vercel.json` and configure:
- **Framework Preset**: Other / Vite
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build` (or automatic `vercel-build`)
- **Output Directory**: `client/dist`

---

### 3. Add Environment Variables

In Vercel's **Environment Variables** section, add the following keys:

| Variable | Value / Description | Required |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/campusconnect?retryWrites=true&w=majority` | **Required** |
| `JWT_SECRET` | Your 64+ char secret string (e.g. `GfvpioYI1QCUSgTdzCd6TBA6nCDGXgZbjHs/+bc9JbU=`) | **Required** |
| `JWT_EXPIRES_IN` | `7d` | **Required** |
| `NODE_ENV` | `production` | **Required** |
| `DEV_OTP_CONSOLE` | `false` | Recommended |
| `CLIENT_URL` | Your production Vercel URL (e.g. `https://CampusConnect.vercel.app`) | Recommended |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name (for persistent media uploads) | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Optional |
| `SMTP_HOST` | Institutional SMTP Host (e.g., `smtp.gmail.com` or `smtp.office365.com`) | Optional |
| `SMTP_PORT` | `587` | Optional |
| `SMTP_USER` | SMTP Username / email address | Optional |
| `SMTP_PASS` | SMTP Password / App Password | Optional |
| `EMAIL_FROM` | `noreply@campusconnect.edu` | Optional |

> [!IMPORTANT]
> **MongoDB Atlas Network Access**: Ensure your MongoDB Atlas cluster allows incoming connections from **Anywhere (`0.0.0.0/0`)** in **Network Access**, since Vercel Serverless Functions use dynamic IP addresses.

---

### 4. Deploy!
Click **"Deploy"**. Vercel will install dependencies, build the client and serverless API, and assign you a live `.vercel.app` production domain.

---

## 🛠️ Verification & Health Check

After deployment, test the health endpoint:
```bash
curl https://your-project.vercel.app/api/health
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
