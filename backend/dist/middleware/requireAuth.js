"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid authorization header" });
        }
        const token = authHeader.slice("Bearer ".length);
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "Server configuration error" });
        }
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: payload.userId,
            email: payload.email,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: "Token expired" });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ error: "Invalid token" });
        }
        next(error);
    }
}
//# sourceMappingURL=requireAuth.js.map