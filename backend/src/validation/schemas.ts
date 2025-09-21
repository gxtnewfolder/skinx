import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Post schemas
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long").trim(),
  content: z.string().min(1, "Content is required").max(10000, "Content too long").trim(),
  tags: z.array(z.string().trim()).max(10, "Maximum 10 tags").default([]),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  content: z.string().min(1).max(10000).trim().optional(),
  tags: z.array(z.string().trim()).max(10).optional(),
});

// Query schemas
export const postsQuerySchema = z.object({
  tag: z.string().optional(),
  q: z.string().optional(),
  page: z.string().optional().default("1").transform(Number),
  pageSize: z.string().optional().default("10").transform(Number),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
