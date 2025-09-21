"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const library_1 = require("@prisma/client/runtime/library");
// Simple error handler
function errorHandler(err, req, res, _next) {
    console.error("Error:", err.message);
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "Validation failed",
            details: err.issues
        });
    }
    // Handle Prisma errors
    if (err instanceof library_1.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: "Conflict",
                message: "A record with this data already exists"
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                error: "Not found",
                message: "Record not found"
            });
        }
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: "Invalid token"
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: "Token expired"
        });
    }
    // Default error
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
    });
}
//# sourceMappingURL=errorHandler.js.map