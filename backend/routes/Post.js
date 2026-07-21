import express from "express";
import {
  getPosts,
  getMyPosts,
  getPostsByUser,
  editPost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} from "../controllers/post.js";
import { createPost } from "../controllers/post.js"; // kept for reference but NOT registered below
import { uploadImage } from "../config/cloudinary.js";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";
import { verifyPost, handleStrike, isUserRestricted } from "../services/Verificationservice.js";

const router = express.Router();

// ─────────────────────────────
// APPLY AUTH MIDDLEWARE
// ─────────────────────────────
router.use(protect);

// ─────────────────────────────
// POSTS
// ─────────────────────────────

// Get all posts
router.get("/", getPosts);

// Get my posts (must come before /:id)
router.get("/my", getMyPosts);

// Get posts by specific user
router.get("/user/:userId", getPostsByUser);

// Create post — with verification pipeline
router.post("/", async (req, res) => {
  try {
    const user = req.user;

    // ── Check if user is restricted ──────────────────────────
    if (isUserRestricted(user)) {
      const until = new Date(user.restrictedUntil).toLocaleString();
      return res.status(403).json({
        message: `You are temporarily restricted from posting until ${until}.`,
      });
    }

    const { content, media = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    // ── Run verification pipeline ─────────────────────────────
    const verification = await verifyPost(content);

    if (!verification.approved) {
      const strikeCount = await handleStrike(user);
      return res.status(422).json({
        message: "Post rejected",
        reason: verification.rejectionReason,
        strikes: strikeCount,
      });
    }

    // ── Upload media to Cloudinary ────────────────────────────
    let uploadedMedia = [];
    if (media.length > 0) {
      uploadedMedia = await Promise.all(
        media.map(file =>
          uploadImage(file.data || file, "posts").then(r => ({
            url: r.url,
            type: file.type === "video" || r.resource_type === "video" ? "video" : "image",
          }))
        )
      );
    }

    // ── Save post with verification & AI flag ─────────────────
    const post = await Post.create({
      author: user._id,
      authorModel: user.role === "alumni" ? "Alumni" : user.role === "student" ? "Student" : "Admin",
      content: content.trim(),
      media: uploadedMedia,
      verification: {
        status: "approved",
        checkedAt: new Date(),
      },
      aiDetection: {
        flag: verification.aiFlag,
        score: verification.aiScore,
      },
    });

    await post.populate("author", "name avatar role college company alumniPlan isVerified");
    res.status(201).json({ message: "Post created", post });

  } catch (err) {
    console.error("Post creation error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Edit post
router.put("/:id", editPost);

// Delete post
router.delete("/:id", deletePost);

// Like / Unlike post
router.post("/:id/like", toggleLike);

// ─────────────────────────────
// COMMENTS
// ─────────────────────────────

// Add comment
router.post("/:id/comment", addComment);

// Delete comment
router.delete("/:id/comment/:commentId", deleteComment);

export default router;