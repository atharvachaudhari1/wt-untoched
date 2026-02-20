# Deploy backend on Render

Your **frontend** is on Vercel. These steps deploy the **backend API** (in `backend/`) on Render so the dashboard can log in and load data.

---

## 1. MongoDB database (required)

The backend uses MongoDB. Use a free cluster on **MongoDB Atlas**:

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in (or create an account).
2. **Create** a free cluster (e.g. M0).
3. **Database Access** → Add user (username + password). Note the password.
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect.
5. **Database** → **Connect** → **Connect your application** → copy the connection string. It looks like:
   ```text
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE?retryWrites=true&w=majority
   ```
   Replace `PASSWORD` with your user password (special chars may need encoding). You’ll use this as `MONGODB_URI` on Render.

---

## 2. Create the backend on Render

1. Go to [render.com](https://render.com) and sign in (or sign up with GitHub).
2. **Dashboard** → **New +** → **Web Service**.
3. **Connect** your GitHub account if needed, then select the repo (e.g. `atharvachaudhari1/WT`).
4. Configure the service:
   - **Name:** e.g. `ecs-mentoring-api`
   - **Region:** choose one close to you.
   - **Root Directory:** `backend`  
     (so Render runs from the `backend` folder).
   - **Runtime:** Node.
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free (or paid if you prefer).

5. **Environment variables** (Add one by one):

   | Key            | Value |
   |----------------|--------|
   | `NODE_ENV`     | `production` |
   | `MONGODB_URI`  | Your Atlas connection string from step 1 |
   | `JWT_SECRET`   | A long random string (e.g. 32+ chars). Generate one and keep it secret. |
   | `JWT_EXPIRES_IN` | `7d` (optional; default is fine) |

   Do **not** set `PORT`; Render sets it automatically.

6. Click **Create Web Service**. Render will build and deploy. Wait until the service is **Live**.

7. Copy your service URL, e.g. `https://ecs-mentoring-api.onrender.com`.  
   The API base your frontend needs is: **`https://ecs-mentoring-api.onrender.com/api`** (with `/api` at the end).

---

## 3. Point Vercel frontend to the Render API

1. Open your **Vercel** project (the one serving [wt-virid-five.vercel.app](https://wt-virid-five.vercel.app)).
2. **Settings** → **Environment Variables**.
3. Add or update:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://YOUR-RENDER-SERVICE-NAME.onrender.com/api`  
     (use the exact URL from step 2.7, including `/api`).
4. **Deployments** → **⋯** on latest → **Redeploy** so the new `VITE_API_URL` is used in the build.

---

## 4. (Optional) CORS

If the frontend (Vercel) and backend (Render) are on different domains, the backend already uses `cors({ origin: true })`, so all origins are allowed. If you later restrict CORS, add your Vercel URL (e.g. `https://wt-virid-five.vercel.app`) to the allowed origins.

---

## Summary

| Where   | What |
|--------|------|
| MongoDB Atlas | Database (connection string → `MONGODB_URI`) |
| Render        | Backend API (`backend/` → Web Service, env vars) |
| Vercel        | Frontend (`VITE_API_URL` = `https://your-app.onrender.com/api`, then redeploy) |

After this, open your Vercel URL: login and dashboard should use the Render API and MongoDB.
