import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth";
import postsRouter from "./routes/posts";

const app = express();
const prisma = new PrismaClient();

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));

// Simple request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({ 
      ok: false, 
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: "Database connection failed"
    });
  }
});

// API routes
app.use("/auth", authRouter);
app.use("/posts", postsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Basic error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
