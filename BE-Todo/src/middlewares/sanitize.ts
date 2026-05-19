import { Request, Response, NextFunction } from "express";

function hasNoSQLInjection(obj: any): boolean {
  if (typeof obj === "string") {
    return obj.includes("$");
  }
  if (Array.isArray(obj)) {
    return obj.some(hasNoSQLInjection);
  }
  if (obj && typeof obj === "object") {
    return Object.keys(obj).some(
      (key) => key.startsWith("$") || hasNoSQLInjection(obj[key])
    );
  }
  return false;
}

export function mongoSanitize(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.body && hasNoSQLInjection(req.body)) {
    res.status(400).json({ error: "Invalid input: NoSQL injection detected" });
    return;
  }
  next();
}
