# seedMentoringData.js

Bulk insert mentors (teachers) and students, and assign each student to the correct mentor.

## Run

From the **backend** folder:

```bash
node scripts/seedMentoringData.js
```

Or with npm:

```bash
npm run seed-mentoring
```

Ensure `MONGODB_URI` is set in `backend/.env` (or the script uses default `mongodb://localhost:27017/ecs_mentoring`).

---

## Mongoose schema fields used

### User (backend/models/User.js)

| Field        | Type   | Used in script                          |
|-------------|--------|-----------------------------------------|
| `email`     | String | required, unique; student: `rollno@crce.edu.in`, mentor: `slug@crce.edu.in` |
| `password`  | String | required, min 5 chars; hashed by pre-save (bcrypt) |
| `role`      | String | `'student'` or `'teacher'`              |
| `name`      | String | full name                               |
| `profileId` | ObjectId | set after creating StudentProfile/TeacherProfile |
| `profileModel` | String | `'StudentProfile'` or `'TeacherProfile'` |
| `isActive`  | Boolean | default true (not set in script)      |

### StudentProfile (backend/models/StudentProfile.js)

| Field     | Type     | Used in script                    |
|----------|----------|-----------------------------------|
| `user`   | ObjectId | ref User (required)               |
| `rollNo` | String   | roll number from data             |
| `department` | String | default `'ECS'`                  |
| `year`   | Number   | default `2`                        |
| `mentor` | ObjectId | ref TeacherProfile (assigned mentor) |

### TeacherProfile (backend/models/TeacherProfile.js)

| Field              | Type     | Used in script              |
|--------------------|----------|-----------------------------|
| `user`             | ObjectId | ref User (required)         |
| `department`       | String   | default `'ECS'`             |
| `designation`      | String   | `'Mentor'`                  |
| `assignedStudents` | [ObjectId] | ref StudentProfile; pushed when students are assigned |

---

## Logins after seed

- **Students:** email = `rollno@crce.edu.in`, password = roll number (e.g. `10514`).
- **Mentors:** email = slug from name, e.g. `dr-d-v-bhoir@crce.edu.in`, password = `mentor123`.

Each student can log in and see their assigned mentor on the dashboard (Mentors panel).
