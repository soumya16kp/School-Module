import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "default_secret";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    schoolId?: number;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    if (!token) {
       res.status(401).json({ message: "Authentication token missing" });
       return;
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
         res.status(403).json({ message: "Invalid or expired token" });
         return;
      }
      req.user = user as any;
      next();
    });
  } else {
    res.status(401).json({ message: "Authorization header missing" });
  }
};
