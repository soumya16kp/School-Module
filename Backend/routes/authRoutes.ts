import express from "express";
import { AuthService } from "../services/authService";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Step 1: verify email+password, send OTP to email
router.post("/send-otp", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });
    const result = await AuthService.sendLoginOtp(email, password);
    res.json(result);
  } catch (error: any) {
    const msg = error?.message ?? "Unknown error";
    // Only 401 for invalid credentials; email/config failures → 503
    if (msg === "Invalid email or password.") {
      return res.status(401).json({ message: msg });
    }
    console.error("[send-otp] email/config error:", msg);
    res.status(503).json({
      message: "Could not send OTP. Please try again later or contact support.",
    });
  }
});

// Step 2: verify OTP, return JWT
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Email and OTP code are required." });
    const result = await AuthService.verifyLoginOtp(email, code);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

export default router;
