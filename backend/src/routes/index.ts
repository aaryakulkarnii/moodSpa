import { Router } from "express";
import { body, param } from "express-validator";
import { handleChat, getConversation, clearConversation } from "../controllers/chat.controller";
import { validateRequest } from "../middleware/validate";

const router = Router();

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

export default router;
