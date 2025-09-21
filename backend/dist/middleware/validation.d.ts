import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
export declare function validateRequest<T = any>(schema: ZodSchema<T>): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validation.d.ts.map