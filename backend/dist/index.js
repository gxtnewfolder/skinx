"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Basic middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
// Simple request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            ok: true,
            timestamp: new Date().toISOString(),
            database: "connected"
        });
    }
    catch (error) {
        res.status(503).json({
            ok: false,
            timestamp: new Date().toISOString(),
            database: "disconnected",
            error: "Database connection failed"
        });
    }
});
// API routes
app.use("/auth", auth_1.default);
app.use("/posts", posts_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// Basic error handler
app.use((error, req, res, next) => {
    console.error("Error:", error);
    if (error.name === "ZodError") {
        return res.status(400).json({
            error: "Validation failed",
            details: error.errors
        });
    }
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
});
// Start server
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
//# sourceMappingURL=index.js.map