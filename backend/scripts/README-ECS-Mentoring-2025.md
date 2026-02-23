# SE ECS Mentoring Circular 2025 – Seed

This seeds **teachers (mentors)** and **students** and **assigns each mentor to the given list of students** as per the SE ECS Mentoring circular 2025.

## Steps

1. **Edit the data file**  
   Open `backend/scripts/ecsMentoring2025Data.js`.  
   Copy from the PDF:
   - Each **mentor name** (as in the circular)
   - Under each mentor, the **list of students** with **Roll no.** and **Name**

   Format for each mentor:
   ```js
   {
     mentorName: 'Dr. / Prof. Name as in circular',
     students: [
       { roll: '10514', name: 'STUDENT FULL NAME' },
       { roll: '10515', name: 'ANOTHER NAME' },
       // ...
     ],
   },
   ```

2. **Run the seed** (from project root or backend folder):
   ```bash
   cd backend
   npm run seed-ecs2025
   ```
   Or:
   ```bash
   node scripts/seedECSMentoring2025.js
   ```

3. **Result**
   - All mentors are created (or updated) as teachers.
   - All students are created (or updated) with roll number and name.
   - Each student is **assigned** to the mentor listed in the circular.
   - In the app: **Assign mentors** shows all teachers; each student sees **My mentor** as per the circular.

## Logins after seed

- **Students:** `rollno@ecs.edu` (e.g. `10514@ecs.edu`), password = roll number.
- **Mentors:** `<slug>@ecs.edu` (e.g. `dr-d-v-bhoir@ecs.edu`), password = `mentor123`.
- **Admin:** `admin@ecs.edu` / `admin123` (from default seed).

If the PDF has a different list of mentors or assignments, only the data in `ecsMentoring2025Data.js` needs to be updated; then run `npm run seed-ecs2025` again.
