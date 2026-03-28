import { Request, Response } from "express";
import Groq from "groq-sdk";
import { prisma } from "../lib/prisma";
import { scrapeMentalHealthNews } from "../services/scraper.service";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CRISIS_KEYWORDS = [
  "kill myself", "want to die", "suicide", "end my life",
  "end it all", "self harm", "hurt myself", "no reason to live",
  "better off dead", "don't want to be here",
];

const CRISIS_RESPONSE = `I hear you, and what you're feeling truly matters. Please reach out to a crisis professional right now — you don't have to face this alone.

🆘 **Crisis Resources:**
- **India – AASRA:** +91-22-27546669 (24/7)
- **India – iCall:** +91-9152987821
- **US – 988 Suicide & Crisis Lifeline:** Call or text **988**
- **International:** https://findahelpline.com

You are not alone. A real human is ready to help you right now. 💙`;

const SYSTEM_PROMPT = `You are MoodSpa — a warm, empathetic AI peer-support companion focused on mental wellness.

IMPORTANT RULES:
- You are NOT a doctor, therapist, or medical professional.
- Do NOT diagnose conditions or prescribe treatments.
- Always gently remind users to seek professional help for serious concerns.

Your approach:
- Listen actively and validate emotions without judgment
- Use a warm, gentle, conversational tone — never clinical or robotic
- Offer practical coping strategies: breathing exercises, grounding techniques, journaling, mindfulness
- Be concise but heartfelt — responses should feel like a caring friend, not a textbook
- If the user seems distressed, ask a gentle follow-up question

Format: Plain text with light markdown (bold for emphasis, bullet points for lists). Keep responses under 200 words unless detailed guidance is needed.`;

function needsNews(msg: string): boolean {
  const kw = ["news", "latest", "research", "studies", "articles", "recent findings"];
  return kw.some((k) => msg.toLowerCase().includes(k));
}

function isCrisis(msg: string): boolean {
  return CRISIS_KEYWORDS.some((k) => msg.toLowerCase().includes(k));
}

export async function handleChat(req: Request, res: Response): Promise<void> {
  try {
    const { message, sessionId, lang } = req.body as {
      message: string;
      sessionId: string;
      lang?: string;
    };

    if (!message?.trim() || !sessionId?.trim()) {
      res.status(400).json({ error: "message and sessionId are required" });
      return;
    }

    if (isCrisis(message)) {
      await saveMessages(sessionId, message, CRISIS_RESPONSE);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.write(CRISIS_RESPONSE);
      res.end();
      return;
    }

    const langInstruction =
      lang && lang !== "en-IN"
        ? `\n\nIMPORTANT: The user is communicating in language "${lang}". Respond in the SAME language as the user's message.`
        : "";

    let userMessage = message;
    if (needsNews(message)) {
      const articles = await scrapeMentalHealthNews();
      const raw = articles
        .map((a, i) => `${i + 1}. ${a.title}: ${a.snippet}`)
        .join("\n");
      userMessage = `User asked: "${message}"\n\nRecent mental health news:\n${raw}\n\nPlease summarize this warmly and helpfully.${langInstruction}`;
    } else {
      userMessage = message + langInstruction;
    }

    const convo = await prisma.conversation.findUnique({
      where: { sessionId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 10 } },
    });

    const history = (convo?.messages || []).map((m) => ({
      role: m.role === "user" ? "user" : ("assistant" as "user" | "assistant"),
      content: m.content,
    }));

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userMessage },
      ],
      max_tokens: 512,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        fullResponse += text;
        res.write(text);
      }
    }

    res.end();
    saveMessages(sessionId, message, fullResponse).catch(console.error);
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  }
}

async function saveMessages(sessionId: string, userMsg: string, assistantMsg: string) {
  const convo = await prisma.conversation.upsert({
    where: { sessionId },
    create: { sessionId },
    update: {},
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo.id, role: "user", content: userMsg },
      { conversationId: convo.id, role: "assistant", content: assistantMsg },
    ],
  });
}

export async function getConversation(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.params;
    const convo = await prisma.conversation.findUnique({
      where: { sessionId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
    });
    res.json({
      messages: (convo?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to load conversation" });
  }
}

export async function clearConversation(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId } = req.params;
    await prisma.conversation.deleteMany({ where: { sessionId } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to clear conversation" });
  }
}