/// <reference path="../types.d.ts" />
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/requireAuth";
import {
  createPostSchema,
  updatePostSchema,
  postsQuerySchema,
  idParamSchema,
} from "../validation/schemas";
import { validateRequest } from "../middleware/validation";

const prisma = new PrismaClient();
const router = Router();

// GET /posts
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { tag, q, page = 1, pageSize = 10 } = req.query;

    const where: any = {};
    if (tag) {
      where.tags = { has: tag };
    }
    if (q) {
      where.OR = [
        { title: { contains: q as string, mode: "insensitive" } },
        { content: { contains: q as string, mode: "insensitive" } },
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
  } catch (error) {
    next(error);
  }
});

// GET /posts/:id
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

export default router;
