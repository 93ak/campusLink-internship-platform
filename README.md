# CampusLink — College Internship Management Platform

A full-stack internship management system for colleges with three roles —
**Student**, **Professor**, and **Company HR** — now backed by a real
Express + MongoDB API. No JWT auth yet: you log in as one of the seeded
demo accounts (no password check), which keeps the whole workflow testable
without building a full auth system first.

```
internship-platform/
  src/                  React frontend (Vite)
  server/               Express + MongoDB API
```

- Frontend: React, React Router, plain CSS — see inline comments for structure.
- Backend: Express, Mongoose, MongoDB Atlas.
- Every button/workflow from the original spec is wired to a real database
  write via the API (apply, shortlist, schedule interview, approve listing,
  verify internship, select candidate, etc).

---

## 1. Run it locally

### 1a. Set up MongoDB Atlas (free tier)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account (or sign in).
2. Click **Create a deployment** → choose **M0 Free**. Pick any cloud provider/region close to you. Give the cluster a name (e.g. `campuslink-cluster`) and click **Create Deployment**.
3. When prompted to **create a database user**, set a username and password (e.g. `campuslink_app` / a generated password). **Save these** — you'll need them in the connection string. Click **Create User**.
4. Under **Network Access** (left sidebar, or the setup wizard's "Where would you like to connect from" step), click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`). This is required so Render's servers can reach your cluster (Atlas free tier has no static-IP allow-listing for Render). This is fine for a prototype; for production you'd restrict this further.
5. Go to your cluster → **Connect** → **Drivers**. Choose **Node.js**. Copy the connection string, which looks like:
   ```
   mongodb+srv://<username>:<password>@campuslink-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the database user you created, and add a database name before the `?`, e.g.:
   ```
   mongodb+srv://campuslink_app:YOUR_PASSWORD@campuslink-cluster.xxxxx.mongodb.net/campuslink?retryWrites=true&w=majority
   ```
   This is your `MONGODB_URI`.

### 1b. Run the backend

```bash
cd server
cp .env.example .env
# edit .env and paste your MONGODB_URI

npm install
npm run seed     # wipes & populates the database with demo data
npm run dev      # starts the API on http://localhost:5000
```

Visit `http://localhost:5000/api/health` — you should see `{"status":"ok"}`.

### 1c. Run the frontend

In a second terminal:

```bash
cd internship-platform   # the project root, not /server
npm install
npm run dev               # starts on http://localhost:5173
```

`.env.development` already points `VITE_API_URL` at `http://localhost:5000/api`,
so no changes are needed for local dev. Open the printed URL and log in with
the demo role selector.

---

## 2. Demo accounts (no password required)

The login screen's role selector logs you in as the **first seeded** record
of that role:

| Role | Account |
|---|---|
| Student | Priya Sharma (`priya.sharma@college.edu`) |
| Professor | Dr. Anitha Raman (`anitha.raman@college.edu`) |
| Company HR | Meera Krishnan @ NimbusTech Solutions |

To add real users later, add documents to the `Student` / `Professor` /
`Company` collections (via the seed data, Atlas's Data Explorer, or your own
admin UI) — the login endpoint just needs a password check added in
`server/src/routes/auth.routes.js` when you're ready for real auth.

---

## 3. Deploy the backend to Render (free tier)

1. Push this project to a GitHub repository (Render deploys from Git).
2. Go to https://dashboard.render.com → **New** → **Web Service**.
3. Connect your GitHub repo and select it.
4. Configure the service:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `MONGODB_URI` = your Atlas connection string from step 1a
   - `CLIENT_ORIGIN` = the URL your frontend will be hosted at (e.g. `https://campuslink.onrender.com` or `http://localhost:5173` while testing — comma-separate multiple origins)
   - `PORT` — you can leave this unset; Render injects its own `PORT` automatically and the server already reads `process.env.PORT`.
6. Click **Create Web Service**. Render will build and deploy; watch the logs until you see `CampusLink API running on port ...`.
7. Once live, note your backend URL, e.g. `https://campuslink-api.onrender.com`.
8. Seed the deployed database once, from your machine (it reuses the same Atlas cluster):
   ```bash
   cd server
   MONGODB_URI="<your atlas uri>" npm run seed
   ```
   (Or temporarily set `MONGODB_URI` in `.env` to the Atlas string and run `npm run seed`.)

**Free tier note:** Render's free web services spin down after ~15 minutes of
inactivity and take up to ~50 seconds to wake up on the next request. The
frontend's loading screen will just sit on "Connecting to CampusLink..." during
that cold start — this is expected, not a bug.

---

## 4. Deploy the frontend

You can host the frontend anywhere that serves a static Vite build (Render
Static Site, Netlify, Vercel). Using **Render Static Site** to keep everything
in one place:

1. Go to https://dashboard.render.com → **New** → **Static Site**.
2. Connect the same repo.
3. Configure:
   - **Root Directory:** leave blank (project root)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://campuslink-api.onrender.com/api` (your actual Render backend URL from step 3, with `/api` on the end)

   Vite reads this at build time, so it gets baked into the static files —
   no `.env.production` file needs to exist in your repo.
5. Deploy. Once live, copy the site's URL and go back to your **backend**
   service's environment variables → update `CLIENT_ORIGIN` to that URL (so
   CORS allows it) → save (Render will redeploy the backend automatically).

---

## 5. API overview

All routes are under `/api`. See `server/src/routes/*.routes.js` for full
details — every route maps directly to one action in the frontend's
`DataContext.jsx` (e.g. "Approve Listing" → `PATCH /api/listings/:id/approve`).

| Resource | Key routes |
|---|---|
| Auth | `POST /api/auth/login` (body: `{ role }`, no password) |
| Bootstrap | `GET /api/bootstrap` — all collections in one call, used on app load |
| Students | `GET/PATCH /api/students/:id`, resume + saved-listings sub-routes |
| Companies | `GET/PATCH /api/companies/:id` |
| Listings | full CRUD + `/approve`, `/reject`, `/request-changes`, `/submit`, `/close` |
| Applications | apply, `/withdraw`, `/shortlist`, `/reject`, `/select` |
| Interviews | schedule (`POST /`), reschedule (`PATCH /:id`), `/cancel` |
| Internships | document upload/delete, `/verify`, `/reject-verification` |
| Notifications | `/read`, `/read-all` |

## 6. Re-seeding

Run `npm run seed` (inside `server/`) any time to wipe and repopulate the
database with fresh demo data — dates (deadlines, interview times) are
recalculated relative to "today" each time you seed.

## 7. Next steps toward production

- Add real authentication (password hashing + JWT or sessions) in
  `server/src/routes/auth.routes.js` — the rest of the app doesn't need to
  change since it already just trusts whatever `user` object `AuthContext`
  holds.
- Add role-based authorization middleware on the backend (currently any
  client can call any route — fine for a prototype, not for production).
- Add real file storage (S3, Cloudinary, etc.) for resumes/documents instead
  of just storing a filename string.
- Add pagination to `GET /api/bootstrap` once the dataset grows beyond a
  few hundred records per collection.
