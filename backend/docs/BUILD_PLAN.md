# ECS Mentoring Portal – Backend Build Plan

## 1. Server setup

- **Node.js** (v18+ recommended): install from [nodejs.org](https://nodejs.org).
- **MongoDB**: install locally or use Atlas. Default URI: `mongodb://localhost:27017/ecs_mentoring`.
- From project root:
  - `cd backend`
  - `npm install`
  - Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, `PORT`, etc.
- Start API: `npm run dev` (or `npm start`).
- Health check: `GET http://localhost:3000/health`.

## 2. Database connection

- Connection is in `config/db.js`; it runs in `server.js` on startup.
- Uses `mongoose.connect(process.env.MONGODB_URI)`.
- Ensure MongoDB is running and `MONGODB_URI` in `.env` is correct.

## 3. Auth flow

1. **Login**
   - Frontend: `POST /api/auth/login` with `{ email, password, role? }`.
   - Backend: finds user by email, checks role (if provided), compares password via bcrypt.
   - On success: returns `{ token, user }`. Token is JWT with `{ id: userId }`, signed with `JWT_SECRET`.
2. **Using the token**
   - Frontend stores token (e.g. in `localStorage`) and sends it on each request:
     - Header: `Authorization: Bearer <token>`.
   - Backend: `authMiddleware` reads token, verifies JWT, loads user, sets `req.user`.
3. **Role check**
   - After `authMiddleware`, use `authorizeRoles('student','teacher',...)` so only allowed roles can access the route.

## 4. Session management flow

1. **Create**: Teacher `POST /api/teacher/sessions` with title, scheduledAt, students[], duration, optional meetLink.
2. **Edit/Delete**: Teacher `PUT /api/teacher/sessions/:id` and `DELETE /api/teacher/sessions/:id`.
3. **Upload Meet link**: Same `PUT` body can set `meetLink` and `liveSessionStatus`.
4. **Student view**: Student calls `GET /api/student/sessions/upcoming` (list) and `GET /api/student/sessions/:id/meet-link` (single Meet link).
5. **Live status**: Teacher sets `liveSessionStatus: 'live'` when session starts; student can show “Live” badge when fetching meet link.

## 5. Meet link visibility logic

- Meet link is stored on `Session.meetLink`.
- Only students in `Session.students` can access it.
- Student endpoint: `GET /api/student/sessions/:id/meet-link`:
  - Ensures current user’s `StudentProfile` is in `session.students`.
  - Returns `meetLink`, `title`, `scheduledAt`, `liveSessionStatus`.
- Teachers see/edit the link via `GET/PUT /api/teacher/sessions/:id`.

## 6. Order of implementation (summary)

1. Install deps, set `.env`, start MongoDB.
2. Start server; confirm DB connect and `GET /health`.
3. Create first admin user (e.g. via script or Admin API after adding a seed).
4. Test login: `POST /api/auth/login` then `GET /api/auth/me` with token.
5. Create Student/Teacher/Parent profiles and test role routes.
6. Test session CRUD (teacher), then student upcoming + meet-link.
7. Test attendance, announcements, feedback, notifications, analytics.

## 7. Optional: seed script

Add `scripts/seed.js` to create an admin user and sample Student/Teacher profiles for local testing. Run with: `node scripts/seed.js` (ensure DB is running and `MONGODB_URI` is set).
