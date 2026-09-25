# CampusLink API (Express + MongoDB)

Backend for the CampusLink internship platform. See the **top-level
`README.md`** (one directory up) for the full walkthrough: setting up
MongoDB Atlas, running locally, and deploying to Render.

## Quick reference

```bash
cp .env.example .env   # then fill in MONGODB_URI
npm install
npm run seed            # wipes & repopulates the database with demo data
npm run dev              # http://localhost:5000, auto-restarts on changes
npm start                 # production start (no auto-restart)
```

## Structure

```
src/
  server.js          entry point — connects to Mongo, then starts Express
  app.js             Express app: middleware + route mounting
  config/db.js        Mongoose connection
  models/              one file per collection (+ plugins/toJSON.js which
                        renames Mongo's _id to id for the frontend)
  routes/               one file per resource, REST-ish routes
  middleware/           asyncHandler + centralized error handler
  seed/
    seedData.js         the actual demo dataset
    seed.js             wipes collections and inserts seedData.js
  utils/genId.js         short prefixed ids for anything created at runtime
```

## Notes

- **No JWT / password auth yet.** `POST /api/auth/login` just returns the
  first seeded account for the role you pick. See the top-level README's
  "Next steps toward production" section for how to add real auth without
  touching the frontend's structure.
- IDs are plain, readable strings (`stu-1`, `lst-4`, `app-3f9a1c2b`, ...)
  stored as Mongo's `_id`, not ObjectIds — this keeps the data readable in
  Atlas's Data Explorer and matches the ids the frontend already expects.
- `GET /api/bootstrap` returns every collection in one response; the
  frontend loads this once on startup and then keeps state in sync locally
  as each mutation's response comes back. This is fine for a demo-sized
  dataset — if you outgrow it, switch pages over to the per-resource GET
  routes (already implemented) with query-param filtering.
