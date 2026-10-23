# CampusConnect API Documentation (REST API v1)

All endpoints are prefixed with `/api/v1` unless noted otherwise.

## Base URL & Health Check

### Health Check
- **Endpoint**: `GET /api/health`
- **Auth**: Public
- **Description**: Returns server health, database connectivity status, uptime, and system version without exposing secrets.
- **Sample Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-21T00:00:00.000Z",
  "service": "CampusConnect API",
  "version": "1.0.0",
  "database": "connected",
  "uptimeSeconds": 360,
  "environment": "development"
}
```

---

## 1. Authentication & College Domain Verification (`/api/v1/auth`)

### Get Supported Colleges
- **`GET /api/v1/auth/colleges`**
- Returns supported colleges, codes, and approved domains (e.g. `apex.edu`, `metro.edu`).

### Register Student
- **`POST /api/v1/auth/register`**
- **Rate Limit**: 30 requests / 15 min
- **Payload**:
  ```json
  {
    "name": "Alex Chen",
    "email": "alex.chen@apex.edu",
    "password": "Password123!",
    "collegeId": "65fc0..."
  }
  ```
- **Behavior**: Validates that email domain matches approved domains for the college. Hashes password, creates unverified user record, generates cryptographically secure 6-digit OTP, dispatches email.

### Verify Email OTP
- **`POST /api/v1/auth/verify-otp`**
- **Payload**:
  ```json
  {
    "email": "alex.chen@apex.edu",
    "otp": "481920"
  }
  ```
- **Behavior**: Enforces 10-minute expiry, max 5 failed attempts limit. Marks student `isVerified: true`, returns JWT access token and user session.

### Resend OTP
- **`POST /api/v1/auth/resend-otp`**
- **Payload**: `{ "email": "alex.chen@apex.edu" }`
- **Behavior**: Enforces 60-second cooldown period between code dispatches.

### Login
- **`POST /api/v1/auth/login`**
- **Payload**: `{ "email": "...", "password": "..." }`
- **Response**: Returns JWT token and sanitized user profile. Returns 403 `needsVerification: true` if unverified.

### Get Current User Profile
- **`GET /api/v1/auth/me`**
- **Auth**: Bearer Token required.

### Complete Profile Onboarding
- **`POST /api/v1/auth/onboarding`**
- **Auth**: Bearer Token required.
- **Payload**:
  ```json
  {
    "department": "Computer Science",
    "academicYear": "Year 3",
    "bio": "Building reliable web tools.",
    "skills": ["React", "TypeScript", "Node.js"],
    "interests": ["Hackathons", "Web Dev"],
    "avatarUrl": "https://..."
  }
  ```

### Forgot & Reset Password Flow
- **`POST /api/v1/auth/forgot-password`**: Generates 1-hour single-use token and sends reset link.
- **`POST /api/v1/auth/reset-password`**: Validates single-use token, resets password, marks token used.

---

## 2. Campus Feed (`/api/v1/posts`)

All feed routes require an authenticated student session (`Bearer <token>`). Posts are automatically scoped to the user's verified college.

- **`GET /api/v1/posts`**:
  - Query parameters: `category` (`announcement`, `event`, `academic`, `general`), `search`, `page`, `limit`.
  - Pinned announcements appear first, followed by newest posts.
  - Automatically calculates `isLiked`, `isSaved`, and `isAuthor` for the requester.
- **`POST /api/v1/posts`**: Publish post (author, title, content, category, images, tags).
- **`POST /api/v1/posts/:id/like`**: Toggle like status (optimistic friendly).
- **`GET /api/v1/posts/:id/comments`**: List comments for post.
- **`POST /api/v1/posts/:id/comments`**: Add comment (creates notification for post author).
- **`POST /api/v1/posts/:id/save`**: Save/bookmark post.
- **`DELETE /api/v1/posts/:id`**: Delete post (server validates author ownership or moderator/admin role).

---

## 3. Academic Resources Library (`/api/v1/resources`)

- **`GET /api/v1/resources`**: Search and filter by `department`, `academicYear`, `subject`, `resourceType` (`notes`, `pyq`, `study_guide`, `syllabus`, `reference`).
- **`POST /api/v1/resources`**: Upload academic resource with file metadata and URL.
- **`POST /api/v1/resources/:id/download`**: Increments download analytics and tracks engagement.
- **`POST /api/v1/resources/:id/save`**: Save resource to study collection.
- **`DELETE /api/v1/resources/:id`**: Delete resource (uploader or moderator only).

---

## 4. Lost and Found Board (`/api/v1/lost-found`)

- **`GET /api/v1/lost-found`**: List items with filters: `type` (`lost`, `found`), `category`, `status` (`open`, `resolved`), `search`.
- **`POST /api/v1/lost-found`**: Create lost or found report with campus location, date, category, and image.
- **`PATCH /api/v1/lost-found/:id/status`**: Mark listing as `resolved` (owner or moderator only).
- **`POST /api/v1/lost-found/:id/contact`**: Inquire about item (creates in-app conversation without exposing personal phone numbers or private emails).

---

## 5. Student Communities (`/api/v1/communities`)

- **`GET /api/v1/communities`**: List clubs and study groups with membership status and member counts.
- **`POST /api/v1/communities`**: Create new community with rules, name, category, and avatar.
- **`GET /api/v1/communities/:slug`**: Get full community details, member list, and guidelines.
- **`POST /api/v1/communities/:id/join`**: Toggle membership (join / leave).

---

## 6. Project & Hackathon Collaboration (`/api/v1/projects`)

Key differentiator of CampusConnect.

- **`GET /api/v1/projects`**:
  - Filter by `category`, `stage`, `status`, `search`.
  - Calculates transparent deterministic skill-match score (`matchCount`, `matchPercentage`, `matchingSkills`, and explanation: e.g. "Matches 3 of 4 skills").
  - `sortByMatch=true`: Sorts listings highest match percentage first.
- **`POST /api/v1/projects`**: Create project listing (problem statement, description, requiredSkills, openRoles, teamSize, commitment, collab preference).
- **`GET /api/v1/projects/:id`**: Project details, team members, applicant list (if creator).
- **`POST /api/v1/projects/:id/apply`**: Submit application with desired role and introduction note.
- **`DELETE /api/v1/projects/applications/:id`**: Withdraw pending application.
- **`PATCH /api/v1/projects/applications/:id`**: Project owner decision (`accept` / `reject`). Accepting automatically adds applicant to team members.
- **`POST /api/v1/projects/:id/save`**: Bookmark project.

---

## 7. Messaging (`/api/v1/messages`)

- **`GET /api/v1/messages/conversations`**: Active conversation list with unread counters and last message previews.
- **`POST /api/v1/messages/conversations`**: Create or retrieve conversation thread with another student.
- **`GET /api/v1/messages/conversations/:id/messages`**: Fetch message history.
- **`POST /api/v1/messages/conversations/:id/messages`**: Send message (dispatches via Socket.IO room if connected).

---

## 8. Notifications (`/api/v1/notifications`)

- **`GET /api/v1/notifications`**: Get user notifications (likes, comments, applications, decisions, messages).
- **`PATCH /api/v1/notifications/:id/read`**: Mark notification as read.
- **`PATCH /api/v1/notifications/read-all`**: Mark all as read.

---

## 9. Safety, Reports & Moderation (`/api/v1/reports`)

- **`POST /api/v1/reports`**: Submit report against any content (`post`, `comment`, `resource`, `lost_found`, `project`, `user`).
- **`GET /api/v1/reports/queue`**: **[Requires role: `moderator` or `admin`]** Review queue for college.
- **`POST /api/v1/reports/:id/action`**: **[Requires role: `moderator` or `admin`]** Execute action (`hide_content`, `delete_content`, `dismiss_report`).
- **`GET /api/v1/reports/audit-logs`**: **[Requires role: `moderator` or `admin`]** View timestamped moderation audit log.

---

## 10. File Upload (`/api/v1/upload`)

- **`POST /api/v1/upload?folder=...`**:
  - Multipart form-data with `file`.
  - Allowed types: images (JPEG, PNG, WebP, GIF), documents (PDF, DOCX, PPTX, ZIP).
  - Maximum size: 15MB.
  - Automatically uploads to Cloudinary if credentials configured, or persists locally to `/uploads` with static serving.
