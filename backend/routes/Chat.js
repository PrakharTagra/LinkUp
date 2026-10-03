import express from "express";
import { handleChatMessage } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", handleChatMessage);
router.get("/health", (req, res) => res.json({ status: "ok", service: "chat" }));

export default router;
