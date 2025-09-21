"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.postsQuerySchema = exports.updatePostSchema = exports.createPostSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email").trim(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email").trim(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
// Post schemas
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(200, "Title too long").trim(),
    content: zod_1.z.string().min(1, "Content is required").max(10000, "Content too long").trim(),
    tags: zod_1.z.array(zod_1.z.string().trim()).max(10, "Maximum 10 tags").default([]),
});
exports.updatePostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).trim().optional(),
    content: zod_1.z.string().min(1).max(10000).trim().optional(),
    tags: zod_1.z.array(zod_1.z.string().trim()).max(10).optional(),
});
// Query schemas
exports.postsQuerySchema = zod_1.z.object({
    tag: zod_1.z.string().optional(),
    q: zod_1.z.string().optional(),
    page: zod_1.z.string().optional().default("1").transform(Number),
    pageSize: zod_1.z.string().optional().default("10").transform(Number),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
});
//# sourceMappingURL=schemas.js.map