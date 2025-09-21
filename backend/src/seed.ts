// src/seed.ts
import { PrismaClient } from "../generated/prisma";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type RawPost = {
  id?: string;
  title: string;
  content: string; // may be HTML
  tags?: string[]; // ["tag1","tag2"]
  postedAt?: string; // ISO or date-like
  postedBy?: string; // author string
};

async function main() {
  console.log("Starting seed process...");

  // 1) demo user
  console.log("Creating demo user...");
  const demoPassword = await bcrypt.hash("password123", 10);
  const demo = await prisma.user.upsert({
    where: { email: "demo@skinx.dev" },
    update: {},
    create: { email: "demo@skinx.dev", password: demoPassword },
  });
  console.log("Demo user created:", demo.email);

  // 2) load posts.json (adjust path if needed)
  console.log("Loading posts.json...");
  const file = path.resolve(__dirname, "../..", "posts.json");
  console.log("Posts file path:", file);
  const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as
    | RawPost[]
    | { posts: RawPost[] };

  const posts: RawPost[] = Array.isArray(raw) ? raw : raw.posts ?? [];
  if (!Array.isArray(posts) || posts.length === 0) {
    console.log("No posts found in posts.json");
    return;
  }

  // 3) import
  console.log(`Importing ${posts.length} posts...`);
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i]!;
    await prisma.post.create({
      data: {
        title: p.title,
        content: p.content,
        tags: p.tags ?? [],
        postedAt: p.postedAt ? new Date(p.postedAt) : new Date(),
        postedBy: p.postedBy ?? "Unknown",
        authorId: demo.id,
      },
    });
    if ((i + 1) % 10 === 0) {
      console.log(`Imported ${i + 1}/${posts.length} posts...`);
    }
  }
  console.log(
    `Imported ${posts.length} posts and demo user demo@skinx.dev / password123`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
