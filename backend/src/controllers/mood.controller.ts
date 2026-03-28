import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const MOOD_SCORES: Record<string, number> = {
  hopeful: 9,
  calm: 8,
  okay: 6,
  tired: 4,
  anxious: 3,
  sad: 2,
  frustrated: 2,
  numb: 2,
  exhausted: 2,
};

export function getMoodScore(mood: string): number {
  const lower = mood.toLowerCase();
  for (const [key, val] of Object.entries(MOOD_SCORES)) {
    if (lower.includes(key)) return val;
  }
  return 5;
}

// POST /api/mood
export async function saveMood(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId, mood, note } = req.body as {
      sessionId: string;
      mood: string;
      note?: string;
    };

    if (!sessionId || !mood) {
      res.status(400).json({ error: "sessionId and mood are required" });
      return;
    }

    const score = getMoodScore(mood);

    const entry = await prisma.moodEntry.create({
      data: { sessionId, mood, score, note },
    });

    res.json({ success: true, entry });
  } catch (err) {
    console.error("Save mood error:", err);
    res.status(500).json({ error: "Failed to save mood" });
  }
}

// GET /api/mood/:sessionId
export async function getMoods(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.params;
    const { days = "7" } = req.query as { days?: string };

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const entries = await prisma.moodEntry.findMany({
      where: {
        sessionId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ entries });
  } catch (err) {
    console.error("Get moods error:", err);
    res.status(500).json({ error: "Failed to get moods" });
  }
}