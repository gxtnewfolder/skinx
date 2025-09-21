"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types.d.ts" />
const express_1 = require("express");
const client_1 = require("@prisma/client");
const requireAuth_1 = require("../middleware/requireAuth");
const schemas_1 = require("../validation/schemas");
const validation_1 = require("../middleware/validation");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// GET /posts
router.get("/", requireAuth_1.requireAuth, async (req, res, next) => {
    try {
        const { tag, q, page = 1, pageSize = 10 } = req.query;
        const where = {};
        if (tag) {
            where.tags = { has: tag };
        }
        if (q) {
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
            ];
        }
        const [items, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy: { postedAt: "desc" },
                skip: (Number(page) - 1) * Number(pageSize),
                take: Number(pageSize),
            }),
            prisma.post.count({ where }),
        ]);
        res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
    }
    catch (error) {
        next(error);
    }
});
// GET /posts/:id
router.get("/:id", requireAuth_1.requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.json(post);
    }
    catch (error) {
        next(error);
    }
});
// POST /posts
router.post("/", requireAuth_1.requireAuth, (0, validation_1.validateRequest)(schemas_1.createPostSchema), async (req, res, next) => {
    try {
        const { title, content, tags } = req.body;
        const currentUser = req.user;
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                tags,
                postedAt: new Date(),
                postedBy: currentUser.email,
                authorId: currentUser.userId,
            },
        });
        res.status(201).json(newPost);
    }
    catch (error) {
        next(error);
    }
});
// PUT /posts/:id
router.put("/:id", requireAuth_1.requireAuth, (0, validation_1.validateRequest)(schemas_1.updatePostSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const currentUser = req.user;
        const existingPost = await prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (existingPost.authorId !== currentUser.userId) {
            return res.status(403).json({ error: "You can only update your own posts" });
        }
        const updatedPost = await prisma.post.update({
            where: { id },
            data: updateData,
        });
        res.json(updatedPost);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /posts/:id
router.delete("/:id", requireAuth_1.requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const existingPost = await prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (existingPost.authorId !== currentUser.userId) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }
        await prisma.post.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map