import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import schoolRoutes from "./routes/schoolRoutes";
import childRoutes from "./routes/childRoutes";
import healthRoutes from "./routes/healthRoutes";
import eventRoutes from "./routes/eventRoutes";
import ambassadorRoutes from "./routes/ambassadorRoutes";
import certificationRoutes from "./routes/certificationRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import parentRoutes from "./routes/parentRoutes";
import accessRoutes from "./routes/accessRoutes";
import partnerRoutes from "./routes/partnerRoutes";
import cardRoutes from "./routes/cardRoutes";
import staffRoutes from "./routes/staffRoutes";
import eventRequestRoutes from "./routes/eventRequestRoutes";

// Config is already loaded at the top

const app = express();
const PORT = process.env["PORT"] || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Logger
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.url} - ${res.statusCode}`);
  });
  next();
});

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/children", childRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ambassadors", ambassadorRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/card", cardRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/event-requests", eventRequestRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
