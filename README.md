# 🎓 CampusConnect
### *A Verified, Student-Driven Digital Campus Ecosystem*

[![Tests](https://img.shields.io/badge/tests-14%20passed-emerald)](.)
[![License](https://img.shields.io/badge/license-MIT-blue)](.)
[![Stack](https://img.shields.io/badge/tech-React%20%7C%20Node%20%7C%20Express%20%7C%20Mongo%20%7C%20Tailwind-blueviolet)](.)

CampusConnect is a production-oriented, verified web application designed to eliminate fragmented college communication (WhatsApp groups, Telegram channels, Instagram pages, scattered Google Drive links). It unifies campus announcements, peer-reviewed academic notes, lost-and-found recovery, interest communities, direct student messaging, and hackathon teammate discovery into one searchable, authenticated student hub.

---

## 🌟 Core Product Features

1. **Institutional Email Domain OTP Authentication**
   - Verification restricted to approved college domains (e.g., `@apex.edu`, `@metro.edu`, `@svtech.edu`).
   - Cryptographically secure 6-digit OTP with 10-minute expiry, max 5 attempts limit, and 60s resend cooldown.
   - Built-in zero-config dev helper for frictionless local testing and evaluation.

2. **Campus Feed & Official Updates**
   - Categorized updates: *Announcements*, *Events*, *Academic*, and *General*.
   - Pinned announcements, likes with optimistic updates, threaded comments, saved bookmarks, and shareable links.
   - Strict ownership protection and author college-domain verification badge.

3. **Academic Resources Library**
   - Searchable repository of notes, solved previous-year question papers (PYQs), and syllabus guidelines.
   - Categorized by College, Department, Semester, and Subject with download analytics tracking.
   - Dual-engine storage: Cloudinary integration with seamless local disk fallback (`/uploads`).

4. **Campus Lost & Found Board**
   - Report lost and found possessions with campus locations, incident dates, and photo attachments.
   - **Privacy Protection:** Phone numbers and personal emails are never exposed. Inquiries are routed via safe, authenticated in-app messaging.
   - Status tracking: *Open*, *Matched*, and *Resolved*.

5. **Project & Hackathon Collaboration Matcher** *(Key Differentiator)*
   - Marketplace to pitch hackathon ideas, startups, research projects, or capstone squads.
   - **Deterministic Skill-Matching Engine:** Computes exact skill overlap between student profiles and project requirements (e.g. *"Matches 3 of 4 required skills (React, TypeScript, Node.js)"*).
   - Application workflow: Students apply with introduction notes; project leads can accept or reject applicants, automatically enrolling accepted peers into the squad.

6. **Student Interest Communities**
   - Specialized clubs across Coding, AI/ML, UI/UX Design, Placement Prep, Entrepreneurship, and Sports.
   - Join/leave functionality, member counters, community guidelines, and leaderboards.

7. **Direct Messaging & Activity Notifications**
   - Private 1-on-1 student conversations with persistent message history and unread counters.
   - Real-time communication via Socket.IO with comprehensive REST fallback.
   - Real-time in-app alerts for likes, comments, project applications, and moderator actions.

8. **Safety & Student Peer Moderation**
   - Role-Based Access Control (`student`, `moderator`, `admin`).
   - Moderation queue to review reported content with actions: Hide Content, Delete Content, Dismiss Report.
   - Comprehensive audit logging of all moderation actions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide Icons, TanStack Query, React Hook Form |
| **Backend** | Node.js, Express.js, TypeScript, REST API v1, Mongoose |
| **Database** | MongoDB Atlas (Hosted) or Zero-Config In-Memory MongoDB (`mongodb-memory-server`) |
| **Real-Time** | Socket.IO with REST Fallback |
| **Security** | bcryptjs password hashing, JWT Access Tokens, Helmet, CORS, Express Rate Limiting |
| **File Storage** | Cloudinary Integration Layer with static Local Disk fallback (`/uploads`) |
| **Testing** | Vitest, React Testing Library, Supertest |

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24)
- npm `v9+`

### 1. Installation
Clone or navigate to the repository directory:
```bash
cd campusconnect
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
cp server/.env.example server/.env
```
> **Zero-Config Notice:** If `MONGODB_URI` is left blank, the server automatically starts an in-memory MongoDB instance. No external database or local mongod daemon is required to start developing or testing immediately!

### 3. Seed Realistic Demo Data
Populate the database with realistic colleges, student profiles, posts, academic notes, communities, projects, and notifications:
```bash
npm run seed
```

### 4. Start Development Servers
Run both client and server concurrently:
```bash
npm run dev
```
- **Web App:** [http://localhost:3000](http://localhost:3000)
- **API Server:** [http://localhost:5001](http://localhost:5001)
- **Health Check:** [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 👥 Pre-Configured Demo Accounts

For immediate evaluation, the seed script sets up the following verified accounts (Password for all: `Password123!`):

| Role | Name | Email | Department / Details |
| :--- | :--- | :--- | :--- |
| **Student (Full-Stack)** | Alex Chen | `alex.chen@apex.edu` | CS Year 3 • React, TypeScript, Node.js |
| **Student (UI/UX)** | Maya Patel | `maya.patel@apex.edu` | SE Year 4 • Figma, UI/UX, React |
| **Student (AI/ML)** | Jordan Lee | `jordan.lee@apex.edu` | Data Science Year 2 • Python, PyTorch |
| **Peer Moderator** | Marcus Brody | `moderator@apex.edu` | CS Year 4 • Access to `/app/moderation` |
| **Campus Admin** | Dr. Sarah Vance | `admin@apex.edu` | Campus Administration |

> **Pro Tip:** The login page includes a **1-click Quick Demo Credentials** bar to test any role instantly.

---

## 🧪 Automated Testing

CampusConnect includes comprehensive test suites covering unit logic, authentication flows, role-based security, and frontend rendering:

### Run Backend API Tests
```bash
npm --prefix server test
```
*Tests cover: Health check, college-domain validation, OTP dispatch/verification, JWT signing, profile onboarding, post publishing, likes/comments, skill matching algorithm, and 403 authorization guard on moderation routes.*

### Run Frontend Vitest Tests
```bash
npm --prefix client test
```
*Tests cover: Landing page hero rendering, navigation links, and call-to-action buttons.*

---

## 🌐 External Services Integration Status

| Service | Status | Configuration Notes |
| :--- | :--- | :--- |
| **MongoDB Atlas** | **Ready** | Set `MONGODB_URI` in `.env`. If omitted, automatically runs in-memory MongoDB for local zero-config usage. |
| **Cloudinary** | **Ready** | Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. If omitted, cleanly falls back to `/uploads` disk storage. |
| **SMTP Mailer** | **Ready** | Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. In local development, verification OTPs print directly to the server terminal and are accessible via the in-app dev helper. |
| **Socket.IO** | **Ready** | Supports persistent WebSocket connections for real-time messaging. When deploying to serverless environments (like AWS Lambda or Vercel Serverless Functions), persistent WebSockets are not maintained; the frontend and backend include graceful REST fallback polling for full feature parity. |

---

## 📁 Project Structure

```
campusconnect/
├── client/                      # React 18 + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/          # Reusable UI cards, modals, skeletons
│   │   │   ├── common/          # Logo, Modal, ReportModal, EmptyState
│   │   │   └── layout/          # Navbar, Sidebar, MobileNav, AppLayout
│   │   ├── context/             # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── app/             # Feed, Discover, Resources, LostFound,
│   │   │   │                    # Communities, Projects, Messages, Profile...
│   │   │   └── auth/            # Login, Register, VerifyEmail, Onboarding...
│   │   ├── services/            # Typed API fetch client
│   │   └── test/                # Vitest & RTL test specs
│   └── vite.config.ts           # Proxy config to Express backend
├── server/                      # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/              # DB, Mailer, Upload, Env configuration
│   │   ├── controllers/         # Auth, Post, Resource, LostFound, Project...
│   │   ├── middleware/          # JWT Auth, RBAC roles, rate limiting
│   │   ├── models/              # 19 Mongoose Schemas with indexes & references
│   │   ├── routes/              # Express API v1 route definitions
│   │   ├── socket/              # Socket.IO connection & room handler
│   │   ├── seed.ts              # Database seeding script with realistic data
│   │   └── tests/               # Backend API test suite
├── .env.example                 # Documented environment variables
├── API_DOCUMENTATION.md         # Full REST API endpoint specifications
└── package.json                 # Monorepo scripts (dev, build, seed, test)
```

---

## 📄 License
MIT License. Built for collegiate learning, student empowerment, and collaborative innovation.
