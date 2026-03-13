import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import schoolRoutes from "./routes/schoolRoutes";
import childRoutes from "./routes/childRoutes";
import healthRoutes from "./routes/healthRoutes";
import eventRoutes from "./routes/eventRoutes";
import ambassadorRoutes from "./routes/ambassadorRoutes";
import certificationRoutes from "./routes/certificationRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

dotenv.config();

const app = express();
const PORT = process.env["PORT"] || 5000;

app.use(cors());
app.use(express.json());
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

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
