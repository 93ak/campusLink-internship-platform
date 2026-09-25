import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import bootstrapRoutes from "./routes/bootstrap.routes.js";
import studentsRoutes from "./routes/students.routes.js";
import professorsRoutes from "./routes/professors.routes.js";
import companiesRoutes from "./routes/companies.routes.js";
import listingsRoutes from "./routes/listings.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";
import interviewsRoutes from "./routes/interviews.routes.js";
import internshipsRoutes from "./routes/internships.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl, Postman) which send no Origin header.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/bootstrap", bootstrapRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/professors", professorsRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/interviews", interviewsRoutes);
app.use("/api/internships", internshipsRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
