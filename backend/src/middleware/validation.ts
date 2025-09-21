import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Simple validation middleware
export function validateRequest<T = any>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: result.error.issues 
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}