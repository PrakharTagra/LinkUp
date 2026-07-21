import Post from "../models/Post.js";
import { uploadImage } from "../config/cloudinary.js";

// ─────────────────────────────────────────────
// GET POSTS
// ─────────────────────────────────────────────
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Post.countDocuments();

    const posts = await Post.find()
      .populate("author", "name avatar role college company alumniPlan isVerified")
      .populate("comments.author", "name avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MY POSTS
// ─────────────────────────────────────────────
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate("author", "name avatar role college company alumniPlan isVerified")
      .populate("comments.author", "name avatar role")
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET POSTS BY USER ID
// ─────────────────────────────────────────────
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "name avatar role college company alumniPlan isVerified")
      .populate("comments.author", "name avatar role")
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// CREATE POST
// ─────────────────────────────────────────────
export const createPost = async (req, res) => {
  try {
    const { content, media = [], tags = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    // ✅ Upload images in parallel (optimized)
    let uploadedMedia = [];
    if (media.length > 0) {
      uploadedMedia = await Promise.all(
        media.map(file =>
          uploadImage(file, "posts").then(res => ({
            url: res.url,
            type: res.resource_type === 'video' ? 'video' : 'image'
          }))
        )
      );
    }

    const post = await Post.create({
      author: req.user._id,
      authorModel: req.user.role === "student" ? "Student" : req.user.role === "alumni" ? "Alumni" : "Admin",
      content: content.trim(),
      media: uploadedMedia,
      tags,
    });

    await post.populate(
      "author",
      "name avatar role college company alumniPlan isVerified"
    );

    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// TOGGLE LIKE
// ─────────────────────────────────────────────
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const userModel = req.user.role === "student" ? "Student" : req.user.role === "alumni" ? "Alumni" : "Admin";

    const alreadyLiked = post.likes.some((like) => {
      // Backward compatibility if old docs store plain ObjectId
      if (like?.toString && !like.user) {
        return like.toString() === userId.toString();
      }
      return like?.user?.toString() === userId.toString();
    });

    if (alreadyLiked) {
      post.likes = post.likes.filter((like) => {
        if (like?.toString && !like.user) {
          return like.toString() !== userId.toString();
        }
        return like?.user?.toString() !== userId.toString();
      });
    } else {
      post.likes.push({ user: userId, userModel });
    }

    await post.save();

    res.json({
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// ADD COMMENT
// ─────────────────────────────────────────────
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      author: req.user._id,
      authorModel: req.user.role === "student" ? "Student" : req.user.role === "alumni" ? "Alumni" : "Admin",
      content: content.trim(),
    };

    post.comments.push(comment);
    await post.save();

    await post.populate("comments.author", "name avatar role");

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE COMMENT
// ─────────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; // ✅ FIXED

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// EDIT POST
// ─────────────────────────────────────────────
export const editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const { content, media, tags } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    post.content = content.trim();
    post.media = media ?? post.media;
    post.tags = tags ?? post.tags;
    post.isEdited = true;

    await post.save();
    await post.populate(
      "author",
      "name avatar role college company alumniPlan isVerified"
    );

    res.json({ message: "Post updated", post });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE POST
// ─────────────────────────────────────────────
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};