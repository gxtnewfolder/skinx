"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types.d.ts" />
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const requireAuth_1 = require("../middleware/requireAuth");
const schemas_1 = require("../validation/schemas");
const validation_1 = require("../middleware/validation");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// POST /auth/login
router.post("/login", (0, validation_1.validateRequest)(schemas_1.loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "Server configuration error" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /auth/register
router.post("/register", (0, validation_1.validateRequest)(schemas_1.registerSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "Server configuration error" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /auth/me
router.get("/me", requireAuth_1.requireAuth, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map