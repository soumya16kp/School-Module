import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "default_secret";

export interface ParentRequest extends Request {
  headers: any;
  body: any;
  params: any;
  parent?: {
    phone: string;
    childIds: number[];
    role: 'PARENT';
  };
}

export const authenticateParentJWT = (req: ParentRequest, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env["JWT_SECRET"] || "default_secret";
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    if (!token) {
       res.status(401).json({ message: "Authentication token missing" });
       return;
    }

    jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err || decoded.role !== 'PARENT') {
         res.status(403).json({ message: "Invalid or unauthorized token" });
         return;
      }
      req.parent = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: "Authorization header missing" });
  }
};
