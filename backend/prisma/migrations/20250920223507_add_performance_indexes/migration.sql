-- CreateIndex
CREATE INDEX "Post_postedAt_idx" ON "public"."Post"("postedAt" DESC);

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "public"."Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_tags_idx" ON "public"."Post"("tags");

-- CreateIndex
CREATE INDEX "Post_title_idx" ON "public"."Post"("title");

-- CreateIndex
CREATE INDEX "Post_postedBy_idx" ON "public"."Post"("postedBy");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "public"."Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_updatedAt_idx" ON "public"."Post"("updatedAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");
