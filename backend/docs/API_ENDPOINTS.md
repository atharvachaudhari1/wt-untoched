# ECS Mentoring Portal – API Endpoints

Base path: `/api`. All protected routes require header: `Authorization: Bearer <token>`.

## Auth

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | /auth/login | { email, password, role? } | Login; returns token + user |
| GET | /auth/me | - | Current user (protected) |

---

## Student (role: student)

| Method | Path | Description |
|--------|------|-------------|
| GET | /student/dashboard | Profile, upcoming sessions, health score |
| GET | /student/mentor | Assigned mentor details |
| GET | /student/sessions/upcoming | Upcoming sessions |
| GET | /student/sessions/:id/meet-link | Meet link for a session |
| GET | /student/attendance | Attendance history |
| GET | /student/notes | Mentoring notes from sessions |
| GET | /student/announcements | Announcements for student |

---

## Teacher (role: teacher)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | /teacher/sessions | query: upcoming, status, limit | List sessions |
| GET | /teacher/sessions/:id | - | Session by id |
| POST | /teacher/sessions | title, scheduledAt, students[], duration, meetLink? | Create session |
| PUT | /teacher/sessions/:id | title, meetLink, liveSessionStatus, mentoringNotes, ... | Update session |
| DELETE | /teacher/sessions/:id | - | Delete session |
| POST | /teacher/attendance/mark | { sessionId, records: [{ studentId, status, remarks? }] } | Mark attendance |
| GET | /teacher/attendance | query: studentId, sessionId, limit | Attendance history |
| GET | /teacher/announcements | - | List announcements |
| POST | /teacher/announcements | title, body, targetType?, targetDepartment? | Create announcement |

---

## Parent (role: parent)

| Method | Path | Description |
|--------|------|-------------|
| GET | /parent/linked-students | List linked students |
| GET | /parent/student/:studentId/schedule | Schedule for linked student |
| GET | /parent/student/:studentId/attendance | Attendance for linked student |
| GET | /parent/student/:studentId/mentor-remarks | Mentoring notes for linked student |
| GET | /parent/student/:studentId/academic-updates | Academic summary |
| GET | /parent/announcements | Announcements for parent |

---

## Admin (role: admin)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | /admin/users | email, password, name, role, profileData? | Create user |
| POST | /admin/assign-mentor | { studentId, mentorId } | Assign mentor to student |
| GET | /admin/sessions | query: status, from, to, limit | All sessions |
| GET | /admin/sessions/:id | - | Session by id |
| GET | /admin/analytics | - | Counts by role, sessions, announcements |
| GET | /admin/announcements | - | All announcements |
| POST | /admin/announcements | title, body, targetType?, ... | Create announcement |

---

## Feedback (student for quick feedback)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | /feedback/quick | { rating (1-5), comment?, sessionId?, mentorId? } | Submit quick/session feedback |
| GET | /feedback/my | - | My feedback list (student) |

---

## Timeline (admin / teacher)

| Method | Path | Description |
|--------|------|-------------|
| GET | /timeline/department/:department | Department activity timeline |

---

## Notifications (all authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | /notifications | query: unreadOnly, limit | List notifications |
| PATCH | /notifications/read-all | - | Mark all read |
| PATCH | /notifications/:id/read | - | Mark one read |

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health (no auth) |
