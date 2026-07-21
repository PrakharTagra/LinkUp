import express from "express";
import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getMyConnections,
  getPendingRequests,
  getMyPendingConnections,
  getConnectionStatus,
} from "../controllers/connection.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────
// CONNECTION ACTIONS
// ─────────────────────────────

// Send request
router.post("/:id", protect, sendRequest);

// Accept request
router.patch("/:id/accept", protect, acceptRequest);

// Reject request
router.patch("/:id/reject", protect, rejectRequest);

// ─────────────────────────────
// FETCH DATA
// ─────────────────────────────

// All connections
router.get("/", protect, getMyConnections);

// Pending requests
router.get("/pending", protect, getPendingRequests);

// My pending (incoming + outgoing)
router.get("/pending-all", protect, getMyPendingConnections);

// Connection status (for button state)
router.get("/status/:id", protect, getConnectionStatus);

export default router;