import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import routes from "./routes/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many requests. Take a breath and try again in a moment. 🌿" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const ok = allowedOrigins.some((p) =>
        typeof p === "string" ? p === origin : p.test(origin)
      );
      cb(ok ? null : new Error("Not allowed by CORS"), ok);
    },
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use("/api", limiter);

// ─── Routes ──────────────────────────────────────────────────
app.use("/api", routes);

app.get("/health", (_, res) =>
  res.json({ status: "MoodSpa backend is running 🌿" })
);

// ─── Graceful shutdown ────────────────────────────────────────
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// ─── Start ───────────────────────────────────────────────────
async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Neon PostgreSQL connected");
  } catch (err) {
    console.warn("⚠️  DB unavailable — chat works but history is disabled:", err);
  }
  app.listen(PORT, () => console.log(`🌿 MoodSpa backend on port ${PORT}`));
}

start();
