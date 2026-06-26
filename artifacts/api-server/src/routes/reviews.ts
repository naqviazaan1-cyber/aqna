import { Router } from "express";
import { createHash } from "crypto";
import { z } from "zod";
import { db, reviewsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

const submitSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(5).max(500),
});

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await db
      .select({
        id: reviewsTable.id,
        name: reviewsTable.name,
        rating: reviewsTable.rating,
        content: reviewsTable.content,
        createdAt: reviewsTable.createdAt,
      })
      .from(reviewsTable)
      .orderBy(desc(reviewsTable.createdAt));

    res.json({ reviews });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/reviews", async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
    return;
  }

  const { name, email, rating, content } = parsed.data;
  const emailHash = createHash("sha256").update(email.toLowerCase().trim()).digest("hex");

  try {
    const existing = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(eq(reviewsTable.emailHash, emailHash))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "You have already submitted a review." });
      return;
    }

    const [review] = await db
      .insert(reviewsTable)
      .values({ name, emailHash, rating, content })
      .returning({
        id: reviewsTable.id,
        name: reviewsTable.name,
        rating: reviewsTable.rating,
        content: reviewsTable.content,
        createdAt: reviewsTable.createdAt,
      });

    res.status(201).json({ review });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

export default router;
