import { Router } from "express";
import { body, param, query } from "express-validator";
import { handleChat, getConversation, clearConversation } from "../controllers/chat.controller";
import { saveMood, getMoods } from "../controllers/mood.controller";
import { validateRequest } from "../middleware/validate";

const router = Router();

// ─── Chat ─────────────────────────────────────────────────────
router.post(
  "/chat",
  [
    body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 2000 }),
    body("sessionId").trim().notEmpty().withMessage("sessionId is required"),
  ],
  validateRequest,
  handleChat
);

router.get(
  "/conversation/:sessionId",
  [param("sessionId").trim().notEmpty()],
  validateRequest,
  getConversation
);

router.delete(
  "/conversation/:sessionId",
  [param("sessionId").trim().notEmpty()],
  validateRequest,
  clearConversation
);

// ─── Mood ─────────────────────────────────────────────────────
router.post(
  "/mood",
  [
    body("sessionId").trim().notEmpty(),
    body("mood").trim().notEmpty(),
  ],
  validateRequest,
  saveMood
);

router.get(
  "/mood/:sessionId",
  [
    param("sessionId").trim().notEmpty(),
    query("days").optional().isNumeric(),
  ],
  validateRequest,
  getMoods
);

export default router;